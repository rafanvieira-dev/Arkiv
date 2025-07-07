
"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ListagemEliminacao, Documento, ParteDocumento } from "@/types";
import { PlusCircle, Edit, Trash2, FileSearch, ArrowUpDown, ArrowUp, ArrowDown, ColumnsIcon, CheckSquare, Square, ListFilter, Upload, Download, FileSpreadsheet, PenSquare, FilterIcon, ChevronUp, ChevronDown, RotateCcw, Printer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
import { DateInputPicker } from "@/components/date-input-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { placeholderDocumentos, placeholderClassificacoesSimulado, simulatedListagensData } from "@/lib/mock-data";
import { parseCsvRow } from "@/lib/utils";
import { logAction } from "@/lib/audit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { parseISO, isAfter, isBefore } from "date-fns";
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
import { useUserSession } from "@/hooks/use-user-session";


type SimulatedDocumentForDialog = Pick<
  Documento,
  'id' |
  'numeroDocumento' |
  'tipoDocumento' |
  'descricaoDocumento' |
  'dataAbrangente' |
  'classificacaoArquivisticaId' |
  'status' |
  'anoEliminacaoPrevisto' |
  'destinacaoFinalDisplay' |
  'alteracaoDestinacaoFinal' |
  'partes' |
  'segredoJustica'
>;

const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';


const initialFormState: Partial<ListagemEliminacao> = {
  numeroListagem: "",
  tipoListagem: 'Processos Judiciais',
  unidadeSetor: "",
  documentoIds: [],
  numeroEditalCiencia: "",
  dataPublicacaoEdital: undefined,
  dataProducaoListagem: new Date().toISOString(),
  numeroTermoEliminacao: "",
  dataProducaoTermoEliminacao: undefined,
  observacoes: "",
};

const initialFiltersState = {
  numeroListagem: "",
  status: "",
  numeroEditalCiencia: "",
  numeroTermoEliminacao: "",
  dataProducaoDe: undefined as Date | undefined,
  dataProducaoAte: undefined as Date | undefined,
  dataPublicacaoDe: undefined as Date | undefined,
  dataPublicacaoAte: undefined as Date | undefined,
};
const ALL_VALUES_SENTINEL = "ALL_VALUES";

type DialogTableSortConfig = { id: keyof SimulatedDocumentForDialog | 'codigoClassificacao' | 'assuntoClassificacao' | string; direction: 'asc' | 'desc'; };
type DialogTableFilters = { anoEliminacaoPrevisto: string; };

type ColumnConfigListagens = {
  id: keyof ListagemEliminacao | string;
  header: string;
  accessorKey: keyof ListagemEliminacao | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: ListagemEliminacao) => React.ReactNode;
};

const ALL_COLUMNS_CONFIG_LISTAGENS: ColumnConfigListagens[] = [
  {
    id: 'numeroListagem',
    header: 'Nº Listagem',
    accessorKey: 'numeroListagem',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value, item) => {
      if (item.documentoIds && item.documentoIds.length > 0) {
        return (
          <Link href={`/documentos?listagemDocIds=${encodeURIComponent(item.documentoIds.join(','))}&numeroListagem=${encodeURIComponent(item.numeroListagem)}`} passHref>
            <span className="text-primary hover:underline cursor-pointer font-medium">
              {value}
            </span>
          </Link>
        );
      }
      return value;
    }
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'dataProducaoTermoEliminacao',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value, item) => {
      if (item.dataProducaoTermoEliminacao) {
        return <Badge variant="destructive">Efetivada</Badge>;
      }
      if (item.dataPublicacaoEdital) {
        return <Badge className="border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80 dark:bg-yellow-500 dark:text-yellow-50 dark:hover:bg-yellow-500/80">Edital Publicado</Badge>;
      }
      return <Badge variant="secondary">Tramitando</Badge>;
    }
  },
   { id: 'tipoListagem', header: 'Tipo Listagem', accessorKey: 'tipoListagem', defaultVisible: false, enableSorting: true },
   { id: 'unidadeSetor', header: 'Unidade/Setor', accessorKey: 'unidadeSetor', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  {
    id: 'dataProducaoListagem',
    header: 'Data Prod. Listagem',
    accessorKey: 'dataProducaoListagem',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} />
  },
  {
    id: 'qtdDocumentos',
    header: 'Qtd. Docs',
    accessorKey: 'documentoIds',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (_, item) => Array.isArray(item.documentoIds) ? item.documentoIds.length : 0
  },
  { id: 'numeroEditalCiencia', header: 'Nº Edital', accessorKey: 'numeroEditalCiencia', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  {
    id: 'dataPublicacaoEdital',
    header: 'Data Pub. Edital',
    accessorKey: 'dataPublicacaoEdital',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} />
  },
  { id: 'numeroTermoEliminacao', header: 'Nº Termo Elim.', accessorKey: 'numeroTermoEliminacao', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  {
    id: 'dataProducaoTermoEliminacao',
    header: 'Data Prod. Termo',
    accessorKey: 'dataProducaoTermoEliminacao',
    defaultVisible: false,
    enableSorting: true,
    cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} />
  },
  { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
];

type DialogDocumentColumn = {
  id: keyof SimulatedDocumentForDialog | 'selection' | 'codigoClassificacao' | 'assuntoClassificacao' | 'status' | 'partes';
  header: string | React.ReactNode;
  accessorKey: keyof SimulatedDocumentForDialog | 'selection' | 'codigoClassificacao' | 'assuntoClassificacao' | 'status' | string;
  enableSorting: boolean;
  cellFormatter?: (value: any, doc: SimulatedDocumentForDialog) => React.ReactNode;
};


