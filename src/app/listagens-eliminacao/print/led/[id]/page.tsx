
"use client";

import * as React from "react";
import { useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { ListagemEliminacao, Documento, Classificacao, AprovacaoContas } from "@/types";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";

interface AggregatedRow {
  codigo: string;
  descricao: string;
  datasLimite: string;
  quantificacao: number;
  especificacao: string;
  observacoes: string[];
}

function parseDataAbrangenteForYear(dataAbrangente?: string): string | undefined {
    if (!dataAbrangente) return undefined;
    const matchAno = dataAbrangente.match(/\d{4}/);
    return matchAno ? matchAno[0] : undefined;
}

export default function LedPrintPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [listagem, setListagem] = React.useState<ListagemEliminacao | null>(null);
    const [aggregatedData, setAggregatedData] = React.useState<AggregatedRow[]>([]);
    const [totalGeral, setTotalGeral] = React.useState(0);
    const [datasLimiteGerais, setDatasLimiteGerais] = React.useState("");
    const [comprovacaoContas, setComprovacaoContas] = React.useState<AprovacaoContas[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        try {
            const listagemData = searchParams.get('listagem');
            const docsData = searchParams.get('docs');
            const classifData = searchParams.get('classif');
            const aprovacoesData = searchParams.get('aprovacoes');

            if (!listagemData || !docsData || !classifData) {
                toast({ variant: "destructive", title: "Erro", description: "Dados insuficientes para gerar o relatório." });
                return;
            }

            const currentListagem: ListagemEliminacao = JSON.parse(decodeURIComponent(listagemData));
            const docsNestaListagem: Documento[] = JSON.parse(decodeURIComponent(docsData));
            const allClassificacoes: Classificacao[] = JSON.parse(decodeURIComponent(classifData));
            const aprovacoesSelecionadas: AprovacaoContas[] = aprovacoesData ? JSON.parse(decodeURIComponent(aprovacoesData)) : [];
            
            setListagem(currentListagem);
            setComprovacaoContas(aprovacoesSelecionadas);

            const dataMap = new Map<string, { docs: Documento[], classif: Classificacao | undefined }>();

            docsNestaListagem.forEach(doc => {
                const classId = doc.classificacaoArquivisticaId;
                if (!classId) return;

                if (!dataMap.has(classId)) {
                    dataMap.set(classId, { docs: [], classif: allClassificacoes.find(c => c.id === classId) });
                }
                dataMap.get(classId)!.docs.push(doc);
            });

            const aggregatedRows: AggregatedRow[] = [];
            const allYears = new Set<number>();

            dataMap.forEach(({ docs, classif }) => {
                if (!classif) return;

                const years = new Set<number>();
                docs.forEach(d => {
                    const yearStr = parseDataAbrangenteForYear(d.dataAbrangente);
                    if (yearStr) {
                        const yearNum = parseInt(yearStr, 10);
                        if (!isNaN(yearNum)) {
                            years.add(yearNum);
                            allYears.add(yearNum);
                        }
                    }
                });
                
                const sortedYears = Array.from(years).sort();
                const datasLimite = sortedYears.join('; ');

                aggregatedRows.push({
                    codigo: classif.codigo,
                    descricao: classif.descricao,
                    datasLimite: datasLimite,
                    quantificacao: docs.length,
                    especificacao: 'Unidades',
                    observacoes: docs.map(d => d.categoria).filter((v, i, a) => a.indexOf(v) === i),
                });
            });
            
            const sortedAllYears = Array.from(allYears).sort();
            if (sortedAllYears.length > 0) {
              setDatasLimiteGerais(`${sortedAllYears[0]} - ${sortedAllYears[sortedAllYears.length - 1]}`);
            }

            setAggregatedData(aggregatedRows.sort((a, b) => a.codigo.localeCompare(b.codigo)));
            setTotalGeral(aggregatedRows.reduce((sum, row) => sum + row.quantificacao, 0));

        } catch (error) {
            console.error("Failed to generate report data:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao gerar dados para o relatório." });
        } finally {
            setIsLoading(false);
        }
    }, [searchParams, toast]);

    if (isLoading) return <div className="p-8 text-center">Carregando relatório...</div>;
    if (!listagem) return <div className="p-8 text-center">Não foi possível carregar a listagem.</div>;

    return (
        <div className="bg-white text-black p-8 font-serif">
            <Button variant="outline" className="absolute top-4 right-4 print:hidden" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimir
            </Button>
            
            <header className="text-center mb-4">
                <h1 className="text-lg font-bold">LISTAGEM DE ELIMINAÇÃO DE DOCUMENTOS - LED TRF2 Nº {listagem.numeroListagem}</h1>
            </header>

            <main>
                <div className="border border-black">
                    <div className="border-b border-black p-1 text-center">
                        <h2 className="text-base font-bold">LISTAGEM DE ELIMINAÇÃO DE DOCUMENTOS Nº {listagem.numeroListagem}</h2>
                    </div>
                    <div className="border-b border-black p-1 text-sm">
                        <p><strong>ÓRGÃO/ENTIDADE:</strong> Tribunal Regional Federal da 2ª Região - TRF2</p>
                    </div>
                    <div className="p-1 text-sm">
                        <p><strong>UNIDADE/SETOR:</strong> {listagem.unidadeSetor || 'Não especificado'}</p>
                    </div>
                </div>

                <table className="w-full text-sm border-collapse border border-black mt-[-1px]">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="border border-black p-1 font-bold">Código Classif.</th>
                            <th className="border border-black p-1 font-bold">Descritor do Código</th>
                            <th className="border border-black p-1 font-bold">Datas-Limite</th>
                            <th colSpan={2} className="border border-black p-1 font-bold">Unidade de Arquivamento</th>
                            <th className="border border-black p-1 font-bold">Observações e/ou Justificativas</th>
                        </tr>
                        <tr className="border-b border-black">
                            <th className="border border-black p-1"></th>
                            <th className="border border-black p-1"></th>
                            <th className="border border-black p-1"></th>
                            <th className="border border-black p-1 font-bold">Quantificação</th>
                            <th className="border border-black p-1 font-bold">Especificação</th>
                            <th className="border border-black p-1"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedData.map((row, index) => (
                            <tr key={index}>
                                <td className="border border-black p-1 text-center">{row.codigo}</td>
                                <td className="border border-black p-1">{row.descricao}</td>
                                <td className="border border-black p-1 text-center">{row.datasLimite}</td>
                                <td className="border border-black p-1 text-center">{row.quantificacao}</td>
                                <td className="border border-black p-1 text-center">{row.especificacao}</td>
                                <td className="border border-black p-1">{row.observacoes.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <section className="mt-4 text-sm space-y-2">
                    <p><strong>Mensuração total:</strong> {totalGeral} Unidades</p>
                    <p><strong>Datas-Limite Gerais:</strong> {datasLimiteGerais}</p>
                </section>

                {comprovacaoContas && comprovacaoContas.length > 0 && (
                    <section className="mt-4 text-sm space-y-2">
                        <h3 className="font-bold">Comprovação de aprovação das contas:</h3>
                        {comprovacaoContas.map((conta, index) => (
                            <p key={index}>
                                Referente ao exercício de <strong>{conta.anoExercicio || 'N/A'}</strong>, 
                                aprovada em <strong>{conta.dataAprovacaoTCU ? <ClientSideDateFormatter isoDateString={conta.dataAprovacaoTCU} /> : 'N/A'}</strong>, 
                                publicado em <strong>{conta.dataPublicacaoDOU ? <ClientSideDateFormatter isoDateString={conta.dataPublicacaoDOU} /> : 'N/A'}</strong>
                                {conta.secao && <span>, Seção {conta.secao}</span>}
                                {conta.pagina && <span>, Página {conta.pagina}</span>}.
                            </p>
                        ))}
                    </section>
                )}
            </main>

            <footer className="mt-16 text-sm">
                <div className="flex justify-around">
                    <div className="text-center">
                        <p className="border-t border-black w-64 mx-auto pt-1">Assinatura</p>
                        <p>Presidente da Comissão</p>
                    </div>
                     <div className="text-center">
                        <p className="border-t border-black w-64 mx-auto pt-1">Assinatura</p>
                        <p>Membro</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
