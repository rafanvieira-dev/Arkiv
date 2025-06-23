
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/page-header";
import { Search, RotateCcw } from "lucide-react";
import { DateInputPicker } from "@/components/date-input-picker";

export default function BuscaAvancadaPage() {
  const [dataDocumentoDe, setDataDocumentoDe] = React.useState<Date | undefined>();
  const [dataDocumentoAte, setDataDocumentoAte] = React.useState<Date | undefined>();
  const [dataArquivamentoDe, setDataArquivamentoDe] = React.useState<Date | undefined>();
  const [dataArquivamentoAte, setDataArquivamentoAte] = React.useState<Date | undefined>();

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Busca Avançada" description="Encontre documentos utilizando múltiplos critérios de pesquisa." />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Critérios de Busca</CardTitle>
          <CardDescription>Preencha os campos abaixo para refinar sua busca.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="numeroDocumento">Número do Documento</Label>
            <Input id="numeroDocumento" placeholder="Ex: PRC-2023-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" placeholder="Ex: Tribunal de Justiça" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
            <Input id="tipoDocumento" placeholder="Ex: Ação Ordinária" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
            <Input id="descricaoDocumento" placeholder="Contém..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataDocumentoDe">Data do Documento (De)</Label>
            <DateInputPicker value={dataDocumentoDe} onChange={setDataDocumentoDe} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataDocumentoAte">Data do Documento (Até)</Label>
            <DateInputPicker value={dataDocumentoAte} onChange={setDataDocumentoAte} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataArquivamentoDe">Data de Arquivamento (De)</Label>
            <DateInputPicker value={dataArquivamentoDe} onChange={setDataArquivamentoDe} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataArquivamentoAte">Data de Arquivamento (Até)</Label>
            <DateInputPicker value={dataArquivamentoAte} onChange={setDataArquivamentoAte} placeholder="dd/mm/aaaa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partes">Partes Envolvidas</Label>
            <Input id="partes" placeholder="Ex: João da Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classificacao">Classificação Arquivística</Label>
            <Select>
              <SelectTrigger id="classificacao">
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLA001">020.1 - Processos Judiciais Cíveis</SelectItem>
                <SelectItem value="CLA002">030.5 - Correspondências Recebidas</SelectItem>
                <SelectItem value="CLA003">045.2 - Relatórios Anuais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoCaixa">Código da Caixa</Label>
            <Input id="codigoCaixa" placeholder="Ex: CX-A-001" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="status">Status do Documento</Label>
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arquivado">Arquivado</SelectItem>
                <SelectItem value="Emprestado">Emprestado</SelectItem>
                <SelectItem value="Desarquivado">Desarquivado</SelectItem>
                <SelectItem value="Eliminado">Eliminado</SelectItem>
                <SelectItem value="Aguardando prazo para eliminação">Aguardando prazo para eliminação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgao">Órgão</Label>
            <Select>
                <SelectTrigger id="orgao"><SelectValue placeholder="Selecione o órgão" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="TRF2">TRF2</SelectItem>
                    <SelectItem value="SJRJ">SJRJ</SelectItem>
                    <SelectItem value="SJES">SJES</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoMeio">Tipo de Meio</Label>
            <Select>
                <SelectTrigger id="tipoMeio"><SelectValue placeholder="Selecione o tipo de meio" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Não digital">Não digital</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="generoDocumental">Gênero Documental</Label>
            <Select>
                <SelectTrigger id="generoDocumental"><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Textual">Textual</SelectItem>
                    <SelectItem value="Iconográfico">Iconográfico</SelectItem>
                    <SelectItem value="Cartográfico">Cartográfico</SelectItem>
                    <SelectItem value="Sonoro">Sonoro</SelectItem>
                    <SelectItem value="Filmográfico">Filmográfico</SelectItem>
                    <SelectItem value="Audiovisual">Audiovisual</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select>
                <SelectTrigger id="categoria"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Documento">Documento</SelectItem>
                    <SelectItem value="Dossiê">Dossiê</SelectItem>
                    <SelectItem value="Processo Judicial">Processo Judicial</SelectItem>
                    <SelectItem value="Processo Administrativo">Processo Administrativo</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinacaoFinal">Destinação Final</Label>
            <Select>
                <SelectTrigger id="destinacaoFinal"><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anoEliminacaoPrevisto">Ano de Eliminação Previsto</Label>
            <Input id="anoEliminacaoPrevisto" type="number" placeholder="AAAA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grauSigilo">Grau de Sigilo (LAI)</Label>
            <Select>
              <SelectTrigger id="grauSigilo"><SelectValue placeholder="Selecione o grau de sigilo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ostensivo">Ostensivo</SelectItem>
                <SelectItem value="Reservado">Reservado</SelectItem>
                <SelectItem value="Secreto">Secreto</SelectItem>
                <SelectItem value="Ultrassecreto">Ultrassecreto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoAtoM">Código do AtoM</Label>
            <Input id="codigoAtoM" placeholder="Contém..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoesGerais">Observações Gerais</Label>
            <Input id="observacoesGerais" placeholder="Contém..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoClasseJudicial">Código da Classe Judicial</Label>
            <Input id="codigoClasseJudicial" placeholder="Contém..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroListagemEliminacao">Nº da Listagem de Eliminação</Label>
            <Input id="numeroListagemEliminacao" placeholder="Contém..." />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="segredoJustica" />
            <Label htmlFor="segredoJustica">Segredo de Justiça</Label>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="digitalizado" />
            <Label htmlFor="digitalizado">Apenas Digitalizados</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </CardFooter>
      </Card>

      {/* Placeholder for search results */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Resultados da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum resultado encontrado para os critérios informados ou nenhuma busca realizada ainda.</p>
          {/* Table or list of results would go here */}
        </CardContent>
      </Card>
    </div>
  );
}
