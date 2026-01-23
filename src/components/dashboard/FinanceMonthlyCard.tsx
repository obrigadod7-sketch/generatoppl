import * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatMonthPtBR(d: Date) {
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

async function fetchMonthlyTotals(monthStart: Date) {
  const month = monthStart.toISOString().slice(0, 10);
  const { data, error } = await (supabase as any)
    .from("finance_monthly")
    .select("month,tithes,offerings,donations,expenses,notes")
    .eq("month", month)
    .maybeSingle();

  if (error) throw error;
  return data as
    | {
        month: string;
        tithes: number | string;
        offerings: number | string;
        donations: number | string;
        expenses: number | string;
        notes: string | null;
      }
    | null;
}

export function FinanceMonthlyCard() {
  const [monthStart, setMonthStart] = React.useState<Date>(() => startOfMonth(new Date()));

  const q = useQuery({
    queryKey: ["finance", "monthly", monthStart.toISOString().slice(0, 10)],
    queryFn: () => fetchMonthlyTotals(monthStart),
  });

  const totals = q.data;
  const tithes = totals ? Number(totals.tithes ?? 0) : 0;
  const offerings = totals ? Number(totals.offerings ?? 0) : 0;
  const donations = totals ? Number(totals.donations ?? 0) : 0;
  const expenses = totals ? Number(totals.expenses ?? 0) : 0;
  const income = tithes + offerings + donations;
  const balance = income - expenses;

  return (
    <Card className="shadow-elev">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Financeiro</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Resumo mensal (dízimos, ofertas, doações e despesas).
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 justify-start gap-2 px-3 text-left font-normal",
                  !monthStart && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="capitalize">{formatMonthPtBR(monthStart)}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={monthStart}
                onSelect={(d) => {
                  if (!d) return;
                  setMonthStart(startOfMonth(d));
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent>
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : q.isError ? (
          <div className="text-sm text-destructive">Não foi possível carregar o resumo.</div>
        ) : !totals ? (
          <div className="text-sm text-muted-foreground">Sem dados para este mês.</div>
        ) : (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Entradas
                </p>
                <p className="mt-1 font-display text-lg">{formatBRL(income)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dízimos {formatBRL(tithes)} · Ofertas {formatBRL(offerings)} · Doações {formatBRL(donations)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Despesas
                </p>
                <p className="mt-1 font-display text-lg">{formatBRL(expenses)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Total de despesas do mês</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Saldo
                </p>
                <p className="font-display text-lg">{formatBRL(balance)}</p>
              </div>
              {totals.notes ? (
                <p className="mt-2 text-sm text-muted-foreground">{totals.notes}</p>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
