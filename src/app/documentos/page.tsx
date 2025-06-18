
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Documento } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/date-picker";

const placeholderClassificacoesSimulado = [
  { id: "CLA001", codigo: "020.1", inativo: false },
  { id: "CLA002", codigo: "030.5", inativo: true },
  { id: "CLA003", codigo: "045.2", inativo: false },
];

const placeholderDocumentos: Documento[] = [
  { id: "DOC001", identificador: "PRC-2023-001", status: "Arquivado", origem: "Tribunal de Justiça", tipoMeio: "Papel", generoDocumental: "Textual", categoria: "Processo Judicial", tipoDocumento: "Ação Ordinária", dataDocumento: new Date("2023-01-15").toISOString(), classificacaoArquivisticaId: "CLA001", segredoJustica: false, grauSigilo: "Público", codigoCaixa: "CX001", dataCadastro: new Date().toISOString(), digitalizacao: false, classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA001")?.inativo },
  { id: "DOC002", identificador: "OFC-2023-045", status: "Emprestado", origem: "Secretaria Municipal", tipoMeio: "Digital", generoDocumental: "Textual", categoria: "Ofício", tipoDocumento: "Solicitação de Informações", dataDocumento: new Date("2023-03-20").toISOString(), classificacaoArquivisticaId: "CLA002", segredoJustica: false, grauSigilo: "Público", codigoCaixa: "CX002", dataCadastro: new Date().toISOString(), digitalizacao: true, classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA002")?.inativo },
  { id: "DOC003", identificador: "MEM-2022-112", status: "Arquivado", origem: "Câmara de Vereadores", tipoMeio: "Papel", generoDocumental: "Textual", categoria: "Memorando", tipoDocumento: "Comunicação Interna", dataDocumento: new Date("2022-11-05").toISOString(), classificacaoArquivisticaId: "CLA003", segredoJustica: true, grauSigilo: "Secreto", codigoCaixa: "CX001", dataCadastro: new Date().toISOString(), digitalizacao: false, classificacaoInativa: placeholderClassificacoesSimulado.find(c => c.id === "CLA003")?.inativo },
];

const initialFormState: Partial<Documento> = {
  identificador: "",
  status: "Arquivado",
  origem: "",
  tipoMeio: "Papel",
  generoDocumental: "Textual",
  categoria: "",
  tipoDocumento: "",
  dataDocumento: new Date().toISOString(),
  dataLimite: undefined,
  volume: "",
  apenso: "",
  midia: "",
  digitalizacao: false,
  classificacaoArquivisticaId: "",
  partes: "",
  segredoJustica: false,
  grauSigilo: "Público",
  codigoCaixa: "",
  codigoAtoM: "",
  observacoes: "",
};

export default function DocumentosPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<Partial<Documento>>(initialFormState);
  const [outroTipoMeio, setOutroTipoMeio] = React.useState("");
  const [outroGeneroDocumental, setOutroGeneroDocumental] = React.useState("");
  const [outroGrauSigilo, setOutroGrauSigilo] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof Partial<Documento>) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
    if (id === 'tipoMeio' && value !== 'Outro') setOutroTipoMeio("");
    if (id === 'generoDocumental' && value !== 'Outro') setOutroGeneroDocumental("");
    if (id === 'grauSigilo' && value !== 'Outro') setOutroGrauSigilo("");
  };

  const handleCheckboxChange = (id: keyof Partial<Documento>) => (checked: boolean) => {
    setFormState(prev => ({ ...prev, [id]: checked }));
  };

  const handleDateChange = (id: keyof Partial<Documento>) => (date?: Date) => {
    setFormState(prev => ({ ...prev, [id]: date?.toISOString() }));
  };
  
  const resetForm = () => {
    setFormState(initialFormState);
    setOutroTipoMeio("");
    setOutroGeneroDocumental("");
    setOutroGrauSigilo("");
  };

  const handleSaveChanges = () => {
    const finalFormState = {
      ...formState,
      tipoMeio: formState.tipoMeio === 'Outro' ? outroTipoMeio : formState.tipoMeio,
      generoDocumental: formState.generoDocumental === 'Outro' ? outroGeneroDocumental : formState.generoDocumental,
      grauSigilo: formState.grauSigilo === 'Outro' ? outroGrauSigilo : formState.grauSigilo,
      dataCadastro: new Date().toISOString(), // Should be set on actual save
    };
    console.log("Salvando documento:", finalFormState);
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento do Acervo" description="Cadastre e gerencie as descrições dos documentos do acervo.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar ao Acervo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">Adicionar Novo Item ao Acervo</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4 grid-cols-1 md:grid-cols-2">
              
              <div className="space-y-2">
                <Label htmlFor="identificador">Identificador*</Label>
                <Input id="identificador" value={formState.identificador} onChange={handleInputChange} placeholder="Ex: PRC-2024-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input id="origem" value={formState.origem} onChange={handleInputChange} placeholder="Ex: Tribunal de Justiça" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                <Input id="tipoDocumento" value={formState.tipoDocumento} onChange={handleInputChange} placeholder="Ex: Ação Ordinária" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="dataDocumento">Data do Documento*</Label>
                <DatePicker 
                  date={formState.dataDocumento ? parseISO(formState.dataDocumento) : undefined} 
                  setDate={(date) => handleDateChange('dataDocumento')(date)} 
                  placeholder="Selecione a data"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoMeio">Tipo de Meio</Label>
                <Select onValueChange={handleSelectChange('tipoMeio')} value={formState.tipoMeio}>
                  <SelectTrigger id="tipoMeio"><SelectValue placeholder="Selecione o tipo de meio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Papel">Papel</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Microfilme">Microfilme</SelectItem>
                    <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
                {formState.tipoMeio === 'Outro' && (
                  <Input id="outroTipoMeioInput" value={outroTipoMeio} onChange={(e) => setOutroTipoMeio(e.target.value)} placeholder="Especifique o tipo de meio" className="mt-2" />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="generoDocumental">Gênero Documental</Label>
                <Select onValueChange={handleSelectChange('generoDocumental')} value={formState.generoDocumental}>
                  <SelectTrigger id="generoDocumental"><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Textual">Textual</SelectItem>
                    <SelectItem value="Iconográfico">Iconográfico</SelectItem>
                    <SelectItem value="Audiovisual">Audiovisual</SelectItem>
                    <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
                {formState.generoDocumental === 'Outro' && (
                  <Input id="outroGeneroDocumentalInput" value={outroGeneroDocumental} onChange={(e) => setOutroGeneroDocumental(e.target.value)} placeholder="Especifique o gênero" className="mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input id="categoria" value={formState.categoria} onChange={handleInputChange} placeholder="Ex: Processo Judicial" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataLimite">Data Limite (Prescrição)</Label>
                 <DatePicker 
                  date={formState.dataLimite ? parseISO(formState.dataLimite) : undefined} 
                  setDate={(date) => handleDateChange('dataLimite')(date)} 
                  placeholder="Selecione a data limite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume/Quantidade</Label>
                <Input id="volume" value={formState.volume} onChange={handleInputChange} placeholder="Ex: 2 vols, 150 fls." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apenso">Apenso/Anexo</Label>
                <Input id="apenso" value={formState.apenso} onChange={handleInputChange} placeholder="Nº do processo apenso" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="midia">Mídia</Label>
                <Input id="midia" value={formState.midia} onChange={handleInputChange} placeholder="Ex: CD-ROM, DVD, Pen Drive" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="classificacaoArquivisticaId">Código de Classificação*</Label>
                <Input id="classificacaoArquivisticaId" value={formState.classificacaoArquivisticaId} onChange={handleInputChange} placeholder="Ex: 020.1 (ID da Classificação)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partes">Partes Envolvidas</Label>
                <Input id="partes" value={formState.partes} onChange={handleInputChange} placeholder="Ex: João da Silva vs. Maria Ltda" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grauSigilo">Grau de Sigilo</Label>
                 <Select onValueChange={handleSelectChange('grauSigilo')} value={formState.grauSigilo}>
                  <SelectTrigger id="grauSigilo"><SelectValue placeholder="Selecione o grau de sigilo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Público">Público</SelectItem>
                    <SelectItem value="Reservado">Reservado</SelectItem>
                    <SelectItem value="Secreto">Secreto</SelectItem>
                    <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
                {formState.grauSigilo === 'Outro' && (
                  <Input id="outroGrauSigiloInput" value={outroGrauSigilo} onChange={(e) => setOutroGrauSigilo(e.target.value)} placeholder="Especifique o grau de sigilo" className="mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoCaixa">Código da Caixa*</Label>
                <Input id="codigoCaixa" value={formState.codigoCaixa} onChange={handleInputChange} placeholder="Ex: CX-A-001 (ID da Caixa)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoAtoM">Código do Ato Normativo M</Label>
                <Input id="codigoAtoM" value={formState.codigoAtoM} onChange={handleInputChange} placeholder="Código do ato (se aplicável)" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formState.observacoes} onChange={handleInputChange} placeholder="Informações adicionais sobre o documento" />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="digitalizacao" checked={formState.digitalizacao} onCheckedChange={handleCheckboxChange('digitalizacao')} />
                <Label htmlFor="digitalizacao">Digitalizado</Label>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="segredoJustica" checked={formState.segredoJustica} onCheckedChange={handleCheckboxChange('segredoJustica')} />
                <Label htmlFor="segredoJustica">Segredo de Justiça</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status do Documento*</Label>
                <Select onValueChange={handleSelectChange('status')} value={formState.status as Documento['status']}>
                  <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arquivado">Arquivado</SelectItem>
                    <SelectItem value="Emprestado">Emprestado</SelectItem>
                    <SelectItem value="Desarquivado">Desarquivado</SelectItem>
                    <SelectItem value="Eliminado">Eliminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Documento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Itens do Acervo</CardTitle>
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

