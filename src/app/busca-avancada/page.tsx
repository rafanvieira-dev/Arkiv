
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
import type { Documento, Classificacao } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { parseISO, isAfter, isBefore } from "date-fns";

const initialFilters = {
  numeroDocumento: "",
  origem: "",
  tipoDocumento: "",
  descricaoDocumento: "",
  dataDocumentoDe: undefined as Date | undefined,
  dataDocumentoAte: undefined as Date | undefined,
  dataArquivamentoDe: undefined as Date | undefined,
  dataArquivamentoAte: undefined as Date | undefined,
  partes: "",
  classificacao: "",
  codigoCaixa: "",
  status: "",
  orgao: "",
  tipoMeio: "",
  generoDocumental: "",
  categoria: "",
  destinacaoFinal: "",
  anoEliminacaoPrevisto: "",
  grauSigilo: "",
  codigoAtoM: "",
  observacoesGerais: "",
  codigoClasseJudicial: "",
  numeroListagemEliminacao: "",
  segredoJustica: false,
  digitalizado: false,
};

const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';


export default function BuscaAvancadaPage() {
  const [filters, setFilters] = React.useState(initialFilters);
  const [results, setResults] = React.useState<Documento[]>([]);
  const [searched, setSearched] = React.useState(false);
  
  const [allDocuments, setAllDocuments] = React.useState<Documento[]>([]);
  const [allClassificacoes, setAllClassificacoes] = React.useState<Classificacao[]>([]);

  React.useEffect(() => {
    try {
      const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      if (storedDocs) setAllDocuments(JSON.parse(storedDocs));
      
      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      if (storedClassificacoes) setAllClassificacoes(JSON.parse(storedClassificacoes));
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof initialFilters) => (value: string) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: keyof typeof initialFilters) => (checked: boolean | 'indeterminate') => {
    setFilters(prev => ({ ...prev, [id]: !!checked }));
  };

  const handleDateChange = (id: keyof typeof initialFilters) => (date?: Date) => {
    setFilters(prev => ({ ...prev, [id]: date }));
  };
  
  const handleClear = () => {
    setFilters(initialFilters);
    setResults([]);
    setSearched(false);
  };

  const handleSearch = () => {
    const filtered = allDocuments.filter(doc => {
        // Text input filters (case-insensitive)
        if (filters.numeroDocumento && !doc.numeroDocumento?.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) return false;
        if (filters.origem && !doc.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
        if (filters.tipoDocumento && !doc.tipoDocumento?.toLowerCase().includes(filters.tipoDocumento.toLowerCase())) return false;
        if (filters.descricaoDocumento && !doc.descricaoDocumento?.toLowerCase().includes(filters.descricaoDocumento.toLowerCase())) return false;
        if (filters.partes && !doc.nomePartePrincipal?.toLowerCase().includes(filters.partes.toLowerCase())) return false;
        if (filters.codigoCaixa && !doc.codigosCaixa?.toLowerCase().includes(filters.codigoCaixa.toLowerCase())) return false;
        if (filters.anoEliminacaoPrevisto && doc.anoEliminacaoPrevisto !== filters.anoEliminacaoPrevisto) return false;
        if (filters.codigoAtoM && !doc.codigoAtoM?.toLowerCase().includes(filters.codigoAtoM.toLowerCase())) return false;
        if (filters.observacoesGerais && !doc.observacoesGerais?.toLowerCase().includes(filters.observacoesGerais.toLowerCase())) return false;
        if (filters.codigoClasseJudicial && !doc.codigoClassificacaoJudicialId?.toLowerCase().includes(filters.codigoClasseJudicial.toLowerCase())) return false;
        if (filters.numeroListagemEliminacao && !doc.numeroListagemEliminacao?.toLowerCase().includes(filters.numeroListagemEliminacao.toLowerCase())) return false;

        // Select filters (exact match)
        if (filters.classificacao && doc.classificacaoArquivisticaId !== filters.classificacao) return false;
        if (filters.status && doc.status !== filters.status) return false;
        if (filters.orgao && doc.orgao !== filters.orgao) return false;
        if (filters.tipoMeio && doc.tipoMeio !== filters.tipoMeio) return false;
        if (filters.generoDocumental && doc.generoDocumental !== filters.generoDocumental) return false;
        if (filters.categoria && doc.categoria !== filters.categoria) return false;
        if (filters.destinacaoFinal && doc.destinacaoFinalDisplay !== filters.destinacaoFinal) return false;
        if (filters.grauSigilo && doc.grauSigilo !== filters.grauSigilo) return false;

        // Checkbox filters
        if (filters.segredoJustica && doc.segredoJustica !== "Sim") return false;
        if (filters.digitalizado && doc.digitalizado !== "Sim") return false;
        
        // Date range filters for dataArquivamento
        if (filters.dataArquivamentoDe || filters.dataArquivamentoAte) {
            if (!doc.dataArquivamento) return false; // Must have a date to be included in date filter
            try {
                const docArqDate = parseISO(doc.dataArquivamento);
                if (filters.dataArquivamentoDe && isBefore(docArqDate, filters.dataArquivamentoDe)) return false;
                if (filters.dataArquivamentoAte && isAfter(docArqDate, filters.dataArquivamentoAte)) return false;
            } catch (e) { return false; } // Invalid date format in document
        }

        // Skipping dataDocumento range filter due to complexity of parsing dataAbrangente string.

        return true;
    });

    setResults(filtered);
    setSearched(true);
  };


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
            <Input id="numeroDocumento" placeholder="Ex: PRC-2023-001" value={filters.numeroDocumento} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" placeholder="Ex: Tribunal de Justiça" value={filters.origem} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
            <Input id="tipoDocumento" placeholder="Ex: Ação Ordinária" value={filters.tipoDocumento} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricaoDocumento">Descrição do Documento</Label>
            <Input id="descricaoDocumento" placeholder="Contém..." value={filters.descricaoDocumento} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataDocumentoDe">Data do Documento (De)</Label>
            <DateInputPicker value={filters.dataDocumentoDe} onChange={handleDateChange('dataDocumentoDe')} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataDocumentoAte">Data do Documento (Até)</Label>
            <DateInputPicker value={filters.dataDocumentoAte} onChange={handleDateChange('dataDocumentoAte')} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataArquivamentoDe">Data de Arquivamento (De)</Label>
            <DateInputPicker value={filters.dataArquivamentoDe} onChange={handleDateChange('dataArquivamentoDe')} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataArquivamentoAte">Data de Arquivamento (Até)</Label>
            <DateInputPicker value={filters.dataArquivamentoAte} onChange={handleDateChange('dataArquivamentoAte')} placeholder="dd/mm/aaaa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partes">Partes Envolvidas</Label>
            <Input id="partes" placeholder="Ex: João da Silva" value={filters.partes} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classificacao">Classificação Arquivística</Label>
            <Select onValueChange={handleSelectChange('classificacao')} value={filters.classificacao}>
              <SelectTrigger id="classificacao">
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>
              <SelectContent>
                {allClassificacoes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.descricao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoCaixa">Código da Caixa</Label>
            <Input id="codigoCaixa" placeholder="Ex: CX-A-001" value={filters.codigoCaixa} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="status">Status do Documento</Label>
            <Select onValueChange={handleSelectChange('status')} value={filters.status}>
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
            <Select onValueChange={handleSelectChange('orgao')} value={filters.orgao}>
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
            <Select onValueChange={handleSelectChange('tipoMeio')} value={filters.tipoMeio}>
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
            <Select onValueChange={handleSelectChange('generoDocumental')} value={filters.generoDocumental}>
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
            <Select onValueChange={handleSelectChange('categoria')} value={filters.categoria}>
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
            <Select onValueChange={handleSelectChange('destinacaoFinal')} value={filters.destinacaoFinal}>
                <SelectTrigger id="destinacaoFinal"><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anoEliminacaoPrevisto">Ano de Eliminação Previsto</Label>
            <Input id="anoEliminacaoPrevisto" type="number" placeholder="AAAA" value={filters.anoEliminacaoPrevisto} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grauSigilo">Grau de Sigilo (LAI)</Label>
            <Select onValueChange={handleSelectChange('grauSigilo')} value={filters.grauSigilo}>
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
            <Input id="codigoAtoM" placeholder="Contém..." value={filters.codigoAtoM} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoesGerais">Observações Gerais</Label>
            <Input id="observacoesGerais" placeholder="Contém..." value={filters.observacoesGerais} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoClasseJudicial">Código da Classe Judicial</Label>
            <Input id="codigoClasseJudicial" placeholder="Contém..." value={filters.codigoClasseJudicial} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroListagemEliminacao">Nº da Listagem de Eliminação</Label>
            <Input id="numeroListagemEliminacao" placeholder="Contém..." value={filters.numeroListagemEliminacao} onChange={handleInputChange} />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="segredoJustica" checked={filters.segredoJustica} onCheckedChange={handleCheckboxChange('segredoJustica')} />
            <Label htmlFor="segredoJustica">Segredo de Justiça</Label>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="digitalizado" checked={filters.digitalizado} onCheckedChange={handleCheckboxChange('digitalizado')} />
            <Label htmlFor="digitalizado">Apenas Digitalizados</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Resultados da Busca</CardTitle>
           <CardDescription>
            {searched ? `${results.length} documento(s) encontrado(s).` : 'A busca será exibida aqui.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searched ? (
            results.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº do Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Caixa(s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.numeroDocumento || 'N/A'}</TableCell>
                      <TableCell>{doc.tipoDocumento || 'N/A'}</TableCell>
                      <TableCell className="max-w-sm truncate" title={doc.descricaoDocumento}>{doc.descricaoDocumento || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={
                            doc.status === 'Arquivado' ? 'secondary' :
                            doc.status === 'Eliminado' ? 'destructive' :
                            doc.status === 'Aguardando prazo para eliminação' ? 'default' :
                            'default'
                        }>{doc.status}</Badge>
                      </TableCell>
                      <TableCell>{doc.codigosCaixa || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum resultado encontrado para os critérios informados.</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma busca realizada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

