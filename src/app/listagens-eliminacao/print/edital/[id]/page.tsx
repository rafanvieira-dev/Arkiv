
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { ListagemEliminacao, Documento } from "@/types";

const LISTAGENS_STORAGE_KEY = 'arquivocentral_listagens';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';

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
    const [isLoading, setIsLoading] = React.useState(true);

    const [editalText, setEditalText] = React.useState({
      siglaOrgao: 'TRF2',
      autoridade: 'O Presidente do Tribunal Regional Federal da 2ª Região',
      aprovacaoCPAD: 'aprovados pela Comissão Permanente de Avaliação Documental (CPAD) do Tribunal Regional Federal da 2ª Região',
      nomeCompletoOrgao: 'do Tribunal Regional Federal da 2ª Região (TRF2)',
      linkTransparencia: 'e na página do Tribunal Regional Federal da 2ª Região na internet (https://www.trf2.jus.br/trf2/portal-transparencia)',
      textoDesentranhamento: 'o desentranhamento de documentos ou cópias de peças do processo',
      assinaturaAutoridade: 'Presidente do Tribunal Regional Federal da 2ª Região',
    });

    React.useEffect(() => {
        if (!id) return;

        try {
            const storedListagens = localStorage.getItem(LISTAGENS_STORAGE_KEY);
            const allListagens: ListagemEliminacao[] = storedListagens ? JSON.parse(storedListagens) : [];
            const currentListagem = allListagens.find((l: ListagemEliminacao) => l.id === id);

            if (!currentListagem) {
                toast({ variant: "destructive", title: "Erro", description: "Listagem não encontrada." });
                return;
            }
            setListagem(currentListagem);
            
            const storedDocumentos = localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
            const allDocumentos: Documento[] = storedDocumentos ? JSON.parse(storedDocumentos) : [];
            
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

            // --- Dynamic Text Generation ---
            const orgao = currentListagem.orgao;
            let newEditalText = { ...editalText };
            if (orgao?.includes('SJRJ')) {
                newEditalText = {
                    siglaOrgao: 'SJRJ',
                    autoridade: 'O Diretor do Foro da Seção Judiciária do Rio de Janeiro (SJRJ)',
                    aprovacaoCPAD: 'aprovados pela Comissão Permanente de Avaliação Documental (CPAD) da Seção Judiciária do Rio de Janeiro (SJRJ)',
                    nomeCompletoOrgao: ', da Seção Judiciária do Rio de Janeiro (SJRJ)',
                    linkTransparencia: 'e na página da Seção Judiciária do Rio de Janeiro na internet (https://www.trf2.jus.br/jfrj/transparencia)',
                    assinaturaAutoridade: 'Diretor do Foro da Seção Judiciária do Rio de Janeiro (SJRJ)',
                };
            } else if (orgao?.includes('SJES')) {
                 newEditalText = {
                    siglaOrgao: 'SJES',
                    autoridade: 'O Diretor do Foro da Seção Judiciária do Espírito Santo (SJES)',
                    aprovacaoCPAD: 'aprovados pela Comissão Permanente de Avaliação Documental (CPAD) da Seção Judiciária do Espírito Santo (SJES)',
                    nomeCompletoOrgao: ', da Seção Judiciária do Espírito Santo (SJES)',
                    linkTransparencia: 'e na página da Seção Judiciária do Espírito Santo na internet (https://www.trf2.jus.br/jfes/transparencia)',
                    assinaturaAutoridade: 'Diretor do Foro da Seção Judiciária do Espírito Santo (SJES)',
                };
            }
            
            if (currentListagem.tipoListagem === 'Documentos') {
              newEditalText.textoDesentranhamento = 'desentranhamento ou cópias de documentos';
            } else {
              newEditalText.textoDesentranhamento = 'o desentranhamento de documentos ou cópias de peças do processo';
            }
            
            setEditalText(newEditalText);

        } catch (error) {
            console.error("Failed to generate edital data:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao gerar dados para o edital." });
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    if (isLoading) return <div className="p-8 text-center">Carregando edital...</div>;
    if (!listagem) return <div className="p-8 text-center">Não foi possível carregar a listagem.</div>;
    
    const tipoDocumentacao = listagem.tipoListagem?.toLowerCase() || "documentos";
    const unidadeCustodiadora = listagem.unidadeSetor || 'Arquivo';
    const anoEdital = listagem.dataPublicacaoEdital ? new Date(listagem.dataPublicacaoEdital).getFullYear() : new Date().getFullYear();

    return (
        <div className="bg-white text-black p-12 font-serif text-justify">
            <Button variant="outline" className="absolute top-4 right-4 print:hidden" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimir
            </Button>

            <header className="text-center mb-10">
                <h1 className="text-lg font-bold">EDITAL DE CIÊNCIA DE ELIMINAÇÃO DE DOCUMENTOS {editalText.siglaOrgao} Nº {listagem.numeroEditalCiencia || 'XXX'} / {anoEdital}</h1>
            </header>

            <main className="text-sm leading-relaxed indent-8 space-y-4">
                <p>
                    {editalText.autoridade}, no uso de suas atribuições legais, e considerando o disposto na Resolução TRF2-RSP-2021/0060, de acordo com as Listagens de Eliminação de Documentos nº {listagem.numeroListagem} e seus respectivos anexos, {editalText.aprovacaoCPAD}, por intermédio da Memória de Reunião nº {listagem.memoriaReuniao || 'XXX'} que aprovou a(s) LED, faz saber, a quem possa interessar, que, transcorridos 45 (quarenta e cinco) dias da data de publicação deste Edital no Diário Eletrônico da Justiça Federal da 2ª Região (e-DJF2R), se não houver oposição, o(a) {unidadeCustodiadora} eliminará os documentos constantes de {tipoDocumentacao}, do período de {datasLimiteGerais || "N/A"}{editalText.nomeCompletoOrgao}. A relação de {tipoDocumentacao} a serem eliminados, constante do Anexo deste Edital, encontra-se à disposição no {unidadeCustodiadora} {editalText.linkTransparencia}. Os interessados, no prazo citado, poderão requerer, às suas expensas, {editalText.textoDesentranhamento}, mediante petição, com a respectiva qualificação e demonstração de legitimidade do pedido, dirigida à {editalText.aprovacaoCPAD}. Após deferimento do pedido, os interessados serão devidamente comunicados, devendo comparecer a(ao) {unidadeCustodiadora} desta Corte para a retirada do(s) documento(s). Verificada a existência de mais de uma parte interessada, prevalecerá o primeiro pedido protocolizado.
                </p>
            </main>

            <footer className="mt-24 text-center text-sm">
                <div className="inline-block">
                    <p className="border-t border-black px-8 pt-1">{editalText.assinaturaAutoridade}</p>
                </div>
            </footer>
        </div>
    );
}
