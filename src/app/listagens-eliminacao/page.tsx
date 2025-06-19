
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ListagemEliminacao, Documento } from "@/types"; 
import { PlusCircle, Edit, Trash2, FileSearch, ArrowUpDown, ArrowUp, ArrowDown, ColumnsIcon, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { DatePicker } from "@/components/date-picker";
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

type SimulatedDocumentForDialog = Pick<
  Documento, 
  'id' | 
  'numeroDocumento' | 
  'tipoDocumento' | 
  'descricaoDocumento' | 
  'nomePartePrincipal' | 
  'dataAbrangente' | 
  'classificacaoArquivisticaId' | 
  'status' | 
  'anoEliminacaoPrevisto' | 
  'destinacaoFinalDisplay' | 
  'alteracaoDestinacaoFinal'
>;

const simulatedFullDocumentData: SimulatedDocumentForDialog[] = [
  { id: "DOC001", numeroDocumento: "PRC-2023-001", tipoDocumento: "Ação Ordinária", descricaoDocumento: "Processo contratual A referente a uma longa disputa sobre patentes de software.", nomePartePrincipal: "Empresa Exemplo Ltda, Outra Parte Interessada SA", dataAbrangente: "01/2023-03/2023", classificacaoArquivisticaId: "CLA001", status: "Arquivado", anoEliminacaoPrevisto: "2030", destinacaoFinalDisplay: "Eliminação", alteracaoDestinacaoFinal: "Não Alterar" },
  { id: "DOC002", numeroDocumento: "OFC-2023-045", tipoDocumento: "Ofício", descricaoDocumento: "Ofício sobre projeto B, solicitando informações adicionais.", nomePartePrincipal: "Maria Santos", dataAbrangente: "20/03/2023", classificacaoArquivisticaId: "CLA002", status: "Arquivado", anoEliminacaoPrevisto: "2028", destinacaoFinalDisplay: "Eliminação", alteracaoDestinacaoFinal: "Não Alterar" },
  { id: "DOC003", numeroDocumento: "MEM-2022-112", tipoDocumento: "Memorando", descricaoDocumento: "Memorando política interna de segurança da informação.", nomePartePrincipal: "João da Silva (Departamento TI)", dataAbrangente: "05/11/2022", classificacaoArquivisticaId: "CLA003", status: "Arquivado", anoEliminacaoPrevisto: "2040", destinacaoFinalDisplay: "Guarda Permanente", alteracaoDestinacaoFinal: "Não Alterar" },
  { id: "DOC004", numeroDocumento: "REQ-2014-001", tipoDocumento: "Requerimento", descricaoDocumento: "Requerimento antigo C, referente a pedido de vista.", nomePartePrincipal: "Empresa XYZ", dataAbrangente: "10/06/2014", classificacaoArquivisticaId: "CLA002", status: "Eliminado", anoEliminacaoPrevisto: "2018", destinacaoFinalDisplay: "Eliminação", alteracaoDestinacaoFinal: "Não Alterar" },
  { id: "DOC005", numeroDocumento: "PET-2010-555", tipoDocumento: "Petição", descricaoDocumento: "Petição inicial D, processo de longa tramitação.", nomePartePrincipal: "Consumidor Teste Primeiro Nome Longo Sobrenome Composto", dataAbrangente: "15/08/2010", classificacaoArquivisticaId: "CLA001", status: "Aguardando prazo para eliminação", anoEliminacaoPrevisto: "2026", destinacaoFinalDisplay: "Eliminação", alteracaoDestinacaoFinal: "Não Alterar" },
  { id: "DOC006", numeroDocumento: "CTR-2015-080", tipoDocumento: "Contrato", descricaoDocumento: "Contrato de serviço E para desenvolvimento de software.", nomePartePrincipal: "Serviços de Consultoria Avançada Ltda", dataAbrangente: "10/01/2015-10/01/2020", classificacaoArquivisticaId: "CLA001", status: "Arquivado", anoEliminacaoPrevisto: "2035", destinacaoFinalDisplay: "Guarda Permanente", alteracaoDestinacaoFinal: "Guarda Permanente – Decisão da CPAD" },
  { id: "DOC007", numeroDocumento: "PA-2019-721", tipoDocumento: "Processo Administrativo", descricaoDocumento: "Processo administrativo F sobre licitação pública complexa.", nomePartePrincipal: "Autarquia Modelo Federal", dataAbrangente: "12/2019", classificacaoArquivisticaId: "CLA002", status: "Arquivado", anoEliminacaoPrevisto: "2025", destinacaoFinalDisplay: "Eliminação", alteracaoDestinacaoFinal: "Não Alterar" },
  { id: "DOC008", numeroDocumento: "AJ-2005-001", tipoDocumento: "Ajuste de Contas", descricaoDocumento: "Ajuste de contas G entre fornecedor e cliente.", nomePartePrincipal: "Fornecedor Global Peças e Serviços", dataAbrangente: "03/2005", classificacaoArquivisticaId: "CLA002", status: "Arquivado", anoEliminacaoPrevisto: "2015", destinacaoFinalDisplay: "Eliminação", alteracaoDestinacaoFinal: "Não Alterar" },
];

const simulatedClassificacoesData = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis" },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas e Expedidas" },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais de Atividades" },
];


