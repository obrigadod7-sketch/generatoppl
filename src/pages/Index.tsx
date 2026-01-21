import heroBanner from "@/assets/oficial-2-1.png";
import pastoralImage from "@/assets/familia-pastoral.png";
import bgCultos from "@/assets/bg-cultos-ao-vivo-celulas-match.jpg";
import bgCelulas from "@/assets/bg-celulas-nas-casas-cultos-match.jpg";
import paperTexture from "@/assets/texture-paper-fine.png";
import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useI18n } from "@/i18n/I18nProvider";

const Index = () => {
  const { t } = useI18n();

  const renderMultiline = (text: string) => {
    const parts = text.split("\\n");
    return (
      <>
        {parts.map((p, idx) => (
          <span key={idx}>
            {p}
            {idx < parts.length - 1 ? <br /> : null}
          </span>
        ))}
      </>
    );
  };

  const PhotoOverlay = () => (
    <>
      {/* OVERLAY AZUL (deve ficar acima da imagem e abaixo da textura) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-mel-banner3/65 mix-blend-multiply" />
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header sobre o hero (como Elementor) */}
      <ElementorHeader />

        <main className="pt-[96px] md:pt-0">
        {/* HERO (imagem + overlay) */}
         <section
           aria-label={t("home_hero_aria")}
           className="relative w-full overflow-hidden"
         >
           {/*
            * Height strategy:
            * - mobile/tablet: fill the visible viewport (minus the fixed header spacing applied by <main>)
            * - desktop: full screen hero
            */}
           <div className="relative h-[calc(62svh-96px)] min-h-[320px] w-full sm:h-[calc(70svh-96px)] md:h-[calc(72svh-96px)] lg:h-screen lg:min-h-[775px]">
           <img
             src={heroBanner}
             alt="Banner da Missão Evangélica Lusitana"
             className="absolute inset-0 h-full w-full bg-mel-banner3 object-contain object-center saturate-75 contrast-95 brightness-105 grayscale-[10%] lg:object-cover"
             loading="eager"
             decoding="async"
             fetchPriority="high"
           />

          {/* overlay mais claro (mantém a identidade azul sem escurecer) */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-mel-overlay/30 to-mel-overlay/30" />

          {/* textura (papel/tecido) — sutil, sentida e não vista */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-20 mix-blend-soft-light"
            style={{ backgroundImage: `url(${paperTexture})`, backgroundRepeat: "repeat" }}
          />

           {/* Conteúdo do hero (sem texto/CTA) - apenas garante o espaçamento/altura */}
           <div className="relative z-30 h-full" />
           </div>
         </section>

        {/* Bloco (desktop) - Estudo bíblico + Oração (como Elementor) */}
        <section aria-label={t("home_study_desktop_aria")} className="hidden bg-mel-blue800 md:block">
          <div className="mx-auto w-full max-w-[1155px] px-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Estudo */}
              <div className="flex flex-col items-center text-center">
                <h2 className="font-display text-[26px] font-semibold uppercase leading-tight text-primary-foreground">
                  {renderMultiline(t("home_participe_estudo"))}
                </h2>
                <div className="mt-4 flex justify-center">
                  <a
                    className="inline-flex h-12 w-full max-w-[420px] items-center justify-center bg-mel-blue700 px-6 font-display text-[12px] font-semibold uppercase tracking-[0.35em] text-primary-foreground"
                    href="https://missionevangeliquelusitana.com/reunioes-pelo-zoom/"
                  >
                    {t("home_estudo_btn")}
                  </a>
                </div>
              </div>

              {/* Oração */}
              <div className="flex flex-col items-center text-center">
                <h2 className="font-display text-[26px] font-semibold uppercase leading-tight text-primary-foreground">
                  {renderMultiline(t("home_peca_oracao"))}
                </h2>
                <div className="mt-4 flex justify-center">
                  <a
                    className="inline-flex h-12 w-full max-w-[420px] items-center justify-center bg-mel-blue700 px-6 font-display text-[12px] font-semibold uppercase tracking-[0.35em] text-primary-foreground"
                    href="https://missionevangeliquelusitana.com/pedidos-de-oracao/"
                  >
                    {t("home_peca_oracao_btn")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco (mobile only) - Estudo Bíblico stretched com gradiente e animação */}
        <section
          aria-label={t("home_study_mobile_aria")}
          id="estudo"
          className="relative w-full overflow-hidden bg-mel-blue800 md:hidden"
        >
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent to-mel-overlay/20" />
          
          <div className="relative">
             <div className="bg-gradient-to-b from-mel-blue600 to-mel-blue800 px-[20px] py-[24px]">
              <h2 className="animate-fade-in text-center font-display text-[25px] font-semibold uppercase leading-tight text-primary-foreground">
                {renderMultiline(t("home_participe_estudo"))}
              </h2>
              <div className="mt-6 flex justify-center">
                <a
                  className="inline-flex h-12 w-full items-center justify-center bg-mel-blue700 px-6 font-display text-[12px] font-semibold uppercase tracking-[0.35em] text-primary-foreground"
                  href="https://missionevangeliquelusitana.com/reunioes-pelo-zoom/"
                >
                  {t("home_estudo_btn")}
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* 2 cards (Cultos ao vivo / Células) */}
        <section aria-label="Cultos e células" className="bg-gradient-to-br from-mel-blueA to-mel-blueB p-px">
          <div className="grid w-full items-stretch md:grid-cols-2">
            {/* Coluna 1 - Cultos */}
            <div className="relative overflow-hidden bg-mel-banner3">
              {/* IMAGEM (base) */}
              <img
                src={bgCultos}
                alt="Cultos ao vivo"
                loading="lazy"
                decoding="async"
                // Preencher o bloco (sem sobrar “bordas")
                className="absolute inset-0 z-0 h-full w-full object-cover object-center filter saturate-[0.8] contrast-[0.9] brightness-[0.95]"
              />

              {/* OVERLAY AZUL */}
              <PhotoOverlay />

              {/* CONTEÚDO */}
              <div className="relative z-30 flex min-h-[300px] flex-col items-center justify-center gap-6 px-8 text-center md:min-h-[360px] md:px-10">
                <h2 className="font-display text-[34px] font-semibold uppercase tracking-[0.14em] text-mel-ice drop-shadow-md animate-fade-in">
                  <a href="/cultos-ao-vivo">{t("home_cultos")}</a>
                </h2>

                <a
                  className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-md bg-card/75 px-10 font-display text-[11px] font-semibold uppercase tracking-[0.45em] text-foreground shadow-elev ring-1 ring-border backdrop-blur-md"
                  href="/cultos-ao-vivo"
                >
                  {t("home_informacoes")}
                </a>
              </div>

              {/* TEXTURA (deve ficar por cima de tudo) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20 opacity-24 mix-blend-overlay"
                style={{ backgroundImage: `url(${paperTexture})`, backgroundRepeat: "repeat" }}
              />
            </div>

            {/* Coluna 2 - Células */}
            <div className="relative overflow-hidden bg-mel-banner3">
              {/* IMAGEM (base) — igual ao Cultos: ocupa 100% do bloco */}
              <img
                src={bgCelulas}
                alt="Células nas casas"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 z-0 h-full w-full object-cover object-center filter saturate-[0.8] contrast-[0.9] brightness-[0.95]"
              />

              {/* OVERLAY AZUL */}
              <PhotoOverlay />

              {/* CONTEÚDO */}
              <div className="relative z-30 flex min-h-[300px] flex-col items-center justify-center gap-6 px-8 text-center md:min-h-[360px] md:px-10">
                <h2 className="font-display text-[34px] font-semibold uppercase tracking-[0.14em] text-mel-ice drop-shadow-md animate-fade-in">
                  <a href="https://missionevangeliquelusitana.com/celular-nas-casas/">{t("home_celulas")}</a>
                </h2>

                <a
                  className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-md bg-card/75 px-10 font-display text-[11px] font-semibold uppercase tracking-[0.45em] text-foreground shadow-elev ring-1 ring-border backdrop-blur-md"
                  href="https://missionevangeliquelusitana.com/celular-nas-casas/"
                >
                  {t("home_informacoes")}
                </a>
              </div>

              {/* TEXTURA (deve ficar por cima de tudo) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20 opacity-24 mix-blend-overlay"
                style={{ backgroundImage: `url(${paperTexture})`, backgroundRepeat: "repeat" }}
              />
            </div>
          </div>
        </section>

        {/* Família pastoral */}
        <section id="pastoral" aria-label="Família pastoral" className="bg-card p-px">
          <div className="container py-10 text-center">
            <h2 className="font-display text-[2.2em] text-mel-blue800">{t("home_familia_pastoral")}</h2>
            <img
              src={pastoralImage}
              alt="Família pastoral"
              loading="lazy"
              className="mx-auto mt-6 w-[30%] max-w-[420px] max-[980px]:w-[70%]"
            />
          </div>
        </section>

        {/* Rádio removida a pedido */}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
