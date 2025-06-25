
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Documento, ListagemEliminacao, Solicitacao, Classificacao, TipoOrigem, Caixa, ParteDocumento } from "@/types";
import { 
  PlusCircle, Edit, Trash2, Search, RotateCcw, FilterIcon, 
  ChevronDown, ChevronUp, ArrowUpDown, ColumnsIcon, ArrowUp, ArrowDown,
  CheckSquare, Square, X, Upload, Download, FileSpreadsheet, PenSquare, Printer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getYear, parseISO, isValid } from 'date-fns';
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateInputPicker } from "@/components/date-input-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { placeholderDocumentos, simulatedListagensData, placeholderSolicitacoesInitial, initialClassificacoes, initialTiposDocumento, initialGenerosDocumentais, initialTiposMidia, initialTiposParte, initialTiposOrigem, initialCaixas } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn, parseCsvRow } from "@/lib/utils";
import { logAction } from "@/lib/audit";
import { useUserSession } from "@/hooks/use-user-session";


const initialFormState: Partial<Documento> & { codigoClassificacaoArquivisticaInput?: string; assuntoClassificacaoDisplay?: string } = {
  status: "Arquivado",
  orgao: "TRF2",
  origem: "",
  tipoMeio: "Não digital",
  generoDocumental: "Textual",
  categoria: "Documento",
  tipoDocumento: "",
  numeroDocumento: "",
  processoOriginario: "",
  numeroAntigo: "",
  dataAbrangente: "",
  dataArquivamento: undefined,
  quantidadeVolumes: undefined,
  quantidadeApensos: undefined,
  numerosApensos: "",
  totalMidias: undefined,
  tipoMidiaDetalhe: undefined,
  numeroMidiaDetalhe: "",
  paginaMidiaDetalhe: "",
  digitalizado: "Não",
  tipoBaixa: "",
  dataBaixa: undefined,
  descricaoDocumento: "",
  partes: [],
  codigoClassificacaoArquivisticaInput: "",
  classificacaoArquivisticaId: "",
  assuntoClassificacaoDisplay: "",
  prazoArquivoCorrenteDisplay: "",
  prazoArquivoIntermediarioDisplay: "",
  destinacaoFinalDisplay: undefined,
  alteracaoDestinacaoFinal: "Não Alterar",
  anoEliminacaoPrevisto: "", 
  segredoJustica: "Não",
  grauSigilo: "Ostensivo",
  codigosCaixa: "",
  codigoAtoM: "",
  documentosRelacionadosIds: "",
  observacoesGerais: "",
  codigoClassificacaoJudicialId: "",
  numeroListagemEliminacao: "",
};

const initialFiltersState = {
  status: "",
  origemDocumento: "",
  numeroDocumento: "",
  numeroAntigo: "",
  descricao: "",
  codClassificacao: "",
  destinacaoFinal: "",
  anoProducao: "",
  anoArquivamento: "",
  anoElimPrevistoExato: "",
  anoElimPrevistoAte: "",
  codigoCaixa: "",
  generoDocumental: "",
  categoriaDocumento: "",
  tipoDocumento: "",
  pessoasReferidas: "",
  codigoAtoM: "",
  segredoJustica: "",
  grauSigilo: "",
  digitalizado: "", 
  anoLimiteDocumento: "", 
  prazoCorrente: "",
  prazoIntermediario: "",
  numeroListagemEliminacao: "",
  processoOriginario: "",
};

const initialParteState: ParteDocumento = {
  id: '',
  nome: '',
  cpfCnpj: '',
  tipoParte: '',
};

const ALL_VALUES_SENTINEL = "ALL_VALUES"; 

type ColumnConfig = {
  id: keyof Documento | string;
  header: string;
  accessorKey: keyof Documento | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, doc: Documento) => React.ReactNode;
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };

const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const SOLICITACOES_STORAGE_KEY = 'arquivocentral_solicitacoes';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';
const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';
const TIPOS_DOCUMENTO_STORAGE_KEY = 'arquivocentral_tipos_documento';
const TIPOS_PARTE_STORAGE_KEY = 'arquivocentral_tipos_parte';
const GENEROS_DOCUMENTAIS_STORAGE_KEY = 'arquivocentral_generos_documentais';
const TIPOS_MIDIA_STORAGE_KEY = 'arquivocentral_tipos_midia';
const TIPOS_ORIGEM_STORAGE_KEY = 'arquivocentral_tipos_origem';
const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';

