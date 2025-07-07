

"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ListagemEliminacao } from "@/types";
import { PlusCircle, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { DateInputPicker } from "@/components/date-input-picker";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { simulatedListagensData } from "@/lib/mock-data";
import { parseISO } from "date-fns";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';

const initialFormState: Partial<ListagemEliminacao> = {
  numeroListagem: "",
  documentoIds: [],
  numeroEditalCiencia: "",
  dataPublicacaoEdital: undefined,
  dataProducaoListagem: new Date().toISOString(),
  numeroTermoEliminacao: "",
  dataProducaoTermoEliminacao: undefined,
  tipoListagem: 'Documentos',
  unidadeSetor: '',
  observacoes: "",
};

type SortConfig = { id: keyof ListagemEliminacao | 'status' | 'qtdDocumentos'; direction: 'asc' | 'desc' };


export default function ListagensEliminacaoPage() {
  const { toast } = useToast();
  const { permissions } = useUserSession();
  const [listagens, setListagens] = React.useState<ListagemEliminacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<ListagemEliminacao>>(initialFormState);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingListagemId, setEditingListagemId] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
      setListagens(stored ? JSON.parse(stored) : simulatedListagensData);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setListagens(simulatedListagensData);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      window.localStorage.setItem(LISTAGENS_STORAGE_KEY, JSON.stringify(listagens));
    }
  }, [listagens, isDataLoaded]);

  const getStatus = React.useCallback((item: ListagemEliminacao) => {
    if (item.dataProducaoTermoEliminacao) return "Efetivada";
    if (item.dataPublicacaoEdital) return "Edital Publicado";
    return "Tramitando";
  }, []);

  const displayedListagens = React.useMemo(() => {
    let itemsToDisplay = listagens.filter(item =>
      item.numeroListagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sorting.length > 0) {
      itemsToDisplay.sort((a, b) => {
        for (const sortConfig of sorting) {
          let valA: any, valB: any;
          if (sortConfig.id === 'status') {
            valA = getStatus(a);
            valB = getStatus(b);
          } else if (sortConfig.id === 'qtdDocumentos') {
            valA = a.documentoIds?.length || 0;
            valB = b.documentoIds?.length || 0;
          } else {
            valA = a[sortConfig.id as keyof ListagemEliminacao];
            valB = b[sortConfig.id as keyof ListagemEliminacao];
          }

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
    return itemsToDisplay;
  }, [listagens, searchTerm, sorting, getStatus]);

  const handleSort = (columnId: keyof ListagemEliminacao | 'status' | 'qtdDocumentos') => {
    setSorting(prevSorting => {
      const existingSortIndex = prevSorting.findIndex(s => s.id === columnId);
      let newSorting: SortConfig[] = [...prevSorting];

      if (existingSortIndex !== -1) {
        if (newSorting[existingSortIndex].direction === 'asc') {
          newSorting[existingSortIndex].direction = 'desc';
        } else {
          newSorting.splice(existingSortIndex, 1);
        }
      } else {
        newSorting = [{ id: columnId, direction: 'asc' }];
      }
      return newSorting;
    });
  };

  const renderSortIcon = (columnId: keyof ListagemEliminacao | 'status' | 'qtdDocumentos') => {
    const sortConfig = sorting.find(s => s.id === columnId);
    if (!sortConfig) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const resetFormAndDialogState = () => {
    setFormState({ ...initialFormState, dataProducaoListagem: new Date().toISOString() });
    setIsEditing(false);
    setEditingListagemId(null);
  };

  const handleOpenDialog = (listagem?: ListagemEliminacao) => {
    if (listagem) {
      setIsEditing(true);
      setEditingListagemId(listagem.id);
      setFormState({
        ...initialFormState,
        ...listagem,
        dataProducaoListagem: listagem.dataProducaoListagem || new Date().toISOString(),
      });
    } else {
      resetFormAndDialogState();
    }
    setIsDialogOpen(true);
  };
  
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };
  
  const handleDateChange = (id: keyof ListagemEliminacao) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));
  };

  const handleSelectChange = (id: keyof ListagemEliminacao) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };


  const handleSaveChanges = () => {
    if (!formState.numeroListagem) {
      toast({ variant: "destructive", title: "Erro", description: "O número da listagem é obrigatório." });
      return;
    }

    const listagemDataToSave: ListagemEliminacao = {
      id: isEditing && editingListagemId ? editingListagemId : `LE${Date.now()}`,
      numeroListagem: formState.numeroListagem,
      documentoIds: isEditing ? (formState.documentoIds || []) : [], // Preserve IDs on edit, new is empty
      numeroEditalCiencia: formState.numeroEditalCiencia,
      dataPublicacaoEdital: formState.dataPublicacaoEdital,
      dataProducaoListagem: formState.dataProducaoListagem || new Date().toISOString(),
      numeroTermoEliminacao: formState.numeroTermoEliminacao,
      dataProducaoTermoEliminacao: formState.dataProducaoTermoEliminacao,
      tipoListagem: formState.tipoListagem || 'Documentos',
      unidadeSetor: formState.unidadeSetor,
      observacoes: formState.observacoes,
    };

    if (isEditing && editingListagemId) {
      setListagens(prev => prev.map(l => l.id === editingListagemId ? listagemDataToSave : l));
    } else {
      setListagens(prev => [...prev, listagemDataToSave]);
    }

    setIsDialogOpen(false);
    toast({ title: "Sucesso!", description: `Listagem ${isEditing ? 'atualizada' : 'criada'} com sucesso.` });
  };
  
  const handleDelete = (id: string) => {
    setListagens(prev => prev.filter(l => l.id !== id));
    toast({ title: "Sucesso!", description: `Listagem ${id} foi excluída.` });
  };
  
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Listagens de Eliminação" description="Crie e gerencie as listagens para eliminação de documentos.">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Listagem
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Listagens Cadastradas</CardTitle>
          <div className="mt-2">
            <Input 
              placeholder="Buscar por Nº da Listagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[65vh] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('numeroListagem')}>Nº Listagem {renderSortIcon('numeroListagem')}</Button></TableHead>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('status')}>Status {renderSortIcon('status')}</Button></TableHead>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('tipoListagem')}>Tipo {renderSortIcon('tipoListagem')}</Button></TableHead>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('unidadeSetor')}>Unidade/Setor {renderSortIcon('unidadeSetor')}</Button></TableHead>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('dataProducaoListagem')}>Data Produção {renderSortIcon('dataProducaoListagem')}</Button></TableHead>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('qtdDocumentos')}>Qtd. Docs {renderSortIcon('qtdDocumentos')}</Button></TableHead>
                  <TableHead><Button variant="ghost" className="px-1" onClick={() => handleSort('dataPublicacaoEdital')}>Data Pub. Edital {renderSortIcon('dataPublicacaoEdital')}</Button></TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedListagens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link href={`/documentos?listagemDocIds=${encodeURIComponent(item.documentoIds.join(','))}&numeroListagem=${encodeURIComponent(item.numeroListagem)}`} passHref>
                        <span className="text-primary hover:underline font-medium">{item.numeroListagem}</span>
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant={ getStatus(item) === 'Efetivada' ? 'destructive' : getStatus(item) === 'Edital Publicado' ? 'default' : 'secondary'}>{getStatus(item)}</Badge></TableCell>
                    <TableCell>{item.tipoListagem || 'N/A'}</TableCell>
                    <TableCell>{item.unidadeSetor || 'N/A'}</TableCell>
                    <TableCell><ClientSideDateFormatter isoDateString={item.dataProducaoListagem} /></TableCell>
                    <TableCell>{item.documentoIds?.length || 0}</TableCell>
                    <TableCell><ClientSideDateFormatter isoDateString={item.dataPublicacaoEdital} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive" disabled={!permissions.exclusaoDados}><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A listagem "{item.numeroListagem}" será excluída permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>Sim, excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetFormAndDialogState(); setIsDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">{isEditing ? 'Editar Listagem' : 'Nova Listagem de Eliminação'}</DialogTitle>
            <DialogDescription>
              Preencha os metadados da listagem. A adição de documentos é feita na tela de Acervo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="numeroListagem">Nº Listagem*</Label>
              <Input id="numeroListagem" value={formState.numeroListagem || ''} onChange={handleFormInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="unidadeSetor">Unidade/Setor</Label>
              <Input id="unidadeSetor" value={formState.unidadeSetor || ''} onChange={handleFormInputChange} />
            </div>
            <div className="md:col-span-2 space-y-2">
                <Label htmlFor="tipoListagem">Tipo de Listagem de Eliminação</Label>
                <Select onValueChange={(value) => handleSelectChange('tipoListagem')(value as ListagemEliminacao['tipoListagem'])} value={formState.tipoListagem}>
                    <SelectTrigger id="tipoListagem">
                    <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Documentos">Documentos</SelectItem>
                        <SelectItem value="Processos Administrativos">Processos Administrativos</SelectItem>
                        <SelectItem value="Processos Judiciais">Processos Judiciais</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataProducaoListagem">Data Produção*</Label>
              <DateInputPicker value={formState.dataProducaoListagem ? parseISO(formState.dataProducaoListagem) : undefined} onChange={(date) => handleDateChange('dataProducaoListagem')(date)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroEditalCiencia">Nº Edital Ciência</Label>
              <Input id="numeroEditalCiencia" value={formState.numeroEditalCiencia || ''} onChange={handleFormInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataPublicacaoEdital">Data Pub. Edital</Label>
              <DateInputPicker value={formState.dataPublicacaoEdital ? parseISO(formState.dataPublicacaoEdital) : undefined} onChange={(date) => handleDateChange('dataPublicacaoEdital')(date)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroTermoEliminacao">Nº Termo Eliminação</Label>
              <Input id="numeroTermoEliminacao" value={formState.numeroTermoEliminacao || ''} onChange={handleFormInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataProducaoTermoEliminacao">Data Prod. Termo</Label>
              <DateInputPicker value={formState.dataProducaoTermoEliminacao ? parseISO(formState.dataProducaoTermoEliminacao) : undefined} onChange={(date) => handleDateChange('dataProducaoTermoEliminacao')(date)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" value={formState.observacoes || ''} onChange={handleFormInputChange} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleSaveChanges}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

