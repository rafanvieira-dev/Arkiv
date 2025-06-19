
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Classificacao } from "@/types";
import { PlusCircle, Edit, Trash2, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const placeholderClassificacoesInitial: Classificacao[] = [
  { id: "CLA001", tipoPlanoClassificacao: "Judicial", codigo: "020.1", descricao: "Processos Judiciais Cíveis", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 5, prazoGuardaFaseCorrenteCondicaoTextual: undefined, prazoGuardaFaseIntermediariaAnos: 15, destinacaoFinal: "Guarda Permanente", observacoes: "Manter cópia digitalizada", inativo: false },
  { id: "CLA002", tipoPlanoClassificacao: "Administrativo", codigo: "030.5", descricao: "Correspondências Recebidas", tipoPrazoFaseCorrente: "Condição Textual", prazoGuardaFaseCorrenteAnos: undefined, prazoGuardaFaseCorrenteCondicaoTextual: "Até a próxima atualização", prazoGuardaFaseIntermediariaAnos: 3, destinacaoFinal: "Eliminação", observacoes: "", inativo: true },
  { id: "CLA003", tipoPlanoClassificacao: "Administrativo", codigo: "045.2", descricao: "Relatórios Anuais", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 1, prazoGuardaFaseCorrenteCondicaoTextual: undefined, prazoGuardaFaseIntermediariaAnos: 0, destinacaoFinal: "Guarda Permanente", observacoes: "Manter permanentemente na fase intermediária", inativo: false },
];

const opcoesCondicaoTextualFaseCorrente = [
  "3 anos após o encerramento",
  "Após aprovação das contas pelo TCU",
  "Até a aposentadoria ou o desligamento",
  "Até a atualização",
  "Até a conclusão da apuração",
  "Até a devolução do bem",
  "Até a homologação do Concurso",
  "Até a informatização ou alienação",
  "Até a posse",
  "Até a próxima atualização",
  "Até a publicação",
  "Até a quitação da dívida",
  "Até devolução",
  "Até devolução dos autos",
  "Até o desfazimento do bem",
  "Até o desligamento do estagiário",
  "Até o desligamento do servidor ou, em caso de haver pensionista(s), 5 anos após o falecimento do último beneficiário",
  "Até o encerramento",
  "Até o encerramento do processo de execução penal",
  "Até o vitaliciamento",
  "Até vigência",
  "Até vigência do contrato ou julgamento TCU",
  "Durante a vigência",
  "Durante o prazo da licitação",
  "Eliminação no momento do recebimento",
  "Enquanto durar a ocupação",
  "Enquanto durar o período de prova",
  "Enquanto durar sessão de julgamento",
  "Enquanto o bem estiver alienado",
  "Enquanto vigente",
  "Enquanto vigora",
  "Imediatamente após a produção",
  "Prazo da licença",
  "Prazo do processo",
  "Validade do Concurso",
];

type ClassificacaoFormState = Omit<Classificacao, 'id' | 'prazoGuardaFaseCorrenteAnos' | 'prazoGuardaFaseIntermediariaAnos'> & {
  prazoGuardaFaseCorrenteAnos?: string; 
  prazoGuardaFaseIntermediariaAnos: string; 
};

const initialFormState: ClassificacaoFormState = {
  codigo: "",
  descricao: "",
  tipoPlanoClassificacao: "Administrativo",
  tipoPrazoFaseCorrente: "Anos",
  prazoGuardaFaseCorrenteAnos: "", 
  prazoGuardaFaseCorrenteCondicaoTextual: "",
  prazoGuardaFaseIntermediariaAnos: "", 
  destinacaoFinal: "Eliminação",
  observacoes: "",
  inativo: false,
};


type ColumnConfigClassificacoes = {
  id: keyof Classificacao | string;
  header: string;
  accessorKey: keyof Classificacao | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: Classificacao) => React.ReactNode;
};

