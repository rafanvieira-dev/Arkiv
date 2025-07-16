
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import type { Documento, Caixa, ParteDocumento, Classificacao, TipoOrigem, ParteDetalhe } from "@/types";
import { initialDocumentos, initialCaixas, initialClassificacoes, initialTiposOrigem, initialPartes } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  ColumnsIcon,
  Printer,
  Square,
  Search,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { getYear, parseISO, isValid, isBefore, isAfter } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInputPicker } from "@/components/date-input-picker";
import { Badge } from "@/components/ui/badge";
import { gerarIniciais } from "@/lib/utils";

interface EliminationReportData {
  tipo: string;
  volumeTotalIds: string[];
  semPrazoIds: string[];
  eliminacaoPorAno: { [year: string]: string[] };
}

interface PermanentReportData {
  tipo: string;
  volumePermanenteIds: string[];
}

const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';
const TIPOS_ORIGEM_STORAGE_KEY = 'arquivocentral_tipos_origem';
const PARTES_STORAGE_KEY = 'arquivocentral_partes';

const initialFilters = {
  numeroDocumento: "",
  processoOriginario: "",
  numeroAntigo: "",
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
  numeroDocumentoTransferencia: "",
  caixaMidia: "",
  palavrasChave: "",
  segredoJustica: false,
  digitalizado: false,
  necessidadeReclassificacao: "",
};


type CustomReportColumn = {
  id: keyof Documento | string;
  header: string;
  accessorKey: keyof Documento | string;
  defaultVisible: boolean;
  enableSorting?: boolean;
  cellFormatter?: (value: any, doc: Documento) => React.ReactNode;
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };


