
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ListagemEliminacao } from "@/types";
import { ArrowUpDown, ArrowUp, ArrowDown, ColumnsIcon, CheckSquare, Square, FileSpreadsheet } from "lucide-react";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { Badge } from "@/components/ui/badge";
import { simulatedListagensData } from "@/lib/mock-data";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';

type ColumnConfig = {
  id: keyof ListagemEliminacao | string;
  header: string;
  accessorKey: keyof ListagemEliminacao | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: ListagemEliminacao) => React.ReactNode;
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };


export default function TermosEliminacaoPage() {
  const router = useRouter();
  const [listagens, setListagens] = React.useState<ListagemEliminacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);

  const getStatus = React.useCallback((item: ListagemEliminacao) => {
    if (item.dataProducaoTermoEliminacao) return "Efetivada";
    if (item.dataPublicacaoEdital) return "Edital Publicado";
    return "Tramitando";
  }, []);
  
  const ALL_COLUMNS_CONFIG: ColumnConfig[] = React.useMemo(() => [
    { id: 'numeroTermoEliminacao', header: 'Nº Termo', accessorKey: 'numeroTermoEliminacao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || 'N/A' },
    { id: 'numeroListagem', header: 'Nº Listagem', accessorKey: 'numeroListagem', defaultVisible: true, enableSorting: true },
    { id: 'dataProducaoTermoEliminacao', header: 'Data do Termo', accessorKey: 'dataProducaoTermoEliminacao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'tipoListagem', header: 'Tipo', accessorKey: 'tipoListagem', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || 'N/A' },
    { id: 'unidadeSetor', header: 'Unidade/Setor', accessorKey: 'unidadeSetor', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || 'N/A' },
    { id: 'quantificacaoFisica', header: 'Quantificação', accessorKey: 'quantificacaoFisica', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || 'N/A' },
  ], []);

  React.useEffect(() => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
    );
  }, [ALL_COLUMNS_CONFIG]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
      setListagens(stored ? JSON.parse(stored) : simulatedListagensData);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setListagens(simulatedListagensData);
    }
    setIsDataLoaded(true);
  }, []);

  const displayedListagens = React.useMemo(() => {
    let itemsToDisplay = listagens
      .filter(item => getStatus(item) === 'Efetivada')
      .filter(item => 
        item.numeroListagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroTermoEliminacao?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (sorting.length > 0) {
      itemsToDisplay.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = a[sortConfig.id as keyof ListagemEliminacao];
          const valB = b[sortConfig.id as keyof ListagemEliminacao];

          let comparisonResult = 0;
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else if (typeof valA === 'number' && typeof valB === 'number') comparisonResult = valA - valB;
          else if (valA instanceof Date && valB instanceof Date) comparisonResult = valA.getTime() - valB.getTime();
          else comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
          
          if (comparisonResult !== 0) return sortConfig.direction === 'asc' ? comparisonResult : -comparisonResult;
        }
        return 0;
      });
    }
    return itemsToDisplay;
  }, [listagens, searchTerm, sorting, getStatus]);

  const handleSort = (columnId: ColumnConfig['id']) => {
    setSorting(prevSorting => {
      const existingSortIndex = prevSorting.findIndex(s => s.id === columnId);
      let newSorting: SortConfig[] = [...prevSorting];

      if (existingSortIndex !== -1) {
        if (newSorting[existingSortIndex].direction === 'asc') {
          newSorting[existingSortIndex].direction = 'desc';
        } else {
          newSorting.splice(existingSortIndex, 1);
        }
      } else {
        newSorting = [{ id: columnId, direction: 'asc' }];
      }
      return newSorting;
    });
  };

  const renderSortIcon = (columnId: ColumnConfig['id']) => {
    const sortConfig = sorting.find(s => s.id === columnId);
    if (!sortConfig) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
   const headerCheckboxState = React.useMemo(() => {
    const totalDisplayed = displayedListagens.length;
    if (totalDisplayed === 0) return false;
    const totalSelected = selectedRowIds.length;
    if (totalSelected === totalDisplayed) return true;
    if (totalSelected > 0) return 'indeterminate';
    return false;
  }, [displayedListagens.length, selectedRowIds.length]);
  
  const handleSelectAllRows = React.useCallback((checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedRowIds(displayedListagens.map(item => item.id));
    } else {
      setSelectedRowIds([]);
    }
  }, [displayedListagens]);
  
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
  
  const getCellValue = (item: ListagemEliminacao, column: ColumnConfig) => {
    const accessorKey = column.accessorKey as keyof ListagemEliminacao;
    const value = item[accessorKey];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  };
  
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Termos de Eliminação" description="Visualize o histórico de termos de eliminação de documentos efetivados.">
         <div className="flex flex-wrap items-center gap-2">
            <Button disabled={selectedRowIds.length !== 1} onClick={() => {
                if (selectedRowIds.length === 1) {
                    router.push(`/listagens-eliminacao/print/termo/${selectedRowIds[0]}`);
                }
            }}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Gerar Termo
            </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Termos Efetivados</CardTitle>
            <CardDescription>Histórico de eliminações concluídas.</CardDescription>
            <div className="mt-2">
              <Input 
                placeholder="Buscar por Nº do Termo ou Listagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
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
                  key={column.id}
                  checked={columnVisibility[column.id] ?? false}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
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
                   <TableHead className="sticky left-0 bg-card z-10 w-12 py-2 px-3">
                     <Checkbox
                        checked={headerCheckboxState}
                        onCheckedChange={handleSelectAllRows}
                        aria-label="Selecionar todas as linhas"
                      />
                  </TableHead>
                  {ALL_COLUMNS_CONFIG.map((column) =>
                    columnVisibility[column.id] ? (
                      <TableHead key={column.id} className="py-2 px-3">
                        {column.enableSorting ? (
                          <Button
                            variant="ghost"
                            onClick={() => handleSort(column.id)}
                            className="px-1 py-1 h-auto -ml-2"
                          >
                            {column.header}
                            {renderSortIcon(column.id)}
                          </Button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ) : null
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedListagens.map((item) => (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                     <TableCell className="sticky left-0 bg-card z-10 py-2 px-3">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={(value) => {
                          setSelectedRowIds(prev =>
                            value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                          );
                        }}
                        aria-label={`Selecionar listagem ${item.numeroListagem}`}
                      />
                    </TableCell>
                    {ALL_COLUMNS_CONFIG.map((column) =>
                      columnVisibility[column.id] ? (
                        <TableCell key={`${item.id}-${column.id}`} className="py-2 px-3">
                          {getCellValue(item, column)}
                        </TableCell>
                      ) : null
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
           {displayedListagens.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhum termo de eliminação encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
