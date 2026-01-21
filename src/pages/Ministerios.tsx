import { Link } from "react-router-dom";

import { ElementorHeader } from "@/components/site/ElementorHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { MINISTERIOS, MINISTERIO_SOCIALS } from "@/shared/ministerios";

export default function Ministerios() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ElementorHeader />

      <main className="pt-24 md:pt-28">
        <section className="mx-auto w-full max-w-[1200px] px-6">
          <div className="flex flex-col items-start gap-4">
            <Badge variant="secondary">Conheça</Badge>
            <h1 className="font-display text-3xl uppercase tracking-[0.14em] md:text-4xl">
              Ministérios da Igreja
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Acompanhe os ministérios e participe. As fotos oficiais serão
              adicionadas a partir das redes sociais.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href={MINISTERIO_SOCIALS.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={MINISTERIO_SOCIALS.youtube} target="_blank" rel="noreferrer">
                  YouTube
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTERIOS.map((m) => (
              <Card key={m.slug} className="overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <img
                    src={m.imagem}
                    alt={`Foto do ministério ${m.titulo}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/25 to-transparent" />
                </div>

                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-[0.12em]">
                    {m.titulo}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">{m.resumo}</p>
                </CardContent>

                <CardFooter>
                  <Button asChild variant="default" className="w-full">
                    <Link to={`/ministerios/${m.slug}`}>Ver detalhes</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