const ALL_COLUMNS_CONFIG_CLASSIFICACOES: ColumnConfigClassificacoes[] = [
  { id: 'tipoPlanoClassificacao', header: 'Tipo de Plano', accessorKey: 'tipoPlanoClassificacao', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  { id: 'codigo', header: 'Código', accessorKey: 'codigo', defaultVisible: true, enableSorting: true },
  { id: 'descricao', header: 'Assunto', accessorKey: 'descricao', defaultVisible: true, enableSorting: true },
  { 
    id: 'tipoPrazoFaseCorrenteCombined', 
    header: 'Tipo Prazo Corrente', 
    accessorKey: 'tipoPrazoFaseCorrente', 
    defaultVisible: true, 
    enableSorting: true,
    cellFormatter: (_, item) => {
      if (item.tipoPrazoFaseCorrente === "Anos") {
        return `${item.prazoGuardaFaseCorrenteAnos ?? 'N/A'} Anos`;
      }
      if (item.tipoPrazoFaseCorrente === "Condição Textual") {
        return item.prazoGuardaFaseCorrenteCondicaoTextual || "N/A";
      }
      return "N/A";
    }
  },
  { 
    id: 'prazoGuardaFaseIntermediariaAnos', 
    header: 'Prazo Intermediário', 
    accessorKey: 'prazoGuardaFaseIntermediariaAnos', 
    defaultVisible: true, 
    enableSorting: true,
    cellFormatter: (value) => `${value ?? 'N/A'} Anos`
  },
  { id: 'destinacaoFinal', header: 'Destinação Final', accessorKey: 'destinacaoFinal', defaultVisible: true, enableSorting: true },
  { id: 'observacoes', header: 'Observações', accessorKey: 'observacoes', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  { 
    id: 'status', 
    header: 'Status', 
    accessorKey: 'inativo', 
    defaultVisible: true, 
    enableSorting: true,
    cellFormatter: (value) => <Badge variant={value ? 'destructive' : 'secondary'}>{value ? 'Inativo' : 'Ativo'}</Badge>
  },
];

type SortConfig = { id: string; direction: 'asc' | 'desc' };

export default function ClassificacaoPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<ClassificacaoFormState>(initialFormState);
  const [placeholderClassificacoes, setPlaceholderClassificacoes] = React.useState<Classificacao[]>(placeholderClassificacoesInitial);
  const [displayedClassificacoes, setDisplayedClassificacoes] = React.useState<Classificacao[]>(placeholderClassificacoesInitial);
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingClassificacaoId, setEditingClassificacaoId] = React.useState<string | null>(null);

  const [columnVisibilityClassificacoes, setColumnVisibilityClassificacoes] = React.useState<Record<string, boolean>>(
    ALL_COLUMNS_CONFIG_CLASSIFICACOES.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
  );
  const [sortingClassificacoes, setSortingClassificacoes] = React.useState<SortConfig[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);

  const resetForm = () => {
    setFormState(initialFormState);
    setIsEditing(false);
    setEditingClassificacaoId(null);
  };

  const handleOpenDialog = (classificacao?: Classificacao) => {
    if (classificacao) {
      setIsEditing(true);
      setEditingClassificacaoId(classificacao.id);
      setFormState({
        codigo: classificacao.codigo,
        descricao: classificacao.descricao,
        tipoPlanoClassificacao: classificacao.tipoPlanoClassificacao || "Administrativo",
        tipoPrazoFaseCorrente: classificacao.tipoPrazoFaseCorrente || "Anos",
        prazoGuardaFaseCorrenteAnos: classificacao.prazoGuardaFaseCorrenteAnos !== undefined ? String(classificacao.prazoGuardaFaseCorrenteAnos) : "",
        prazoGuardaFaseCorrenteCondicaoTextual: classificacao.prazoGuardaFaseCorrenteCondicaoTextual || "",
        prazoGuardaFaseIntermediariaAnos: String(classificacao.prazoGuardaFaseIntermediariaAnos),
        destinacaoFinal: classificacao.destinacaoFinal,
        observacoes: classificacao.observacoes || "",
        inativo: classificacao.inativo,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
     setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof ClassificacaoFormState) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
     if (id === 'tipoPrazoFaseCorrente') {
      if (value === 'Anos') {
        setFormState(prev => ({ ...prev, prazoGuardaFaseCorrenteCondicaoTextual: "" , prazoGuardaFaseCorrenteAnos: prev.prazoGuardaFaseCorrenteAnos || "" }));
      } else if (value === 'Condição Textual') {
        setFormState(prev => ({ ...prev, prazoGuardaFaseCorrenteAnos: "", prazoGuardaFaseCorrenteCondicaoTextual: prev.prazoGuardaFaseCorrenteCondicaoTextual || "" }));
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, inativo: checked }));
  };

  const handleSaveChanges = () => {
    const classificacaoDataToSave: Classificacao = {
      id: isEditing && editingClassificacaoId ? editingClassificacaoId : `CLA${Date.now()}`,
      codigo: formState.codigo,
      descricao: formState.descricao,
      tipoPlanoClassificacao: formState.tipoPlanoClassificacao as Classificacao['tipoPlanoClassificacao'],
      tipoPrazoFaseCorrente: formState.tipoPrazoFaseCorrente as Classificacao['tipoPrazoFaseCorrente'],
      prazoGuardaFaseCorrenteAnos: formState.tipoPrazoFaseCorrente === 'Anos' && formState.prazoGuardaFaseCorrenteAnos && formState.prazoGuardaFaseCorrenteAnos.trim() !== "" ? parseInt(formState.prazoGuardaFaseCorrenteAnos, 10) : undefined,
      prazoGuardaFaseCorrenteCondicaoTextual: formState.tipoPrazoFaseCorrente === 'Condição Textual' ? formState.prazoGuardaFaseCorrenteCondicaoTextual : undefined,
      prazoGuardaFaseIntermediariaAnos: formState.prazoGuardaFaseIntermediariaAnos && formState.prazoGuardaFaseIntermediariaAnos.trim() !== "" ? parseInt(formState.prazoGuardaFaseIntermediariaAnos, 10) : 0,
      destinacaoFinal: formState.destinacaoFinal as Classificacao['destinacaoFinal'],
      observacoes: formState.observacoes,
      inativo: formState.inativo,
    };

    let updatedClassificacoes;
    if (isEditing && editingClassificacaoId) {
      updatedClassificacoes = placeholderClassificacoes.map(c =>
        c.id === editingClassificacaoId ? classificacaoDataToSave : c
      );
    } else {
      updatedClassificacoes = [...placeholderClassificacoes, classificacaoDataToSave];
    }
    setPlaceholderClassificacoes(updatedClassificacoes);
    setSelectedRowIds([]);
    
    setIsDialogOpen(false);
  };

  const getSortableValueClassificacoes = (item: Classificacao, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG_CLASSIFICACOES.find(col => col.id === columnId);
    if (!column) return null;

    if (column.id === 'tipoPrazoFaseCorrenteCombined') {
      if (item.tipoPrazoFaseCorrente === "Anos") return item.prazoGuardaFaseCorrenteAnos;
      if (item.tipoPrazoFaseCorrente === "Condição Textual") return item.prazoGuardaFaseCorrenteCondicaoTextual;
      return null;
    }
    if (column.id === 'status') return item.inativo;

    return item[column.accessorKey as keyof Classificacao];
  };

  React.useEffect(() => {
    let sortedClassificacoes = [...placeholderClassificacoes];
    if (sortingClassificacoes.length > 0) {
      sortedClassificacoes.sort((a, b) => {
        for (const sortConfig of sortingClassificacoes) {
          const valA = getSortableValueClassificacoes(a, sortConfig.id);
          const valB = getSortableValueClassificacoes(b, sortConfig.id);
    
          let comparisonResult = 0;
    
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            comparisonResult = valA === valB ? 0 : valA ? -1 : 1; 
          } else if (typeof valA === 'number' && typeof valB === 'number') {
            comparisonResult = valA - valB;
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
    setDisplayedClassificacoes(sortedClassificacoes);
  }, [sortingClassificacoes, placeholderClassificacoes]);


  const handleSortClassificacoes = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG_CLASSIFICACOES.find(col => col.id === columnId);
    if (!columnConfig || !columnConfig.enableSorting) return;

    setSortingClassificacoes(prevSorting => {
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

  const renderSortIconClassificacoes = (columnId: string) => {
    const sortConfig = sortingClassificacoes.find(s => s.id === columnId);
    if (!sortConfig) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const toggleColumnVisibilityClassificacoes = (columnId: string) => {
    setColumnVisibilityClassificacoes(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumnsClassificacoes = () => {
    setColumnVisibilityClassificacoes(
      ALL_COLUMNS_CONFIG_CLASSIFICACOES.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {})
    );
  };

  const handleDeselectAllColumnsClassificacoes = () => {
     setColumnVisibilityClassificacoes(
      ALL_COLUMNS_CONFIG_CLASSIFICACOES.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {})
    );
  };
  
  const getCellValueClassificacoes = (item: Classificacao, column: ColumnConfigClassificacoes) => {
    const value = item[column.accessorKey as keyof Classificacao];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  };

  const numDisplayed = displayedClassificacoes.length;
  const numSelected = selectedRowIds.length;

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classificação" description="Gerencie os códigos de classificação de assuntos dos documentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
             <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Classificação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">{isEditing ? "Editar Classificação" : "Nova Classificação"}</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para {isEditing ? "editar a" : "cadastrar uma nova"} classificação. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipoPlanoClassificacao" className="text-right">
                  Tipo de Plano*
                </Label>
                <Select onValueChange={handleSelectChange('tipoPlanoClassificacao')} value={formState.tipoPlanoClassificacao}>
                  <SelectTrigger id="tipoPlanoClassificacao" className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Judicial">Judicial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigo" className="text-right">
                  Código*
                </Label>
                <Input id="codigo" value={formState.codigo} onChange={handleInputChange} placeholder="Ex: 020.1" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Assunto*
                </Label>
                <Input id="descricao" value={formState.descricao} onChange={handleInputChange} placeholder="Ex: Processos Judiciais Cíveis" className="col-span-3" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipoPrazoFaseCorrente" className="text-right">
                  Tipo Prazo Corrente
                </Label>
                <Select onValueChange={handleSelectChange('tipoPrazoFaseCorrente')} value={formState.tipoPrazoFaseCorrente}>
                  <SelectTrigger id="tipoPrazoFaseCorrente" className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Anos">Anos</SelectItem>
                    <SelectItem value="Condição Textual">Condição Textual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formState.tipoPrazoFaseCorrente === "Anos" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prazoGuardaFaseCorrenteAnos" className="text-right">
                    Prazo Corrente (Anos)
                  </Label>
                  <Input id="prazoGuardaFaseCorrenteAnos" type="number" value={formState.prazoGuardaFaseCorrenteAnos ?? ""} onChange={handleNumericInputChange} placeholder="Nº de anos (ex: 5)" className="col-span-3" />
                </div>
              )}

              {formState.tipoPrazoFaseCorrente === "Condição Textual" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prazoGuardaFaseCorrenteCondicaoTextual" className="text-right">
                    Prazo Corrente (Condição)
                  </Label>
                  <Select onValueChange={handleSelectChange('prazoGuardaFaseCorrenteCondicaoTextual')} value={formState.prazoGuardaFaseCorrenteCondicaoTextual}>
                    <SelectTrigger id="prazoGuardaFaseCorrenteCondicaoTextual" className="col-span-3">
                      <SelectValue placeholder="Selecione a condição textual" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {opcoesCondicaoTextualFaseCorrente.map(opcao => (
                        <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prazoGuardaFaseIntermediariaAnos" className="text-right">
                  Prazo Intermed. (Anos)*
                </Label>
                <Input id="prazoGuardaFaseIntermediariaAnos" type="number" value={formState.prazoGuardaFaseIntermediariaAnos} onChange={handleNumericInputChange} placeholder="Nº de anos (ex: 15, pode ser 0)" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="destinacaoFinal" className="text-right">
                  Destinação Final*
                </Label>
                <Select onValueChange={handleSelectChange('destinacaoFinal')} value={formState.destinacaoFinal}>
                  <SelectTrigger id="destinacaoFinal" className="col-span-3">
                    <SelectValue placeholder="Selecione a destinação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoes" className="text-right">
                  Observações
                </Label>
                <Textarea id="observacoes" value={formState.observacoes} onChange={handleInputChange} placeholder="Detalhes adicionais" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inativo" className="text-right">
                  Inativo
                </Label>
                <Checkbox id="inativo" checked={formState.inativo} onCheckedChange={handleCheckboxChange} className="col-span-3 justify-self-start" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Classificação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-primary">Lista de Classificações</CardTitle>
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
                <DropdownMenuItem onSelect={handleSelectAllColumnsClassificacoes} className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Selecionar Todas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDeselectAllColumnsClassificacoes} className="cursor-pointer">
                  <Square className="mr-2 h-4 w-4" />
                  Limpar Todas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_COLUMNS_CONFIG_CLASSIFICACOES.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibilityClassificacoes[column.id as string]}
                    onCheckedChange={() => toggleColumnVisibilityClassificacoes(column.id as string)}
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
                        numDisplayed > 0 && numSelected === numDisplayed
                          ? true
                          : numSelected > 0 ? 'indeterminate' : false
                      }
                      onCheckedChange={(value) => {
                        if (value === true) {
                          setSelectedRowIds(displayedClassificacoes.map(c => c.id));
                        } else {
                          setSelectedRowIds([]);
                        }
                      }}
                      aria-label="Selecionar todas as linhas"
                    />
                  </TableHead>
                  {ALL_COLUMNS_CONFIG_CLASSIFICACOES.map((column) =>
                    columnVisibilityClassificacoes[column.id as string] ? (
                      <TableHead key={column.id as string} className="py-2 px-3">
                        {column.enableSorting ? (
                          <Button
                            variant="ghost"
                            onClick={() => handleSortClassificacoes(column.id as string)}
                            className="px-1 py-1 h-auto -ml-2"
                          >
                            {column.header}
                            {renderSortIconClassificacoes(column.id as string)}
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
                {displayedClassificacoes.map((item) => (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                    <TableCell className="py-2 px-3">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={(value) => {
                          setSelectedRowIds(prev =>
                            value ? [...prev, item.id] : prev.filter(id => id !== item.id)
                          );
                        }}
                        aria-label={`Selecionar classificação ${item.codigo}`}
                      />
                    </TableCell>
                    {ALL_COLUMNS_CONFIG_CLASSIFICACOES.map((column) =>
                      columnVisibilityClassificacoes[column.id as string] ? (
                        <TableCell key={`${item.id}-${column.id as string}`} className="py-2 px-3">
                           {getCellValueClassificacoes(item, column)}
                        </TableCell>
                      ) : null
                    )}
                    <TableCell className="sticky right-0 bg-background z-10 py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Editar Classificação" onClick={() => handleOpenDialog(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent><p>Editar Classificação</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir Classificação" onClick={() => console.log('Delete', item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Excluir Classificação</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {displayedClassificacoes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma classificação encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
    
