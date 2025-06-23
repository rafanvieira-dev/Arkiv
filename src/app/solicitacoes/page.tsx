
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Solicitacao, Documento } from "@/types";
import { PlusCircle, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ListFilter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { parseISO } from 'date-fns';
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  placeholderSolicitacoesInitial, 
  placeholderDocumentos, 
  simulatedListagensData,
  type SimulatedDocumentForSolicitacaoDialog
} from "@/lib/mock-data";


const initialFormStateSolicitacao: Partial<Solicitacao> = {
  nomeSolicitante: "",
  setorSolicitante: "",
  siglaServidor: "",
  matriculaSolicitante: "",
  ramal: "",
  emailContato: "",
  tipo: 'Empréstimo',
  dataSolicitacao: new Date().toISOString(),
  dataAtendimento: undefined,
  dataDevolucao: undefined,
  documentoIds: [],
  status: "Pendente",
  observacoes: "",
};

type DialogDocSortConfig = { id: keyof SimulatedDocumentForSolicitacaoDialog | string; direction: 'asc' | 'desc'; };
type DialogDocFilters = { searchTerm: string; };

const SOLICITACOES_STORAGE_KEY = 'arquivocentral_solicitacoes';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';


export default function SolicitacoesPage() {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = React.useState<Solicitacao[]>([]);
  const [acervoDocs, setAcervoDocs] = React.useState<SimulatedDocumentForSolicitacaoDialog[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [displayedSolicitacoes, setDisplayedSolicitacoes] = React.useState<Solicitacao[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<Solicitacao>>(initialFormStateSolicitacao);
  const [isEditing, setIsEditing] = React.useState(false); 
  const [editingId, setEditingId] = React.useState<string | null>(null); 

  const [documentsForDialog, setDocumentsForDialog] = React.useState<SimulatedDocumentForSolicitacaoDialog[]>([]);
  const [selectedDocIdsInDialog, setSelectedDocIdsInDialog] = React.useState<string[]>([]);
  const [dialogDocFilters, setDialogDocFilters] = React.useState<DialogDocFilters>({ searchTerm: "" });
  const [dialogDocSortConfig, setDialogDocSortConfig] = React.useState<DialogDocSortConfig[]>([]);
  const [isDocumentSelectionVisible, setIsDocumentSelectionVisible] = React.useState(false);

  const previousDataAtendimentoRef = React.useRef<string | undefined>();
  const previousDataDevolucaoRef = React.useRef<string | undefined>();


  React.useEffect(() => {
    try {
      const storedSolicitacoes = window.localStorage.getItem(SOLICITACOES_STORAGE_KEY);
      setSolicitacoes(storedSolicitacoes ? JSON.parse(storedSolicitacoes) : placeholderSolicitacoesInitial);

      const storedDocumentos = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      const baseDocs = storedDocumentos ? JSON.parse(storedDocumentos) : placeholderDocumentos;
      // We don't need to persist the acervo state separately, we calculate it on load.
      setAcervoDocs(baseDocs);

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setSolicitacoes(placeholderSolicitacoesInitial);
      setAcervoDocs(placeholderDocumentos);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
          window.localStorage.setItem(SOLICITACOES_STORAGE_KEY, JSON.stringify(solicitacoes));
          window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(acervoDocs));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [solicitacoes, acervoDocs, isDataLoaded]);

  React.useEffect(() => {
    if (!isDataLoaded) return;
  
    const activeLoanMap = new Map<string, Solicitacao['tipo']>();
    solicitacoes.forEach(sol => {
      if (sol.dataAtendimento && !sol.dataDevolucao) {
        sol.documentoIds.forEach(docId => activeLoanMap.set(docId, sol.tipo));
      }
    });
  
    const processedDocs = acervoDocs.map(originalDoc => {
      let doc = { ...originalDoc };
      let currentDocStatus = doc.status;
      let isEliminated = false;
  
      if ('numeroListagemEliminacao' in doc && doc.numeroListagemEliminacao) {
        const listagem = simulatedListagensData.find(l => l.numeroListagem === doc.numeroListagemEliminacao);
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
  
    setAcervoDocs(processedDocs);
  }, [solicitacoes, isDataLoaded]);

  React.useEffect(() => {
    setDisplayedSolicitacoes(solicitacoes); 
  }, [solicitacoes]);
  
  React.useEffect(() => {
    const lowerSearchTerm = dialogDocFilters.searchTerm.toLowerCase();
    
    let filteredDocs = acervoDocs.filter(doc => {
      const isAlreadySelectedInThisSolicitation = selectedDocIdsInDialog.includes(doc.id);

      const isVisible = isAlreadySelectedInThisSolicitation || doc.status === 'Arquivado';
      if (!isVisible) return false;
      
      if (!lowerSearchTerm) return true;

      const numeroMatch = doc.numeroDocumento?.toLowerCase().includes(lowerSearchTerm) ?? false;
      const tipoMatch = doc.tipoDocumento?.toLowerCase().includes(lowerSearchTerm) ?? false;
      const descricaoMatch = doc.descricaoDocumento?.toLowerCase().includes(lowerSearchTerm) ?? false;
      const caixaMatch = doc.codigosCaixa?.toLowerCase().includes(lowerSearchTerm) ?? false;

      return numeroMatch || tipoMatch || descricaoMatch || caixaMatch;
    });

    if (dialogDocSortConfig.length > 0) {
      filteredDocs.sort((a, b) => {
        for (const sortConf of dialogDocSortConfig) {
          const valA = (a as any)[sortConf.id];
          const valB = (b as any)[sortConf.id];
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
  }, [dialogDocFilters, dialogDocSortConfig, acervoDocs, selectedDocIdsInDialog]);


  const updateDocStatusOnDateChange = React.useCallback(() => {
    if (!isDialogOpen) return;

    const newDocStatusOnAttend = formState.tipo === 'Empréstimo' ? 'Emprestado' : 'Desarquivado';
    
    setAcervoDocs(prevDocs =>
      prevDocs.map(doc => {
        if (selectedDocIdsInDialog.includes(doc.id)) {
          if (formState.dataDevolucao) {
            return { ...doc, status: 'Arquivado' };
          }
          if (formState.dataAtendimento) {
            return { ...doc, status: newDocStatusOnAttend as Documento['status'] };
          }
        }
        return doc;
      })
    );
  }, [isDialogOpen, formState.dataAtendimento, formState.dataDevolucao, formState.tipo, selectedDocIdsInDialog]);

  React.useEffect(() => {
    if (isDialogOpen) {
      if (formState.dataAtendimento !== previousDataAtendimentoRef.current || formState.dataDevolucao !== previousDataDevolucaoRef.current) {
        updateDocStatusOnDateChange();
        previousDataAtendimentoRef.current = formState.dataAtendimento;
        previousDataDevolucaoRef.current = formState.dataDevolucao;
      }
    }
  }, [isDialogOpen, formState.dataAtendimento, formState.dataDevolucao, updateDocStatusOnDateChange]);


  const resetFormAndDialogState = () => {
    setFormState({ ...initialFormStateSolicitacao, dataSolicitacao: new Date().toISOString() });
    setIsEditing(false);
    setEditingId(null);
    setSelectedDocIdsInDialog([]);
    setDialogDocFilters({ searchTerm: "" });
    setDialogDocSortConfig([]);
    setIsDocumentSelectionVisible(false);
  };

  const handleOpenDialog = (solicitacao?: Solicitacao) => {
    if (solicitacao) {
      setIsEditing(true);
      setEditingId(solicitacao.id);
      setFormState(solicitacao);
      setSelectedDocIdsInDialog(solicitacao.documentoIds || []);
      if(solicitacao.documentoIds && solicitacao.documentoIds.length > 0) setIsDocumentSelectionVisible(true);
      previousDataAtendimentoRef.current = solicitacao.dataAtendimento;
      previousDataDevolucaoRef.current = solicitacao.dataDevolucao;
    } else {
      resetFormAndDialogState();
      previousDataAtendimentoRef.current = undefined;
      previousDataDevolucaoRef.current = undefined;
    }
    setIsDialogOpen(true);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof Solicitacao) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (id: keyof Solicitacao) => (date?: Date) => {
    const isoDate = date?.toISOString();
    setFormState(prev => ({ ...prev, [id]: isoDate }));
  };


  const handleSaveChanges = () => {
    if (!formState.nomeSolicitante?.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "Nome do solicitante é obrigatório." });
      return;
    }
    if (selectedDocIdsInDialog.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione ao menos um documento." });
      return;
    }
  
    const numeroSolicitacao = `SOL-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  
    let finalStatus: Solicitacao['status'] = 'Pendente';
    if (formState.dataDevolucao) {
      finalStatus = 'Devolvido';
    } else if (formState.dataAtendimento) {
      finalStatus = 'Atendida';
    }
  
    const newSolicitacao: Solicitacao = {
      id: isEditing && editingId ? editingId : `SOL_NEW_${Date.now()}`,
      numeroSolicitacao: isEditing && formState.numeroSolicitacao ? formState.numeroSolicitacao : numeroSolicitacao,
      nomeSolicitante: formState.nomeSolicitante!,
      setorSolicitante: formState.setorSolicitante,
      siglaServidor: formState.siglaServidor,
      matriculaSolicitante: formState.matriculaSolicitante,
      ramal: formState.ramal,
      emailContato: formState.emailContato,
      tipo: formState.tipo || 'Empréstimo',
      dataSolicitacao: formState.dataSolicitacao || new Date().toISOString(),
      dataAtendimento: formState.dataAtendimento,
      dataDevolucao: formState.dataDevolucao,
      documentoIds: selectedDocIdsInDialog,
      status: finalStatus,
      observacoes: formState.observacoes,
    };
  
    if (isEditing && editingId) {
      setSolicitacoes(prev => prev.map(s => s.id === editingId ? newSolicitacao : s));
      toast({ title: "Sucesso", description: "Solicitação atualizada." });
    } else {
      setSolicitacoes(prev => [newSolicitacao, ...prev]);
      toast({ title: "Sucesso", description: `Solicitação ${newSolicitacao.numeroSolicitacao} criada.` });
    }
    setIsDialogOpen(false);
  };
  
  const handleDialogDocFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDialogDocFilters({ searchTerm: value });
  };

  const handleDialogDocSort = (columnId: keyof SimulatedDocumentForSolicitacaoDialog | string) => {
    setDialogDocSortConfig(prev => {
      const existingSortIndex = prev.findIndex(s => s.id === columnId);
      let newSorting = [...prev];
      if (existingSortIndex !== -1) {
        if (newSorting[existingSortIndex].direction === 'asc') newSorting[existingSortIndex].direction = 'desc';
        else newSorting.splice(existingSortIndex, 1);
      } else {
        newSorting = [{ id: columnId, direction: 'asc' }];
      }
      return newSorting;
    });
  };

  const renderDialogDocSortIcon = (columnId: keyof SimulatedDocumentForSolicitacaoDialog | string) => {
    const sortConf = dialogDocSortConfig.find(s => s.id === columnId);
    if (!sortConf) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />;
    return sortConf.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />;
  };

  const numDisplayed = displayedSolicitacoes.length;
  const numSelected = selectedRowIds.length;
  
  const borrowedDocIds = React.useMemo(() => {
    const ids = new Set<string>();
    solicitacoes.forEach(sol => {
      if ((sol.status === 'Pendente' || sol.status === 'Atendida') && (!editingId || sol.id !== editingId)) {
        sol.documentoIds.forEach(docId => ids.add(docId));
      }
    });
    return ids;
  }, [solicitacoes, editingId]);

  const isDocumentSelectable = React.useCallback((doc: SimulatedDocumentForSolicitacaoDialog): boolean => {
    if (doc.status !== 'Arquivado') {
      return false;
    }
    return !borrowedDocIds.has(doc.id);
  }, [borrowedDocIds]);


  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento de Solicitações" description="Cadastre e acompanhe empréstimos e desarquivamentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) resetFormAndDialogState();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">{isEditing ? `Editar Solicitação: ${formState.numeroSolicitacao}` : "Nova Solicitação"}</DialogTitle>
              <DialogDescription>
                Preencha os dados da solicitação. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(80vh-160px)] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 py-4">
                 <div className="space-y-2 lg:col-span-3">
                  <Label htmlFor="tipo">Tipo de Solicitação*</Label>
                  <Select onValueChange={handleSelectChange('tipo')} value={formState.tipo}>
                    <SelectTrigger id="tipo"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empréstimo">Empréstimo</SelectItem>
                      <SelectItem value="Desarquivamento">Desarquivamento</SelectItem>
                    </SelectContent>
                  </Select>
                  {formState.tipo === 'Empréstimo' && (
                      <p className="text-xs text-muted-foreground mt-2">Empréstimo é para quando o documento será somente consultado, sem tramitação.</p>
                  )}
                  {formState.tipo === 'Desarquivamento' && (
                      <p className="text-xs text-muted-foreground mt-2">Essa opção é para quando o documento voltará a tramitar, e implica em nova contagem de prazo após o rearquivamento.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomeSolicitante">Nome Solicitante*</Label>
                  <Input id="nomeSolicitante" value={formState.nomeSolicitante || ""} onChange={handleFormInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setorSolicitante">Setor do Solicitante</Label>
                  <Input id="setorSolicitante" value={formState.setorSolicitante || ""} onChange={handleFormInputChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="siglaServidor">Sigla do Servidor</Label>
                  <Input id="siglaServidor" value={formState.siglaServidor || ""} onChange={handleFormInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matriculaSolicitante">Matrícula</Label>
                  <Input id="matriculaSolicitante" value={formState.matriculaSolicitante || ""} onChange={handleFormInputChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="ramal">Ramal</Label>
                  <Input id="ramal" value={formState.ramal || ""} onChange={handleFormInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContato">E-mail de Contato</Label>
                  <Input id="emailContato" type="email" value={formState.emailContato || ""} onChange={handleFormInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataSolicitacao">Data da Solicitação*</Label>
                  <DateInputPicker 
                    value={formState.dataSolicitacao ? parseISO(formState.dataSolicitacao) : undefined}
                    onChange={(date) => handleDateChange('dataSolicitacao')(date)}
                    placeholder="dd/mm/aaaa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAtendimento">Data de Atendimento</Label>
                  <DateInputPicker 
                    value={formState.dataAtendimento ? parseISO(formState.dataAtendimento) : undefined}
                    onChange={(date) => handleDateChange('dataAtendimento')(date)}
                    placeholder="dd/mm/aaaa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataDevolucao">Data de Devolução</Label>
                  <DateInputPicker 
                    value={formState.dataDevolucao ? parseISO(formState.dataDevolucao) : undefined}
                    onChange={(date) => handleDateChange('dataDevolucao')(date)}
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={formState.observacoes || ""} onChange={handleFormInputChange} rows={2}/>
                </div>
              </div>

              {!isDocumentSelectionVisible && (
                <div className="mt-4 flex justify-center">
                  <Button type="button" onClick={() => setIsDocumentSelectionVisible(true)} variant="outline">
                    <ListFilter className="mr-2 h-4 w-4" /> Selecionar Documentos
                  </Button>
                </div>
              )}

              {isDocumentSelectionVisible && (
                <div className="mt-6">
                  <Label className="text-md font-medium">Documentos Solicitados*</Label>
                  <Card className="mt-2">
                    <CardHeader className="p-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                          name="searchTerm" 
                          placeholder="Pesquisar por nº, tipo, descrição, caixa..." 
                          value={dialogDocFilters.searchTerm} 
                          onChange={handleDialogDocFilterChange}
                          className="w-full"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[250px] w-full border-t">
                        <Table className="min-w-max whitespace-nowrap text-xs">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="py-1 px-2 w-10 sticky left-0 bg-card z-10">
                                <Checkbox
                                  checked={documentsForDialog.length > 0 && documentsForDialog.filter(isDocumentSelectable).length > 0 && documentsForDialog.filter(isDocumentSelectable).every(doc => selectedDocIdsInDialog.includes(doc.id))}
                                  onCheckedChange={(value) => {
                                    const selectableIds = documentsForDialog.filter(isDocumentSelectable).map(d => d.id);
                                    setSelectedDocIdsInDialog(value ? selectableIds : []);
                                  }}
                                  disabled={documentsForDialog.filter(isDocumentSelectable).length === 0}
                                />
                              </TableHead>
                              <TableHead className="py-1 px-2 sticky left-12 bg-card z-10">
                                <Button variant="ghost" onClick={() => handleDialogDocSort('numeroDocumento')} className="px-1 py-0 h-auto -ml-1 text-xs">
                                  Nº Doc {renderDialogDocSortIcon('numeroDocumento')}
                                </Button>
                              </TableHead>
                              <TableHead className="py-1 px-2">
                                <Button variant="ghost" onClick={() => handleDialogDocSort('tipoDocumento')} className="px-1 py-0 h-auto -ml-1 text-xs">
                                  Tipo {renderDialogDocSortIcon('tipoDocumento')}
                                </Button>
                              </TableHead>
                              <TableHead className="py-1 px-2">
                                <Button variant="ghost" onClick={() => handleDialogDocSort('descricaoDocumento')} className="px-1 py-0 h-auto -ml-1 text-xs">
                                  Descrição {renderDialogDocSortIcon('descricaoDocumento')}
                                </Button>
                              </TableHead>
                               <TableHead className="py-1 px-2">
                                <Button variant="ghost" onClick={() => handleDialogDocSort('codigosCaixa')} className="px-1 py-0 h-auto -ml-1 text-xs">
                                  Caixa(s) {renderDialogDocSortIcon('codigosCaixa')}
                                </Button>
                              </TableHead>
                              <TableHead className="py-1 px-2">
                                <Button variant="ghost" onClick={() => handleDialogDocSort('status')} className="px-1 py-0 h-auto -ml-1 text-xs">
                                  Status Acervo {renderDialogDocSortIcon('status')}
                                </Button>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {documentsForDialog.map(doc => {
                              const selectable = isDocumentSelectable(doc);
                              return (
                                <TableRow key={doc.id} className={!selectable && !selectedDocIdsInDialog.includes(doc.id) ? "opacity-50" : ""}>
                                  <TableCell className="py-1 px-2 sticky left-0 bg-card z-10">
                                    <Checkbox 
                                      checked={selectedDocIdsInDialog.includes(doc.id)}
                                      onCheckedChange={(value) => {
                                        setSelectedDocIdsInDialog(prev => value ? [...prev, doc.id] : prev.filter(id => id !== doc.id));
                                      }}
                                      disabled={!selectable}
                                    />
                                  </TableCell>
                                  <TableCell className="py-1 px-2 sticky left-12 bg-card z-10 font-medium">{doc.numeroDocumento || "N/A"}</TableCell>
                                  <TableCell className="py-1 px-2">{doc.tipoDocumento || "N/A"}</TableCell>
                                  <TableCell className="py-1 px-2">
                                    <span className="block max-w-xs truncate" title={doc.descricaoDocumento || ""}>
                                      {doc.descricaoDocumento || "N/A"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-1 px-2">{doc.codigosCaixa || "N/A"}</TableCell>
                                  <TableCell className="py-1 px-2">
                                    <Badge variant={
                                        doc.status === 'Arquivado' ? 'secondary' :
                                        doc.status === 'Emprestado' ? 'default' :
                                        doc.status === 'Eliminado' ? 'destructive' :
                                        doc.status === 'Desarquivado' ? 'destructive' :
                                        'outline'
                                      }
                                      className={
                                        doc.status === 'Emprestado' ? 'border-transparent bg-orange-500 text-orange-50 hover:bg-orange-500/80 dark:bg-orange-600 dark:text-orange-50 dark:hover:bg-orange-600/80' :
                                        doc.status === 'Desarquivado' ? 'border-transparent bg-purple-500 text-purple-50 hover:bg-purple-500/80 dark:bg-purple-600 dark:text-purple-50 dark:hover:bg-purple-600/80' :
                                        doc.status === 'Aguardando prazo para eliminação' ? 'border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80 dark:bg-yellow-500 dark:text-yellow-50 dark:hover:bg-yellow-500/80' :
                                        doc.status === 'Arquivado' ? 'border-transparent bg-green-500 text-green-50 hover:bg-green-500/80 dark:bg-green-600 dark:text-green-50 dark:hover:bg-green-600/80' : ''
                                      }
                                    >
                                      {doc.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            {documentsForDialog.length === 0 && (
                              <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum documento encontrado.</TableCell></TableRow>
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
              <Button type="button" onClick={handleSaveChanges}>Salvar Solicitação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      numDisplayed > 0 && numSelected === numDisplayed
                        ? true
                        : numSelected > 0 ? 'indeterminate' : false
                    }
                    onCheckedChange={(value) => {
                      if (value === true) {
                        setSelectedRowIds(displayedSolicitacoes.map(item => item.id));
                      } else {
                        setSelectedRowIds([]);
                      }
                    }}
                    aria-label="Selecionar todas as linhas"
                  />
                </TableHead>
                <TableHead>Nº Solicitação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data Solicitação</TableHead>
                <TableHead>Qtd. Docs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSolicitacoes.map((item) => (
                <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRowIds.includes(item.id)}
                      onCheckedChange={(value) => {
                        setSelectedRowIds(prev =>
                          value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                        );
                      }}
                      aria-label={`Selecionar solicitação ${item.numeroSolicitacao}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.numeroSolicitacao}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.nomeSolicitante}</TableCell>
                  <TableCell>
                    <ClientSideDateFormatter isoDateString={item.dataSolicitacao} />
                  </TableCell>
                  <TableCell>{item.documentoIds.length}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.status === 'Pendente' ? 'default' :
                        item.status === 'Atendida' ? 'secondary' :
                        item.status === 'Devolvido' ? 'outline' : 'destructive' 
                      }
                      className={
                        item.status === 'Pendente' ? 'border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80 dark:bg-yellow-500 dark:text-yellow-50 dark:hover:bg-yellow-500/80' :
                        item.status === 'Atendida' ? 'border-transparent bg-green-500 text-green-50 hover:bg-green-500/80 dark:bg-green-600 dark:text-green-50 dark:hover:bg-green-600/80' :
                        item.status === 'Devolvido' ? 'border-transparent bg-blue-500 text-blue-50 hover:bg-blue-500/80 dark:bg-blue-600 dark:text-blue-50 dark:hover:bg-blue-600/80' :
                        item.status === 'Cancelada' ? 'border-transparent bg-red-500 text-red-50 hover:bg-red-500/80 dark:bg-red-600 dark:text-red-50 dark:hover:bg-red-600/80' : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Editar Solicitação" onClick={() => handleOpenDialog(item)} >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Editar Solicitação</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Solicitação">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Excluir Solicitação</p></TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {displayedSolicitacoes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma solicitação encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
