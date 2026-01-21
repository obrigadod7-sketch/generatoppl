import { Facebook, Instagram, MapPin, Youtube } from "lucide-react";

type LocationCardProps = {
  title: string;
  addressLine1: string;
  addressLine2?: string;
  meetingInfo: string;
  directionsHref: string;
};

const LocationCard = ({
  title,
  addressLine1,
  addressLine2,
  meetingInfo,
  directionsHref,
}: LocationCardProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-mel-blue900 to-mel-blue700 px-8 py-10 text-center text-primary-foreground">
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
          <MapPin className="h-5 w-5" aria-hidden />
        </div>

        <h3 className="mt-4 font-display text-[18px] font-semibold tracking-wide">{title}</h3>

        <p className="mt-4 text-[12px] leading-relaxed text-primary-foreground/90">
          {addressLine1}
          {addressLine2 ? (
            <>
              <br />
              {addressLine2}
            </>
          ) : null}
        </p>

        <p className="mt-3 text-[12px] text-primary-foreground/80">{meetingInfo}</p>

        <a
          href={directionsHref}
          className="mt-7 inline-flex h-12 min-w-[220px] items-center justify-center border border-primary-foreground/60 bg-transparent px-10 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-foreground transition-colors hover:bg-primary-foreground/10"
        >
          DIRECÇÕES
        </a>
      </div>
    </div>
  );
};

type SocialLinkProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

const SocialLink = ({ href, label, children }: SocialLinkProps) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-12 w-12 items-center justify-center border border-border bg-mel-overlay/85 text-primary-foreground transition-colors hover:bg-mel-overlay"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
};

export const SiteFooter = () => {
  return (
    <footer aria-label="Rodapé" className="bg-background">
      {/* Blocos azuis (como na referência) */}
      <section aria-label="Localizações" className="bg-background">
        <div className="grid gap-px bg-primary-foreground/15 md:grid-cols-2">
          <LocationCard
            title="Pontault Combault"
            addressLine1="15 Rue Jean Moulin 77340"
            meetingInfo="Reuniões domingos às 17:00"
            directionsHref="https://maps.google.com/?q=15%20Rue%20Jean%20Moulin%2077340"
          />

          <LocationCard
            title="Montereau-Fault-Yonne"
            addressLine1="33 Rue Leo Lagrange, 77130"
            meetingInfo="Reuniões sábados às 20:00"
            directionsHref="https://maps.google.com/?q=33%20Rue%20Leo%20Lagrange%2077130"
          />
        </div>
      </section>

      {/* Área branca de contactos + redes (como na imagem) */}
      <section aria-label="Contactos" className="bg-background">
        <div className="container grid gap-10 py-14 md:grid-cols-2 md:items-end">
          <div>
            <h3 className="font-display text-[18px] font-semibold text-foreground">Contacts</h3>

            <dl className="mt-6 space-y-4 text-sm text-muted-foreground">
              <div>
                <dt className="font-semibold text-foreground">Address:</dt>
                <dd className="mt-1">15 Rue Jean Moulin, Pontault Combault 77340</dd>
              </div>

              <div>
                <dt className="font-semibold text-foreground">Phone:</dt>
                <dd className="mt-1">+33 749548353</dd>
              </div>

              <div>
                <dt className="font-semibold text-foreground">Email:</dt>
                <dd className="mt-1">
                  <a className="font-semibold text-foreground underline-offset-4 hover:underline" href="mailto:missaoevangelicafrancesa@gmail.com">
                    missaoevangelicafrancesa@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex items-center justify-center gap-3 md:justify-end">
            <SocialLink href="#" label="Facebook">
              <Facebook className="h-5 w-5" aria-hidden />
            </SocialLink>
            <SocialLink href="#" label="Instagram">
              <Instagram className="h-5 w-5" aria-hidden />
            </SocialLink>
            <SocialLink href="#" label="YouTube">
              <Youtube className="h-5 w-5" aria-hidden />
            </SocialLink>
          </div>
        </div>
      </section>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-center text-sm text-muted-foreground md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} Missão Evangélica Lusitana.</p>
          <p className="text-xs">Texto em branco puro (#FFFFFF) e tons azuis institucionais.</p>
        </div>
      </div>
    </footer>
  );
};

