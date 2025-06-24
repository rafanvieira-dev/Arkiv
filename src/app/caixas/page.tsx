
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Caixa } from "@/types";
import { PlusCircle, Edit, Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { initialCaixas, initialTiposCaixa } from "@/lib/mock-data";


const initialFormStateCaixa: Partial<Caixa> = {
  codigoCaixa: "",
  descricao: "",
  tipo: "",
  status: "Aberta",
  localizacao: "",
  situacao: "Incompleta",
};

const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';
const TIPOS_CAIXA_STORAGE_KEY = 'arquivocentral_tipos_caixa';

type ColumnConfigCaixas = {
  id: keyof Caixa | string;
  header: string;
  accessorKey: keyof Caixa | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, doc: Caixa) => React.ReactNode;
};

const ALL_COLUMNS_CONFIG_CAIXAS: ColumnConfigCaixas[] = [
  {
    id: 'codigoCaixa',
    header: 'Código',
    accessorKey: 'codigoCaixa',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value, caixa) => (
      <Link href={`/documentos?codigoCaixa=${encodeURIComponent(caixa.codigoCaixa)}`} passHref>
        <span className="text-primary hover:underline cursor-pointer font-medium">
          {value}
        </span>
      </Link>
    )
  },
  { id: 'status', header: 'Status', accessorKey: 'status', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <Badge variant={value === 'Fechada' ? 'default' : 'secondary'}>{value}</Badge> },
  { id: 'descricao', header: 'Descrição', accessorKey: 'descricao', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  { id: 'tipo', header: 'Tipo', accessorKey: 'tipo', defaultVisible: true, enableSorting: true },
  { id: 'localizacao', header: 'Localização', accessorKey: 'localizacao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  { id: 'situacao', header: 'Situação', accessorKey: 'situacao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <Badge variant={value === 'Completa' ? 'secondary' : 'outline'}>{value}</Badge> },
];

type SortConfig = { id: string; direction: 'asc' | 'desc' };

