
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ClasseJudicial } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox"; // Renamed to avoid conflict
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

const placeholderClassesJudiciais: ClasseJudicial[] = [
  { id: "CJ001", codigo: "1116", descricao: "Procedimento Comum Cível", prazoGuardaAnos: 2, destinacaoFinal: "Eliminação", inativo: false, observacoes: "Revisar após decisão do CNJ." },
  { id: "CJ002", codigo: "22", descricao: "Ação Penal - Procedimento Ordinário", prazoGuardaAnos: 5, destinacaoFinal: "Guarda Permanente", inativo: false },
  { id: "CJ003", codigo: "12078", descricao: "Cumprimento de Sentença", prazoGuardaAnos: 0, destinacaoFinal: "Vide Guia de Aplicação", inativo: true, observacoes: "Arquivar processo principal junto." },
  { id: "CJ004", codigo: "99", descricao: "Carta Precatória Cível", destinacaoFinal: "Não se Aplica", inativo: false },
];

const initialFormState: Omit<ClasseJudicial, 'id'> = {
  codigo: "",
  descricao: "",
  prazoGuardaAnos: undefined, 
  destinacaoFinal: "Não se Aplica", 
  observacoes: "",
  inativo: false,
};

const CLASSES_JUDICIAIS_STORAGE_KEY = 'arquivocentral_classes_judiciais';

export default function ClassesJudiciaisPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState(initialFormState);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [classesJudiciais, setClassesJudiciais] = React.useState<ClasseJudicial[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CLASSES_JUDICIAIS_STORAGE_KEY);
      setClassesJudiciais(stored ? JSON.parse(stored) : placeholderClassesJudiciais);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setClassesJudiciais(placeholderClassesJudiciais);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
      if (isDataLoaded) {
        try {
          window.localStorage.setItem(CLASSES_JUDICIAIS_STORAGE_KEY, JSON.stringify(classesJudiciais));
        } catch (error) {
          console.error("Failed to write to localStorage:", error);
        }
      }
  }, [classesJudiciais, isDataLoaded]);
  
  const displayedItems = classesJudiciais; 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value === "" ? undefined : parseInt(value, 10) }));
  };
  
  const handleSelectChange = (value: ClasseJudicial['destinacaoFinal']) => {
    setFormState(prev => ({ ...prev, destinacaoFinal: value }));
  };

  const handleFormCheckboxChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, inativo: checked }));
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setIsEditing(false);
    setEditingId(null);
  };
  
  const handleOpenDialog = (item?: ClasseJudicial) => {
    if (item) {
        setIsEditing(true);
        setEditingId(item.id);
        setFormState(item);
    } else {
        resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    const finalFormState: ClasseJudicial = {
      ...formState,
      id: isEditing && editingId ? editingId : `CJ${Date.now()}`,
    };
    
    if (isEditing) {
        setClassesJudiciais(prev => prev.map(c => c.id === editingId ? finalFormState : c));
    } else {
        setClassesJudiciais(prev => [...prev, finalFormState]);
    }
    
    setSelectedRowIds([]);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setClassesJudiciais(prev => prev.filter(c => c.id !== id));
  };


  const numDisplayed = displayedItems.length;
  const numSelected = selectedRowIds.length;

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classes Judiciais" description="Gerencie os códigos de classe judicial, prazos e destinações.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Classe Judicial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">{isEditing ? 'Editar Classe Judicial' : 'Nova Classe Judicial'}</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código Judicial*</Label>
                <Input id="codigo" value={formState.codigo} onChange={handleInputChange} placeholder="Ex: 1116" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Nome da Classe*</Label>
                <Input id="descricao" value={formState.descricao} onChange={handleInputChange} placeholder="Ex: Procedimento Comum Cível" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazoGuardaAnos">Prazo Guarda (Anos)</Label>
                <Input id="prazoGuardaAnos" type="number" value={formState.prazoGuardaAnos ?? ""} onChange={handleNumericInputChange} placeholder="Nº de anos (ex: 5, pode ser 0)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinacaoFinal">Destinação Final*</Label>
                <Select onValueChange={handleSelectChange} value={formState.destinacaoFinal}>
                  <SelectTrigger id="destinacaoFinal">
                    <SelectValue placeholder="Selecione a destinação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não se Aplica">Não se Aplica</SelectItem>
                    <SelectItem value="Vide Guia de Aplicação">Vide Guia de Aplicação</SelectItem>
                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formState.observacoes || ""} onChange={handleInputChange} placeholder="Detalhes adicionais" />
              </div>
              <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                <UICheckbox id="inativo" checked={formState.inativo} onCheckedChange={handleFormCheckboxChange} />
                <Label htmlFor="inativo" className="mb-0">Inativo</Label>
              </div>
            </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
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
                <TableHead className="w-12">
                  <UICheckbox
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
                <TableHead>Código</TableHead>
                <TableHead>Nome da Classe</TableHead>
                <TableHead>Destinação Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedItems.map((item) => (
                <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                  <TableCell>
                    <UICheckbox
                      checked={selectedRowIds.includes(item.id)}
                      onCheckedChange={(value) => {
                        setSelectedRowIds(prev =>
                          value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                        );
                      }}
                      aria-label={`Selecionar classe judicial ${item.codigo}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>{item.destinacaoFinal}</TableCell>
                  <TableCell>
                    <Badge variant={item.inativo ? 'destructive' : 'secondary'}>
                      {item.inativo ? 'Inativo' : 'Ativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Editar Classe Judicial" onClick={() => handleOpenDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar Classe Judicial</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Classe Judicial" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir Classe Judicial</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {displayedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma classe judicial encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