const placeholderListagensInitial: ListagemEliminacao[] = [
  { id: "LE001", numeroListagem: "LE-2023-001", documentoIds: ["DOC001", "DOC007"], numeroEditalCiencia: "EDITAL-005/2023", dataPublicacaoEdital: new Date("2023-10-15").toISOString(), dataProducaoListagem: new Date("2023-09-30").toISOString(), numeroTermoEliminacao: "TE-2023-001", dataProducaoTermoEliminacao: new Date("2023-11-01").toISOString(), observacoes: "Primeira listagem do ano, documentos de processos judiciais e administrativos." },
  { id: "LE002", numeroListagem: "LE-2024-001", documentoIds: ["DOC008"], dataProducaoListagem: new Date("2024-02-10").toISOString(), observacoes: "Listagem de teste com documentos financeiros específicos." },
];

const initialFormState: Partial<ListagemEliminacao> = {
  numeroListagem: "",
  documentoIds: [],
  numeroEditalCiencia: "",
  dataPublicacaoEdital: undefined,
  dataProducaoListagem: new Date().toISOString(),
  numeroTermoEliminacao: "",
  dataProducaoTermoEliminacao: undefined,
  observacoes: "",
};

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
    id: 'dataProducaoListagem',
    header: 'Data Prod. Listagem',
    accessorKey: 'dataProducaoListagem',
    defaultVisible: true,
    enableSorting: true,
    cellFormatter: (value) => value && isValid(parseISO(value)) ? format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR }) : "N/A"
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
    cellFormatter: (value) => value && isValid(parseISO(value)) ? format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR }) : "N/A"
  },
  { id: 'numeroTermoEliminacao', header: 'Nº Termo Elim.', accessorKey: 'numeroTermoEliminacao', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  {
    id: 'dataProducaoTermoEliminacao',
    header: 'Data Prod. Termo',
    accessorKey: 'dataProducaoTermoEliminacao',
    defaultVisible: false,
    enableSorting: true,
    cellFormatter: (value) => value && isValid(parseISO(value)) ? format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR }) : "N/A"
  },
  { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
];

type DialogDocumentColumn = {
  id: keyof SimulatedDocumentForDialog | 'selection' | 'codigoClassificacao' | 'assuntoClassificacao';
  header: string | React.ReactNode;
  accessorKey: keyof SimulatedDocumentForDialog | 'selection' | 'codigoClassificacao' | 'assuntoClassificacao' | string;
  enableSorting: boolean;
  cellFormatter?: (value: any, doc: SimulatedDocumentForDialog) => React.ReactNode;
};


