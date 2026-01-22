import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/integrations/supabase/client";
import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type Values = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(6, "Senha muito curta"),
          confirmPassword: z.string().min(6, "Senha muito curta"),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: "As senhas não conferem",
          path: ["confirmPassword"],
        }),
    [],
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ElementorHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[520px] px-6 py-12">
          <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Definir senha</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Abra esta página através do link enviado em “Configurar Admin”. Aqui você define sua nova senha.
          </p>

          <Card className="mt-8 p-6 shadow-elev ring-1 ring-border">
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                setSubmitting(true);
                try {
                  const { data: sessionData } = await supabase.auth.getSession();
                  if (!sessionData?.session) {
                    throw new Error(
                      "Sessão não encontrada. Volte e abra o link de recuperação novamente (no mesmo navegador).",
                    );
                  }

                  const { error } = await supabase.auth.updateUser({ password: values.password });
                  if (error) throw error;

                  toast({ title: "Senha definida!" });
                  navigate("/kids/dashboard", { replace: true });
                } catch (e: any) {
                  toast({
                    title: "Não foi possível definir a senha",
                    description: e?.message ?? "Tente novamente.",
                    variant: "destructive",
                  });
                } finally {
                  setSubmitting(false);
                }
              })}
            >
              <div className="grid gap-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword ? (
                  <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar senha"}
              </Button>

              <Button type="button" variant="secondary" onClick={() => navigate("/login")}>
                Voltar ao login
              </Button>
            </form>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
