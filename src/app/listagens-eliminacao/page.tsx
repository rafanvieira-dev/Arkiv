
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { ListagemEliminacao } from "@/types";
import { PlusCircle, Edit, Trash2, FileSearch, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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


const placeholderListagensInitial: ListagemEliminacao[] = [
  { id: "LE001", numeroListagem: "LE-2023-001", documentoIds: ["DOC001", "DOC003"], numeroEditalCiencia: "EDITAL-005/2023", dataPublicacaoEdital: new Date("2023-10-15").toISOString(), dataProducaoListagem: new Date("2023-09-30").toISOString(), numeroTermoEliminacao: "TE-2023-001", dataProducaoTermoEliminacao: new Date("2023-11-01").toISOString() },
  { id: "LE002", numeroListagem: "LE-2024-001", documentoIds: ["DOC00X", "DOC00Y"], dataProducaoListagem: new Date("2024-02-10").toISOString() },
];

const initialFormState: Partial<ListagemEliminacao> & { documentoIdsInput?: string } = {
  numeroListagem: "",
  documentoIdsInput: "", 
  documentoIds: [],
  numeroEditalCiencia: "",
  dataPublicacaoEdital: undefined,
  dataProducaoListagem: new Date().toISOString(), // Default to current date for new listings
  numeroTermoEliminacao: "",
  dataProducaoTermoEliminacao: undefined,
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };

export default function ListagensEliminacaoPage() {
  const [listagens, setListagens] = React.useState<ListagemEliminacao[]>(placeholderListagensInitial);
  const [displayedListagens, setDisplayedListagens] = React.useState<ListagemEliminacao[]>(placeholderListagensInitial);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<ListagemEliminacao> & { documentoIdsInput?: string }>(initialFormState);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingListagemId, setEditingListagemId] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);

  const resetFormAndDialogState = () => {
    setFormState({...initialFormState, dataProducaoListagem: new Date().toISOString()});
    setIsEditing(false);
    setEditingListagemId(null);
  };

  const handleOpenDialog = (listagem?: ListagemEliminacao) => {
    if (listagem) {
      setIsEditing(true);
      setEditingListagemId(listagem.id);
      setFormState({
        ...listagem,
        documentoIdsInput: listagem.documentoIds.join(', '),
      });
    } else {
      resetFormAndDialogState();
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (id: keyof ListagemEliminacao) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));

    if (id === 'dataPublicacaoEdital' && date) {
      const docIds = formState.documentoIdsInput?.split(',').map(docId => docId.trim()).filter(docId => docId) || [];
      if (docIds.length > 0) {
        console.warn(`[SIMULAÇÃO] Os seguintes documentos teriam seu status alterado para "Aguardando prazo para Eliminação": ${docIds.join(', ')}. A atualização real do status dos documentos requer integração com a fonte de dados dos documentos.`);
      }
    }
    if (id === 'dataProducaoTermoEliminacao' && date) {
       const docIds = formState.documentoIdsInput?.split(',').map(docId => docId.trim()).filter(docId => docId) || [];
      if (docIds.length > 0) {
        console.warn(`[SIMULAÇÃO] Os seguintes documentos teriam seu status alterado para "Eliminado": ${docIds.join(', ')}. A atualização real do status dos documentos requer integração com a fonte de dados dos documentos.`);
      }
    }
  };
  
  const handleSaveChanges = () => {
    const documentoIdsArray = formState.documentoIdsInput?.split(',').map(id => id.trim()).filter(id => id) || [];

    const listagemDataToSave: ListagemEliminacao = {
      id: isEditing && editingListagemId ? editingListagemId : `LE${Date.now()}`,
      numeroListagem: formState.numeroListagem || "",
      documentoIds: documentoIdsArray,
      numeroEditalCiencia: formState.numeroEditalCiencia,
      dataPublicacaoEdital: formState.dataPublicacaoEdital,
      dataProducaoListagem: formState.dataProducaoListagem || new Date().toISOString(),
      numeroTermoEliminacao: formState.numeroTermoEliminacao,
      dataProducaoTermoEliminacao: formState.dataProducaoTermoEliminacao,
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
    switch (columnId) {
      case 'numeroListagem': return item.numeroListagem;
      case 'dataProducaoListagem': return item.dataProducaoListagem ? parseISO(item.dataProducaoListagem) : null;
      case 'numeroEditalCiencia': return item.numeroEditalCiencia;
      case 'dataPublicacaoEdital': return item.dataPublicacaoEdital ? parseISO(item.dataPublicacaoEdital) : null;
      case 'numeroTermoEliminacao': return item.numeroTermoEliminacao;
      case 'dataProducaoTermoEliminacao': return item.dataProducaoTermoEliminacao ? parseISO(item.dataProducaoTermoEliminacao) : null;
      case 'qtdDocumentos': return Array.isArray(item.documentoIds) ? item.documentoIds.length : 0;
      default: return null;
    }
  };

  React.useEffect(() => {
    let sortedListagens = [...listagens];
    if (sorting.length > 0) {
      sortedListagens.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = getSortableValue(a, sortConfig.id);
          const valB = getSortableValue(b, sortConfig.id);
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
    // Placeholder for delete functionality
    console.log("Excluir listagem:", listagemId);
    // setListagens(prev => prev.filter(l => l.id !== listagemId));
  };

  const numDisplayed = displayedListagens.length;
  const numSelected = selectedRowIds.length;

  const columns = [
    { id: 'numeroListagem', header: 'Nº Listagem', enableSorting: true },
    { id: 'dataProducaoListagem', header: 'Data Prod. Listagem', enableSorting: true, cellFormatter: (dateStr: string) => dateStr && isValid(parseISO(dateStr)) ? format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR }) : "N/A" },
    { id: 'qtdDocumentos', header: 'Qtd. Docs', enableSorting: true, cellFormatter: (_value: any, item: ListagemEliminacao) => Array.isArray(item.documentoIds) ? item.documentoIds.length : 0 },
    { id: 'numeroEditalCiencia', header: 'Nº Edital', enableSorting: true },
    { id: 'dataPublicacaoEdital', header: 'Data Pub. Edital', enableSorting: true, cellFormatter: (dateStr?: string) => dateStr && isValid(parseISO(dateStr)) ? format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR }) : "N/A" },
    { id: 'numeroTermoEliminacao', header: 'Nº Termo Elim.', enableSorting: true },
    { id: 'dataProducaoTermoEliminacao', header: 'Data Prod. Termo', enableSorting: true, cellFormatter: (dateStr?: string) => dateStr && isValid(parseISO(dateStr)) ? format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR }) : "N/A" },
  ];

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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">{isEditing ? "Editar Listagem" : "Nova Listagem de Eliminação"}</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroListagem" className="text-right col-span-1">Nº Listagem*</Label>
                <Input id="numeroListagem" value={formState.numeroListagem || ""} onChange={handleInputChange} className="col-span-3" placeholder="Ex: LE-2024-001" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataProducaoListagem" className="text-right col-span-1">Data Prod. Listagem*</Label>
                <DatePicker
                  date={formState.dataProducaoListagem ? parseISO(formState.dataProducaoListagem) : undefined}
                  setDate={(date) => handleDateChange('dataProducaoListagem')(date)}
                  placeholder="Selecione a data"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="documentoIdsInput" className="text-right col-span-1 pt-2">IDs dos Documentos*</Label>
                <Textarea id="documentoIdsInput" value={formState.documentoIdsInput || ""} onChange={handleInputChange} className="col-span-3" placeholder="IDs separados por vírgula (Ex: DOC001, DOC002)" rows={3} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroEditalCiencia" className="text-right col-span-1">Nº Edital Ciência</Label>
                <Input id="numeroEditalCiencia" value={formState.numeroEditalCiencia || ""} onChange={handleInputChange} className="col-span-3" placeholder="Ex: EDITAL-001/2024" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataPublicacaoEdital" className="text-right col-span-1">Data Pub. Edital</Label>
                 <DatePicker
                  date={formState.dataPublicacaoEdital ? parseISO(formState.dataPublicacaoEdital) : undefined}
                  setDate={(date) => handleDateChange('dataPublicacaoEdital')(date)}
                  placeholder="Selecione a data"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroTermoEliminacao" className="text-right col-span-1">Nº Termo Eliminação</Label>
                <Input id="numeroTermoEliminacao" value={formState.numeroTermoEliminacao || ""} onChange={handleInputChange} className="col-span-3" placeholder="Ex: TE-2024-001" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataProducaoTermoEliminacao" className="text-right col-span-1">Data Prod. Termo</Label>
                 <DatePicker
                  date={formState.dataProducaoTermoEliminacao ? parseISO(formState.dataProducaoTermoEliminacao) : undefined}
                  setDate={(date) => handleDateChange('dataProducaoTermoEliminacao')(date)}
                  placeholder="Selecione a data"
                  className="col-span-3"
                />
              </div>
            </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Listagem</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Listagens Cadastradas</CardTitle>
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
                  {columns.map(col => (
                    <TableHead key={col.id} className="py-2 px-3">
                      {col.enableSorting ? (
                        <Button variant="ghost" onClick={() => handleSort(col.id)} className="px-1 py-1 h-auto -ml-2">
                          {col.header}
                          {renderSortIcon(col.id)}
                        </Button>
                      ) : col.header}
                    </TableHead>
                  ))}
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
                    {columns.map(col => (
                      <TableCell key={`${item.id}-${col.id}`} className="py-2 px-3">
                        {col.cellFormatter ? col.cellFormatter((item as any)[col.id], item) : (item as any)[col.id] || "N/A"}
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                       <div className="flex items-center justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Ver Detalhes da Listagem">
                                <FileSearch className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Ver Detalhes da Listagem</p></TooltipContent>
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

