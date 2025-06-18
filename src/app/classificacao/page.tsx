
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Classificacao } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const placeholderClassificacoes: Classificacao[] = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis", tabelaTemporalidade: "TTD-01", prazoGuardaFaseCorrente: "5 anos", prazoGuardaFaseIntermediaria: "15 anos", destinacaoFinal: "Guarda Permanente" },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas", tabelaTemporalidade: "TTD-02", prazoGuardaFaseCorrente: "2 anos", prazoGuardaFaseIntermediaria: "3 anos", destinacaoFinal: "Eliminação" },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais", tabelaTemporalidade: "TTD-01", prazoGuardaFaseCorrente: "1 ano", prazoGuardaFaseIntermediaria: "Permanente", destinacaoFinal: "Guarda Permanente" },
];

const destinacaoFinalPadrao = ["Eliminação", "Guarda Permanente"];

export default function ClassificacaoPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedDestinacao, setSelectedDestinacao] = React.useState<string>("");
  const [outraDestinacao, setOutraDestinacao] = React.useState<string>("");

  const handleSaveChanges = () => {
    // Lógica para salvar os dados da nova classificação será implementada aqui
    const destinacaoFinal = selectedDestinacao === "Outro" ? outraDestinacao : selectedDestinacao;
    console.log("Salvando nova classificação com destinação:", destinacaoFinal);
    // Adicionar aqui a lógica para coletar todos os campos do formulário
    setIsDialogOpen(false);
    setSelectedDestinacao("");
    setOutraDestinacao("");
  };


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classificação" description="Gerencie os códigos de classificação de assuntos dos documentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setSelectedDestinacao("");
            setOutraDestinacao("");
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Classificação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">Nova Classificação</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para cadastrar uma nova classificação. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigoClassificacao" className="text-right">
                  Código*
                </Label>
                <Input id="codigoClassificacao" placeholder="Ex: 020.1" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricaoClassificacao" className="text-right">
                  Descrição*
                </Label>
                <Input id="descricaoClassificacao" placeholder="Ex: Processos Judiciais Cíveis" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tabelaTemporalidade" className="text-right">
                  Tab. Temp.
                </Label>
                <Input id="tabelaTemporalidade" placeholder="Ex: TTD-01" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prazoCorrente" className="text-right">
                  P. Corrente
                </Label>
                <Input id="prazoCorrente" placeholder="Ex: 5 anos" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prazoIntermediaria" className="text-right">
                  P. Intermed.
                </Label>
                <Input id="prazoIntermediaria" placeholder="Ex: 15 anos" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="destinacaoFinal" className="text-right">
                  Destinação*
                </Label>
                <Select onValueChange={setSelectedDestinacao} value={selectedDestinacao}>
                  <SelectTrigger id="destinacaoFinal" className="col-span-3">
                    <SelectValue placeholder="Selecione a destinação" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinacaoFinalPadrao.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                    <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedDestinacao === "Outro" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="outraDestinacao" className="text-right">
                    Espec. Dest.*
                  </Label>
                  <Input
                    id="outraDestinacao"
                    placeholder="Digite a nova destinação"
                    className="col-span-3"
                    value={outraDestinacao}
                    onChange={(e) => setOutraDestinacao(e.target.value)}
                  />
                </div>
              )}
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoesClassificacao" className="text-right">
                  Observações
                </Label>
                <Textarea id="observacoesClassificacao" placeholder="Detalhes adicionais sobre a classificação" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Classificação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
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
