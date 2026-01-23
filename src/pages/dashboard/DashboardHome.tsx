import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesso rápido às áreas do sistema.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Assistente da Igreja</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chat para apoiar a equipe com organização, comunicação e cuidado pastoral.
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard/assistant"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-elev"
              >
                Abrir Assistente
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Kids</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gerencie crianças, check-ins e eventos.</p>
            <div className="mt-4">
              <Link
                to="/dashboard/kids"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-elev"
              >
                Abrir Kids
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Área do Aluno</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conteúdos e lições para a equipe do ministério infantil.
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard/aluno"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-elev"
              >
                Abrir Área do Aluno
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
