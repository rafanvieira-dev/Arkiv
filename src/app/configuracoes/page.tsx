import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Configurações do Sistema" description="Ajuste as configurações gerais do ArquivoCentral." />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Configurações Gerais</CardTitle>
          <CardDescription>Ajustes básicos do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Nome da Aplicação</Label>
            <Input id="appName" defaultValue="ArquivoCentral" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email do Administrador</Label>
            <Input id="adminEmail" type="email" placeholder="admin@example.com" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="retentionPolicy">Política de Retenção Padrão (Anos)</Label>
            <Input id="retentionPolicy" type="number" defaultValue="5" />
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Backup e Restauração</CardTitle>
           <CardDescription>Gerencie backups do banco de dados e arquivos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">Opções de backup e restauração ainda não implementadas.</p>
           <Button variant="outline">Iniciar Backup Manual</Button>
        </CardContent>
      </Card>
    </div>
  );
}
