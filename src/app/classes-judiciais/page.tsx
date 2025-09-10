

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ClasseJudicial, DestinacaoFinal, CondicaoTemporalidade } from "@/types";
import { PlusCircle, Edit, Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Upload, Download, FileSpreadsheet, PenSquare, FilterIcon, ChevronUp, ChevronDown, RotateCcw, Printer, XCircle, CornerDownRight } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useToast } from "@/hooks/use-toast";
import { parseCsvRow } from "@/lib/utils";
import { logAction } from "@/lib/audit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUserSession } from "@/hooks/use-user-session";
import { initialClassesJudiciais } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils"


const initialFormState: Partial<ClasseJudicial> = {
  codigo: "",
  descricao: "",
  prazoGuardaAnos: undefined, 
  destinacaoFinal: "Não se Aplica", 
  observacoes: "",
  inativo: false,
  condicoes: [],
};

const initialFiltersState = {
  codigo: "",
  descricao: "",
  destinacaoFinal: "",
  status: "",
};
const ALL_VALUES_SENTINEL = "ALL_VALUES";

const CLASSES_JUDICIAIS_STORAGE_KEY = 'arquivocentral_classes_judiciais';

type ColumnConfig = {
  id: keyof ClasseJudicial | string;
  header: string;
  accessorKey: keyof ClasseJudicial | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: ClasseJudicial) => React.ReactNode;
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };

interface MemoizedClasseJudicialRowProps {
    item: ClasseJudicial;
    isSelected: boolean;
    onToggleSelected: (itemId: string) => void;
    visibleColumns: ColumnConfig[];
    getCellValue: (item: ClasseJudicial, column: ColumnConfig) => React.ReactNode;
    onEditClick: (item: ClasseJudicial) => void;
    onDeleteClick: (itemId: string) => void;
    hasDeletePermission: boolean;
}

const MemoizedClasseJudicialRow = React.memo(function MemoizedClasseJudicialRow({
    item, isSelected, onToggleSelected, visibleColumns, getCellValue, onEditClick, onDeleteClick, hasDeletePermission
}: MemoizedClasseJudicialRowProps) {
    return (
        <TableRow data-state={isSelected ? "selected" : ""}>
            <TableCell className="sticky left-0 bg-card z-10 py-2 px-3">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelected(item.id)}
                    aria-label={`Selecionar classe judicial ${item.codigo}`}
                />
            </TableCell>
            {visibleColumns.map((column) => (
                <TableCell key={`${item.id}-${column.id as string}`} className="py-2 px-3">
                    {getCellValue(item, column)}
                </TableCell>
            ))}
            <TableCell className="sticky right-0 bg-card z-10 py-2 px-3 text-right">
                <div className="flex items-center justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Editar Classe Judicial" onClick={() => onEditClick(item)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Editar Classe Judicial</p>
                        </TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Classe Judicial" disabled={!hasDeletePermission}>
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>{hasDeletePermission ? "Excluir Classe Judicial" : "Permissão necessária"}</p>
                            </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a classe judicial "{item.descricao}".
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteClick(item.id)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
            </TableCell>
        </TableRow>
    );
});


