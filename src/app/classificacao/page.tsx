
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Classificacao } from "@/types";
import { PlusCircle, Edit, Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Upload, Download, FileSpreadsheet, PenSquare } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { initialClassificacoes } from "@/lib/mock-data";
import { parseCsvRow } from "@/lib/utils";
import { logAction } from "@/lib/audit";
import { useUserSession } from "@/hooks/use-user-session";


const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';

const opcoesCondicaoTextualFaseCorrente = [
  "3 anos após o encerramento",
  "Após aprovação das contas pelo TCU",
  "Até a aposentadoria ou o desligamento",
  "Até a atualização",
  "Até a conclusão da apuração",
  "Até a devolução do bem",
  "Até a homologação do Concurso",
  "Até a informatização ou alienação",
  "Até a posse",
  "Até a próxima atualização",
  "Até a publicação",
  "Até a quitação da dívida",
  "Até devolução",
  "Até devolução dos autos",
  "Até o desfazimento do bem",
  "Até o desligamento do estagiário",
  "Até o desligamento do servidor ou, em caso de haver pensionista(s), 5 anos após o falecimento do último beneficiário",
  "Até o encerramento",
  "Até o encerramento do processo de execução penal",
  "Até o vitaliciamento",
  "Até vigência",
  "Até vigência do contrato ou julgamento TCU",
  "Durante a vigência",
  "Durante o prazo da licitação",
  "Eliminação no momento do recebimento",
  "Enquanto durar a ocupação",
  "Enquanto durar o período de prova",
  "Enquanto durar sessão de julgamento",
  "Enquanto o bem estiver alienado",
  "Enquanto vigente",
  "Enquanto vigora",
  "Imediatamente após a produção",
  "Prazo da licença",
  "Prazo do processo",
  "Validade do Concurso",
];

type ClassificacaoFormState = Omit<Classificacao, 'id' | 'prazoGuardaFaseCorrenteAnos' | 'prazoGuardaFaseIntermediariaAnos'> & {
  prazoGuardaFaseCorrenteAnos?: string;
  prazoGuardaFaseIntermediariaAnos: string;
};

const initialFormState: ClassificacaoFormState = {
  codigo: "",
  descricao: "",
  tipoPlanoClassificacao: "Administrativo",
  status: 'Ativo',
  tipoPrazoFaseCorrente: "Anos",
  prazoGuardaFaseCorrenteAnos: "",
  prazoGuardaFaseCorrenteCondicaoTextual: "",
  prazoGuardaFaseIntermediariaAnos: "",
  destinacaoFinal: "Eliminação",
  observacoes: "",
};


type ColumnConfigClassificacoes = {
  id: keyof Classificacao | string;
  header: string;
  accessorKey: keyof Classificacao | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: Classificacao) => React.ReactNode;
};

const ALL_COLUMNS_CONFIG_CLASSIFICACOES: ColumnConfigClassificacoes[] = [
  { id: 'tipoPlanoClassificacao', header: 'Tipo de Plano', accessorKey: 'tipoPlanoClassificacao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value) => {
        if (value === 'Inativo') return <Badge variant='destructive'>Inativo</Badge>;
        if (value === 'Pendente de Complemento') return <Badge className="border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80 dark:bg-yellow-500 dark:text-yellow-50 dark:hover:bg-yellow-500/80">Pendente</Badge>;
        return <Badge variant='secondary'>Ativo</Badge>;
    }
  },
  { id: 'codigo', header: 'Código', accessorKey: 'codigo', defaultVisible: true, enableSorting: true },
  { id: 'descricao', header: 'Assunto', accessorKey: 'descricao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  {
    id: 'tipoPrazoFaseCorrenteCombined',
    header: 'Tipo Prazo Corrente',
    accessorKey: 'tipoPrazoFaseCorrente',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (_, item) => {
      if (item.tipoPrazoFaseCorrente === "Anos") {
        return `${item.prazoGuardaFaseCorrenteAnos ?? 'N/A'} Anos`;
      }
      if (item.tipoPrazoFaseCorrente === "Condição Textual") {
        return item.prazoGuardaFaseCorrenteCondicaoTextual || "N/A";
      }
      return "N/A";
    }
  },
  {
    id: 'prazoGuardaFaseIntermediariaAnos',
    header: 'Prazo Intermediário',
    accessorKey: 'prazoGuardaFaseIntermediariaAnos',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value) => `${value ?? 'N/A'} Anos`
  },
  { id: 'destinacaoFinal', header: 'Destinação Final', accessorKey: 'destinacaoFinal', defaultVisible: true, enableSorting: true },
  { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
];

