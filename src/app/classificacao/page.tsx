import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Classificacao } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const placeholderClassificacoes: Classificacao[] = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis", tabelaTemporalidade: "TTD-01", prazoGuardaFaseCorrente: "5 anos", prazoGuardaFaseIntermediaria: "15 anos", destinacaoFinal: "Guarda Permanente" },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas", tabelaTemporalidade: "TTD-02", prazoGuardaFaseCorrente: "2 anos", prazoGuardaFaseIntermediaria: "3 anos", destinacaoFinal: "Eliminação" },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais", tabelaTemporalidade: "TTD-01", prazoGuardaFaseCorrente: "1 ano", prazoGuardaFaseIntermediaria: "Permanente", destinacaoFinal: "Guarda Permanente" },
];

export default function ClassificacaoPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classificação" description="Gerencie os códigos de classificação de assuntos dos documentos.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Classificação
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Classificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Destinação Final</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderClassificacoes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>{item.destinacaoFinal}</TableCell>
                  <TableCell className="text-right">
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
