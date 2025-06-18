
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ClasseJudicial } from "@/types";
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

const placeholderClassesJudiciais: ClasseJudicial[] = [
  { id: "CJ001", codigo: "1116", descricao: "Procedimento Comum Cível", tabelaTemporalidade: "TPU-CNJ", prazoGuarda: "Até 2 anos do trânsito em julgado ou baixa definitiva." },
  { id: "CJ002", codigo: "22", descricao: "Ação Penal - Procedimento Ordinário", tabelaTemporalidade: "TPU-CNJ", prazoGuarda: "Até a extinção da punibilidade." },
  { id: "CJ003", codigo: "12078", descricao: "Cumprimento de Sentença", tabelaTemporalidade: "TPU-CNJ", prazoGuarda: "Até 2 anos após o cumprimento integral." },
];

const initialFormState = {
  codigo: "",
  descricao: "",
  tabelaTemporalidade: "",
  prazoGuarda: "",
  observacoes: "",
};

export default function ClassesJudiciaisPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormState(initialFormState);
  };

  const handleSaveChanges = () => {
    // Lógica para salvar nova classe judicial (será implementada futuramente)
    console.log("Salvando nova classe judicial:", formState);
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classes Judiciais" description="Gerencie os códigos de classe judicial dos documentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Classe Judicial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">Nova Classe Judicial</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigo" className="text-right">
                  Código*
                </Label>
                <Input id="codigo" value={formState.codigo} onChange={handleInputChange} placeholder="Ex: 1116" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Descrição*
                </Label>
                <Input id="descricao" value={formState.descricao} onChange={handleInputChange} placeholder="Ex: Procedimento Comum Cível" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tabelaTemporalidade" className="text-right">
                  Tab. Temp.
                </Label>
                <Input id="tabelaTemporalidade" value={formState.tabelaTemporalidade} onChange={handleInputChange} placeholder="Ex: TPU-CNJ" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prazoGuarda" className="text-right">
                  Prazo Guarda
                </Label>
                <Input id="prazoGuarda" value={formState.prazoGuarda} onChange={handleInputChange} placeholder="Ex: Até 2 anos..." className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoes" className="text-right">
                  Observações
                </Label>
                <Textarea id="observacoes" value={formState.observacoes} onChange={handleInputChange} placeholder="Detalhes adicionais" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Classe Judicial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
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
