
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import type { Documento, Caixa } from "@/types";
import { placeholderDocumentos, initialCaixas } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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

export default function RelatoriosPage() {
    const [eliminationReportData, setEliminationReportData] = React.useState<EliminationReportData[]>([]);
    const [permanentReportData, setPermanentReportData] = React.useState<PermanentReportData[]>([]);
    const [allYears, setAllYears] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        try {
            const storedDocs = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const storedCaixas = localStorage.getItem(CAIXAS_STORAGE_KEY);
            const allDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
            const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;

            const eliminationData: { [tipo: string]: { docIds: Set<string>, semPrazoDocIds: Set<string>, eliminacaoPorAno: { [year: string]: Set<string> } } } = {};
            const permanentData: { [tipo: string]: { docIds: Set<string> } } = {};
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
                    if (type) docBoxTypes.add(type);
                });

                if (docBoxTypes.size === 0) docBoxTypes.add("Não Alocado");

                docBoxTypes.forEach(type => {
                    // Elimination Report Logic
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

                    // Permanent Report Logic
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

            // Process Elimination Report Data
            const finalEliminationData: EliminationReportData[] = Object.entries(eliminationData).map(([tipo, values]) => {
                const eliminacaoPorAnoArrays: { [year: string]: string[] } = {};
                Object.entries(values.eliminacaoPorAno).forEach(([year, docIdsSet]) => {
                    eliminacaoPorAnoArrays[year] = Array.from(docIdsSet);
                });
                return { tipo, volumeTotalIds: Array.from(values.docIds), semPrazoIds: Array.from(values.semPrazoDocIds), eliminacaoPorAno: eliminacaoPorAnoArrays };
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
            
            // Process Permanent Report Data
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

    return (
        <div className="container mx-auto py-2">
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

            <Card>
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
        </div>
    );
}
