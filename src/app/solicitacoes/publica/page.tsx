
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Solicitacao, Documento } from "@/types";
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, ListFilter, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateInputPicker } from "@/components/date-input-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  placeholderSolicitacoesInitial, 
  placeholderDocumentos, 
  simulatedListagensData,
  type SimulatedDocumentForSolicitacaoDialog
} from "@/lib/mock-data";
import { parseISO } from "date-fns";


const SOLICITACOES_STORAGE_KEY = 'arquivocentral_solicitacoes';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';

const initialFormState: Partial<Solicitacao> = {
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

export default function PublicSolicitacaoPage() {
  const { toast } = useToast();
  const [allSolicitacoes, setAllSolicitacoes] = React.useState<Solicitacao[]>([]);
  const [formState, setFormState] = React.useState<Partial<Solicitacao>>(initialFormState);

  const [acervoDocs, setAcervoDocs] = React.useState<SimulatedDocumentForSolicitacaoDialog[]>([]);
  const [documentsForDialog, setDocumentsForDialog] = React.useState<SimulatedDocumentForSolicitacaoDialog[]>([]);
  const [selectedDocIdsInDialog, setSelectedDocIdsInDialog] = React.useState<string[]>([]);
  
  const [dialogDocFilters, setDialogDocFilters] = React.useState<DialogDocFilters>({ searchTerm: "" });
  const [dialogDocSortConfig, setDialogDocSortConfig] = React.useState<DialogDocSortConfig[]>([]);
  const [isDocumentSelectionVisible, setIsDocumentSelectionVisible] = React.useState(true); // Default to true for public page

  React.useEffect(() => {
    try {
      const storedSolicitacoes = window.localStorage.getItem(SOLICITACOES_STORAGE_KEY);
      setAllSolicitacoes(storedSolicitacoes ? JSON.parse(storedSolicitacoes) : placeholderSolicitacoesInitial);

      const storedDocumentos = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      const baseDocs = storedDocumentos ? JSON.parse(storedDocumentos) : placeholderDocumentos;
      
      const activeLoanMap = new Map<string, Solicitacao['tipo']>();
      (storedSolicitacoes ? JSON.parse(storedSolicitacoes) : placeholderSolicitacoesInitial).forEach((sol: Solicitacao) => {
        if (sol.dataAtendimento && !sol.dataDevolucao) {
          sol.documentoIds.forEach(docId => activeLoanMap.set(docId, sol.tipo));
        }
      });

      const processedDocs = baseDocs.map((originalDoc: Documento) => {
        let doc = { ...originalDoc };
        let currentDocStatus = doc.status;
        let isEliminated = false;

        if (doc.numeroListagemEliminacao) {
          const listagem = simulatedListagensData.find(l => l.numeroListagem === doc.numeroListagemEliminacao);
          if (listagem?.documentoIds?.includes(doc.id)) {
            if (listagem.dataProducaoTermoEliminacao) currentDocStatus = "Eliminado";
            else if (listagem.dataPublicacaoEdital) currentDocStatus = "Aguardando prazo para eliminação";
          }
        }
        
        if (!isEliminated && (currentDocStatus === 'Arquivado' || currentDocStatus === 'Aguardando prazo para eliminação') && activeLoanMap.has(doc.id)) {
          const tipoSolicitacao = activeLoanMap.get(doc.id);
          currentDocStatus = tipoSolicitacao === 'Empréstimo' ? 'Emprestado' : 'Desarquivado';
        }
        doc.status = currentDocStatus as Documento['status'];
        return doc;
      });

      setAcervoDocs(processedDocs);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }
  }, []);

  const borrowedDocIds = React.useMemo(() => {
    const ids = new Set<string>();
    allSolicitacoes.forEach(sol => {
      if (sol.status === 'Pendente' || sol.status === 'Atendida') {
        sol.documentoIds.forEach(docId => ids.add(docId));
      }
    });
    return ids;
  }, [allSolicitacoes]);

  const isDocumentSelectable = React.useCallback((doc: SimulatedDocumentForSolicitacaoDialog): boolean => {
    if (doc.status !== 'Arquivado') return false;
    return !borrowedDocIds.has(doc.id);
  }, [borrowedDocIds]);

  React.useEffect(() => {
    const lowerSearchTerm = dialogDocFilters.searchTerm.toLowerCase();
    
    let filteredDocs = acervoDocs.filter(doc => {
      if (selectedDocIdsInDialog.includes(doc.id)) return true;
      if (!isDocumentSelectable(doc)) return false;
      if (!lowerSearchTerm) return true;

      return (
        doc.numeroDocumento?.toLowerCase().includes(lowerSearchTerm) ||
        doc.tipoDocumento?.toLowerCase().includes(lowerSearchTerm) ||
        doc.descricaoDocumento?.toLowerCase().includes(lowerSearchTerm) ||
        doc.codigosCaixa?.toLowerCase().includes(lowerSearchTerm)
      );
    });

    if (dialogDocSortConfig.length > 0) {
      filteredDocs.sort((a, b) => {
        for (const sortConf of dialogDocSortConfig) {
          const valA = (a as any)[sortConf.id];
          const valB = (b as any)[sortConf.id];
          let comparisonResult = String(valA || '').toLowerCase().localeCompare(String(valB || '').toLowerCase());
          if (comparisonResult !== 0) return sortConf.direction === 'asc' ? comparisonResult : -comparisonResult;
        }
        return 0;
      });
    }
    setDocumentsForDialog(filteredDocs);
  }, [dialogDocFilters, dialogDocSortConfig, acervoDocs, selectedDocIdsInDialog, isDocumentSelectable]);

  const resetForm = () => {
    setFormState({ ...initialFormState, dataSolicitacao: new Date().toISOString() });
    setSelectedDocIdsInDialog([]);
    setDialogDocFilters({ searchTerm: "" });
    setDialogDocSortConfig([]);
    setIsDocumentSelectionVisible(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, [e.target.id]: e.target.value }));
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
  
    const newSolicitacao: Solicitacao = {
      id: `SOL_PUB_${Date.now()}`,
      numeroSolicitacao,
      nomeSolicitante: formState.nomeSolicitante!,
      setorSolicitante: formState.setorSolicitante,
      siglaServidor: formState.siglaServidor,
      matriculaSolicitante: formState.matriculaSolicitante,
      ramal: formState.ramal,
      emailContato: formState.emailContato,
      tipo: formState.tipo || 'Empréstimo',
      dataSolicitacao: formState.dataSolicitacao || new Date().toISOString(),
      documentoIds: selectedDocIdsInDialog,
      status: 'Pendente',
      observacoes: formState.observacoes,
    };
  
    try {
        const updatedSolicitacoes = [...allSolicitacoes, newSolicitacao];
        window.localStorage.setItem(SOLICITACOES_STORAGE_KEY, JSON.stringify(updatedSolicitacoes));
        setAllSolicitacoes(updatedSolicitacoes);
        toast({ title: "Sucesso", description: `Sua solicitação (${numeroSolicitacao}) foi enviada e está pendente de atendimento.` });
        resetForm();
    } catch (error) {
        console.error("Failed to save to localStorage:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar a solicitação." });
    }
  };

  const handleDialogDocSort = (columnId: string) => {
    setDialogDocSortConfig(prev => {
      const existing = prev.find(s => s.id === columnId);
      if (existing) {
        if (existing.direction === 'asc') return [{ id: columnId, direction: 'desc' }];
        return [];
      }
      return [{ id: columnId, direction: 'asc' }];
    });
  };

  const renderDialogDocSortIcon = (columnId: string) => {
    const sortConf = dialogDocSortConfig.find(s => s.id === columnId);
    if (!sortConf) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />;
    return sortConf.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />;
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <PageHeader title="Nova Solicitação Pública" description="Preencha o formulário para solicitar documentos do acervo.">
          <Link href="/login" passHref>
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login</Button>
          </Link>
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>Dados da Solicitação</CardTitle>
            <CardDescription>Campos com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
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
                  <Label htmlFor="nomeSolicitante">Nome Completo*</Label>
                  <Input id="nomeSolicitante" value={formState.nomeSolicitante || ""} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="setorSolicitante">Setor do Solicitante</Label>
                  <Input id="setorSolicitante" value={formState.setorSolicitante || ""} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="siglaServidor">Sigla do Servidor</Label>
                  <Input id="siglaServidor" value={formState.siglaServidor || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matriculaSolicitante">Matrícula</Label>
                  <Input id="matriculaSolicitante" value={formState.matriculaSolicitante || ""} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="ramal">Ramal</Label>
                  <Input id="ramal" value={formState.ramal || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContato">E-mail de Contato</Label>
                  <Input id="emailContato" type="email" value={formState.emailContato || ""} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataSolicitacao">Data da Solicitação*</Label>
                  <DateInputPicker 
                    value={formState.dataSolicitacao ? parseISO(formState.dataSolicitacao) : undefined}
                    onChange={(date) => handleDateChange('dataSolicitacao')(date)}
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={formState.observacoes || ""} onChange={handleInputChange} rows={2} placeholder="Descreva o motivo da solicitação ou outras informações relevantes."/>
                </div>
            </div>

            <div className="mt-6">
              <Label className="text-md font-medium">Documentos para Solicitar*</Label>
              <Card className="mt-2">
                <CardHeader className="p-4">
                  <Input 
                    placeholder="Pesquisar em documentos disponíveis por nº, tipo, descrição, caixa..." 
                    value={dialogDocFilters.searchTerm} 
                    onChange={(e) => setDialogDocFilters({searchTerm: e.target.value})}
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px] w-full border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"><Checkbox onCheckedChange={(checked) => setSelectedDocIdsInDialog(checked ? documentsForDialog.filter(isDocumentSelectable).map(d => d.id) : [])} /></TableHead>
                          <TableHead><Button variant="ghost" onClick={() => handleDialogDocSort('numeroDocumento')}>Nº Doc {renderDialogDocSortIcon('numeroDocumento')}</Button></TableHead>
                          <TableHead><Button variant="ghost" onClick={() => handleDialogDocSort('tipoDocumento')}>Tipo {renderDialogDocSortIcon('tipoDocumento')}</Button></TableHead>
                          <TableHead><Button variant="ghost" onClick={() => handleDialogDocSort('descricaoDocumento')}>Descrição {renderDialogDocSortIcon('descricaoDocumento')}</Button></TableHead>
                          <TableHead><Button variant="ghost" onClick={() => handleDialogDocSort('codigosCaixa')}>Caixa(s) {renderDialogDocSortIcon('codigosCaixa')}</Button></TableHead>
                          <TableHead><Button variant="ghost" onClick={() => handleDialogDocSort('status')}>Status {renderDialogDocSortIcon('status')}</Button></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentsForDialog.length > 0 ? documentsForDialog.map(doc => {
                          const selectable = isDocumentSelectable(doc);
                          return (
                            <TableRow key={doc.id} data-state={selectedDocIdsInDialog.includes(doc.id) ? "selected" : ""}>
                              <TableCell><Checkbox checked={selectedDocIdsInDialog.includes(doc.id)} onCheckedChange={(checked) => setSelectedDocIdsInDialog(p => checked ? [...p, doc.id] : p.filter(id => id !== doc.id))} disabled={!selectable} /></TableCell>
                              <TableCell>{doc.numeroDocumento || "N/A"}</TableCell>
                              <TableCell>{doc.tipoDocumento || "N/A"}</TableCell>
                              <TableCell><span className="block max-w-xs truncate" title={doc.descricaoDocumento}>{doc.descricaoDocumento || "N/A"}</span></TableCell>
                              <TableCell>{doc.codigosCaixa || "N/A"}</TableCell>
                              <TableCell><Badge variant={doc.status !== 'Arquivado' ? 'destructive' : 'secondary'}>{doc.status}</Badge></TableCell>
                            </TableRow>
                          )
                        }) : <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum documento disponível encontrado.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveChanges} size="lg"><Send className="mr-2 h-4 w-4" /> Enviar Solicitação</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    