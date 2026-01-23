import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

type MemberStatus = "active" | "inactive";

type MemberRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  ministry: string | null;
  participation: string | null;
  status: MemberStatus;
  notes: string | null;
  created_at: string;
};

const memberCreateSchema = z.object({
  first_name: z.string().trim().min(1, "Informe o nome").max(120),
  last_name: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  birth_date: z.string().trim().optional().or(z.literal("")),
  ministry: z.string().trim().max(120).optional().or(z.literal("")),
  participation: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type MemberCreateValues = z.infer<typeof memberCreateSchema>;

function formatName(m: Pick<MemberRow, "first_name" | "last_name">) {
  return [m.first_name, m.last_name].filter(Boolean).join(" ");
}

function dateFromAgeYears(age: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d;
}

function toIsoDateOnly(d: Date) {
  // yyyy-mm-dd
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DashboardMembers() {
  const qc = useQueryClient();

  const [filters, setFilters] = React.useState({
    ministry: "",
    participation: "",
    status: "all" as "all" | MemberStatus,
    ageMin: "",
    ageMax: "",
  });

  const form = useForm<MemberCreateValues>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      birth_date: "",
      ministry: "",
      participation: "",
      status: "active",
      notes: "",
    },
  });

  const membersQ = useQuery({
    queryKey: ["dashboard", "members", filters],
    queryFn: async () => {
      // `members` is not in the generated typed schema file yet.
      let q = (supabase as any)
        .from("members")
        .select(
          "id,first_name,last_name,phone,email,birth_date,ministry,participation,status,notes,created_at",
        )
        .order("created_at", { ascending: false });

      const ministry = filters.ministry.trim();
      const participation = filters.participation.trim();
      if (ministry) q = q.ilike("ministry", `%${ministry}%`);
      if (participation) q = q.ilike("participation", `%${participation}%`);
      if (filters.status !== "all") q = q.eq("status", filters.status);

      const ageMin = Number(filters.ageMin);
      const ageMax = Number(filters.ageMax);
      // Age filter is translated to birth_date ranges.
      // ageMin => birth_date <= today - ageMin years
      // ageMax => birth_date >= today - ageMax years
      if (Number.isFinite(ageMin) && ageMin > 0) {
        q = q.lte("birth_date", toIsoDateOnly(dateFromAgeYears(ageMin)));
      }
      if (Number.isFinite(ageMax) && ageMax > 0) {
        q = q.gte("birth_date", toIsoDateOnly(dateFromAgeYears(ageMax)));
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as MemberRow[];
    },
  });

  const onCreate = async (values: MemberCreateValues) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        toast({ title: "Faça login para continuar", variant: "destructive" });
        return;
      }

      const payload: any = {
        created_by: userId,
        first_name: values.first_name.trim(),
        last_name: values.last_name?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        birth_date: values.birth_date?.trim() || null,
        ministry: values.ministry?.trim() || null,
        participation: values.participation?.trim() || null,
        status: values.status,
        notes: values.notes?.trim() || null,
      };

      const { error } = await (supabase as any).from("members").insert(payload);
      if (error) throw error;

      toast({ title: "Membro cadastrado" });
      form.reset({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        birth_date: "",
        ministry: "",
        participation: "",
        status: "active",
        notes: "",
      });
      await qc.invalidateQueries({ queryKey: ["dashboard", "members"] });
    } catch (e: any) {
      toast({ title: "Não foi possível cadastrar", description: e?.message ?? "Tente novamente.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl">Gestão de membros</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre membros e filtre por ministério, idade, status e participação.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Cadastrar membro</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onCreate)}>
              <div className="grid gap-2">
                <Label htmlFor="first_name">Nome *</Label>
                <Input id="first_name" {...form.register("first_name")} />
                {form.formState.errors.first_name ? (
                  <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input id="last_name" {...form.register("last_name")} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" {...form.register("phone")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="birth_date">Data de nascimento</Label>
                  <Input id="birth_date" type="date" {...form.register("birth_date")} />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(v) => form.setValue("status", v as MemberStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="ministry">Ministério</Label>
                  <Input id="ministry" {...form.register("ministry")} placeholder="Ex: Louvor" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="participation">Participação</Label>
                  <Input id="participation" {...form.register("participation")} placeholder="Ex: Culto dominical" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" rows={4} {...form.register("notes")} />
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Cadastrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Lista de membros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label>Ministério</Label>
                <Input
                  value={filters.ministry}
                  onChange={(e) => setFilters((p) => ({ ...p, ministry: e.target.value }))}
                  placeholder="Ex: Louvor"
                />
              </div>
              <div className="grid gap-2">
                <Label>Participação</Label>
                <Input
                  value={filters.participation}
                  onChange={(e) => setFilters((p) => ({ ...p, participation: e.target.value }))}
                  placeholder="Ex: Pequeno grupo"
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(v) => setFilters((p) => ({ ...p, status: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Idade (min / max)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    inputMode="numeric"
                    placeholder="min"
                    value={filters.ageMin}
                    onChange={(e) => setFilters((p) => ({ ...p, ageMin: e.target.value }))}
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="max"
                    value={filters.ageMax}
                    onChange={(e) => setFilters((p) => ({ ...p, ageMax: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {membersQ.data ? `${membersQ.data.length} membro(s)` : "Carregando..."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ministry: "", participation: "", status: "all", ageMin: "", ageMax: "" })}
              >
                Limpar filtros
              </Button>
            </div>

            <Separator />

            {membersQ.isError ? (
              <p className="text-sm text-destructive">Não foi possível carregar membros.</p>
            ) : membersQ.data && membersQ.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum membro cadastrado com esses filtros.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ministério</TableHead>
                    <TableHead>Participação</TableHead>
                    <TableHead>Contato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(membersQ.data ?? []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-semibold">{formatName(m)}</TableCell>
                      <TableCell>{m.status === "active" ? "Ativo" : "Inativo"}</TableCell>
                      <TableCell>{m.ministry || "—"}</TableCell>
                      <TableCell>{m.participation || "—"}</TableCell>
                      <TableCell>
                        <div className="grid">
                          <span className="text-sm">{m.phone || "—"}</span>
                          <span className="text-xs text-muted-foreground">{m.email || ""}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
