import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

type LoginValues = {
  email: string;
  password: string;
};

export default function Login() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email("Email inválido"),
        password: z.string().min(6, "Senha muito curta"),
      }),
    [],
  );

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const from = (location.state as any)?.from ?? "/kids/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ElementorHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[520px] px-6 py-12">
          <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Acesso ao Dashboard</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre com seu e-mail e senha para acessar check-in, crianças, eventos e relatórios.
          </p>

          <Card className="mt-8 p-6 shadow-elev ring-1 ring-border">
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                setSubmitting(true);
                try {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                  });
                  if (error) throw error;
                  toast({ title: "Bem-vindo!" });
                  navigate(from, { replace: true });
                } catch (e: any) {
                  toast({ title: "Falha no login", description: e?.message ?? "Tente novamente.", variant: "destructive" });
                } finally {
                  setSubmitting(false);
                }
              })}
            >
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Precisa de acesso? Um administrador deve criar seu usuário e atribuir o perfil (Admin/Líder/Voluntário).
              </p>
            </form>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
