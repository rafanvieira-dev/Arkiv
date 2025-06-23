
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
  const [dataDe, setDataDe] = React.useState<Date | undefined>();
  const [dataAte, setDataAte] = React.useState<Date | undefined>();

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Busca Avançada" description="Encontre documentos utilizando múltiplos critérios de pesquisa." />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Critérios de Busca</CardTitle>
          <CardDescription>Preencha os campos abaixo para refinar sua busca.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="identificador">Identificador do Documento</Label>
            <Input id="identificador" placeholder="Ex: PRC-2023-001" />
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
            <Label htmlFor="dataDocumentoDe">Data do Documento (De)</Label>
            <DateInputPicker value={dataDe} onChange={setDataDe} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataDocumentoAte">Data do Documento (Até)</Label>
            <DateInputPicker value={dataAte} onChange={setDataAte} placeholder="dd/mm/aaaa" />
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
              </SelectContent>
            </Select>
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
