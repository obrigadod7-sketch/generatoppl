import { forwardRef, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CalendarPlus,
  CheckCircle2,
  Church,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  Users,
} from "lucide-react";

import type { Ministerio } from "@/shared/ministerios";
import { MINISTERIO_SOCIALS } from "@/shared/ministerios";

import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

type SignupValues = {
  name: string;
  phone?: string | "";
  email?: string | "";
  message?: string | "";
};

type EventItem = {
  id: string;
  title: string;
  start: string; // ISO local-like: 2026-02-10T20:00
  end: string; // ISO local-like
  location: string;
  description?: string;
};

function toICSDate(date: Date) {
  // UTC format: YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function makeGoogleCalendarUrl(evt: { title: string; start: Date; end: Date; location: string; details?: string }) {
  const dates = `${toICSDate(evt.start)}/${toICSDate(evt.end)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evt.title,
    dates,
    location: evt.location,
    details: evt.details || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildICS(evt: { title: string; start: Date; end: Date; location: string; details?: string }) {
  const uid = `${crypto.randomUUID()}@ministerio-de-casais`;
  const dtstamp = toICSDate(new Date());
  const dtstart = toICSDate(evt.start);
  const dtend = toICSDate(evt.end);

  // Minimal RFC5545 with CRLF.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lovable//MinisterioCasais//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${evt.title.replace(/\n/g, " ")}`,
    `LOCATION:${evt.location.replace(/\n/g, " ")}`,
    evt.details ? `DESCRIPTION:${evt.details.replace(/\n/g, " ")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function downloadICS(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatDateTime(dt: Date, locale: string) {
  const map: Record<string, string> = {
    pt: "pt-BR",
    en: "en-US",
    fr: "fr-FR",
  };
  return dt.toLocaleString(map[locale] || "pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeatureItem({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground ring-1 ring-border">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

const SectionTitle = forwardRef<
  HTMLDivElement,
  { kicker?: string; title: string; subtitle?: string; id?: string; className?: string }
>(function SectionTitle({ kicker, title, subtitle, id, className }, ref) {
  return (
    <div ref={ref} id={id} className={"scroll-mt-28 " + (className || "")}>
      {kicker ? (
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{kicker}</p>
      ) : null}
      <h2 className="mt-2 font-display text-xl font-semibold uppercase tracking-[0.14em] sm:text-2xl md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">{subtitle}</p> : null}
    </div>
  );
});

export default function CasaisMinisterio({ ministerio }: { ministerio: Ministerio }) {
  const [openImage, setOpenImage] = useState<string | null>(null);
  const { t, locale } = useI18n();

  const signupSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(2, t("couples_form_name_error"))
          .max(120, t("couples_form_name_too_long")),
        phone: z
          .string()
          .trim()
          .max(40, t("couples_form_phone_too_long"))
          .optional()
          .or(z.literal("")),
        email: z
          .string()
          .trim()
          .email(t("couples_form_email_invalid"))
          .max(255, t("couples_form_email_too_long"))
          .optional()
          .or(z.literal("")),
        message: z
          .string()
          .trim()
          .max(1000, t("couples_form_message_too_long"))
          .optional()
          .or(z.literal("")),
      }),
    [t],
  );

  useEffect(() => {
    const title = locale === "pt" ? ministerio.titulo : t("couples_ministry");
    document.title = `${title} | Missão Evangélica Lusitana`;
  }, [locale, ministerio.titulo, t]);

  const events: EventItem[] = useMemo(
    () => [
      {
        id: "encontro-mensal",
        title: t("couples_event_1_title"),
        start: "2026-02-07T20:00",
        end: "2026-02-07T21:30",
        location: t("couples_event_1_location"),
        description: t("couples_event_1_desc"),
      },
      {
        id: "devocional-online",
        title: t("couples_event_2_title"),
        start: "2026-02-18T21:00",
        end: "2026-02-18T21:40",
        location: t("couples_event_2_location"),
        description: t("couples_event_2_desc"),
      },
      {
        id: "cafe-conversa",
        title: t("couples_event_3_title"),
        start: "2026-03-07T16:30",
        end: "2026-03-07T18:00",
        location: t("couples_event_3_location"),
        description: t("couples_event_3_desc"),
      },
    ],
    [t],
  );

  const eventsWithDates = useMemo(() => {
    return events
      .map((e) => ({
        ...e,
        startDate: new Date(e.start),
        endDate: new Date(e.end),
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events]);

  const nextEventId = useMemo(() => {
    const now = Date.now();
    return eventsWithDates.find((e) => e.endDate.getTime() >= now)?.id;
  }, [eventsWithDates]);

  const gallery = (ministerio.galeria || []).filter(Boolean);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupValues) => {
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) return;

    const clean = {
      name: parsed.data.name,
      phone: parsed.data.phone?.trim() || null,
      email: parsed.data.email?.trim() || null,
      message: parsed.data.message?.trim() || null,
      source_slug: ministerio.slug,
    };

    try {
      const { error } = await supabase.from("couple_ministry_signups").insert(clean);
      if (error) throw error;

      toast({
        title: t("couples_signup_sent"),
        description: t("couples_signup_sent_desc"),
      });
      form.reset();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("couples_signup_error");
      toast({ title: t("error"), description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ElementorHeader />

      <main>
        {/* HERO */}
        <section aria-label={t("home_hero_aria")} className="relative min-h-auto sm:min-h-[70vh]">
          <div className="absolute inset-0">
            <img
              src={ministerio.imagem}
              alt={t("couples_hero_alt")}
              className="h-full w-full object-cover"
              loading="lazy"
            />
             {/* Gradiente com tonalidade azul no rodapé (coerente com a paleta do site) */}
             <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/45 to-mel-blue800/95" />
          </div>

          <div className="relative mx-auto flex w-full max-w-[1200px] flex-col px-4 py-10 sm:px-6 sm:py-16">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-foreground/90">
              {t("couples_ministry")}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold uppercase leading-[1.12] tracking-[0.12em] text-primary-foreground sm:mt-3">
              {locale === "pt" ? ministerio.subtitulo || t("couples_default_subtitle") : t("couples_default_subtitle")}
            </h1>
            {locale === "pt" && ministerio.versiculo ? (
              <p className="mt-3 max-w-2xl text-sm text-primary-foreground/90 md:text-base">
                “{ministerio.versiculo.texto}” — <span className="font-semibold">{ministerio.versiculo.referencia}</span>
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
                <a href="#participar">{t("couples_cta_join")}</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/ministerios">{t("couples_cta_other")}</Link>
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 md:grid-cols-4">
              <a
                href="#identidade"
                className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground backdrop-blur-sm transition-colors hover:bg-card"
              >
                {t("couples_nav_identity")}
              </a>
              <a
                href="#agenda"
                className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground backdrop-blur-sm transition-colors hover:bg-card"
              >
                {t("couples_nav_agenda")}
              </a>
              <a
                href="#conteudo"
                className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground backdrop-blur-sm transition-colors hover:bg-card"
              >
                {t("couples_nav_content")}
              </a>
              <a
                href="#participar"
                className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground backdrop-blur-sm transition-colors hover:bg-card"
              >
                {t("couples_nav_signup")}
              </a>
            </div>
          </div>
        </section>

        {/* IDENTIDADE */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
          <SectionTitle
            id="identidade"
            kicker={t("couples_identity_kicker")}
            title={locale === "pt" ? ministerio.titulo : t("couples_ministry")}
            subtitle={t("couples_identity_subtitle")}
          />

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_mission")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <p className="text-sm text-muted-foreground">
                  {locale === "pt" && ministerio.missao ? ministerio.missao : t("couples_mission_fallback")}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_vision")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("couples_vision_fallback")}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_values")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {(
                    locale === "pt" && ministerio.valores?.length
                      ? ministerio.valores
                      : [
                          t("couples_value_fallback_1"),
                          t("couples_value_fallback_2"),
                          t("couples_value_fallback_3"),
                          t("couples_value_fallback_4"),
                          t("couples_value_fallback_5"),
                        ]
                  ).map((v) => (
                    <li key={v} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" aria-hidden />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SOBRE */}
        <section className="bg-muted/20">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
            <SectionTitle
              kicker={t("couples_about_kicker")}
              title={t("couples_about_title")}
              subtitle={locale === "pt" && ministerio.descricao ? ministerio.descricao : t("couples_about_default")}
            />

            <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2">
              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_for_who")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
                  <FeatureItem
                    icon={Users}
                    title={t("couples_feature_for_1_title")}
                    text={t("couples_feature_for_1_text")}
                  />
                  <FeatureItem
                    icon={HeartHandshake}
                    title={t("couples_feature_for_2_title")}
                    text={t("couples_feature_for_2_text")}
                  />
                  <FeatureItem
                    icon={Home}
                    title={t("couples_feature_for_3_title")}
                    text={t("couples_feature_for_3_text")}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_how_it_works")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
                  <FeatureItem
                    icon={Church}
                    title={t("couples_feature_how_1_title")}
                    text={t("couples_feature_how_1_text")}
                  />
                  <FeatureItem
                    icon={MessageSquare}
                    title={t("couples_feature_how_2_title")}
                    text={t("couples_feature_how_2_text")}
                  />
                  <FeatureItem
                    icon={User}
                    title={t("couples_feature_how_3_title")}
                    text={t("couples_feature_how_3_text")}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AGENDA */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
          <SectionTitle
            id="agenda"
            kicker={t("couples_program_kicker")}
            title={t("couples_program_title")}
            subtitle={t("couples_program_subtitle")}
          />

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
            {eventsWithDates.map((evt) => {
              const isNext = evt.id === nextEventId;
              const googleUrl = makeGoogleCalendarUrl({
                title: evt.title,
                start: evt.startDate,
                end: evt.endDate,
                location: evt.location,
                details: evt.description,
              });
              return (
                <Card key={evt.id} className={(isNext ? "ring-1 ring-ring " : "") + "shadow-none sm:shadow-elev"}>
                  <CardHeader>
                    <CardTitle className="font-display uppercase tracking-[0.12em]">
                      {isNext ? t("couples_next_event") : t("couples_event")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                    <p className="text-base font-semibold text-foreground">{evt.title}</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <CalendarPlus className="mt-0.5 h-4 w-4 text-foreground" aria-hidden />
                        <span>
                          {formatDateTime(evt.startDate, locale)} — {formatDateTime(evt.endDate, locale)}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-foreground" aria-hidden />
                        <span>{evt.location}</span>
                      </p>
                    </div>
                    {evt.description ? <p className="mt-3 text-sm text-muted-foreground">{evt.description}</p> : null}

                    <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap">
                      <Button asChild variant="secondary" className="w-full sm:w-auto">
                        <a href={googleUrl} target="_blank" rel="noreferrer">
                          {t("couples_add_google")}
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          const ics = buildICS({
                            title: evt.title,
                            start: evt.startDate,
                            end: evt.endDate,
                            location: evt.location,
                            details: evt.description,
                          });
                          downloadICS(`evento-${evt.id}.ics`, ics);
                        }}
                      >
                        {t("couples_download_ics")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* GALERIA */}
        {gallery.length > 0 ? (
          <section className="bg-muted/20">
            <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
              <SectionTitle
                kicker={t("couples_gallery_kicker")}
                title={t("couples_gallery_title")}
                subtitle={t("couples_gallery_subtitle")}
              />

              <div className="mt-6 grid gap-2 sm:mt-10 sm:gap-3 sm:grid-cols-2 md:grid-cols-4">
                {gallery.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setOpenImage(src)}
                    className="group relative overflow-hidden rounded-md border border-border bg-muted text-left"
                    aria-label={`${t("couples_gallery_open_photo")} ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${t("couples_gallery_photo_alt_prefix")} (${idx + 1})`}
                      className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </button>
                ))}
              </div>

              <Dialog open={!!openImage} onOpenChange={(v) => !v && setOpenImage(null)}>
                <DialogContent className="max-w-[980px]">
                  <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-[0.12em]">{t("couples_gallery_title")}</DialogTitle>
                  </DialogHeader>
                  {openImage ? (
                    <div className="relative overflow-hidden rounded-md border border-border bg-muted">
                      <img src={openImage} alt={t("couples_gallery_zoom_alt")} className="h-full w-full object-contain" loading="lazy" />
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
            </div>
          </section>
        ) : null}

        {/* CONTEÚDO */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
          <SectionTitle
            id="conteudo"
            kicker={t("couples_content_kicker")}
            title={t("couples_content_title")}
            subtitle={t("couples_content_subtitle")}
          />

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_devotional")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("couples_devotional_text")}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{t("couples_devotional_base")}</p>
              </CardContent>
            </Card>
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_article")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("couples_article_text")}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{t("couples_article_base")}</p>
              </CardContent>
            </Card>
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_message")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("couples_message_soon")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 sm:mt-8">
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
              <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_testimony")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("couples_testimony_text")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* LIDERANÇA */}
        <section className="bg-muted/20">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
            <SectionTitle
            kicker={t("couples_leadership_kicker")}
            title={t("couples_leadership_title")}
            subtitle={t("couples_leadership_subtitle")}
            />

            <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-[320px_1fr] md:items-center">
              <div className="relative overflow-hidden rounded-md border border-border bg-muted">
                <img
                  src={gallery[0] || ministerio.imagem}
                  alt={t("couples_leadership_photo_alt")}
                  className="aspect-[4/5] h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_leader_couple")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("couples_leader_names")}</span> — {t("couples_leader_line")}
                  </p>
                  <Separator className="my-5" />
                  <p className="text-sm text-muted-foreground">
                    {t("couples_leader_quote")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* COMO PARTICIPAR + FORM */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
          <SectionTitle
            id="participar"
            kicker={t("couples_how_join_kicker")}
            title={t("couples_how_join_title")}
            subtitle={t("couples_how_join_subtitle")}
          />

          <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2">
            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_steps")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      1
                    </span>
                  <span>{t("couples_steps_1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      2
                    </span>
                  <span>{t("couples_steps_2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      3
                    </span>
                  <span>{t("couples_steps_3")}</span>
                  </li>
                </ol>

                <div className="mt-6 grid gap-3">
                  <Button asChild variant="secondary" size="lg">
                    <a href="#agenda">{t("couples_view_agenda")}</a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href={MINISTERIO_SOCIALS.instagram} target="_blank" rel="noreferrer">
                      {t("couples_talk_instagram")}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none sm:shadow-elev">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_form")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("couples_name")} *</Label>
                    <Input id="name" autoComplete="name" {...form.register("name")} />
                    {form.formState.errors.name ? (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("couples_phone")}</Label>
                      <Input id="phone" autoComplete="tel" placeholder="+33..." {...form.register("phone")} />
                      {form.formState.errors.phone ? (
                        <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("couples_email")}</Label>
                      <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                      {form.formState.errors.email ? (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("couples_message_label")}</Label>
                    <Textarea id="message" rows={4} placeholder={t("couples_message_placeholder")} {...form.register("message")} />
                    {form.formState.errors.message ? (
                      <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                    ) : null}
                  </div>

                  <Button type="submit" variant="hero" size="lg" disabled={form.formState.isSubmitting}>
                    {t("couples_submit")}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t("couples_privacy")}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CONTATO */}
        <section className="bg-muted/20">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
          <SectionTitle
            kicker={t("couples_contact_kicker")}
            title={t("couples_contact_title")}
            subtitle={t("couples_contact_subtitle")}
          />

            <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_contact_phone")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 text-foreground" aria-hidden />
                    <span>+33 749548353</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_contact_email")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <a
                    className="flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
                    href="mailto:missaoevangelicafrancesa@gmail.com"
                  >
                    <Mail className="h-4 w-4 text-foreground" aria-hidden />
                    <span>missaoevangelicafrancesa@gmail.com</span>
                  </a>
                </CardContent>
              </Card>
              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_contact_social")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <a className="block text-sm text-muted-foreground underline-offset-4 hover:underline" href={MINISTERIO_SOCIALS.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                  <a className="block text-sm text-muted-foreground underline-offset-4 hover:underline" href={MINISTERIO_SOCIALS.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </CardContent>
              </Card>
              <Card className="shadow-none sm:shadow-elev">
                <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">{t("couples_contact_address")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <a
                    className="flex items-start gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
                    href="https://maps.google.com/?q=15%20Rue%20Jean%20Moulin%2077340"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 text-foreground" aria-hidden />
                    <span>15 Rue Jean Moulin 77340</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
