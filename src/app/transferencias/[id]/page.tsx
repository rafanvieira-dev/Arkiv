
"use client";

import * as React from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Transferencia, Documento, Classificacao } from "@/types";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { initialTransferencias, placeholderClassificacoesSimulado, placeholderDocumentos } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getYear, parseISO, isValid } from 'date-fns';
import { Label } from "@/components/ui/label";

const TRANSFERENCIAS_STORAGE_KEY = 'arquivocentral_transferencias';
const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';

export default function TransferenciaDetailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [transferencia, setTransferencia] = React.useState<Transferencia | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [allTransferencias, setAllTransferencias] = React.useState<Transferencia[]>([]);
  const [allDocumentos, setAllDocumentos] = React.useState<Documento[]>([]);
  const [allClassificacoes, setAllClassificacoes] = React.useState<Classificacao[]>([]);

  React.useEffect(() => {
    try {
      const storedTransferencias = window.localStorage.getItem(TRANSFERENCIAS_STORAGE_KEY);
      const transferenciasData = storedTransferencias ? JSON.parse(storedTransferencias) : initialTransferencias;
      setAllTransferencias(transferenciasData);
      
      const storedDocumentos = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      setAllDocumentos(storedDocumentos ? JSON.parse(storedDocumentos) : placeholderDocumentos);

      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      setAllClassificacoes(storedClassificacoes ? JSON.parse(storedClassificacoes) : placeholderClassificacoesSimulado);

      const currentTransferencia = transferenciasData.find((t: Transferencia) => t.id === id);
      setTransferencia(currentTransferencia || null);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados." });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  const handleApprove = () => {
    if (!transferencia) return;

    // 1. Create new Documento records
    const newDocsFromTransfer: Documento[] = transferencia.documentos.map((docTransfer, index) => {
      const classification = allClassificacoes.find(c => c.codigo === docTransfer.codigoClassificacao);
      const dataArquivamento = transferencia.dataTransferencia;
      
      let anoEliminacao = "";
      if (classification && dataArquivamento && isValid(parseISO(dataArquivamento)) && classification.destinacaoFinal === 'Eliminação') {
          const dataArquivamentoDate = parseISO(dataArquivamento);
          const prazoIntermediarioAnosNum = classification.prazoGuardaFaseIntermediariaAnos ?? 0;
          const anoArquivamento = getYear(dataArquivamentoDate);
          anoEliminacao = (anoArquivamento + prazoIntermediarioAnosNum + 1).toString();
      }

      let prazoCorrente = "";
      if (classification?.tipoPrazoFaseCorrente === "Anos" && typeof classification?.prazoGuardaFaseCorrenteAnos === 'number') {
        prazoCorrente = `${classification.prazoGuardaFaseCorrenteAnos} Anos`;
      } else if (classification?.tipoPrazoFaseCorrente === "Condição Textual") {
        prazoCorrente = classification.prazoGuardaFaseCorrenteCondicaoTextual || "";
      }

      const newDoc: Documento = {
        id: `DOC${Date.now() + index}`,
        status: 'Pendente de Conferência',
        orgao: 'TRF2',
        origem: transferencia.setorRemetente,
        tipoMeio: docTransfer.digitalizado === 'Sim' ? 'Digital' : 'Não digital',
        generoDocumental: 'Textual',
        categoria: docTransfer.categoria,
        tipoDocumento: '',
        numeroDocumento: docTransfer.numeroDocumento,
        dataAbrangente: docTransfer.dataAbrangente,
        descricaoDocumento: docTransfer.descricao,
        dataArquivamento: dataArquivamento,
        quantidadeVolumes: docTransfer.quantidadeVolumes,
        quantidadeApensos: docTransfer.quantidadeApensos,
        numerosApensos: docTransfer.numerosApensos,
        digitalizado: docTransfer.digitalizado,
        classificacaoArquivisticaId: classification?.id,
        prazoArquivoCorrenteDisplay: prazoCorrente,
        prazoArquivoIntermediarioDisplay: classification ? `${classification.prazoGuardaFaseIntermediariaAnos} Anos` : "",
        destinacaoFinalDisplay: classification?.destinacaoFinal,
        alteracaoDestinacaoFinal: 'Não Alterar',
        anoEliminacaoPrevisto: anoEliminacao,
        segredoJustica: 'Não',
        grauSigilo: 'Ostensivo',
        observacoesGerais: docTransfer.observacoesGerais,
        dataCadastro: new Date().toISOString(),
        nomePartePrincipal: transferencia.nomeServidor,
        tipoPartePrincipal: 'Outro',
        outroTipoPartePrincipal: 'Servidor Remetente',
        documentosRelacionadosIds: '',
        totalMidias: undefined,
        tipoMidiaDetalhe: undefined,
        outroTipoMidiaDetalhe: '',
        numeroMidiaDetalhe: '',
        paginaMidiaDetalhe: '',
        tipoBaixa: '',
        dataBaixa: undefined,
        codigosCaixa: '',
        codigoAtoM: '',
        codigoClassificacaoJudicialId: '',
        numeroListagemEliminacao: '',
      };
      return newDoc;
    });

    // 2. Update transfer status
    const updatedTransferencias = allTransferencias.map(t =>
      t.id === transferencia.id ? { ...t, status: 'Aprovada' } : t
    );

    // 3. Combine new docs with existing ones
    const updatedAllDocs = [...allDocumentos, ...newDocsFromTransfer];

    // 4. Save to localStorage
    try {
      window.localStorage.setItem(TRANSFERENCIAS_STORAGE_KEY, JSON.stringify(updatedTransferencias));
      window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(updatedAllDocs));
      
      toast({ title: 'Transferência Aprovada', description: `${newDocsFromTransfer.length} documento(s) foram adicionado(s) ao acervo.` });
      router.push('/transferencias');
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar dados." });
    }
  };

  const handleReject = () => {
    if (!transferencia) return;
    const updatedTransferencias = allTransferencias.map(t =>
      t.id === transferencia.id ? { ...t, status: 'Reprovada' } : t
    );
    try {
      window.localStorage.setItem(TRANSFERENCIAS_STORAGE_KEY, JSON.stringify(updatedTransferencias));
      toast({ title: 'Transferência Reprovada' });
      router.push('/transferencias');
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar dados." });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-2"><PageHeader title="Carregando..." /></div>;
  }

  if (!transferencia) {
    return <div className="container mx-auto py-2"><PageHeader title="Transferência não encontrada" /></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader title={`Detalhes da Transferência: ${transferencia.id}`} description="Analise os detalhes e aprove ou reprove a transferência.">
        <Link href="/transferencias" passHref>
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Lista</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Remetente</CardTitle>
          <div className="flex items-center gap-2">
             <CardDescription>Status:</CardDescription>
             <Badge variant={
                transferencia.status === 'Aprovada' ? 'secondary' :
                transferencia.status === 'Reprovada' ? 'destructive' :
                'default'
              }>{transferencia.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><Label>Nome do Servidor:</Label><p className="text-sm">{transferencia.nomeServidor}</p></div>
          <div><Label>Matrícula:</Label><p className="text-sm">{transferencia.matricula}</p></div>
          <div><Label>Ramal:</Label><p className="text-sm">{transferencia.ramal || "N/A"}</p></div>
          <div><Label>Setor Remetente:</Label><p className="text-sm">{transferencia.setorRemetente}</p></div>
          <div><Label>Data da Transferência:</Label><p className="text-sm"><ClientSideDateFormatter isoDateString={transferencia.dataTransferencia} /></p></div>
           <div className="md:col-span-2 lg:col-span-3"><Label>Observações:</Label><p className="text-sm">{transferencia.observacoes || "Nenhuma"}</p></div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Documentos Enviados</CardTitle>
          <CardDescription>Lista de documentos incluídos nesta transferência.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Cód. Classificação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Nº Documento</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Vols</TableHead>
                  <TableHead>Apen.</TableHead>
                  <TableHead>Digitalizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferencia.documentos.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{doc.categoria}</TableCell>
                    <TableCell>{doc.codigoClassificacao}</TableCell>
                    <TableCell className="max-w-xs truncate" title={doc.descricao}>{doc.descricao}</TableCell>
                    <TableCell>{doc.numeroDocumento || "N/A"}</TableCell>
                    <TableCell>{doc.dataAbrangente || "N/A"}</TableCell>
                    <TableCell>{doc.quantidadeVolumes}</TableCell>
                    <TableCell>{doc.quantidadeApensos}</TableCell>
                    <TableCell>{doc.digitalizado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            {transferencia.status === 'Pendente' && (
                <>
                    <Button variant="destructive" onClick={handleReject}><XCircle className="mr-2 h-4 w-4" />Reprovar</Button>
                    <Button onClick={handleApprove}><CheckCircle className="mr-2 h-4 w-4" />Aprovar</Button>
                </>
            )}
            {transferencia.status !== 'Pendente' && (
                 <p className="text-sm text-muted-foreground">Esta transferência já foi processada.</p>
            )}
        </CardFooter>
      </Card>

    </div>
  );
}
