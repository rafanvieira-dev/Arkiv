
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import type { Solicitacao, Documento } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";


const SOLICITACOES_STORAGE_KEY = 'arquivocentral_solicitacoes';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';

export default function GuiaRemessaPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    
    const [solicitacao, setSolicitacao] = React.useState<Solicitacao | null>(null);
    const [documentos, setDocumentos] = React.useState<Documento[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!id) return;
        try {
            const storedSolicitacoes = window.localStorage.getItem(SOLICITACOES_STORAGE_KEY);
            const allSolicitacoes: Solicitacao[] = storedSolicitacoes ? JSON.parse(storedSolicitacoes) : [];
            const currentSolicitacao = allSolicitacoes.find(s => s.id === id);
            
            if (currentSolicitacao) {
                setSolicitacao(currentSolicitacao);
                const storedDocumentos = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
                const allDocumentos: Documento[] = storedDocumentos ? JSON.parse(storedDocumentos) : [];
                const relatedDocs = allDocumentos.filter(d => currentSolicitacao.documentoIds.includes(d.id));
                setDocumentos(relatedDocs);
            } else {
                 toast({ variant: "destructive", title: "Erro", description: "Solicitação não encontrada." });
                 setTimeout(() => window.close(), 1500);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados da solicitação." });
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    React.useEffect(() => {
        if (!isLoading && solicitacao) {
            setTimeout(() => window.print(), 500);
        }
    }, [isLoading, solicitacao]);

    if (isLoading) {
        return <div className="p-8 text-center">Carregando guia de remessa...</div>;
    }

    if (!solicitacao) {
        return <div className="p-8 text-center">Solicitação não encontrada. Esta janela será fechada.</div>;
    }

    return (
        <div className="bg-white text-black p-8 font-sans">
             <Button
                variant="outline"
                className="absolute top-4 right-4 print:hidden"
                onClick={() => window.print()}
            >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
            </Button>
            <header className="text-center mb-8">
                <h1 className="text-xl font-bold uppercase">Guia de Remessa de Documentos</h1>
                <p className="font-bold">Nº da Solicitação: {solicitacao.numeroSolicitacao}</p>
            </header>

            <main>
                <section className="mb-6 border border-black p-4">
                    <h2 className="text-base font-bold mb-2 -mt-1">Dados da Solicitação</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <p><strong>Solicitante:</strong> {solicitacao.nomeSolicitante}</p>
                        <p><strong>Setor:</strong> {solicitacao.setorSolicitante || 'N/A'}</p>
                        <p><strong>Tipo de Solicitação:</strong> {solicitacao.tipo}</p>
                        <p><strong>Data da Solicitação:</strong> <ClientSideDateFormatter isoDateString={solicitacao.dataSolicitacao} /></p>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-base font-bold mb-2">Documentos Solicitados/Movimentados</h2>
                    <table className="w-full text-left text-sm border-collapse border border-black">
                        <thead>
                            <tr className="border-b border-black bg-gray-100">
                                <th className="p-2 border-r border-black font-bold">Nº Documento</th>
                                <th className="p-2 border-r border-black font-bold">Origem</th>
                                <th className="p-2 font-bold">Descrição Breve</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentos.map((doc, index) => (
                                <tr key={doc.id} className="border-b border-gray-300">
                                    <td className="p-2 border-r border-black">{doc.numeroDocumento || 'N/A'}</td>
                                    <td className="p-2 border-r border-black">{doc.origem || 'N/A'}</td>
                                    <td className="p-2">{doc.segredoJustica === 'Sim' ? '*** Segredo de Justiça ***' : doc.descricaoDocumento || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                 <section className="mt-8 text-sm space-y-4">
                    <p>Declaro ter recebido o(s) documento(s) acima listado(s) na data indicada.</p>
                    <p>Declaro que o(s) documento(s) acima listado(s) foi(ram) devolvido(s) na data indicada.</p>
                </section>

            </main>

            <footer className="mt-16 grid grid-cols-2 gap-12 text-center text-sm">
                <div>
                    <p className="border-t border-black w-full mx-auto pt-1">Assinatura do Solicitante</p>
                    <p className="mt-2 text-xs">Data: ____/____/______</p>
                </div>
                 <div>
                    <p className="border-t border-black w-full mx-auto pt-1">Assinatura do Atendente</p>
                    <p className="mt-2 text-xs">Data: ____/____/______</p>
                </div>
            </footer>
        </div>
    );
}
