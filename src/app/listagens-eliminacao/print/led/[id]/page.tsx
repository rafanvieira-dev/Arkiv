
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import type { ListagemEliminacao, Documento, Classificacao, Usuario } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// Constants for storage keys
const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';

interface LedReportRow {
  codigoClassificacao: string;
  descritor: string;
  datasLimite: string;
  quantificacao: number;
  especificacao: string;
  observacoes: string;
}

const parseYearsFromDateString = (dateStr: string): number[] => {
  if (!dateStr) return [];
  const yearMatches = dateStr.match(/\d{4}/g);
  return yearMatches ? yearMatches.map(y => parseInt(y, 10)) : [];
};

const formatYearRange = (years: number[]): string => {
  if (years.length === 0) return '';
  const uniqueSortedYears = [...new Set(years)].sort((a, b) => a - b);
  
  if (uniqueSortedYears.length === 1) return uniqueSortedYears[0].toString();

  const ranges: string[] = [];
  let start = uniqueSortedYears[0];
  let end = uniqueSortedYears[0];

  for (let i = 1; i < uniqueSortedYears.length; i++) {
    if (uniqueSortedYears[i] === end + 1) {
      end = uniqueSortedYears[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = uniqueSortedYears[i];
      end = uniqueSortedYears[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  
  return ranges.join('; ');
};

export default function LedPrintPage() {
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;
    
    const [listagem, setListagem] = React.useState<ListagemEliminacao | null>(null);
    const [reportData, setReportData] = React.useState<LedReportRow[]>([]);
    const [totalQuantificacao, setTotalQuantificacao] = React.useState(0);
    const [datasLimiteGerais, setDatasLimiteGerais] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState<{ nomeCompleto: string; setor?: string }>({ nomeCompleto: 'Usuário não identificado', setor: 'N/A' });

    React.useEffect(() => {
        if (!id) return;
        try {
            const storedListagens = window.localStorage.getItem(LISTAGENS_STORAGE_KEY);
            const allListagens: ListagemEliminacao[] = storedListagens ? JSON.parse(storedListagens) : [];
            const currentListagem = allListagens.find(s => s.id === id);

            if (!currentListagem) {
                toast({ variant: "destructive", title: "Erro", description: "Listagem não encontrada." });
                setIsLoading(false);
                return;
            }
            setListagem(currentListagem);

            const storedDocumentos = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const allDocumentos: Documento[] = storedDocumentos ? JSON.parse(storedDocumentos) : [];

            const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
            const allClassificacoes: Classificacao[] = storedClassificacoes ? JSON.parse(storedClassificacoes) : [];
            const classificacaoMap = new Map(allClassificacoes.map(c => [c.id, c]));

            const docsInListagem = allDocumentos.filter(d => currentListagem.documentoIds.includes(d.id));

            const groupedByClassificacao: { [key: string]: { docs: Documento[] } } = {};
            docsInListagem.forEach(doc => {
                const classId = doc.classificacaoArquivisticaId;
                if (classId) {
                    if (!groupedByClassificacao[classId]) {
                        groupedByClassificacao[classId] = { docs: [] };
                    }
                    groupedByClassificacao[classId].docs.push(doc);
                }
            });

            const processedReportData: LedReportRow[] = Object.entries(groupedByClassificacao).map(([classId, data]) => {
                const classification = classificacaoMap.get(classId);
                const years = data.docs.flatMap(d => parseYearsFromDateString(d.dataAbrangente || ''));
                
                return {
                    codigoClassificacao: classification?.codigo || "N/A",
                    descritor: classification?.descricao || "Classificação não encontrada",
                    datasLimite: formatYearRange(years),
                    quantificacao: data.docs.length,
                    especificacao: "Unidades",
                    observacoes: classification?.observacoes || "Processos Administrativos",
                };
            }).sort((a, b) => a.codigoClassificacao.localeCompare(b.codigoClassificacao));
            
            setReportData(processedReportData);
            
            setTotalQuantificacao(processedReportData.reduce((sum, row) => sum + row.quantificacao, 0));

            const allYearsInListagem = docsInListagem.flatMap(d => parseYearsFromDateString(d.dataAbrangente || ''));
            if (allYearsInListagem.length > 0) {
              const minYear = Math.min(...allYearsInListagem);
              const maxYear = Math.max(...allYearsInListagem);
              setDatasLimiteGerais(minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`);
            }

            const currentUserJson = window.localStorage.getItem('currentUser');
            if (currentUserJson) {
                const currentUser: Usuario = JSON.parse(currentUserJson);
                setUser({ nomeCompleto: currentUser.nomeCompleto, setor: currentUser.setor || 'Não especificado' });
            }

        } catch (error) {
            console.error("Failed to load or process data:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao gerar o relatório." });
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);
    
    React.useEffect(() => {
        if (!isLoading && listagem) {
            setTimeout(() => window.print(), 1000);
        }
    }, [isLoading, listagem]);

    if (isLoading) {
        return <div className="p-8 text-center font-sans">Carregando relatório...</div>;
    }

    if (!listagem) {
        return <div className="p-8 text-center font-sans">Listagem não encontrada.</div>;
    }

    return (
        <div className="bg-white text-black p-12 font-sans text-xs">
            <Button variant="outline" className="print:hidden fixed top-4 right-4 z-50" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir / Salvar PDF
            </Button>
            
            <header className="text-center mb-6">
                <p className="font-bold">PODER JUDICIÁRIO</p>
                <p className="font-bold">JUSTIÇA FEDERAL</p>
                <p className="font-bold">TRIBUNAL REGIONAL FEDERAL DA 2ª REGIÃO</p>
                <h1 className="text-sm font-bold mt-4">LISTAGEM DE ELIMINAÇÃO DE DOCUMENTOS - LED TRF2 Nº {listagem.numeroListagem}</h1>
            </header>

            <main>
                <div className="border-2 border-black mb-4">
                    <h2 className="text-center font-bold bg-gray-200 border-b-2 border-black p-1 text-xs">LISTAGEM DE ELIMINAÇÃO DE DOCUMENTOS Nº {listagem.numeroListagem}</h2>
                    <div className="p-2 space-y-1">
                        <p><strong>ÓRGÃO/ENTIDADE:</strong> Tribunal Regional Federal da 2ª Região - TRF2</p>
                        <p><strong>UNIDADE/SETOR:</strong> {user.setor}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border-2 border-black text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border-2 border-black p-1 font-bold text-center" rowSpan={2}>Código Classif.</th>
                            <th className="border-2 border-black p-1 font-bold text-center" rowSpan={2}>Descritor do Código</th>
                            <th className="border-2 border-black p-1 font-bold text-center" rowSpan={2}>Datas-Limite</th>
                            <th className="border-2 border-black p-1 font-bold text-center" colSpan={2}>Unidade de Arquivamento</th>
                            <th className="border-2 border-black p-1 font-bold text-center" rowSpan={2}>Observações e/ou Justificativas</th>
                        </tr>
                        <tr className="bg-gray-200">
                            <th className="border-2 border-black p-1 font-bold text-center">Quantificação</th>
                            <th className="border-2 border-black p-1 font-bold text-center">Especificação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                <td className="border border-black p-1 text-center">{row.codigoClassificacao}</td>
                                <td className="border border-black p-1">{row.descritor}</td>
                                <td className="border border-black p-1 text-center">{row.datasLimite}</td>
                                <td className="border border-black p-1 text-center">{row.quantificacao}</td>
                                <td className="border border-black p-1">{row.especificacao}</td>
                                <td className="border border-black p-1">{row.observacoes}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-gray-200">
                            <td className="border-2 border-black p-1" colSpan={3}>Mensuração total:</td>
                            <td className="border-2 border-black p-1 text-center">{totalQuantificacao}</td>
                            <td className="border-2 border-black p-1" colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="border-2 border-black mt-4 p-2">
                    <p><strong>Datas-Limite Gerais:</strong> {datasLimiteGerais}</p>
                </div>
                
                <div className="border-2 border-black mt-4 p-2">
                    <p><strong>Comprovação de aprovação das contas:</strong> (Informações a serem inseridas caso necessário)</p>
                </div>

                <div className="mt-8 text-center text-xs">
                    <p>Local e data: ____________________, ____ de ________________ de ________.</p>
                </div>

                <footer className="mt-16 grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                        <p className="border-t border-black w-64 mx-auto pt-1">Responsável pelo Arquivo</p>
                        <p>{user.nomeCompleto}</p>
                    </div>
                    <div>
                        <p className="border-t border-black w-64 mx-auto pt-1">Presidente da CPAD</p>
                        <p>(Nome do Presidente)</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