export default function ClassesJudiciaisPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { permissions } = useUserSession();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<ClasseJudicial>>(initialFormState);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [classesJudiciais, setClassesJudiciais] = React.useState<ClasseJudicial[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [bulkEditField, setBulkEditField] = React.useState('');
  const [bulkEditValue, setBulkEditValue] = React.useState<any>('');
  
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const [filters, setFilters] = React.useState(initialFiltersState);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  
  const ALL_COLUMNS_CONFIG: ColumnConfig[] = React.useMemo(() => [
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'inativo',
      defaultVisible: true,
      enableSorting: true,
      cellFormatter: (value) => <Badge variant={value ? 'destructive' : 'secondary'}>{value ? 'Inativo' : 'Ativo'}</Badge>
    },
    { id: 'codigo', header: 'Código', accessorKey: 'codigo', defaultVisible: true, enableSorting: true },
    { id: 'descricao', header: 'Nome da Classe', accessorKey: 'descricao', defaultVisible: true, enableSorting: true },
    { id: 'prazoGuardaAnos', header: 'Prazo de Guarda (Padrão)', accessorKey: 'prazoGuardaAnos', defaultVisible: true, enableSorting: true, cellFormatter: (value) => (value !== undefined ? `${value} anos` : "N/A") },
    { id: 'destinacaoFinal', header: 'Destinação Final (Padrão)', accessorKey: 'destinacaoFinal', defaultVisible: true, enableSorting: true, cellFormatter: (value, item) => (value === 'Ação' ? item.destinacaoFinalAcao || 'Ação' : value) },
    { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  ], []);

  React.useEffect(() => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
    );
  }, [ALL_COLUMNS_CONFIG]);

  const bulkEditableFields = [
    { value: 'prazoGuardaAnos', label: 'Prazo de Guarda (Anos)', type: 'number' },
    { value: 'destinacaoFinal', label: 'Destinação Final', type: 'select', options: ['Não se Aplica', 'Vide Guia de Aplicação', 'Eliminação', 'Guarda Permanente', 'Ação'] },
    { value: 'destinacaoFinalAcao', label: 'Texto da Ação de Destinação', type: 'text' },
    { value: 'observacoes', label: 'Observações', type: 'text' },
    { value: 'inativo', label: 'Status', type: 'select', options: ['Ativo', 'Inativo'] },
  ];
  const selectedBulkField = bulkEditableFields.find(f => f.value === bulkEditField);

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
  
  const handleSelectChange = (value: DestinacaoFinal) => {
    setFormState(prev => ({ ...prev, destinacaoFinal: value, ...(value !== 'Ação' && { destinacaoFinalAcao: '' }) }));
  };

  const handleFormCheckboxChange = (id: keyof ClasseJudicial) => (checked: boolean) => {
    setFormState(prev => ({ ...prev, [id]: checked }));
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setIsEditing(false);
    setEditingId(null);
  };
  
  const handleOpenDialog = React.useCallback((item?: ClasseJudicial) => {
    if (item) {
        setIsEditing(true);
        setEditingId(item.id);
        setFormState({
            ...initialFormState,
            ...item,
            condicoes: item.condicoes || [],
        });
    } else {
        resetForm();
    }
    setIsDialogOpen(true);
  }, []);
  
