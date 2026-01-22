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
  const [showRecoveryEmail, setShowRecoveryEmail] = useState(false);
  const navigate = useNavigate();

  const getBackendErrorCode = (err: unknown) => {
    // 1) Prefer structured body if available
    const raw = (err as any)?.context?.body;
    if (raw) {
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const code = String(parsed?.error || "");
        if (code) return code;
      } catch {
        // fallthrough
      }
    }

    // 2) Fallback: parse from error message (common for FunctionsHttpError)
    const msg = String((err as any)?.message || "");
    if (msg.includes("admin_already_configured")) return "admin_already_configured";

    // Try to extract JSON object from the message
    const match = msg.match(/\{[\s\S]*\}/);
    if (match?.[0]) {
      try {
        const parsed = JSON.parse(match[0]);
        const code = String(parsed?.error || "");
        if (code) return code;
      } catch {
        // ignore
      }
    }

    return "";
  };

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
                setShowRecoveryEmail(false);

                try {
                  const redirectTo = `${window.location.origin}/reset-password`;
                  const { data, error } = await supabase.functions.invoke("bootstrap-admin", {
                    body: { email: values.email, redirectTo },
                  });

                  // supabase-js can return a FunctionsHttpError for non-2xx responses.
                  // In this case, the JSON body may still contain our structured error.
                  if (error) {
                    const backendError = getBackendErrorCode(error);
                    if (backendError === "admin_already_configured") {
                      setShowRecoveryEmail(true);
                      toast({
                        title: "Admin já configurado",
                        description: "Envie um link de recuperação para definir/alterar a senha desse email.",
                      });
                      return;
                    }
                    throw error;
                  }

                  if (!data?.success) {
                    const err = String((data as any)?.error || "");
                    if (err === "admin_already_configured") {
                      setShowRecoveryEmail(true);
                      toast({
                        title: "Admin já configurado",
                        description: "Envie um link de recuperação para definir/alterar a senha desse email.",
                      });
                      return;
                    }
                    throw new Error(err || "Falha ao criar admin");
                  }

                  setRecoveryLink(data.recoveryLink || null);
                  toast({ title: "Admin criado!" });
                } catch (e: any) {
                  const backendError = getBackendErrorCode(e);
                  if (backendError === "admin_already_configured") {
                    setShowRecoveryEmail(true);
                    toast({
                      title: "Admin já configurado",
                      description: "Envie um link de recuperação para definir/alterar a senha desse email.",
                    });
                    return;
                  }
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

              {showRecoveryEmail ? (
                <div className="grid gap-2 rounded-md border border-border bg-card p-4">
                  <p className="text-sm">
                    Já existe um admin. Clique abaixo para receber um link de recuperação e definir sua senha.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      const email = String(form.getValues("email") || "").trim();
                      if (!email) {
                        toast({ title: "Informe o email", variant: "destructive" });
                        return;
                      }
                      const redirectTo = `${window.location.origin}/reset-password`;
                      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
                      if (error) {
                        toast({ title: "Falha ao enviar email", description: error.message, variant: "destructive" });
                        return;
                      }
                      toast({ title: "Email enviado", description: "Verifique sua caixa de entrada e spam." });
                    }}
                  >
                    Enviar link de recuperação
                  </Button>
                  <Button type="button" onClick={() => navigate("/login")}>Ir para login</Button>
                </div>
              ) : null}

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
