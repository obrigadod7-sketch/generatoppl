import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

type KidsSignupValues = {
  parent_name: string;
  child_name: string;
  child_age?: string;
  phone?: string;
  email?: string;
  message?: string;
};

export function KidsSignupForm() {
  const { t: tRaw } = useI18n();
  // NOTE: keep permissive typing locally to avoid blocking new translation keys.
  const tx: (key: string) => string = (key) => (tRaw as any)(key);
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        parent_name: z
          .string()
          .trim()
          .min(2, tx("kids_form_parent_name_error"))
          .max(120, tx("kids_form_parent_name_too_long")),
        child_name: z
          .string()
          .trim()
          .min(2, tx("kids_form_child_name_error"))
          .max(120, tx("kids_form_child_name_too_long")),
        child_age: z
          .string()
          .trim()
          .optional()
          .or(z.literal(""))
          .refine(
            (v) => {
              if (!v) return true;
              const n = Number(v);
              return Number.isInteger(n) && n >= 0 && n <= 17;
            },
            { message: tx("kids_form_child_age_invalid") },
          ),
        phone: z.string().trim().max(40, tx("kids_form_phone_too_long")).optional().or(z.literal("")),
        email: z
          .string()
          .trim()
          .email(tx("kids_form_email_invalid"))
          .max(255, tx("kids_form_email_too_long"))
          .optional()
          .or(z.literal("")),
        message: z.string().trim().max(1000, tx("kids_form_message_too_long")).optional().or(z.literal("")),
      }),
    [t],
  );

  const form = useForm<KidsSignupValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parent_name: "",
      child_name: "",
      child_age: "",
      phone: "",
      email: "",
      message: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: KidsSignupValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;

    const childAgeRaw = parsed.data.child_age?.trim();
    const childAge = childAgeRaw ? Number(childAgeRaw) : null;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("kids_ministry_signups").insert({
        source_slug: "ministerio-infantil",
        parent_name: parsed.data.parent_name,
        child_name: parsed.data.child_name,
        child_age: childAge,
        phone: parsed.data.phone?.trim() || null,
        email: parsed.data.email?.trim() || null,
        message: parsed.data.message?.trim() || null,
      });
      if (error) throw error;

      toast({ title: tx("kids_signup_sent"), description: tx("kids_signup_sent_desc") });
      form.reset();
    } catch (e) {
      const msg = e instanceof Error ? e.message : tx("kids_signup_error");
      toast({ title: tx("error"), description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="parent_name">{tx("kids_form_parent_name")}</Label>
        <Input id="parent_name" autoComplete="name" {...register("parent_name")} />
        {errors.parent_name?.message ? <p className="text-sm text-destructive">{errors.parent_name.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="child_name">{tx("kids_form_child_name")}</Label>
        <Input id="child_name" {...register("child_name")} />
        {errors.child_name?.message ? <p className="text-sm text-destructive">{errors.child_name.message}</p> : null}
      </div>

      <div className="grid gap-2 sm:max-w-[220px]">
        <Label htmlFor="child_age">{tx("kids_form_child_age")}</Label>
        <Input id="child_age" inputMode="numeric" placeholder="0-17" {...register("child_age")} />
        {errors.child_age?.message ? <p className="text-sm text-destructive">{errors.child_age.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">{tx("kids_form_phone")}</Label>
          <Input id="phone" autoComplete="tel" {...register("phone")} />
          {errors.phone?.message ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">{tx("kids_form_email")}</Label>
          <Input id="email" autoComplete="email" {...register("email")} />
          {errors.email?.message ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">{tx("kids_form_message")}</Label>
        <Textarea id="message" rows={4} placeholder={tx("kids_form_message_placeholder")} {...register("message")} />
        {errors.message?.message ? <p className="text-sm text-destructive">{errors.message.message}</p> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{tx("kids_form_privacy")}</p>
        <Button type="submit" disabled={submitting}>
          {submitting ? tx("kids_form_sending") : tx("kids_form_submit")}
        </Button>
      </div>
    </form>
  );
}