const handleAddCondicao = (path: (string | number)[]) => {
    const newCondicao: CondicaoTemporalidade = {
        id: `cond_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pergunta: '',
        prazoSeSim: undefined,
        destinacaoSeSim: 'Eliminação',
        proximaPerguntaSeSim: false,
        subCondicoesSeSim: [],
        prazoSeNao: undefined,
        destinacaoSeNao: 'Guarda Permanente',
        proximaPerguntaSeNao: false,
        subCondicoesSeNao: [],
    };

    setFormState(prev => {
        const newState = JSON.parse(JSON.stringify(prev)); // Deep copy

        let currentLevel = newState;
        let parent: any = null;
        let lastKey: string | number | null = null;
        let parentPath: (string | number)[] = [];

        for (const key of path) {
            parent = currentLevel;
            parentPath.push(key);
            if (typeof key === 'number') {
                if (currentLevel.condicoes && currentLevel.condicoes[key]) {
                    currentLevel = currentLevel.condicoes[key];
                } else if (currentLevel.subCondicoesSeSim && currentLevel.subCondicoesSeSim[key]) {
                    currentLevel = currentLevel.subCondicoesSeSim[key];
                } else if (currentLevel.subCondicoesSeNao && currentLevel.subCondicoesSeNao[key]) {
                    currentLevel = currentLevel.subCondicoesSeNao[key];
                } else {
                    console.error("Invalid path segment during traversal", key, "in", path);
                    return prev; 
                }
            } else if (key === 'subCondicoesSeSim' || key === 'subCondicoesSeNao') {
                 if (!currentLevel[key]) currentLevel[key] = [];
                 currentLevel = currentLevel[key];
            }
             lastKey = key;
        }

        if (Array.isArray(currentLevel)) {
            currentLevel.push(newCondicao);
        } else if(currentLevel && typeof currentLevel === 'object' && !Array.isArray(currentLevel)){
            if (!currentLevel.condicoes) {
                currentLevel.condicoes = [];
            }
            currentLevel.condicoes.push(newCondicao);
        } else {
            newState.condicoes = [newCondicao];
        }

        return newState;
    });
};

  const handleRemoveCondicao = (idToRemove: string) => {
      setFormState(prev => {
          const newFormState = JSON.parse(JSON.stringify(prev));

          const findAndRemove = (conds: CondicaoTemporalidade[], id: string): CondicaoTemporalidade[] => {
              const index = conds.findIndex(c => c.id === id);
              if (index > -1) {
                  conds.splice(index, 1);
                  return conds;
              }
              for (const cond of conds) {
                  if (cond.subCondicoesSeSim) cond.subCondicoesSeSim = findAndRemove(cond.subCondicoesSeSim, id);
                  if (cond.subCondicoesSeNao) cond.subCondicoesSeNao = findAndRemove(cond.subCondicoesSeNao, id);
              }
              return conds;
          };

          newFormState.condicoes = findAndRemove(newFormState.condicoes || [], idToRemove);
          return newFormState;
      });
  };
  
  const handleSaveChanges = () => {
    const finalFormState: ClasseJudicial = {
      ...formState,
      id: isEditing && editingId ? editingId : `CJ${Date.now()}`,
    } as ClasseJudicial;
    
    if (isEditing) {
        setClassesJudiciais(prev => prev.map(c => c.id === editingId ? finalFormState : c));
    } else {
        setClassesJudiciais(prev => [...prev, finalFormState]);
    }
    
    setSelectedRowIds([]);
    setIsDialogOpen(false);
  };

  const handleDelete = React.useCallback((id: string) => {
    logAction('DELETE_CLASSE_JUDICIAL', { classeId: id });
    setClassesJudiciais(prev => prev.filter(c => c.id !== id));
    toast({ title: "Sucesso", description: "Classe Judicial excluída." });
  }, [toast]);
  
  const handleBulkDelete = () => {
    logAction('BULK_DELETE_CLASSES_JUDICIAIS', {
      count: selectedRowIds.length,
      classeIds: selectedRowIds,
    });
    setClassesJudiciais(prev => prev.filter(c => !selectedRowIds.includes(c.id)));
    toast({
      title: "Exclusão em Bloco Concluída",
      description: `${selectedRowIds.length} classe(s) judicial(is) foram removidas com sucesso.`,
    });
    setSelectedRowIds([]);
    setIsBulkDeleteOpen(false);
  };

    const handleBulkUpdate = () => {
    if (!bulkEditField || (bulkEditValue === '' || bulkEditValue === undefined)) {
      toast({
        variant: "destructive",
        title: "Ação Incompleta",
        description: "Por favor, selecione um campo e forneça o novo valor.",
      });
      return;
    }

    const valueToSet = 
        bulkEditField === 'inativo' ? (bulkEditValue === 'Inativo') : 
        bulkEditField === 'prazoGuardaAnos' ? parseInt(bulkEditValue, 10) : 
        bulkEditValue;

    if (bulkEditField === 'prazoGuardaAnos' && isNaN(valueToSet as number)) {
        toast({
            variant: "destructive",
            title: "Valor Inválido",
            description: "O prazo de guarda deve ser um número.",
        });
        return;
    }

    logAction('BULK_UPDATE_CLASSES_JUDICIAIS', {
      count: selectedRowIds.length,
      field: bulkEditField,
      classeIds: selectedRowIds,
    });

    setClassesJudiciais(prevItems =>
        prevItems.map(item => {
            if (selectedRowIds.includes(item.id)) {
                return { ...item, [bulkEditField]: valueToSet };
            }
            return item;
        })
    );
    
    toast({
      title: "Alteração em Bloco Concluída",
      description: `${selectedRowIds.length} classe(s) judicial(is) foram atualizadas com sucesso.`,
    });

    setSelectedRowIds([]);
    setIsBulkEditOpen(false);
    setBulkEditField('');
    setBulkEditValue('');
  };

  const getSortableValue = (item: ClasseJudicial, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!column) return null;
    const value = item[column.accessorKey as keyof ClasseJudicial];
    return value;
  };
  
  const displayedItems = React.useMemo(() => {
    let itemsToDisplay = classesJudiciais.filter(item => {
        if (filters.codigo && !item.codigo.toLowerCase().includes(filters.codigo.toLowerCase())) return false;
        if (filters.descricao && !item.descricao.toLowerCase().includes(filters.descricao.toLowerCase())) return false;
        if (filters.destinacaoFinal && item.destinacaoFinal !== filters.destinacaoFinal) return false;
        if (filters.status) {
            const itemStatus = item.inativo ? 'Inativo' : 'Ativo';
            if (itemStatus !== filters.status) return false;
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
    return itemsToDisplay;
  }, [sorting, classesJudiciais, filters]);
  
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
  
  const getCellValue = React.useCallback((item: ClasseJudicial, column: ColumnConfig) => {
    const value = item[column.accessorKey as keyof ClasseJudicial];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  }, []);

  const handleCsvExport = (dataToExport: ClasseJudicial[]) => {
    if (dataToExport.length === 0) {
      toast({ variant: "destructive", description: "Nenhuma classe judicial selecionada para exportar." });
      return;
    }
    const headers = ['id', 'codigo', 'descricao', 'prazoGuardaAnos', 'destinacaoFinal', 'destinacaoFinalAcao', 'observacoes', 'inativo', 'condicoes'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(item => {
        const rowData = {
          ...item,
          prazoGuardaAnos: item.prazoGuardaAnos ?? '',
          destinacaoFinalAcao: item.destinacaoFinalAcao || '',
          observacoes: item.observacoes || '',
          condicoes: JSON.stringify(item.condicoes || []),
        };
        const row = headers.map(header => `"${String(rowData[header as keyof typeof rowData]).replace(/"/g, '""')}"`);
        csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'classes_judiciais_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Sucesso", description: "Exportação concluída." });
  };
  
  const handleExportAllCSV = () => {
    const dataToExport = displayedItems.length > 0 ? displayedItems : classesJudiciais;
    handleCsvExport(dataToExport);
  };

  const handleExportSelectedCSV = () => {
    const selectedData = classesJudiciais.filter(item => selectedRowIds.includes(item.id));
    handleCsvExport(selectedData);
  };
  
  const handleDownloadTemplate = () => {
    const headers = ['codigo', 'descricao', 'prazoGuardaAnos', 'destinacaoFinal', 'destinacaoFinalAcao', 'observacoes', 'inativo', 'condicoes'];
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_classes_judiciais.csv');
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
            const expectedHeaders = ['codigo', 'descricao'];
            
            if (!expectedHeaders.every(h => headers.includes(h))) {
                 toast({ variant: "destructive", title: "Erro de Importação", description: "O cabeçalho do arquivo CSV é inválido. Colunas 'codigo' e 'descricao' são obrigatórias." });
                 return;
            }

            const newItemsFromCsv: ClasseJudicial[] = [];
            rows.forEach((row, index) => {
                const values = parseCsvRow(row);
                const newItemData: { [key: string]: string } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });
                
                const prazoAnos = newItemData.prazoGuardaAnos ? parseInt(newItemData.prazoGuardaAnos, 10) : undefined;
                let condicoes;
                try {
                  condicoes = newItemData.condicoes ? JSON.parse(newItemData.condicoes) : [];
                } catch(e) {
                  console.warn(`Could not parse 'condicoes' on row ${index+2}`);
                  condicoes = [];
                }

                const newItem: ClasseJudicial = {
                    id: `CJ_IMP_${Date.now()}_${index}`,
                    codigo: newItemData.codigo,
                    descricao: newItemData.descricao,
                    prazoGuardaAnos: isNaN(prazoAnos as number) ? undefined : prazoAnos,
                    destinacaoFinal: (newItemData.destinacaoFinal as DestinacaoFinal) || 'Não se Aplica',
                    destinacaoFinalAcao: newItemData.destinacaoFinalAcao,
                    observacoes: newItemData.observacoes,
                    inativo: newItemData.inativo?.toLowerCase() === 'true',
                    condicoes: condicoes,
                };
                newItemsFromCsv.push(newItem);
            });

            setClassesJudiciais(prev => [...prev, ...newItemsFromCsv]);
            toast({ title: "Importação Concluída", description: `${newItemsFromCsv.length} classes foram importadas com sucesso.` });

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

  const clearFilters = () => {
    setFilters(initialFiltersState);
  };
  
  const handleSelectAllRows = React.useCallback((checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedRowIds(displayedItems.map(item => item.id));
    } else {
      setSelectedRowIds([]);
    }
  }, [displayedItems]);

  const filtersAreActive = React.useMemo(() => {
    return Object.values(filters).some(value => !!value);
  }, [filters]);

  const columnsToPrint = React.useMemo(() => ALL_COLUMNS_CONFIG.filter(col => columnVisibility[col.id as string]), [ALL_COLUMNS_CONFIG, columnVisibility]);
  const dataToPrint = React.useMemo(() => classesJudiciais.filter(c => selectedRowIds.includes(c.id)), [classesJudiciais, selectedRowIds]);
  const handleToggleSelected = React.useCallback((itemId: string) => {
    setSelectedRowIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);
  const visibleColumnsForMemo = React.useMemo(() => {
    return ALL_COLUMNS_CONFIG.filter(col => columnVisibility[col.id as string]);
  }, [ALL_COLUMNS_CONFIG, columnVisibility]);

  const headerCheckboxState = React.useMemo(() => {
    const totalDisplayed = displayedItems.length;
    if (totalDisplayed === 0) return false;
    const totalSelected = selectedRowIds.length;
    if (totalSelected === totalDisplayed) return true;
    if (totalSelected > 0) return 'indeterminate';
    return false;
  }, [displayedItems.length, selectedRowIds.length]);

  if (isPrinting) {
    return (
      <div className="print-container">
        <Card>
          <CardHeader className="non-printable flex-row items-center justify-between">
            <div>
              <CardTitle>Relatório de Classes Judiciais Selecionadas</CardTitle>
              <CardDescription>Exibindo {dataToPrint.length} classes para impressão.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPrinting(false)}>Voltar</Button>
              <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {columnsToPrint.map(column => <TableHead key={column.id as string}>{column.header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataToPrint.map(item => (
                  <TableRow key={item.id}>
                    {columnsToPrint.map(column => <TableCell key={`${item.id}-${column.id as string}`}>{getCellValue(item, column)}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={'container mx-auto py-2'}>
          <>
            <PageHeader title="Cadastro de Classes Judiciais" description="Gerencie os códigos de classe judicial, prazos e destinações.">
              <div className="flex flex-wrap items-center gap-2">
                  <Button variant="destructive" disabled={selectedRowIds.length === 0 || !permissions.exclusaoDados} onClick={() => setIsBulkDeleteOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir ({selectedRowIds.length})
                  </Button>
                  <Button variant="outline" disabled={selectedRowIds.length === 0} onClick={() => setIsBulkEditOpen(true)}>
                      <PenSquare className="mr-2 h-4 w-4" />
                      Alterar em Bloco ({selectedRowIds.length})
                  </Button>
                  <Button variant="outline" onClick={() => setIsPrinting(true)} disabled={selectedRowIds.length === 0}>
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir Seleção ({selectedRowIds.length})
                  </Button>
                  <Button variant="outline" onClick={handleExportSelectedCSV} disabled={selectedRowIds.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Seleção ({selectedRowIds.length})
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
                  <Button variant="outline" onClick={handleExportAllCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Tudo
                  </Button>
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Baixar Modelo
                  </Button>
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
                    <DialogContent className="sm:max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-primary">{isEditing ? 'Editar Classe Judicial' : 'Nova Classe Judicial'}</DialogTitle>
                        <DialogDescription>
                          Preencha as informações abaixo. Campos com * são obrigatórios.
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh] pr-4">
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="codigo">Código Judicial*</Label>
                            <Input id="codigo" value={formState.codigo || ''} onChange={handleInputChange} placeholder="Ex: 1116" />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="descricao">Nome da Classe*</Label>
                            <Input id="descricao" value={formState.descricao || ''} onChange={handleInputChange} placeholder="Ex: Procedimento Comum Cível" />
                            </div>
                        </div>

                        <Card className="p-4">
                           <CardHeader className="p-0 mb-4">
                              <CardTitle className="text-lg">Temporalidade Padrão</CardTitle>
                              <CardDescription>Esta é a temporalidade aplicada caso nenhuma condição abaixo seja satisfeita.</CardDescription>
                          </CardHeader>
                           <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prazoGuardaAnos">Prazo Guarda (Anos)</Label>
                                <Input id="prazoGuardaAnos" type="number" value={formState.prazoGuardaAnos ?? ""} onChange={handleNumericInputChange} placeholder="Nº de anos (ex: 5)" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destinacaoFinal">Destinação Final*</Label>
                                <Select onValueChange={handleSelectChange} value={formState.destinacaoFinal}>
                                    <SelectTrigger id="destinacaoFinal"><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Não se Aplica">Não se Aplica</SelectItem>
                                        <SelectItem value="Vide Guia de Aplicação">Vide Guia de Aplicação</SelectItem>
                                        <SelectItem value="Eliminação">Eliminação</SelectItem>
                                        <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                                        <SelectItem value="Ação">Ação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formState.destinacaoFinal === 'Ação' && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="destinacaoFinalAcao">Descreva a Ação</Label>
                                    <Input id="destinacaoFinalAcao" value={formState.destinacaoFinalAcao || ''} onChange={(e) => setFormState(p => ({...p, destinacaoFinalAcao: e.target.value}))} placeholder="Ex: Digitalizar e devolver" />
                                </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="p-4">
                          <CardHeader className="p-0 mb-4">
                              <CardTitle className="text-lg">Condições de Temporalidade</CardTitle>
                              <CardDescription>Adicione regras condicionais para definir diferentes prazos e destinações. As perguntas serão avaliadas na ordem em que aparecem.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 space-y-4">
                              <RenderCondicoes 
                                condicoes={formState.condicoes || []} 
                                setFormState={setFormState} 
                                onAddCondicao={handleAddCondicao}
                                onRemoveCondicao={handleRemoveCondicao}
                                path={[]} 
                              />
                              <Button type="button" variant="outline" onClick={() => handleAddCondicao([])} className="w-full">
                                  <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Condição Principal
                              </Button>
                          </CardContent>
                        </Card>
                        
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea id="observacoes" value={formState.observacoes || ""} onChange={handleInputChange} placeholder="Detalhes adicionais" />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch id="inativo" checked={formState.inativo} onCheckedChange={(checked) => handleFormCheckboxChange('inativo')(checked)} />
                            <Label htmlFor="inativo">Inativar esta Classe Judicial</Label>
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
              </div>
            </PageHeader>

            <Accordion type="single" collapsible className="w-full mb-6 mt-6" value={isFiltersOpen ? "filters" : ""} onValueChange={(value) => setIsFiltersOpen(value === "filters")}>
              <AccordionItem value="filters" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FilterIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline text-primary text-xl">Filtros das Classes Judiciais</CardTitle>
                  </div>
                  {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </AccordionTrigger>
                <AccordionContent>
                  <CardDescription className="px-6 pb-4 text-sm">
                    Refine a lista de classes judiciais aplicando um ou mais filtros abaixo.
                  </CardDescription>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="filterCodigo">Código</Label>
                      <Input id="filterCodigo" name="codigo" value={filters.codigo} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterDescricao">Nome da Classe</Label>
                      <Input id="filterDescricao" name="descricao" value={filters.descricao} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterDestinacaoFinal">Destinação Final</Label>
                      <Select onValueChange={handleFilterSelectChange('destinacaoFinal')} value={filters.destinacaoFinal}>
                        <SelectTrigger id="filterDestinacaoFinal"><SelectValue placeholder="Todas as destinações" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todas as destinações</SelectItem>
                          <SelectItem value="Não se Aplica">Não se Aplica</SelectItem>
                          <SelectItem value="Vide Guia de Aplicação">Vide Guia de Aplicação</SelectItem>
                          <SelectItem value="Eliminação">Eliminação</SelectItem>
                          <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterStatus">Status</Label>
                      <Select onValueChange={handleFilterSelectChange('status')} value={filters.status}>
                        <SelectTrigger id="filterStatus"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todos os status</SelectItem>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <CardTitle className="font-headline text-primary">Lista de Classes Judiciais</CardTitle>
                  <CardDescription className="mt-1 text-sm text-muted-foreground">
                    {filtersAreActive
                      ? `Exibindo ${displayedItems.length} de ${classesJudiciais.length} classes com base nos filtros aplicados.`
                      : `Exibindo todas as ${classesJudiciais.length} classes cadastradas.`}
                  </CardDescription>
                </div>
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
                          checked={columnVisibility[column.id as string] ?? false}
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
                <ScrollArea className="w-full h-[65vh]">
                  <Table className="min-w-full whitespace-nowrap">
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="sticky left-0 bg-card z-10 w-12 py-2 px-3">
                          <Checkbox
                            checked={headerCheckboxState}
                            onCheckedChange={handleSelectAllRows}
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
                        <TableHead className="sticky right-0 bg-card z-10 text-right py-2 px-3">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedItems.map((item) => (
                        <MemoizedClasseJudicialRow
                            key={item.id}
                            item={item}
                            isSelected={selectedRowIds.includes(item.id)}
                            onToggleSelected={handleToggleSelected}
                            visibleColumns={visibleColumnsForMemo}
                            getCellValue={getCellValue}
                            onEditClick={handleOpenDialog}
                            onDeleteClick={handleDelete}
                            hasDeletePermission={permissions.exclusaoDados}
                        />
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
                    Selecione o campo e o novo valor para aplicar a todas as {selectedRowIds.length} classes judiciais selecionadas.
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
                        {selectedBulkField.type === 'number' && (
                          <Input id="bulk-value" type="number" value={bulkEditValue} onChange={(e) => setBulkEditValue(e.target.value)} />
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
            
          <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente {selectedRowIds.length} classe(s) judicial(is) selecionada(s).
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>Sim, excluir</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </>
      </div>
    </TooltipProvider>
  );
}

interface RenderCondicoesProps {
  condicoes: CondicaoTemporalidade[];
  setFormState: React.Dispatch<React.SetStateAction<Partial<ClasseJudicial>>>;
  onAddCondicao: (path: (string | number)[]) => void;
  onRemoveCondicao: (idToRemove: string) => void;
  path: (string | number)[];
  level?: number;
  parentQuestion?: string;
  parentAnswer?: "Sim" | "Não";
}

const RenderCondicoes: React.FC<RenderCondicoesProps> = ({ condicoes, setFormState, onAddCondicao, onRemoveCondicao, path, level = 0, parentQuestion, parentAnswer }) => {
    const handleCondicaoChange = (id: string, field: keyof CondicaoTemporalidade | 'destinacaoFinalAcaoSeSim' | 'destinacaoFinalAcaoSeNao', value: any) => {
        setFormState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));

            const findAndUpdate = (conds: CondicaoTemporalidade[]) => {
                for (const cond of conds) {
                    if (cond.id === id) {
                        (cond as any)[field] = value;
                        if (field === 'proximaPerguntaSeSim' && !value) cond.subCondicoesSeSim = [];
                        if (field === 'proximaPerguntaSeNao' && !value) cond.subCondicoesSeNao = [];
                        return true;
                    }
                    if (cond.subCondicoesSeSim && findAndUpdate(cond.subCondicoesSeSim)) return true;
                    if (cond.subCondicoesSeNao && findAndUpdate(cond.subCondicoesSeNao)) return true;
                }
                return false;
            };

            findAndUpdate(newState.condicoes || []);
            return newState;
        });
    };

  if (!condicoes || condicoes.length === 0) return null;

  return (
      <div className="space-y-4">
          {condicoes.map((cond, index) => (
              <div key={cond.id} className="p-4 border rounded-md bg-muted/30 relative">
                  {parentQuestion && parentAnswer && (
                    <div className={cn("mb-4 text-xs text-muted-foreground p-2 bg-background/50 rounded-md border", level > 0 && `pl-${level * 4}`)}>
                        <span className="font-semibold">
                            Sub-pergunta para a resposta "{parentAnswer}" da condição:
                        </span>
                        <span className="italic"> "{parentQuestion}"</span>
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => onRemoveCondicao(cond.id)}>
                      <XCircle className="h-4 w-4" />
                  </Button>
                  <div className="space-y-2">
                      <Label htmlFor={`pergunta-${cond.id}`}>Pergunta da Condição {level > 0 && `(Sub-pergunta)`}</Label>
                      <Input id={`pergunta-${cond.id}`} value={cond.pergunta} onChange={e => handleCondicaoChange(cond.id, 'pergunta', e.target.value)} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Resposta SIM */}
                      <div className="p-3 border rounded-md space-y-3 bg-background/50">
                          <h4 className="font-semibold text-green-600">Se a resposta for SIM:</h4>
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`prox-pergunta-sim-${cond.id}`} checked={cond.proximaPerguntaSeSim} onCheckedChange={checked => handleCondicaoChange(cond.id, 'proximaPerguntaSeSim', !!checked)} />
                              <Label htmlFor={`prox-pergunta-sim-${cond.id}`} className="font-normal">Ir para a próxima pergunta</Label>
                          </div>
                          {!cond.proximaPerguntaSeSim ? (
                            <>
                              <div className="space-y-2">
                                  <Label htmlFor={`prazo-sim-${cond.id}`}>Prazo Guarda (Anos)</Label>
                                  <Input type="number" id={`prazo-sim-${cond.id}`} value={cond.prazoSeSim ?? ""} onChange={e => handleCondicaoChange(cond.id, 'prazoSeSim', e.target.value === "" ? undefined : parseInt(e.target.value, 10))} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor={`dest-sim-${cond.id}`}>Destinação Final</Label>
                                  <Select value={cond.destinacaoSeSim} onValueChange={value => handleCondicaoChange(cond.id, 'destinacaoSeSim', value)}>
                                    <SelectTrigger id={`dest-sim-${cond.id}`}><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Eliminação">Eliminação</SelectItem><SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem><SelectItem value="Ação">Ação</SelectItem></SelectContent>
                                  </Select>
                              </div>
                              {cond.destinacaoSeSim === 'Ação' && (
                                  <div className="space-y-2">
                                      <Label htmlFor={`acao-sim-${cond.id}`}>Descreva a Ação</Label>
                                      <Input id={`acao-sim-${cond.id}`} value={cond.destinacaoFinalAcaoSeSim || ''} onChange={e => handleCondicaoChange(cond.id, 'destinacaoFinalAcaoSeSim', e.target.value)} />
                                  </div>
                              )}
                            </>
                          ) : (
                            <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => onAddCondicao([...path, index, 'subCondicoesSeSim'])}>
                                <CornerDownRight className="mr-2 h-3 w-3" /> Adicionar Sub-pergunta (Sim)
                            </Button>
                          )}
                      </div>

                      {/* Resposta NÃO */}
                        <div className="p-3 border rounded-md space-y-3 bg-background/50">
                          <h4 className="font-semibold text-red-600">Se a resposta for NÃO:</h4>
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`prox-pergunta-nao-${cond.id}`} checked={cond.proximaPerguntaSeNao} onCheckedChange={checked => handleCondicaoChange(cond.id, 'proximaPerguntaSeNao', !!checked)} />
                              <Label htmlFor={`prox-pergunta-nao-${cond.id}`} className="font-normal">Ir para a próxima pergunta</Label>
                          </div>
                          {!cond.proximaPerguntaSeNao ? (
                            <>
                              <div className="space-y-2">
                                  <Label htmlFor={`prazo-nao-${cond.id}`}>Prazo Guarda (Anos)</Label>
                                  <Input type="number" id={`prazo-nao-${cond.id}`} value={cond.prazoSeNao ?? ""} onChange={e => handleCondicaoChange(cond.id, 'prazoSeNao', e.target.value === "" ? undefined : parseInt(e.target.value, 10))} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor={`dest-nao-${cond.id}`}>Destinação Final</Label>
                                  <Select value={cond.destinacaoSeNao} onValueChange={value => handleCondicaoChange(cond.id, 'destinacaoSeNao', value)}>
                                    <SelectTrigger id={`dest-nao-${cond.id}`}><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Eliminação">Eliminação</SelectItem><SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem><SelectItem value="Ação">Ação</SelectItem></SelectContent>
                                  </Select>
                              </div>
                                {cond.destinacaoSeNao === 'Ação' && (
                                  <div className="space-y-2">
                                      <Label htmlFor={`acao-nao-${cond.id}`}>Descreva a Ação</Label>
                                      <Input id={`acao-nao-${cond.id}`} value={cond.destinacaoFinalAcaoSeNao || ''} onChange={e => handleCondicaoChange(cond.id, 'destinacaoFinalAcaoSeNao', e.target.value)} />
                                  </div>
                              )}
                            </>
                          ) : (
                              <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => onAddCondicao([...path, index, 'subCondicoesSeNao'])}>
                                  <CornerDownRight className="mr-2 h-3 w-3" /> Adicionar Sub-pergunta (Não)
                              </Button>
                          )}
                      </div>
                  </div>
                  {/* Render sub-conditions */}
                  {cond.proximaPerguntaSeSim && cond.subCondicoesSeSim && (
                      <div className="mt-4">
                          <RenderCondicoes condicoes={cond.subCondicoesSeSim} setFormState={setFormState} onAddCondicao={onAddCondicao} onRemoveCondicao={onRemoveCondicao} path={[...path, index, 'subCondicoesSeSim']} level={level + 1} parentQuestion={cond.pergunta} parentAnswer="Sim" />
                      </div>
                  )}
                  {cond.proximaPerguntaSeNao && cond.subCondicoesSeNao && (
                      <div className="mt-4">
                          <RenderCondicoes condicoes={cond.subCondicoesSeNao} setFormState={setFormState} onAddCondicao={onAddCondicao} onRemoveCondicao={onRemoveCondicao} path={[...path, index, 'subCondicoesSeNao']} level={level + 1} parentQuestion={cond.pergunta} parentAnswer="Não" />
                      </div>
                  )}
              </div>
          ))}
      </div>
  );
};
