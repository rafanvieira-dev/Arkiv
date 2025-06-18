import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ClasseJudicial } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const placeholderClassesJudiciais: ClasseJudicial[] = [
  { id: "CJ001", codigo: "1116", descricao: "Procedimento Comum Cível", tabelaTemporalidade: "TPU-CNJ", prazoGuarda: "Até 2 anos do trânsito em julgado ou baixa definitiva." },
  { id: "CJ002", codigo: "22", descricao: "Ação Penal - Procedimento Ordinário", tabelaTemporalidade: "TPU-CNJ", prazoGuarda: "Até a extinção da punibilidade." },
  { id: "CJ003", codigo: "12078", descricao: "Cumprimento de Sentença", tabelaTemporalidade: "TPU-CNJ", prazoGuarda: "Até 2 anos após o cumprimento integral." },
];

export default function ClassesJudiciaisPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classes Judiciais" description="Gerencie os códigos de classe judicial dos documentos.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Classe Judicial
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Classes Judiciais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Prazo de Guarda</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderClassesJudiciais.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>{item.prazoGuarda}</TableCell>
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
