import paperTexture from "@/assets/texture-paper-fine.png";
import heroImage from "@/assets/hero-oficial-upload.png";
import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useI18n } from "@/i18n/I18nProvider";

const ESTUDO_ZOOM_URL = "https://missionevangeliquelusitana.com/reunioes-pelo-zoom/";

export default function Estudo() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ElementorHeader />

      <main className="flex-1 pt-[96px] md:pt-0">
        <section aria-label="Hero do estudo" className="relative min-h-[360px] w-full overflow-hidden md:min-h-[520px]">
          <img
            src={heroImage}
            alt="Banner da Missão Evangélica Lusitana"
            className="absolute inset-0 h-full w-full object-cover saturate-75 contrast-95 brightness-105 grayscale-[10%]"
            loading="eager"
          />

          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-mel-overlay/25 to-mel-overlay/25" />

          <div
            aria-hidden
            className="absolute inset-0 opacity-20 mix-blend-soft-light"
            style={{ backgroundImage: `url(${paperTexture})`, backgroundRepeat: "repeat" }}
          />

          <div className="relative z-10 mx-auto flex min-h-[360px] max-w-[1155px] flex-col items-center justify-center px-6 py-14 text-center md:min-h-[520px]">
            <h1 className="font-display text-[42px] font-semibold leading-[1.05] text-primary-foreground md:text-[64px]">{t("study_title")}</h1>
            <p className="mt-5 max-w-[780px] text-sm text-primary-foreground/90 md:text-base">{t("study_subtitle")}</p>

            <div className="mt-8">
              <a
                className="inline-flex h-12 min-w-[280px] items-center justify-center bg-mel-blue700 px-6 font-display text-[12px] font-semibold uppercase tracking-[0.35em] text-primary-foreground"
                href={ESTUDO_ZOOM_URL}
              >
                {t("study_cta")}
              </a>
            </div>
          </div>
        </section>

        <section aria-label="Sobre o estudo" className="bg-background">
          <div className="container py-12 md:py-16">
            <div className="mx-auto grid max-w-[1155px] gap-10 md:grid-cols-2">
              <div>
                <h2 className="font-display text-[26px] font-semibold text-foreground">{t("how_it_works")}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("study_how_text")}</p>
              </div>

              <div>
                <h2 className="font-display text-[26px] font-semibold text-foreground">{t("access_link")}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("study_link_text")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
