import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Radio, Video, BookOpen, HeartHandshake, MapPin } from "lucide-react";

const nav = [
  { href: "#ao-vivo", label: "Ao vivo", icon: Video },
  { href: "#estudo", label: "Estudo bíblico", icon: BookOpen },
  { href: "#oracao", label: "Oração", icon: HeartHandshake },
  { href: "#locais", label: "Locais", icon: MapPin },
  { href: "#", label: "Rádio", icon: Radio },
];

export function LusitanaHeader() {
  return (
    <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent shadow-sm">
            <span className="font-display text-lg">M</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-base leading-none">Missão Lusitana</p>
            <p className="mt-1 text-xs text-muted-foreground">França</p>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {nav.map((item) => (
            <Button key={item.label} asChild variant="ghost" className="font-semibold">
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="hero" className="hidden sm:inline-flex">
            <a href="#contato">Contato</a>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px]">
              <SheetHeader>
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-6 grid gap-2">
                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button key={item.label} asChild variant="soft" className="justify-start">
                      <a href={item.href}>
                        <Icon />
                        {item.label}
                      </a>
                    </Button>
                  );
                })}
                <Button asChild variant="hero" className="mt-2">
                  <a href="#contato">Contato</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
