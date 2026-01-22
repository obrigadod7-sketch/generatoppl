import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { getMinisterioBySlug, MINISTERIO_SOCIALS } from "@/shared/ministerios";
import CasaisMinisterio from "@/pages/CasaisMinisterio";
import { useI18n } from "@/i18n/I18nProvider";
import { KidsSignupForm } from "@/components/site/KidsSignupForm";

function BulletList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="ml-4 list-disc space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function MinisterioDetalhe() {
  const { slug } = useParams();
  const ministerio = getMinisterioBySlug(slug || "");
  const isCasais = ministerio?.slug === "ministerio-de-casais";
  const isInfantil = ministerio?.slug === "ministerio-infantil";
  const { t } = useI18n();

  const infantil = isInfantil
    ? {
        titulo: t("kids_title"),
        subtitulo: t("kids_subtitle"),
        descricao: t("kids_about_text"),
        missao: t("kids_mission_text"),
        valores: [
          t("kids_value_1"),
          t("kids_value_2"),
          t("kids_value_3"),
          t("kids_value_4"),
        ],
        atividades: [t("kids_activity_1"), t("kids_activity_2"), t("kids_activity_3")],
        comoParticipar: t("kids_how_text"),
        lideranca: [
          { role: t("kids_leader_1_role"), name: t("kids_leader_1_name") },
          { role: t("kids_leader_2_role"), name: t("kids_leader_2_name") },
        ],
      }
    : null;

  if (ministerio && isCasais) {
    return <CasaisMinisterio ministerio={ministerio} />;
  }

  const isAdminQuery = useIsAdmin();

  const mediaQuery = useQuery({
    queryKey: ["ministryMediaCache", ministerio?.slug],
    enabled: !!ministerio?.slug,
    queryFn: async () => {
      if (!ministerio) return { images: [] as string[] };

      // Read cache from backend (no scraping on page view)
      const { data, error } = await supabase.functions.invoke("ministry-media", {
        body: {
          action: "get",
          slug: ministerio.slug,
        },
      });
      if (error) throw error;
      return data as { success: boolean; images?: string[] };
    },
    staleTime: 1000 * 60 * 10,
  });

  const scrapedImages = (mediaQuery.data?.images || []).filter(Boolean);
  const galleryImages = (ministerio?.galeria || []).filter(Boolean);
  const pickedHero =
    scrapedImages.length > 0 && ministerio
      ? scrapedImages[hashString(ministerio.slug) % scrapedImages.length]
      : undefined;

  if (!ministerio) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ElementorHeader />
        <main>
          <section className="mx-auto w-full max-w-[1100px] px-6">
            <h1 className="font-display text-2xl uppercase tracking-[0.14em]">Ministério não encontrado</h1>
            <p className="mt-2 text-muted-foreground">Verifique o link e tente novamente.</p>
            <div className="mt-6">
              <Button asChild variant="default">
                <Link to="/ministerios">Voltar para Ministérios</Link>
              </Button>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ElementorHeader />

      <main>
        <section className={"relative " + (isCasais ? "min-h-[360px] md:min-h-[440px]" : "")}>
          <div className="absolute inset-0">
            <img
              src={pickedHero || ministerio.imagem}
              alt={`Imagem do ministério ${ministerio.titulo}`}
              className={
                "h-full w-full " +
                (isCasais
                  ? "object-contain bg-muted"
                  : "object-cover")
              }
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/65 to-background" />
          </div>

          <div className="relative mx-auto w-full max-w-[1100px] px-6 py-14 md:py-20">
            <Badge variant="secondary">Ministério</Badge>
            <h1 className="mt-3 font-display text-3xl uppercase tracking-[0.14em] md:text-5xl">
              {infantil?.titulo ?? ministerio.titulo}
            </h1>

            {(ministerio.subtitulo || ministerio.resumo) && (
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {infantil?.subtitulo ?? ministerio.subtitulo ?? ministerio.resumo}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {Boolean(isAdminQuery.data) && ministerio && (
                <Button
                  variant="secondary"
                  disabled={mediaQuery.isFetching}
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke("ministry-media", {
                        body: {
                          action: "refresh",
                          slug: ministerio.slug,
                          title: ministerio.titulo,
                          sources: {
                            facebook: MINISTERIO_SOCIALS.facebook,
                            instagram: MINISTERIO_SOCIALS.instagram,
                          },
                          limit: 24,
                        },
                      });

                      if (error || !data?.success) {
                        throw new Error(data?.error || error?.message || "Falha ao atualizar imagens");
                      }

                      toast({ title: "Imagens atualizadas", description: "Cache atualizado com sucesso." });
                      await mediaQuery.refetch();
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : "Falha ao atualizar imagens";
                      toast({ title: "Erro", description: msg, variant: "destructive" });
                    }
                  }}
                >
                  Atualizar imagens
                </Button>
              )}

              {ministerio.ctaLabel && (
                <Button asChild variant="default">
                  <a href={MINISTERIO_SOCIALS.facebook} target="_blank" rel="noreferrer">
                    {ministerio.ctaLabel}
                  </a>
                </Button>
              )}

              <Button asChild variant="outline">
                <a href={MINISTERIO_SOCIALS.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href={MINISTERIO_SOCIALS.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href={MINISTERIO_SOCIALS.youtube} target="_blank" rel="noreferrer">
                  YouTube
                </a>
              </Button>

              <Button asChild variant="ghost">
                <Link to="/ministerios">Voltar</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1100px] px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">
                  {isInfantil ? t("kids_about_title") : "Sobre"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{infantil?.descricao ?? ministerio.descricao}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">
                  {isInfantil ? t("kids_mission_values_title") : "Missão e valores"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(infantil?.missao ?? ministerio.missao) && (
                  <p className="text-sm text-muted-foreground">{infantil?.missao ?? ministerio.missao}</p>
                )}
                <div className="mt-4">
                  <BulletList items={infantil?.valores ?? ministerio.valores} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">
                  {isInfantil ? t("kids_activities_title") : "Atividades"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList items={infantil?.atividades ?? ministerio.atividades} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-[0.12em]">
                  {isInfantil ? t("kids_how_title") : "Como participar"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {infantil?.comoParticipar ||
                    ministerio.comoParticipar ||
                    "Fale com a liderança após o culto ou envie uma mensagem pelas redes sociais para receber orientações."}
                </p>
              </CardContent>
            </Card>

            {isInfantil && infantil && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">{t("kids_leadership_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {infantil.lideranca.map((l) => (
                      <div key={`${l.role}-${l.name}`} className="rounded-md border border-border bg-card p-4">
                        <p className="text-sm font-semibold text-foreground">{l.role}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{l.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {isInfantil ? (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">{t("kids_signup_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{t("kids_signup_subtitle")}</p>
                  <KidsSignupForm />
                </CardContent>
              </Card>
            ) : null}
          </div>

          {ministerio.versiculo && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">Versículo bíblico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">“{ministerio.versiculo.texto}”</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{ministerio.versiculo.referencia}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {galleryImages.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">Galeria</CardTitle>
                </CardHeader>
                <CardContent>
                  <Carousel opts={{ align: "start", dragFree: true }} className="relative">
                    <CarouselContent className="-ml-3">
                      {galleryImages.map((src) => (
                        <CarouselItem
                          key={src}
                          className="basis-[84%] pl-3 sm:basis-[52%] md:basis-[36%] lg:basis-[28%]"
                        >
                          <div className="relative overflow-hidden rounded-md border border-border bg-muted">
                            <img
                              src={src}
                              alt={`Foto do ministério ${ministerio.titulo}`}
                              className="aspect-[3/4] h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    <CarouselPrevious className="-left-4 hidden md:inline-flex" />
                    <CarouselNext className="-right-4 hidden md:inline-flex" />
                  </Carousel>
                </CardContent>
              </Card>
            </div>
          )}

          {scrapedImages.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {scrapedImages.slice(0, 6).map((src) => (
                      <div key={src} className="relative overflow-hidden rounded-md border border-border">
                        <img
                          src={src}
                          alt={`Foto do ministério ${ministerio.titulo}`}
                          className="aspect-[4/3] h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
