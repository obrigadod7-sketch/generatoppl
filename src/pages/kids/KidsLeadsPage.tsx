import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader as THead, TableRow } from "@/components/ui/table";

type LeadRow = { id: string; created_at: string; name: string; email: string | null; phone: string | null; message: string | null };

async function listLeads(): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at, name, email, phone, message")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export default function KidsLeadsPage() {
  const q = useQuery({ queryKey: ["kids", "leads"], queryFn: listLeads });

  return (
    <div>
      <h1 className="font-display text-3xl uppercase tracking-[0.14em]">Leads</h1>
      <p className="mt-2 text-sm text-muted-foreground">Solicitações vindas do formulário público.</p>

      <Card className="mt-6 overflow-hidden shadow-elev ring-1 ring-border">
        <Table>
          <THead>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Mensagem</TableHead>
            </TableRow>
          </THead>
          <TableBody>
            {(q.data ?? []).map((l) => (
              <TableRow key={l.id}>
                <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                <TableCell className="font-semibold">{l.name}</TableCell>
                <TableCell className="text-sm">
                  <div>{l.email ?? "—"}</div>
                  <div className="text-muted-foreground">{l.phone ?? "—"}</div>
                </TableCell>
                <TableCell className="max-w-[520px] truncate">{l.message ?? "—"}</TableCell>
              </TableRow>
            ))}
            {!q.isLoading && (q.data?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Sem leads.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
