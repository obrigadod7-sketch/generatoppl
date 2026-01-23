import { Link, NavLink, Outlet } from "react-router-dom";
import { ElementorHeader } from "@/components/site/ElementorHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type KidsDashboardLayoutProps = {
  /** Base path for internal nav links. Defaults to /kids/dashboard. */
  basePath?: string;
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
      ].join(" ")
    }
  >
    {label}
  </NavLink>
);

export default function KidsDashboardLayout({ basePath = "/kids/dashboard" }: KidsDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ElementorHeader />

      <div className="mx-auto w-full max-w-[1250px] px-6 py-6 flex-1">
        <div className="flex items-start gap-6">
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl bg-card p-4 shadow-elev ring-1 ring-border">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Dashboard
              </p>

              <div className="mt-3 rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">
                  Novo painel unificado (equipe) com o <strong>Assistente da Igreja</strong>.
                </p>
                <div className="mt-2">
                  <Button asChild size="sm" className="w-full">
                    <Link to="/dashboard">Abrir /dashboard</Link>
                  </Button>
                </div>
              </div>

              <nav className="mt-3 grid gap-1">
                <NavItem to={`${basePath}`} label="Visão geral" />
                <NavItem to={`${basePath}/criancas`} label="Crianças & Famílias" />
                <NavItem to={`${basePath}/checkin`} label="Check-in / Check-out" />
                <NavItem to={`${basePath}/eventos`} label="Eventos" />
                <NavItem to={`${basePath}/leads`} label="Leads" />
              </nav>

              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                >
                  Sair
                </Button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-elev lg:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Novo painel unificado</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    O Assistente da Igreja fica no <strong>/dashboard</strong>.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to="/dashboard">Abrir /dashboard</Link>
                </Button>
              </div>
            </div>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
