
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Documento } from "@/types";
import { 
  PlusCircle, Edit, Trash2, Search, RotateCcw, FilterIcon, 
  ChevronDown, ChevronUp, ArrowUpDown, ColumnsIcon, ArrowUp, ArrowDown,
  CheckSquare, Square, Check, ChevronsUpDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { DatePicker } from "@/components/date-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


const placeholderClassificacoesSimulado = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis", inativo: false, prazoGuardaFaseIntermediariaAnos: 15, destinacaoFinal: 'Guarda Permanente' as const, tipoPrazoFaseCorrente: "Anos" as const, prazoGuardaFaseCorrenteAnos: 5 },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas", inativo: true, prazoGuardaFaseIntermediariaAnos: 3, destinacaoFinal: 'Eliminação' as const, tipoPrazoFaseCorrente: "Condição Textual" as const, prazoGuardaFaseCorrenteCondicaoTextual: "Até a próxima atualização" },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais", inativo: false, prazoGuardaFaseIntermediariaAnos: 0, destinacaoFinal: 'Guarda Permanente' as const, tipoPrazoFaseCorrente: "Anos" as const, prazoGuardaFaseCorrenteAnos: 1 },
];

const placeholderDocumentos: Documento[] = [
  { 
    id: "DOC001", 
    status: "Arquivado", 
    orgao: "TRF2", 
    origem: "Tribunal de Justiça", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Ação Ordinária", 
    numeroDocumento: "PRC-2023-001", 
    dataAbrangente: "01/2023 - 03/2023",
    descricaoDocumento: "Processo referente à disputa contratual X. Este é um exemplo de descrição um pouco mais longa para testar o comportamento da célula na tabela.",
    nomePartePrincipal: "Empresa Exemplo Ltda",
    documentosRelacionadosIds: "DOC002,DOC003",
    dataArquivamento: new Date("2023-01-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 0,
    tipoMidiaDetalhe: undefined,
    outroTipoMidiaDetalhe: "",
    numeroMidiaDetalhe: "",
    paginaMidiaDetalhe: "",
    digitalizado: "Não", 
    tipoBaixa: "",
    dataBaixa: undefined,
    classificacaoArquivisticaId: "CLA001",
    historicoClassificacoesArquivisticas: ["020.1 - Processos Judiciais Cíveis"],
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2039", 
    tipoPartePrincipal: "Autor",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX001", 
    codigoAtoM: "ATOM001",
    observacoesGerais: "Nenhuma observação específica para este documento de exemplo.",
    codigoClassificacaoJudicialId: "CJ001",
    dataCadastro: new Date("2023-01-01T10:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA001")?.inativo,
  },
  { 
    id: "DOC002", 
    status: "Emprestado", 
    orgao: "SJRJ", 
    origem: "Secretaria Municipal", 
    tipoMeio: "Digital", 
    generoDocumental: "Audiovisual", 
    categoria: "Documento", 
    tipoDocumento: "Solicitação de Informações", 
    numeroDocumento: "OFC-2023-045", 
    dataAbrangente: "20/03/2023",
    descricaoDocumento: "Ofício solicitando informações sobre o projeto Y.",
    nomePartePrincipal: "Maria Santos",
    documentosRelacionadosIds: "DOC001",
    dataArquivamento: new Date("2023-03-20").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 1,
    numerosApensos: "AP001",
    totalMidias: 1,
    tipoMidiaDetalhe: "DVD-R",
    outroTipoMidiaDetalhe: "",
    numeroMidiaDetalhe: "M001",
    paginaMidiaDetalhe: "1-10",
    digitalizado: "Sim", 
    tipoBaixa: "Devolvido ao Arquivo",
    dataBaixa: new Date("2023-04-10").toISOString(),
    classificacaoArquivisticaId: "CLA002", 
    historicoClassificacoesArquivisticas: ["030.5 - Correspondências Recebidas"],
    prazoArquivoCorrenteDisplay: "Até a próxima atualização",
    prazoArquivoIntermediarioDisplay: "3 Anos",
    destinacaoFinalDisplay: "Eliminação",
    alteracaoDestinacaoFinal: "Não Alterar",
    anoEliminacaoPrevisto: "2027", 
    tipoPartePrincipal: "Requerente",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX002", 
    codigoAtoM: "ATOM002",
    observacoesGerais: "Prioridade alta.",
    codigoClassificacaoJudicialId: "",
    dataCadastro: new Date("2023-02-15T11:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA002")?.inativo,
  },
  { 
    id: "DOC003", 
    status: "Arquivado", 
    orgao: "SJES", 
    origem: "Câmara de Vereadores", 
    tipoMeio: "Híbrido", 
    generoDocumental: "Textual", 
    categoria: "Processo Administrativo", 
    tipoDocumento: "Comunicação Interna", 
    numeroDocumento: "MEM-2022-112", 
    dataAbrangente: "05/11/2022",
    descricaoDocumento: "Memorando sobre nova política interna.",
    nomePartePrincipal: "João da Silva",
    documentosRelacionadosIds: "",
    dataArquivamento: new Date("2022-11-05").toISOString(), 
    quantidadeVolumes: 2,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 2,
    tipoMidiaDetalhe: "Pen Drive",
    outroTipoMidiaDetalhe: "",
    numeroMidiaDetalhe: "M002, M003",
    paginaMidiaDetalhe: "N/A",
    digitalizado: "Sim", 
    tipoBaixa: "",
    dataBaixa: undefined,
    classificacaoArquivisticaId: "CLA003", 
    historicoClassificacoesArquivisticas: ["045.2 - Relatórios Anuais"],
    prazoArquivoCorrenteDisplay: "1 Ano",
    prazoArquivoIntermediarioDisplay: "0 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "", 
    tipoPartePrincipal: "Interessado",
    outroTipoPartePrincipal: "",
    segredoJustica: "Sim", 
    grauSigilo: "Secreto", 
    codigosCaixa: "CX001, CX003", 
    codigoAtoM: "ATOM003",
    observacoesGerais: "Documento de acesso restrito.",
    codigoClassificacaoJudicialId: "",
    dataCadastro: new Date("2022-12-01T09:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA003")?.inativo,
  },
   { 
    id: "DOC004", 
    status: "Eliminado", 
    orgao: "TRF2", 
    origem: "Advocacia Geral", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Documento", 
    tipoDocumento: "Requerimento", 
    numeroDocumento: "REQ-2014-001", 
    dataAbrangente: "10/06/2014",
    descricaoDocumento: "Requerimento antigo, processo finalizado e eliminado.",
    nomePartePrincipal: "Empresa XYZ",
    documentosRelacionadosIds: "DOC005", 
    dataArquivamento: new Date("2014-06-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 0,
    tipoMidiaDetalhe: undefined,
    outroTipoMidiaDetalhe: "",
    numeroMidiaDetalhe: "",
    paginaMidiaDetalhe: "",
    digitalizado: "Não", 
    tipoBaixa: "Eliminação Concluída",
    dataBaixa: new Date("2018-12-01").toISOString(),
    classificacaoArquivisticaId: "CLA002",
    historicoClassificacoesArquivisticas: ["030.5 - Correspondências Recebidas"], 
    prazoArquivoCorrenteDisplay: "Até a próxima atualização",
    prazoArquivoIntermediarioDisplay: "3 Anos", 
    destinacaoFinalDisplay: "Eliminação",      
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2018", 
    tipoPartePrincipal: "Requerente",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX-TEMP-001", 
    codigoAtoM: "",
    observacoesGerais: "Documento eliminado conforme edital.",
    codigoClassificacaoJudicialId: "",
    dataCadastro: new Date("2014-06-01T10:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA002")?.inativo,
  },
  { 
    id: "DOC005", 
    status: "Aguardando prazo para eliminação", 
    orgao: "SJRJ", 
    origem: "Vara Federal", 
    tipoMeio: "Digital", 
    generoDocumental: "Iconográfico", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Petição", 
    numeroDocumento: "PET-2010-555", 
    dataAbrangente: "15/08/2010",
    descricaoDocumento: "Petição inicial do processo, aguardando prazo para eliminação.",
    nomePartePrincipal: "Consumidor Teste",
    documentosRelacionadosIds: "",
    dataArquivamento: new Date("2010-08-20").toISOString(), 
    quantidadeVolumes: 0,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 1,
    tipoMidiaDetalhe: "Outro",
    outroTipoMidiaDetalhe: "Arquivo Digitalizado",
    numeroMidiaDetalhe: "ARQ001",
    paginaMidiaDetalhe: "1-50",
    digitalizado: "Sim", 
    tipoBaixa: "",
    dataBaixa: undefined,
    classificacaoArquivisticaId: "CLA001", 
    historicoClassificacoesArquivisticas: ["020.1 - Processos Judiciais Cíveis"],
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos", 
    destinacaoFinalDisplay: "Guarda Permanente", 
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2026", 
    tipoPartePrincipal: "Autor",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Reservado", 
    codigosCaixa: "CX-DIG-010", 
    codigoAtoM: "ATOM005",
    observacoesGerais: "Documento sujeito à análise da CPAD.",
    codigoClassificacaoJudicialId: "CJ001",
    dataCadastro: new Date("2010-08-01T14:00:00Z").toISOString(), 
    classificacaoInativa: false,
  },
];

const initialFormState: Partial<Documento> = {
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
  classificacaoArquivisticaId: "",
  historicoClassificacoesArquivisticas: [],
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

const ALL_COLUMNS_CONFIG: ColumnConfig[] = [
  { id: 'id', header: 'ID Interno', accessorKey: 'id', defaultVisible: true, enableSorting: true },
  { id: 'status', header: 'Status', accessorKey: 'status', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <Badge variant={value === 'Arquivado' ? 'secondary' : value === 'Emprestado' ? 'outline' : value === 'Eliminado' ? 'destructive' : 'default' }>{value || 'N/A'}</Badge> },
  { id: 'orgao', header: 'Órgão', accessorKey: 'orgao', defaultVisible: true, enableSorting: true },
  { id: 'origem', header: 'Origem', accessorKey: 'origem', defaultVisible: true, enableSorting: true },
  { id: 'tipoMeio', header: 'Tipo de Meio', accessorKey: 'tipoMeio', defaultVisible: true, enableSorting: true },
  { id: 'generoDocumental', header: 'Gênero', accessorKey: 'generoDocumental', defaultVisible: true, enableSorting: true },
  { id: 'categoria', header: 'Categoria', accessorKey: 'categoria', defaultVisible: true, enableSorting: true },
  { id: 'tipoDocumento', header: 'Tipo Documento', accessorKey: 'tipoDocumento', defaultVisible: true, enableSorting: true },
  { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento', defaultVisible: true, enableSorting: true },
  { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente', defaultVisible: true, enableSorting: true },
  { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', defaultVisible: false, enableSorting: true, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
  { id: 'nomePartePrincipal', header: 'Nome das Partes', accessorKey: 'nomePartePrincipal', defaultVisible: false, enableSorting: true },
  { id: 'documentosRelacionadosIds', header: 'Docs Relac. (Qtd)', accessorKey: 'documentosRelacionadosIds', defaultVisible: false, enableSorting: false, cellFormatter: (value) => (value ? String(value).split(',').length : 0) },
  { id: 'dataArquivamento', header: 'Data Arquivamento', accessorKey: 'dataArquivamento', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value && isValid(parseISO(value)) ? format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A' },
  { id: 'quantidadeVolumes', header: 'Qtd. Volumes', accessorKey: 'quantidadeVolumes', defaultVisible: false, enableSorting: true },
  { id: 'quantidadeApensos', header: 'Qtd. Apensos', accessorKey: 'quantidadeApensos', defaultVisible: false, enableSorting: true },
  { id: 'numerosApensos', header: 'Nº Apensos', accessorKey: 'numerosApensos', defaultVisible: false, enableSorting: true },
  { id: 'totalMidias', header: 'Total Mídias', accessorKey: 'totalMidias', defaultVisible: false, enableSorting: true },
  { id: 'tipoMidiaDetalhe', header: 'Tipo Mídia', accessorKey: 'tipoMidiaDetalhe', defaultVisible: false, enableSorting: true, cellFormatter: (value, doc) => doc.tipoMidiaDetalhe === 'Outro' ? doc.outroTipoMidiaDetalhe : doc.tipoMidiaDetalhe },
  { id: 'numeroMidiaDetalhe', header: 'Nº Mídia', accessorKey: 'numeroMidiaDetalhe', defaultVisible: false, enableSorting: true },
  { id: 'paginaMidiaDetalhe', header: 'Página Mídia', accessorKey: 'paginaMidiaDetalhe', defaultVisible: false, enableSorting: true },
  { id: 'digitalizado', header: 'Digitalizado', accessorKey: 'digitalizado', defaultVisible: false, enableSorting: true },
  { id: 'tipoBaixa', header: 'Tipo Baixa', accessorKey: 'tipoBaixa', defaultVisible: false, enableSorting: true },
  { id: 'dataBaixa', header: 'Data Baixa', accessorKey: 'dataBaixa', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value && isValid(parseISO(value)) ? format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A' },
  { id: 'codigoClassificacaoJudicialId', header: 'Cód. Class. Judicial', accessorKey: 'codigoClassificacaoJudicialId', defaultVisible: false, enableSorting: true },
  { id: 'classificacaoArquivisticaId', header: 'Classificação', accessorKey: 'classificacaoArquivisticaId', defaultVisible: false, enableSorting: true, cellFormatter: (value) => {
      const classif = placeholderClassificacoesSimulado.find(c => c.id === value);
      return classif ? `${classif.codigo} - ${classif.descricao}` : value || 'N/A';
    } 
  },
  { id: 'prazoArquivoCorrenteDisplay', header: 'Prazo Arq. Corrente', accessorKey: 'prazoArquivoCorrenteDisplay', defaultVisible: false, enableSorting: true },
  { id: 'prazoArquivoIntermediarioDisplay', header: 'Prazo Arq. Interm.', accessorKey: 'prazoArquivoIntermediarioDisplay', defaultVisible: false, enableSorting: true },
  { id: 'destinacaoFinalDisplay', header: 'Destinação Final', accessorKey: 'destinacaoFinalDisplay', defaultVisible: false, enableSorting: true },
  { id: 'anoEliminacaoPrevisto', header: 'Ano Elim. Prev.', accessorKey: 'anoEliminacaoPrevisto', defaultVisible: false, enableSorting: true },
  { id: 'segredoJustica', header: 'Segredo de Justiça', accessorKey: 'segredoJustica', defaultVisible: true, enableSorting: true },
  { id: 'grauSigilo', header: 'Sigilo LAI', accessorKey: 'grauSigilo', defaultVisible: true, enableSorting: true },
  { id: 'codigosCaixa', header: 'Código da Caixa', accessorKey: 'codigosCaixa', defaultVisible: false, enableSorting: true },
  { id: 'codigoAtoM', header: 'AtoM', accessorKey: 'codigoAtoM', defaultVisible: false, enableSorting: true },
  { 
    id: 'mensagens', 
    header: 'Mensagens', 
    accessorKey: 'mensagens', 
    defaultVisible: true, 
    enableSorting: false,
    cellFormatter: (_value, doc) => {
      if (doc.classificacaoInativa) {
        return (
          <span className="text-xs text-red-600 dark:text-red-400 whitespace-normal">
            CÓDIGO CLASSIF. ARQUIVÍSTICA INATIVO, RECLASSIFICAR
          </span>
        );
      }
      return null; 
    }
  },
];


export default function DocumentosPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<Documento>>(initialFormState);
  const [documentIdToDisplay, setDocumentIdToDisplay] = React.useState("(Automático após salvar)");

  const [outroGeneroDocumental, setOutroGeneroDocumental] = React.useState("");
  const [outroTipoMidia, setOutroTipoMidia] = React.useState("");
  const [outroTipoParte, setOutroTipoParte] = React.useState("");
  
  const [filters, setFilters] = React.useState(initialFiltersState);
  const [displayedDocumentos, setDisplayedDocumentos] = React.useState<Documento[]>(placeholderDocumentos);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );
  const [sorting, setSorting] = React.useState<{ id: string; direction: 'asc' | 'desc' } | null>(null);
  const [classificacaoPopoverOpen, setClassificacaoPopoverOpen] = React.useState(false);


  React.useEffect(() => {
    let anoEliminacao = "";
    if (formState.dataArquivamento && formState.prazoArquivoIntermediarioDisplay && 
        (formState.destinacaoFinalDisplay === 'Eliminação' || 
         (formState.destinacaoFinalDisplay !== 'Guarda Permanente' && formState.alteracaoDestinacaoFinal !== 'Não Alterar' && formState.alteracaoDestinacaoFinal !== 'Guarda Permanente – Guarda Amostral' && formState.alteracaoDestinacaoFinal !== 'Guarda Permanente – Decisão da CPAD'))) {
        
        const dataArquivamentoDate = parseISO(formState.dataArquivamento);
        const prazoIntermediarioMatch = String(formState.prazoArquivoIntermediarioDisplay).match(/\d+/);
        
        if (prazoIntermediarioMatch && isValid(dataArquivamentoDate)) {
            const prazoIntermediarioAnos = parseInt(prazoIntermediarioMatch[0], 10);
            if (!isNaN(prazoIntermediarioAnos)) {
                const anoArquivamento = getYear(dataArquivamentoDate);
                anoEliminacao = (anoArquivamento + prazoIntermediarioAnos + 1).toString();
            }
        }
    }
    setFormState(prev => ({ ...prev, anoEliminacaoPrevisto: anoEliminacao }));
  }, [formState.dataArquivamento, formState.prazoArquivoIntermediarioDisplay, formState.destinacaoFinalDisplay, formState.alteracaoDestinacaoFinal]);


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

    if (id === 'classificacaoArquivisticaId' && value) {
        const classificacaoSelecionada = placeholderClassificacoesSimulado.find(c => c.id === value);
        if (classificacaoSelecionada) {
            let prazoCorrente = "";
            if (classificacaoSelecionada.tipoPrazoFaseCorrente === "Anos") {
                prazoCorrente = `${classificacaoSelecionada.prazoGuardaFaseCorrenteAnos} Anos`;
            } else if (classificacaoSelecionada.tipoPrazoFaseCorrente === "Condição Textual") {
                prazoCorrente = classificacaoSelecionada.prazoGuardaFaseCorrenteCondicaoTextual || "";
            }
            setFormState(prev => ({
                ...prev,
                classificacaoArquivisticaId: classificacaoSelecionada.id,
                prazoArquivoCorrenteDisplay: prazoCorrente,
                prazoArquivoIntermediarioDisplay: `${classificacaoSelecionada.prazoGuardaFaseIntermediariaAnos} Anos`,
                destinacaoFinalDisplay: classificacaoSelecionada.destinacaoFinal,
            }));
        } else {
             setFormState(prev => ({ // Should not happen if value is from CommandItem selection
                ...prev,
                classificacaoArquivisticaId: "",
                prazoArquivoCorrenteDisplay: "Não encontrado/Inválido",
                prazoArquivoIntermediarioDisplay: "Não encontrado/Inválido",
                destinacaoFinalDisplay: undefined,
            }));
        }
    }
  };

  const handleDateChange = (id: keyof Partial<Documento>) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));
  };
  
  const resetForm = () => {
    setFormState(initialFormState);
    setDocumentIdToDisplay("(Automático após salvar)");
    setOutroGeneroDocumental("");
    setOutroTipoMidia("");
    setOutroTipoParte("");
  };

  const handleSaveChanges = () => {
    const currentClassificationId = formState.classificacaoArquivisticaId;
    const currentClassification = placeholderClassificacoesSimulado.find(c => c.id === currentClassificationId);
    let updatedHistorico = [...(formState.historicoClassificacoesArquivisticas || [])];

    if (currentClassification) {
        const historyEntry = `${currentClassification.codigo} - ${currentClassification.descricao}`;
        if (!updatedHistorico.length || updatedHistorico[updatedHistorico.length - 1] !== historyEntry) {
            updatedHistorico.push(historyEntry);
        }
    }

    const finalFormState: Documento = {
      ...initialFormState, // Ensure all fields are present
      ...formState, // Spread current form state which includes new classificationId and derived fields
      id: documentIdToDisplay === "(Automático após salvar)" ? `DOC${Date.now()}` : documentIdToDisplay,
      dataCadastro: formState.dataCadastro || new Date().toISOString(),
      generoDocumental: formState.generoDocumental === 'Outro' ? outroGeneroDocumental : formState.generoDocumental!,
      tipoMidiaDetalhe: formState.tipoMidiaDetalhe === 'Outro' ? outroTipoMidia : formState.tipoMidiaDetalhe,
      tipoPartePrincipal: formState.tipoPartePrincipal === 'Outro' ? outroTipoParte : formState.tipoPartePrincipal,
      historicoClassificacoesArquivisticas: updatedHistorico,
      classificacaoInativa: currentClassification ? currentClassification.inativo : false,
      // Ensure required fields from Documento that might be missing in Partial<Documento> have defaults
      status: formState.status || 'Arquivado',
      orgao: formState.orgao || 'TRF2',
      tipoMeio: formState.tipoMeio || 'Não digital',
      categoria: formState.categoria || 'Documento',
      digitalizado: formState.digitalizado || 'Não',
      alteracaoDestinacaoFinal: formState.alteracaoDestinacaoFinal || 'Não Alterar',
      segredoJustica: formState.segredoJustica || 'Não',
      grauSigilo: formState.grauSigilo || 'Ostensivo',
    };
    
    const docIndex = placeholderDocumentos.findIndex(doc => doc.id === finalFormState.id);
    if (docIndex > -1) {
      placeholderDocumentos[docIndex] = finalFormState;
    } else {
      placeholderDocumentos.push(finalFormState);
    }
    applyFiltersAndSorting();

    setIsDialogOpen(false);
  };

  const handleOpenDialog = (doc?: Documento) => {
    if (doc) {
      let prazoCorr = doc.prazoArquivoCorrenteDisplay;
      let prazoInter = doc.prazoArquivoIntermediarioDisplay;
      let destFinal = doc.destinacaoFinalDisplay;
      
      const classificacaoDoc = placeholderClassificacoesSimulado.find(c => c.id === doc.classificacaoArquivisticaId);
      if (classificacaoDoc) { // Recalculate based on the stored ID, not potentially stale display fields from doc
        if (classificacaoDoc.tipoPrazoFaseCorrente === "Anos") {
            prazoCorr = `${classificacaoDoc.prazoGuardaFaseCorrenteAnos} Anos`;
        } else if (classificacaoDoc.tipoPrazoFaseCorrente === "Condição Textual") {
            prazoCorr = classificacaoDoc.prazoGuardaFaseCorrenteCondicaoTextual || "";
        }
        prazoInter = `${classificacaoDoc.prazoGuardaFaseIntermediariaAnos} Anos`;
        destFinal = classificacaoDoc.destinacaoFinal;
      }


      setFormState({
        ...initialFormState, 
        ...doc,
        classificacaoArquivisticaId: doc.classificacaoArquivisticaId || "", // Ensure it's set
        historicoClassificacoesArquivisticas: doc.historicoClassificacoesArquivisticas || [],
        dataArquivamento: doc.dataArquivamento ? doc.dataArquivamento : undefined,
        dataBaixa: doc.dataBaixa ? doc.dataBaixa : undefined,
        prazoArquivoCorrenteDisplay: prazoCorr,
        prazoArquivoIntermediarioDisplay: prazoInter,
        destinacaoFinalDisplay: destFinal,
        quantidadeVolumes: doc.quantidadeVolumes ?? undefined,
        quantidadeApensos: doc.quantidadeApensos ?? undefined,
        totalMidias: doc.totalMidias ?? undefined,
      });
      setDocumentIdToDisplay(doc.id);
      setOutroGeneroDocumental(doc.generoDocumental && !['Textual', 'Iconográfico', 'Cartográfico', 'Sonoro', 'Filmográfico', 'Audiovisual'].includes(doc.generoDocumental) ? doc.generoDocumental : "");
      setOutroTipoMidia(doc.tipoMidiaDetalhe && !['CD-R', 'CD-RW', 'DVD-R', 'DVD-RW', 'Disquete', 'Pen Drive', 'HD'].includes(doc.tipoMidiaDetalhe) ? doc.tipoMidiaDetalhe : "");
      setOutroTipoParte(doc.tipoPartePrincipal && !tiposParteOpcoes.slice(0,-1).includes(doc.tipoPartePrincipal) ? doc.tipoPartePrincipal : "");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
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
  
  const applyFiltersAndSorting = React.useCallback(() => {
    let newFilteredDocumentos = placeholderDocumentos.filter(doc => {
      let passesAll = true;

      if (filters.status && doc.status !== filters.status) passesAll = false;
      if (filters.origemDocumento && doc.origem && !doc.origem.toLowerCase().includes(filters.origemDocumento.toLowerCase())) passesAll = false;
      if (filters.numeroDocumento && doc.numeroDocumento && !doc.numeroDocumento.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) passesAll = false;
      if (filters.descricao && doc.descricaoDocumento && !doc.descricaoDocumento.toLowerCase().includes(filters.descricao.toLowerCase())) passesAll = false;
      
      if (filters.codClassificacao && doc.classificacaoArquivisticaId) {
        const classificacao = placeholderClassificacoesSimulado.find(c => c.id === doc.classificacaoArquivisticaId);
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
      if (filters.codigoCaixa && doc.codigosCaixa && !doc.codigosCaixa.toLowerCase().includes(filters.codigoCaixa.toLowerCase())) passesAll = false;
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

      return passesAll;
    });

    if (sorting) {
      newFilteredDocumentos.sort((a, b) => {
        const valA = getSortableValue(a, sorting.id as string);
        const valB = getSortableValue(b, sorting.id as string);

        if (valA === null || valA === undefined) return sorting.direction === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return sorting.direction === 'asc' ? -1 : 1;
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sorting.direction === 'asc' ? valA - valB : valB - valA;
        }
        if (valA instanceof Date && valB instanceof Date) {
          return sorting.direction === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sorting.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sorting.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setDisplayedDocumentos(newFilteredDocumentos);
  }, [filters, sorting]);

  React.useEffect(() => {
    applyFiltersAndSorting();
  }, [applyFiltersAndSorting]);


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

    setSorting(prev => {
      if (prev?.id === columnId) {
        if (prev.direction === 'asc') return { id: columnId, direction: 'desc' };
        return null; 
      }
      return { id: columnId, direction: 'asc' };
    });
  };

  const getCellValue = (doc: Documento, column: ColumnConfig) => {
    const value = doc[column.accessorKey as keyof Documento];
    if (column.cellFormatter) {
      return column.cellFormatter(value, doc);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  };
  
  const getSortableValue = (doc: Documento, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!column) return null;
    const value = doc[column.accessorKey as keyof Documento];

    if (column.accessorKey === 'dataArquivamento' || column.accessorKey === 'dataBaixa') {
      return value && isValid(parseISO(value as string)) ? parseISO(value as string) : null;
    }
    return value;
  };

  const renderSortIcon = (columnId: string) => {
    if (!sorting || sorting.id !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sorting.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const selectedClassificationDisplay = formState.classificacaoArquivisticaId
    ? placeholderClassificacoesSimulado.find(c => c.id === formState.classificacaoArquivisticaId && !c.inativo)
    : null;


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento do Acervo" description="Cadastre e gerencie as descrições dos documentos do acervo.">
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
              <DialogTitle className="font-headline text-primary">Adicionar/Editar Item ao Acervo</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 py-4">
              
              <div className="space-y-2 lg:col-span-1">
                <Label htmlFor="idDisplay">ID do Documento (Sistema)</Label>
                <Input id="idDisplay" value={documentIdToDisplay} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select onValueChange={handleSelectChange('status')} value={formState.status}>
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
                <Select onValueChange={handleSelectChange('orgao')} value={formState.orgao}>
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
                <Input id="origem" value={formState.origem || ""} onChange={handleInputChange} placeholder="Ex: Tribunal de Justiça" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipoMeio">Tipo de Meio*</Label>
                <Select onValueChange={handleSelectChange('tipoMeio')} value={formState.tipoMeio}>
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
                <Select onValueChange={handleSelectChange('generoDocumental')} value={formState.generoDocumental}>
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
                  <Input id="outroGeneroDocumentalInput" value={outroGeneroDocumental} onChange={(e) => setOutroGeneroDocumental(e.target.value)} placeholder="Especifique o gênero" className="mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria*</Label>
                <Select onValueChange={handleSelectChange('categoria')} value={formState.categoria}>
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
                <Input id="tipoDocumento" value={formState.tipoDocumento || ""} onChange={handleInputChange} placeholder="Ex: Ação Ordinária" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">Número do Documento</Label>
                <Input id="numeroDocumento" value={formState.numeroDocumento || ""} onChange={handleInputChange} placeholder="Ex: 123/2024 ou PRC-001/2024" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataAbrangente">Data Abrangente do Documento</Label>
                <Input id="dataAbrangente" value={formState.dataAbrangente || ""} onChange={handleInputChange} placeholder="Ex: 01/2023 – 12/2024 ou 15/01/2023" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataArquivamento">Data de Arquivamento</Label>
                 <DatePicker 
                  date={formState.dataArquivamento ? parseISO(formState.dataArquivamento) : undefined} 
                  setDate={(date) => handleDateChange('dataArquivamento')(date)} 
                  placeholder="Selecione a data"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeVolumes">Quantidade de Volumes</Label>
                <Input id="quantidadeVolumes" type="number" value={formState.quantidadeVolumes === undefined ? "" : formState.quantidadeVolumes} onChange={handleNumericInputChange} placeholder="Ex: 2 (0 se não houver)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeApensos">Quantidade de Apensos</Label>
                <Input id="quantidadeApensos" type="number" value={formState.quantidadeApensos === undefined ? "" : formState.quantidadeApensos} onChange={handleNumericInputChange} placeholder="Ex: 1 (0 se não houver)" />
              </div>

              { (formState.quantidadeApensos !== undefined && formState.quantidadeApensos > 0) && (
                <div className="space-y-2">
                  <Label htmlFor="numerosApensos">Número(s) dos Apensos</Label>
                  <Input id="numerosApensos" value={formState.numerosApensos || ""} onChange={handleInputChange} placeholder="Ex: AP001, AP002" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="totalMidias">Total de Mídias</Label>
                <Input id="totalMidias" type="number" value={formState.totalMidias === undefined ? "" : formState.totalMidias} onChange={handleNumericInputChange} placeholder="Ex: 1 (0 se não houver)" />
              </div>
              
              {(formState.totalMidias !== undefined && formState.totalMidias > 0) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tipoMidiaDetalhe">Tipo de Mídia</Label>
                    <Select onValueChange={handleSelectChange('tipoMidiaDetalhe')} value={formState.tipoMidiaDetalhe}>
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
                      <Input id="outroTipoMidiaInput" value={outroTipoMidia} onChange={(e) => setOutroTipoMidia(e.target.value)} placeholder="Especifique o tipo de mídia" className="mt-2" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroMidiaDetalhe">Número da Mídia</Label>
                    <Input id="numeroMidiaDetalhe" value={formState.numeroMidiaDetalhe || ""} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paginaMidiaDetalhe">Página da Mídia</Label>
                    <Input id="paginaMidiaDetalhe" value={formState.paginaMidiaDetalhe || ""} onChange={handleInputChange} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="digitalizado">Digitalizado?*</Label>
                <Select onValueChange={handleSelectChange('digitalizado')} value={formState.digitalizado}>
                  <SelectTrigger id="digitalizado"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoBaixa">Tipo de Baixa</Label>
                <Input id="tipoBaixa" value={formState.tipoBaixa || ""} onChange={handleInputChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataBaixa">Data da Baixa</Label>
                <DatePicker 
                  date={formState.dataBaixa ? parseISO(formState.dataBaixa) : undefined} 
                  setDate={(date) => handleDateChange('dataBaixa')(date)} 
                  placeholder="Selecione a data"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
                <Textarea id="descricaoDocumento" value={formState.descricaoDocumento || ""} onChange={handleInputChange} placeholder="Detalhes sobre o conteúdo do documento" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classificacaoArquivisticaIdCombobox">Código de Classificação Arquivística</Label>
                <Popover open={classificacaoPopoverOpen} onOpenChange={setClassificacaoPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={classificacaoPopoverOpen}
                      className="w-full justify-between"
                      id="classificacaoArquivisticaIdCombobox"
                    >
                      {selectedClassificationDisplay
                        ? `${selectedClassificationDisplay.codigo} - ${selectedClassificationDisplay.descricao}`
                        : "Selecione ou digite o código"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar classificação..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma classificação encontrada.</CommandEmpty>
                        <CommandGroup>
                          {placeholderClassificacoesSimulado
                            .filter((c) => !c.inativo)
                            .map((classificacao) => (
                              <CommandItem
                                key={classificacao.id}
                                value={classificacao.id}
                                onSelect={(currentValue) => {
                                  handleSelectChange('classificacaoArquivisticaId')(currentValue);
                                  setClassificacaoPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formState.classificacaoArquivisticaId === classificacao.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {classificacao.codigo} - {classificacao.descricao}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazoArquivoCorrenteDisplay">Prazo Arquivo Corrente</Label>
                <Input id="prazoArquivoCorrenteDisplay" value={formState.prazoArquivoCorrenteDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazoArquivoIntermediarioDisplay">Prazo Arquivo Intermediário</Label>
                <Input id="prazoArquivoIntermediarioDisplay" value={formState.prazoArquivoIntermediarioDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="historicoClassificacoes">Histórico de Classificações</Label>
                <Textarea
                  id="historicoClassificacoes"
                  value={formState.historicoClassificacoesArquivisticas?.join("\n") || ""}
                  readOnly
                  className="bg-muted/50 cursor-not-allowed min-h-[60px]"
                  rows={Math.max(3, formState.historicoClassificacoesArquivisticas?.length || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinacaoFinalDisplay">Destinação Final (Classif.)</Label>
                 <Input id="destinacaoFinalDisplay" value={formState.destinacaoFinalDisplay || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alteracaoDestinacaoFinal">Alteração de Destinação Final*</Label>
                <Select onValueChange={handleSelectChange('alteracaoDestinacaoFinal')} value={formState.alteracaoDestinacaoFinal}>
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
                <Label htmlFor="nomePartePrincipal">Nome da Parte Principal</Label>
                <Input id="nomePartePrincipal" value={formState.nomePartePrincipal || ""} onChange={handleInputChange} placeholder="Nome da parte" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoPartePrincipal">Tipo da Parte Principal</Label>
                <Select onValueChange={handleSelectChange('tipoPartePrincipal')} value={formState.tipoPartePrincipal}>
                  <SelectTrigger id="tipoPartePrincipal"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    {tiposParteOpcoes.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formState.tipoPartePrincipal === 'Outro' && (
                  <Input id="outroTipoPartePrincipalInput" value={outroTipoParte} onChange={(e) => setOutroTipoParte(e.target.value)} placeholder="Especifique o tipo de parte" className="mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="segredoJustica">Segredo de Justiça*</Label>
                <Select onValueChange={handleSelectChange('segredoJustica')} value={formState.segredoJustica}>
                  <SelectTrigger id="segredoJustica"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grauSigilo">Grau de Sigilo (LAI)*</Label>
                 <Select onValueChange={handleSelectChange('grauSigilo')} value={formState.grauSigilo}>
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
                <Input id="codigosCaixa" value={formState.codigosCaixa || ""} onChange={handleInputChange} placeholder="Ex: CX-A-001, CX-B-002" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoAtoM">Código do AtoM</Label>
                <Input id="codigoAtoM" value={formState.codigoAtoM || ""} onChange={handleInputChange} placeholder="Código do AtoM (se aplicável)" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentosRelacionadosIds">Documentos Relacionados (IDs)</Label>
                <Input id="documentosRelacionadosIds" value={formState.documentosRelacionadosIds || ""} onChange={handleInputChange} placeholder="IDs separados por vírgula" />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="observacoesGerais">Observações Gerais</Label>
                <Textarea id="observacoesGerais" value={formState.observacoesGerais || ""} onChange={handleInputChange} placeholder="Outras informações relevantes sobre o documento" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoClassificacaoJudicialId">Código de Classificação Judicial</Label>
                <Input 
                  id="codigoClassificacaoJudicialId" 
                  value={formState.codigoClassificacaoJudicialId || ""} 
                  onChange={handleInputChange} 
                  placeholder="ID da Classe Judicial" 
                  disabled={formState.categoria !== "Processo Judicial"}
                  className={formState.categoria !== "Processo Judicial" ? "bg-muted/50 cursor-not-allowed" : ""}
                />
              </div>

            </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={resetForm}>Limpar</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Documento</Button>
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
                <Input id="filterCodigoCaixa" name="codigoCaixa" value={filters.codigoCaixa} onChange={handleFilterInputChange} placeholder="Contém..." />
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
          <CardTitle className="font-headline text-primary">Lista de Itens do Acervo</CardTitle>
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
                  <TableRow key={doc.id}>
                    {ALL_COLUMNS_CONFIG.map((column) =>
                      columnVisibility[column.id as string] ? (
                        <TableCell key={`${doc.id}-${column.id as string}`} className="py-2 px-3">
                           {getCellValue(doc, column)}
                        </TableCell>
                      ) : null
                    )}
                    <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                       <div className="flex items-center justify-end">
                          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => handleOpenDialog(doc)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
           {displayedDocumentos.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhum documento encontrado para os filtros e ordenação aplicados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    

    







