import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type LeadValues = {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
};

export default function KidsPlatform() {
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, "Informe seu nome").max(120, "Nome muito longo"),
        email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
        phone: z.string().trim().max(40, "Telefone muito longo").optional().or(z.literal("")),
        message: z.string().trim().max(2000, "Mensagem muito longa").optional().or(z.literal("")),
      }),
    [],
  );

  const form = useForm<LeadValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ElementorHeader />

      <main className="flex-1">
        <header className="mx-auto w-full max-w-[1155px] px-6 pt-10 md:pt-14">
          <h1 className="font-display text-4xl uppercase tracking-[0.10em] md:text-5xl">Sistema do Ministério Infantil</h1>
          <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted-foreground md:text-base">
            Check-in com QR Code, etiquetas, cadastro de crianças e responsáveis, comunicação e relatórios — tudo no mesmo sistema.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="hero" size="xl">
              <a href="/kids/dashboard">Acessar dashboard</a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href="#contato">Solicitar demonstração</a>
            </Button>
          </div>
        </header>

        <section aria-label="Como funciona" className="mx-auto w-full max-w-[1155px] px-6 py-12 md:py-16">
          <h2 className="font-display text-2xl uppercase tracking-[0.14em]">Como Funciona</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[
              { title: "Cadastro de crianças e responsáveis", text: "Registre famílias, alergias e observações importantes." },
              { title: "Check-in via QR Code", text: "Entrada rápida, com registro de status e evento." },
              { title: "Impressão de etiquetas ou pulseiras", text: "Impressão direta pelo navegador, pronta para uso no dia." },
              { title: "Acompanhamento em tempo real", text: "Painel com check-ins do dia, alertas e contagem por evento." },
              { title: "Check-out seguro com validação", text: "Saída com validação por responsável autorizado." },
            ].map((item) => (
              <Card key={item.title} className="p-6 shadow-elev ring-1 ring-border">
                <h3 className="font-display text-lg uppercase tracking-[0.12em]">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-label="Funcionalidades" className="bg-card/30">
          <div className="mx-auto w-full max-w-[1155px] px-6 py-12 md:py-16">
            <h2 className="font-display text-2xl uppercase tracking-[0.14em]">Funcionalidades</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {[
                "Gestão de crianças e famílias",
                "Controle de alergias e observações",
                "Comunicação com responsáveis",
                "Relatórios automáticos",
                "Eventos e programações",
              ].map((t) => (
                <Card key={t} className="p-6 shadow-elev ring-1 ring-border">
                  <p className="font-display uppercase tracking-[0.12em]">{t}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Benefícios" className="mx-auto w-full max-w-[1155px] px-6 py-12 md:py-16">
          <h2 className="font-display text-2xl uppercase tracking-[0.14em]">Benefícios</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {["Segurança no acesso", "Organização do ministério", "Agilidade no check-in", "Comunicação eficiente"].map((t) => (
              <Card key={t} className="p-6 shadow-elev ring-1 ring-border">
                <p className="font-display uppercase tracking-[0.12em]">{t}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="contato" aria-label="Contato e solicitação" className="bg-card/30">
          <div className="mx-auto w-full max-w-[720px] px-6 py-12 md:py-16">
            <h2 className="font-display text-2xl uppercase tracking-[0.14em]">Contato / Solicitação</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Envie seus dados. Eles serão salvos no backend em /api/leads (interno do projeto).
            </p>

            <Card className="mt-8 p-6 shadow-elev ring-1 ring-border">
              <form
                className="grid gap-4"
                onSubmit={form.handleSubmit(async (values) => {
                  setSubmitting(true);
                  try {
                    const payload = {
                      name: values.name,
                      email: values.email || null,
                      phone: values.phone || null,
                      message: values.message || null,
                      source: "site",
                    };
                    const { error } = await supabase.from("leads").insert(payload);
                    if (error) throw error;
                    toast({ title: "Recebido!", description: "Vamos entrar em contato em breve." });
                    form.reset();
                  } catch (e: any) {
                    toast({ title: "Não foi possível enviar", description: e?.message ?? "Tente novamente.", variant: "destructive" });
                  } finally {
                    setSubmitting(false);
                  }
                })}
              >
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email ? (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" {...form.register("phone")} />
                    {form.formState.errors.phone ? (
                      <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea id="message" rows={5} {...form.register("message")} />
                  {form.formState.errors.message ? (
                    <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                  ) : null}
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar"}
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