export default function ListagensEliminacaoPage() {
  const { toast } = useToast();
  const [listagens, setListagens] = React.useState<ListagemEliminacao[]>(placeholderListagensInitial);
  const [displayedListagens, setDisplayedListagens] = React.useState<ListagemEliminacao[]>(placeholderListagensInitial);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<ListagemEliminacao>>(initialFormState);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingListagemId, setEditingListagemId] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<DialogTableSortConfig[]>([]);

  const [columnVisibilityListagens, setColumnVisibilityListagens] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG_LISTAGENS.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );

  const [documentsForDialog, setDocumentsForDialog] = React.useState<SimulatedDocumentForDialog[]>([]);
  const [selectedDialogDocIds, setSelectedDialogDocIds] = React.useState<string[]>([]);
  const [dialogTableFilters, setDialogTableFilters] = React.useState<DialogTableFilters>({ anoEliminacaoPrevisto: "" });
  const [dialogTableSortConfig, setDialogTableSortConfig] = React.useState<DialogTableSortConfig[]>([]);

  const DIALOG_DOCUMENT_COLUMNS: DialogDocumentColumn[] = React.useMemo(() => [
    {
      id: 'selection',
      header: (
        <Checkbox
          checked={documentsForDialog.length > 0 && selectedDialogDocIds.length === documentsForDialog.length && documentsForDialog.every(doc => selectedDialogDocIds.includes(doc.id))}
          onCheckedChange={(value) => {
            setSelectedDialogDocIds(value ? documentsForDialog.map(d => d.id) : []);
          }}
          aria-label="Selecionar todos os documentos"
        />
      ),
      accessorKey: 'selection',
      enableSorting: false,
      cellFormatter: (_, doc) => (
        <Checkbox
          checked={selectedDialogDocIds.includes(doc.id)}
          onCheckedChange={(value) => {
            setSelectedDialogDocIds(prev => value ? [...prev, doc.id] : prev.filter(id => id !== doc.id));
          }}
          aria-label={`Selecionar documento ${doc.numeroDocumento}`}
        />
      )
    },
    { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento', enableSorting: true },
    { id: 'tipoDocumento', header: 'Tipo de Documento', accessorKey: 'tipoDocumento', enableSorting: true },
    { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', enableSorting: false, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
    { id: 'nomePartePrincipal', header: 'Partes', accessorKey: 'nomePartePrincipal', enableSorting: true },
    { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente', enableSorting: true },
    { 
      id: 'codigoClassificacao', 
      header: 'Cód. Class.', 
      accessorKey: 'classificacaoArquivisticaId', 
      enableSorting: true,
      cellFormatter: (_, doc) => {
        const classificacao = simulatedClassificacoesData.find(c => c.id === doc.classificacaoArquivisticaId);
        return classificacao ? classificacao.codigo : "N/A";
      } 
    },
    { 
      id: 'assuntoClassificacao', 
      header: 'Assunto', 
      accessorKey: 'classificacaoArquivisticaId', 
      enableSorting: true,
      cellFormatter: (_, doc) => {
        const classificacao = simulatedClassificacoesData.find(c => c.id === doc.classificacaoArquivisticaId);
        return classificacao ? <span className="block max-w-xs truncate" title={classificacao.descricao}>{classificacao.descricao}</span> : "N/A";
      }
    },
    { id: 'anoEliminacaoPrevisto', header: 'Ano Elim. Prev.', accessorKey: 'anoEliminacaoPrevisto', enableSorting: true },
  ], [documentsForDialog, selectedDialogDocIds]);


  React.useEffect(() => {
    let filteredDocs = simulatedFullDocumentData.filter(doc => doc.status === "Arquivado");

    if (dialogTableFilters.anoEliminacaoPrevisto) {
      filteredDocs = filteredDocs.filter(doc => doc.anoEliminacaoPrevisto && doc.anoEliminacaoPrevisto.includes(dialogTableFilters.anoEliminacaoPrevisto));
    }

    if (dialogTableSortConfig.length > 0) {
      filteredDocs.sort((a, b) => {
        for (const sortConf of dialogTableSortConfig) {
          let valA, valB;
          if (sortConf.id === 'codigoClassificacao' || sortConf.id === 'assuntoClassificacao') {
            const classA = simulatedClassificacoesData.find(c => c.id === a.classificacaoArquivisticaId);
            const classB = simulatedClassificacoesData.find(c => c.id === b.classificacaoArquivisticaId);
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
  }, [dialogTableFilters, dialogTableSortConfig]);

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

  const renderDialogTableSortIcon = (columnId: keyof SimulatedDocumentForDialog | 'codigoClassificacao' | 'assuntoClassificacao' | string) => {
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
  };

  const handleOpenDialog = (listagem?: ListagemEliminacao) => {
    if (listagem) {
      setIsEditing(true);
      setEditingListagemId(listagem.id);
      setFormState({
        ...listagem,
      });
      setSelectedDialogDocIds(listagem.documentoIds || []);
    } else {
      resetFormAndDialogState();
    }
    setDialogTableFilters({ anoEliminacaoPrevisto: "" }); 
    setDialogTableSortConfig([]); 
    setDocumentsForDialog(simulatedFullDocumentData.filter(doc => doc.status === "Arquivado")); 
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (id: keyof ListagemEliminacao) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));

    if (id === 'dataPublicacaoEdital' && date && selectedDialogDocIds.length > 0) {
        console.warn(`[SIMULAÇÃO] Os seguintes documentos teriam seu status alterado para "Aguardando prazo para Eliminação": ${selectedDialogDocIds.join(', ')}. A atualização real do status dos documentos requer integração com a fonte de dados dos documentos.`);
    }
    if (id === 'dataProducaoTermoEliminacao' && date && selectedDialogDocIds.length > 0) {
        console.warn(`[SIMULAÇÃO] Os seguintes documentos teriam seu status alterado para "Eliminado": ${selectedDialogDocIds.join(', ')}. A atualização real do status dos documentos requer integração com a fonte de dados dos documentos.`);
    }
  };

  const handleSaveChanges = () => {
    const invalidDocEntries: Array<{ id: string; reason: string }> = [];

    selectedDialogDocIds.forEach(docId => {
      const docData = simulatedFullDocumentData.find(d => d.id === docId);
      let isInvalid = false;
      let reasons: string[] = [];

      if (!docData) {
        isInvalid = true;
        reasons.push("não encontrado na simulação");
      } else {
        if (docData.status !== "Arquivado") {
          isInvalid = true;
          reasons.push(`status '${docData.status}' (esperado 'Arquivado')`);
        }
        let effectiveDestinacao = docData.destinacaoFinalDisplay;
        if (docData.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" ||
            docData.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
          effectiveDestinacao = "Guarda Permanente";
        }
        if (effectiveDestinacao === "Guarda Permanente") {
          isInvalid = true;
          reasons.push(`destinação final efetiva 'Guarda Permanente'`);
        }
      }
      if (isInvalid) {
        invalidDocEntries.push({ id: docId, reason: reasons.join('; ') });
      }
    });

    if (invalidDocEntries.length > 0) {
      const errorMessages = invalidDocEntries.map(entry => `${entry.id} (${entry.reason})`).join(' | ');
      toast({
        variant: "destructive",
        title: "Erro de Validação de Documentos",
        description: `Os seguintes documentos não podem ser incluídos: ${errorMessages}. Verifique status e destinação.`,
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
    setSelectedRowIds([]);
    setIsDialogOpen(false);
  };

  const getSortableValue = (item: ListagemEliminacao, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG_LISTAGENS.find(col => col.id === columnId);
    if (!column) return null;

    const value = item[column.accessorKey as keyof ListagemEliminacao];

    if (column.accessorKey === 'documentoIds' && Array.isArray(value)) {
      return value.length;
    }
    if (['dataProducaoListagem', 'dataPublicacaoEdital', 'dataProducaoTermoEliminacao'].includes(column.accessorKey as string) && typeof value === 'string') {
      return isValid(parseISO(value)) ? parseISO(value) : null;
    }
    return value;
  };

  React.useEffect(() => {
    let sortedListagens = [...listagens];
    if (sorting.length > 0) {
      sortedListagens.sort((a, b) => {
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
    setDisplayedListagens(sortedListagens);
  }, [sorting, listagens]);

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
        newSorting.push({ id: columnId, direction: 'asc' });
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
    console.log("Excluir listagem:", listagemId);
    // setListagens(prev => prev.filter(l => l.id !== listagemId));
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

  const numDisplayed = displayedListagens.length;
  const numSelected = selectedRowIds.length;

  return (
    <TooltipProvider>
      <div className="container mx-auto py-2">
        <PageHeader title="Listagens de Eliminação" description="Gerencie as listagens de eliminação de documentos.">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroListagem">Nº Listagem*</Label>
                    <Input id="numeroListagem" value={formState.numeroListagem || ""} onChange={handleInputChange} placeholder="Ex: LE-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataProducaoListagem">Data Prod. Listagem*</Label>
                    <DatePicker
                      date={formState.dataProducaoListagem ? parseISO(formState.dataProducaoListagem) : undefined}
                      setDate={(date) => handleDateChange('dataProducaoListagem')(date)}
                      placeholder="Selecione a data"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroEditalCiencia">Nº Edital Ciência</Label>
                    <Input id="numeroEditalCiencia" value={formState.numeroEditalCiencia || ""} onChange={handleInputChange} placeholder="Ex: EDITAL-001/2024" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataPublicacaoEdital">Data Pub. Edital</Label>
                    <DatePicker
                      date={formState.dataPublicacaoEdital ? parseISO(formState.dataPublicacaoEdital) : undefined}
                      setDate={(date) => handleDateChange('dataPublicacaoEdital')(date)}
                      placeholder="Selecione a data"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="numeroTermoEliminacao">Nº Termo Eliminação</Label>
                    <Input id="numeroTermoEliminacao" value={formState.numeroTermoEliminacao || ""} onChange={handleInputChange} placeholder="Ex: TE-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataProducaoTermoEliminacao">Data Prod. Termo</Label>
                    <DatePicker
                      date={formState.dataProducaoTermoEliminacao ? parseISO(formState.dataProducaoTermoEliminacao) : undefined}
                      setDate={(date) => handleDateChange('dataProducaoTermoEliminacao')(date)}
                      placeholder="Selecione a data"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" value={formState.observacoes || ""} onChange={handleInputChange} placeholder="Observações adicionais sobre a listagem" rows={2} />
                  </div>
              </div>

              <div className="mt-4 md:col-span-2">
                <Label className="text-md font-medium">Documentos a serem eliminados (Apenas status 'Arquivado')</Label>
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
                                  {col.cellFormatter ? col.cellFormatter((doc as any)[col.accessorKey], doc) : (doc as any)[col.accessorKey] || "N/A"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                           {documentsForDialog.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={DIALOG_DOCUMENT_COLUMNS.length} className="h-24 text-center">
                                        Nenhum documento "Arquivado" encontrado para os filtros aplicados.
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
              <DialogFooter className="pt-6">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button type="button" onClick={handleSaveChanges}>Salvar Listagem</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-primary">Listagens Cadastradas</CardTitle>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Listagem" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Excluir Listagem</p></TooltipContent>
                          </Tooltip>
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
      </div>
    </TooltipProvider>
  );
}
