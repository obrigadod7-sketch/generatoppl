import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

async function getCounts() {
  const [{ count: children }, { count: checkinsToday }, { count: eventsActive }] = await Promise.all([
    supabase.from("children").select("id", { count: "exact", head: true }),
    supabase
      .from("checkins")
      .select("id", { count: "exact", head: true })
      .gte("checked_in_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  return {
    children: children ?? 0,
    checkinsToday: checkinsToday ?? 0,
    eventsActive: eventsActive ?? 0,
  };
}

export default function KidsDashboardHome() {
  const q = useQuery({ queryKey: ["kids", "dashboard", "counts"], queryFn: getCounts });

  return (
    <div>
      <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Dashboard Geral</h1>
      <p className="mt-2 text-sm text-muted-foreground">Visão rápida do que está acontecendo hoje.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card className="p-6 shadow-elev ring-1 ring-border">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total de crianças</p>
          <p className="mt-3 font-display text-4xl">{q.data?.children ?? (q.isLoading ? "…" : 0)}</p>
        </Card>
        <Card className="p-6 shadow-elev ring-1 ring-border">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Check-ins do dia</p>
          <p className="mt-3 font-display text-4xl">{q.data?.checkinsToday ?? (q.isLoading ? "…" : 0)}</p>
        </Card>
        <Card className="p-6 shadow-elev ring-1 ring-border">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Eventos ativos</p>
          <p className="mt-3 font-display text-4xl">{q.data?.eventsActive ?? (q.isLoading ? "…" : 0)}</p>
        </Card>
      </div>
    </div>
  );
}
