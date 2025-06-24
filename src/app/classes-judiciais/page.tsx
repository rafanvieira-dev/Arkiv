"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ClasseJudicial } from "@/types";
import { PlusCircle, Edit, Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialClassesJudiciais: ClasseJudicial[] = [
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

type ColumnConfig = {
  id: keyof ClasseJudicial | string;
  header: string;
  accessorKey: keyof ClasseJudicial | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: ClasseJudicial) => React.ReactNode;
};

const ALL_COLUMNS_CONFIG: ColumnConfig[] = [
  { id: 'codigo', header: 'Código', accessorKey: 'codigo', defaultVisible: true, enableSorting: true },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'inativo',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value) => <Badge variant={value ? 'destructive' : 'secondary'}>{value ? 'Inativo' : 'Ativo'}</Badge>
  },
  { id: 'descricao', header: 'Nome da Classe', accessorKey: 'descricao', defaultVisible: true, enableSorting: true },
  { id: 'prazoGuardaAnos', header: 'Prazo de Guarda', accessorKey: 'prazoGuardaAnos', defaultVisible: true, enableSorting: true, cellFormatter: (value) => (value !== undefined ? `${value} anos` : "N/A") },
  { id: 'destinacaoFinal', header: 'Destinação Final', accessorKey: 'destinacaoFinal', defaultVisible: true, enableSorting: true },
  { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
];

type SortConfig = { id: string; direction: 'asc' | 'desc' };


export default function ClassesJudiciaisPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState(initialFormState);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [classesJudiciais, setClassesJudiciais] = React.useState<ClasseJudicial[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [displayedItems, setDisplayedItems] = React.useState<ClasseJudicial[]>([]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CLASSES_JUDICIAIS_STORAGE_KEY);
      setClassesJudiciais(stored ? JSON.parse(stored) : initialClassesJudiciais);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setClassesJudiciais(initialClassesJudiciais);
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
  
  const getSortableValue = (item: ClasseJudicial, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!column) return null;
    const value = item[column.accessorKey as keyof ClasseJudicial];
    return value;
  };
  
  React.useEffect(() => {
    let sortedItems = [...classesJudiciais];
    if (sorting.length > 0) {
      sortedItems.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = getSortableValue(a, sortConfig.id);
          const valB = getSortableValue(b, sortConfig.id);

          let comparisonResult = 0;
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
             comparisonResult = valA === valB ? 0 : valA ? -1 : 1;
          } else {
            comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
          }
    
          if (comparisonResult !== 0) {
            return sortConfig.direction === 'asc' ? comparisonResult : -comparisonResult;
          }
        }
        return 0;
      });
    }
    setDisplayedItems(sortedItems);
  }, [sorting, classesJudiciais]);
  
  const handleSort = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!columnConfig || !columnConfig.enableSorting) return;

    setSorting(prevSorting => {
      const existingSortIndex = prevSorting.findIndex(s => s.id === columnId);
      let newSorting = [...prevSorting];

      if (existingSortIndex !== -1) {
        if (newSorting[existingSortIndex].direction === 'asc') {
          newSorting[existingSortIndex].direction = 'desc';
        } else {
          newSorting.splice(existingSortIndex, 1);
        }
      } else {
        newSorting.push({ id: columnId, direction: 'asc' });
      }
      return newSorting;
    });
  };
  
  const renderSortIcon = (columnId: string) => {
    const sortConfig = sorting.find(s => s.id === columnId);
    if (!sortConfig) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumns = () => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {})
    );
  };

  const handleDeselectAllColumns = () => {
     setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {})
    );
  };
  
  const getCellValue = (item: ClasseJudicial, column: ColumnConfig) => {
    const value = item[column.accessorKey as keyof ClasseJudicial];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
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
                <Checkbox id="inativo" checked={formState.inativo} onCheckedChange={handleFormCheckboxChange} />
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-primary">Lista de Classes Judiciais</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ColumnsIcon className="mr-2 h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Exibir/Ocultar Colunas</DropdownMenuLabel>
                <DropdownMenuItem onSelect={handleSelectAllColumns} className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Selecionar Todas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDeselectAllColumns} className="cursor-pointer">
                  <Square className="mr-2 h-4 w-4" />
                  Limpar Todas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_COLUMNS_CONFIG.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibility[column.id as string]}
                    onCheckedChange={() => toggleColumnVisibility(column.id as string)}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table className="min-w-full whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 py-2 px-3">
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
                   {ALL_COLUMNS_CONFIG.map((column) =>
                    columnVisibility[column.id as string] ? (
                      <TableHead key={column.id as string} className="py-2 px-3">
                        {column.enableSorting ? (
                          <Button
                            variant="ghost"
                            onClick={() => handleSort(column.id as string)}
                            className="px-1 py-1 h-auto -ml-2"
                          >
                            {column.header}
                            {renderSortIcon(column.id as string)}
                          </Button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ) : null
                  )}
                  <TableHead className="sticky right-0 bg-background z-10 text-right py-2 px-3">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedItems.map((item) => (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                    <TableCell className="py-2 px-3">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={(value) => {
                          setSelectedRowIds(prev =>
                            value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                          );
                        }}
                        aria-label={`Selecionar classe judicial ${item.codigo}`}
                      />
                    </TableCell>
                    {ALL_COLUMNS_CONFIG.map((column) =>
                      columnVisibility[column.id as string] ? (
                        <TableCell key={`${item.id}-${column.id as string}`} className="py-2 px-3">
                          {getCellValue(item, column)}
                        </TableCell>
                      ) : null
                    )}
                    <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                       <div className="flex items-center justify-end">
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
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
           </ScrollArea>
           {displayedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma classe judicial encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
