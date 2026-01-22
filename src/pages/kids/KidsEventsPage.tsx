import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader as THead, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

type EventRow = { id: string; title: string; starts_at: string | null; active: boolean };

async function listEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase.from("events").select("id, title, starts_at, active").order("created_at", {
    ascending: false,
  });
  if (error) throw error;
  return data ?? [];
}

type EventCreate = { title: string; starts_at?: string };

export default function KidsEventsPage() {
  const [open, setOpen] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(2, "Título é obrigatório").max(200),
        starts_at: z.string().trim().optional().or(z.literal("")),
      }),
    [],
  );
  const q = useQuery({ queryKey: ["kids", "events"], queryFn: listEvents });
  const form = useForm<EventCreate>({ resolver: zodResolver(schema), defaultValues: { title: "", starts_at: "" } });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Eventos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Crie e gerencie programações.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">Criar evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo evento</DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  const { error } = await supabase.from("events").insert({
                    title: values.title,
                    starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
                    active: true,
                  });
                  if (error) throw error;
                  toast({ title: "Evento criado" });
                  setOpen(false);
                  form.reset();
                  q.refetch();
                } catch (e: any) {
                  toast({ title: "Erro", description: e?.message ?? "Tente novamente.", variant: "destructive" });
                }
              })}
            >
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title ? (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="starts_at">Início (opcional)</Label>
                <Input id="starts_at" type="datetime-local" {...form.register("starts_at")} />
              </div>
              <Button type="submit">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-6 overflow-hidden shadow-elev ring-1 ring-border">
        <Table>
          <THead>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </THead>
          <TableBody>
            {(q.data ?? []).map((ev) => (
              <TableRow key={ev.id}>
                <TableCell className="font-semibold">{ev.title}</TableCell>
                <TableCell>{ev.starts_at ? new Date(ev.starts_at).toLocaleString() : "—"}</TableCell>
                <TableCell>{ev.active ? "Ativo" : "Inativo"}</TableCell>
              </TableRow>
            ))}
            {!q.isLoading && (q.data?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Nenhum evento criado.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
