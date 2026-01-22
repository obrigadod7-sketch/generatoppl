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

type Values = { email: string };

export default function AdminSetup() {
  const [submitting, setSubmitting] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);
  const navigate = useNavigate();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email("E-mail inválido"),
      }),
    [],
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ElementorHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[560px] px-6 py-12">
          <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Configurar Admin</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Cria o <strong>primeiro</strong> usuário administrador do Dashboard Kids. Depois que existir um admin,
            esta página bloqueia automaticamente por segurança.
          </p>

          <Card className="mt-8 p-6 shadow-elev ring-1 ring-border">
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                setSubmitting(true);
                setRecoveryLink(null);

                try {
                  const { data, error } = await supabase.functions.invoke("bootstrap-admin", {
                    body: { email: values.email },
                  });
                  if (error) throw error;
                  if (!data?.success) throw new Error(data?.error || "Falha ao criar admin");

                  setRecoveryLink(data.recoveryLink || null);
                  toast({ title: "Admin criado!" });
                } catch (e: any) {
                  toast({
                    title: "Não foi possível configurar",
                    description: e?.message ?? "Tente novamente.",
                    variant: "destructive",
                  });
                } finally {
                  setSubmitting(false);
                }
              })}
            >
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail administrativo</Label>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Criando..." : "Criar admin"}
              </Button>

              {recoveryLink ? (
                <div className="grid gap-2 rounded-md border border-border bg-card p-4">
                  <p className="text-sm">
                    1) Abra o link abaixo para definir sua senha. 2) Em seguida, faça login e acesse o dashboard.
                  </p>
                  <a
                    className="break-all text-sm font-semibold underline underline-offset-4"
                    href={recoveryLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {recoveryLink}
                  </a>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="secondary">
                      <a href={recoveryLink} target="_blank" rel="noreferrer">
                        Abrir link
                      </a>
                    </Button>
                    <Button type="button" onClick={() => navigate("/login")}>
                      Ir para login
                    </Button>
                  </div>
                </div>
              ) : null}
            </form>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