export default function DocumentosPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { permissions } = useUserSession();
  
  const codigoCaixaFromUrl = searchParams.get('codigoCaixa');
  const listagemDocIdsParam = searchParams.get('listagemDocIds');
  const numeroListagemFromQuery = searchParams.get('numeroListagem');
  const editDocIdFromUrl = searchParams.get('edit');
  const docIdsFromReportParam = searchParams.get('docIds');
  const reportContext = searchParams.get('reportContext');
  
  const isFilteredByListagem = !!listagemDocIdsParam;
  const isFilteredByReport = !!docIdsFromReportParam;

  const [documentos, setDocumentos] = React.useState<Documento[]>([]);
  const [processedDocumentos, setProcessedDocumentos] = React.useState<Documento[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<Documento> & { codigoClassificacaoArquivisticaInput?: string; assuntoClassificacaoDisplay?: string }>(initialFormState);
  const [documentIdToDisplay, setDocumentIdToDisplay] = React.useState("(Automático após salvar)");
  
  const [isParteDialogOpen, setIsParteDialogOpen] = React.useState(false);
  const [parteFormState, setParteFormState] = React.useState<ParteDocumento>(initialParteState);
  const [isEditingParte, setIsEditingParte] = React.useState(false);

  const [filters, setFilters] = React.useState(initialFiltersState);
  const [displayedDocumentos, setDisplayedDocumentos] = React.useState<Documento[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [solicitacoes, setSolicitacoes] = React.useState<Solicitacao[]>([]);
  const [classificacoes, setClassificacoes] = React.useState<Classificacao[]>([]);
  const [listagens, setListagens] = React.useState<ListagemEliminacao[]>([]);
  const [isFormDisabled, setIsFormDisabled] = React.useState(false);

  const [isRelatedDocDialogOpen, setIsRelatedDocDialogOpen] = React.useState(false);
  const [relatedDocSearchTerm, setRelatedDocSearchTerm] = React.useState('');

  const [tiposDocumento, setTiposDocumento] = React.useState<string[]>([]);
  const [generosDocumentais, setGenerosDocumentais] = React.useState<string[]>([]);
  const [tiposMidia, setTiposMidia] = React.useState<string[]>([]);
  const [tiposParte, setTiposParte] = React.useState<string[]>([]);
  const [tiposOrigem, setTiposOrigem] = React.useState<TipoOrigem[]>([]);
  const [caixas, setCaixas] = React.useState<Caixa[]>([]);
  
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [bulkEditField, setBulkEditField] = React.useState('');
  const [bulkEditValue, setBulkEditValue] = React.useState<any>('');
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);


  const resetForm = React.useCallback(() => {
    setFormState(initialFormState);
    setDocumentIdToDisplay("(Automático após salvar)");
    setIsFormDisabled(false);
  }, []);

  const handleOpenDialog = React.useCallback((doc?: Documento) => {
    if (doc) {
      const existingClassification = classificacoes.find(c => c.id === doc.classificacaoArquivisticaId);
      
      let assunto = "Não encontrado";
      let classId = doc.classificacaoArquivisticaId || "";
      const classCode = existingClassification ? existingClassification.codigo : "";

      if (existingClassification) {
        if (existingClassification.status === 'Inativo') {
          assunto = "Código inválido. Um novo será criado ao salvar.";
          classId = ""; // Force creation of a new one on save
        } else {
          assunto = existingClassification.descricao;
        }
      }

      setFormState({
        ...initialFormState, 
        ...doc,
        codigoClassificacaoArquivisticaInput: classCode,
        assuntoClassificacaoDisplay: assunto,
        classificacaoArquivisticaId: classId,
        dataArquivamento: doc.dataArquivamento ? doc.dataArquivamento : undefined,
        dataBaixa: doc.dataBaixa ? doc.dataBaixa : undefined,
        quantidadeVolumes: doc.quantidadeVolumes ?? undefined,
        quantidadeApensos: doc.quantidadeApensos ?? undefined,
        totalMidias: doc.totalMidias ?? undefined,
        tipoMidiaDetalhe: doc.tipoMidiaDetalhe ?? undefined,
        numeroMidiaDetalhe: doc.numeroMidiaDetalhe ?? "",
        paginaMidiaDetalhe: doc.paginaMidiaDetalhe ?? "",
      });
      setDocumentIdToDisplay(doc.id);
      setIsFormDisabled(doc.status === 'Eliminado');
    } else {
      resetForm(); 
    }
    setIsDialogOpen(true);
  }, [classificacoes, resetForm]);

  const ALL_COLUMNS_CONFIG: ColumnConfig[] = React.useMemo(() => [
    { 
      id: 'id', 
      header: 'ID Interno', 
      accessorKey: 'id', 
      defaultVisible: true, 
      enableSorting: true,
      cellFormatter: (value, doc) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium"
          onClick={() => handleOpenDialog(doc)}
        >
          {value}
        </Button>
      )
    },
    { 
      id: 'status', 
      header: 'Status', 
      accessorKey: 'status', 
      defaultVisible: true, 
      enableSorting: true, 
      cellFormatter: (value) => {
        if (value === 'Aguardando prazo para eliminação') {
          return <Badge className="border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80 dark:bg-yellow-500 dark:text-yellow-50 dark:hover:bg-yellow-500/80">{value || 'N/A'}</Badge>;
        }
        if (value === 'Arquivado') {
          return <Badge className="border-transparent bg-green-500 text-green-50 hover:bg-green-500/80 dark:bg-green-600 dark:text-green-50 dark:hover:bg-green-600/80">{value || 'N/A'}</Badge>;
        }
        if (value === 'Pendente de Conferência') {
          return <Badge className="border-transparent bg-purple-500 text-purple-50 hover:bg-purple-500/80 dark:bg-purple-600 dark:text-purple-50 dark:hover:bg-purple-600/80">{value || 'N/A'}</Badge>;
        }
        return <Badge variant={
          value === 'Emprestado' ? 'outline' :
          value === 'Eliminado' ? 'destructive' :
          'default' 
        }>{value || 'N/A'}</Badge>;
      } 
    },
    { id: 'orgao', header: 'Órgão', accessorKey: 'orgao', defaultVisible: true, enableSorting: true },
    { id: 'origem', header: 'Origem', accessorKey: 'origem', defaultVisible: true, enableSorting: true },
    { id: 'tipoMeio', header: 'Tipo de Meio', accessorKey: 'tipoMeio', defaultVisible: true, enableSorting: true },
    { id: 'generoDocumental', header: 'Gênero', accessorKey: 'generoDocumental', defaultVisible: true, enableSorting: true },
    { id: 'categoria', header: 'Categoria', accessorKey: 'categoria', defaultVisible: true, enableSorting: true },
    { id: 'tipoDocumento', header: 'Espécie de Documento', accessorKey: 'tipoDocumento', defaultVisible: true, enableSorting: true },
    { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento', defaultVisible: true, enableSorting: true },
    { id: 'numeroAntigo', header: 'Nº Antigo', accessorKey: 'numeroAntigo', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || 'N/A' },
    { id: 'processoOriginario', header: 'Proc. Originário', accessorKey: 'processoOriginario', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || 'N/A' },
    { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente', defaultVisible: true, enableSorting: true },
    { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
    { 
        id: 'partes', 
        header: 'Partes Envolvidas', 
        accessorKey: 'partes', 
        defaultVisible: true, 
        enableSorting: false, 
        cellFormatter: (partes?: ParteDocumento[]) => {
            if (!partes || partes.length === 0) return 'N/A';
            const names = partes.map(p => p.nome).join(', ');
            return <span className="block max-w-xs truncate" title={names}>{names}</span>;
        } 
    },
    { id: 'documentosRelacionadosIds', header: 'Docs Relac. (Qtd)', accessorKey: 'documentosRelacionadosIds', defaultVisible: true, enableSorting: false, cellFormatter: (value) => (value ? String(value).split(',').length : 0) },
    { id: 'dataArquivamento', header: 'Data Arquivamento', accessorKey: 'dataArquivamento', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'quantidadeVolumes', header: 'Qtd. Volumes', accessorKey: 'quantidadeVolumes', defaultVisible: true, enableSorting: true },
    { id: 'quantidadeApensos', header: 'Qtd. Apensos', accessorKey: 'quantidadeApensos', defaultVisible: true, enableSorting: true },
    { id: 'numerosApensos', header: 'Nº Apensos', accessorKey: 'numerosApensos', defaultVisible: true, enableSorting: true },
    { id: 'totalMidias', header: 'Total Mídias', accessorKey: 'totalMidias', defaultVisible: true, enableSorting: true },
    { id: 'tipoMidiaDetalhe', header: 'Tipo Mídia', accessorKey: 'tipoMidiaDetalhe', defaultVisible: true, enableSorting: true },
    { id: 'numeroMidiaDetalhe', header: 'Nº Mídia', accessorKey: 'numeroMidiaDetalhe', defaultVisible: true, enableSorting: true },
    { id: 'paginaMidiaDetalhe', header: 'Página Mídia', accessorKey: 'paginaMidiaDetalhe', defaultVisible: true, enableSorting: true },
    { id: 'digitalizado', header: 'Digitalizado', accessorKey: 'digitalizado', defaultVisible: true, enableSorting: true },
    { id: 'tipoBaixa', header: 'Tipo Baixa', accessorKey: 'tipoBaixa', defaultVisible: true, enableSorting: true },
    { id: 'dataBaixa', header: 'Data Baixa', accessorKey: 'dataBaixa', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'codigoClassificacaoJudicialId', header: 'Cód. Class. Judicial', accessorKey: 'codigoClassificacaoJudicialId', defaultVisible: true, enableSorting: true },
    { id: 'classificacaoArquivisticaId', header: 'Classificação', accessorKey: 'classificacaoArquivisticaId', defaultVisible: true, enableSorting: true, cellFormatter: (value) => {
        const classif = classificacoes.find(c => c.id === value);
        if (!classif) return value || 'N/A';
        const display = `${classif.codigo} - ${classif.descricao || 'Pendente de Complemento'}`;
        if (classif.status === 'Pendente de Complemento') {
          return <span className="text-yellow-600 dark:text-yellow-400" title="Esta classificação precisa ser complementada.">{display}</span>;
        }
        if (classif.status === 'Inativo') {
          return <span className="text-destructive line-through" title="Esta classificação está inativa.">{display}</span>;
        }
        return display;
      } 
    },
    { id: 'prazoArquivoCorrenteDisplay', header: 'Prazo Arq. Corrente', accessorKey: 'prazoArquivoCorrenteDisplay', defaultVisible: true, enableSorting: true },
    { id: 'prazoArquivoIntermediarioDisplay', header: 'Prazo Arq. Interm.', accessorKey: 'prazoArquivoIntermediarioDisplay', defaultVisible: true, enableSorting: true },
    { id: 'destinacaoFinalDisplay', header: 'Destinação Final', accessorKey: 'destinacaoFinalDisplay', defaultVisible: true, enableSorting: true },
    { id: 'anoEliminacaoPrevisto', header: 'Ano Elim. Prev.', accessorKey: 'anoEliminacaoPrevisto', defaultVisible: true, enableSorting: true },
    { id: 'segredoJustica', header: 'Segredo de Justiça', accessorKey: 'segredoJustica', defaultVisible: true, enableSorting: true },
    { id: 'grauSigilo', header: 'Sigilo LAI', accessorKey: 'grauSigilo', defaultVisible: true, enableSorting: true },
    { id: 'codigosCaixa', header: 'Código da Caixa', accessorKey: 'codigosCaixa', defaultVisible: true, enableSorting: true },
    { id: 'codigoAtoM', header: 'AtoM', accessorKey: 'codigoAtoM', defaultVisible: true, enableSorting: true },
    { 
      id: 'numeroListagemEliminacao', 
      header: 'Listagem Eliminação', 
      accessorKey: 'numeroListagemEliminacao', 
      defaultVisible: true, 
      enableSorting: true, 
      cellFormatter: (value) => {
        if (!value) return "N/A";
        const listagem = listagens.find(l => l.numeroListagem === value);
        if (!listagem || !listagem.documentoIds) return value; 
  
        return (
          <Link 
            href={`/documentos?listagemDocIds=${encodeURIComponent(listagem.documentoIds.join(','))}&numeroListagem=${encodeURIComponent(value)}`} 
            passHref
          >
            <span className="text-primary hover:underline cursor-pointer font-medium">
              {value}
            </span>
          </Link>
        );
      }
    },
  ], [classificacoes, listagens, handleOpenDialog]);
  
  React.useEffect(() => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
    );
  }, [ALL_COLUMNS_CONFIG]);

  React.useEffect(() => {
    try {
      const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      setDocumentos(storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos);

      const storedSolicitacoes = window.localStorage.getItem(SOLICITACOES_STORAGE_KEY);
      setSolicitacoes(storedSolicitacoes ? JSON.parse(storedSolicitacoes) : placeholderSolicitacoesInitial);

      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      setClassificacoes(storedClassificacoes ? JSON.parse(storedClassificacoes) : initialClassificacoes);
      
      const storedListagens = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
      setListagens(storedListagens ? JSON.parse(storedListagens) : simulatedListagensData);
      
      const storedTiposDoc = window.localStorage.getItem(TIPOS_DOCUMENTO_STORAGE_KEY);
      setTiposDocumento(storedTiposDoc ? JSON.parse(storedTiposDoc) : initialTiposDocumento);
      
      const storedTiposParte = window.localStorage.getItem(TIPOS_PARTE_STORAGE_KEY);
      setTiposParte(storedTiposParte ? JSON.parse(storedTiposParte) : initialTiposParte);

      const storedGeneros = window.localStorage.getItem(GENEROS_DOCUMENTAIS_STORAGE_KEY);
      setGenerosDocumentais(storedGeneros ? JSON.parse(storedGeneros) : initialGenerosDocumentais);

      const storedMidias = window.localStorage.getItem(TIPOS_MIDIA_STORAGE_KEY);
      setTiposMidia(storedMidias ? JSON.parse(storedMidias) : initialTiposMidia);

      const storedTiposOrigem = window.localStorage.getItem(TIPOS_ORIGEM_STORAGE_KEY);
      setTiposOrigem(storedTiposOrigem ? JSON.parse(storedTiposOrigem) : initialTiposOrigem);
      
      const storedCaixas = window.localStorage.getItem(CAIXAS_STORAGE_KEY);
      setCaixas(storedCaixas ? JSON.parse(storedCaixas) : initialCaixas);

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setDocumentos(placeholderDocumentos);
      setSolicitacoes(placeholderSolicitacoesInitial);
      setClassificacoes(initialClassificacoes);
      setListagens(simulatedListagensData);
      setTiposDocumento(initialTiposDocumento);
      setTiposParte(initialTiposParte);
      setGenerosDocumentais(initialGenerosDocumentais);
      setTiposMidia(initialTiposMidia);
      setTiposOrigem(initialTiposOrigem);
      setCaixas(initialCaixas);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (editDocIdFromUrl && documentos.length > 0) {
      const docToEdit = documentos.find(d => d.id === editDocIdFromUrl);
      if (docToEdit) {
        handleOpenDialog(docToEdit);
      }
    }
  }, [editDocIdFromUrl, documentos, handleOpenDialog]);

  React.useEffect(() => {
    if (isDataLoaded) {
      window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(documentos));
      window.localStorage.setItem(CLASSIFICACOES_STORAGE_KEY, JSON.stringify(classificacoes));
      window.localStorage.setItem(LISTAGENS_STORAGE_KEY, JSON.stringify(listagens));
      window.localStorage.setItem(SOLICITACOES_STORAGE_KEY, JSON.stringify(solicitacoes));
      window.localStorage.setItem(TIPOS_DOCUMENTO_STORAGE_KEY, JSON.stringify(tiposDocumento));
      window.localStorage.setItem(TIPOS_PARTE_STORAGE_KEY, JSON.stringify(tiposParte));
      window.localStorage.setItem(GENEROS_DOCUMENTAIS_STORAGE_KEY, JSON.stringify(generosDocumentais));
      window.localStorage.setItem(TIPOS_MIDIA_STORAGE_KEY, JSON.stringify(tiposMidia));
      window.localStorage.setItem(TIPOS_ORIGEM_STORAGE_KEY, JSON.stringify(tiposOrigem));
      window.localStorage.setItem(CAIXAS_STORAGE_KEY, JSON.stringify(caixas));
    }
  }, [documentos, classificacoes, listagens, solicitacoes, isDataLoaded, tiposDocumento, tiposParte, generosDocumentais, tiposMidia, tiposOrigem, caixas]);

  React.useEffect(() => {
    if (!isDataLoaded) return;

    const activeLoanMap = new Map<string, Solicitacao['tipo']>();
    solicitacoes.forEach(sol => {
      if (sol.dataAtendimento && !sol.dataDevolucao) {
        sol.documentoIds.forEach(docId => activeLoanMap.set(docId, sol.tipo));
      }
    });

    const processed = documentos.map(originalDoc => {
      let doc = { ...originalDoc };
      let currentDocStatus = doc.status;
      let isEliminated = false;

      if (doc.numeroListagemEliminacao) {
        const listagem = listagens.find(l => l.numeroListagem === doc.numeroListagemEliminacao);
        if (listagem?.documentoIds?.includes(doc.id)) {
          if (listagem.dataProducaoTermoEliminacao) {
            currentDocStatus = "Eliminado";
            isEliminated = true;
          } else if (listagem.dataPublicacaoEdital && currentDocStatus !== "Emprestado" && currentDocStatus !== "Desarquivado") {
            currentDocStatus = "Aguardando prazo para eliminação";
          }
        }
      }

      if (!isEliminated && (currentDocStatus === 'Arquivado' || currentDocStatus === 'Aguardando prazo para eliminação') && activeLoanMap.has(doc.id)) {
        const tipoSolicitacao = activeLoanMap.get(doc.id);
        currentDocStatus = tipoSolicitacao === 'Empréstimo' ? 'Emprestado' : 'Desarquivado';
      }

      doc.status = currentDocStatus as Documento['status'];

      if (doc.status === "Eliminado") {
        doc.codigosCaixa = "";
      }

      return doc;
    });

    setProcessedDocumentos(processed);
  }, [documentos, solicitacoes, listagens, isDataLoaded]);


  React.useEffect(() => {
    const classification = classificacoes.find(c => c.id === formState.classificacaoArquivisticaId);
    
    if (classification) {
       if (classification.status === 'Inativo') {
         setFormState(prev => ({
          ...prev,
          assuntoClassificacaoDisplay: "Código inválido. Um novo será criado ao salvar.",
          prazoArquivoCorrenteDisplay: "",
          prazoArquivoIntermediarioDisplay: "",
          destinacaoFinalDisplay: undefined,
          anoEliminacaoPrevisto: ""
        }));
        return;
      }
       if (classification.status === 'Pendente de Complemento') {
         setFormState(prev => ({
          ...prev,
          assuntoClassificacaoDisplay: `Pendente de complemento (Cód: ${classification.codigo})`,
          prazoArquivoCorrenteDisplay: "",
          prazoArquivoIntermediarioDisplay: "",
          destinacaoFinalDisplay: undefined,
          anoEliminacaoPrevisto: ""
        }));
        return;
      }
      
      let prazoCorrente = "";
      if (classification.tipoPrazoFaseCorrente === "Anos" && typeof classification.prazoGuardaFaseCorrenteAnos === 'number') {
        prazoCorrente = `${classification.prazoGuardaFaseCorrenteAnos} Anos`;
      } else if (classification.tipoPrazoFaseCorrente === "Condição Textual") {
        prazoCorrente = classification.prazoGuardaFaseCorrenteCondicaoTextual || "";
      }
      
      const prazoIntermediario = typeof classification.prazoGuardaFaseIntermediariaAnos === 'number' 
        ? `${classification.prazoGuardaFaseIntermediariaAnos} Anos` 
        : "";
      
      const destinacao = classification.destinacaoFinal;

      let anoEliminacao = "";
      if (formState.dataArquivamento && isValid(parseISO(formState.dataArquivamento)) &&
          (destinacao === 'Eliminação' ||
           (destinacao !== 'Guarda Permanente' && formState.alteracaoDestinacaoFinal !== 'Não Alterar' && formState.alteracaoDestinacaoFinal !== 'Guarda Permanente – Guarda Amostral' && formState.alteracaoDestinacaoFinal !== 'Guarda Permanente – Decisão da CPAD'))) {
          
          const dataArquivamentoDate = parseISO(formState.dataArquivamento);
          let prazoIntermediarioAnosNum = 0;
          if (typeof classification.prazoGuardaFaseIntermediariaAnos === 'number') {
            prazoIntermediarioAnosNum = classification.prazoGuardaFaseIntermediariaAnos;
          }
          
          if (!isNaN(prazoIntermediarioAnosNum) && dataArquivamentoDate) {
            const anoArquivamento = getYear(dataArquivamentoDate);
            anoEliminacao = (anoArquivamento + prazoIntermediarioAnosNum + 1).toString();
          }
      }

      setFormState(prev => ({
        ...prev,
        assuntoClassificacaoDisplay: classification.descricao,
        prazoArquivoCorrenteDisplay: prazoCorrente,
        prazoArquivoIntermediarioDisplay: prazoIntermediario,
        destinacaoFinalDisplay: destinacao,
        anoEliminacaoPrevisto: anoEliminacao
      }));

    } else { 
       if (!formState.codigoClassificacaoArquivisticaInput) {
            setFormState(prev => ({
                ...prev,
                assuntoClassificacaoDisplay: "",
                prazoArquivoCorrenteDisplay: "",
                prazoArquivoIntermediarioDisplay: "",
                destinacaoFinalDisplay: undefined,
                anoEliminacaoPrevisto: ""
            }));
       }
    }
  }, [formState.classificacaoArquivisticaId, formState.codigoClassificacaoArquivisticaInput, formState.dataArquivamento, formState.alteracaoDestinacaoFinal, classificacoes]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const status = params.get('status');
    const anoExato = params.get('anoElimPrevistoExato');
    const anoAte = params.get('anoElimPrevistoAte');

    if (status || anoExato || anoAte) {
        const newFilters = { ...initialFiltersState };
        if (status) newFilters.status = status;
        if (anoExato) newFilters.anoElimPrevistoExato = anoExato;
        if (anoAte) newFilters.anoElimPrevistoAte = anoAte;
        
        setFilters(newFilters);
        setIsFiltersOpen(true);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };
  
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = value === "" ? undefined : parseInt(value, 10);
    if (value === "" || (numValue !== undefined && !isNaN(numValue) && numValue >= 0) ) {
        setFormState(prev => ({ ...prev, [id]: numValue }));
    }
  };

  const handleSelectChange = (id: keyof Partial<Documento>) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (id: keyof Partial<Documento>) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));
  };

  const handleCodigoClassificacaoBlur = () => {
    const codigoInput = formState.codigoClassificacaoArquivisticaInput?.trim();
    if (codigoInput) {
      const foundClassification = classificacoes.find(
        c => c.codigo === codigoInput
      );
      if (foundClassification) {
        if (foundClassification.status === 'Inativo') {
            setFormState(prev => ({
                ...prev,
                classificacaoArquivisticaId: "",
                assuntoClassificacaoDisplay: "Código inválido. Um novo será criado ao salvar.",
                prazoArquivoCorrenteDisplay: "",
                prazoArquivoIntermediarioDisplay: "",
                destinacaoFinalDisplay: undefined,
                anoEliminacaoPrevisto: ""
            }));
        } else {
            setFormState(prev => ({
                ...prev,
                classificacaoArquivisticaId: foundClassification.id,
            }));
        }
      } else { // Not found
        setFormState(prev => ({
          ...prev,
          classificacaoArquivisticaId: "",
          assuntoClassificacaoDisplay: "Código inválido. Será criado como pendente.",
          prazoArquivoCorrenteDisplay: "",
          prazoArquivoIntermediarioDisplay: "",
          destinacaoFinalDisplay: undefined,
          anoEliminacaoPrevisto: ""
        }));
      }
    } else { // Empty input
      setFormState(prev => ({
        ...prev,
        classificacaoArquivisticaId: "",
        codigoClassificacaoArquivisticaInput: "",
        assuntoClassificacaoDisplay: "",
        prazoArquivoCorrenteDisplay: "",
        prazoArquivoIntermediarioDisplay: "",
        destinacaoFinalDisplay: undefined,
        anoEliminacaoPrevisto: ""
      }));
    }
  };

  const handleRemoveRelatedDoc = (idToRemove: string) => {
    setFormState(prev => ({
        ...prev,
        documentosRelacionadosIds: prev.documentosRelacionadosIds?.split(',').map(s => s.trim()).filter(id => id !== idToRemove).join(',') || ""
    }));
  };

  const handleAddRelatedDoc = (idToAdd: string) => {
    setFormState(prev => {
        const currentIds = prev.documentosRelacionadosIds?.split(',').map(s => s.trim()).filter(Boolean) || [];
        if (!currentIds.includes(idToAdd)) {
            return { ...prev, documentosRelacionadosIds: [...currentIds, idToAdd].join(',') };
        }
        return prev;
    });
    toast({ title: "Documento Adicionado", description: `O documento ${idToAdd} foi adicionado à lista de relacionados.` });
  };
  
  const handleOpenParteDialog = (parte?: ParteDocumento) => {
    if (parte) {
      setParteFormState(parte);
      setIsEditingParte(true);
    } else {
      setParteFormState(initialParteState);
      setIsEditingParte(false);
    }
    setIsParteDialogOpen(true);
  };
  
  const handleSaveParte = () => {
    if (!parteFormState.nome) {
        toast({ variant: "destructive", title: "Erro", description: "O nome da parte é obrigatório." });
        return;
    }
    setFormState(prev => {
        const newPartes = [...(prev.partes || [])];
        if (isEditingParte) {
            const index = newPartes.findIndex(p => p.id === parteFormState.id);
            if (index > -1) newPartes[index] = parteFormState;
        } else {
            newPartes.push({ ...parteFormState, id: `p${Date.now()}` });
        }
        return { ...prev, partes: newPartes };
    });
    setIsParteDialogOpen(false);
  };

  const handleRemoveParte = (parteId: string) => {
    setFormState(prev => ({
        ...prev,
        partes: prev.partes?.filter(p => p.id !== parteId)
    }));
  };

  const handleSaveChanges = () => {
    const formStateToSave = { ...formState };
    const codigoInput = formStateToSave.codigoClassificacaoArquivisticaInput?.trim();
    let resolvedClassificationId = formStateToSave.classificacaoArquivisticaId;
  
    if (codigoInput && !resolvedClassificationId) {
      const existingClassif = classificacoes.find(c => c.codigo === codigoInput);
      if (!existingClassif || existingClassif.status === 'Inativo') {
        const newClassification: Classificacao = {
          id: `CLA_AUTO_${Date.now()}`,
          codigo: codigoInput,
          descricao: "",
          observacoes: "Cadastro gerado automaticamente. Por favor, complementar as informações.",
          status: 'Pendente de Complemento',
          prazoGuardaFaseIntermediariaAnos: 0,
          destinacaoFinal: 'Eliminação',
          tipoPlanoClassificacao: 'Administrativo',
          tipoPrazoFaseCorrente: 'Anos',
          prazoGuardaFaseCorrenteAnos: 0,
        };
        setClassificacoes(prev => [...prev, newClassification]);
        resolvedClassificationId = newClassification.id;
      }
    }

    const requiredFields: Array<{ key: keyof typeof formStateToSave; label: string }> = [
      { key: 'status', label: 'Status' },
      { key: 'orgao', label: 'Órgão' },
      { key: 'origem', label: 'Origem' },
      { key: 'tipoMeio', label: 'Tipo de Meio' },
      { key: 'categoria', label: 'Categoria' },
      { key: 'tipoDocumento', label: 'Espécie de Documento' },
      { key: 'dataAbrangente', label: 'Data Abrangente' },
      { key: 'dataArquivamento', label: 'Data de Arquivamento' },
      { key: 'codigoClassificacaoArquivisticaInput', label: 'Código de Classificação Arquivística' },
      { key: 'segredoJustica', label: 'Segredo de Justiça' },
      { key: 'grauSigilo', label: 'Grau de Sigilo (LAI)' },
    ];

    const missingFields = requiredFields.filter(field => {
      const value = formStateToSave[field.key];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(f => f.label).join(', ');
      toast({
        variant: "destructive",
        title: "Campos Obrigatórios",
        description: `Por favor, preencha os seguintes campos: ${missingLabels}.`,
        duration: 5000,
      });
      return;
    }
    
    const isCreating = documentIdToDisplay === "(Automático após salvar)";
    const finalFormState: Documento = {
      ...initialFormState, 
      ...formStateToSave, 
      id: isCreating ? `DOC${Date.now()}` : documentIdToDisplay,
      classificacaoArquivisticaId: resolvedClassificationId,
      dataCadastro: formState.dataCadastro || new Date().toISOString(),
      generoDocumental: formState.generoDocumental!,
      tipoMidiaDetalhe: formState.tipoMidiaDetalhe,
      status: formState.status || 'Arquivado',
      orgao: formState.orgao || 'TRF2',
      tipoMeio: formState.tipoMeio || 'Não digital',
      categoria: formState.categoria || 'Documento',
      digitalizado: formState.digitalizado || 'Não',
      alteracaoDestinacaoFinal: formState.alteracaoDestinacaoFinal || 'Não Alterar',
      segredoJustica: formState.segredoJustica || 'Não',
      grauSigilo: formState.grauSigilo || 'Ostensivo',
      numeroListagemEliminacao: formState.numeroListagemEliminacao || undefined, 
    };

    const action = isCreating ? 'CREATE_DOCUMENT' : 'UPDATE_DOCUMENT';
    logAction(action, { documentId: finalFormState.id });

    const boxCodes = (finalFormState.codigosCaixa || "").split(',').map(c => c.trim()).filter(Boolean);
    if (boxCodes.length > 0) {
        const newCaixasToCreate: Caixa[] = [];
        const currentCaixaCodes = new Set(caixas.map(c => c.codigoCaixa));
        
        boxCodes.forEach(code => {
            if (!currentCaixaCodes.has(code)) {
                const newCaixa: Caixa = {
                    id: `CX_AUTO_${Date.now()}_${code.replace(/\s/g, "")}`,
                    codigoCaixa: code,
                    descricao: "Caixa criada automaticamente via cadastro de acervo.",
                    tipo: "JUD", 
                    status: "Aberta",
                    situacao: "Incompleta",
                    documentoIds: []
                };
                newCaixasToCreate.push(newCaixa);
                currentCaixaCodes.add(code); 
            }
        });

        if (newCaixasToCreate.length > 0) {
            setCaixas(prev => [...prev, ...newCaixasToCreate]);
        }
    }
    
    setDocumentos(prevDocs => {
      const originalDoc = prevDocs.find(d => d.id === finalFormState.id);
      const originalRelatedIds = new Set(originalDoc?.documentosRelacionadosIds?.split(',').filter(Boolean).map(s => s.trim()) || []);
      const newRelatedIds = new Set(finalFormState.documentosRelacionadosIds?.split(',').filter(Boolean).map(s => s.trim()) || []);

      const addedIds = [...newRelatedIds].filter(id => !originalRelatedIds.has(id));
      const removedIds = [...originalRelatedIds].filter(id => !newRelatedIds.has(id));

      let docsToUpdate = [...prevDocs];
      const docIndex = docsToUpdate.findIndex(d => d.id === finalFormState.id);

      if (docIndex > -1) {
        docsToUpdate[docIndex] = finalFormState;
      } else {
        docsToUpdate.push(finalFormState);
      }

      addedIds.forEach(relatedId => {
        const relatedDocIndex = docsToUpdate.findIndex(d => d.id === relatedId);
        if (relatedDocIndex > -1) {
            const relatedDoc = { ...docsToUpdate[relatedDocIndex] };
            const relatedDocIds = new Set(relatedDoc.documentosRelacionadosIds?.split(',').filter(Boolean).map(s => s.trim()) || []);
            relatedDocIds.add(finalFormState.id);
            relatedDoc.documentosRelacionadosIds = Array.from(relatedDocIds).join(',');
            docsToUpdate[relatedDocIndex] = relatedDoc;
        }
      });

      removedIds.forEach(relatedId => {
        const relatedDocIndex = docsToUpdate.findIndex(d => d.id === relatedId);
        if (relatedDocIndex > -1) {
            const relatedDoc = { ...docsToUpdate[relatedDocIndex] };
            let relatedDocIds = relatedDoc.documentosRelacionadosIds?.split(',').filter(Boolean).map(s => s.trim()) || [];
            relatedDocIds = relatedDocIds.filter(id => id !== finalFormState.id);
            relatedDoc.documentosRelacionadosIds = relatedDocIds.join(',');
            docsToUpdate[relatedDocIndex] = relatedDoc;
        }
      });

      return docsToUpdate;
    });
    setSelectedRowIds([]); 
    setIsDialogOpen(false);
  };

  const handleDelete = (docId: string) => {
    const docToDelete = documentos.find(d => d.id === docId);
    if (docToDelete?.status === 'Eliminado') {
      toast({ variant: "destructive", title: "Ação não permitida", description: "Documentos com status 'Eliminado' não podem ser excluídos." });
      return;
    }
    logAction('DELETE_DOCUMENT', { documentId: docId });
    setDocumentos(prev => prev.filter(d => d.id !== docId));
    toast({ title: "Sucesso", description: "Documento excluído." });
  };
  
  const handleBulkDelete = () => {
    const deletableIds = selectedRowIds.filter(id => {
        const doc = documentos.find(d => d.id === id);
        return doc && doc.status !== 'Eliminado';
    });
    
    const nonDeletableCount = selectedRowIds.length - deletableIds.length;

    if (nonDeletableCount > 0) {
        toast({
            variant: "destructive",
            title: "Ação Parcialmente Bloqueada",
            description: `${nonDeletableCount} documento(s) com status "Eliminado" não podem ser excluídos e foram ignorados.`,
            duration: 7000,
        });
    }

    if (deletableIds.length > 0) {
        logAction('BULK_DELETE_DOCUMENTS', {
            count: deletableIds.length,
            documentIds: deletableIds,
        });
        setDocumentos(prev => prev.filter(doc => !deletableIds.includes(doc.id)));
        toast({
            title: "Exclusão em Bloco Concluída",
            description: `${deletableIds.length} documento(s) foram removidos com sucesso.`,
        });
    }
    
    setSelectedRowIds([]);
    setIsBulkDeleteOpen(false);
  };
  
  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (name: keyof typeof initialFiltersState) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === ALL_VALUES_SENTINEL ? "" : value }));
  };

  const parseDataAbrangenteForYear = (dataAbrangente?: string): string | undefined => {
    if (!dataAbrangente) return undefined;
    const matchAno = dataAbrangente.match(/\d{4}/); 
    return matchAno ? matchAno[0] : undefined;
  };

  const getSortableValue = React.useCallback((doc: Documento, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!column) return null;
    const value = doc[column.accessorKey as keyof Documento];

    if ((column.accessorKey === 'dataArquivamento' || column.accessorKey === 'dataBaixa') && value && typeof value === 'string') {
      const parsedDate = Date.parse(value); 
      return !isNaN(parsedDate) ? new Date(parsedDate) : null;
    }
    return value;
  }, [ALL_COLUMNS_CONFIG]);
  
  const applyFiltersAndSorting = React.useCallback(() => {
    const currentListagemDocIdsParam = searchParams.get('listagemDocIds');
    const docIdsFromListagem = currentListagemDocIdsParam ? currentListagemDocIdsParam.split(',').filter(id => id.trim() !== '') : [];

    const currentReportDocIdsParam = searchParams.get('docIds');
    const docIdsFromReport = currentReportDocIdsParam ? currentReportDocIdsParam.split(',').filter(id => id.trim() !== '') : [];

    let newFilteredDocumentos: Documento[];

    if (docIdsFromReport.length > 0) {
      newFilteredDocumentos = processedDocumentos.filter(doc => docIdsFromReport.includes(doc.id));
    } else if (docIdsFromListagem.length > 0) {
      newFilteredDocumentos = processedDocumentos.filter(doc => docIdsFromListagem.includes(doc.id));
    } else {
        newFilteredDocumentos = processedDocumentos.filter(doc => {
            if (codigoCaixaFromUrl && (!doc.codigosCaixa || !doc.codigosCaixa.split(',').map(c => c.trim()).includes(codigoCaixaFromUrl))) {
                return false;
            }

            if (filters.status && doc.status !== filters.status) return false;
            if (filters.origemDocumento && doc.origem && !doc.origem.toLowerCase().includes(filters.origemDocumento.toLowerCase())) return false;
            if (filters.numeroDocumento && doc.numeroDocumento && !doc.numeroDocumento.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) return false;
            if (filters.processoOriginario && doc.processoOriginario && !doc.processoOriginario.toLowerCase().includes(filters.processoOriginario.toLowerCase())) return false;
            if (filters.numeroAntigo && doc.numeroAntigo && !doc.numeroAntigo.toLowerCase().includes(filters.numeroAntigo.toLowerCase())) return false;
            if (filters.descricao && doc.descricaoDocumento && !doc.descricaoDocumento.toLowerCase().includes(filters.descricao.toLowerCase())) return false;
            
            if (filters.codClassificacao && doc.classificacaoArquivisticaId) {
              const classificacao = classificacoes.find(c => c.id === doc.classificacaoArquivisticaId);
              if (!classificacao || (classificacao.codigo && !classificacao.codigo.toLowerCase().includes(filters.codClassificacao.toLowerCase()))) {
                return false;
              }
            } else if (filters.codClassificacao && !doc.classificacaoArquivisticaId) {
              return false;
            }
      
            if (filters.destinacaoFinal) {
              let effectiveDestination = doc.destinacaoFinalDisplay;
              if (doc.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" || doc.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
                effectiveDestination = "Guarda Permanente";
              }
              if (effectiveDestination !== filters.destinacaoFinal) return false;
            }
      
            if (filters.anoProducao) {
              const anoProducaoDoc = parseDataAbrangenteForYear(doc.dataAbrangente);
              if (!anoProducaoDoc || anoProducaoDoc !== filters.anoProducao) return false;
            }
            if (filters.anoArquivamento && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
              const docYear = getYear(parseISO(doc.dataArquivamento)).toString();
              if (docYear !== filters.anoArquivamento) return false;
            }
            if (filters.anoElimPrevistoExato && doc.anoEliminacaoPrevisto && doc.anoEliminacaoPrevisto !== filters.anoElimPrevistoExato) return false;
            if (filters.anoElimPrevistoAte && doc.anoEliminacaoPrevisto && parseInt(doc.anoEliminacaoPrevisto, 10) > parseInt(filters.anoElimPrevistoAte, 10)) return false;
            
            if (!codigoCaixaFromUrl && filters.codigoCaixa && doc.codigosCaixa && !doc.codigosCaixa.toLowerCase().includes(filters.codigoCaixa.toLowerCase())) return false;
            
      
            if (filters.generoDocumental && doc.generoDocumental !== filters.generoDocumental) return false;
            if (filters.categoriaDocumento && doc.categoria !== filters.categoriaDocumento) return false;
            if (filters.tipoDocumento && doc.tipoDocumento && !doc.tipoDocumento.toLowerCase().includes(filters.tipoDocumento.toLowerCase())) return false; 
            if (filters.pessoasReferidas && doc.partes && !doc.partes.some(p => p.nome.toLowerCase().includes(filters.pessoasReferidas.toLowerCase()))) return false;
            if (filters.codigoAtoM && doc.codigoAtoM && !doc.codigoAtoM.toLowerCase().includes(filters.codigoAtoM.toLowerCase())) return false;
            if (filters.segredoJustica && doc.segredoJustica !== filters.segredoJustica) return false;
            if (filters.grauSigilo && doc.grauSigilo !== filters.grauSigilo) return false;
            if (filters.digitalizado && doc.digitalizado !== filters.digitalizado) return false;
            
            if (filters.anoLimiteDocumento && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
              const docYear = getYear(parseISO(doc.dataArquivamento));
              if (docYear > parseInt(filters.anoLimiteDocumento, 10)) return false;
            }
            if (filters.prazoCorrente && doc.prazoArquivoCorrenteDisplay && !doc.prazoArquivoCorrenteDisplay.toLowerCase().includes(filters.prazoCorrente.toLowerCase())) return false;
            if (filters.prazoIntermediario && doc.prazoArquivoIntermediarioDisplay && !doc.prazoArquivoIntermediarioDisplay.toLowerCase().includes(filters.prazoIntermediario.toLowerCase())) return false;
            if (filters.numeroListagemEliminacao && doc.numeroListagemEliminacao && !doc.numeroListagemEliminacao.toLowerCase().includes(filters.numeroListagemEliminacao.toLowerCase())) return false;
            else if (filters.numeroListagemEliminacao && !doc.numeroListagemEliminacao) return false;

            return true;
        });
    }

    if (sorting.length > 0) {
      newFilteredDocumentos.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = getSortableValue(a, sortConfig.id);
          const valB = getSortableValue(b, sortConfig.id);
    
          let comparisonResult = 0;
    
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else if (typeof valA === 'number' && typeof valB === 'number') {
            comparisonResult = valA - valB;
          } else if (valA instanceof Date && valB instanceof Date) {
            comparisonResult = valA.getTime() - valB.getTime();
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
    setDisplayedDocumentos(newFilteredDocumentos);
  }, [filters, sorting, codigoCaixaFromUrl, searchParams, processedDocumentos, classificacoes, getSortableValue]);

  React.useEffect(() => {
    if (isDataLoaded) { 
      applyFiltersAndSorting();
    }
  }, [applyFiltersAndSorting, isDataLoaded]);


  const clearFilters = () => {
    setFilters(initialFiltersState);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({ ...prev, [columnId as string]: !prev[columnId as string] }));
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

  const getCellValue = (doc: Documento, column: ColumnConfig) => {
    const value = doc[column.accessorKey as keyof Documento];
    if (column.cellFormatter) {
      return column.cellFormatter(value, doc);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
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
  
  const handleCsvExport = (dataToExport: Documento[]) => {
    if (dataToExport.length === 0) {
      toast({ variant: "destructive", title: "Nenhum dado para exportar." });
      return;
    }

    const headers = Object.keys(placeholderDocumentos[0]).filter(key => !key.startsWith('outro'));
    const csvRows = [headers.join(',')];

    dataToExport.forEach(doc => {
        const row = headers.map(header => {
            const value = doc[header as keyof Documento];
            const stringValue = value === null || value === undefined ? "" : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'acervo_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Sucesso", description: "Exportação de documentos concluída." });
  };
  
  const handleExportSelectedCSV = () => {
    const selectedData = documentos.filter(doc => selectedRowIds.includes(doc.id));
    handleCsvExport(selectedData);
  };

  const handleExportAllCSV = () => {
    const dataToExport = displayedDocumentos.length > 0 ? displayedDocumentos : processedDocumentos;
    handleCsvExport(dataToExport);
  };
  
  const handleDownloadTemplate = () => {
    const templateHeaders = [
        'status', 'orgao', 'origem', 'tipoMeio', 'generoDocumental', 'categoria', 
        'tipoDocumento', 'numeroDocumento', 'processoOriginario', 'numeroAntigo', 'dataAbrangente', 'descricaoDocumento', 
        'partes', 'documentosRelacionadosIds', 
        'dataArquivamento', 'quantidadeVolumes', 'quantidadeApensos', 'numerosApensos', 
        'totalMidias', 'tipoMidiaDetalhe', 'numeroMidiaDetalhe', 'paginaMidiaDetalhe', 
        'digitalizado', 'tipoBaixa', 'dataBaixa', 'classificacaoArquivisticaId', 
        'alteracaoDestinacaoFinal', 'segredoJustica', 'grauSigilo', 'codigosCaixa', 
        'codigoAtoM', 'observacoesGerais', 'codigoClassificacaoJudicialId', 
        'numeroListagemEliminacao'
    ];
    const csvContent = templateHeaders.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_acervo.csv');
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
            const headerRow = rows.shift()?.trim();
            if (!headerRow) throw new Error("Arquivo CSV vazio ou sem cabeçalho.");
            
            const headers = parseCsvRow(headerRow);

            const newDocsFromCsv: Documento[] = [];
            const newTiposDocSet = new Set<string>();
            const newTiposOrigemSet = new Set<string>();
            const newTiposParteSet = new Set<string>();
            const newGenerosSet = new Set<string>();
            const newTiposMidiaSet = new Set<string>();
            const newCaixasMap = new Map<string, Caixa>();

            const currentTiposDoc = new Set(tiposDocumento);
            const currentTiposOrigem = new Set(tiposOrigem.map(o => o.nome));
            const currentTiposParte = new Set(tiposParte);
            const currentGeneros = new Set(generosDocumentais);
            const currentTiposMidia = new Set(tiposMidia);
            const currentCaixaCodes = new Set(caixas.map(c => c.codigoCaixa));

            rows.forEach((row, index) => {
                if(!row.trim()) return;

                const values = parseCsvRow(row);
                const newDocData: { [key: string]: any } = {};
                headers.forEach((header, i) => {
                  newDocData[header] = values[i] || "";
                });
                
                if (newDocData.tipoDocumento && !currentTiposDoc.has(newDocData.tipoDocumento)) {
                    newTiposDocSet.add(newDocData.tipoDocumento);
                }
                if (newDocData.origem && !currentTiposOrigem.has(newDocData.origem)) {
                    newTiposOrigemSet.add(newDocData.origem);
                }
                if (newDocData.tipoParte && !currentTiposParte.has(newDocData.tipoParte)) {
                    newTiposParteSet.add(newDocData.tipoParte);
                }
                if (newDocData.generoDocumental && !currentGeneros.has(newDocData.generoDocumental)) {
                    newGenerosSet.add(newDocData.generoDocumental);
                }
                if (newDocData.tipoMidiaDetalhe && !currentTiposMidia.has(newDocData.tipoMidiaDetalhe)) {
                    newTiposMidiaSet.add(newDocData.tipoMidiaDetalhe);
                }
                if (newDocData.codigosCaixa) {
                    const boxCodes = String(newDocData.codigosCaixa).split(',').map((c: string) => c.trim()).filter(Boolean);
                    boxCodes.forEach((code: string) => {
                        if (!currentCaixaCodes.has(code) && !newCaixasMap.has(code)) {
                            const newCaixa: Caixa = {
                                id: `CX_IMP_ACERVO_${Date.now()}_${code}`,
                                codigoCaixa: code,
                                descricao: "Caixa criada automaticamente via importação de acervo.",
                                tipo: "JUD", // Default type
                                status: "Aberta",
                                situacao: "Incompleta",
                                documentoIds: []
                            };
                            newCaixasMap.set(code, newCaixa);
                        }
                    });
                }
                
                const dataArquivamento = newDocData.dataArquivamento ? new Date(newDocData.dataArquivamento).toISOString() : undefined;
                const classification = classificacoes.find(c => c.id === newDocData.classificacaoArquivisticaId);
                
                let prazoCorrente = "";
                if (classification) {
                    if (classification.tipoPrazoFaseCorrente === "Anos") {
                      prazoCorrente = `${classification.prazoGuardaFaseCorrenteAnos ?? 'N/A'} Anos`;
                    } else if (classification.tipoPrazoFaseCorrente === "Condição Textual") {
                      prazoCorrente = classification.prazoGuardaFaseCorrenteCondicaoTextual || "";
                    }
                }

                const prazoIntermediario = classification ? `${classification.prazoGuardaFaseIntermediariaAnos} Anos` : "";
                const destinacao = classification?.destinacaoFinal;

                let anoEliminacao = "";
                if (dataArquivamento && isValid(parseISO(dataArquivamento)) && classification && destinacao === 'Eliminação') {
                    const dataArquivamentoDate = parseISO(dataArquivamento);
                    let prazoIntermediarioAnosNum = classification.prazoGuardaFaseIntermediariaAnos ?? 0;
                    const anoArquivamento = getYear(dataArquivamentoDate);
                    anoEliminacao = (anoArquivamento + prazoIntermediarioAnosNum + 1).toString();
                }
                
                const partes = newDocData.partes ? JSON.parse(newDocData.partes) : [];

                const newDoc: Documento = {
                    id: `DOC_IMP_${Date.now()}_${index}`,
                    dataCadastro: new Date().toISOString(),
                    ...initialFormState,
                    status: newDocData.status || 'Arquivado',
                    orgao: newDocData.orgao || 'TRF2',
                    origem: newDocData.origem,
                    tipoMeio: newDocData.tipoMeio || 'Não digital',
                    generoDocumental: newDocData.generoDocumental || 'Textual',
                    categoria: newDocData.categoria || 'Documento',
                    tipoDocumento: newDocData.tipoDocumento,
                    numeroDocumento: newDocData.numeroDocumento,
                    processoOriginario: newDocData.processoOriginario,
                    numeroAntigo: newDocData.numeroAntigo,
                    dataAbrangente: newDocData.dataAbrangente,
                    descricaoDocumento: newDocData.descricaoDocumento,
                    partes: partes,
                    documentosRelacionadosIds: newDocData.documentosRelacionadosIds,
                    dataArquivamento,
                    quantidadeVolumes: newDocData.quantidadeVolumes ? parseInt(newDocData.quantidadeVolumes, 10) : undefined,
                    quantidadeApensos: newDocData.quantidadeApensos ? parseInt(newDocData.quantidadeApensos, 10) : undefined,
                    numerosApensos: newDocData.numerosApensos,
                    totalMidias: newDocData.totalMidias ? parseInt(newDocData.totalMidias, 10) : undefined,
                    tipoMidiaDetalhe: newDocData.tipoMidiaDetalhe,
                    numeroMidiaDetalhe: newDocData.numeroMidiaDetalhe,
                    paginaMidiaDetalhe: newDocData.paginaMidiaDetalhe,
                    digitalizado: newDocData.digitalizado || 'Não',
                    tipoBaixa: newDocData.tipoBaixa,
                    dataBaixa: newDocData.dataBaixa ? new Date(newDocData.dataBaixa).toISOString() : undefined,
                    classificacaoArquivisticaId: newDocData.classificacaoArquivisticaId,
                    prazoArquivoCorrenteDisplay: prazoCorrente,
                    prazoArquivoIntermediarioDisplay: prazoIntermediario,
                    destinacaoFinalDisplay: destinacao,
                    alteracaoDestinacaoFinal: newDocData.alteracaoDestinacaoFinal || 'Não Alterar',
                    anoEliminacaoPrevisto: anoEliminacao,
                    segredoJustica: newDocData.segredoJustica || 'Não',
                    grauSigilo: newDocData.grauSigilo || 'Ostensivo',
                    codigosCaixa: newDocData.codigosCaixa,
                    codigoAtoM: newDocData.codigoAtoM,
                    observacoesGerais: newDocData.observacoesGerais,
                    codigoClassificacaoJudicialId: newDocData.codigoClassificacaoJudicialId,
                    numeroListagemEliminacao: newDocData.numeroListagemEliminacao,
                };
                newDocsFromCsv.push(newDoc);
            });
            
            if (newTiposDocSet.size > 0) {
                setTiposDocumento(prev => [...prev, ...Array.from(newTiposDocSet)]);
            }
            if (newTiposOrigemSet.size > 0) {
                const newOrigens: TipoOrigem[] = Array.from(newTiposOrigemSet).map(nome => ({
                    id: `to_imp_${Date.now()}_${nome.replace(/\s+/g, '_')}`,
                    nome: nome,
                }));
                setTiposOrigem(prev => [...prev, ...newOrigens]);
            }
            if (newTiposParteSet.size > 0) {
                setTiposParte(prev => [...prev, ...Array.from(newTiposParteSet)]);
            }
            if (newGenerosSet.size > 0) {
                setGenerosDocumentais(prev => [...prev, ...Array.from(newGenerosSet)]);
            }
            if (newTiposMidiaSet.size > 0) {
                setTiposMidia(prev => [...prev, ...Array.from(newTiposMidiaSet)]);
            }
            if (newCaixasMap.size > 0) {
                setCaixas(prev => [...prev, ...Array.from(newCaixasMap.values())]);
            }

            setDocumentos(prev => [...prev, ...newDocsFromCsv]);
            toast({ title: "Importação Concluída", description: `${newDocsFromCsv.length} documentos foram importados com sucesso. Novos termos de configuração e caixas foram adicionados automaticamente, se necessário.` });

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
  
    const bulkEditableFields = [
    { value: 'status', label: 'Status', type: 'select', options: ['Arquivado', 'Pendente de Conferência', 'Eliminado', 'Emprestado', 'Desarquivado', 'Aguardando prazo para eliminação'] },
    { value: 'codigosCaixa', label: 'Código(s) da(s) Caixa(s)', type: 'text' },
    { value: 'dataArquivamento', label: 'Data de Arquivamento', type: 'date' },
    { value: 'origem', label: 'Origem', type: 'select', options: tiposOrigem.map(o => o.sigla ? `${o.nome} - ${o.sigla}` : o.nome).sort((a, b) => a.localeCompare(b)) },
    { value: 'tipoMeio', label: 'Tipo de Meio', type: 'select', options: ['Não digital', 'Digital', 'Híbrido'] },
    { value: 'generoDocumental', label: 'Gênero Documental', type: 'select', options: generosDocumentais.sort((a, b) => a.localeCompare(b)) },
    { value: 'categoria', label: 'Categoria', type: 'select', options: ['Documento', 'Dossiê', 'Processo Judicial', 'Processo Administrativo'] },
    { value: 'tipoDocumento', label: 'Espécie de Documento', type: 'select', options: tiposDocumento.sort((a, b) => a.localeCompare(b)) },
    { value: 'digitalizado', label: 'Digitalizado', type: 'select', options: ['Sim', 'Não'] },
    { value: 'segredoJustica', label: 'Segredo de Justiça', type: 'select', options: ['Sim', 'Não'] },
    { value: 'grauSigilo', label: 'Grau de Sigilo (LAI)', type: 'select', options: ['Ostensivo', 'Reservado', 'Secreto', 'Ultrassecreto'] },
    { value: 'classificacaoArquivisticaId', label: 'Classificação (por código)', type: 'text' },
    { value: 'numeroListagemEliminacao', label: 'Nº Listagem de Eliminação', type: 'text' },
    { value: 'processoOriginario', label: 'Processo Originário', type: 'text' },
    { value: 'numeroAntigo', label: 'Número Antigo', type: 'text' },
  ];

  const selectedBulkField = bulkEditableFields.find(f => f.value === bulkEditField);

  const handleBulkUpdate = () => {
    if (!bulkEditField || (typeof bulkEditValue !== 'boolean' && !bulkEditValue)) {
      toast({
        variant: "destructive",
        title: "Ação Incompleta",
        description: "Por favor, selecione um campo e forneça o novo valor.",
      });
      return;
    }

    logAction('BULK_UPDATE_DOCUMENTS', {
      count: selectedRowIds.length,
      field: bulkEditField,
      documentIds: selectedRowIds,
    });

    if (bulkEditField === 'classificacaoArquivisticaId') {
      const classificationCode = bulkEditValue;
      const classification = classificacoes.find(c => c.codigo === classificationCode);

      if (!classification) {
        toast({ title: "Erro", description: `Código de classificação "${classificationCode}" não encontrado.` });
        return;
      }
      if (classification.status !== 'Ativo') {
        toast({ title: "Erro", description: `A classificação "${classificationCode}" não está ativa.` });
        return;
      }

      setDocumentos(prevDocs =>
        prevDocs.map(doc => {
          if (selectedRowIds.includes(doc.id)) {
            let prazoCorrente = "";
            if (classification.tipoPrazoFaseCorrente === "Anos") {
                prazoCorrente = `${classification.prazoGuardaFaseCorrenteAnos ?? 'N/A'} Anos`;
            } else if (classification.tipoPrazoFaseCorrente === "Condição Textual") {
                prazoCorrente = classification.prazoGuardaFaseCorrenteCondicaoTextual || "";
            }
            const prazoIntermediario = `${classification.prazoGuardaFaseIntermediariaAnos} Anos`;
            const destinacao = classification.destinacaoFinal;
            let anoEliminacao = "";
            if (doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento)) && destinacao === 'Eliminação') {
                const dataArquivamentoDate = parseISO(doc.dataArquivamento);
                const prazoIntermediarioAnosNum = classification.prazoGuardaFaseIntermediariaAnos ?? 0;
                anoEliminacao = (getYear(dataArquivamentoDate) + prazoIntermediarioAnosNum + 1).toString();
            }

            return {
              ...doc,
              classificacaoArquivisticaId: classification.id,
              prazoArquivoCorrenteDisplay: prazoCorrente,
              prazoArquivoIntermediarioDisplay: prazoIntermediario,
              destinacaoFinalDisplay: destinacao,
              anoEliminacaoPrevisto: anoEliminacao,
            };
          }
          return doc;
        })
      );
    } else {
      // General case for other fields
      setDocumentos(prevDocs =>
        prevDocs.map(doc => {
          if (selectedRowIds.includes(doc.id)) {
            const valueToSet = bulkEditField === 'dataArquivamento' && bulkEditValue instanceof Date
              ? bulkEditValue.toISOString()
              : bulkEditValue;
            
            return { ...doc, [bulkEditField]: valueToSet };
          }
          return doc;
        })
      );
    }
    
    toast({
      title: "Alteração em Bloco Concluída",
      description: `${selectedRowIds.length} documento(s) foram atualizados com sucesso.`,
    });

    setSelectedRowIds([]);
    setIsBulkEditOpen(false);
    setBulkEditField('');
    setBulkEditValue('');
  };

  const numDisp = displayedDocumentos.length;
  const numSel = selectedRowIds.length;

  let pageTitle = "Gerenciamento do Acervo";
  let pageDescription = "Cadastre e gerencie as descrições dos documentos do acervo.";

  if (isFilteredByReport && reportContext) {
    pageTitle = reportContext;
    pageDescription = `Exibindo ${numDisp} documento(s) filtrado(s) a partir do Relatório de Previsão de Eliminação.`;
  } else if (isFilteredByListagem) {
    pageTitle = numeroListagemFromQuery
      ? `Documentos da Listagem de Eliminação nº ${numeroListagemFromQuery}`
      : "Documentos da Listagem de Eliminação";
    pageDescription = `Exibindo ${numDisp} documento(s) incluído(s) na listagem de eliminação selecionada.`;
  } else if (codigoCaixaFromUrl) {
    pageTitle = `Documentos na Caixa: ${codigoCaixaFromUrl}`;
    pageDescription = `Exibindo ${numDisp} documento(s) pertencente(s) à caixa ${codigoCaixaFromUrl}.`;
  }

  const filtersAreActive = React.useMemo(() => {
    return Object.values(filters).some(value => !!value);
  }, [filters]);

  const columnsToPrint = React.useMemo(() => ALL_COLUMNS_CONFIG.filter(col => columnVisibility[col.id as string]), [ALL_COLUMNS_CONFIG, columnVisibility]);
  const dataToPrint = React.useMemo(() => documentos.filter(doc => selectedRowIds.includes(doc.id)), [documentos, selectedRowIds]);


  return (
    <TooltipProvider>
      <div className={isPrinting ? 'printable-area' : 'container mx-auto py-2'}>
        {isPrinting ? (
           <Card>
            <CardHeader className="non-printable flex-row items-center justify-between">
              <div>
                <CardTitle>Relatório de Documentos Selecionados</CardTitle>
                <CardDescription>Exibindo {dataToPrint.length} documentos para impressão.</CardDescription>
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
        ) : (
          <>
            <PageHeader 
              title={pageTitle}
              description={pageDescription}
            >
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
                  <Button variant="outline" onClick={handleExportAllCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Tudo
                  </Button>
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Baixar Modelo
                  </Button>
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv"
                      className="hidden"
                  />
                  <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                    setIsDialogOpen(isOpen);
                    if (!isOpen) {
                      resetForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar ao Acervo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-primary">
                          {isFormDisabled ? "Visualizar Documento (Eliminado)" : "Adicionar/Editar Item ao Acervo"}
                        </DialogTitle>
                        <DialogDescription>
                          {isFormDisabled 
                            ? "Este documento foi eliminado e não pode mais ser alterado. Os dados são somente para consulta." 
                            : "Preencha as informações abaixo. Campos com * são obrigatórios."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[75vh] pr-6">
                          <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-4"]} className="w-full">
                              <AccordionItem value="item-1">
                                  <AccordionTrigger className="font-semibold">Identificação Principal</AccordionTrigger>
                                  <AccordionContent>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3 pt-4">
                                          <div className="space-y-2">
                                              <Label htmlFor="idDisplay">ID do Documento (Sistema)</Label>
                                              <Input id="idDisplay" value={documentIdToDisplay} readOnly className="bg-muted/50 cursor-not-allowed" />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="status">Status*</Label>
                                              <Select onValueChange={handleSelectChange('status')} value={formState.status} disabled={isFormDisabled}>
                                              <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Arquivado">Arquivado</SelectItem>
                                                  <SelectItem value="Pendente de Conferência">Pendente de Conferência</SelectItem>
                                                  <SelectItem value="Eliminado">Eliminado</SelectItem>
                                                  <SelectItem value="Emprestado">Emprestado</SelectItem>
                                                  <SelectItem value="Desarquivado">Desarquivado</SelectItem>
                                                  <SelectItem value="Aguardando prazo para eliminação">Aguardando prazo para eliminação</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="orgao">Órgão*</Label>
                                              <Select onValueChange={handleSelectChange('orgao')} value={formState.orgao} disabled={isFormDisabled}>
                                              <SelectTrigger id="orgao"><SelectValue placeholder="Selecione o órgão" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="TRF2">TRF2</SelectItem>
                                                  <SelectItem value="SJRJ">SJRJ</SelectItem>
                                                  <SelectItem value="SJES">SJES</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="origem">Origem*</Label>
                                              <Select onValueChange={handleSelectChange('origem')} value={formState.origem} disabled={isFormDisabled}>
                                              <SelectTrigger id="origem"><SelectValue placeholder="Selecione a origem" /></SelectTrigger>
                                              <SelectContent>
                                                  {tiposOrigem
                                                  .filter(o => o && o.nome)
                                                  .sort((a,b) => a.nome.localeCompare(b.nome))
                                                  .map(o => {
                                                      const displayValue = o.sigla ? `${o.nome} - ${o.sigla}` : o.nome;
                                                      return (<SelectItem key={o.id} value={displayValue}>{displayValue}</SelectItem>)
                                                  })}
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="categoria">Categoria*</Label>
                                              <Select onValueChange={handleSelectChange('categoria')} value={formState.categoria} disabled={isFormDisabled}>
                                              <SelectTrigger id="categoria"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Documento">Documento</SelectItem>
                                                  <SelectItem value="Dossiê">Dossiê</SelectItem>
                                                  <SelectItem value="Processo Judicial">Processo Judicial</SelectItem>
                                                  <SelectItem value="Processo Administrativo">Processo Administrativo</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="tipoDocumento">Espécie de Documento*</Label>
                                              <Select onValueChange={handleSelectChange('tipoDocumento')} value={formState.tipoDocumento} disabled={isFormDisabled}>
                                              <SelectTrigger id="tipoDocumento"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                              <SelectContent>
                                                  {tiposDocumento.sort((a, b) => a.localeCompare(b)).map(tipo => (
                                                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                                  ))}
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="numeroDocumento">Número do Documento</Label>
                                              <Input id="numeroDocumento" value={formState.numeroDocumento || ""} onChange={handleInputChange} placeholder="Ex: 123/2024 ou PRC-001/2024" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="processoOriginario">Processo Originário</Label>
                                              <Input id="processoOriginario" value={formState.processoOriginario || ""} onChange={handleInputChange} placeholder="Nº do processo que deu origem" disabled={isFormDisabled} />
                                          </div>
                                           <div className="space-y-2">
                                              <Label htmlFor="numeroAntigo">Número Antigo</Label>
                                              <Input id="numeroAntigo" value={formState.numeroAntigo || ""} onChange={handleInputChange} placeholder="Nº antigo do processo" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="dataAbrangente">Data Abrangente do Documento*</Label>
                                              <Input id="dataAbrangente" value={formState.dataAbrangente || ""} onChange={handleInputChange} placeholder="Ex: 01/2023 – 12/2024 ou 15/01/2023" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="dataArquivamento">Data de Arquivamento*</Label>
                                              <DateInputPicker 
                                              value={formState.dataArquivamento ? parseISO(formState.dataArquivamento) : undefined} 
                                              onChange={(date) => handleDateChange('dataArquivamento')(date)} 
                                              placeholder="dd/mm/aaaa"
                                              disabled={isFormDisabled}
                                              />
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="item-2">
                                  <AccordionTrigger className="font-semibold">Descrição e Partes</AccordionTrigger>
                                  <AccordionContent>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-4">
                                          <div className="space-y-2 sm:col-span-2">
                                              <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
                                              <Textarea id="descricaoDocumento" value={formState.descricaoDocumento || ""} onChange={handleInputChange} placeholder="Detalhes sobre o conteúdo do documento" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2 sm:col-span-2">
                                              <Label htmlFor="observacoesGerais">Observações Gerais</Label>
                                              <Textarea id="observacoesGerais" value={formState.observacoesGerais || ""} onChange={handleInputChange} placeholder="Outras informações relevantes sobre o documento" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2 sm:col-span-2">
                                              <div className="flex justify-between items-center mb-2">
                                                  <Label>Partes Envolvidas</Label>
                                                  <Button type="button" variant="outline" size="sm" onClick={() => handleOpenParteDialog()} disabled={isFormDisabled}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Parte</Button>
                                              </div>
                                              <Card>
                                                  <CardContent className="p-2 space-y-2">
                                                      {formState.partes && formState.partes.length > 0 ? (
                                                          formState.partes.map(parte => (
                                                              <div key={parte.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                                                  <div>
                                                                      <p className="font-medium">{parte.nome}</p>
                                                                      <p className="text-muted-foreground">{parte.tipoParte} {parte.cpfCnpj && `(${parte.cpfCnpj})`}</p>
                                                                  </div>
                                                                  {!isFormDisabled && (
                                                                  <div>
                                                                      <Button variant="ghost" size="icon" onClick={() => handleOpenParteDialog(parte)}><Edit className="h-4 w-4" /></Button>
                                                                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveParte(parte.id)}><Trash2 className="h-4 w-4" /></Button>
                                                                  </div>
                                                                  )}
                                                              </div>
                                                          ))
                                                      ) : (
                                                          <p className="text-center text-sm text-muted-foreground p-4">Nenhuma parte adicionada.</p>
                                                      )}
                                                  </CardContent>
                                              </Card>
                                          </div>
                                          <div className="space-y-2 sm:col-span-2">
                                              <Label htmlFor="documentosRelacionadosIds">Documentos Relacionados</Label>
                                              <div className="flex flex-wrap items-center gap-2 rounded-md border p-2 min-h-[40px]">
                                                  {formState.documentosRelacionadosIds?.split(',').filter(Boolean).map(id => (
                                                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                                          <Link href={`/documentos?edit=${id.trim()}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
                                                              {id.trim()}
                                                          </Link>
                                                          <button type="button" className="rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => handleRemoveRelatedDoc(id.trim())} aria-label={`Remover ${id.trim()}`} disabled={isFormDisabled}>
                                                              <X className="h-3 w-3" />
                                                          </button>
                                                      </Badge>
                                                  ))}
                                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsRelatedDocDialogOpen(true)} disabled={isFormDisabled}>
                                                      <PlusCircle className="h-4 w-4" /><span className="sr-only">Adicionar documento relacionado</span>
                                                  </Button>
                                              </div>
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="item-3">
                                  <AccordionTrigger className="font-semibold">Detalhes Físicos, Mídias e Digitalização</AccordionTrigger>
                                  <AccordionContent>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3 pt-4">
                                          <div className="space-y-2">
                                              <Label htmlFor="tipoMeio">Tipo de Meio*</Label>
                                              <Select onValueChange={handleSelectChange('tipoMeio')} value={formState.tipoMeio} disabled={isFormDisabled}>
                                              <SelectTrigger id="tipoMeio"><SelectValue placeholder="Selecione o tipo de meio" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Não digital">Não digital</SelectItem>
                                                  <SelectItem value="Digital">Digital</SelectItem>
                                                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="generoDocumental">Gênero Documental</Label>
                                              <Select onValueChange={handleSelectChange('generoDocumental')} value={formState.generoDocumental} disabled={isFormDisabled}>
                                              <SelectTrigger id="generoDocumental"><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                                              <SelectContent>
                                                  {generosDocumentais.sort((a, b) => a.localeCompare(b)).map(g => (
                                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                                  ))}
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="quantidadeVolumes">Quantidade de Volumes</Label>
                                              <Input id="quantidadeVolumes" type="number" value={formState.quantidadeVolumes === undefined ? "" : formState.quantidadeVolumes} onChange={handleNumericInputChange} placeholder="Ex: 2 (0 se não houver)" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="quantidadeApensos">Quantidade de Apensos</Label>
                                              <Input id="quantidadeApensos" type="number" value={formState.quantidadeApensos === undefined ? "" : formState.quantidadeApensos} onChange={handleNumericInputChange} placeholder="Ex: 1 (0 se não houver)" disabled={isFormDisabled} />
                                          </div>
                                          { (formState.quantidadeApensos !== undefined && formState.quantidadeApensos > 0) && (
                                              <div className="space-y-2">
                                              <Label htmlFor="numerosApensos">Número(s) dos Apensos</Label>
                                              <Input id="numerosApensos" value={formState.numerosApensos || ""} onChange={handleInputChange} placeholder="Ex: AP001, AP002" disabled={isFormDisabled} />
                                              </div>
                                          )}
                                          <div className="space-y-2">
                                              <Label htmlFor="totalMidias">Total de Mídias</Label>
                                              <Input id="totalMidias" type="number" value={formState.totalMidias === undefined ? "" : formState.totalMidias} onChange={handleNumericInputChange} placeholder="Ex: 1 (0 se não houver)" disabled={isFormDisabled} />
                                          </div>
                                          {(formState.totalMidias !== undefined && formState.totalMidias > 0) && (
                                              <>
                                              <div className="space-y-2">
                                                  <Label htmlFor="tipoMidiaDetalhe">Tipo de Mídia</Label>
                                                  <Select onValueChange={handleSelectChange('tipoMidiaDetalhe')} value={formState.tipoMidiaDetalhe} disabled={isFormDisabled}>
                                                  <SelectTrigger id="tipoMidiaDetalhe"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                                  <SelectContent>
                                                      {tiposMidia.sort((a,b) => a.localeCompare(b)).map(m => (
                                                          <SelectItem key={m} value={m}>{m}</SelectItem>
                                                      ))}
                                                  </SelectContent>
                                                  </Select>
                                              </div>
                                              <div className="space-y-2">
                                                  <Label htmlFor="numeroMidiaDetalhe">Número da Mídia</Label>
                                                  <Input id="numeroMidiaDetalhe" value={formState.numeroMidiaDetalhe || ""} onChange={handleInputChange} disabled={isFormDisabled} />
                                              </div>
                                              <div className="space-y-2">
                                                  <Label htmlFor="paginaMidiaDetalhe">Página da Mídia</Label>
                                                  <Input id="paginaMidiaDetalhe" value={formState.paginaMidiaDetalhe || ""} onChange={handleInputChange} disabled={isFormDisabled} />
                                              </div>
                                              </>
                                          )}
                                          <div className="space-y-2">
                                              <Label htmlFor="digitalizado">Digitalizado?</Label>
                                              <Select onValueChange={handleSelectChange('digitalizado')} value={formState.digitalizado} disabled={isFormDisabled}>
                                              <SelectTrigger id="digitalizado"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Sim">Sim</SelectItem>
                                                  <SelectItem value="Não">Não</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="item-4">
                                  <AccordionTrigger className="font-semibold">Classificação Arquivística</AccordionTrigger>
                                  <AccordionContent>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3 pt-4">
                                          <div className="space-y-2">
                                              <Label htmlFor="codigoClassificacaoArquivisticaInput">Código de Classificação Arquivística*</Label>
                                              <Input 
                                              id="codigoClassificacaoArquivisticaInput" 
                                              name="codigoClassificacaoArquivisticaInput"
                                              value={formState.codigoClassificacaoArquivisticaInput || ""} 
                                              onChange={handleInputChange}
                                              onBlur={handleCodigoClassificacaoBlur}
                                              placeholder="Digite o código (ex: 020.1)"
                                              disabled={isFormDisabled}
                                              />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="assuntoClassificacaoDisplay">Assunto da Classificação</Label>
                                              <Input 
                                              id="assuntoClassificacaoDisplay" 
                                              value={formState.assuntoClassificacaoDisplay || ""} 
                                              readOnly 
                                              className={cn("bg-muted/50 cursor-not-allowed", {
                                                  "text-destructive": formState.assuntoClassificacaoDisplay?.includes('inválido')
                                              })}
                                              />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="prazoArquivoCorrenteDisplay">Prazo Arquivo Corrente</Label>
                                              <Input id="prazoArquivoCorrenteDisplay" value={formState.prazoArquivoCorrenteDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="prazoArquivoIntermediarioDisplay">Prazo Arquivo Intermediário</Label>
                                              <Input id="prazoArquivoIntermediarioDisplay" value={formState.prazoArquivoIntermediarioDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="destinacaoFinalDisplay">Destinação Final (Classif.)</Label>
                                              <Input id="destinacaoFinalDisplay" value={formState.destinacaoFinalDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="alteracaoDestinacaoFinal">Alteração de Destinação Final</Label>
                                              <Select onValueChange={handleSelectChange('alteracaoDestinacaoFinal')} value={formState.alteracaoDestinacaoFinal} disabled={isFormDisabled}>
                                              <SelectTrigger id="alteracaoDestinacaoFinal"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Não Alterar">Não Alterar</SelectItem>
                                                  <SelectItem value="Guarda Permanente – Guarda Amostral">Guarda Permanente – Guarda Amostral</SelectItem>
                                                  <SelectItem value="Guarda Permanente – Decisão da CPAD">Guarda Permanente – Decisão da CPAD</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="anoEliminacaoPrevisto">Ano de Eliminação Previsto</Label>
                                              <Input id="anoEliminacaoPrevisto" value={formState.anoEliminacaoPrevisto || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="item-5">
                                  <AccordionTrigger className="font-semibold">Informações Adicionais (Sigilo, Judicial)</AccordionTrigger>
                                  <AccordionContent>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3 pt-4">
                                          <div className="space-y-2">
                                              <Label htmlFor="segredoJustica">Segredo de Justiça*</Label>
                                              <Select onValueChange={handleSelectChange('segredoJustica')} value={formState.segredoJustica} disabled={isFormDisabled}>
                                              <SelectTrigger id="segredoJustica"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Sim">Sim</SelectItem>
                                                  <SelectItem value="Não">Não</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="grauSigilo">Grau de Sigilo (LAI)*</Label>
                                              <Select onValueChange={handleSelectChange('grauSigilo')} value={formState.grauSigilo} disabled={isFormDisabled}>
                                              <SelectTrigger id="grauSigilo"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Ostensivo">Ostensivo</SelectItem>
                                                  <SelectItem value="Reservado">Reservado</SelectItem>
                                                  <SelectItem value="Secreto">Secreto</SelectItem>
                                                  <SelectItem value="Ultrassecreto">Ultrassecreto</SelectItem>
                                              </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="codigoClassificacaoJudicialId">Código de Classificação Judicial</Label>
                                              <Input 
                                              id="codigoClassificacaoJudicialId" 
                                              value={formState.codigoClassificacaoJudicialId || ""} 
                                              onChange={handleInputChange} 
                                              placeholder="ID da Classe Judicial" 
                                              disabled={formState.categoria !== "Processo Judicial" || isFormDisabled}
                                              className={formState.categoria !== "Processo Judicial" ? "bg-muted/50 cursor-not-allowed" : ""}
                                              />
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="item-6">
                                  <AccordionTrigger className="font-semibold">Localização e Baixa</AccordionTrigger>
                                  <AccordionContent>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3 pt-4">
                                          <div className="space-y-2">
                                              <Label htmlFor="codigosCaixa">Código(s) da(s) Caixa(s)</Label>
                                              <Input id="codigosCaixa" value={formState.codigosCaixa || ""} onChange={handleInputChange} placeholder="Ex: CX-A-001, CX-B-002" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="codigoAtoM">Código do AtoM</Label>
                                              <Input id="codigoAtoM" value={formState.codigoAtoM || ""} onChange={handleInputChange} placeholder="Código do AtoM (se aplicável)" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="numeroListagemEliminacao">Nº Listagem Eliminação</Label>
                                              <Input id="numeroListagemEliminacao" value={formState.numeroListagemEliminacao || ""} onChange={handleInputChange} placeholder="Ex: LE-2024-001" disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="tipoBaixa">Tipo de Baixa</Label>
                                              <Input id="tipoBaixa" value={formState.tipoBaixa || ""} onChange={handleInputChange} disabled={isFormDisabled} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor="dataBaixa">Data da Baixa</Label>
                                              <DateInputPicker 
                                              value={formState.dataBaixa ? parseISO(formState.dataBaixa) : undefined} 
                                              onChange={(date) => handleDateChange('dataBaixa')(date)} 
                                              placeholder="dd/mm/aaaa"
                                              disabled={isFormDisabled}
                                              />
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                          </Accordion>
                      </ScrollArea>
                      <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={resetForm} disabled={isFormDisabled}>Limpar</Button>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSaveChanges} disabled={isFormDisabled}>Salvar Documento</Button>
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
                    <CardTitle className="font-headline text-primary text-xl">Filtros do Acervo</CardTitle>
                  </div>
                  {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </AccordionTrigger>
                <AccordionContent>
                  <CardDescription className="px-6 pb-4 text-sm">
                    Refine a lista de documentos aplicando um ou mais filtros abaixo.
                  </CardDescription>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="filterStatus">Status</Label>
                      <Select onValueChange={handleFilterSelectChange('status')} value={filters.status}>
                        <SelectTrigger id="filterStatus"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todos os status</SelectItem>
                          <SelectItem value="Arquivado">Arquivado</SelectItem>
                          <SelectItem value="Pendente de Conferência">Pendente de Conferência</SelectItem>
                          <SelectItem value="Eliminado">Eliminado</SelectItem>
                          <SelectItem value="Emprestado">Emprestado</SelectItem>
                          <SelectItem value="Desarquivado">Desarquivado</SelectItem>
                          <SelectItem value="Aguardando prazo para eliminação">Aguardando prazo para eliminação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterOrigemDocumento">Origem do Documento</Label>
                      <Input id="filterOrigemDocumento" name="origemDocumento" value={filters.origemDocumento} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterNumeroDocumento">Número do Documento</Label>
                      <Input id="filterNumeroDocumento" name="numeroDocumento" value={filters.numeroDocumento} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="filterNumeroAntigo">Número Antigo</Label>
                      <Input id="filterNumeroAntigo" name="numeroAntigo" value={filters.numeroAntigo} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterProcessoOriginario">Processo Originário</Label>
                      <Input id="filterProcessoOriginario" name="processoOriginario" value={filters.processoOriginario} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterDescricao">Descrição</Label>
                      <Input id="filterDescricao" name="descricao" value={filters.descricao} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterCodClassificacao">Cód. Classificação</Label>
                      <Input id="filterCodClassificacao" name="codClassificacao" value={filters.codClassificacao} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterDestinacaoFinal">Destinação Final</Label>
                      <Select onValueChange={handleFilterSelectChange('destinacaoFinal')} value={filters.destinacaoFinal}>
                        <SelectTrigger id="filterDestinacaoFinal"><SelectValue placeholder="Todas as destinações" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todas as destinações</SelectItem>
                          <SelectItem value="Eliminação">Eliminação</SelectItem>
                          <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterAnoProducao">Ano de Produção</Label>
                      <Input id="filterAnoProducao" name="anoProducao" type="number" value={filters.anoProducao} onChange={handleFilterInputChange} placeholder="AAAA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterAnoArquivamento">Ano de Arquivamento</Label>
                      <Input id="filterAnoArquivamento" name="anoArquivamento" type="number" value={filters.anoArquivamento} onChange={handleFilterInputChange} placeholder="AAAA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterAnoElimPrevistoExato">Ano Elim. Previsto (Exato)</Label>
                      <Input id="filterAnoElimPrevistoExato" name="anoElimPrevistoExato" type="number" value={filters.anoElimPrevistoExato} onChange={handleFilterInputChange} placeholder="AAAA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterAnoElimPrevistoAte">Ano Elim. Previsto (Até)</Label>
                      <Input id="filterAnoElimPrevistoAte" name="anoElimPrevistoAte" type="number" value={filters.anoElimPrevistoAte} onChange={handleFilterInputChange} placeholder="AAAA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterCodigoCaixa">Código da Caixa</Label>
                      <Input id="filterCodigoCaixa" name="codigoCaixa" value={filters.codigoCaixa} onChange={handleFilterInputChange} placeholder="Contém..." disabled={!!codigoCaixaFromUrl} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterGeneroDocumental">Gênero Documental</Label>
                      <Select onValueChange={handleFilterSelectChange('generoDocumental')} value={filters.generoDocumental}>
                        <SelectTrigger id="filterGeneroDocumental"><SelectValue placeholder="Todos os gêneros" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todos os gêneros</SelectItem>
                          {generosDocumentais.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterCategoriaDocumento">Categoria Documento</Label>
                      <Select onValueChange={handleFilterSelectChange('categoriaDocumento')} value={filters.categoriaDocumento}>
                        <SelectTrigger id="filterCategoriaDocumento"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todas as categorias</SelectItem>
                          <SelectItem value="Documento">Documento</SelectItem>
                          <SelectItem value="Dossiê">Dossiê</SelectItem>
                          <SelectItem value="Processo Judicial">Processo Judicial</SelectItem>
                          <SelectItem value="Processo Administrativo">Processo Administrativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterTipoDocumento">Espécie de Documento</Label>
                      <Input id="filterTipoDocumento" name="tipoDocumento" value={filters.tipoDocumento} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterPessoasReferidas">Pessoas Referidas</Label>
                      <Input id="filterPessoasReferidas" name="pessoasReferidas" value={filters.pessoasReferidas} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterCodigoAtoM">Código AtoM</Label>
                      <Input id="filterCodigoAtoM" name="codigoAtoM" value={filters.codigoAtoM} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterSegredoJustica">Segredo de Justiça</Label>
                      <Select onValueChange={handleFilterSelectChange('segredoJustica')} value={filters.segredoJustica}>
                        <SelectTrigger id="filterSegredoJustica"><SelectValue placeholder="Ambos" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Ambos</SelectItem>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterGrauSigilo">Grau de Sigilo LAI</Label>
                      <Select onValueChange={handleFilterSelectChange('grauSigilo')} value={filters.grauSigilo}>
                        <SelectTrigger id="filterGrauSigilo"><SelectValue placeholder="Todos os graus" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todos os graus</SelectItem>
                          <SelectItem value="Ostensivo">Ostensivo</SelectItem>
                          <SelectItem value="Reservado">Reservado</SelectItem>
                          <SelectItem value="Secreto">Secreto</SelectItem>
                          <SelectItem value="Ultrassecreto">Ultrassecreto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterDigitalizado">Digitalizado</Label>
                      <Select onValueChange={handleFilterSelectChange('digitalizado')} value={filters.digitalizado}>
                        <SelectTrigger id="filterDigitalizado"><SelectValue placeholder="Todos" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_VALUES_SENTINEL}>Todos</SelectItem>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterAnoLimiteDocumento">Documentos Até o Ano (Arq.)</Label>
                      <Input id="filterAnoLimiteDocumento" name="anoLimiteDocumento" type="number" value={filters.anoLimiteDocumento} onChange={handleFilterInputChange} placeholder="AAAA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterPrazoCorrente">Prazo Arquivo Corrente</Label>
                      <Input id="filterPrazoCorrente" name="prazoCorrente" value={filters.prazoCorrente} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterPrazoIntermediario">Prazo Arquivo Intermediário</Label>
                      <Input id="filterPrazoIntermediario" name="prazoIntermediario" value={filters.prazoIntermediario} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterNumeroListagemEliminacao">Nº Listagem Eliminação</Label>
                      <Input id="filterNumeroListagemEliminacao" name="numeroListagemEliminacao" value={filters.numeroListagemEliminacao} onChange={handleFilterInputChange} placeholder="Contém..." />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 px-6 pb-6">
                    <Button variant="outline" onClick={clearFilters}><RotateCcw className="mr-2 h-4 w-4" /> Limpar Filtros</Button>
                    <Button onClick={applyFiltersAndSorting}><Search className="mr-2 h-4 w-4" /> Aplicar Filtros</Button>
                  </CardFooter>
                </AccordionContent>
              </AccordionItem>
            </Accordion>


            <Card className="mt-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-primary">
                    {pageTitle}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-muted-foreground">
                    {filtersAreActive || codigoCaixaFromUrl || isFilteredByListagem || isFilteredByReport
                      ? `Exibindo ${displayedDocumentos.length} de ${processedDocumentos.length} documento(s) com base nos filtros e parâmetros aplicados.`
                      : `Exibindo todos os ${processedDocumentos.length} documento(s) do acervo.`}
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
                        <TableHead className="py-2 px-3 w-12">
                          <Checkbox
                            checked={
                              numDisp > 0 && numSel === numDisp
                                ? true
                                : numSel > 0 ? 'indeterminate' : false
                            }
                            onCheckedChange={(value) => {
                              if (value === true) {
                                setSelectedRowIds(displayedDocumentos.map(doc => doc.id));
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
                      {displayedDocumentos.map((doc) => (
                        <TableRow key={doc.id} data-state={selectedRowIds.includes(doc.id) ? "selected" : ""}>
                          <TableCell className="py-2 px-3">
                            <Checkbox
                              checked={selectedRowIds.includes(doc.id)}
                              onCheckedChange={(value) => {
                                setSelectedRowIds(prev =>
                                  value ? [...prev, doc.id] : prev.filter(id => id !== doc.id)
                                );
                              }}
                              aria-label={`Selecionar documento ${doc.numeroDocumento || doc.id}`}
                            />
                          </TableCell>
                          {ALL_COLUMNS_CONFIG.map((column) =>
                            columnVisibility[column.id as string] ? (
                              <TableCell key={`${doc.id}-${column.id as string}`} className="py-2 px-3">
                                {getCellValue(doc, column)}
                              </TableCell>
                            ) : null
                          )}
                          <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                            <div className="flex items-center justify-end">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Editar Documento" onClick={() => handleOpenDialog(doc)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>{doc.status === 'Eliminado' ? 'Visualizar Documento' : 'Editar Documento'}</p></TooltipContent>
                                </Tooltip>
                                <AlertDialog>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Documento" disabled={doc.status === 'Eliminado' || !permissions.exclusaoDados}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent><p>{doc.status === 'Eliminado' ? 'Não pode ser excluído' : (permissions.exclusaoDados ? 'Excluir Documento' : 'Permissão necessária')}</p></TooltipContent>
                                    </Tooltip>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento "{doc.numeroDocumento || doc.id}".
                                          </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(doc.id)}>Sim, excluir</AlertDialogAction>
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
                {displayedDocumentos.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    {isFilteredByListagem ? `Nenhum documento encontrado na listagem de eliminação.` : (codigoCaixaFromUrl ? `Nenhum documento encontrado na caixa ${codigoCaixaFromUrl} para os filtros aplicados.` : "Nenhum documento encontrado para os filtros e ordenação aplicados.")}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        <Dialog open={isRelatedDocDialogOpen} onOpenChange={setIsRelatedDocDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecionar Documento Relacionado</DialogTitle>
                    <DialogDescription>
                        Busque e selecione um documento existente para relacionar.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        placeholder="Buscar por ID, número, ou descrição..."
                        value={relatedDocSearchTerm}
                        onChange={(e) => setRelatedDocSearchTerm(e.target.value)}
                    />
                    <ScrollArea className="h-72 mt-4 border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documentos
                                    .filter(doc => {
                                        const searchTerm = relatedDocSearchTerm.toLowerCase();
                                        if (doc.id === documentIdToDisplay) return false;
                                        if (!searchTerm) return true;
                                        return (
                                            doc.id.toLowerCase().includes(searchTerm) ||
                                            doc.numeroDocumento?.toLowerCase().includes(searchTerm) ||
                                            doc.descricaoDocumento?.toLowerCase().includes(searchTerm)
                                        );
                                    })
                                    .map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell>{doc.id}</TableCell>
                                        <TableCell>{doc.numeroDocumento}</TableCell>
                                        <TableCell className="max-w-xs truncate">{doc.descricaoDocumento}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddRelatedDoc(doc.id)}
                                                disabled={formState.documentosRelacionadosIds?.split(',').map(s=>s.trim()).includes(doc.id)}
                                            >
                                                Adicionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRelatedDocDialogOpen(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isParteDialogOpen} onOpenChange={setIsParteDialogOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                <DialogTitle>{isEditingParte ? 'Editar Parte' : 'Adicionar Nova Parte'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parte-nome" className="text-right">Nome*</Label>
                    <Input id="parte-nome" value={parteFormState.nome} onChange={e => setParteFormState(p => ({...p, nome: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parte-cpf" className="text-right">CPF/CNPJ</Label>
                    <Input id="parte-cpf" value={parteFormState.cpfCnpj || ''} onChange={e => setParteFormState(p => ({...p, cpfCnpj: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parte-tipo" className="text-right">Tipo</Label>
                    <Select onValueChange={(value) => setParteFormState(p => ({...p, tipoParte: value}))} value={parteFormState.tipoParte}>
                        <SelectTrigger className="col-span-3" id="parte-tipo">
                            <SelectValue placeholder="Selecione o tipo de parte" />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposParte.sort().map(tipo => (
                                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                </div>
                <DialogFooter>
                <Button variant="outline" onClick={() => setIsParteDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveParte}>Salvar Parte</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
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
                Selecione o campo e o novo valor para aplicar a todos os {selectedRowIds.length} documentos selecionados.
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
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente {selectedRowIds.length} documento(s) selecionado(s). Documentos com status "Eliminado" não serão afetados.
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
