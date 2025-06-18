import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function UsuariosPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento de Usuários" description="Adicione, edite e gerencie os usuários do sistema.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Funcionalidade de gerenciamento de usuários ainda não implementada.</p>
          {/* Placeholder for user table */}
        </CardContent>
      </Card>
    </div>
  );
}
