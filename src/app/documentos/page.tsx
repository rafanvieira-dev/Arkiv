
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Documento } from "@/types";
import { PlusCircle, Edit, Trash2, Search, RotateCcw } from "lucide-react";
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
import { DatePicker } from "@/components/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";

const placeholderClassificacoesSimulado = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis", inativo: false, prazoGuardaFaseIntermediariaAnos: 15, destinacaoFinal: 'Guarda Permanente' as const, tipoPrazoFaseCorrente: "Anos" as const, prazoGuardaFaseCorrenteAnos: 5 },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas", inativo: true, prazoGuardaFaseIntermediariaAnos: 3, destinacaoFinal: 'Eliminação' as const, tipoPrazoFaseCorrente: "Condição Textual" as const, prazoGuardaFaseCorrenteCondicaoTextual: "Até a próxima atualização" },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais", inativo: false, prazoGuardaFaseIntermediariaAnos: 0, destinacaoFinal: 'Guarda Permanente' as const, tipoPrazoFaseCorrente: "Anos" as const, prazoGuardaFaseCorrenteAnos: 1 },
];

const placeholderDocumentos: Documento[] = [
  { 
    id: "DOC001", 
    numeroDocumento: "PRC-2023-001", 
    status: "Arquivado", 
    orgao: "TRF2", 
    origem: "Tribunal de Justiça", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Ação Ordinária", 
    dataAbrangente: "01/2023 - 03/2023",
    dataArquivamento: new Date("2023-01-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 0,
    tipoMidiaDetalhe: undefined,
    numeroMidiaDetalhe: "",
    paginaMidiaDetalhe: "",
    digitalizado: "Não", 
    tipoBaixa: "",
    dataBaixa: undefined,
    descricaoDocumento: "Processo referente à disputa contratual X.",
    classificacaoArquivisticaId: "CLA001",
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "", // Guarda Permanente
    nomePartePrincipal: "Empresa Exemplo Ltda",
    tipoPartePrincipal: "Autor",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX001", 
    codigoAtoM: "ATOM001",
    documentosRelacionadosIds: "",
    observacoesGerais: "Nenhuma observação.",
    codigoClassificacaoJudicialId: "CJ001",
    dataCadastro: new Date("2023-01-01T10:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA001")?.inativo,
  },
  { 
    id: "DOC002", 
    numeroDocumento: "OFC-2023-045", 
    status: "Emprestado", 
    orgao: "SJRJ", 
    origem: "Secretaria Municipal", 
    tipoMeio: "Digital", 
    generoDocumental: "Textual", 
    categoria: "Documento", 
    tipoDocumento: "Solicitação de Informações", 
    dataAbrangente: "20/03/2023",
    dataArquivamento: new Date("2023-03-20").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 1,
    numerosApensos: "AP001",
    totalMidias: 1,
    tipoMidiaDetalhe: "CD-R",
    outroTipoMidiaDetalhe: "",
    numeroMidiaDetalhe: "M001",
    paginaMidiaDetalhe: "1-10",
    digitalizado: "Sim", 
    tipoBaixa: "Devolvido ao Arquivo",
    dataBaixa: new Date("2023-04-10").toISOString(),
    descricaoDocumento: "Ofício solicitando informações sobre o projeto X.",
    classificacaoArquivisticaId: "CLA002", 
    prazoArquivoCorrenteDisplay: "Até a próxima atualização",
    prazoArquivoIntermediarioDisplay: "3 Anos",
    destinacaoFinalDisplay: "Eliminação",
    alteracaoDestinacaoFinal: "Não Alterar",
    anoEliminacaoPrevisto: "2027", 
    nomePartePrincipal: "Maria Santos",
    tipoPartePrincipal: "Requerente",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX002", 
    codigoAtoM: "ATOM002",
    documentosRelacionadosIds: "DOC001",
    observacoesGerais: "Prioridade alta.",
    codigoClassificacaoJudicialId: "",
    dataCadastro: new Date("2023-02-15T11:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA002")?.inativo,
  },
  { 
    id: "DOC003", 
    numeroDocumento: "MEM-2022-112", 
    status: "Arquivado", 
    orgao: "SJES", 
    origem: "Câmara de Vereadores", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Processo Administrativo", 
    tipoDocumento: "Comunicação Interna", 
    dataAbrangente: "05/11/2022",
    dataArquivamento: new Date("2022-11-05").toISOString(), 
    quantidadeVolumes: 2,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 0,
    tipoMidiaDetalhe: undefined,
    numeroMidiaDetalhe: "",
    paginaMidiaDetalhe: "",
    digitalizado: "Não", 
    tipoBaixa: "",
    dataBaixa: undefined,
    descricaoDocumento: "Memorando sobre nova política interna.",
    classificacaoArquivisticaId: "CLA003", 
    prazoArquivoCorrenteDisplay: "1 Ano",
    prazoArquivoIntermediarioDisplay: "0 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "", 
    nomePartePrincipal: "João da Silva",
    tipoPartePrincipal: "Interessado",
    outroTipoPartePrincipal: "",
    segredoJustica: "Sim", 
    grauSigilo: "Secreto", 
    codigosCaixa: "CX001", 
    codigoAtoM: "ATOM003",
    documentosRelacionadosIds: "",
    observacoesGerais: "Documento de acesso restrito.",
    codigoClassificacaoJudicialId: "",
    dataCadastro: new Date("2022-12-01T09:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA003")?.inativo,
  },
   { 
    id: "DOC004", 
    numeroDocumento: "REQ-2014-001", 
    status: "Eliminado", 
    orgao: "TRF2", 
    origem: "Advocacia Geral", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Documento", 
    tipoDocumento: "Requerimento", 
    dataAbrangente: "10/06/2014",
    dataArquivamento: new Date("2014-06-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    numerosApensos: "",
    totalMidias: 0,
    tipoMidiaDetalhe: undefined,
    numeroMidiaDetalhe: "",
    paginaMidiaDetalhe: "",
    digitalizado: "Não", 
    tipoBaixa: "Eliminação Concluída",
    dataBaixa: new Date("2018-12-01").toISOString(),
    descricaoDocumento: "Requerimento antigo, processo finalizado e eliminado.",
    classificacaoArquivisticaId: "CLA002", 
    prazoArquivoCorrenteDisplay: "Até a próxima atualização",
    prazoArquivoIntermediarioDisplay: "3 Anos", 
    destinacaoFinalDisplay: "Eliminação",      
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2018", 
    nomePartePrincipal: "Empresa XYZ",
    tipoPartePrincipal: "Requerente",
    outroTipoPartePrincipal: "",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX-TEMP-001", 
    codigoAtoM: "",
    documentosRelacionadosIds: "",
    observacoesGerais: "Documento eliminado conforme edital.",
    codigoClassificacaoJudicialId: "",
    dataCadastro: new Date("2014-06-01T10:00:00Z").toISOString(), 
    classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA002")?.inativo,
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
  numeroDocumento: "",
  origem: "",
  tipoDocumento: "",
  destinacaoFinal: "",
  anoDocumento: "",
  anoLimiteDocumento: "",
  prazoCorrente: "",
  prazoIntermediario: "",
  segredoJustica: "",
  digitalizado: "",
};

const ALL_VALUES_SENTINEL = "ALL_VALUES_SENTINEL";

export default function DocumentosPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<Documento>>(initialFormState);
  const [documentIdToDisplay, setDocumentIdToDisplay] = React.useState("(Automático após salvar)");

  const [outroGeneroDocumental, setOutroGeneroDocumental] = React.useState("");
  const [outroTipoMidia, setOutroTipoMidia] = React.useState("");
  const [outroTipoParte, setOutroTipoParte] = React.useState("");
  
  const [filters, setFilters] = React.useState(initialFiltersState);
  const [displayedDocumentos, setDisplayedDocumentos] = React.useState<Documento[]>(placeholderDocumentos);

  React.useEffect(() => {
    let anoEliminacao = "";
    if (formState.dataArquivamento && formState.prazoArquivoIntermediarioDisplay && 
        (formState.destinacaoFinalDisplay === 'Eliminação' || 
         (formState.destinacaoFinalDisplay !== 'Guarda Permanente' && formState.alteracaoDestinacaoFinal !== 'Não Alterar' && formState.alteracaoDestinacaoFinal !== 'Guarda Permanente – Guarda Amostral' && formState.alteracaoDestinacaoFinal !== 'Guarda Permanente – Decisão da CPAD'))) {
        
        const dataArquivamentoDate = parseISO(formState.dataArquivamento);
        const prazoIntermediarioMatch = formState.prazoArquivoIntermediarioDisplay.match(/\d+/);
        
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
        const classificacaoSelecionada = placeholderClassificacoesSimulado.find(c => c.id === value || c.codigo === value);
        if (classificacaoSelecionada) {
            let prazoCorrente = "";
            if (classificacaoSelecionada.tipoPrazoFaseCorrente === "Anos") {
                prazoCorrente = `${classificacaoSelecionada.prazoGuardaFaseCorrenteAnos} Anos`;
            } else if (classificacaoSelecionada.tipoPrazoFaseCorrente === "Condição Textual") {
                prazoCorrente = classificacaoSelecionada.prazoGuardaFaseCorrenteCondicaoTextual || "";
            }
            setFormState(prev => ({
                ...prev,
                prazoArquivoCorrenteDisplay: prazoCorrente,
                prazoArquivoIntermediarioDisplay: `${classificacaoSelecionada.prazoGuardaFaseIntermediariaAnos} Anos`,
                destinacaoFinalDisplay: classificacaoSelecionada.destinacaoFinal,
            }));
        } else {
             setFormState(prev => ({
                ...prev,
                prazoArquivoCorrenteDisplay: "Não encontrado",
                prazoArquivoIntermediarioDisplay: "Não encontrado",
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
    const finalFormState = {
      ...formState,
      id: documentIdToDisplay === "(Automático após salvar)" ? `DOC${Date.now()}` : documentIdToDisplay,
      dataCadastro: formState.dataCadastro || new Date().toISOString(),
      generoDocumental: formState.generoDocumental === 'Outro' ? outroGeneroDocumental : formState.generoDocumental,
      tipoMidiaDetalhe: formState.tipoMidiaDetalhe === 'Outro' ? outroTipoMidia : formState.tipoMidiaDetalhe,
      tipoPartePrincipal: formState.tipoPartePrincipal === 'Outro' ? outroTipoParte : formState.tipoPartePrincipal,
    };
    console.log("Salvando documento:", finalFormState);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (doc?: Documento) => {
    if (doc) {
      const classificacao = placeholderClassificacoesSimulado.find(c => c.id === doc.classificacaoArquivisticaId);
      let prazoCorr = doc.prazoArquivoCorrenteDisplay;
      let prazoInter = doc.prazoArquivoIntermediarioDisplay;
      let destFinal = doc.destinacaoFinalDisplay;

      if (classificacao) {
        if (classificacao.tipoPrazoFaseCorrente === "Anos") {
            prazoCorr = `${classificacao.prazoGuardaFaseCorrenteAnos} Anos`;
        } else if (classificacao.tipoPrazoFaseCorrente === "Condição Textual") {
            prazoCorr = classificacao.prazoGuardaFaseCorrenteCondicaoTextual || "";
        }
        prazoInter = `${classificacao.prazoGuardaFaseIntermediariaAnos} Anos`;
        destFinal = classificacao.destinacaoFinal;
      }

      setFormState({
        ...initialFormState, 
        ...doc,
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

  const applyFilters = () => {
    const newFilteredDocumentos = placeholderDocumentos.filter(doc => {
      let passesAll = true;

      if (filters.destinacaoFinal) {
        let effectiveDestination = doc.destinacaoFinalDisplay;
        if (doc.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" || doc.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
          effectiveDestination = "Guarda Permanente";
        }
        if (effectiveDestination !== filters.destinacaoFinal) {
          passesAll = false;
        }
      }

      if (filters.anoDocumento && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
        const docYear = getYear(parseISO(doc.dataArquivamento)).toString();
        if (docYear !== filters.anoDocumento) {
          passesAll = false;
        }
      }

      if (filters.anoLimiteDocumento && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
        const docYear = getYear(parseISO(doc.dataArquivamento));
        if (docYear > parseInt(filters.anoLimiteDocumento, 10)) {
          passesAll = false;
        }
      }

      if (filters.prazoCorrente && doc.prazoArquivoCorrenteDisplay && !doc.prazoArquivoCorrenteDisplay.toLowerCase().includes(filters.prazoCorrente.toLowerCase())) {
        passesAll = false;
      }

      if (filters.prazoIntermediario && doc.prazoArquivoIntermediarioDisplay && !doc.prazoArquivoIntermediarioDisplay.toLowerCase().includes(filters.prazoIntermediario.toLowerCase())) {
        passesAll = false;
      }
      
      if (filters.numeroDocumento && doc.numeroDocumento && !doc.numeroDocumento.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) {
        passesAll = false;
      }
      if (filters.origem && doc.origem && !doc.origem.toLowerCase().includes(filters.origem.toLowerCase())) {
        passesAll = false;
      }
      if (filters.tipoDocumento && doc.tipoDocumento && !doc.tipoDocumento.toLowerCase().includes(filters.tipoDocumento.toLowerCase())) {
        passesAll = false;
      }
      if (filters.segredoJustica && doc.segredoJustica !== filters.segredoJustica) {
        passesAll = false;
      }
      if (filters.digitalizado && doc.digitalizado !== filters.digitalizado) {
        passesAll = false;
      }

      return passesAll;
    });
    setDisplayedDocumentos(newFilteredDocumentos);
  };

  const clearFilters = () => {
    setFilters(initialFiltersState);
    setDisplayedDocumentos(placeholderDocumentos);
  };


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
                <Label htmlFor="classificacaoArquivisticaId">Código de Classificação Arquivística</Label>
                 <Select onValueChange={handleSelectChange('classificacaoArquivisticaId')} value={formState.classificacaoArquivisticaId}>
                    <SelectTrigger id="classificacaoArquivisticaId"><SelectValue placeholder="Selecione ou digite o código" /></SelectTrigger>
                    <SelectContent>
                        {placeholderClassificacoesSimulado.filter(c => !c.inativo).map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.descricao}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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

      <Card className="mb-6 mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Filtros do Acervo</CardTitle>
          <CardDescription>Refine a lista de documentos abaixo.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filterNumeroDocumento">Número do Documento</Label>
            <Input id="filterNumeroDocumento" name="numeroDocumento" value={filters.numeroDocumento} onChange={handleFilterInputChange} placeholder="Contém..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterOrigem">Origem</Label>
            <Input id="filterOrigem" name="origem" value={filters.origem} onChange={handleFilterInputChange} placeholder="Contém..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterTipoDocumento">Tipo de Documento</Label>
            <Input id="filterTipoDocumento" name="tipoDocumento" value={filters.tipoDocumento} onChange={handleFilterInputChange} placeholder="Contém..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterDestinacaoFinal">Destinação Final</Label>
            <Select onValueChange={handleFilterSelectChange('destinacaoFinal')} value={filters.destinacaoFinal}>
              <SelectTrigger id="filterDestinacaoFinal"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUES_SENTINEL}>Todas</SelectItem>
                <SelectItem value="Eliminação">Eliminação</SelectItem>
                <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterAnoDocumento">Ano do Documento (Arquivamento)</Label>
            <Input id="filterAnoDocumento" name="anoDocumento" type="number" value={filters.anoDocumento} onChange={handleFilterInputChange} placeholder="Ex: 2023" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterAnoLimiteDocumento">Documentos Até o Ano (Arquivamento)</Label>
            <Input id="filterAnoLimiteDocumento" name="anoLimiteDocumento" type="number" value={filters.anoLimiteDocumento} onChange={handleFilterInputChange} placeholder="Ex: 2014" />
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
            <Label htmlFor="filterSegredoJustica">Segredo de Justiça</Label>
            <Select onValueChange={handleFilterSelectChange('segredoJustica')} value={filters.segredoJustica}>
              <SelectTrigger id="filterSegredoJustica"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUES_SENTINEL}>Todos</SelectItem>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
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
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={clearFilters}><RotateCcw className="mr-2 h-4 w-4" /> Limpar Filtros</Button>
          <Button onClick={applyFilters}><Search className="mr-2 h-4 w-4" /> Aplicar Filtros</Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Itens do Acervo</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Documento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Órgão</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Tipo Meio</TableHead>
                  <TableHead>Gênero Doc.</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo Doc.</TableHead>
                  <TableHead>Data Abrangente</TableHead>
                  <TableHead>Data Arq.</TableHead>
                  <TableHead>Qtd. Vol.</TableHead>
                  <TableHead>Qtd. Apen.</TableHead>
                  <TableHead>Nºs Apensos</TableHead>
                  <TableHead>Tot. Mídias</TableHead>
                  <TableHead>Tipo Mídia</TableHead>
                  <TableHead>Nº Mídia</TableHead>
                  <TableHead>Pág. Mídia</TableHead>
                  <TableHead>Digitalizado</TableHead>
                  <TableHead>Tipo Baixa</TableHead>
                  <TableHead>Data Baixa</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>ID Class. Arq.</TableHead>
                  <TableHead>Prazo Corr.</TableHead>
                  <TableHead>Prazo Interm.</TableHead>
                  <TableHead>Dest. Final (Class.)</TableHead>
                  <TableHead>Alt. Dest. Final</TableHead>
                  <TableHead>Ano Elim. Prev.</TableHead>
                  <TableHead>Parte Princ.</TableHead>
                  <TableHead>Tipo Parte</TableHead>
                  <TableHead>Segredo Justiça</TableHead>
                  <TableHead>Grau Sigilo</TableHead>
                  <TableHead>Caixa(s)</TableHead>
                  <TableHead>Cód. AtoM</TableHead>
                  <TableHead>Docs. Relac.</TableHead>
                  <TableHead>Obs. Gerais</TableHead>
                  <TableHead>ID Class. Jud.</TableHead>
                  <TableHead>Data Cad.</TableHead>
                  <TableHead className="text-right sticky right-0 bg-background z-10">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedDocumentos.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.numeroDocumento || doc.id}
                      {doc.classificacaoInativa && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 whitespace-normal">
                          CÓDIGO CLASSIF. ARQUIVÍSTICA INATIVO, RECLASSIFICAR
                        </p>
                      )}
                    </TableCell>
                    <TableCell><Badge variant={doc.status === 'Arquivado' ? 'secondary' : doc.status === 'Emprestado' ? 'outline' : 'default' }>{doc.status || 'N/A'}</Badge></TableCell>
                    <TableCell>{doc.orgao || 'N/A'}</TableCell>
                    <TableCell>{doc.origem || 'N/A'}</TableCell>
                    <TableCell>{doc.tipoMeio || 'N/A'}</TableCell>
                    <TableCell>{doc.generoDocumental || 'N/A'}</TableCell>
                    <TableCell>{doc.categoria || 'N/A'}</TableCell>
                    <TableCell>{doc.tipoDocumento || 'N/A'}</TableCell>
                    <TableCell>{doc.dataAbrangente || 'N/A'}</TableCell>
                    <TableCell>{doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento)) ? format(parseISO(doc.dataArquivamento), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</TableCell>
                    <TableCell>{doc.quantidadeVolumes ?? 'N/A'}</TableCell>
                    <TableCell>{doc.quantidadeApensos ?? 'N/A'}</TableCell>
                    <TableCell>{doc.numerosApensos || 'N/A'}</TableCell>
                    <TableCell>{doc.totalMidias ?? 'N/A'}</TableCell>
                    <TableCell>{doc.tipoMidiaDetalhe || 'N/A'}</TableCell>
                    <TableCell>{doc.numeroMidiaDetalhe || 'N/A'}</TableCell>
                    <TableCell>{doc.paginaMidiaDetalhe || 'N/A'}</TableCell>
                    <TableCell>{doc.digitalizado || 'N/A'}</TableCell>
                    <TableCell>{doc.tipoBaixa || 'N/A'}</TableCell>
                    <TableCell>{doc.dataBaixa && isValid(parseISO(doc.dataBaixa)) ? format(parseISO(doc.dataBaixa), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate whitespace-normal">{doc.descricaoDocumento || 'N/A'}</TableCell>
                    <TableCell>{doc.classificacaoArquivisticaId || 'N/A'}</TableCell>
                    <TableCell>{doc.prazoArquivoCorrenteDisplay || 'N/A'}</TableCell>
                    <TableCell>{doc.prazoArquivoIntermediarioDisplay || 'N/A'}</TableCell>
                    <TableCell>{doc.destinacaoFinalDisplay || 'N/A'}</TableCell>
                    <TableCell>{doc.alteracaoDestinacaoFinal || 'N/A'}</TableCell>
                    <TableCell>{doc.anoEliminacaoPrevisto || 'N/A'}</TableCell>
                    <TableCell>{doc.nomePartePrincipal || 'N/A'}</TableCell>
                    <TableCell>{doc.tipoPartePrincipal || 'N/A'}</TableCell>
                    <TableCell>{doc.segredoJustica || 'N/A'}</TableCell>
                    <TableCell>{doc.grauSigilo || 'N/A'}</TableCell>
                    <TableCell>{doc.codigosCaixa || 'N/A'}</TableCell>
                    <TableCell>{doc.codigoAtoM || 'N/A'}</TableCell>
                    <TableCell>{doc.documentosRelacionadosIds || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate whitespace-normal">{doc.observacoesGerais || 'N/A'}</TableCell>
                    <TableCell>{doc.codigoClassificacaoJudicialId || 'N/A'}</TableCell>
                    <TableCell>{doc.dataCadastro && isValid(parseISO(doc.dataCadastro)) ? format(parseISO(doc.dataCadastro), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</TableCell>
                    <TableCell className="text-right sticky right-0 bg-background z-10">
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => handleOpenDialog(doc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
           {displayedDocumentos.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhum documento encontrado para os filtros aplicados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