export default function ListagensEliminacaoPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { permissions } = useUserSession();
  const [listagens, setListagens] = React.useState<ListagemEliminacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [displayedListagens, setDisplayedListagens] = React.useState<ListagemEliminacao[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<ListagemEliminacao>>(initialFormState);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingListagemId, setEditingListagemId] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<DialogTableSortConfig[]>([]);

  const [columnVisibilityListagens, setColumnVisibilityListagens] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG_LISTAGENS.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );

  const [simulatedDocuments, setSimulatedDocuments] = React.useState<SimulatedDocumentForDialog[]>([]);
  const [documentsForDialog, setDocumentsForDialog] = React.useState<SimulatedDocumentForDialog[]>([]);
  const [selectedDialogDocIds, setSelectedDialogDocIds] = React.useState<string[]>([]);
  const [dialogTableFilters, setDialogTableFilters] = React.useState<DialogTableFilters>({ anoEliminacaoPrevisto: "" });
  const [dialogTableSortConfig, setDialogTableSortConfig] = React.useState<DialogTableSortConfig[]>([]);
  const [isDocumentTableVisible, setIsDocumentTableVisible] = React.useState(false);

  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [bulkEditField, setBulkEditField] = React.useState('');
  const [bulkEditValue, setBulkEditValue] = React.useState<any>('');
  
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);

  const [filters, setFilters] = React.useState(initialFiltersState);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const bulkEditableFields = [
    { value: 'numeroEditalCiencia', label: 'Nº Edital Ciência', type: 'text' },
    { value: 'dataPublicacaoEdital', label: 'Data Pub. Edital', type: 'date' },
    { value: 'numeroTermoEliminacao', label: 'Nº Termo Eliminação', type: 'text' },
    { value: 'dataProducaoTermoEliminacao', label: 'Data Prod. Termo', type: 'date' },
    { value: 'observacoes', label: 'Observações', type: 'text' },
  ];
  const selectedBulkField = bulkEditableFields.find(f => f.value === bulkEditField);
  
  const eligibleDocsForSelection = React.useMemo(() => 
    documentsForDialog.filter(doc => doc.status === "Arquivado" || doc.status === "Aguardando prazo para eliminação"),
    [documentsForDialog]
  );
  
  const headerCheckboxState = React.useMemo(() => {
    const totalEligible = eligibleDocsForSelection.length;
    if (totalEligible === 0) return false;

    const selectedEligibleCount = eligibleDocsForSelection.filter(doc => 
        selectedDialogDocIds.includes(doc.id)
    ).length;
    
    if (selectedEligibleCount === totalEligible) return true;
    if (selectedEligibleCount > 0) return 'indeterminate';
    return false;
  }, [eligibleDocsForSelection, selectedDialogDocIds]);

  const DIALOG_DOCUMENT_COLUMNS: DialogDocumentColumn[] = React.useMemo(() => [
    {
      id: 'selection',
      header: (
        <Checkbox
          checked={headerCheckboxState}
          onCheckedChange={(value) => {
             const eligibleDocIds = eligibleDocsForSelection.map(d => d.id);
            setSelectedDialogDocIds(value === true ? eligibleDocIds : []);
          }}
          aria-label="Selecionar todos os documentos elegíveis"
        />
      ),
      accessorKey: 'selection',
      enableSorting: false,
      cellFormatter: (_, doc) => {
        const isSelectable = doc.status === "Arquivado" || doc.status === "Aguardando prazo para eliminação";
        return (
          <Checkbox
            checked={selectedDialogDocIds.includes(doc.id)}
            onCheckedChange={(value) => {
              setSelectedDialogDocIds(prev => value ? [...prev, doc.id] : prev.filter(id => id !== doc.id));
            }}
            aria-label={`Selecionar documento ${doc.numeroDocumento}`}
            disabled={!isSelectable}
          />
        )
      }
    },
    { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento', enableSorting: true },
    { id: 'tipoDocumento', header: 'Espécie de Documento', accessorKey: 'tipoDocumento', enableSorting: true },
    { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', enableSorting: false, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
    { 
      id: 'partes', 
      header: 'Partes', 
      accessorKey: 'partes', 
      enableSorting: false,
      cellFormatter: (partes?: ParteDocumento[]) => {
          if (!partes || partes.length === 0) return 'N/A';
          const names = partes.map(p => p.nome).join(', ');
          return <span className="block max-w-xs truncate" title={names}>{names}</span>;
      }
    },
    { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente', enableSorting: true },
    {
      id: 'codigoClassificacao',
      header: 'Cód. Class.',
      accessorKey: 'classificacaoArquivisticaId',
      enableSorting: true,
      cellFormatter: (_, doc) => {
        const classificacao = placeholderClassificacoesSimulado.find(c => c.id === doc.classificacaoArquivisticaId);
        return classificacao ? classificacao.codigo : "N/A";
      }
    },
    {
      id: 'assuntoClassificacao',
      header: 'Assunto',
      accessorKey: 'classificacaoArquivisticaId',
      enableSorting: true,
      cellFormatter: (_, doc) => {
        const classificacao = placeholderClassificacoesSimulado.find(c => c.id === doc.classificacaoArquivisticaId);
        return classificacao ? <span className="block max-w-xs truncate" title={classificacao.descricao}>{classificacao.descricao}</span> : "N/A";
      }
    },
    { id: 'anoEliminacaoPrevisto', header: 'Ano Elim. Prev.', accessorKey: 'anoEliminacaoPrevisto', enableSorting: true },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cellFormatter: (value) => (
        <Badge
          variant={
            value === 'Arquivado' ? 'secondary' :
            value === 'Aguardando prazo para eliminação' ? 'default' : // Default often blue or primary
            value === 'Eliminado' ? 'destructive' :
            'outline'
          }
          className={
            value === 'Aguardando prazo para eliminação' ? 'border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80 dark:bg-yellow-500 dark:text-yellow-50 dark:hover:bg-yellow-500/80' :
            value === 'Eliminado' ? '' : ''
          }
        >
          {value}
        </Badge>
      )
    },
  ], [headerCheckboxState, eligibleDocsForSelection, selectedDialogDocIds]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
      setListagens(stored ? JSON.parse(stored) : simulatedListagensData);

      const docsStored = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      setSimulatedDocuments(docsStored ? JSON.parse(docsStored) : placeholderDocumentos);

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setListagens(simulatedListagensData);
      setSimulatedDocuments(placeholderDocumentos);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
        window.localStorage.setItem(LISTAGENS_STORAGE_KEY, JSON.stringify(listagens));
        window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(simulatedDocuments));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [listagens, simulatedDocuments, isDataLoaded]);

  React.useEffect(() => {
    let filteredDocs = simulatedDocuments.filter(doc => {
        const isSelected = selectedDialogDocIds.includes(doc.id);

        let passesTextFilters = true;
        if (dialogTableFilters.anoEliminacaoPrevisto) {
            if (!doc.anoEliminacaoPrevisto || !doc.anoEliminacaoPrevisto.includes(dialogTableFilters.anoEliminacaoPrevisto)) {
                passesTextFilters = false;
            }
        }
        if (!passesTextFilters && !isSelected) return false; // If not selected and doesn't pass text filters, exclude

        // If selected, ignore status filter, otherwise apply status filter
        if (isSelected) return true;

        const isEligibleForAdding = doc.status === "Arquivado" || doc.status === "Aguardando prazo para eliminação";
        return isEligibleForAdding;
    });

    if (dialogTableSortConfig.length > 0) {
      filteredDocs.sort((a, b) => {
        for (const sortConf of dialogTableSortConfig) {
          let valA, valB;
          if (sortConf.id === 'codigoClassificacao' || sortConf.id === 'assuntoClassificacao') {
            const classA = placeholderClassificacoesSimulado.find(c => c.id === a.classificacaoArquivisticaId);
            const classB = placeholderClassificacoesSimulado.find(c => c.id === b.classificacaoArquivisticaId);
            valA = sortConf.id === 'codigoClassificacao' ? classA?.codigo : classA?.descricao;
            valB = sortConf.id === 'codigoClassificacao' ? classB?.codigo : classB?.descricao;
          } else {
            valA = (a as any)[sortConf.id];
            valB = (b as any)[sortConf.id];
          }

          let comparisonResult = 0;
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
          if (comparisonResult !== 0) return sortConf.direction === 'asc' ? comparisonResult : -comparisonResult;
        }
        return 0;
      });
    }
    setDocumentsForDialog(filteredDocs);
  }, [simulatedDocuments, dialogTableFilters, dialogTableSortConfig, selectedDialogDocIds]);

  const handleDialogTableSort = (columnId: keyof SimulatedDocumentForDialog | 'codigoClassificacao' | 'assuntoClassificacao' | string) => {
    setDialogTableSortConfig(prevSorting => {
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

  const renderDialogTableSortIcon = (columnId: keyof SimulatedDocumentForDialog | 'codigoClassificacao' | 'assuntoClassificacao' | 'status' | string) => {
    const sortConf = dialogTableSortConfig.find(s => s.id === columnId);
    if (!sortConf) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />;
    if (sortConf.direction === 'asc') return <ArrowUp className="ml-2 h-3 w-3" />;
    return <ArrowDown className="ml-2 h-3 w-3" />;
  };


  const resetFormAndDialogState = () => {
    setFormState({ ...initialFormState, dataProducaoListagem: new Date().toISOString() });
    setIsEditing(false);
    setEditingListagemId(null);
    setSelectedDialogDocIds([]);
    setDialogTableFilters({ anoEliminacaoPrevisto: "" });
    setDialogTableSortConfig([]);
    setIsDocumentTableVisible(false);
  };

  const handleOpenDialog = React.useCallback((listagem?: ListagemEliminacao) => {
    let processedDocsInit = placeholderDocumentos.map(doc => ({ ...doc }));

    if (listagem) {
      setIsEditing(true);
      setEditingListagemId(listagem.id);
      setFormState({
        ...initialFormState,
        ...listagem,
        dataProducaoListagem: listagem.dataProducaoListagem || new Date().toISOString(),
      });
      setSelectedDialogDocIds(listagem.documentoIds || []);

      // Process status change due to dataPublicacaoEdital
      if (listagem.dataPublicacaoEdital && listagem.documentoIds && listagem.documentoIds.length > 0) {
        processedDocsInit = processedDocsInit.map(doc => {
          if (listagem.documentoIds.includes(doc.id) && doc.status === "Arquivado") {
            return { ...doc, status: "Aguardando prazo para eliminação" as Documento['status'] };
          }
          return doc;
        });
      }
      // Process status change due to dataProducaoTermoEliminacao, based on potentially already updated status
      if (listagem.dataProducaoTermoEliminacao && listagem.documentoIds && listagem.documentoIds.length > 0) {
         processedDocsInit = processedDocsInit.map(doc => {
          if (listagem.documentoIds.includes(doc.id) && doc.status === "Aguardando prazo para eliminação") {
            return { ...doc, status: "Eliminado" as Documento['status'] };
          }
          return doc;
        });
      }
      setSimulatedDocuments(processedDocsInit);

      if (listagem.documentoIds && listagem.documentoIds.length > 0) {
        setIsDocumentTableVisible(true);
      } else {
        setIsDocumentTableVisible(false);
      }
    } else {
      setFormState({ ...initialFormState, dataProducaoListagem: new Date().toISOString() });
      setIsEditing(false);
      setEditingListagemId(null);
      setSelectedDialogDocIds([]);
      setSimulatedDocuments(processedDocsInit);
      setIsDocumentTableVisible(false);
    }
    setDialogTableFilters({ anoEliminacaoPrevisto: "" });
    setDialogTableSortConfig([]);
    setIsDialogOpen(true);
  }, [setSimulatedDocuments, setIsEditing, setEditingListagemId, setFormState, setSelectedDialogDocIds, setIsDocumentTableVisible, setDialogTableFilters, setDialogTableSortConfig, setIsDialogOpen ]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
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


  const handleDateChange = (id: keyof ListagemEliminacao) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));

    if (id === 'dataPublicacaoEdital') {
        setSimulatedDocuments(prevDocs => {
            let affectedCount = 0;
            const updatedDocs = prevDocs.map(doc => {
                if (date && selectedDialogDocIds.includes(doc.id) && doc.status === "Arquivado") {
                    affectedCount++;
                    return { ...doc, status: "Aguardando prazo para eliminação" as Documento['status'] };
                }
                return doc;
            });
            if (affectedCount > 0) {
                toast({
                    title: "Status dos Documentos Atualizado",
                    description: `${affectedCount} documento(s) selecionado(s) tiveram seu status alterado para "Aguardando prazo para eliminação".`,
                });
            }
            return updatedDocs;
        });
    }

    if (id === 'dataProducaoTermoEliminacao') {
        setSimulatedDocuments(prevDocs => {
            let affectedCount = 0;
            const updatedDocs = prevDocs.map(doc => {
                if (date && selectedDialogDocIds.includes(doc.id) && doc.status === "Aguardando prazo para eliminação") {
                    affectedCount++;
                    return { ...doc, status: "Eliminado" as Documento['status'] };
                }
                return doc;
            });
            if (affectedCount > 0) {
                 toast({
                    title: "Status dos Documentos Atualizado",
                    description: `${affectedCount} documento(s) selecionado(s) tiveram seu status alterado para "Eliminado".`,
                });
            }
            return updatedDocs;
        });
    }
  };

  const handleSaveChanges = () => {
    const invalidDocEntries: Array<{ id: string; reason: string }> = [];

    const finalSelectedDocsData = selectedDialogDocIds.map(id =>
        simulatedDocuments.find(d => d.id === id)
    ).filter(Boolean) as SimulatedDocumentForDialog[];


    finalSelectedDocsData.forEach(docData => {
      let isInvalid = false;
      let reasons: string[] = [];

      const isProcessedByEdital = formState.dataPublicacaoEdital && docData.status === "Aguardando prazo para eliminação";
      const isProcessedByTermo = formState.dataProducaoTermoEliminacao && docData.status === "Eliminado";
      const isStillArchived = docData.status === "Arquivado";

      let effectiveDestinacao = docData.destinacaoFinalDisplay;
      if (docData.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" ||
          docData.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
        effectiveDestinacao = "Guarda Permanente";
      }
      if (effectiveDestinacao === "Guarda Permanente") {
        isInvalid = true;
        reasons.push(`destinação final efetiva 'Guarda Permanente'`);
      }

      if (isInvalid) {
        invalidDocEntries.push({ id: docData.id, reason: reasons.join('; ') });
      }
    });

    if (invalidDocEntries.length > 0) {
      const errorMessages = invalidDocEntries.map(entry => `${entry.id} (${entry.reason})`).join(' | ');
      toast({
        variant: "destructive",
        title: "Erro de Validação de Documentos",
        description: `Os seguintes documentos não podem ser incluídos ou mantidos na listagem: ${errorMessages}. Verifique status e destinação.`,
        duration: 8000,
      });
      return;
    }
    if (selectedDialogDocIds.length === 0 && !isEditing) {
        toast({
            variant: "destructive",
            title: "Nenhum Documento Selecionado",
            description: "Por favor, selecione ao menos um documento para incluir na listagem.",
            duration: 5000,
        });
        return;
    }


    const listagemDataToSave: ListagemEliminacao = {
      id: isEditing && editingListagemId ? editingListagemId : `LE${Date.now()}`,
      numeroListagem: formState.numeroListagem || "",
      tipoListagem: formState.tipoListagem || 'Processos Judiciais',
      unidadeSetor: formState.unidadeSetor,
      documentoIds: selectedDialogDocIds,
      numeroEditalCiencia: formState.numeroEditalCiencia,
      dataPublicacaoEdital: formState.dataPublicacaoEdital,
      dataProducaoListagem: formState.dataProducaoListagem || new Date().toISOString(),
      numeroTermoEliminacao: formState.numeroTermoEliminacao,
      dataProducaoTermoEliminacao: formState.dataProducaoTermoEliminacao,
      observacoes: formState.observacoes || "",
    };

    let updatedListagens;
    if (isEditing && editingListagemId) {
      updatedListagens = listagens.map(l => l.id === editingListagemId ? listagemDataToSave : l);
    } else {
      updatedListagens = [...listagens, listagemDataToSave];
    }
    setListagens(updatedListagens);

    if (listagemDataToSave.documentoIds.length > 0) {
        setSimulatedDocuments(prevSimulatedGlobalDocs =>
            prevSimulatedGlobalDocs.map(globalDoc => {
                if (listagemDataToSave.documentoIds.includes(globalDoc.id)) {
                    let newStatus = globalDoc.status;
                    if (listagemDataToSave.dataPublicacaoEdital && globalDoc.status === "Arquivado") {
                        newStatus = "Aguardando prazo para eliminação";
                    }
                    if (listagemDataToSave.dataProducaoTermoEliminacao && newStatus === "Aguardando prazo para eliminação") {
                        newStatus = "Eliminado";
                    }
                    return { ...globalDoc, status: newStatus as Documento['status'] };
                }
                return globalDoc;
            })
        );
    }


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

    logAction('BULK_UPDATE_LISTAGENS', {
      count: selectedRowIds.length,
      field: bulkEditField,
      listagemIds: selectedRowIds,
    });

    setListagens(prevItems =>
        prevItems.map(item => {
            if (selectedRowIds.includes(item.id)) {
                const valueToSet = (bulkEditField === 'dataPublicacaoEdital' || bulkEditField === 'dataProducaoTermoEliminacao') && bulkEditValue instanceof Date
                  ? bulkEditValue.toISOString()
                  : bulkEditValue;
                return { ...item, [bulkEditField]: valueToSet };
            }
            return item;
        })
    );
    
    toast({
      title: "Alteração em Bloco Concluída",
      description: `${selectedRowIds.length} listagem(ns) foram atualizadas com sucesso.`,
    });

    setSelectedRowIds([]);
    setIsBulkEditOpen(false);
    setBulkEditField('');
    setBulkEditValue('');
  };


  const getSortableValue = (item: ListagemEliminacao, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG_LISTAGENS.find(col => col.id === columnId);
    if (!column) return null;

    const value = item[column.accessorKey as keyof ListagemEliminacao];

    if (column.accessorKey === 'documentoIds' && Array.isArray(value)) {
      return value.length;
    }
    if (['dataProducaoListagem', 'dataPublicacaoEdital', 'dataProducaoTermoEliminacao'].includes(column.accessorKey as string) && typeof value === 'string') {
      const parsedDate = Date.parse(value);
      return !isNaN(parsedDate) ? new Date(parsedDate) : null;
    }
    return value;
  };

  React.useEffect(() => {
    const getStatus = (item: ListagemEliminacao) => {
        if (item.dataProducaoTermoEliminacao) return "Efetivada";
        if (item.dataPublicacaoEdital) return "Edital Publicado";
        return "Tramitando";
    };

    let itemsToDisplay = listagens.filter(item => {
      if (filters.numeroListagem && !item.numeroListagem.toLowerCase().includes(filters.numeroListagem.toLowerCase())) return false;
      if (filters.numeroEditalCiencia && !item.numeroEditalCiencia?.toLowerCase().includes(filters.numeroEditalCiencia.toLowerCase())) return false;
      if (filters.numeroTermoEliminacao && !item.numeroTermoEliminacao?.toLowerCase().includes(filters.numeroTermoEliminacao.toLowerCase())) return false;
      if (filters.status && getStatus(item) !== filters.status) return false;

      const dataProducaoDate = parseISO(item.dataProducaoListagem);
      if (filters.dataProducaoDe && isBefore(dataProducaoDate, filters.dataProducaoDe)) return false;
      if (filters.dataProducaoAte && isAfter(dataProducaoDate, filters.dataProducaoAte)) return false;

      if (filters.dataPublicacaoDe || filters.dataPublicacaoAte) {
        if (!item.dataPublicacaoEdital) return false;
        const dataPublicacaoDate = parseISO(item.dataPublicacaoEdital);
        if (filters.dataPublicacaoDe && isBefore(dataPublicacaoDate, filters.dataPublicacaoDe)) return false;
        if (filters.dataPublicacaoAte && isAfter(dataPublicacaoDate, filters.dataPublicacaoAte)) return false;
      }
      return true;
    });

    if (sorting.length > 0) {
      itemsToDisplay.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = getSortableValue(a, sortConfig.id as string);
          const valB = getSortableValue(b, sortConfig.id as string);
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
    setDisplayedListagens(itemsToDisplay);
  }, [filters, sorting, listagens, getSortableValue]);


  const handleSort = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG_LISTAGENS.find(col => col.id === columnId);
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

  const handleDelete = (listagemId: string) => {
    setListagens(prev => prev.filter(item => item.id !== listagemId));
    toast({
        title: "Listagem Excluída",
        description: `A listagem ${listagemId} foi excluída com sucesso.`,
    });
  };
  
  const handleBulkDelete = () => {
    logAction('BULK_DELETE_LISTAGENS', {
        count: selectedRowIds.length,
        listagemIds: selectedRowIds,
    });
    setListagens(prev => prev.filter(item => !selectedRowIds.includes(item.id)));
    toast({
        title: "Exclusão em Bloco Concluída",
        description: `${selectedRowIds.length} listagem(ns) foram removidas com sucesso.`,
    });
    setSelectedRowIds([]);
    setIsBulkDeleteOpen(false);
  };

  const getCellValueListagens = (item: ListagemEliminacao, column: ColumnConfigListagens) => {
    const value = item[column.accessorKey as keyof ListagemEliminacao];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? "N/A" : String(value);
  };

  const toggleColumnVisibilityListagens = (columnId: string) => {
    setColumnVisibilityListagens(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumnsListagens = () => {
    setColumnVisibilityListagens(
      ALL_COLUMNS_CONFIG_LISTAGENS.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {})
    );
  };

  const handleDeselectAllColumnsListagens = () => {
    setColumnVisibilityListagens(
      ALL_COLUMNS_CONFIG_LISTAGENS.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {})
    );
  };
  
  const handleCsvExport = (dataToExport: ListagemEliminacao[]) => {
    if (dataToExport.length === 0) {
      toast({ variant: "destructive", description: "Nenhuma listagem selecionada para exportar." });
      return;
    }
    const headers = ['id', 'numeroListagem', 'tipoListagem', 'unidadeSetor', 'dataProducaoListagem', 'numeroEditalCiencia', 'dataPublicacaoEdital', 'numeroTermoEliminacao', 'dataProducaoTermoEliminacao', 'observacoes', 'documentoIds'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(item => {
        const rowData = {
            id: item.id,
            numeroListagem: item.numeroListagem,
            tipoListagem: item.tipoListagem,
            unidadeSetor: item.unidadeSetor || '',
            dataProducaoListagem: item.dataProducaoListagem || '',
            numeroEditalCiencia: item.numeroEditalCiencia || '',
            dataPublicacaoEdital: item.dataPublicacaoEdital || '',
            numeroTermoEliminacao: item.numeroTermoEliminacao || '',
            dataProducaoTermoEliminacao: item.dataProducaoTermoEliminacao || '',
            observacoes: item.observacoes || '',
            documentoIds: item.documentoIds.join(';')
        };
        const row = headers.map(header => `"${String(rowData[header as keyof typeof rowData]).replace(/"/g, '""')}"`);
        csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'listagens_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Sucesso", description: "Exportação de listagens concluída." });
  };
  
  const handleExportAllCSV = () => {
    const dataToExport = displayedListagens.length > 0 ? displayedListagens : listagens;
    handleCsvExport(dataToExport);
  };

  const handleExportSelectedCSV = () => {
    const selectedData = listagens.filter(item => selectedRowIds.includes(item.id));
    handleCsvExport(selectedData);
  };

  const handleDownloadTemplate = () => {
    const headers = ['numeroListagem', 'tipoListagem', 'unidadeSetor', 'dataProducaoListagem', 'numeroEditalCiencia', 'dataPublicacaoEdital', 'numeroTermoEliminacao', 'dataProducaoTermoEliminacao', 'observacoes', 'documentoIds'];
    const exampleRow = `"LE-2025-EXEMPLO","Processos Judiciais","Vara Federal de Exemplo","${new Date().toISOString()}","EDITAL-EXEMPLO/2025","","","","Observação de exemplo","DOC001;DOC002"`;
    const csvContent = `${headers.join(',')}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_listagens.csv');
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
            
            const newItemsFromCsv: ListagemEliminacao[] = [];
            rows.forEach((row, index) => {
                if(!row.trim()) return;
                const values = parseCsvRow(row);
                const newItemData: { [key: string]: string } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });
                
                const docIds = newItemData.documentoIds ? newItemData.documentoIds.split(';').map(id => id.trim()).filter(Boolean) : [];

                const newItem: ListagemEliminacao = {
                    id: `LE_IMP_${Date.now()}_${index}`,
                    numeroListagem: newItemData.numeroListagem,
                    tipoListagem: (newItemData.tipoListagem as ListagemEliminacao['tipoListagem']) || 'Documentos',
                    unidadeSetor: newItemData.unidadeSetor,
                    dataProducaoListagem: newItemData.dataProducaoListagem || new Date().toISOString(),
                    numeroEditalCiencia: newItemData.numeroEditalCiencia,
                    dataPublicacaoEdital: newItemData.dataPublicacaoEdital,
                    numeroTermoEliminacao: newItemData.numeroTermoEliminacao,
                    dataProducaoTermoEliminacao: newItemData.dataProducaoTermoEliminacao,
                    observacoes: newItemData.observacoes,
                    documentoIds: docIds,
                };
                newItemsFromCsv.push(newItem);
            });

            setListagens(prev => [...prev, ...newItemsFromCsv]);
            toast({ title: "Importação Concluída", description: `${newItemsFromCsv.length} listagens foram importadas com sucesso.` });

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


  const numDisplayed = displayedListagens.length;
  const numSelected = selectedRowIds.length;
  
  const filtersAreActive = React.useMemo(() => {
    return Object.values(filters).some(value => !!value);
  }, [filters]);

  return (
    <TooltipProvider>
      <div className='container mx-auto py-2'>
        <PageHeader title="Listagens de Eliminação" description="Gerencie as listagens de eliminação de documentos.">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="destructive" disabled={selectedRowIds.length === 0 || !permissions.exclusaoDados} onClick={() => setIsBulkDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir ({selectedRowIds.length})
            </Button>
            <Button variant="outline" disabled={selectedRowIds.length === 0} onClick={() => setIsBulkEditOpen(true)}>
                <PenSquare className="mr-2 h-4 w-4" />
                Alterar em Bloco ({selectedRowIds.length})
            </Button>
             <Button asChild variant="outline" disabled={selectedRowIds.length !== 1}>
              <Link href={selectedRowIds.length === 1 ? `/listagens-eliminacao/print/led/${selectedRowIds[0]}` : '#'} onClick={(e) => {if(selectedRowIds.length !==1) e.preventDefault()}}>
                  <Printer className="mr-2 h-4 w-4" /> Gerar LED
              </Link>
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
                Exportar CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Baixar Modelo
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen);
              if (!isOpen) resetFormAndDialogState();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Listagem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="font-headline text-primary">{isEditing ? "Editar Listagem" : "Nova Listagem de Eliminação"}</DialogTitle>
                  <DialogDescription>
                    Preencha as informações da listagem e selecione os documentos a serem eliminados.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(80vh-160px)] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="numeroListagem">Nº Listagem*</Label>
                        <Input id="numeroListagem" value={formState.numeroListagem || ""} onChange={handleInputChange} placeholder="Ex: LE-2024-001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoListagem">Tipo de Listagem*</Label>
                        <Select onValueChange={(value) => setFormState(prev => ({...prev, tipoListagem: value as ListagemEliminacao['tipoListagem']}))} value={formState.tipoListagem}>
                            <SelectTrigger id="tipoListagem"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Documentos">Documentos</SelectItem>
                                <SelectItem value="Processos Administrativos">Processos Administrativos</SelectItem>
                                <SelectItem value="Processos Judiciais">Processos Judiciais</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="unidadeSetor">Unidade/Setor*</Label>
                        <Input id="unidadeSetor" value={formState.unidadeSetor || ""} onChange={handleInputChange} placeholder="Ex: Arquivo Geral" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataProducaoListagem">Data Prod. Listagem*</Label>
                        <DateInputPicker
                          value={formState.dataProducaoListagem ? new Date(formState.dataProducaoListagem) : undefined}
                          onChange={(date) => handleDateChange('dataProducaoListagem')(date)}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroEditalCiencia">Nº Edital Ciência</Label>
                        <Input id="numeroEditalCiencia" value={formState.numeroEditalCiencia || ""} onChange={handleInputChange} placeholder="Ex: EDITAL-001/2024" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataPublicacaoEdital">Data Pub. Edital</Label>
                        <DateInputPicker
                          value={formState.dataPublicacaoEdital ? new Date(formState.dataPublicacaoEdital) : undefined}
                          onChange={(date) => handleDateChange('dataPublicacaoEdital')(date)}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroTermoEliminacao">Nº Termo Eliminação</Label>
                        <Input id="numeroTermoEliminacao" value={formState.numeroTermoEliminacao || ""} onChange={handleInputChange} placeholder="Ex: TE-2024-001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataProducaoTermoEliminacao">Data Prod. Termo</Label>
                        <DateInputPicker
                          value={formState.dataProducaoTermoEliminacao ? new Date(formState.dataProducaoTermoEliminacao) : undefined}
                          onChange={(date) => handleDateChange('dataProducaoTermoEliminacao')(date)}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea id="observacoes" value={formState.observacoes || ""} onChange={handleInputChange} placeholder="Observações adicionais sobre a listagem" rows={2} />
                      </div>
                  </div>

                  {!isDocumentTableVisible && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        onClick={() => setIsDocumentTableVisible(true)}
                        variant="outline"
                      >
                        <ListFilter className="mr-2 h-4 w-4" />
                        Selecionar Documentos para Eliminação
                      </Button>
                    </div>
                  )}

                  {isDocumentTableVisible && (
                    <div className="mt-4">
                      <Label className="text-md font-medium">Documentos</Label>
                      <Card className="mt-2">
                        <CardHeader className="p-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                  type="text"
                                  placeholder="Filtrar Ano Elim. Prev."
                                  value={dialogTableFilters.anoEliminacaoPrevisto}
                                  onChange={(e) => setDialogTableFilters(prev => ({...prev, anoEliminacaoPrevisto: e.target.value}))}
                                  className="w-full sm:w-[180px]"
                              />
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[300px] w-full border-t">
                            <Table className="min-w-max whitespace-nowrap text-xs">
                              <TableHeader>
                                <TableRow>
                                  {DIALOG_DOCUMENT_COLUMNS.map(col => (
                                    <TableHead key={col.id.toString()} className="py-1 px-2 h-8">
                                      {col.enableSorting ? (
                                        <Button
                                          variant="ghost"
                                          onClick={() => handleDialogTableSort(col.id.toString())}
                                          className="px-1 py-0 h-auto -ml-1 text-xs"
                                        >
                                          {col.header}
                                          {renderDialogTableSortIcon(col.id.toString())}
                                        </Button>
                                      ) : (
                                        col.header
                                      )}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {documentsForDialog.map(doc => (
                                  <TableRow key={doc.id}>
                                    {DIALOG_DOCUMENT_COLUMNS.map(col => (
                                      <TableCell key={`${doc.id}-${col.id.toString()}`} className="py-1 px-2">
                                        {col.cellFormatter ? col.cellFormatter((doc as any)[col.accessorKey], doc) : String((doc as any)[col.accessorKey] ?? "N/A")}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                                {documentsForDialog.length === 0 && (
                                      <TableRow>
                                          <TableCell colSpan={DIALOG_DOCUMENT_COLUMNS.length} className="h-24 text-center">
                                              Nenhum documento elegível encontrado para os filtros aplicados.
                                          </TableCell>
                                      </TableRow>
                                  )}
                              </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </ScrollArea>
                <DialogFooter className="pt-6">
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button type="button" onClick={handleSaveChanges}>Salvar Listagem</Button>
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
              <CardTitle className="font-headline text-primary text-xl">Filtros das Listagens</CardTitle>
            </div>
            {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </AccordionTrigger>
          <AccordionContent>
            <CardDescription className="px-6 pb-4 text-sm">
              Refine a lista de listagens de eliminação aplicando um ou mais filtros abaixo.
            </CardDescription>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="filterNumeroListagem">Nº da Listagem</Label>
                <Input id="filterNumeroListagem" name="numeroListagem" value={filters.numeroListagem} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <Select onValueChange={handleFilterSelectChange('status')} value={filters.status}>
                  <SelectTrigger id="filterStatus"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUES_SENTINEL}>Todos os status</SelectItem>
                    <SelectItem value="Tramitando">Tramitando</SelectItem>
                    <SelectItem value="Edital Publicado">Edital Publicado</SelectItem>
                    <SelectItem value="Efetivada">Efetivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterNumeroEditalCiencia">Nº do Edital</Label>
                <Input id="filterNumeroEditalCiencia" name="numeroEditalCiencia" value={filters.numeroEditalCiencia} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterNumeroTermoEliminacao">Nº do Termo</Label>
                <Input id="filterNumeroTermoEliminacao" name="numeroTermoEliminacao" value={filters.numeroTermoEliminacao} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterDataProducaoDe">Data de Produção (De)</Label>
                <DateInputPicker value={filters.dataProducaoDe} onChange={handleFilterDateChange('dataProducaoDe')} placeholder="dd/mm/aaaa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterDataProducaoAte">Data de Produção (Até)</Label>
                <DateInputPicker value={filters.dataProducaoAte} onChange={handleFilterDateChange('dataProducaoAte')} placeholder="dd/mm/aaaa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterDataPublicacaoDe">Data de Publicação (De)</Label>
                <DateInputPicker value={filters.dataPublicacaoDe} onChange={handleFilterDateChange('dataPublicacaoDe')} placeholder="dd/mm/aaaa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterDataPublicacaoAte">Data de Publicação (Até)</Label>
                <DateInputPicker value={filters.dataPublicacaoAte} onChange={handleFilterDateChange('dataPublicacaoAte')} placeholder="dd/mm/aaaa" />
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
            <CardTitle className="font-headline text-primary">Listagens Cadastradas</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {filtersAreActive
                ? `Exibindo ${displayedListagens.length} de ${listagens.length} listagens com base nos filtros aplicados.`
                : `Exibindo todas as ${listagens.length} listagens cadastradas.`}
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
                <DropdownMenuItem onSelect={handleSelectAllColumnsListagens} className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Selecionar Todas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDeselectAllColumnsListagens} className="cursor-pointer">
                  <Square className="mr-2 h-4 w-4" />
                  Limpar Todas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_COLUMNS_CONFIG_LISTAGENS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibilityListagens[column.id as string]}
                    onCheckedChange={() => toggleColumnVisibilityListagens(column.id as string)}
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
                      checked={numDisplayed > 0 && numSelected === numDisplayed ? true : numSelected > 0 ? 'indeterminate' : false}
                      onCheckedChange={(value) => setSelectedRowIds(value === true ? displayedListagens.map(item => item.id) : [])}
                      aria-label="Selecionar todas as linhas"
                    />
                  </TableHead>
                  {ALL_COLUMNS_CONFIG_LISTAGENS.map((column) =>
                    columnVisibilityListagens[column.id as string] ? (
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
                {displayedListagens.map((item) => (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                    <TableCell className="py-2 px-3">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={(value) => setSelectedRowIds(prev => value ? [...prev, item.id] : prev.filter(id => id !== item.id))}
                        aria-label={`Selecionar listagem ${item.numeroListagem}`}
                      />
                    </TableCell>
                    {ALL_COLUMNS_CONFIG_LISTAGENS.map((column) =>
                      columnVisibilityListagens[column.id as string] ? (
                        <TableCell key={`${item.id}-${column.id as string}`} className="py-2 px-3">
                          {getCellValueListagens(item, column)}
                        </TableCell>
                      ) : null
                    )}
                    <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/documentos?listagemDocIds=${encodeURIComponent(item.documentoIds.join(','))}&numeroListagem=${encodeURIComponent(item.numeroListagem)}`} passHref>
                              <Button variant="ghost" size="icon" aria-label="Ver Documentos da Listagem" disabled={!item.documentoIds || item.documentoIds.length === 0}>
                                  <FileSearch className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent><p>Ver Documentos da Listagem</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Editar Listagem" onClick={() => handleOpenDialog(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Editar Listagem</p></TooltipContent>
                        </Tooltip>
                        <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Listagem" disabled={!permissions.exclusaoDados}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent><p>Excluir Listagem</p></TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a listagem "{item.numeroListagem}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>Sim, excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {displayedListagens.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma listagem encontrada.</p>
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
              Selecione o campo e o novo valor para aplicar a todas as {selectedRowIds.length} listagens selecionadas.
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
                  {selectedBulkField.type === 'date' && (
                    <DateInputPicker value={bulkEditValue} onChange={setBulkEditValue} />
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
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente {selectedRowIds.length} listagem(ns) selecionada(s).
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
    

    

    
