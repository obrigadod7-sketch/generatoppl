import { useEffect } from "react";

import paperTexture from "@/assets/texture-paper-fine.png";
import heroImage from "@/assets/bg-cultos-ao-vivo-user-treated-v2.jpg";
import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

export default function Missoes() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t("missions_title")} | Missão Evangélica Lusitana`;
  }, [t]);

  const values = [
    t("missions_value_1"),
    t("missions_value_2"),
    t("missions_value_3"),
    t("missions_value_4"),
    t("missions_value_5"),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ElementorHeader />

      <main>
        {/* HERO */}
        <header className="relative overflow-hidden">
          <div className="relative min-h-[440px] w-full md:min-h-[560px]">
            <img
              src={heroImage}
              alt="Pessoas reunidas em comunhão durante uma atividade da igreja"
              className="absolute inset-0 h-full w-full object-cover saturate-75 contrast-95 brightness-105 grayscale-[10%]"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            {/* overlay (identidade azul) */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-mel-overlay/35 via-mel-overlay/35 to-mel-overlay/65" />

            {/* textura */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 mix-blend-soft-light"
              style={{ backgroundImage: `url(${paperTexture})`, backgroundRepeat: "repeat" }}
            />

            <div className="relative z-10 mx-auto w-full max-w-[1155px] px-6 py-16 md:py-20">
              <div className="max-w-[820px]">
                <p className="font-display text-[12px] font-semibold uppercase tracking-[0.35em] text-primary-foreground/90">
                  {t("missions_kicker")}
                </p>
                <h1 className="mt-4 font-display text-[40px] font-semibold uppercase tracking-[0.06em] text-primary-foreground md:text-[60px]">
                  {t("missions_title")}
                </h1>
                <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-primary-foreground/85 md:text-base">
                  {t("missions_subtitle")}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <Badge className="bg-card/85 text-foreground ring-1 ring-border backdrop-blur">{t("missions_badge_local")}</Badge>
                  <Badge className="bg-card/85 text-foreground ring-1 ring-border backdrop-blur">{t("missions_badge_global")}</Badge>
                  <Badge className="bg-card/85 text-foreground ring-1 ring-border backdrop-blur">{t("missions_badge_compassion")}</Badge>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="hero" size="xl">
                    <a href="#contribuir">{t("missions_cta_contribute")}</a>
                  </Button>
                  <Button asChild variant="outline" size="xl">
                    <a href="/cantina">{t("missions_cta_cantina")}</a>
                  </Button>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-primary-foreground/70">
                  {t("missions_disclaimer")}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <section aria-label={t("missions_section_aria")} className="bg-background">
          <div className="mx-auto w-full max-w-[1155px] px-6 py-12 md:py-16">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 shadow-elev ring-1 ring-border">
                <h2 className="font-display text-[18px] uppercase tracking-[0.22em] text-foreground">{t("missions_why_title")}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{t("missions_why_text")}</p>
              </Card>

              <Card className="p-6 shadow-elev ring-1 ring-border">
                <h2 className="font-display text-[18px] uppercase tracking-[0.22em] text-foreground">{t("missions_mission_title")}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{t("missions_mission_text")}</p>
              </Card>

              <Card className="p-6 shadow-elev ring-1 ring-border">
                <h2 className="font-display text-[18px] uppercase tracking-[0.22em] text-foreground">{t("missions_values_title")}</h2>
                <ul className="mt-3 grid gap-2 text-[14px] leading-relaxed text-muted-foreground">
                  {values.map((v) => (
                    <li key={v} className="flex gap-3">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* CONTRIBUIR */}
        <section id="contribuir" aria-label={t("missions_contribute_aria")} className="bg-gradient-to-br from-mel-blueA to-mel-blueB p-px">
          <div className="bg-background">
            <div className="mx-auto w-full max-w-[1155px] px-6 py-12 md:py-16">
              <div className="max-w-[820px]">
                <h2 className="font-display text-[28px] font-semibold uppercase tracking-[0.12em] text-foreground md:text-[34px]">
                  {t("missions_contribute_title")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{t("missions_contribute_text")}</p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <Card className="p-6 shadow-elev ring-1 ring-border">
                  <h3 className="font-display text-[16px] uppercase tracking-[0.22em]">{t("missions_contribute_way_1_title")}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{t("missions_contribute_way_1_text")}</p>
                </Card>
                <Card className="p-6 shadow-elev ring-1 ring-border">
                  <h3 className="font-display text-[16px] uppercase tracking-[0.22em]">{t("missions_contribute_way_2_title")}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{t("missions_contribute_way_2_text")}</p>
                </Card>
                <Card className="p-6 shadow-elev ring-1 ring-border">
                  <h3 className="font-display text-[16px] uppercase tracking-[0.22em]">{t("missions_contribute_way_3_title")}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{t("missions_contribute_way_3_text")}</p>
                </Card>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="default" size="xl">
                  <a href="/#pastoral">{t("missions_cta_talk")}</a>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <a href="/cantina">{t("missions_cta_see_cantina")}</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
