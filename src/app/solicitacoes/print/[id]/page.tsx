
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import type { Solicitacao, Documento } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons/logo";
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
            <header className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <Logo className="h-16 w-16 text-black" />
                    <div>
                        <h1 className="text-2xl font-bold">Guia de Remessa de Documentos</h1>
                        <p className="text-sm">Arquivo do Tribunal Regional Federal da 2ª Região</p>
                    </div>
                </div>
                 <div>
                    <p className="font-bold">Nº Solicitação:</p>
                    <p>{solicitacao.numeroSolicitacao}</p>
                </div>
            </header>

            <main>
                <section className="mb-6">
                    <h2 className="text-lg font-bold border-b border-black mb-2">Dados do Solicitante</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <p><strong>Nome:</strong> {solicitacao.nomeSolicitante}</p>
                        <p><strong>Setor:</strong> {solicitacao.setorSolicitante || 'N/A'}</p>
                        <p><strong>Matrícula:</strong> {solicitacao.matriculaSolicitante || 'N/A'}</p>
                        <p><strong>E-mail:</strong> {solicitacao.emailContato || 'N/A'}</p>
                    </div>
                </section>
                
                 <section className="mb-6">
                    <h2 className="text-lg font-bold border-b border-black mb-2">Dados da Solicitação</h2>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
                        <p><strong>Tipo:</strong> {solicitacao.tipo}</p>
                        <p><strong>Data da Solicitação:</strong> <ClientSideDateFormatter isoDateString={solicitacao.dataSolicitacao} /></p>
                        <p><strong>Data do Atendimento:</strong> <ClientSideDateFormatter isoDateString={solicitacao.dataAtendimento} /></p>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-bold border-b border-black mb-2">Documentos Solicitados</h2>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="p-2">Item</th>
                                <th className="p-2">Nº Documento</th>
                                <th className="p-2">Espécie do Documento</th>
                                <th className="p-2">Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentos.map((doc, index) => (
                                <tr key={doc.id} className="border-b border-gray-300">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{doc.numeroDocumento || 'N/A'}</td>
                                    <td className="p-2">{doc.tipoDocumento || 'N/A'}</td>
                                    <td className="p-2">{doc.segredoJustica === 'Sim' ? '*** Segredo de Justiça ***' : doc.descricaoDocumento || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>

            <footer className="mt-20 grid grid-cols-2 gap-12 text-center">
                <div>
                    <div className="border-t border-black w-3/4 mx-auto pt-2">
                        <p>_________________________________________</p>
                        <p className="font-bold">{solicitacao.nomeSolicitante}</p>
                        <p>(Assinatura do Solicitante - Recebimento)</p>
                         <p className="mt-2 text-xs">Data: ____/____/______</p>
                    </div>
                </div>
                 <div>
                    <div className="border-t border-black w-3/4 mx-auto pt-2">
                        <p>_________________________________________</p>
                        <p className="font-bold">Servidor do Arquivo</p>
                        <p>(Assinatura do Atendente - Devolução)</p>
                        <p className="mt-2 text-xs">Data: ____/____/______</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
