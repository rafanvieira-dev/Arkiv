
"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    FileText, Send, ArrowRightLeft, AlertTriangle, PlusCircle, Archive, Search,
    FileUp, Trash2, Clock, Box, ListChecks, CalendarX
} from "lucide-react";
import { 
    placeholderDocumentos, 
    placeholderSolicitacoesInitial, 
    initialTransferencias,
    initialCaixas,
    simulatedListagensData,
} from "@/lib/mock-data";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import type { Documento, Solicitacao, Transferencia, Caixa, ListagemEliminacao } from '@/types';


const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const SOLICITACOES_STORAGE_KEY = 'arquivocentral_solicitacoes';
const TRANSFERENCIAS_STORAGE_KEY = 'arquivocentral_transferencias';
const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';
const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';


export default function DashboardPage() {
    const [stats, setStats] = React.useState({
        totalDocs: 0,
        pendingSolicitacoes: 0,
        pendingTransferencias: 0,
        docsToExpire: 0,
        docsExpired: 0,
        totalDocsArquivados: 0,
        totalDocsEmprestados: 0,
        totalDocsDesarquivados: 0,
        totalDocsEliminados: 0,
        totalDocsAguardandoEliminacao: 0,
        totalCaixas: 0,
        totalListagens: 0,
    });
    
    const [recentActivities, setRecentActivities] = React.useState<{ type: string; id: string; date: string; link: string; }[]>([]);
    const [years, setYears] = React.useState({ current: new Date().getFullYear(), next: new Date().getFullYear() + 1 });

    React.useEffect(() => {
        // Data loading and processing will only run on the client side.
        const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
        const allDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
        
        const storedSolicitacoes = window.localStorage.getItem(SOLICITACOES_STORAGE_KEY);
        const allSolicitacoes: Solicitacao[] = storedSolicitacoes ? JSON.parse(storedSolicitacoes) : placeholderSolicitacoesInitial;
        
        const storedTransferencias = window.localStorage.getItem(TRANSFERENCIAS_STORAGE_KEY);
        const allTransferencias: Transferencia[] = storedTransferencias ? JSON.parse(storedTransferencias) : initialTransferencias;
        
        const storedCaixas = window.localStorage.getItem(CAIXAS_STORAGE_KEY);
        const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;

        const storedListagens = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
        const allListagens: ListagemEliminacao[] = storedListagens ? JSON.parse(storedListagens) : simulatedListagensData;

        const currentYear = new Date().getFullYear();
        setYears({ current: currentYear, next: currentYear + 1 });

        const totalDocs = allDocs.length;
        const pendingSolicitacoes = allSolicitacoes.filter(s => s.status === 'Pendente').length;
        const pendingTransferencias = allTransferencias.filter(t => t.status === 'Pendente').length;
        
        const docsToExpire = allDocs.filter(d => 
            d.anoEliminacaoPrevisto && parseInt(d.anoEliminacaoPrevisto, 10) === currentYear + 1
        ).length;
        
        const docsExpired = allDocs.filter(d => 
            d.anoEliminacaoPrevisto && parseInt(d.anoEliminacaoPrevisto, 10) <= currentYear
        ).length;
        
        const totalDocsArquivados = allDocs.filter(d => d.status === 'Arquivado').length;
        const totalDocsEmprestados = allDocs.filter(d => d.status === 'Emprestado').length;
        const totalDocsDesarquivados = allDocs.filter(d => d.status === 'Desarquivado').length;
        const totalDocsEliminados = allDocs.filter(d => d.status === 'Eliminado').length;
        const totalDocsAguardandoEliminacao = allDocs.filter(d => d.status === 'Aguardando prazo para eliminação').length;

        const totalCaixas = allCaixas.length;
        const totalListagens = allListagens.length;

        setStats({ 
            totalDocs, 
            pendingSolicitacoes, 
            pendingTransferencias, 
            docsToExpire,
            docsExpired,
            totalDocsArquivados,
            totalDocsEmprestados,
            totalDocsDesarquivados,
            totalDocsEliminados,
            totalDocsAguardandoEliminacao,
            totalCaixas,
            totalListagens
        });

        const newRecentActivities = [
            ...allTransferencias.filter(t => t.status === 'Pendente').map(t => ({ type: 'Transferência Pendente', id: t.id, date: t.dataTransferencia, link: `/transferencias/${t.id}` })),
            ...allSolicitacoes.filter(s => s.status === 'Pendente').map(s => ({ type: 'Solicitação Pendente', id: s.numeroSolicitacao, date: s.dataSolicitacao, link: `/solicitacoes` }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        setRecentActivities(newRecentActivities);

    }, []);

    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Dashboard" description="Visão geral do sistema ArquivoCentral." />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/documentos" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocs}</div>
                            <p className="text-xs text-muted-foreground">Documentos no acervo</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/documentos?status=Arquivado" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos Arquivados</CardTitle>
                            <Archive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocsArquivados}</div>
                            <p className="text-xs text-muted-foreground">Status "Arquivado"</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/documentos?status=Emprestado" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos Emprestados</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocsEmprestados}</div>
                            <p className="text-xs text-muted-foreground">Status "Emprestado"</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/documentos?status=Desarquivado" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos Desarquivados</CardTitle>
                            <FileUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocsDesarquivados}</div>
                            <p className="text-xs text-muted-foreground">Status "Desarquivado"</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/documentos?status=Aguardando%20prazo%20para%20elimina%C3%A7%C3%A3o" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aguardando Eliminação</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocsAguardandoEliminacao}</div>
                            <p className="text-xs text-muted-foreground">Status "Aguardando prazo"</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/documentos?status=Eliminado" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos Eliminados</CardTitle>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocsEliminados}</div>
                            <p className="text-xs text-muted-foreground">Status "Eliminado"</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/caixas" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Caixas</CardTitle>
                            <Box className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCaixas}</div>
                            <p className="text-xs text-muted-foreground">Caixas cadastradas</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/listagens-eliminacao" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Listagens</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalListagens}</div>
                            <p className="text-xs text-muted-foreground">Listagens de eliminação</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/solicitacoes" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingSolicitacoes}</div>
                            <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/transferencias" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transferências Pendentes</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingTransferencias}</div>
                            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/documentos?anoElimPrevistoExato=${years.next}`} className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos a Expirar</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.docsToExpire}</div>
                            <p className="text-xs text-muted-foreground">Com eliminação prevista para o próximo ano</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/documentos?anoElimPrevistoAte=${years.current}`} className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos Expirados</CardTitle>
                            <CalendarX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.docsExpired}</div>
                            <p className="text-xs text-muted-foreground">Eliminação neste ano ou anterior</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Atividades Pendentes</CardTitle>
                        <CardDescription>Ações recentes que requerem sua atenção.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? recentActivities.map(activity => (
                                <div key={activity.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            {activity.type.includes('Transferência') ? <ArrowRightLeft className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{activity.type}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ID: {activity.id} - <ClientSideDateFormatter isoDateString={activity.date} />
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={activity.link} passHref>
                                        <Button variant="outline" size="sm">Ver</Button>
                                    </Link>
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade pendente.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                         <CardDescription>Atalhos para as funções mais comuns.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href="/documentos" passHref><Button className="w-full justify-start"><PlusCircle className="mr-2 h-4 w-4" />Adicionar ao Acervo</Button></Link>
                        <Link href="/caixas" passHref><Button className="w-full justify-start"><Archive className="mr-2 h-4 w-4" />Gerenciar Caixas</Button></Link>
                        <Link href="/busca-avancada" passHref><Button className="w-full justify-start"><Search className="mr-2 h-4 w-4" />Busca Avançada</Button></Link>
                         <Link href="/transferencias/publica" passHref><Button variant="secondary" className="w-full justify-start"><Send className="mr-2 h-4 w-4" />Nova Transferência</Button></Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
