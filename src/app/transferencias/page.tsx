
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Transferencia } from "@/types";
import { Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Upload, Download, FileSpreadsheet, PenSquare, FilterIcon, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { useToast } from "@/hooks/use-toast";
import { initialTransferencias } from "@/lib/mock-data";
import Link from "next/link";
import { parseCsvRow } from "@/lib/utils";
import { logAction } from "@/lib/audit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DateInputPicker } from "@/components/date-input-picker";
import { isBefore, isAfter, parseISO } from "date-fns";

const TRANSFERENCIAS_STORAGE_KEY = 'arquivocentral_transferencias';

const initialFiltersState = {
  id: "",
  status: "",
  nomeServidor: "",
  matricula: "",
  setorRemetente: "",
  dataTransferenciaDe: undefined as Date | undefined,
  dataTransferenciaAte: undefined as Date | undefined,
};
const ALL_VALUES_SENTINEL = "ALL_VALUES";

type ColumnConfig = {
  id: keyof Transferencia | string;
  header: string;
  accessorKey: keyof Transferencia | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: Transferencia) => React.ReactNode;
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };

export default function TransferenciasManagementPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [transferencias, setTransferencias] = React.useState<Transferencia[]>([]);
  const [displayedTransferencias, setDisplayedTransferencias] = React.useState<Transferencia[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [bulkEditField, setBulkEditField] = React.useState('');
  const [bulkEditValue, setBulkEditValue] = React.useState<any>('');
  
  const [filters, setFilters] = React.useState(initialFiltersState);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const bulkEditableFields = [
    { value: 'status', label: 'Status', type: 'select', options: ['Pendente', 'Aprovada', 'Reprovada'] },
    { value: 'observacoes', label: 'Observações', type: 'text' },
  ];
  const selectedBulkField = bulkEditableFields.find(f => f.value === bulkEditField);
  
  const ALL_COLUMNS_CONFIG: ColumnConfig[] = React.useMemo(() => [
    { 
      id: 'id', 
      header: 'Nº da Transferência', 
      accessorKey: 'id', 
      defaultVisible: true, 
      enableSorting: true,
      cellFormatter: (value, item) => (
        <Link href={`/transferencias/${item.id}`} className="text-primary hover:underline font-medium">
          {value}
        </Link>
      )
    },
    { id: 'status', header: 'Status', accessorKey: 'status', defaultVisible: true, enableSorting: true, cellFormatter: (value) => (
      <Badge variant={
        value === 'Aprovada' ? 'secondary' :
        value === 'Reprovada' ? 'destructive' :
        'default'
      }>{value}</Badge>
    )},
    { id: 'nomeServidor', header: 'Nome do Servidor', accessorKey: 'nomeServidor', defaultVisible: true, enableSorting: true },
    { id: 'matricula', header: 'Matrícula', accessorKey: 'matricula', defaultVisible: true, enableSorting: true },
    { id: 'ramal', header: 'Ramal', accessorKey: 'ramal', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
    { id: 'setorRemetente', header: 'Setor Remetente', accessorKey: 'setorRemetente', defaultVisible: true, enableSorting: true },
    { id: 'dataTransferencia', header: 'Data de Transferência', accessorKey: 'dataTransferencia', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: false, enableSorting: false, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
    { id: 'quantidadeDocumentos', header: 'Qtd. Documentos', accessorKey: 'documentos', defaultVisible: true, enableSorting: true, cellFormatter: (docs) => docs?.length || 0 },
    { id: 'tiposDocumento', header: 'Espécies de Documento', accessorKey: 'documentos', defaultVisible: true, enableSorting: false, cellFormatter: (docs) => {
        if (!docs || docs.length === 0) return 'N/A';
        const tipos = [...new Set(docs.map((d: any) => d.categoria))];
        const displayString = tipos.join(', ');
        return <span className="block max-w-xs truncate" title={displayString}>{displayString}</span>;
    } },
  ], []);

  React.useEffect(() => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
    );
  }, [ALL_COLUMNS_CONFIG]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TRANSFERENCIAS_STORAGE_KEY);
      setTransferencias(stored ? JSON.parse(stored) : initialTransferencias);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setTransferencias(initialTransferencias);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(TRANSFERENCIAS_STORAGE_KEY, JSON.stringify(transferencias));
    }
  }, [transferencias, isDataLoaded]);

  const getSortableValue = React.useCallback((item: Transferencia, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!column) return null;
    const value = item[column.accessorKey as keyof Transferencia];
    if (column.accessorKey === 'documentos' && Array.isArray(value)) return value.length;
    if (column.accessorKey === 'dataTransferencia' && typeof value === 'string') {
        const parsedDate = Date.parse(value);
        return !isNaN(parsedDate) ? new Date(parsedDate) : null;
    }
    return value;
  }, [ALL_COLUMNS_CONFIG]);

  React.useEffect(() => {
    let itemsToDisplay = transferencias.filter(item => {
        if (filters.id && !item.id.toLowerCase().includes(filters.id.toLowerCase())) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.nomeServidor && !item.nomeServidor.toLowerCase().includes(filters.nomeServidor.toLowerCase())) return false;
        if (filters.matricula && !item.matricula.toLowerCase().includes(filters.matricula.toLowerCase())) return false;
        if (filters.setorRemetente && !item.setorRemetente.toLowerCase().includes(filters.setorRemetente.toLowerCase())) return false;
        
        if (filters.dataTransferenciaDe || filters.dataTransferenciaAte) {
            if (!item.dataTransferencia) return false;
            const itemDate = parseISO(item.dataTransferencia);
            if (filters.dataTransferenciaDe && isBefore(itemDate, filters.dataTransferenciaDe)) return false;
            if (filters.dataTransferenciaAte && isAfter(itemDate, filters.dataTransferenciaAte)) return false;
        }

        return true;
    });

    if (sorting.length > 0) {
      itemsToDisplay.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = getSortableValue(a, sortConfig.id);
          const valB = getSortableValue(b, sortConfig.id);

          let comparisonResult = 0;
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else if (valA instanceof Date && valB instanceof Date) comparisonResult = valA.getTime() - valB.getTime();
          else comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());

          if (comparisonResult !== 0) {
            return sortConfig.direction === 'asc' ? comparisonResult : -comparisonResult;
          }
        }
        return 0;
      });
    }
    setDisplayedTransferencias(itemsToDisplay);
  }, [filters, sorting, transferencias, getSortableValue]);

  const handleSort = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!columnConfig || !columnConfig.enableSorting) return;

    setSorting(prevSorting => {
      const existingSortIndex = prevSorting.findIndex(s => s.id === columnId);
      let newSorting = [...prevSorting];
      if (existingSortIndex !== -1) {
        if (newSorting[existingSortIndex].direction === 'asc') newSorting[existingSortIndex].direction = 'desc';
        else newSorting.splice(existingSortIndex, 1);
      } else {
        newSorting = [{ id: columnId, direction: 'asc' }];
      }
      return newSorting;
    });
  };

  const renderSortIcon = (columnId: string) => {
    const sortConfig = sorting.find(s => s.id === columnId);
    if (!sortConfig) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumns = () => {
    setColumnVisibility(ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {}));
  };

  const handleDeselectAllColumns = () => {
    setColumnVisibility(ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {}));
  };

  const getCellValue = (item: Transferencia, column: ColumnConfig) => {
    const value = item[column.accessorKey as keyof Transferencia];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  };

  const handleDelete = (id: string) => {
    setTransferencias(prev => prev.filter(t => t.id !== id));
    toast({ title: "Transferência Excluída" });
  };
  
  const handleBulkUpdate = () => {
    if (!bulkEditField || (typeof bulkEditValue !== 'boolean' && !bulkEditValue)) {
      toast({
        variant: "destructive",
        title: "Ação Incompleta",
        description: "Por favor, selecione um campo e forneça o novo valor.",
      });
      return;
    }

    logAction('BULK_UPDATE_TRANSFERENCIAS', {
      count: selectedRowIds.length,
      field: bulkEditField,
      transferenciaIds: selectedRowIds,
    });

    setTransferencias(prevItems =>
        prevItems.map(item => {
            if (selectedRowIds.includes(item.id)) {
                return { ...item, [bulkEditField]: bulkEditValue };
            }
            return item;
        })
    );
    
    toast({
      title: "Alteração em Bloco Concluída",
      description: `${selectedRowIds.length} transferência(s) foram atualizadas com sucesso.`,
    });

    setSelectedRowIds([]);
    setIsBulkEditOpen(false);
    setBulkEditField('');
    setBulkEditValue('');
  };

  const handleExportCSV = () => {
    const headers = ['id', 'nomeServidor', 'matricula', 'ramal', 'setorRemetente', 'dataTransferencia', 'status', 'observacoes', 'documentos_json'];
    const csvRows = [headers.join(',')];

    const dataToExport = displayedTransferencias.length > 0 ? displayedTransferencias : transferencias;

    dataToExport.forEach(item => {
      const rowData = {
        id: item.id,
        nomeServidor: item.nomeServidor,
        matricula: item.matricula,
        ramal: item.ramal || '',
        setorRemetente: item.setorRemetente,
        dataTransferencia: item.dataTransferencia,
        status: item.status,
        observacoes: item.observacoes || '',
        documentos_json: JSON.stringify(item.documentos)
      };
      const row = headers.map(header => `"${String(rowData[header as keyof typeof rowData]).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transferencias_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Sucesso", description: "Exportação de transferências concluída." });
  };

  const handleDownloadTemplate = () => {
    const headers = ['nomeServidor', 'matricula', 'ramal', 'setorRemetente', 'dataTransferencia', 'observacoes', 'documentos_json'];
    const exampleDoc = [{
        id: "TEMP_DOC_1",
        categoria: "Processo Judicial",
        codigoClassificacao: "020.1",
        descricao: "Descrição de exemplo",
        dataAbrangente: "01/2024",
        numeroDocumento: "PJ-2024-001",
        quantidadeVolumes: 1,
        quantidadeApensos: 0,
        numerosApensos: "",
        digitalizado: "Não",
        observacoesGerais: "Observação do documento"
    }];
    const exampleRow = [
        "Nome Servidor Exemplo", "12345", "6789", "Setor Exemplo", new Date().toISOString(), "Observação geral da transferência", JSON.stringify(exampleDoc).replace(/"/g, '""')
    ].map(v => `"${v}"`).join(',');

    const csvContent = `${headers.join(',')}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_transferencias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        try {
            const rows = text.split('\n').filter(row => row.trim() !== '');
            const headerRow = rows.shift();
            if (!headerRow) throw new Error("Arquivo CSV vazio ou sem cabeçalho.");
            
            const headers = parseCsvRow(headerRow);
            
            const newItemsFromCsv: Transferencia[] = [];
            rows.forEach((row, index) => {
                if(!row.trim()) return;
                const values = parseCsvRow(row);
                const newItemData: { [key: string]: any } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });
                
                let documents;
                try {
                    documents = newItemData.documentos_json ? JSON.parse(newItemData.documentos_json) : [];
                    if (!Array.isArray(documents)) throw new Error("A coluna 'documentos_json' deve ser um array JSON válido.");
                } catch (jsonError) {
                    throw new Error(`Linha ${index + 2}: Erro ao processar a coluna 'documentos_json'. Verifique o formato. Detalhes: ${(jsonError as Error).message}`);
                }

                const newItem: Transferencia = {
                    id: `TRANSF_IMP_${Date.now()}_${index}`,
                    nomeServidor: newItemData.nomeServidor,
                    matricula: newItemData.matricula,
                    ramal: newItemData.ramal,
                    setorRemetente: newItemData.setorRemetente,
                    dataTransferencia: newItemData.dataTransferencia,
                    status: 'Pendente', // Imported transfers are always pending
                    observacoes: newItemData.observacoes,
                    documentos: documents,
                };
                newItemsFromCsv.push(newItem);
            });

            setTransferencias(prev => [...prev, ...newItemsFromCsv]);
            toast({ title: "Importação Concluída", description: `${newItemsFromCsv.length} transferências foram importadas com sucesso.` });

        } catch (error: any) {
             toast({ variant: "destructive", title: "Erro de Importação", description: `Falha ao processar o arquivo: ${error.message}` });
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    reader.readAsText(file);
  };
  
  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (name: keyof typeof initialFiltersState) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === ALL_VALUES_SENTINEL ? "" : value }));
  };
  
  const handleFilterDateChange = (name: keyof typeof initialFiltersState) => (date?: Date) => {
    setFilters(prev => ({...prev, [name]: date}));
  };

  const clearFilters = () => {
    setFilters(initialFiltersState);
  };


  const numDisplayed = displayedTransferencias.length;
  const numSelected = selectedRowIds.length;
  
  const filtersAreActive = React.useMemo(() => {
    return Object.values(filters).some(value => !!value);
  }, [filters]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-2">
        <PageHeader title="Gerenciamento de Transferências" description="Aprove ou reprove as solicitações de transferência de documentos para o arquivo.">
            <div className="flex flex-wrap items-center gap-2">
                 <Button variant="outline" disabled={selectedRowIds.length === 0} onClick={() => setIsBulkEditOpen(true)}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    Alterar em Bloco ({selectedRowIds.length})
                </Button>
                <Button variant="outline" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar CSV
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />
                <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Baixar Modelo
                </Button>
            </div>
        </PageHeader>
        
        <Accordion type="single" collapsible className="w-full mb-6 mt-6" value={isFiltersOpen ? "filters" : ""} onValueChange={(value) => setIsFiltersOpen(value === "filters")}>
            <AccordionItem value="filters" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                        <FilterIcon className="h-5 w-5 text-primary" />
                        <CardTitle className="font-headline text-primary text-xl">Filtros das Transferências</CardTitle>
                    </div>
                    {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </AccordionTrigger>
                <AccordionContent>
                    <CardDescription className="px-6 pb-4 text-sm">
                        Refine a lista de transferências aplicando um ou mais filtros abaixo.
                    </CardDescription>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-0">
                        <div className="space-y-2">
                            <Label htmlFor="filterId">Nº da Transferência</Label>
                            <Input id="filterId" name="id" value={filters.id} onChange={handleFilterInputChange} placeholder="Contém..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filterStatus">Status</Label>
                            <Select onValueChange={handleFilterSelectChange('status')} value={filters.status}>
                            <SelectTrigger id="filterStatus"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUES_SENTINEL}>Todos os status</SelectItem>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Aprovada">Aprovada</SelectItem>
                                <SelectItem value="Reprovada">Reprovada</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filterNomeServidor">Nome do Servidor</Label>
                            <Input id="filterNomeServidor" name="nomeServidor" value={filters.nomeServidor} onChange={handleFilterInputChange} placeholder="Contém..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filterMatricula">Matrícula</Label>
                            <Input id="filterMatricula" name="matricula" value={filters.matricula} onChange={handleFilterInputChange} placeholder="Contém..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filterSetorRemetente">Setor Remetente</Label>
                            <Input id="filterSetorRemetente" name="setorRemetente" value={filters.setorRemetente} onChange={handleFilterInputChange} placeholder="Contém..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filterDataTransferenciaDe">Data de Transferência (De)</Label>
                            <DateInputPicker value={filters.dataTransferenciaDe} onChange={handleFilterDateChange('dataTransferenciaDe')} placeholder="dd/mm/aaaa" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filterDataTransferenciaAte">Data de Transferência (Até)</Label>
                            <DateInputPicker value={filters.dataTransferenciaAte} onChange={handleFilterDateChange('dataTransferenciaAte')} placeholder="dd/mm/aaaa" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 px-6 pb-6">
                        <Button variant="outline" onClick={clearFilters}><RotateCcw className="mr-2 h-4 w-4" /> Limpar Filtros</Button>
                    </CardFooter>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Card className="mt-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-primary">Lista de Transferências</CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                {filtersAreActive
                    ? `Exibindo ${displayedTransferencias.length} de ${transferencias.length} transferências com base nos filtros aplicados.`
                    : `Exibindo todas as ${transferencias.length} transferências cadastradas.`}
                </CardDescription>
            </div>
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
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table className="min-w-full whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 py-2 px-3">
                      <Checkbox
                        checked={numDisplayed > 0 && numSelected === numDisplayed ? true : numSelected > 0 ? 'indeterminate' : false}
                        onCheckedChange={(value) => setSelectedRowIds(value === true ? displayedTransferencias.map(item => item.id) : [])}
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
                  {displayedTransferencias.map((item) => (
                    <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                      <TableCell className="py-2 px-3">
                        <Checkbox
                          checked={selectedRowIds.includes(item.id)}
                          onCheckedChange={(value) => setSelectedRowIds(prev => value ? [...prev, item.id] : prev.filter(id => id !== item.id))}
                          aria-label={`Selecionar transferência ${item.id}`}
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
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Transferência" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Excluir</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {displayedTransferencias.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma transferência encontrada.</p>
            )}
          </CardContent>
        </Card>
      </div>

       <Dialog open={isBulkEditOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setBulkEditField('');
          setBulkEditValue('');
        }
        setIsBulkEditOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alteração em Bloco</DialogTitle>
            <DialogDescription>
              Selecione o campo e o novo valor para aplicar a todas as {selectedRowIds.length} transferências selecionadas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bulk-field" className="text-right">
                Campo a Alterar
              </Label>
              <Select onValueChange={(value) => {
                setBulkEditField(value);
                setBulkEditValue('');
              }} value={bulkEditField}>
                <SelectTrigger id="bulk-field" className="col-span-3">
                  <SelectValue placeholder="Selecione um campo..." />
                </SelectTrigger>
                <SelectContent>
                  {bulkEditableFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedBulkField && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bulk-value" className="text-right">
                  Novo Valor
                </Label>
                <div className="col-span-3">
                  {selectedBulkField.type === 'text' && (
                    <Input id="bulk-value" value={bulkEditValue} onChange={(e) => setBulkEditValue(e.target.value)} />
                  )}
                  {selectedBulkField.type === 'select' && (
                    <Select onValueChange={setBulkEditValue} value={bulkEditValue}>
                      <SelectTrigger id="bulk-value">
                        <SelectValue placeholder="Selecione um valor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBulkField.options?.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkUpdate} disabled={!selectedBulkField}>Aplicar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

