import paperTexture from "@/assets/texture-paper-fine.png";
import bgCantina from "@/assets/bg-celulas-nas-casas.jpg";
import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Cantina() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ElementorHeader />

      <main className="pt-[96px] md:pt-0">
        {/* HERO */}
        <header className="relative overflow-hidden">
          <div className="relative min-h-[420px] w-full md:min-h-[520px]">
            <img
              src={bgCantina}
              alt="Cantina da igreja"
              className="absolute inset-0 h-full w-full object-cover saturate-75 contrast-95 brightness-105 grayscale-[10%]"
              loading="eager"
            />

            {/* overlay (mantém identidade do site) */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-mel-overlay/35 via-mel-overlay/35 to-mel-overlay/55" />

            {/* textura */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 mix-blend-soft-light"
              style={{ backgroundImage: `url(${paperTexture})`, backgroundRepeat: "repeat" }}
            />

            <div className="relative z-10 mx-auto w-full max-w-[1155px] px-6 py-16 md:py-20">
              <div className="max-w-[760px]">
                <p className="font-display text-[12px] font-semibold uppercase tracking-[0.35em] text-primary-foreground/90">
                  Comunhão • Apoio • Missões
                </p>
                <h1 className="mt-4 font-display text-[40px] font-semibold uppercase tracking-[0.06em] text-primary-foreground md:text-[56px]">
                  Cantina da Igreja
                </h1>
                <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-primary-foreground/85">
                  Um espaço simples para servir, acolher e ajudar. Confira os horários e o que está disponível.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <Badge className="bg-card/85 text-foreground ring-1 ring-border backdrop-blur">
                    Após os cultos
                  </Badge>
                  <Badge className="bg-card/85 text-foreground ring-1 ring-border backdrop-blur">
                    Café • Lanches • Doces
                  </Badge>
                  <Badge className="bg-card/85 text-foreground ring-1 ring-border backdrop-blur">
                    Pagamento no local
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <section aria-label="Informações da cantina" className="bg-background">
          <div className="mx-auto w-full max-w-[1155px] px-6 py-12 md:py-14">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 shadow-elev ring-1 ring-border">
                <h2 className="font-display text-[18px] uppercase tracking-[0.22em] text-foreground">Horários</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  Normalmente abrimos <span className="text-foreground">antes</span> e <span className="text-foreground">após</span> os cultos.
                  <br />
                  (Ajuste conforme a programação.)
                </p>
              </Card>

              <Card className="p-6 shadow-elev ring-1 ring-border">
                <h2 className="font-display text-[18px] uppercase tracking-[0.22em] text-foreground">Cardápio</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  Café, chá, refrigerantes, água, salgados e doces.
                </p>
              </Card>

              <Card className="p-6 shadow-elev ring-1 ring-border">
                <h2 className="font-display text-[18px] uppercase tracking-[0.22em] text-foreground">Objetivo</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  A renda ajuda em ações da igreja e apoio a projetos.
                </p>
              </Card>
            </div>

            <div className="mt-10 rounded-xl bg-gradient-to-br from-mel-blueA to-mel-blueB p-px">
              <div className="rounded-[11px] bg-card px-6 py-8 md:px-8">
                <h2 className="font-display text-[20px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  Quer ajudar na cantina?
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  Se você deseja servir como voluntário(a) em um domingo, fale com a liderança após o culto.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