type SortConfig = { id: string; direction: 'asc' | 'desc' };

const getCellValueClassificacoes = (item: Classificacao, column: ColumnConfigClassificacoes) => {
  const value = item[column.accessorKey as keyof Classificacao];
  if (column.cellFormatter) {
    return column.cellFormatter(value, item);
  }
  return value === undefined || value === null ? 'N/A' : String(value);
};

interface MemoizedClassificacaoRowProps {
  item: Classificacao;
  isSelected: boolean;
  onToggleSelected: (itemId: string) => void;
  visibleColumns: ColumnConfigClassificacoes[];
  onEditClick: (item: Classificacao) => void;
  onDeleteClick: (itemId: string) => void;
  hasDeletePermission: boolean;
}

const MemoizedClassificacaoRow = React.memo(function MemoizedClassificacaoRow({
  item,
  isSelected,
  onToggleSelected,
  visibleColumns,
  onEditClick,
  onDeleteClick,
  hasDeletePermission,
}: MemoizedClassificacaoRowProps) {
  return (
    <TableRow key={item.id} data-state={isSelected ? "selected" : ""}>
      <TableCell className="py-2 px-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelected(item.id)}
          aria-label={`Selecionar classificação ${item.codigo}`}
        />
      </TableCell>
      {visibleColumns.map((column) => (
        <TableCell key={`${item.id}-${column.id as string}`} className="py-2 px-3">
          {getCellValueClassificacoes(item, column)}
        </TableCell>
      ))}
      <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
        <div className="flex items-center justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Editar Classificação" onClick={() => onEditClick(item)}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Editar Classificação</p></TooltipContent>
          </Tooltip>
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                 <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Classificação" disabled={!hasDeletePermission}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>{hasDeletePermission ? 'Excluir Classificação' : 'Permissão necessária'}</p></TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a classificação "{item.descricao}".
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


export default function ClassificacaoPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { permissions } = useUserSession();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<ClassificacaoFormState>(initialFormState);
  const [classificacoes, setClassificacoes] = React.useState<Classificacao[]>([]);
  const [displayedClassificacoes, setDisplayedClassificacoes] = React.useState<Classificacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);


  const [isEditing, setIsEditing] = React.useState(false);
  const [editingClassificacaoId, setEditingClassificacaoId] = React.useState<string | null>(null);

  const [columnVisibilityClassificacoes, setColumnVisibilityClassificacoes] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG_CLASSIFICACOES.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );
  const [sortingClassificacoes, setSortingClassificacoes] = React.useState<SortConfig[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [bulkEditField, setBulkEditField] = React.useState('');
  const [bulkEditValue, setBulkEditValue] = React.useState<any>('');
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);

  const bulkEditableFields = [
    { value: 'tipoPlanoClassificacao', label: 'Tipo de Plano', type: 'select', options: ['Administrativo', 'Judicial'] },
    { value: 'status', label: 'Status', type: 'select', options: ['Ativo', 'Inativo', 'Pendente de Complemento'] },
    { value: 'destinacaoFinal', label: 'Destinação Final', type: 'select', options: ['Eliminação', 'Guarda Permanente'] },
    { value: 'observacoes', label: 'Observações', type: 'text' },
  ];
  const selectedBulkField = bulkEditableFields.find(f => f.value === bulkEditField);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      setClassificacoes(stored ? JSON.parse(stored) : initialClassificacoes);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setClassificacoes(initialClassificacoes);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
        window.localStorage.setItem(CLASSIFICACOES_STORAGE_KEY, JSON.stringify(classificacoes));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [classificacoes, isDataLoaded]);


  const resetForm = React.useCallback(() => {
    setFormState(initialFormState);
    setIsEditing(false);
    setEditingClassificacaoId(null);
  }, []);

  const handleOpenDialog = React.useCallback((classificacao?: Classificacao) => {
    if (classificacao) {
      setIsEditing(true);
      setEditingClassificacaoId(classificacao.id);
      setFormState({
        ...classificacao,
        prazoGuardaFaseCorrenteAnos: classificacao.prazoGuardaFaseCorrenteAnos !== undefined ? String(classificacao.prazoGuardaFaseCorrenteAnos) : "",
        prazoGuardaFaseIntermediariaAnos: String(classificacao.prazoGuardaFaseIntermediariaAnos),
        prazoGuardaFaseCorrenteCondicaoTextual: classificacao.prazoGuardaFaseCorrenteCondicaoTextual || "",
        observacoes: classificacao.observacoes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
     setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof ClassificacaoFormState) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
     if (id === 'tipoPrazoFaseCorrente') {
      if (value === 'Anos') {
        setFormState(prev => ({ ...prev, prazoGuardaFaseCorrenteCondicaoTextual: "" , prazoGuardaFaseCorrenteAnos: prev.prazoGuardaFaseCorrenteAnos || "" }));
      } else if (value === 'Condição Textual') {
        setFormState(prev => ({ ...prev, prazoGuardaFaseCorrenteAnos: "", prazoGuardaFaseCorrenteCondicaoTextual: prev.prazoGuardaFaseCorrenteCondicaoTextual || "" }));
      }
    }
  };

  const handleSaveChanges = () => {
    const classificacaoDataToSave: Classificacao = {
      id: isEditing && editingClassificacaoId ? editingClassificacaoId : `CLA${Date.now()}`,
      codigo: formState.codigo,
      descricao: formState.descricao,
      tipoPlanoClassificacao: formState.tipoPlanoClassificacao as Classificacao['tipoPlanoClassificacao'],
      status: formState.status,
      tipoPrazoFaseCorrente: formState.tipoPrazoFaseCorrente as Classificacao['tipoPrazoFaseCorrente'],
      prazoGuardaFaseCorrenteAnos: formState.tipoPrazoFaseCorrente === 'Anos' && formState.prazoGuardaFaseCorrenteAnos && formState.prazoGuardaFaseCorrenteAnos.trim() !== "" ? parseInt(formState.prazoGuardaFaseCorrenteAnos, 10) : undefined,
      prazoGuardaFaseCorrenteCondicaoTextual: formState.tipoPrazoFaseCorrente === 'Condição Textual' ? formState.prazoGuardaFaseCorrenteCondicaoTextual : undefined,
      prazoGuardaFaseIntermediariaAnos: formState.prazoGuardaFaseIntermediariaAnos && formState.prazoGuardaFaseIntermediariaAnos.trim() !== "" ? parseInt(formState.prazoGuardaFaseIntermediariaAnos, 10) : 0,
      destinacaoFinal: formState.destinacaoFinal as Classificacao['destinacaoFinal'],
      observacoes: formState.observacoes,
    };

    let updatedClassificacoes;
    if (isEditing && editingClassificacaoId) {
      updatedClassificacoes = classificacoes.map(c =>
        c.id === editingClassificacaoId ? classificacaoDataToSave : c
      );
    } else {
      updatedClassificacoes = [...classificacoes, classificacaoDataToSave];
    }
    setClassificacoes(updatedClassificacoes);
    setSelectedRowIds([]);

    setIsDialogOpen(false);
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

    logAction('BULK_UPDATE_CLASSIFICACOES', {
      count: selectedRowIds.length,
      field: bulkEditField,
      classificacaoIds: selectedRowIds,
    });

    setClassificacoes(prevItems =>
        prevItems.map(item => {
            if (selectedRowIds.includes(item.id)) {
                return { ...item, [bulkEditField]: bulkEditValue };
            }
            return item;
        })
    );
    
    toast({
      title: "Alteração em Bloco Concluída",
      description: `${selectedRowIds.length} classificação(ões) foram atualizadas com sucesso.`,
    });

    setSelectedRowIds([]);
    setIsBulkEditOpen(false);
    setBulkEditField('');
    setBulkEditValue('');
  };
  
  const handleBulkDelete = () => {
    logAction('BULK_DELETE_CLASSIFICACOES', {
      count: selectedRowIds.length,
      classificacaoIds: selectedRowIds,
    });
    setClassificacoes(prev => prev.filter(c => !selectedRowIds.includes(c.id)));
    toast({
      title: "Exclusão em Bloco Concluída",
      description: `${selectedRowIds.length} classificação(ões) foram removidas com sucesso.`,
    });
    setSelectedRowIds([]);
    setIsBulkDeleteOpen(false);
  };


  const getSortableValueClassificacoes = (item: Classificacao, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG_CLASSIFICACOES.find(col => col.id === columnId);
    if (!column) return null;

    if (column.id === 'tipoPrazoFaseCorrenteCombined') {
      if (item.tipoPrazoFaseCorrente === "Anos") return item.prazoGuardaFaseCorrenteAnos;
      if (item.tipoPrazoFaseCorrente === "Condição Textual") return item.prazoGuardaFaseCorrenteCondicaoTextual;
      return null;
    }
    if (column.id === 'status') return item.status;

    return item[column.accessorKey as keyof Classificacao];
  };

  React.useEffect(() => {
    let sortedClassificacoes = [...classificacoes];
    if (sortingClassificacoes.length > 0) {
      sortedClassificacoes.sort((a, b) => {
        for (const sortConfig of sortingClassificacoes) {
          const valA = getSortableValueClassificacoes(a, sortConfig.id);
          const valB = getSortableValueClassificacoes(b, sortConfig.id);

          let comparisonResult = 0;

          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else if (typeof valA === 'number' && typeof valB === 'number') {
            comparisonResult = valA - valB;
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
    setDisplayedClassificacoes(sortedClassificacoes);
  }, [sortingClassificacoes, classificacoes]);


  const handleSortClassificacoes = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG_CLASSIFICACOES.find(col => col.id === columnId);
    if (!columnConfig || !columnConfig.enableSorting) return;

    setSortingClassificacoes(prevSorting => {
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

  const renderSortIconClassificacoes = (columnId: string) => {
    const sortConfig = sortingClassificacoes.find(s => s.id === columnId);
    if (!sortConfig) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const toggleColumnVisibilityClassificacoes = (columnId: string) => {
    setColumnVisibilityClassificacoes(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumnsClassificacoes = () => {
    setColumnVisibilityClassificacoes(
      ALL_COLUMNS_CONFIG_CLASSIFICACOES.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {})
    );
  };

  const handleDeselectAllColumnsClassificacoes = () => {
     setColumnVisibilityClassificacoes(
      ALL_COLUMNS_CONFIG_CLASSIFICACOES.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {})
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'id', 'tipoPlanoClassificacao', 'codigo', 'descricao', 'status',
      'tipoPrazoFaseCorrente', 'prazoGuardaFaseCorrenteAnos', 
      'prazoGuardaFaseCorrenteCondicaoTextual', 'prazoGuardaFaseIntermediariaAnos',
      'destinacaoFinal', 'observacoes'
    ];
    const csvRows = [headers.join(',')];

    const dataToExport = displayedClassificacoes.length > 0 ? displayedClassificacoes : classificacoes;

    dataToExport.forEach(item => {
        const rowData = {
          id: item.id,
          tipoPlanoClassificacao: item.tipoPlanoClassificacao || '',
          codigo: item.codigo,
          descricao: item.descricao,
          status: item.status,
          tipoPrazoFaseCorrente: item.tipoPrazoFaseCorrente || '',
          prazoGuardaFaseCorrenteAnos: item.prazoGuardaFaseCorrenteAnos ?? '',
          prazoGuardaFaseCorrenteCondicaoTextual: item.prazoGuardaFaseCorrenteCondicaoTextual || '',
          prazoGuardaFaseIntermediariaAnos: item.prazoGuardaFaseIntermediariaAnos,
          destinacaoFinal: item.destinacaoFinal,
          observacoes: item.observacoes || '',
        };
        const row = headers.map(header => `"${String(rowData[header as keyof typeof rowData]).replace(/"/g, '""')}"`);
        csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'classificacoes_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Sucesso", description: "Exportação de classificações concluída." });
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'tipoPlanoClassificacao', 'codigo', 'descricao', 'status',
      'tipoPrazoFaseCorrente', 'prazoGuardaFaseCorrenteAnos', 
      'prazoGuardaFaseCorrenteCondicaoTextual', 'prazoGuardaFaseIntermediariaAnos',
      'destinacaoFinal', 'observacoes'
    ];
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_classificacao.csv');
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
            const expectedHeaders = [
              'tipoPlanoClassificacao', 'codigo', 'descricao', 'status', 'tipoPrazoFaseCorrente', 
              'prazoGuardaFaseCorrenteAnos', 'prazoGuardaFaseCorrenteCondicaoTextual', 
              'prazoGuardaFaseIntermediariaAnos', 'destinacaoFinal', 'observacoes'
            ];
            
            const hasAllHeaders = expectedHeaders.every(h => headers.includes(h));
            if (!hasAllHeaders) {
                 toast({ variant: "destructive", title: "Erro de Importação", description: "O cabeçalho do arquivo CSV é inválido. Por favor, utilize o modelo fornecido." });
                 return;
            }

            const newItemsFromCsv: Classificacao[] = [];
            rows.forEach((row, index) => {
                if (!row.trim()) return;
                const values = parseCsvRow(row);
                if (values.length !== headers.length) {
                    console.warn(`Skipping row ${index + 2}: Mismatched column count.`);
                    return;
                }
                const newItemData: { [key: string]: string } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });
                
                const prazoCorrenteAnos = newItemData.prazoGuardaFaseCorrenteAnos ? parseInt(newItemData.prazoGuardaFaseCorrenteAnos, 10) : undefined;
                const prazoIntermediarioAnos = parseInt(newItemData.prazoGuardaFaseIntermediariaAnos, 10);

                const newItem: Classificacao = {
                    id: `CLA_IMP_${Date.now()}_${index}`,
                    tipoPlanoClassificacao: newItemData.tipoPlanoClassificacao as Classificacao['tipoPlanoClassificacao'] || 'Administrativo',
                    codigo: newItemData.codigo,
                    descricao: newItemData.descricao,
                    status: (newItemData.status as Classificacao['status']) || 'Pendente de Complemento',
                    tipoPrazoFaseCorrente: newItemData.tipoPrazoFaseCorrente as Classificacao['tipoPrazoFaseCorrente'] || 'Anos',
                    prazoGuardaFaseCorrenteAnos: isNaN(prazoCorrenteAnos as number) ? undefined : prazoCorrenteAnos,
                    prazoGuardaFaseCorrenteCondicaoTextual: newItemData.prazoGuardaFaseCorrenteCondicaoTextual,
                    prazoGuardaFaseIntermediariaAnos: isNaN(prazoIntermediarioAnos) ? 0 : prazoIntermediarioAnos,
                    destinacaoFinal: (newItemData.destinacaoFinal as Classificacao['destinacaoFinal']) || 'Eliminação',
                    observacoes: newItemData.observacoes,
                };
                newItemsFromCsv.push(newItem);
            });

            setClassificacoes(prev => [...prev, ...newItemsFromCsv]);
            toast({ title: "Importação Concluída", description: `${newItemsFromCsv.length} classificações foram importadas com sucesso.` });

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

  const numDisplayed = displayedClassificacoes.length;
  const numSelected = selectedRowIds.length;

  const handleToggleSelectedRow = React.useCallback((itemId: string) => {
    setSelectedRowIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleDeleteRow = React.useCallback((itemId: string) => {
    logAction('DELETE_CLASSIFICACAO', { classificacaoId: itemId });
    setClassificacoes(prev => prev.filter(item => item.id !== itemId));
    toast({ title: "Sucesso", description: "Classificação excluída." });
  }, [toast]);
  
  const visibleColumnsForMemo = React.useMemo(() => {
    return ALL_COLUMNS_CONFIG_CLASSIFICACOES.filter(col => columnVisibilityClassificacoes[col.id as string]);
  }, [columnVisibilityClassificacoes]);


  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classificação" description="Gerencie os códigos de classificação de assuntos dos documentos.">
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="destructive" disabled={selectedRowIds.length === 0 || !permissions.exclusaoDados} onClick={() => setIsBulkDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir ({selectedRowIds.length})
            </Button>
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
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Classificação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary">{isEditing ? "Editar Classificação" : "Nova Classificação"}</DialogTitle>
                <DialogDescription>
                  Preencha as informações abaixo para {isEditing ? "editar a" : "cadastrar uma nova"} classificação.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoPlanoClassificacao">Tipo de Plano</Label>
                  <Select onValueChange={handleSelectChange('tipoPlanoClassificacao')} value={formState.tipoPlanoClassificacao}>
                    <SelectTrigger id="tipoPlanoClassificacao">
                      <SelectValue placeholder="Selecione o tipo de plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Judicial">Judicial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" value={formState.codigo} onChange={handleInputChange} placeholder="Ex: 020.1" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Assunto</Label>
                  <Input id="descricao" value={formState.descricao} onChange={handleInputChange} placeholder="Ex: Processos Judiciais Cíveis" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={handleSelectChange('status')} value={formState.status}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Pendente de Complemento">Pendente de Complemento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoPrazoFaseCorrente">Tipo Prazo Corrente</Label>
                  <Select onValueChange={handleSelectChange('tipoPrazoFaseCorrente')} value={formState.tipoPrazoFaseCorrente}>
                    <SelectTrigger id="tipoPrazoFaseCorrente">
                      <SelectValue placeholder="Selecione o tipo de prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anos">Anos</SelectItem>
                      <SelectItem value="Condição Textual">Condição Textual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formState.tipoPrazoFaseCorrente === "Anos" && (
                  <div className="space-y-2">
                    <Label htmlFor="prazoGuardaFaseCorrenteAnos">Prazo Corrente (Anos)</Label>
                    <Input id="prazoGuardaFaseCorrenteAnos" type="number" value={formState.prazoGuardaFaseCorrenteAnos ?? ""} onChange={handleNumericInputChange} placeholder="Nº de anos (ex: 5)" />
                  </div>
                )}

                {formState.tipoPrazoFaseCorrente === "Condição Textual" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="prazoGuardaFaseCorrenteCondicaoTextual">Prazo Corrente (Condição)</Label>
                    <Select onValueChange={handleSelectChange('prazoGuardaFaseCorrenteCondicaoTextual')} value={formState.prazoGuardaFaseCorrenteCondicaoTextual}>
                      <SelectTrigger id="prazoGuardaFaseCorrenteCondicaoTextual">
                        <SelectValue placeholder="Selecione a condição textual" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        {opcoesCondicaoTextualFaseCorrente.map(opcao => (
                          <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="prazoGuardaFaseIntermediariaAnos">Prazo Intermed. (Anos)</Label>
                  <Input id="prazoGuardaFaseIntermediariaAnos" type="number" value={formState.prazoGuardaFaseIntermediariaAnos} onChange={handleNumericInputChange} placeholder="Nº de anos (ex: 15, pode ser 0)" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinacaoFinal">Destinação Final</Label>
                  <Select onValueChange={handleSelectChange('destinacaoFinal')} value={formState.destinacaoFinal}>
                    <SelectTrigger id="destinacaoFinal">
                      <SelectValue placeholder="Selecione a destinação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eliminação">Eliminação</SelectItem>
                      <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={formState.observacoes} onChange={handleInputChange} placeholder="Detalhes adicionais" />
                </div>

              </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveChanges}>Salvar Classificação</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-primary">Lista de Classificações</CardTitle>
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
                <DropdownMenuItem onSelect={handleSelectAllColumnsClassificacoes} className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Selecionar Todas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDeselectAllColumnsClassificacoes} className="cursor-pointer">
                  <Square className="mr-2 h-4 w-4" />
                  Limpar Todas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_COLUMNS_CONFIG_CLASSIFICACOES.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibilityClassificacoes[column.id as string]}
                    onCheckedChange={() => toggleColumnVisibilityClassificacoes(column.id as string)}
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
                          setSelectedRowIds(displayedClassificacoes.map(c => c.id));
                        } else {
                          setSelectedRowIds([]);
                        }
                      }}
                      aria-label="Selecionar todas as linhas"
                    />
                  </TableHead>
                  {ALL_COLUMNS_CONFIG_CLASSIFICACOES.map((column) =>
                    columnVisibilityClassificacoes[column.id as string] ? (
                      <TableHead key={column.id as string} className="py-2 px-3">
                        {column.enableSorting ? (
                          <Button
                            variant="ghost"
                            onClick={() => handleSortClassificacoes(column.id as string)}
                            className="px-1 py-1 h-auto -ml-2"
                          >
                            {column.header}
                            {renderSortIconClassificacoes(column.id as string)}
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
                {displayedClassificacoes.map((item) => (
                  <MemoizedClassificacaoRow
                    key={item.id}
                    item={item}
                    isSelected={selectedRowIds.includes(item.id)}
                    onToggleSelected={handleToggleSelectedRow}
                    visibleColumns={visibleColumnsForMemo}
                    onEditClick={handleOpenDialog}
                    onDeleteClick={handleDeleteRow}
                    hasDeletePermission={permissions.exclusaoDados}
                  />
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {displayedClassificacoes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma classificação encontrada.</p>
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
              Selecione o campo e o novo valor para aplicar a todas as {selectedRowIds.length} classificações selecionadas.
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
      
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente {selectedRowIds.length} classificação(ões) selecionada(s).
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Sim, excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