export default function CaixasPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formStateCaixa, setFormStateCaixa] = React.useState<Partial<Caixa>>(initialFormStateCaixa);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingCaixaId, setEditingCaixaId] = React.useState<string | null>(null);

  const [caixas, setCaixas] = React.useState<Caixa[]>([]);
  const [tiposCaixa, setTiposCaixa] = React.useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [columnVisibilityCaixas, setColumnVisibilityCaixas] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG_CAIXAS.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );
  const [sortingCaixas, setSortingCaixas] = React.useState<SortConfig[]>([]);
  const [displayedCaixas, setDisplayedCaixas] = React.useState<Caixa[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);


  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CAIXAS_STORAGE_KEY);
      setCaixas(stored ? JSON.parse(stored) : initialCaixas);

      const storedTiposCaixa = window.localStorage.getItem(TIPOS_CAIXA_STORAGE_KEY);
      setTiposCaixa(storedTiposCaixa ? JSON.parse(storedTiposCaixa) : initialTiposCaixa);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setCaixas(initialCaixas);
      setTiposCaixa(initialTiposCaixa);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
        window.localStorage.setItem(CAIXAS_STORAGE_KEY, JSON.stringify(caixas));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [caixas, isDataLoaded]);


  const resetFormAndDialogState = () => {
    setFormStateCaixa(initialFormStateCaixa);
    setIsEditing(false);
    setEditingCaixaId(null);
  };

  const handleOpenDialog = (caixa?: Caixa) => {
    if (caixa) {
      setIsEditing(true);
      setEditingCaixaId(caixa.id);
      setFormStateCaixa(caixa);
    } else {
      resetFormAndDialogState();
    }
    setIsDialogOpen(true);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormStateCaixa(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSelectChange = (id: keyof Caixa) => (value: string) => {
    setFormStateCaixa(prev => ({ ...prev, [id]: value }));
  };


  const handleSaveChanges = () => {
    const caixaDataToSave: Caixa = {
      ...initialFormStateCaixa,
      ...formStateCaixa,
      id: isEditing && editingCaixaId ? editingCaixaId : `CX${Date.now()}`,
      tipo: formStateCaixa.tipo || "",
      status: formStateCaixa.status || 'Aberta',
      situacao: formStateCaixa.situacao || 'Incompleta',
    } as Caixa;

    let updatedCaixas;
    if (isEditing && editingCaixaId) {
      updatedCaixas = caixas.map(c => c.id === editingCaixaId ? caixaDataToSave : c);
    } else {
      updatedCaixas = [...caixas, caixaDataToSave];
    }
    setCaixas(updatedCaixas);
    setSelectedRowIds([]); // Clear selection after save

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCaixas(prev => prev.filter(c => c.id !== id));
  };


  const getSortableValueCaixas = (caixa: Caixa, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG_CAIXAS.find(col => col.id === columnId);
    if (!column) return null;
    const value = caixa[column.accessorKey as keyof Caixa];
    return value;
  };

  React.useEffect(() => {
    let sortedCaixas = [...caixas];
    if (sortingCaixas.length > 0) {
      sortedCaixas.sort((a, b) => {
        for (const sortConfig of sortingCaixas) {
          const valA = getSortableValueCaixas(a, sortConfig.id);
          const valB = getSortableValueCaixas(b, sortConfig.id);

          let comparisonResult = 0;
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else {
            comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
          }
    
          if (comparisonResult !== 0) {
            return sortConfig.direction === 'asc' ? comparisonResult : -comparisonResult;
          }
        }
        return 0;
      });
    }
    setDisplayedCaixas(sortedCaixas);
  }, [sortingCaixas, caixas]);


  const handleSortCaixas = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG_CAIXAS.find(col => col.id === columnId);
    if (!columnConfig || !columnConfig.enableSorting) return;

    setSortingCaixas(prevSorting => {
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

  const renderSortIconCaixas = (columnId: string) => {
    const sortConfig = sortingCaixas.find(s => s.id === columnId);
    if (!sortConfig) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const toggleColumnVisibilityCaixas = (columnId: string) => {
    setColumnVisibilityCaixas(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumnsCaixas = () => {
    setColumnVisibilityCaixas(
      ALL_COLUMNS_CONFIG_CAIXAS.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {})
    );
  };

  const handleDeselectAllColumnsCaixas = () => {
     setColumnVisibilityCaixas(
      ALL_COLUMNS_CONFIG_CAIXAS.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {})
    );
  };

  const getCellValueCaixas = (caixa: Caixa, column: ColumnConfigCaixas) => {
    const value = caixa[column.accessorKey as keyof Caixa];
    if (column.cellFormatter) {
      return column.cellFormatter(value, caixa);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  };

  const numDisplayed = displayedCaixas.length;
  const numSelected = selectedRowIds.length;

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Caixas" description="Gerencie os dados das caixas que armazenam os documentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            resetFormAndDialogState();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Caixa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">{isEditing ? "Editar Caixa" : "Nova Caixa"}</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para {isEditing ? "editar a" : "cadastrar uma nova"} caixa. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigoCaixa">Código*</Label>
                <Input id="codigoCaixa" placeholder="Ex: CX-A-001" value={formStateCaixa.codigoCaixa || ""} onChange={handleFormInputChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Detalhes adicionais sobre a caixa" value={formStateCaixa.descricao || ""} onChange={handleFormInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo*</Label>
                <Select onValueChange={handleFormSelectChange('tipo')} value={formStateCaixa.tipo}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCaixa.sort((a,b) => a.localeCompare(b)).map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input id="localizacao" placeholder="Ex: Estante 1, Prateleira A" value={formStateCaixa.localizacao || ""} onChange={handleFormInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select onValueChange={handleFormSelectChange('status')} value={formStateCaixa.status}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberta">Aberta</SelectItem>
                    <SelectItem value="Fechada">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="situacao">Situação*</Label>
                <Select onValueChange={handleFormSelectChange('situacao')} value={formStateCaixa.situacao}>
                  <SelectTrigger id="situacao">
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completa">Completa</SelectItem>
                    <SelectItem value="Incompleta">Incompleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Caixa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-primary">Lista de Caixas</CardTitle>
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
                <DropdownMenuItem onSelect={handleSelectAllColumnsCaixas} className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Selecionar Todas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDeselectAllColumnsCaixas} className="cursor-pointer">
                  <Square className="mr-2 h-4 w-4" />
                  Limpar Todas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_COLUMNS_CONFIG_CAIXAS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibilityCaixas[column.id as string]}
                    onCheckedChange={() => toggleColumnVisibilityCaixas(column.id as string)}
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
                  <TableHead className="py-2 px-3 w-12">
                    <Checkbox
                      checked={
                        numDisplayed > 0 && numSelected === numDisplayed
                          ? true
                          : numSelected > 0 ? 'indeterminate' : false
                      }
                      onCheckedChange={(value) => {
                        if (value === true) {
                          setSelectedRowIds(displayedCaixas.map(c => c.id));
                        } else {
                          setSelectedRowIds([]);
                        }
                      }}
                      aria-label="Selecionar todas as linhas"
                    />
                  </TableHead>
                  {ALL_COLUMNS_CONFIG_CAIXAS.map((column) =>
                    columnVisibilityCaixas[column.id as string] ? (
                      <TableHead key={column.id as string} className="py-2 px-3">
                        {column.enableSorting ? (
                          <Button
                            variant="ghost"
                            onClick={() => handleSortCaixas(column.id as string)}
                            className="px-1 py-1 h-auto -ml-2"
                          >
                            {column.header}
                            {renderSortIconCaixas(column.id as string)}
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
                {displayedCaixas.map((item) => (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                    <TableCell className="py-2 px-3">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={(value) => {
                          setSelectedRowIds(prev =>
                            value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                          );
                        }}
                        aria-label={`Selecionar caixa ${item.codigoCaixa}`}
                      />
                    </TableCell>
                    {ALL_COLUMNS_CONFIG_CAIXAS.map((column) =>
                      columnVisibilityCaixas[column.id as string] ? (
                        <TableCell key={`${item.id}-${column.id as string}`} className="py-2 px-3">
                           {getCellValueCaixas(item, column)}
                        </TableCell>
                      ) : null
                    )}
                    <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Editar Caixa" onClick={() => handleOpenDialog(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Caixa</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Caixa" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir Caixa</p>
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
          {displayedCaixas.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma caixa encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
