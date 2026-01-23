import { Outlet } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { useHasAnyRole } from "@/hooks/useHasAnyRole";
import { supabase } from "@/integrations/supabase/client";

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    end={to === "/dashboard"}
    className="rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
    activeClassName="bg-accent text-accent-foreground"
  >
    {label}
  </NavLink>
);

export default function DashboardLayout() {
  const teamQ = useHasAnyRole(["admin", "leader", "volunteer"]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-[1250px] px-6 h-14 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Dashboard
            </p>
          </div>

          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Sair
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1250px] px-6 py-6 flex-1">
        <div className="flex items-start gap-6">
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl bg-card p-4 shadow-elev ring-1 ring-border">
              <nav className="grid gap-1">
                <NavItem to="/dashboard" label="Visão geral" />
                {teamQ.data ? (
                  <>
                    <NavItem to="/dashboard/membros" label="Membros" />
                    <NavItem to="/dashboard/kids" label="Kids" />
                    <NavItem to="/dashboard/aluno" label="Área do Aluno" />
                  </>
                ) : null}
              </nav>

              <div className="mt-4 pt-4 border-t border-border">
                <a
                  className="block rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                  href="/kids/dashboard"
                >
                  Abrir Kids (rota antiga)
                </a>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
