
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { ListagemEliminacao, Documento, TipoOrigem } from "@/types";
import { initialTiposOrigem } from "@/lib/mock-data";

const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const TIPOS_ORIGEM_STORAGE_KEY = 'arquivocentral_tipos_origem';

function parseDataAbrangenteForYear(dataAbrangente?: string): string | undefined {
    if (!dataAbrangente) return undefined;
    const matchAno = dataAbrangente.match(/\d{4}/);
    return matchAno ? matchAno[0] : undefined;
}

export default function EditalPrintPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [listagem, setListagem] = React.useState<ListagemEliminacao | null>(null);
    const [datasLimiteGerais, setDatasLimiteGerais] = React.useState("");
    const [unidadeCustodiadora, setUnidadeCustodiadora] = React.useState<{nome: string, sigla?: string}>({nome: ''});
    const [isLoading, setIsLoading] = React.useState(true);
    const [anoEdital, setAnoEdital] = React.useState(new Date().getFullYear());

    React.useEffect(() => {
        if (!id) return;

        try {
            const storedListagens = localStorage.getItem(LISTAGENS_STORAGE_KEY);
            const allListagens = storedListagens ? JSON.parse(storedListagens) : [];
            const currentListagem = allListagens.find((l: ListagemEliminacao) => l.id === id);

            if (!currentListagem) {
                toast({ variant: "destructive", title: "Erro", description: "Listagem não encontrada." });
                return;
            }
            setListagem(currentListagem);
            
            if(currentListagem.dataPublicacaoEdital) {
                setAnoEdital(new Date(currentListagem.dataPublicacaoEdital).getFullYear());
            }

            const storedDocumentos = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const allDocumentos: Documento[] = storedDocumentos ? JSON.parse(storedDocumentos) : [];
            
            const storedTiposOrigem = localStorage.getItem(TIPOS_ORIGEM_STORAGE_KEY);
            const allTiposOrigem: TipoOrigem[] = storedTiposOrigem ? JSON.parse(storedTiposOrigem) : initialTiposOrigem;

            const docsNestaListagem = allDocumentos.filter(d => currentListagem.documentoIds.includes(d.id));

            const allYears = new Set<number>();
            docsNestaListagem.forEach(d => {
                const yearStr = parseDataAbrangenteForYear(d.dataAbrangente);
                if (yearStr) {
                    const yearNum = parseInt(yearStr, 10);
                    if (!isNaN(yearNum)) {
                        allYears.add(yearNum);
                    }
                }
            });
            
            const sortedAllYears = Array.from(allYears).sort();
            if (sortedAllYears.length > 1) {
              setDatasLimiteGerais(`${sortedAllYears[0]} a ${sortedAllYears[sortedAllYears.length - 1]}`);
            } else if (sortedAllYears.length === 1) {
              setDatasLimiteGerais(String(sortedAllYears[0]));
            }
            
            if (currentListagem.unidadeSetor) {
                const setor = allTiposOrigem.find(o => o.nome === currentListagem.unidadeSetor || `${o.nome} - ${o.sigla}` === currentListagem.unidadeSetor);
                if (setor) {
                    setUnidadeCustodiadora({nome: setor.nome, sigla: setor.sigla});
                } else {
                    setUnidadeCustodiadora({nome: currentListagem.unidadeSetor});
                }
            }


        } catch (error) {
            console.error("Failed to generate edital data:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao gerar dados para o edital." });
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    if (isLoading) return <div className="p-8 text-center">Carregando edital...</div>;
    if (!listagem) return <div className="p-8 text-center">Não foi possível carregar a listagem.</div>;
    
    const tipoDocumentacao = listagem.tipoListagem || "Documentos";
    const nomeUnidade = unidadeCustodiadora.nome || "Não especificado";
    const siglaUnidade = unidadeCustodiadora.sigla ? `(${unidadeCustodiadora.sigla})` : '';

    return (
        <div className="bg-white text-black p-12 font-serif text-justify">
            <Button variant="outline" className="absolute top-4 right-4 print:hidden" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimir
            </Button>

            <header className="text-center mb-10">
                <h1 className="text-lg font-bold">EDITAL DE CIÊNCIA DE ELIMINAÇÃO DE DOCUMENTOS TRF2 Nº {listagem.numeroEditalCiencia || 'XXX'} / {anoEdital}</h1>
            </header>

            <main className="text-sm leading-relaxed indent-8 space-y-4">
                <p>
                    O Presidente / Diretor do Foro do Tribunal Regional Federal da 2ª Região, no uso de suas atribuições legais, e considerando o disposto na Resolução TRF2-RSP-2021/0060, de acordo com as Listagens de Eliminação de Documentos nº {listagem.numeroListagem} e seus respectivos anexos, aprovados pela Comissão Permanente de Avaliação Documental (CPAD) do Tribunal Regional Federal da 2ª Região, por intermédio da Nº {listagem.memoriaReuniao || 'XXX'} da Memória de Reunião que aprovou a(s) LED, faz saber, a quem possa interessar, que, transcorridos 45 (quarenta e cinco) dias da data de publicação deste Edital no Diário Eletrônico da Justiça Federal da 2ª Região (e-DJF2R), se não houver oposição, o {nomeUnidade} {siglaUnidade} eliminará os documentos constantes de ({tipoDocumentacao}), do período de ({datasLimiteGerais || "N/A"}), do Tribunal Regional Federal da 2ª Região. A relação de ({tipoDocumentacao}) a serem eliminados, constante do Anexo deste Edital, encontra-se à disposição no {nomeUnidade} e na página do Tribunal Regional Federal da 2ª Região na internet (www.trf2.jus.br). Os interessados, no prazo citado, poderão requerer, às suas expensas, o desentranhamento de documentos ou cópias de peças do processo, mediante petição, com a respectiva qualificação e demonstração de legitimidade do pedido, dirigida à Comissão Permanente de Avaliação Documental do Tribunal Regional Federal da 2ª Região. Após deferimento do pedido, os interessados serão devidamente comunicados, devendo comparecer ao {nomeUnidade} desta Corte para a retirada do(s) documento(s). Verificada a existência de mais de uma parte interessada, prevalecerá o primeiro pedido protocolizado.
                </p>
            </main>

            <footer className="mt-24 text-center text-sm">
                <div className="inline-block">
                    <p className="border-t border-black px-8 pt-1">Cargo da autoridade máxima do Órgão do Tribunal Regional Federal da 2ª Região</p>
                </div>
            </footer>
        </div>
    );
}

