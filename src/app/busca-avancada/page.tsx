
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/page-header";
import { Search, RotateCcw, ColumnsIcon, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";
import { DateInputPicker } from "@/components/date-input-picker";
import type { Documento, Classificacao } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { parseISO, isAfter, isBefore } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


const initialFilters = {
  numeroDocumento: "",
  origem: "",
  tipoDocumento: "",
  descricaoDocumento: "",
  dataDocumentoDe: undefined as Date | undefined,
  dataDocumentoAte: undefined as Date | undefined,
  dataArquivamentoDe: undefined as Date | undefined,
  dataArquivamentoAte: undefined as Date | undefined,
  partes: "",
  classificacao: "",
  codigoCaixa: "",
  status: "",
  orgao: "",
  tipoMeio: "",
  generoDocumental: "",
  categoria: "",
  destinacaoFinal: "",
  anoEliminacaoPrevisto: "",
  grauSigilo: "",
  codigoAtoM: "",
  observacoesGerais: "",
  codigoClasseJudicial: "",
  numeroListagemEliminacao: "",
  segredoJustica: false,
  digitalizado: false,
};

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
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';


export default function BuscaAvancadaPage() {
  const [filters, setFilters] = React.useState(initialFilters);
  const [filteredResults, setFilteredResults] = React.useState<Documento[]>([]);
  const [displayedResults, setDisplayedResults] = React.useState<Documento[]>([]);
  const [searched, setSearched] = React.useState(false);
  
  const [allDocuments, setAllDocuments] = React.useState<Documento[]>([]);
  const [allClassificacoes, setAllClassificacoes] = React.useState<Classificacao[]>([]);
  
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  

  const ALL_COLUMNS_CONFIG: ColumnConfig[] = React.useMemo(() => [
    { 
      id: 'numeroDocumento', 
      header: 'Nº do Documento', 
      accessorKey: 'numeroDocumento', 
      defaultVisible: true, 
      enableSorting: true,
      cellFormatter: (value, doc) => (
        <Link href={`/documentos?edit=${doc.id}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            {value || 'N/A'}
        </Link>
      )
    },
    { id: 'tipoDocumento', header: 'Tipo de Documento', accessorKey: 'tipoDocumento', defaultVisible: true, enableSorting: true },
    { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> },
    { id: 'status', header: 'Status', accessorKey: 'status', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <Badge variant={value === 'Arquivado' ? 'secondary' : value === 'Eliminado' ? 'destructive' : 'default'}>{value}</Badge> },
    { id: 'codigosCaixa', header: 'Código da Caixa', accessorKey: 'codigosCaixa', defaultVisible: true, enableSorting: true },
    { id: 'origem', header: 'Origem', accessorKey: 'origem', defaultVisible: true, enableSorting: true },
    { id: 'dataArquivamento', header: 'Data de Arquivamento', accessorKey: 'dataArquivamento', defaultVisible: true, enableSorting: true, cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'classificacaoArquivisticaId', header: 'Classificação Arquivística', accessorKey: 'classificacaoArquivisticaId', defaultVisible: true, enableSorting: true, cellFormatter: (value) => {
        const classif = allClassificacoes.find(c => c.id === value);
        return classif ? `${classif.codigo} - ${classif.descricao}` : value || 'N/A';
      }
    },
    { id: 'anoEliminacaoPrevisto', header: 'Ano de Eliminação', accessorKey: 'anoEliminacaoPrevisto', defaultVisible: false, enableSorting: true },
    { id: 'grauSigilo', header: 'Grau de Sigilo', accessorKey: 'grauSigilo', defaultVisible: false, enableSorting: true },
    { id: 'orgao', header: 'Órgão', accessorKey: 'orgao', defaultVisible: false, enableSorting: true },
    { id: 'tipoMeio', header: 'Tipo de Meio', accessorKey: 'tipoMeio', defaultVisible: false, enableSorting: true },
    { id: 'generoDocumental', header: 'Gênero Documental', accessorKey: 'generoDocumental', defaultVisible: false, enableSorting: true },
    { id: 'categoria', header: 'Categoria', accessorKey: 'categoria', defaultVisible: false, enableSorting: true },
    { id: 'destinacaoFinalDisplay', header: 'Destinação Final', accessorKey: 'destinacaoFinalDisplay', defaultVisible: false, enableSorting: true },
    { id: 'codigoAtoM', header: 'Código do AtoM', accessorKey: 'codigoAtoM', defaultVisible: false, enableSorting: true },
    { id: 'observacoesGerais', header: 'Observações Gerais', accessorKey: 'observacoesGerais', defaultVisible: false, enableSorting: true },
    { id: 'codigoClassificacaoJudicialId', header: 'Código Classe Judicial', accessorKey: 'codigoClassificacaoJudicialId', defaultVisible: false, enableSorting: true },
    { id: 'numeroListagemEliminacao', header: 'Nº Listagem Eliminação', accessorKey: 'numeroListagemEliminacao', defaultVisible: false, enableSorting: true },
    { id: 'segredoJustica', header: 'Segredo de Justiça', accessorKey: 'segredoJustica', defaultVisible: false, enableSorting: true, cellFormatter: (value) => <Badge variant={value === 'Sim' ? 'destructive' : 'outline'}>{value}</Badge> },
    { id: 'digitalizado', header: 'Digitalizado', accessorKey: 'digitalizado', defaultVisible: false, enableSorting: true, cellFormatter: (value) => <Badge variant={value === 'Sim' ? 'secondary' : 'outline'}>{value}</Badge> },
    { id: 'nomePartePrincipal', header: 'Partes Envolvidas', accessorKey: 'nomePartePrincipal', defaultVisible: true, enableSorting: true },
    { id: 'dataAbrangente', header: 'Data do Documento', accessorKey: 'dataAbrangente', defaultVisible: false, enableSorting: true },
  ], [allClassificacoes]);

   React.useEffect(() => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
    );
  }, [ALL_COLUMNS_CONFIG]);

  React.useEffect(() => {
    try {
      const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      if (storedDocs) setAllDocuments(JSON.parse(storedDocs));
      
      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      if (storedClassificacoes) setAllClassificacoes(JSON.parse(storedClassificacoes));
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof initialFilters) => (value: string) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: keyof typeof initialFilters) => (checked: boolean | 'indeterminate') => {
    setFilters(prev => ({ ...prev, [id]: !!checked }));
  };

  const handleDateChange = (id: keyof typeof initialFilters) => (date?: Date) => {
    setFilters(prev => ({ ...prev, [id]: date }));
  };
  
  const handleClear = () => {
    setFilters(initialFilters);
    setFilteredResults([]);
    setDisplayedResults([]);
    setSearched(false);
  };

  const handleSearch = () => {
    const filtered = allDocuments.filter(doc => {
        if (filters.numeroDocumento && !doc.numeroDocumento?.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) return false;
        if (filters.origem && !doc.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
        if (filters.tipoDocumento && !doc.tipoDocumento?.toLowerCase().includes(filters.tipoDocumento.toLowerCase())) return false;
        if (filters.descricaoDocumento && !doc.descricaoDocumento?.toLowerCase().includes(filters.descricaoDocumento.toLowerCase())) return false;
        if (filters.partes && !doc.nomePartePrincipal?.toLowerCase().includes(filters.partes.toLowerCase())) return false;
        if (filters.codigoCaixa && !doc.codigosCaixa?.toLowerCase().includes(filters.codigoCaixa.toLowerCase())) return false;
        if (filters.anoEliminacaoPrevisto && doc.anoEliminacaoPrevisto !== filters.anoEliminacaoPrevisto) return false;
        if (filters.codigoAtoM && !doc.codigoAtoM?.toLowerCase().includes(filters.codigoAtoM.toLowerCase())) return false;
        if (filters.observacoesGerais && !doc.observacoesGerais?.toLowerCase().includes(filters.observacoesGerais.toLowerCase())) return false;
        if (filters.codigoClasseJudicial && !doc.codigoClassificacaoJudicialId?.toLowerCase().includes(filters.codigoClasseJudicial.toLowerCase())) return false;
        if (filters.numeroListagemEliminacao && !doc.numeroListagemEliminacao?.toLowerCase().includes(filters.numeroListagemEliminacao.toLowerCase())) return false;

        if (filters.classificacao && doc.classificacaoArquivisticaId !== filters.classificacao) return false;
        if (filters.status && doc.status !== filters.status) return false;
        if (filters.orgao && doc.orgao !== filters.orgao) return false;
        if (filters.tipoMeio && doc.tipoMeio !== filters.tipoMeio) return false;
        if (filters.generoDocumental && doc.generoDocumental !== filters.generoDocumental) return false;
        if (filters.categoria && doc.categoria !== filters.categoria) return false;
        if (filters.destinacaoFinal && doc.destinacaoFinalDisplay !== filters.destinacaoFinal) return false;
        if (filters.grauSigilo && doc.grauSigilo !== filters.grauSigilo) return false;

        if (filters.segredoJustica && doc.segredoJustica !== "Sim") return false;
        if (filters.digitalizado && doc.digitalizado !== "Sim") return false;
        
        if (filters.dataArquivamentoDe || filters.dataArquivamentoAte) {
            if (!doc.dataArquivamento) return false;
            try {
                const docArqDate = parseISO(doc.dataArquivamento);
                if (filters.dataArquivamentoDe && isBefore(docArqDate, filters.dataArquivamentoDe)) return false;
                if (filters.dataArquivamentoAte && isAfter(docArqDate, filters.dataArquivamentoAte)) return false;
            } catch (e) { return false; }
        }
        return true;
    });

    setFilteredResults(filtered);
    setSearched(true);
  };
  
    const getSortableValue = React.useCallback((doc: Documento, columnId: string): any => {
        const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
        if (!column) return null;
        if (column.accessorKey === 'classificacaoArquivisticaId') {
            const classif = allClassificacoes.find(c => c.id === doc.classificacaoArquivisticaId);
            return classif ? `${classif.codigo} - ${classif.descricao}` : doc.classificacaoArquivisticaId || '';
        }
        const value = doc[column.accessorKey as keyof Documento];
        if (column.accessorKey === 'dataArquivamento' && value && typeof value === 'string') {
            const parsedDate = Date.parse(value);
            return !isNaN(parsedDate) ? new Date(parsedDate) : null;
        }
        return value;
    }, [ALL_COLUMNS_CONFIG, allClassificacoes]);

    React.useEffect(() => {
        let sortedResults = [...filteredResults];
        if (sorting.length > 0) {
            sortedResults.sort((a, b) => {
                for (const sortConfig of sorting) {
                    const valA = getSortableValue(a, sortConfig.id);
                    const valB = getSortableValue(b, sortConfig.id);

                    let comparisonResult = 0;
                    if (valA === null || valA === undefined) comparisonResult = 1;
                    else if (valB === null || valB === undefined) comparisonResult = -1;
                    else if (valA instanceof Date && valB instanceof Date) comparisonResult = valA.getTime() - valB.getTime();
                    else comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());

                    if (comparisonResult !== 0) {
                        return sortConfig.direction === 'asc' ? comparisonResult : -comparisonResult;
                    }
                }
                return 0;
            });
        }
        setDisplayedResults(sortedResults);
    }, [filteredResults, sorting, getSortableValue]);

    const handleSort = (columnId: string) => {
        const columnConfig = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
        if (!columnConfig || !columnConfig.enableSorting) return;

        setSorting(prevSorting => {
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

    const renderSortIcon = (columnId: string) => {
        const sortConfig = sorting.find(s => s.id === columnId);
        if (!sortConfig) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
        if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
        return <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const toggleColumnVisibility = (columnId: string) => {
        setColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    const handleSelectAllColumns = () => {
        setColumnVisibility(ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {}));
    };

    const handleDeselectAllColumns = () => {
        setColumnVisibility(ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {}));
    };

    const getCellValue = (doc: Documento, column: ColumnConfig) => {
        const value = doc[column.accessorKey as keyof Documento];
        if (column.cellFormatter) {
            return column.cellFormatter(value, doc);
        }
        return value === undefined || value === null ? 'N/A' : String(value);
    };
    
    const numDisplayed = displayedResults.length;
    const numSelected = selectedRowIds.length;

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Busca Avançada" description="Encontre documentos utilizando múltiplos critérios de pesquisa." />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Critérios de Busca</CardTitle>
          <CardDescription>Preencha os campos abaixo para refinar sua busca.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="numeroDocumento">Número do Documento</Label>
            <Input id="numeroDocumento" placeholder="Ex: PRC-2023-001" value={filters.numeroDocumento} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" placeholder="Ex: Tribunal de Justiça" value={filters.origem} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
            <Input id="tipoDocumento" placeholder="Ex: Ação Ordinária" value={filters.tipoDocumento} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
            <Input id="descricaoDocumento" placeholder="Contém..." value={filters.descricaoDocumento} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataDocumentoDe">Data do Documento (De)</Label>
            <DateInputPicker value={filters.dataDocumentoDe} onChange={handleDateChange('dataDocumentoDe')} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataDocumentoAte">Data do Documento (Até)</Label>
            <DateInputPicker value={filters.dataDocumentoAte} onChange={handleDateChange('dataDocumentoAte')} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataArquivamentoDe">Data de Arquivamento (De)</Label>
            <DateInputPicker value={filters.dataArquivamentoDe} onChange={handleDateChange('dataArquivamentoDe')} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataArquivamentoAte">Data de Arquivamento (Até)</Label>
            <DateInputPicker value={filters.dataArquivamentoAte} onChange={handleDateChange('dataArquivamentoAte')} placeholder="dd/mm/aaaa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partes">Partes Envolvidas</Label>
            <Input id="partes" placeholder="Ex: João da Silva" value={filters.partes} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classificacao">Classificação Arquivística</Label>
            <Select onValueChange={handleSelectChange('classificacao')} value={filters.classificacao}>
              <SelectTrigger id="classificacao">
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>
              <SelectContent>
                {allClassificacoes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.descricao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoCaixa">Código da Caixa</Label>
            <Input id="codigoCaixa" placeholder="Ex: CX-A-001" value={filters.codigoCaixa} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="status">Status do Documento</Label>
            <Select onValueChange={handleSelectChange('status')} value={filters.status}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arquivado">Arquivado</SelectItem>
                <SelectItem value="Emprestado">Emprestado</SelectItem>
                <SelectItem value="Desarquivado">Desarquivado</SelectItem>
                <SelectItem value="Eliminado">Eliminado</SelectItem>
                <SelectItem value="Aguardando prazo para eliminação">Aguardando prazo para eliminação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgao">Órgão</Label>
            <Select onValueChange={handleSelectChange('orgao')} value={filters.orgao}>
                <SelectTrigger id="orgao"><SelectValue placeholder="Selecione o órgão" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="TRF2">TRF2</SelectItem>
                    <SelectItem value="SJRJ">SJRJ</SelectItem>
                    <SelectItem value="SJES">SJES</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoMeio">Tipo de Meio</Label>
            <Select onValueChange={handleSelectChange('tipoMeio')} value={filters.tipoMeio}>
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
            <Select onValueChange={handleSelectChange('generoDocumental')} value={filters.generoDocumental}>
                <SelectTrigger id="generoDocumental"><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="categoria">Categoria</Label>
            <Select onValueChange={handleSelectChange('categoria')} value={filters.categoria}>
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
            <Label htmlFor="destinacaoFinal">Destinação Final</Label>
            <Select onValueChange={handleSelectChange('destinacaoFinal')} value={filters.destinacaoFinal}>
                <SelectTrigger id="destinacaoFinal"><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anoEliminacaoPrevisto">Ano de Eliminação Previsto</Label>
            <Input id="anoEliminacaoPrevisto" type="number" placeholder="AAAA" value={filters.anoEliminacaoPrevisto} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grauSigilo">Grau de Sigilo (LAI)</Label>
            <Select onValueChange={handleSelectChange('grauSigilo')} value={filters.grauSigilo}>
              <SelectTrigger id="grauSigilo"><SelectValue placeholder="Selecione o grau de sigilo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ostensivo">Ostensivo</SelectItem>
                <SelectItem value="Reservado">Reservado</SelectItem>
                <SelectItem value="Secreto">Secreto</SelectItem>
                <SelectItem value="Ultrassecreto">Ultrassecreto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoAtoM">Código do AtoM</Label>
            <Input id="codigoAtoM" placeholder="Contém..." value={filters.codigoAtoM} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoesGerais">Observações Gerais</Label>
            <Input id="observacoesGerais" placeholder="Contém..." value={filters.observacoesGerais} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoClasseJudicial">Código da Classe Judicial</Label>
            <Input id="codigoClasseJudicial" placeholder="Contém..." value={filters.codigoClasseJudicial} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroListagemEliminacao">Nº da Listagem de Eliminação</Label>
            <Input id="numeroListagemEliminacao" placeholder="Contém..." value={filters.numeroListagemEliminacao} onChange={handleInputChange} />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="segredoJustica" checked={filters.segredoJustica} onCheckedChange={handleCheckboxChange('segredoJustica')} />
            <Label htmlFor="segredoJustica">Segredo de Justiça</Label>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="digitalizado" checked={filters.digitalizado} onCheckedChange={handleCheckboxChange('digitalizado')} />
            <Label htmlFor="digitalizado">Apenas Digitalizados</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-primary">Resultados da Busca</CardTitle>
                <CardDescription>
                    {searched ? `${displayedResults.length} documento(s) encontrado(s).` : 'A busca será exibida aqui.'}
                </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {searched ? (
            displayedResults.length > 0 ? (
                <ScrollArea className="w-full">
                    <Table className="min-w-full whitespace-nowrap">
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 py-2 px-3">
                                <Checkbox
                                checked={numDisplayed > 0 && numSelected === numDisplayed ? true : numSelected > 0 ? 'indeterminate' : false}
                                onCheckedChange={(value) => setSelectedRowIds(value === true ? displayedResults.map(item => item.id) : [])}
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
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {displayedResults.map((doc) => (
                            <TableRow key={doc.id} data-state={selectedRowIds.includes(doc.id) ? "selected" : ""}>
                                <TableCell className="py-2 px-3">
                                    <Checkbox
                                        checked={selectedRowIds.includes(doc.id)}
                                        onCheckedChange={(value) => {
                                            setSelectedRowIds(prev =>
                                            value ? [...prev, doc.id] : prev.filter(id => id !== doc.id)
                                            );
                                        }}
                                        aria-label={`Selecionar documento ${doc.numeroDocumento}`}
                                    />
                                </TableCell>
                                {ALL_COLUMNS_CONFIG.map((column) =>
                                    columnVisibility[column.id as string] ? (
                                    <TableCell key={`${doc.id}-${column.id as string}`} className="py-2 px-3">
                                        {getCellValue(doc, column)}
                                    </TableCell>
                                    ) : null
                                )}
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum resultado encontrado para os critérios informados.</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma busca realizada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
