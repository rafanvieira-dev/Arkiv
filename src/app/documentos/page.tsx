
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Documento, ListagemEliminacao, Solicitacao, Classificacao } from "@/types";
import { 
  PlusCircle, Edit, Trash2, Search, RotateCcw, FilterIcon, 
  ChevronDown, ChevronUp, ArrowUpDown, ColumnsIcon, ArrowUp, ArrowDown,
  CheckSquare, Square
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
import { placeholderDocumentos, simulatedListagensData, placeholderSolicitacoesInitial, placeholderClassificacoesSimulado } from "@/lib/mock-data";


const initialFormState: Partial<Documento> & { codigoClassificacaoArquivisticaInput?: string; assuntoClassificacaoDisplay?: string } = {
  status: "Arquivado",
  orgao: "TRF2",
  origem: "",
  tipoMeio: "Não digital",
  generoDocumental: "Textual",
  categoria: "Documento",
  tipoDocumento: "",
  numeroDocumento: "",
  dataAbrangente: "",
  dataArquivamento: undefined,
  quantidadeVolumes: undefined,
  quantidadeApensos: undefined,
  numerosApensos: "",
  totalMidias: undefined,
  tipoMidiaDetalhe: undefined,
  outroTipoMidiaDetalhe: "",
  numeroMidiaDetalhe: "",
  paginaMidiaDetalhe: "",
  digitalizado: "Não",
  tipoBaixa: "",
  dataBaixa: undefined,
  descricaoDocumento: "",
  codigoClassificacaoArquivisticaInput: "",
  classificacaoArquivisticaId: "",
  assuntoClassificacaoDisplay: "",
  prazoArquivoCorrenteDisplay: "",
  prazoArquivoIntermediarioDisplay: "",
  destinacaoFinalDisplay: undefined,
  alteracaoDestinacaoFinal: "Não Alterar",
  anoEliminacaoPrevisto: "", 
  nomePartePrincipal: "",
  tipoPartePrincipal: "",
  outroTipoPartePrincipal: "",
  segredoJustica: "Não",
  grauSigilo: "Ostensivo",
  codigosCaixa: "",
  codigoAtoM: "",
  documentosRelacionadosIds: "",
  observacoesGerais: "",
  codigoClassificacaoJudicialId: "",
  numeroListagemEliminacao: "",
};

const tiposParteOpcoes = ["Autor", "Réu", "Magistrado", "Advogado", "Procurador", "Acusado", "Acusador", "Agravado", "Agravante", "Apelado", "Apelante", "Assistente do Réu", "Coator", "Curador", "Declarante", "Depositante", "Depositário", "Depositário Público", "Deprecado", "Deprecante", "Depreciado", "Embargado", "Embargante", "Espólio", "Executado", "Executante", "Exequado", "Exequente", "Falecido", "Impetrado", "Impetrante", "Impugnado", "Impugnante", "Indiciado", "Inventariado", "Inventariante", "Justificante", "Liquidado", "Liquidante", "Litisconsorte", "Notificado", "Notificante", "Paciente", "Requerente", "Requerido", "Requisitado", "Responsável", "Rogado", "Rogante", "Suplicado", "Suplicante", "Testemunhante", "Vítima", "Outro"];

const initialFiltersState = {
  status: "",
  origemDocumento: "",
  numeroDocumento: "",
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

export default function DocumentosPage() {
  const searchParams = useSearchParams();
  const codigoCaixaFromUrl = searchParams.get('codigoCaixa');
  const listagemDocIdsParam = searchParams.get('listagemDocIds');
  const numeroListagemFromQuery = searchParams.get('numeroListagem');
  const editDocIdFromUrl = searchParams.get('edit');
  const isFilteredByListagem = !!listagemDocIdsParam;

  const [documentos, setDocumentos] = React.useState<Documento[]>([]);
  const [processedDocumentos, setProcessedDocumentos] = React.useState<Documento[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<Documento> & { codigoClassificacaoArquivisticaInput?: string; assuntoClassificacaoDisplay?: string }>(initialFormState);
  const [documentIdToDisplay, setDocumentIdToDisplay] = React.useState("(Automático após salvar)");

  const [outroGeneroDocumental, setOutroGeneroDocumental] = React.useState("");
  const [outroTipoMidia, setOutroTipoMidia] = React.useState("");
  const [outroTipoParte, setOutroTipoParte] = React.useState("");
  
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

  const resetForm = React.useCallback(() => {
    setFormState(initialFormState);
    setDocumentIdToDisplay("(Automático após salvar)");
    setOutroGeneroDocumental("");
    setOutroTipoMidia("");
    setOutroTipoParte("");
    setIsFormDisabled(false);
  }, []);

  const handleOpenDialog = React.useCallback((doc?: Documento) => {
    if (doc) {
      const existingClassification = classificacoes.find(c => c.id === doc.classificacaoArquivisticaId);
      setFormState({
        ...initialFormState, 
        ...doc,
        codigoClassificacaoArquivisticaInput: existingClassification ? existingClassification.codigo : "",
        assuntoClassificacaoDisplay: existingClassification ? (existingClassification.inativo ? `${existingClassification.descricao} (INATIVO)`: existingClassification.descricao) : "Não encontrado",
        classificacaoArquivisticaId: doc.classificacaoArquivisticaId || "", 
        dataArquivamento: doc.dataArquivamento ? doc.dataArquivamento : undefined,
        dataBaixa: doc.dataBaixa ? doc.dataBaixa : undefined,
        quantidadeVolumes: doc.quantidadeVolumes ?? undefined,
        quantidadeApensos: doc.quantidadeApensos ?? undefined,
        totalMidias: doc.totalMidias ?? undefined,
      });
      setDocumentIdToDisplay(doc.id);
      setOutroGeneroDocumental(doc.generoDocumental && !['Textual', 'Iconográfico', 'Cartográfico', 'Sonoro', 'Filmográfico', 'Audiovisual'].includes(doc.generoDocumental) ? doc.generoDocumental : "");
      setOutroTipoMidia(doc.tipoMidiaDetalhe && !['CD-R', 'CD-RW', 'DVD-R', 'DVD-RW', 'Disquete', 'Pen Drive', 'HD'].includes(doc.tipoMidiaDetalhe) ? doc.tipoMidiaDetalhe : "");
      setOutroTipoParte(doc.tipoPartePrincipal && !tiposParteOpcoes.slice(0,-1).includes(doc.tipoPartePrincipal) ? doc.tipoPartePrincipal : "");
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
    { id: 'tipoDocumento', header: 'Tipo Documento', accessorKey: 'tipoDocumento', defaultVisible: true, enableSorting: true },
    { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento', defaultVisible: true, enableSorting: true },
    { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente', defaultVisible: true, enableSorting: true },
    { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
    { id: 'nomePartePrincipal', header: 'Nome das Partes', accessorKey: 'nomePartePrincipal', defaultVisible: true, enableSorting: true },
    { id: 'documentosRelacionadosIds', header: 'Docs Relac. (Qtd)', accessorKey: 'documentosRelacionadosIds', defaultVisible: true, enableSorting: false, cellFormatter: (value) => (value ? String(value).split(',').length : 0) },
    { id: 'dataArquivamento', header: 'Data Arquivamento', accessorKey: 'dataArquivamento', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'quantidadeVolumes', header: 'Qtd. Volumes', accessorKey: 'quantidadeVolumes', defaultVisible: true, enableSorting: true },
    { id: 'quantidadeApensos', header: 'Qtd. Apensos', accessorKey: 'quantidadeApensos', defaultVisible: true, enableSorting: true },
    { id: 'numerosApensos', header: 'Nº Apensos', accessorKey: 'numerosApensos', defaultVisible: true, enableSorting: true },
    { id: 'totalMidias', header: 'Total Mídias', accessorKey: 'totalMidias', defaultVisible: true, enableSorting: true },
    { id: 'tipoMidiaDetalhe', header: 'Tipo Mídia', accessorKey: 'tipoMidiaDetalhe', defaultVisible: true, enableSorting: true, cellFormatter: (value, doc) => doc.tipoMidiaDetalhe === 'Outro' ? doc.outroTipoMidiaDetalhe : doc.tipoMidiaDetalhe },
    { id: 'numeroMidiaDetalhe', header: 'Nº Mídia', accessorKey: 'numeroMidiaDetalhe', defaultVisible: true, enableSorting: true },
    { id: 'paginaMidiaDetalhe', header: 'Página Mídia', accessorKey: 'paginaMidiaDetalhe', defaultVisible: true, enableSorting: true },
    { id: 'digitalizado', header: 'Digitalizado', accessorKey: 'digitalizado', defaultVisible: true, enableSorting: true },
    { id: 'tipoBaixa', header: 'Tipo Baixa', accessorKey: 'tipoBaixa', defaultVisible: true, enableSorting: true },
    { id: 'dataBaixa', header: 'Data Baixa', accessorKey: 'dataBaixa', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'codigoClassificacaoJudicialId', header: 'Cód. Class. Judicial', accessorKey: 'codigoClassificacaoJudicialId', defaultVisible: true, enableSorting: true },
    { id: 'classificacaoArquivisticaId', header: 'Classificação', accessorKey: 'classificacaoArquivisticaId', defaultVisible: true, enableSorting: true, cellFormatter: (value) => {
        const classif = classificacoes.find(c => c.id === value);
        return classif ? `${classif.codigo} - ${classif.descricao}` : value || 'N/A';
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
      setClassificacoes(storedClassificacoes ? JSON.parse(storedClassificacoes) : placeholderClassificacoesSimulado);
      
      const storedListagens = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
      setListagens(storedListagens ? JSON.parse(storedListagens) : simulatedListagensData);

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setDocumentos(placeholderDocumentos);
      setSolicitacoes(placeholderSolicitacoesInitial);
      setClassificacoes(placeholderClassificacoesSimulado);
      setListagens(simulatedListagensData);
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
    }
  }, [documentos, classificacoes, listagens, solicitacoes, isDataLoaded]);

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
       if (classification.inativo) {
         setFormState(prev => ({
          ...prev,
          assuntoClassificacaoDisplay: `${classification.descricao} (INATIVO)`,
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
       setFormState(prev => ({
        ...prev,
        assuntoClassificacaoDisplay: "",
        prazoArquivoCorrenteDisplay: "",
        prazoArquivoIntermediarioDisplay: "",
        destinacaoFinalDisplay: undefined,
        anoEliminacaoPrevisto: ""
      }));
    }
  }, [formState.classificacaoArquivisticaId, formState.dataArquivamento, formState.alteracaoDestinacaoFinal, classificacoes]);


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
    if (id === 'generoDocumental' && value !== 'Outro') setOutroGeneroDocumental("");
    if (id === 'tipoMidiaDetalhe' && value !== 'Outro') setOutroTipoMidia("");
    if (id === 'tipoPartePrincipal' && value !== 'Outro') setOutroTipoParte("");
  };

  const handleDateChange = (id: keyof Partial<Documento>) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));
  };

  const handleCodigoClassificacaoBlur = () => {
    const codigoInput = formState.codigoClassificacaoArquivisticaInput?.trim();
    if (codigoInput) {
      const foundClassification = classificacoes.find(
        c => c.codigo === codigoInput && !c.inativo
      );
      if (foundClassification) {
        setFormState(prev => ({
          ...prev,
          classificacaoArquivisticaId: foundClassification.id,
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          classificacaoArquivisticaId: "",
          assuntoClassificacaoDisplay: "Código não encontrado ou inativo.",
        }));
      }
    } else {
      setFormState(prev => ({
        ...prev,
        classificacaoArquivisticaId: "",
        assuntoClassificacaoDisplay: "",
      }));
    }
  };
  
  const handleSaveChanges = () => {
    const finalFormState: Documento = {
      ...initialFormState, 
      ...formState, 
      id: documentIdToDisplay === "(Automático após salvar)" ? `DOC${Date.now()}` : documentIdToDisplay,
      dataCadastro: formState.dataCadastro || new Date().toISOString(),
      generoDocumental: formState.generoDocumental === 'Outro' ? outroGeneroDocumental : formState.generoDocumental!,
      tipoMidiaDetalhe: formState.tipoMidiaDetalhe === 'Outro' ? outroTipoMidia : formState.tipoMidiaDetalhe,
      tipoPartePrincipal: formState.tipoPartePrincipal === 'Outro' ? outroTipoParte : formState.tipoPartePrincipal,
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
    
    setDocumentos(prevDocs => {
      const docIndex = prevDocs.findIndex(d => d.id === finalFormState.id);
      if (docIndex > -1) {
        const updatedDocs = [...prevDocs];
        updatedDocs[docIndex] = finalFormState;
        return updatedDocs;
      } else {
        return [...prevDocs, finalFormState];
      }
    });
    setSelectedRowIds([]); 
    setIsDialogOpen(false);
  };

  const handleDelete = (docId: string) => {
    setDocumentos(prev => prev.filter(d => d.id !== docId));
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

    let newFilteredDocumentos = processedDocumentos.filter(doc => {
      let passesAll = true;

      if (codigoCaixaFromUrl) {
        if (!doc.codigosCaixa || !doc.codigosCaixa.split(',').map(c => c.trim()).includes(codigoCaixaFromUrl)) {
          passesAll = false;
        }
      }
      if (!passesAll) return false;

      if (currentListagemDocIdsParam) {
        if (docIdsFromListagem.length > 0) {
          if (!docIdsFromListagem.includes(doc.id)) {
            passesAll = false;
          }
        } else {
          passesAll = false; 
        }
      }
      if (!passesAll) return false;

      if (filters.status && doc.status !== filters.status) passesAll = false;
      if (filters.origemDocumento && doc.origem && !doc.origem.toLowerCase().includes(filters.origemDocumento.toLowerCase())) passesAll = false;
      if (filters.numeroDocumento && doc.numeroDocumento && !doc.numeroDocumento.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) passesAll = false;
      if (filters.descricao && doc.descricaoDocumento && !doc.descricaoDocumento.toLowerCase().includes(filters.descricao.toLowerCase())) passesAll = false;
      
      if (filters.codClassificacao && doc.classificacaoArquivisticaId) {
        const classificacao = classificacoes.find(c => c.id === doc.classificacaoArquivisticaId);
        if (!classificacao || (classificacao.codigo && !classificacao.codigo.toLowerCase().includes(filters.codClassificacao.toLowerCase()))) {
          passesAll = false;
        }
      } else if (filters.codClassificacao && !doc.classificacaoArquivisticaId) {
        passesAll = false;
      }

      if (filters.destinacaoFinal) {
        let effectiveDestination = doc.destinacaoFinalDisplay;
        if (doc.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" || doc.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
          effectiveDestination = "Guarda Permanente";
        }
        if (effectiveDestination !== filters.destinacaoFinal) passesAll = false;
      }

      if (filters.anoProducao) {
        const anoProducaoDoc = parseDataAbrangenteForYear(doc.dataAbrangente);
        if (!anoProducaoDoc || anoProducaoDoc !== filters.anoProducao) passesAll = false;
      }
      if (filters.anoArquivamento && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
        const docYear = getYear(parseISO(doc.dataArquivamento)).toString();
        if (docYear !== filters.anoArquivamento) passesAll = false;
      }
      if (filters.anoElimPrevistoExato && doc.anoEliminacaoPrevisto && doc.anoEliminacaoPrevisto !== filters.anoElimPrevistoExato) passesAll = false;
      if (filters.anoElimPrevistoAte && doc.anoEliminacaoPrevisto && parseInt(doc.anoEliminacaoPrevisto, 10) > parseInt(filters.anoElimPrevistoAte, 10)) passesAll = false;
      
      if (!codigoCaixaFromUrl && filters.codigoCaixa && doc.codigosCaixa && !doc.codigosCaixa.toLowerCase().includes(filters.codigoCaixa.toLowerCase())) passesAll = false;
      

      if (filters.generoDocumental && doc.generoDocumental !== filters.generoDocumental) passesAll = false;
      if (filters.categoriaDocumento && doc.categoria !== filters.categoriaDocumento) passesAll = false;
      if (filters.tipoDocumento && doc.tipoDocumento && !doc.tipoDocumento.toLowerCase().includes(filters.tipoDocumento.toLowerCase())) passesAll = false; 
      if (filters.pessoasReferidas && doc.nomePartePrincipal && !doc.nomePartePrincipal.toLowerCase().includes(filters.pessoasReferidas.toLowerCase())) passesAll = false;
      if (filters.codigoAtoM && doc.codigoAtoM && !doc.codigoAtoM.toLowerCase().includes(filters.codigoAtoM.toLowerCase())) passesAll = false;
      if (filters.segredoJustica && doc.segredoJustica !== filters.segredoJustica) passesAll = false;
      if (filters.grauSigilo && doc.grauSigilo !== filters.grauSigilo) passesAll = false;
      if (filters.digitalizado && doc.digitalizado !== filters.digitalizado) passesAll = false;
      
      if (filters.anoLimiteDocumento && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
        const docYear = getYear(parseISO(doc.dataArquivamento));
        if (docYear > parseInt(filters.anoLimiteDocumento, 10)) passesAll = false;
      }
      if (filters.prazoCorrente && doc.prazoArquivoCorrenteDisplay && !doc.prazoArquivoCorrenteDisplay.toLowerCase().includes(filters.prazoCorrente.toLowerCase())) passesAll = false;
      if (filters.prazoIntermediario && doc.prazoArquivoIntermediarioDisplay && !doc.prazoArquivoIntermediarioDisplay.toLowerCase().includes(filters.prazoIntermediario.toLowerCase())) passesAll = false;
      if (filters.numeroListagemEliminacao && doc.numeroListagemEliminacao && !doc.numeroListagemEliminacao.toLowerCase().includes(filters.numeroListagemEliminacao.toLowerCase())) passesAll = false;
      else if (filters.numeroListagemEliminacao && !doc.numeroListagemEliminacao) passesAll = false;


      return passesAll;
    });

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

  const numDisp = displayedDocumentos.length;
  const numSel = selectedRowIds.length;

  let pageTitle = "Gerenciamento do Acervo";
  let pageDescription = "Cadastre e gerencie as descrições dos documentos do acervo.";

  if (isFilteredByListagem) {
    pageTitle = numeroListagemFromQuery
      ? `Documentos da Listagem de Eliminação nº ${numeroListagemFromQuery}`
      : "Documentos da Listagem de Eliminação";
    pageDescription = "Documentos incluídos na listagem de eliminação selecionada.";
  } else if (codigoCaixaFromUrl) {
    pageTitle = `Documentos na Caixa: ${codigoCaixaFromUrl}`;
    pageDescription = `Documentos pertencentes à caixa ${codigoCaixaFromUrl}.`;
  }


  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader 
        title={pageTitle}
        description={pageDescription}
      >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3 py-4">
              
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
                <Label htmlFor="origem">Origem</Label>
                <Input id="origem" value={formState.origem || ""} onChange={handleInputChange} placeholder="Ex: Tribunal de Justiça" disabled={isFormDisabled} />
              </div>
              
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
                <Label htmlFor="generoDocumental">Gênero Documental*</Label>
                <Select onValueChange={handleSelectChange('generoDocumental')} value={formState.generoDocumental} disabled={isFormDisabled}>
                  <SelectTrigger id="generoDocumental"><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Textual">Textual</SelectItem>
                    <SelectItem value="Iconográfico">Iconográfico</SelectItem>
                    <SelectItem value="Cartográfico">Cartográfico</SelectItem>
                    <SelectItem value="Sonoro">Sonoro</SelectItem>
                    <SelectItem value="Filmográfico">Filmográfico</SelectItem>
                    <SelectItem value="Audiovisual">Audiovisual</SelectItem>
                    <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
                {formState.generoDocumental === 'Outro' && (
                  <Input id="outroGeneroDocumentalInput" value={outroGeneroDocumental} onChange={(e) => setOutroGeneroDocumental(e.target.value)} placeholder="Especifique o gênero" className="mt-2" disabled={isFormDisabled} />
                )}
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
                <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                <Input id="tipoDocumento" value={formState.tipoDocumento || ""} onChange={handleInputChange} placeholder="Ex: Ação Ordinária" disabled={isFormDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">Número do Documento</Label>
                <Input id="numeroDocumento" value={formState.numeroDocumento || ""} onChange={handleInputChange} placeholder="Ex: 123/2024 ou PRC-001/2024" disabled={isFormDisabled} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataAbrangente">Data Abrangente do Documento</Label>
                <Input id="dataAbrangente" value={formState.dataAbrangente || ""} onChange={handleInputChange} placeholder="Ex: 01/2023 – 12/2024 ou 15/01/2023" disabled={isFormDisabled} />
              </div>

              <div className="space-y-2 sm:col-span-2 xl:col-span-3">
                <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
                <Textarea id="descricaoDocumento" value={formState.descricaoDocumento || ""} onChange={handleInputChange} placeholder="Detalhes sobre o conteúdo do documento" disabled={isFormDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomePartePrincipal">Nome da Parte Principal</Label>
                <Input id="nomePartePrincipal" value={formState.nomePartePrincipal || ""} onChange={handleInputChange} placeholder="Nome da parte" disabled={isFormDisabled} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoPartePrincipal">Tipo da Parte Principal</Label>
                <Select onValueChange={handleSelectChange('tipoPartePrincipal')} value={formState.tipoPartePrincipal} disabled={isFormDisabled}>
                  <SelectTrigger id="tipoPartePrincipal"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    {tiposParteOpcoes.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formState.tipoPartePrincipal === 'Outro' && (
                  <Input id="outroTipoPartePrincipalInput" value={outroTipoParte} onChange={(e) => setOutroTipoParte(e.target.value)} placeholder="Especifique o tipo de parte" className="mt-2" disabled={isFormDisabled} />
                )}
              </div>
               <div className="space-y-2">
                <Label htmlFor="documentosRelacionadosIds">Documentos Relacionados (IDs)</Label>
                <Input id="documentosRelacionadosIds" value={formState.documentosRelacionadosIds || ""} onChange={handleInputChange} placeholder="IDs separados por vírgula" disabled={isFormDisabled} />
              </div>


              <div className="space-y-2">
                <Label htmlFor="dataArquivamento">Data de Arquivamento</Label>
                 <DateInputPicker 
                  value={formState.dataArquivamento ? parseISO(formState.dataArquivamento) : undefined} 
                  onChange={(date) => handleDateChange('dataArquivamento')(date)} 
                  placeholder="dd/mm/aaaa"
                  disabled={isFormDisabled}
                />
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
                        <SelectItem value="CD-R">CD-R</SelectItem>
                        <SelectItem value="CD-RW">CD-RW</SelectItem>
                        <SelectItem value="DVD-R">DVD-R</SelectItem>
                        <SelectItem value="DVD-RW">DVD-RW</SelectItem>
                        <SelectItem value="Disquete">Disquete</SelectItem>
                        <SelectItem value="Pen Drive">Pen Drive</SelectItem>
                        <SelectItem value="HD">HD Externo</SelectItem>
                        <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formState.tipoMidiaDetalhe === 'Outro' && (
                      <Input id="outroTipoMidiaInput" value={outroTipoMidia} onChange={(e) => setOutroTipoMidia(e.target.value)} placeholder="Especifique o tipo de mídia" className="mt-2" disabled={isFormDisabled} />
                    )}
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
                <Label htmlFor="digitalizado">Digitalizado?*</Label>
                <Select onValueChange={handleSelectChange('digitalizado')} value={formState.digitalizado} disabled={isFormDisabled}>
                  <SelectTrigger id="digitalizado"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <div className="space-y-2">
                <Label htmlFor="codigoClassificacaoArquivisticaInput">Código de Classificação Arquivística</Label>
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
                <Input id="assuntoClassificacaoDisplay" value={formState.assuntoClassificacaoDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
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
                <Label htmlFor="alteracaoDestinacaoFinal">Alteração de Destinação Final*</Label>
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
                <Label htmlFor="codigosCaixa">Código(s) da(s) Caixa(s)</Label>
                <Input id="codigosCaixa" value={formState.codigosCaixa || ""} onChange={handleInputChange} placeholder="Ex: CX-A-001, CX-B-002" disabled={isFormDisabled} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoAtoM">Código do AtoM</Label>
                <Input id="codigoAtoM" value={formState.codigoAtoM || ""} onChange={handleInputChange} placeholder="Código do AtoM (se aplicável)" disabled={isFormDisabled} />
              </div>
              
              <div className="space-y-2 sm:col-span-2 xl:col-span-3">
                <Label htmlFor="observacoesGerais">Observações Gerais</Label>
                <Textarea id="observacoesGerais" value={formState.observacoesGerais || ""} onChange={handleInputChange} placeholder="Outras informações relevantes sobre o documento" disabled={isFormDisabled} />
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
                    <SelectItem value="Textual">Textual</SelectItem>
                    <SelectItem value="Iconográfico">Iconográfico</SelectItem>
                    <SelectItem value="Cartográfico">Cartográfico</SelectItem>
                    <SelectItem value="Sonoro">Sonoro</SelectItem>
                    <SelectItem value="Filmográfico">Filmográfico</SelectItem>
                    <SelectItem value="Audiovisual">Audiovisual</SelectItem>
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
                <Label htmlFor="filterTipoDocumento">Tipo de Documento</Label>
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
          <CardTitle className="font-headline text-primary">
            {pageTitle}
          </CardTitle>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Documento" onClick={() => handleDelete(doc.id)} disabled={doc.status === 'Eliminado'}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Excluir Documento</p></TooltipContent>
                          </Tooltip>
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
    </div>
    </TooltipProvider>
  );
}