export default function RelatoriosPage() {
    const [eliminationReportData, setEliminationReportData] = React.useState<EliminationReportData[]>([]);
    const [permanentReportData, setPermanentReportData] = React.useState<PermanentReportData[]>([]);
    const [allYears, setAllYears] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [allDocuments, setAllDocuments] = React.useState<Documento[]>([]);
    const [allClassificacoes, setAllClassificacoes] = React.useState<Classificacao[]>([]);
    const [tiposOrigem, setTiposOrigem] = React.useState<TipoOrigem[]>([]);
    const [masterPartes, setMasterPartes] = React.useState<ParteDetalhe[]>([]);

    const [isPrinting, setIsPrinting] = React.useState(false);
    const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({});
    
    const [filters, setFilters] = React.useState(initialFilters);
    const [filteredResults, setFilteredResults] = React.useState<Documento[]>([]);
    const [searched, setSearched] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortConfig[]>([]);

    const masterPartesMap = React.useMemo(() => new Map(masterPartes.map(p => [`${p.nome.toLowerCase()}|${(p.cpfCnpj || "").toLowerCase()}`, p])), [masterPartes]);
    
    const ALL_CUSTOM_REPORT_COLUMNS: CustomReportColumn[] = React.useMemo(() => [
      { id: 'id', header: 'ID Interno', accessorKey: 'id', defaultVisible: true, enableSorting: true },
      { id: 'status', header: 'Status', accessorKey: 'status', defaultVisible: true, enableSorting: true,
        cellFormatter: (value) => <Badge variant={value === 'Arquivado' ? 'secondary' : value === 'Eliminado' ? 'destructive' : 'default'}>{value}</Badge> 
      },
      { id: 'orgao', header: 'Órgão', accessorKey: 'orgao', defaultVisible: true, enableSorting: true },
      { id: 'origem', header: 'Origem', accessorKey: 'origem', defaultVisible: true, enableSorting: true },
      { id: 'tipoMeio', header: 'Tipo de Meio', accessorKey: 'tipoMeio', defaultVisible: false, enableSorting: true },
      { id: 'generoDocumental', header: 'Gênero', accessorKey: 'generoDocumental', defaultVisible: false, enableSorting: true },
      { id: 'categoria', header: 'Categoria', accessorKey: 'categoria', defaultVisible: false, enableSorting: true },
      { id: 'tipoDocumento', header: 'Espécie de Documento', accessorKey: 'tipoDocumento', defaultVisible: true, enableSorting: true },
      { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento', defaultVisible: true, enableSorting: true },
      { id: 'numeroAntigo', header: 'Nº Antigo', accessorKey: 'numeroAntigo', defaultVisible: false, enableSorting: true },
      { id: 'processoOriginario', header: 'Proc. Originário', accessorKey: 'processoOriginario', defaultVisible: false, enableSorting: true },
      { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente', defaultVisible: true, enableSorting: true },
      { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento', defaultVisible: true, enableSorting: true,
        cellFormatter: (value) => <span className="block max-w-xs truncate" title={value as string}>{value || 'N/A'}</span> 
      },
      { id: 'partes', header: 'Partes Envolvidas', accessorKey: 'partes', defaultVisible: true, enableSorting: false, 
        cellFormatter: (partes?: ParteDocumento[]) => {
            if (!partes || partes.length === 0) return 'N/A';
            const names = partes.map(p => {
              if (p.usarIniciais) {
                const masterPart = masterPartesMap.get(`${p.nome.toLowerCase()}|${(p.cpfCnpj || "").toLowerCase()}`);
                return masterPart?.iniciais ?? gerarIniciais(p.nome);
              }
              return p.nome;
            }).join(', ');
            return <span className="block max-w-xs truncate" title={names}>{names}</span>;
        } 
      },
      { id: 'dataArquivamento', header: 'Data Arquivamento', accessorKey: 'dataArquivamento', defaultVisible: true, enableSorting: true, 
        cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> 
      },
      { id: 'codigosCaixa', header: 'Código da Caixa', accessorKey: 'codigosCaixa', defaultVisible: true, enableSorting: true },
      { id: 'classificacaoArquivisticaId', header: 'Classificação', accessorKey: 'classificacaoArquivisticaId', defaultVisible: true, enableSorting: true,
        cellFormatter: (value) => {
          const classif = allClassificacoes.find(c => c.id === value);
          return classif ? `${classif.codigo} - ${classif.descricao}` : value || 'N/A';
        }
      },
      { id: 'destinacaoFinalDisplay', header: 'Destinação Final', accessorKey: 'destinacaoFinalDisplay', defaultVisible: true, enableSorting: true },
      { id: 'anoEliminacaoPrevisto', header: 'Ano Elim. Prev.', accessorKey: 'anoEliminacaoPrevisto', defaultVisible: true, enableSorting: true },
    ], [allClassificacoes, masterPartesMap]);

    React.useEffect(() => {
        try {
            const storedDocs = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const loadedDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : initialDocumentos;
            
            const storedCaixas = localStorage.getItem(CAIXAS_STORAGE_KEY);
            const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;
            
            const storedClassificacoes = localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
            const loadedClassificacoes: Classificacao[] = storedClassificacoes ? JSON.parse(storedClassificacoes) : initialClassificacoes;
            setAllClassificacoes(loadedClassificacoes);
            
            const storedTiposOrigem = localStorage.getItem(TIPOS_ORIGEM_STORAGE_KEY);
            setTiposOrigem(storedTiposOrigem ? JSON.parse(storedTiposOrigem) : initialTiposOrigem);
            
            const storedMasterPartes = localStorage.getItem(PARTES_STORAGE_KEY);
            setMasterPartes(storedMasterPartes ? JSON.parse(storedMasterPartes) : initialPartes);

            const classificacaoMap = new Map(loadedClassificacoes.map(c => [c.id, c]));

            const processedDocs = loadedDocs.map(doc => {
              const classification = doc.classificacaoArquivisticaId ? classificacaoMap.get(doc.classificacaoArquivisticaId) : undefined;
              if (!classification) return doc;

              const updatedDoc = { ...doc };
              updatedDoc.destinacaoFinalDisplay = classification.destinacaoFinal;

              let anoEliminacao = "";
              let effectiveDestination = classification.destinacaoFinal;
              if (doc.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" || doc.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
                  effectiveDestination = "Guarda Permanente";
              }
              
              if (effectiveDestination === 'Eliminação' && doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
                  const dataArquivamentoDate = parseISO(doc.dataArquivamento);
                  const prazoIntermediarioAnosNum = classification.prazoGuardaFaseIntermediariaAnos ?? 0;
                  const anoArquivamento = getYear(dataArquivamentoDate);
                  anoEliminacao = (anoArquivamento + prazoIntermediarioAnosNum + 1).toString();
              }
              updatedDoc.anoEliminacaoPrevisto = anoEliminacao;

              return updatedDoc;
            });
            
            setAllDocuments(processedDocs);

            const eliminationData: { [tipo: string]: { docIds: Set<string>, semPrazoDocIds: Set<string>, eliminacaoPorAno: { [year: string]: Set<string> } } } = {};
            const permanentData: { [tipo: string]: { docIds: Set<string> } } = {};
            const yearsSet = new Set<string>();

            const caixaTypeMap = new Map<string, string>();
            allCaixas.forEach(caixa => {
                if(caixa.codigoCaixa) caixaTypeMap.set(caixa.codigoCaixa, caixa.tipo);
            });

            processedDocs.forEach(doc => {
                const boxCodes = doc.codigosCaixa?.split(',').map(c => c.trim()).filter(Boolean) || [];
                const docBoxTypes = new Set<string>();

                boxCodes.forEach(code => {
                    const type = caixaTypeMap.get(code);
                    if (type) docBoxTypes.add(type);
                });

                if (docBoxTypes.size === 0) docBoxTypes.add("Não Alocado");

                docBoxTypes.forEach(type => {
                    if (!eliminationData[type]) {
                        eliminationData[type] = { docIds: new Set(), semPrazoDocIds: new Set(), eliminacaoPorAno: {} };
                    }
                    eliminationData[type].docIds.add(doc.id);

                    if (doc.destinacaoFinalDisplay === 'Eliminação') {
                        if (doc.anoEliminacaoPrevisto) {
                            const year = doc.anoEliminacaoPrevisto;
                            yearsSet.add(year);
                            if (!eliminationData[type].eliminacaoPorAno[year]) {
                                eliminationData[type].eliminacaoPorAno[year] = new Set();
                            }
                            eliminationData[type].eliminacaoPorAno[year].add(doc.id);
                        } else {
                            eliminationData[type].semPrazoDocIds.add(doc.id);
                        }
                    }

                    let effectiveDestination = doc.destinacaoFinalDisplay;
                    if (doc.alteracaoDestinacaoFinal === "Guarda Permanente – Guarda Amostral" || doc.alteracaoDestinacaoFinal === "Guarda Permanente – Decisão da CPAD") {
                        effectiveDestination = "Guarda Permanente";
                    }
                    if (effectiveDestination === 'Guarda Permanente') {
                        if (!permanentData[type]) {
                           permanentData[type] = { docIds: new Set() };
                       }
                       permanentData[type].docIds.add(doc.id);
                   }
                });
            });

            const sortedYears = Array.from(yearsSet).sort();
            setAllYears(sortedYears);

            const finalEliminationData: EliminationReportData[] = Object.entries(eliminationData).map(([tipo, values]) => {
                const eliminacaoPorAnoArrays: { [year: string]: string[] } = {};
                Object.entries(values.eliminacaoPorAno).forEach(([year, docIdsSet]) => {
                    eliminacaoPorAnoArrays[year] = Array.from(docIdsSet);
                });
                return { tipo, volumeTotalIds: Array.from(values.docIds), semPrazoIds: Array.from(values.semPrazoIds), eliminacaoPorAno: eliminacaoPorAnoArrays };
            }).sort((a, b) => a.tipo.localeCompare(b.tipo));
            
            const totalEliminationRow: EliminationReportData = { tipo: 'Total', volumeTotalIds: [], semPrazoIds: [], eliminacaoPorAno: {} };
            const allVolumeTotalIds = new Set<string>();
            const allSemPrazoIds = new Set<string>();
            const allEliminacaoPorAno: { [year: string]: Set<string> } = {};
            finalEliminationData.forEach(row => {
                row.volumeTotalIds.forEach(id => allVolumeTotalIds.add(id));
                row.semPrazoIds.forEach(id => allSemPrazoIds.add(id));
                sortedYears.forEach(year => {
                    if (row.eliminacaoPorAno[year]) {
                        if (!allEliminacaoPorAno[year]) allEliminacaoPorAno[year] = new Set();
                        row.eliminacaoPorAno[year].forEach(id => allEliminacaoPorAno[year].add(id));
                    }
                });
            });
            totalEliminationRow.volumeTotalIds = Array.from(allVolumeTotalIds);
            totalEliminationRow.semPrazoIds = Array.from(allSemPrazoIds);
            Object.entries(allEliminacaoPorAno).forEach(([year, idSet]) => { totalEliminationRow.eliminacaoPorAno[year] = Array.from(idSet); });
            setEliminationReportData([totalEliminationRow, ...finalEliminationData]);
            
            const finalPermanentData: PermanentReportData[] = Object.entries(permanentData).map(([tipo, values]) => ({
                tipo,
                volumePermanenteIds: Array.from(values.docIds),
            })).sort((a, b) => a.tipo.localeCompare(b.tipo));

            const totalPermanentRow: PermanentReportData = { tipo: 'Total', volumePermanenteIds: [] };
            const allPermanentIds = new Set<string>();
            finalPermanentData.forEach(row => {
                row.volumePermanenteIds.forEach(id => allPermanentIds.add(id));
            });
            totalPermanentRow.volumePermanenteIds = Array.from(allPermanentIds);
            setPermanentReportData([totalPermanentRow, ...finalPermanentData]);

        } catch (error) {
            console.error("Failed to process report data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        setVisibleColumns(
          ALL_CUSTOM_REPORT_COLUMNS.slice(0, 5).reduce((acc, col) => ({...acc, [col.id]: true}), {})
        );
    }, [ALL_CUSTOM_REPORT_COLUMNS]);

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
        setSearched(false);
    };

    const handleSearch = () => {
        const filtered = allDocuments.filter(doc => {
            if (filters.numeroDocumento && !doc.numeroDocumento?.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) return false;
            if (filters.processoOriginario && !doc.processoOriginario?.toLowerCase().includes(filters.processoOriginario.toLowerCase())) return false;
            if (filters.numeroAntigo && !doc.numeroAntigo?.toLowerCase().includes(filters.numeroAntigo.toLowerCase())) return false;
            if (filters.origem && doc.origem !== filters.origem) return false;
            if (filters.tipoDocumento && !doc.tipoDocumento?.toLowerCase().includes(filters.tipoDocumento.toLowerCase())) return false;
            if (filters.descricaoDocumento && !doc.descricaoDocumento?.toLowerCase().includes(filters.descricaoDocumento.toLowerCase())) return false;
            if (filters.partes && !doc.partes?.some(p => p.nome.toLowerCase().includes(filters.partes.toLowerCase()))) return false;
            if (filters.codigoCaixa && !doc.codigosCaixa?.toLowerCase().includes(filters.codigoCaixa.toLowerCase())) return false;
            if (filters.anoEliminacaoPrevisto && doc.anoEliminacaoPrevisto !== filters.anoEliminacaoPrevisto) return false;
            if (filters.codigoAtoM && !doc.codigoAtoM?.toLowerCase().includes(filters.codigoAtoM.toLowerCase())) return false;
            if (filters.observacoesGerais && !doc.observacoesGerais?.toLowerCase().includes(filters.observacoesGerais.toLowerCase())) return false;
            if (filters.codigoClasseJudicial && !doc.codigoClassificacaoJudicialId?.toLowerCase().includes(filters.codigoClasseJudicial.toLowerCase())) return false;
            if (filters.numeroListagemEliminacao && !doc.numeroListagemEliminacao?.toLowerCase().includes(filters.numeroListagemEliminacao.toLowerCase())) return false;
            if (filters.numeroDocumentoTransferencia && !doc.numeroDocumentoTransferencia?.toLowerCase().includes(filters.numeroDocumentoTransferencia.toLowerCase())) return false;
            if (filters.caixaMidia && !doc.midias?.some(m => m.caixaMidia?.toLowerCase().includes(filters.caixaMidia.toLowerCase()))) return false;
            if (filters.palavrasChave && (!doc.palavrasChave || !doc.palavrasChave.some(k => k.toLowerCase().includes(filters.palavrasChave.toLowerCase())))) return false;
    
            if (filters.classificacao && doc.classificacaoArquivisticaId !== filters.classificacao) return false;
            if (filters.status && doc.status !== filters.status) return false;
            if (filters.orgao && doc.orgao !== filters.orgao) return false;
            if (filters.tipoMeio && doc.tipoMeio !== filters.tipoMeio) return false;
            if (filters.generoDocumental && doc.generoDocumental !== filters.generoDocumental) return false;
            if (filters.categoria && doc.categoria !== filters.categoria) return false;
            if (filters.destinacaoFinal && doc.destinacaoFinalDisplay !== filters.destinacaoFinal) return false;
            if (filters.grauSigilo && doc.grauSigilo !== filters.grauSigilo) return false;
            if (filters.necessidadeReclassificacao && (doc.necessidadeReclassificacao || 'Não') !== filters.necessidadeReclassificacao) return false;
    
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

    const toggleColumnVisibility = (columnId: string) => {
        setVisibleColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    const handleSelectAllColumns = () => {
        setVisibleColumns(ALL_CUSTOM_REPORT_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: true }), {}));
    };

    const handleDeselectAllColumns = () => {
        setVisibleColumns({});
    };

    const getCustomReportCellValue = (doc: Documento, column: CustomReportColumn) => {
        if (column.cellFormatter) {
            return column.cellFormatter(doc[column.accessorKey as keyof Documento], doc);
        }
        const value = doc[column.accessorKey as keyof Documento];
        return value === undefined || value === null ? 'N/A' : String(value);
    };
    
    const getSortableValue = React.useCallback((doc: Documento, columnId: string): any => {
        const column = ALL_CUSTOM_REPORT_COLUMNS.find(col => col.id === columnId);
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
    }, [ALL_CUSTOM_REPORT_COLUMNS, allClassificacoes]);

    const displayedResults = React.useMemo(() => {
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
        return sortedResults;
    }, [filteredResults, sorting, getSortableValue]);

    const handleSort = (columnId: string) => {
        const columnConfig = ALL_CUSTOM_REPORT_COLUMNS.find(col => col.id === columnId);
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

    const visibleColumnDefs = React.useMemo(() => {
        return ALL_CUSTOM_REPORT_COLUMNS.filter(col => visibleColumns[col.id]);
    }, [visibleColumns, ALL_CUSTOM_REPORT_COLUMNS]);

    if (isPrinting) {
      return (
        <div className="print-container">
          <Card>
              <CardHeader className="non-printable flex-row items-center justify-between">
                  <div>
                      <CardTitle>Relatório Customizado de Acervo</CardTitle>
                      <CardDescription>Exibindo {displayedResults.length} documentos com as colunas selecionadas.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPrinting(false)}>Voltar</Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir / Salvar PDF
                    </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="w-full">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  {visibleColumnDefs.map(col => (
                                      <TableHead key={col.id}>{col.header}</TableHead>
                                  ))}
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {displayedResults.map(doc => (
                                  <TableRow key={doc.id}>
                                      {visibleColumnDefs.map(col => (
                                          <TableCell key={`${doc.id}-${col.id}`}>
                                              {getCustomReportCellValue(doc, col)}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                      <ScrollBar orientation="horizontal" />
                  </ScrollArea>
              </CardContent>
          </Card>
        </div>
      );
    }

    return (
        <div className={'container mx-auto py-2'}>
            <div>
                <PageHeader title="Relatórios Gerenciais" description="Quantitativos de documentos por tipo de caixa, destinação e previsão de eliminação." />
                
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Relatório de Previsão de Eliminação</CardTitle>
                        <CardDescription>Quantitativo de documentos por tipo de caixa e ano previsto para eliminação.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {isLoading ? (
                            <div className="space-y-4 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>
                        ) : (
                            <ScrollArea className="w-full">
                                <Table className="min-w-full whitespace-nowrap">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-card z-10 font-semibold">Tipo de Caixa</TableHead>
                                            <TableHead className="font-semibold">Volume de Documentos</TableHead>
                                            <TableHead className="font-semibold">Sem prazo</TableHead>
                                            {allYears.map(year => (
                                                <TableHead key={year} className="text-center font-semibold">{year}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {eliminationReportData.map((row) => (
                                            <TableRow key={row.tipo} className={row.tipo === 'Total' ? 'bg-muted hover:bg-muted font-bold' : ''}>
                                                <TableCell className="sticky left-0 bg-card z-10">{row.tipo}</TableCell>
                                                <TableCell>
                                                  <Link href={`/documentos?docIds=${row.volumeTotalIds.join(',')}&reportContext=${encodeURIComponent(`Volume Total para Tipo de Caixa: ${row.tipo}`)}`} className="text-primary hover:underline" prefetch={false} >
                                                      {row.volumeTotalIds.length.toLocaleString()}
                                                  </Link>
                                                </TableCell>
                                                <TableCell>
                                                  <Link href={`/documentos?docIds=${row.semPrazoIds.join(',')}&reportContext=${encodeURIComponent(`Docs Sem Prazo de Elim. para Tipo: ${row.tipo}`)}`} className="text-primary hover:underline" prefetch={false}>
                                                      {row.semPrazoIds.length.toLocaleString()}
                                                  </Link>
                                                </TableCell>
                                                {allYears.map(year => (
                                                    <TableCell key={year} className="text-center">
                                                        {(row.eliminacaoPorAno[year] && row.eliminacaoPorAno[year].length > 0) ? (
                                                            <Link href={`/documentos?docIds=${row.eliminacaoPorAno[year].join(',')}&reportContext=${encodeURIComponent(`Docs de ${row.tipo} para Eliminar em ${year}`)}`} className="text-primary hover:underline" prefetch={false}>
                                                                {row.eliminacaoPorAno[year].length.toLocaleString()}
                                                            </Link>
                                                        ) : 0}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {eliminationReportData.length <= 1 && (
                                    <p className="text-center text-muted-foreground py-8">Nenhum dado de eliminação para exibir.</p>
                                )}
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                <Card className="mb-8">
                     <CardHeader>
                        <CardTitle>Relatório de Guarda Permanente</CardTitle>
                        <CardDescription>Quantitativo de documentos de guarda permanente por tipo de caixa.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                         {isLoading ? (
                            <div className="space-y-4 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-32 w-full" /></div>
                        ) : (
                            <ScrollArea className="w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Tipo de Caixa</TableHead>
                                            <TableHead className="font-semibold">Volume de Documentos Permanentes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                       {permanentReportData.map(row => (
                                           <TableRow key={row.tipo} className={row.tipo === 'Total' ? 'bg-muted hover:bg-muted font-bold' : ''}>
                                               <TableCell>{row.tipo}</TableCell>
                                               <TableCell>
                                                   {row.volumePermanenteIds.length > 0 ? (
                                                    <Link href={`/documentos?docIds=${row.volumePermanenteIds.join(',')}&reportContext=${encodeURIComponent(`Docs Permanentes do Tipo: ${row.tipo}`)}`} className="text-primary hover:underline" prefetch={false}>
                                                        {row.volumePermanenteIds.length.toLocaleString()}
                                                    </Link>
                                                   ) : 0}
                                               </TableCell>
                                           </TableRow>
                                       ))}
                                    </TableBody>
                                </Table>
                                {permanentReportData.length <= 1 && (
                                    <p className="text-center text-muted-foreground py-8">Nenhum documento de guarda permanente encontrado.</p>
                                )}
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Relatório Customizado de Acervo</CardTitle>
                        <CardDescription>Use os filtros para pesquisar no acervo e gere um relatório personalizado para impressão ou PDF.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="numeroDocumento">Número do Documento</Label>
                            <Input id="numeroDocumento" placeholder="Ex: PRC-2023-001" value={filters.numeroDocumento} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
                            <Input id="descricaoDocumento" placeholder="Contém..." value={filters.descricaoDocumento} onChange={handleInputChange} />
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
                            <Label htmlFor="classificacao">Classificação Arquivística</Label>
                            <Select onValueChange={handleSelectChange('classificacao')} value={filters.classificacao}>
                            <SelectTrigger id="classificacao"><SelectValue placeholder="Selecione a classificação" /></SelectTrigger>
                            <SelectContent>
                                {allClassificacoes.map(c => <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.descricao}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status do Documento</Label>
                            <Select onValueChange={handleSelectChange('status')} value={filters.status}>
                            <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
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
                            <Label htmlFor="destinacaoFinal">Destinação Final</Label>
                            <Select onValueChange={handleSelectChange('destinacaoFinal')} value={filters.destinacaoFinal}>
                                <SelectTrigger id="destinacaoFinal"><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                                    <SelectItem value="Vide Guia de Aplicação">Vide Guia de Aplicação</SelectItem>
                                    <SelectItem value="Não se Aplica">Não se Aplica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="origem">Origem</Label>
                            <Select onValueChange={handleSelectChange('origem')} value={filters.origem}>
                                <SelectTrigger id="origem"><SelectValue placeholder="Selecione a origem" /></SelectTrigger>
                                <SelectContent>
                                {tiposOrigem.filter(o => o && o.nome).sort((a, b) => a.nome.localeCompare(b.nome)).map(o => {
                                    const displayValue = o.sigla ? `${o.nome} - ${o.sigla}` : o.nome;
                                    return (<SelectItem key={o.id} value={displayValue}>{displayValue}</SelectItem>);
                                })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partes">Partes Envolvidas</Label>
                            <Input id="partes" placeholder="Contém..." value={filters.partes} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigoCaixa">Código da Caixa</Label>
                            <Input id="codigoCaixa" placeholder="Contém..." value={filters.codigoCaixa} onChange={handleInputChange} />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Checkbox id="segredoJustica" checked={filters.segredoJustica} onCheckedChange={handleCheckboxChange('segredoJustica')} />
                            <Label htmlFor="segredoJustica">Segredo de Justiça</Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClear}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Limpar
                        </Button>
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" /> Buscar
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="mt-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Resultados da Busca</CardTitle>
                            <CardDescription>
                                {searched ? `${displayedResults.length} documento(s) encontrado(s).` : 'Os resultados da sua busca aparecerão aqui.'}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="outline"><ColumnsIcon className="mr-2 h-4 w-4" /> Colunas</Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                                <DropdownMenuLabel>Exibir/Ocultar Colunas</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={handleSelectAllColumns} className="cursor-pointer"><CheckSquare className="mr-2 h-4 w-4" /> Selecionar Todas</DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleDeselectAllColumns} className="cursor-pointer"><Square className="mr-2 h-4 w-4" /> Limpar Todas</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {ALL_CUSTOM_REPORT_COLUMNS.map((column) => (
                                  <DropdownMenuCheckboxItem key={column.id} checked={visibleColumns[column.id] ?? false} onCheckedChange={() => toggleColumnVisibility(column.id)}>{column.header}</DropdownMenuCheckboxItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                             <Button onClick={() => setIsPrinting(true)} disabled={displayedResults.length === 0}>
                                <Printer className="mr-2 h-4 w-4" /> Gerar Relatório para Impressão
                             </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                      {searched ? (
                        displayedResults.length > 0 ? (
                            <ScrollArea className="w-full h-[65vh]">
                                <Table className="min-w-full whitespace-nowrap">
                                    <TableHeader className="sticky top-0 z-10 bg-card">
                                        <TableRow>
                                            {visibleColumnDefs.map((column) => (
                                                <TableHead key={column.id}>
                                                    {column.enableSorting ? (
                                                        <Button variant="ghost" onClick={() => handleSort(column.id)} className="px-1 py-1 h-auto -ml-2">
                                                            {column.header}
                                                            {renderSortIcon(column.id)}
                                                        </Button>
                                                    ) : (
                                                        column.header
                                                    )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedResults.map(doc => (
                                            <TableRow key={doc.id}>
                                                {visibleColumnDefs.map(col => (
                                                    <TableCell key={`${doc.id}-${col.id}`}>{getCustomReportCellValue(doc, col)}</TableCell>
                                                ))}
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
                        <p className="text-sm text-muted-foreground text-center py-4">Realize uma busca para ver os resultados.</p>
                      )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

