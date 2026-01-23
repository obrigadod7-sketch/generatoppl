import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardAluno() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl">rea do Aluno</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Espao para a equipe organizar lies/atividades (MVP).
        </p>
      </header>

      <Card className="shadow-elev">
        <CardHeader>
          <CardTitle>Lições / Contedos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Me diga como voc quer cadastrar as lies (texto, PDF, vdo, links) e eu monto o cadastro + listagem aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
