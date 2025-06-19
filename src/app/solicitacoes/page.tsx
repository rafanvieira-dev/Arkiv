
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Solicitacao } from "@/types";
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const placeholderSolicitacoes: Solicitacao[] = [
  { id: "SOL001", numeroSolicitacao: "SOL-2024-001", nomeSolicitante: "João Silva", dataSolicitacao: new Date("2024-03-01").toISOString(), documentoIds: ["DOC001"], status: "Pendente" },
  { id: "SOL002", numeroSolicitacao: "SOL-2024-002", nomeSolicitante: "Maria Oliveira", dataSolicitacao: new Date("2024-03-05").toISOString(), dataAtendimento: new Date("2024-03-06").toISOString(), documentoIds: ["DOC002"], status: "Atendida" },
  { id: "SOL003", numeroSolicitacao: "SOL-2024-003", nomeSolicitante: "Carlos Pereira", dataSolicitacao: new Date("2024-03-10").toISOString(), dataAtendimento: new Date("2024-03-11").toISOString(), dataDevolucao: new Date("2024-03-20").toISOString(), documentoIds: ["DOC003"], status: "Devolvido" },
];

export default function SolicitacoesPage() {
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  // For this page, displayedItems is the same as placeholderSolicitacoes as there's no filtering/sorting yet.
  const displayedItems = placeholderSolicitacoes;

  const numDisplayed = displayedItems.length;
  const numSelected = selectedRowIds.length;
  
  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento de Solicitações" description="Cadastre e acompanhe empréstimos e desarquivamentos.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      numDisplayed > 0 && numSelected === numDisplayed
                        ? true
                        : numSelected > 0 ? 'indeterminate' : false
                    }
                    onCheckedChange={(value) => {
                      if (value === true) {
                        setSelectedRowIds(displayedItems.map(item => item.id));
                      } else {
                        setSelectedRowIds([]);
                      }
                    }}
                    aria-label="Selecionar todas as linhas"
                  />
                </TableHead>
                <TableHead>Nº Solicitação</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data Solicitação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedItems.map((item) => (
                <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRowIds.includes(item.id)}
                      onCheckedChange={(value) => {
                        setSelectedRowIds(prev =>
                          value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                        );
                      }}
                      aria-label={`Selecionar solicitação ${item.numeroSolicitacao}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.numeroSolicitacao}</TableCell>
                  <TableCell>{item.nomeSolicitante}</TableCell>
                  <TableCell>{format(new Date(item.dataSolicitacao), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.status === 'Pendente' ? 'default' :
                        item.status === 'Atendida' ? 'secondary' :
                        item.status === 'Devolvido' ? 'outline' : 'destructive'
                      }
                      className={
                        item.status === 'Pendente' ? 'bg-yellow-500 text-white' :
                        item.status === 'Atendida' ? 'bg-green-500 text-white' :
                        item.status === 'Devolvido' ? 'bg-blue-500 text-white' : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'Pendente' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Atender Solicitação" className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Atender Solicitação</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                     {item.status === 'Atendida' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Registrar Devolução" className="text-blue-600 hover:text-blue-700">
                            <CheckCircle className="h-4 w-4" /> {/* Icon can be changed */}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Registrar Devolução</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Editar Solicitação">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar Solicitação</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Solicitação">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir Solicitação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {displayedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma solicitação encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
