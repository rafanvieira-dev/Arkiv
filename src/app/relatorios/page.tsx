
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import type { Documento, Caixa } from "@/types";
import { placeholderDocumentos, initialCaixas } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportRow {
  tipo: string;
  volumeTotal: number;
  semPrazo: number;
  eliminacaoPorAno: { [year: string]: number };
}

const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';

export default function RelatoriosPage() {
    const [reportData, setReportData] = React.useState<ReportRow[]>([]);
    const [allYears, setAllYears] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        try {
            const storedDocs = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const storedCaixas = localStorage.getItem(CAIXAS_STORAGE_KEY);
            const allDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
            const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;

            const data: { [tipo: string]: { docIds: Set<string>, semPrazoDocIds: Set<string>, eliminacaoPorAno: { [year: string]: Set<string> } } } = {};
            const yearsSet = new Set<string>();

            const caixaTypeMap = new Map<string, string>();
            allCaixas.forEach(caixa => {
                if(caixa.codigoCaixa) caixaTypeMap.set(caixa.codigoCaixa, caixa.tipo);
            });

            allDocs.forEach(doc => {
                const boxCodes = doc.codigosCaixa?.split(',').map(c => c.trim()).filter(Boolean) || [];
                const docBoxTypes = new Set<string>();

                boxCodes.forEach(code => {
                    const type = caixaTypeMap.get(code);
                    if (type) {
                        docBoxTypes.add(type);
                    }
                });

                if (docBoxTypes.size === 0) {
                     docBoxTypes.add("Não Alocado");
                }

                docBoxTypes.forEach(type => {
                    if (!data[type]) {
                        data[type] = { docIds: new Set(), semPrazoDocIds: new Set(), eliminacaoPorAno: {} };
                    }
                    data[type].docIds.add(doc.id);

                    if (doc.anoEliminacaoPrevisto) {
                        const year = doc.anoEliminacaoPrevisto;
                        yearsSet.add(year);
                        if (!data[type].eliminacaoPorAno[year]) {
                            data[type].eliminacaoPorAno[year] = new Set();
                        }
                        data[type].eliminacaoPorAno[year].add(doc.id);
                    } else {
                        data[type].semPrazoDocIds.add(doc.id);
                    }
                });
            });

            const sortedYears = Array.from(yearsSet).sort();
            setAllYears(sortedYears);

            const finalReportData: ReportRow[] = Object.entries(data).map(([tipo, values]) => {
                const eliminacaoPorAnoCounts: { [year: string]: number } = {};
                Object.entries(values.eliminacaoPorAno).forEach(([year, docIdsSet]) => {
                    eliminacaoPorAnoCounts[year] = docIdsSet.size;
                });

                return {
                    tipo: tipo,
                    volumeTotal: values.docIds.size,
                    semPrazo: values.semPrazoDocIds.size,
                    eliminacaoPorAno: eliminacaoPorAnoCounts,
                };
            }).sort((a, b) => a.tipo.localeCompare(b.tipo));
            
            const totalRow: ReportRow = {
                tipo: 'Total',
                volumeTotal: 0,
                semPrazo: 0,
                eliminacaoPorAno: {}
            };

            finalReportData.forEach(row => {
                totalRow.volumeTotal += row.volumeTotal;
                totalRow.semPrazo += row.semPrazo;
                sortedYears.forEach(year => {
                    totalRow.eliminacaoPorAno[year] = (totalRow.eliminacaoPorAno[year] || 0) + (row.eliminacaoPorAno[year] || 0);
                });
            });

            setReportData([totalRow, ...finalReportData]);

        } catch (error) {
            console.error("Failed to process report data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Relatório de Previsão de Eliminação" description="Quantitativo de documentos por tipo de caixa e ano previsto para eliminação." />
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : (
                        <ScrollArea className="w-full">
                            <Table className="min-w-full whitespace-nowrap">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 bg-card z-10 font-semibold">Tipo</TableHead>
                                        <TableHead className="font-semibold">Volume de Processos</TableHead>
                                        <TableHead className="font-semibold">Sem prazo</TableHead>
                                        {allYears.map(year => (
                                            <TableHead key={year} className="text-center font-semibold">{year}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.map((row) => (
                                        <TableRow key={row.tipo} className={row.tipo === 'Total' ? 'bg-muted hover:bg-muted font-bold' : ''}>
                                            <TableCell className="sticky left-0 bg-card z-10">{row.tipo}</TableCell>
                                            <TableCell>{row.volumeTotal.toLocaleString()}</TableCell>
                                            <TableCell>{row.semPrazo.toLocaleString()}</TableCell>
                                            {allYears.map(year => (
                                                <TableCell key={year} className="text-center">
                                                    {row.eliminacaoPorAno[year] ? row.eliminacaoPorAno[year].toLocaleString() : 0}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {reportData.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Nenhum dado para exibir no relatório.</p>
                            )}
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
