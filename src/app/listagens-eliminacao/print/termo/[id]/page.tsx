
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { ListagemEliminacao, Documento, Classificacao } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';

function parseDataAbrangenteForYear(dataAbrangente?: string): string | undefined {
    if (!dataAbrangente) return undefined;
    const matchAno = dataAbrangente.match(/\d{4}/);
    return matchAno ? matchAno[0] : undefined;
}

function dataPorExtenso(isoDate: string): string {
    const date = parseISO(isoDate);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export default function TermoPrintPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [listagem, setListagem] = React.useState<ListagemEliminacao | null>(null);
    const [documentos, setDocumentos] = React.useState<Documento[]>([]);
    const [classificacoes, setClassificacoes] = React.useState<Classificacao[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

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
            if (!currentListagem.dataProducaoTermoEliminacao) {
                toast({ variant: "destructive", title: "Erro", description: "Esta listagem ainda não foi efetivada (não possui data de produção do termo)." });
                return;
            }
            setListagem(currentListagem);
            
            const storedDocumentos = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const allDocumentos: Documento[] = storedDocumentos ? JSON.parse(storedDocumentos) : [];
            const docsNestaListagem = allDocumentos.filter(d => currentListagem.documentoIds.includes(d.id));
            setDocumentos(docsNestaListagem);
            
            const storedClassificacoes = localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
            const allClassificacoes: Classificacao[] = storedClassificacoes ? JSON.parse(storedClassificacoes) : [];
            setClassificacoes(allClassificacoes);

        } catch (error) {
            console.error("Failed to generate termo data:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao gerar dados para o termo." });
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    const aggregatedData = React.useMemo(() => {
        if (!listagem || documentos.length === 0 || classificacoes.length === 0) {
            return {
                assuntos: "",
                periodo: "",
                setor: "",
            };
        }

        const classifIds = new Set(documentos.map(d => d.classificacaoArquivisticaId).filter(Boolean));
        const assuntos = Array.from(classifIds).map(id => {
            const classif = classificacoes.find(c => c.id === id);
            return classif ? `"${classif.descricao}"` : '';
        }).filter(Boolean).join(', ');

        const allYears = new Set<number>();
        documentos.forEach(d => {
            const yearStr = parseDataAbrangenteForYear(d.dataAbrangente);
            if (yearStr) {
                const yearNum = parseInt(yearStr, 10);
                if (!isNaN(yearNum)) {
                    allYears.add(yearNum);
                }
            }
        });
        const sortedAllYears = Array.from(allYears).sort();
        let periodo = "N/A";
        if (sortedAllYears.length > 1) {
            periodo = `${sortedAllYears[0]} a ${sortedAllYears[sortedAllYears.length - 1]}`;
        } else if (sortedAllYears.length === 1) {
            periodo = String(sortedAllYears[0]);
        }
        
        const setor = listagem.unidadeSetor || 'Arquivo/Tribunal Regional Federal da 2ª Região';

        return { assuntos, periodo, setor };
    }, [listagem, documentos, classificacoes]);

    if (isLoading) return <div className="p-8 text-center">Carregando termo...</div>;
    if (!listagem) return <div className="p-8 text-center">Não foi possível carregar o termo de eliminação.</div>;
    
    return (
        <div className="bg-white text-black p-12 font-serif text-justify">
            <Button variant="outline" className="absolute top-4 right-4 print:hidden" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimir
            </Button>

            <header className="text-center mb-10">
                <h1 className="text-lg font-bold uppercase">
                    TERMO DE ELIMINAÇÃO DE DOCUMENTOS TRF2 Nº {listagem.numeroTermoEliminacao || 'XXX'}, DE {listagem.dataProducaoTermoEliminacao ? dataPorExtenso(listagem.dataProducaoTermoEliminacao).toUpperCase() : 'DATA INVÁLIDA'}
                </h1>
            </header>

            <main className="text-sm leading-relaxed indent-8 space-y-4">
                <p>
                    Aos {listagem.dataProducaoTermoEliminacao ? dataPorExtenso(listagem.dataProducaoTermoEliminacao) : '[data]'}, o Tribunal Regional Federal da 2ª Região, de acordo com o que estabelece a Tabela de Temporalidade de Documentos em vigor e consta da Listagem de Eliminação de Documentos - LED TRF2 Nº {listagem.numeroListagem} e do Edital de Ciência de Eliminação de Documentos nº {listagem.numeroEditalCiencia || 'XXX'}, de {listagem.dataPublicacaoEdital ? dataPorExtenso(listagem.dataPublicacaoEdital) : '[data do edital]'}, aprovados pelo Presidente do Tribunal Regional Federal da 2ª Região e publicado no Diário Eletrônico da Justiça Federal da 2ª Região, de {listagem.dataPublicacaoEdital ? dataPorExtenso(listagem.dataPublicacaoEdital) : '[data de publicação]'}, procedeu à eliminação de {listagem.quantificacaoFisica || '[quantificação]'} de {listagem.tipoListagem?.toLowerCase()} relativos a {aggregatedData.assuntos}, do período de {aggregatedData.periodo}, do Setor de {aggregatedData.setor}.
                </p>
            </main>

            <footer className="mt-24 text-center text-sm">
                 <div className="flex justify-around items-end">
                    <div className="inline-block">
                        <p className="border-t border-black px-8 pt-1">Responsável pelo Arquivo</p>
                    </div>
                    <div className="inline-block">
                        <p className="border-t border-black px-8 pt-1">Presidente da CPAD</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
