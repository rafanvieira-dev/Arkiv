
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ListagemEliminacao } from "@/types";
import { PlusCircle, Edit, Trash2, FileSearch } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const placeholderListagens: ListagemEliminacao[] = [
  { id: "LE001", numeroListagem: "LE-2023-001", documentoIds: ["DOC001", "DOC003"], numeroEditalCiencia: "EDITAL-005/2023", dataPublicacaoEdital: new Date("2023-10-15").toISOString(), dataProducaoListagem: new Date("2023-09-30").toISOString(), numeroTermoEliminacao: "TE-2023-001" },
  { id: "LE002", numeroListagem: "LE-2024-001", documentoIds: ["DOC00X", "DOC00Y"], dataProducaoListagem: new Date("2024-02-10").toISOString() },
];

export default function ListagensEliminacaoPage() {
  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Listagens de Eliminação" description="Gerencie as listagens de eliminação de documentos.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Listagem
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Listagens Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Listagem</TableHead>
                <TableHead>Data Produção</TableHead>
                <TableHead>Nº Edital</TableHead>
                <TableHead>Nº Termo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderListagens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.numeroListagem}</TableCell>
                  <TableCell>{format(new Date(item.dataProducaoListagem), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{item.numeroEditalCiencia || "N/A"}</TableCell>
                  <TableCell>{item.numeroTermoEliminacao || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Ver Detalhes da Listagem">
                          <FileSearch className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver Detalhes da Listagem</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Editar Listagem">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar Listagem</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Listagem">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir Listagem</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
