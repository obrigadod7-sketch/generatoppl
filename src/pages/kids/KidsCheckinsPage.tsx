import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeCanvas } from "qrcode.react";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type ChildOption = { id: string; first_name: string; last_name: string | null };
type CheckinRow = { id: string; child_id: string; status: string; checked_in_at: string; checked_out_at: string | null };

async function listChildrenOptions(): Promise<ChildOption[]> {
  const { data, error } = await supabase
    .from("children")
    .select("id, first_name, last_name")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

async function listTodayCheckins(): Promise<CheckinRow[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("checkins")
    .select("id, child_id, status, checked_in_at, checked_out_at")
    .gte("checked_in_at", start.toISOString())
    .order("checked_in_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

type CreateCheckin = { child_id: string };

export default function KidsCheckinsPage() {
  const [openQR, setOpenQR] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");

  const childrenQ = useQuery({ queryKey: ["kids", "checkins", "children"], queryFn: listChildrenOptions });
  const todayQ = useQuery({ queryKey: ["kids", "checkins", "today"], queryFn: listTodayCheckins });

  const schema = useMemo(() => z.object({ child_id: z.string().uuid("Selecione uma criança") }), []);
  const form = useForm<CreateCheckin>({ resolver: zodResolver(schema), defaultValues: { child_id: "" } });

  const selected = childrenQ.data?.find((c) => c.id === form.watch("child_id"));

  return (
    <div>
      <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Check-in / Check-out</h1>
      <p className="mt-2 text-sm text-muted-foreground">Fluxo inicial com QR (impressão simples em seguida).</p>

      <Card className="mt-6 p-6 shadow-elev ring-1 ring-border">
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const { data, error } = await supabase
                .from("checkins")
                .insert({ child_id: values.child_id, status: "checked_in" })
                .select("id")
                .maybeSingle();
              if (error) throw error;

              toast({ title: "Check-in registrado" });
              todayQ.refetch();

              // QR básico: aponta para uma URL com o checkinId (o handler completo vem no próximo passo)
              const url = `${window.location.origin}/kids/dashboard/checkin?checkinId=${data?.id}`;
              setQrValue(url);
              setOpenQR(true);
            } catch (e: any) {
              toast({ title: "Erro no check-in", description: e?.message ?? "Tente novamente.", variant: "destructive" });
            }
          })}
        >
          <div className="grid gap-2">
            <Label htmlFor="child_id">Criança</Label>
            <select
              id="child_id"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.watch("child_id")}
              onChange={(e) => form.setValue("child_id", e.target.value, { shouldValidate: true })}
            >
              <option value="">Selecione…</option>
              {(childrenQ.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name}
                  {c.last_name ? ` ${c.last_name}` : ""}
                </option>
              ))}
            </select>
            {form.formState.errors.child_id ? (
              <p className="text-xs text-destructive">{form.formState.errors.child_id.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" variant="hero">Registrar check-in</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!selected) {
                  toast({ title: "Selecione uma criança" });
                  return;
                }
                setQrValue(`${selected.first_name}${selected.last_name ? ` ${selected.last_name}` : ""}`);
                setOpenQR(true);
              }}
            >
              Ver QR (preview)
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 p-6 shadow-elev ring-1 ring-border">
        <h2 className="font-display text-lg uppercase tracking-[0.12em]">Check-ins do dia</h2>
        <div className="mt-4 grid gap-2">
          {(todayQ.data ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{r.child_id}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.checked_in_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{r.status}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from("checkins")
                        .update({ status: "checked_out", checked_out_at: new Date().toISOString() })
                        .eq("id", r.id);
                      if (error) throw error;
                      toast({ title: "Check-out registrado" });
                      todayQ.refetch();
                    } catch (e: any) {
                      toast({ title: "Erro", description: e?.message ?? "Tente novamente.", variant: "destructive" });
                    }
                  }}
                >
                  Check-out
                </Button>
              </div>
            </div>
          ))}
          {!todayQ.isLoading && (todayQ.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum check-in hoje.</p>
          ) : null}
        </div>
      </Card>

      <Dialog open={openQR} onOpenChange={setOpenQR}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="grid place-items-center gap-3 py-2">
            <QRCodeCanvas value={qrValue || "-"} size={220} />
            <Input readOnly value={qrValue} />
            <Button
              variant="outline"
              onClick={() => {
                window.print();
              }}
            >
              Imprimir (simples)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
