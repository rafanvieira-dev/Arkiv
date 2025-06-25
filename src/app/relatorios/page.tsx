
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import type { Documento, Caixa, ParteDocumento } from "@/types";
import { placeholderDocumentos, initialCaixas, initialClassificacoes } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CheckSquare, ColumnsIcon, Printer, Square } from "lucide-react";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";


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

type CustomReportColumn = {
  id: keyof Documento | string;
  header: string;
  accessorKey: keyof Documento | string;
  cellFormatter?: (value: any, doc: Documento) => React.ReactNode;
};

const ALL_CUSTOM_REPORT_COLUMNS: CustomReportColumn[] = [
    { id: 'id', header: 'ID Interno', accessorKey: 'id' },
    { id: 'status', header: 'Status', accessorKey: 'status' },
    { id: 'orgao', header: 'Órgão', accessorKey: 'orgao' },
    { id: 'origem', header: 'Origem', accessorKey: 'origem' },
    { id: 'tipoMeio', header: 'Tipo de Meio', accessorKey: 'tipoMeio' },
    { id: 'generoDocumental', header: 'Gênero', accessorKey: 'generoDocumental' },
    { id: 'categoria', header: 'Categoria', accessorKey: 'categoria' },
    { id: 'tipoDocumento', header: 'Espécie de Documento', accessorKey: 'tipoDocumento' },
    { id: 'numeroDocumento', header: 'Nº Documento', accessorKey: 'numeroDocumento' },
    { id: 'dataAbrangente', header: 'Data Abrangente', accessorKey: 'dataAbrangente' },
    { id: 'descricaoDocumento', header: 'Descrição', accessorKey: 'descricaoDocumento' },
    { 
        id: 'partes', header: 'Partes Envolvidas', accessorKey: 'partes', 
        cellFormatter: (partes?: ParteDocumento[]) => partes?.map(p => p.nome).join(', ') || 'N/A'
    },
    { id: 'documentosRelacionadosIds', header: 'Docs Relacionados', accessorKey: 'documentosRelacionadosIds' },
    { id: 'dataArquivamento', header: 'Data Arquivamento', accessorKey: 'dataArquivamento', cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { id: 'quantidadeVolumes', header: 'Qtd. Volumes', accessorKey: 'quantidadeVolumes' },
    { id: 'quantidadeApensos', header: 'Qtd. Apensos', accessorKey: 'quantidadeApensos' },
    { id: 'numerosApensos', header: 'Nº Apensos', accessorKey: 'numerosApensos' },
    { id: 'totalMidias', header: 'Total Mídias', accessorKey: 'totalMidias' },
    { id: 'tipoMidiaDetalhe', header: 'Tipo Mídia', accessorKey: 'tipoMidiaDetalhe' },
    { id: 'numeroMidiaDetalhe', header: 'Nº Mídia', accessorKey: 'numeroMidiaDetalhe' },
    { id: 'paginaMidiaDetalhe', header: 'Página Mídia', accessorKey: 'paginaMidiaDetalhe' },
    { id: 'digitalizado', header: 'Digitalizado', accessorKey: 'digitalizado' },
    { id: 'tipoBaixa', header: 'Tipo Baixa', accessorKey: 'tipoBaixa' },
    { id: 'dataBaixa', header: 'Data Baixa', accessorKey: 'dataBaixa', cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
    { 
        id: 'classificacaoArquivisticaId', header: 'Classificação', accessorKey: 'classificacaoArquivisticaId',
        cellFormatter: (value, doc) => {
            const classif = initialClassificacoes.find(c => c.id === value);
            return classif ? `${classif.codigo} - ${classif.descricao}` : (value || 'N/A');
        }
    },
    { id: 'prazoArquivoCorrenteDisplay', header: 'Prazo Arq. Corrente', accessorKey: 'prazoArquivoCorrenteDisplay' },
    { id: 'prazoArquivoIntermediarioDisplay', header: 'Prazo Arq. Interm.', accessorKey: 'prazoArquivoIntermediarioDisplay' },
    { id: 'destinacaoFinalDisplay', header: 'Destinação Final', accessorKey: 'destinacaoFinalDisplay' },
    { id: 'anoEliminacaoPrevisto', header: 'Ano Elim. Prev.', accessorKey: 'anoEliminacaoPrevisto' },
    { id: 'segredoJustica', header: 'Segredo de Justiça', accessorKey: 'segredoJustica' },
    { id: 'grauSigilo', header: 'Sigilo LAI', accessorKey: 'grauSigilo' },
    { id: 'codigosCaixa', header: 'Código da Caixa', accessorKey: 'codigosCaixa' },
    { id: 'codigoAtoM', header: 'AtoM', accessorKey: 'codigoAtoM' },
    { id: 'numeroListagemEliminacao', header: 'Listagem Eliminação', accessorKey: 'numeroListagemEliminacao' },
    { id: 'dataCadastro', header: 'Data de Cadastro', accessorKey: 'dataCadastro', cellFormatter: (value) => <ClientSideDateFormatter isoDateString={value} /> },
];


export default function RelatoriosPage() {
    const [eliminationReportData, setEliminationReportData] = React.useState<EliminationReportData[]>([]);
    const [permanentReportData, setPermanentReportData] = React.useState<PermanentReportData[]>([]);
    const [allYears, setAllYears] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // State for custom report
    const [allDocuments, setAllDocuments] = React.useState<Documento[]>([]);
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        try {
            const storedDocs = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const loadedDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
            setAllDocuments(loadedDocs);

            const storedCaixas = localStorage.getItem(CAIXAS_STORAGE_KEY);
            const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;

            const eliminationData: { [tipo: string]: { docIds: Set<string>, semPrazoDocIds: Set<string>, eliminacaoPorAno: { [year: string]: Set<string> } } } = {};
            const permanentData: { [tipo: string]: { docIds: Set<string> } } = {};
            const yearsSet = new Set<string>();

            const caixaTypeMap = new Map<string, string>();
            allCaixas.forEach(caixa => {
                if(caixa.codigoCaixa) caixaTypeMap.set(caixa.codigoCaixa, caixa.tipo);
            });

            loadedDocs.forEach(doc => {
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

            // Initialize visible columns for custom report
            setVisibleColumns(
              ALL_CUSTOM_REPORT_COLUMNS.slice(0, 5).reduce((acc, col) => ({...acc, [col.id]: true}), {})
            );

        } catch (error) {
            console.error("Failed to process report data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

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

    const visibleColumnDefs = React.useMemo(() => {
        return ALL_CUSTOM_REPORT_COLUMNS.filter(col => visibleColumns[col.id]);
    }, [visibleColumns]);

    if (isPrinting) {
      return (
        <div className="print-container">
          <Card>
              <CardHeader className="non-printable flex flex-row items-center justify-between">
                  <div>
                      <CardTitle>Relatório Customizado de Acervo</CardTitle>
                      <CardDescription>Exibindo {allDocuments.length} documentos com as colunas selecionadas.</CardDescription>
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
                              {allDocuments.map(doc => (
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
                        <CardTitle>Gerador de Relatório Customizado</CardTitle>
                        <CardDescription>Selecione as colunas desejadas para criar um relatório personalizado do acervo.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <ColumnsIcon className="mr-2 h-4 w-4" />
                              Selecionar Colunas
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-96 overflow-y-auto">
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
                            {ALL_CUSTOM_REPORT_COLUMNS.map((column) => (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={visibleColumns[column.id]}
                                onCheckedChange={() => toggleColumnVisibility(column.id)}
                              >
                                {column.header}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => setIsPrinting(true)}>Gerar Relatório</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
