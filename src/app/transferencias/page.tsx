
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Transferencia } from "@/types";
import { Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Upload, Download, FileSpreadsheet } from "lucide-react";
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

const TRANSFERENCIAS_STORAGE_KEY = 'arquivocentral_transferencias';

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
    let sortedItems = [...transferencias];
    if (sorting.length > 0) {
      sortedItems.sort((a, b) => {
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
    setDisplayedTransferencias(sortedItems);
  }, [sorting, transferencias, getSortableValue]);

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
            
            const headers = headerRow.split(',').map(h => h.trim().replace(/"/g, ''));
            const expectedHeaders = ['nomeServidor', 'matricula', 'setorRemetente', 'dataTransferencia', 'documentos_json'];
            
            const hasRequiredHeaders = expectedHeaders.every(h => headers.includes(h));
            if (!hasRequiredHeaders) {
                 toast({ variant: "destructive", title: "Erro de Importação", description: `O cabeçalho do arquivo CSV é inválido. Colunas obrigatórias faltando: ${expectedHeaders.filter(h => !headers.includes(h)).join(', ')}. Por favor, utilize o modelo fornecido.` });
                 return;
            }

            const newItemsFromCsv: Transferencia[] = [];
            rows.forEach((row, index) => {
                if(!row.trim()) return;
                const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                const newItemData: { [key: string]: any } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });

                if (!newItemData.nomeServidor || !newItemData.matricula || !newItemData.setorRemetente || !newItemData.dataTransferencia || !newItemData.documentos_json) {
                    throw new Error(`Linha ${index + 2}: Campos obrigatórios faltando.`);
                }
                
                let documents;
                try {
                    documents = JSON.parse(newItemData.documentos_json);
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


  const numDisplayed = displayedTransferencias.length;
  const numSelected = selectedRowIds.length;

  return (
    <TooltipProvider>
      <div className="container mx-auto py-2">
        <PageHeader title="Gerenciamento de Transferências" description="Aprove ou reprove as solicitações de transferência de documentos para o arquivo.">
            <div className="flex flex-wrap items-center gap-2">
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

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-primary">Lista de Transferências</CardTitle>
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
    </TooltipProvider>
  );
}
