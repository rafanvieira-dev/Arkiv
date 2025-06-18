
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Documento } from "@/types"; // Assuming Classificacao type might be needed indirectly
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Placeholder data for Classificacao to simulate checking 'inativo' status
// In a real app, this would come from a data store or API
const placeholderClassificacoesSimulado = [
  { id: "CLA001", codigo: "020.1", inativo: false },
  { id: "CLA002", codigo: "030.5", inativo: true }, // This classification is inactive
  { id: "CLA003", codigo: "045.2", inativo: false },
];

const placeholderDocumentos: Documento[] = [
  { id: "DOC001", identificador: "PRC-2023-001", status: "Arquivado", origem: "Tribunal de Justiça", tipoMeio: "Papel", generoDocumental: "Textual", categoria: "Processo Judicial", tipoDocumento: "Ação Ordinária", dataDocumento: new Date("2023-01-15").toISOString(), classificacaoArquivisticaId: "CLA001", segredoJustica: false, grauSigilo: "Público", codigoCaixa: "CX001", dataCadastro: new Date().toISOString(), digitalizacao: false, classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA001")?.inativo },
  { id: "DOC002", identificador: "OFC-2023-045", status: "Emprestado", origem: "Secretaria Municipal", tipoMeio: "Digital", generoDocumental: "Textual", categoria: "Ofício", tipoDocumento: "Solicitação de Informações", dataDocumento: new Date("2023-03-20").toISOString(), classificacaoArquivisticaId: "CLA002", segredoJustica: false, grauSigilo: "Público", codigoCaixa: "CX002", dataCadastro: new Date().toISOString(), digitalizacao: true, classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA002")?.inativo },
  { id: "DOC003", identificador: "MEM-2022-112", status: "Arquivado", origem: "Câmara de Vereadores", tipoMeio: "Papel", generoDocumental: "Textual", categoria: "Memorando", tipoDocumento: "Comunicação Interna", dataDocumento: new Date("2022-11-05").toISOString(), classificacaoArquivisticaId: "CLA003", segredoJustica: true, grauSigilo: "Secreto", codigoCaixa: "CX001", dataCadastro: new Date().toISOString(), digitalizacao: false, classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA003")?.inativo },
];

export default function DocumentosPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento de Documentos" description="Cadastre e gerencie as descrições dos documentos do acervo.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Caixa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderDocumentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {doc.identificador}
                    {doc.classificacaoInativa && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        CÓDIGO INATIVO, RECLASSIFICAR
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{doc.tipoDocumento}</TableCell>
                  <TableCell>{format(new Date(doc.dataDocumento), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell><Badge variant={doc.status === 'Arquivado' ? 'secondary' : doc.status === 'Emprestado' ? 'outline' : 'default' }>{doc.status}</Badge></TableCell>
                  <TableCell>{doc.codigoCaixa}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

