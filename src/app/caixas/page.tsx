import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Caixa } from "@/types";
import { PlusCircle, Edit, Trash2, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderCaixas: Caixa[] = [
  { id: "CX001", codigoCaixa: "CX-A-001", tipo: "Caixa Arquivo", status: "Lacrada", localizacao: "Estante 1, Prateleira A", situacao: "Ativa", documentoIds: ["DOC001", "DOC003"] },
  { id: "CX002", codigoCaixa: "CX-B-015", tipo: "Caixa Arquivo", status: "Fechada", localizacao: "Estante 2, Prateleira C", situacao: "Ativa", documentoIds: ["DOC002"] },
  { id: "CX003", codigoCaixa: "PST-X-007", tipo: "Pasta", status: "Aberta", localizacao: "Arquivo Corrente", situacao: "Ativa" },
];

export default function CaixasPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Caixas" description="Gerencie os dados das caixas que armazenam os documentos.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Caixa
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Caixas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderCaixas.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigoCaixa}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.localizacao}</TableCell>
                  <TableCell><Badge variant={item.status === 'Lacrada' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                  <TableCell>{item.documentoIds?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Ver Documentos">
                      <PackageOpen className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
