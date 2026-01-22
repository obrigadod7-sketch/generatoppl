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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader as THead, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

type ChildRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  birth_date: string | null;
  allergies: string | null;
  notes: string | null;
  active: boolean;
};

async function listChildren(): Promise<ChildRow[]> {
  const { data, error } = await supabase
    .from("children")
    .select("id, first_name, last_name, birth_date, allergies, notes, active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

type ChildCreate = {
  first_name: string;
  last_name?: string;
  birth_date?: string;
  allergies?: string;
  notes?: string;
};

export default function KidsChildrenPage() {
  const [open, setOpen] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        first_name: z.string().trim().min(1, "Nome é obrigatório").max(120),
        last_name: z.string().trim().max(120).optional().or(z.literal("")),
        birth_date: z.string().trim().optional().or(z.literal("")),
        allergies: z.string().trim().max(2000).optional().or(z.literal("")),
        notes: z.string().trim().max(4000).optional().or(z.literal("")),
      }),
    [],
  );

  const q = useQuery({ queryKey: ["kids", "children"], queryFn: listChildren });

  const form = useForm<ChildCreate>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: "", last_name: "", birth_date: "", allergies: "", notes: "" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Crianças & Famílias</h1>
          <p className="mt-2 text-sm text-muted-foreground">CRUD básico de crianças (famílias entra em seguida).</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">Cadastrar criança</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar criança</DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  const { error } = await supabase.from("children").insert({
                    first_name: values.first_name,
                    last_name: values.last_name || null,
                    birth_date: values.birth_date ? values.birth_date : null,
                    allergies: values.allergies || null,
                    notes: values.notes || null,
                    // church_id será preenchido pelo usuário no dashboard (próximo passo); por ora admin pode gerenciar globalmente.
                  });
                  if (error) throw error;
                  toast({ title: "Criança cadastrada" });
                  setOpen(false);
                  form.reset();
                  q.refetch();
                } catch (e: any) {
                  toast({ title: "Erro ao cadastrar", description: e?.message ?? "Tente novamente.", variant: "destructive" });
                }
              })}
            >
              <div className="grid gap-2">
                <Label htmlFor="first_name">Nome</Label>
                <Input id="first_name" {...form.register("first_name")} />
                {form.formState.errors.first_name ? (
                  <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input id="last_name" {...form.register("last_name")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input id="birth_date" type="date" {...form.register("birth_date")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea id="allergies" rows={3} {...form.register("allergies")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
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
              <TableHead>Nome</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>Alergias</TableHead>
            </TableRow>
          </THead>
          <TableBody>
            {(q.data ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">
                  {c.first_name}
                  {c.last_name ? ` ${c.last_name}` : ""}
                </TableCell>
                <TableCell>{c.birth_date ?? "—"}</TableCell>
                <TableCell className="max-w-[420px] truncate">{c.allergies ?? "—"}</TableCell>
              </TableRow>
            ))}
            {!q.isLoading && (q.data?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Nenhuma criança cadastrada.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
