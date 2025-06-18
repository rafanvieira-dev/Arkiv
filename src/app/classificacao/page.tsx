
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Classificacao } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

const placeholderClassificacoes: Classificacao[] = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis", tabelaTemporalidade: "TTD-01", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 5, prazoGuardaFaseIntermediariaAnos: 15, destinacaoFinal: "Guarda Permanente", inativo: false },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas", tabelaTemporalidade: "TTD-02", tipoPrazoFaseCorrente: "Condição Textual", prazoGuardaFaseCorrenteCondicaoTextual: "Até a próxima atualização", prazoGuardaFaseIntermediariaAnos: 3, destinacaoFinal: "Eliminação", inativo: true },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais", tabelaTemporalidade: "TTD-01", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 1, prazoGuardaFaseIntermediariaAnos: 0, destinacaoFinal: "Guarda Permanente", observacoes: "Manter permanentemente na fase intermediária", inativo: false },
];

const opcoesCondicaoTextualFaseCorrente = [
  "3 anos após o encerramento",
  "Após aprovação das contas pelo TCU",
  "Até a aposentadoria ou o desligamento",
  "Até a atualização",
  "Até a conclusão da apuração",
  "Até a devolução do bem",
  "Até a homologação do Concurso",
  "Até a informatização ou alienação",
  "Até a posse",
  "Até a próxima atualização",
  "Até a publicação",
  "Até a quitação da dívida",
  "Até devolução",
  "Até devolução dos autos",
  "Até o desfazimento do bem",
  "Até o desligamento do estagiário",
  "Até o desligamento do servidor ou, em caso de haver pensionista(s), 5 anos após o falecimento do último beneficiário",
  "Até o encerramento",
  "Até o encerramento do processo de execução penal",
  "Até o vitaliciamento",
  "Até vigência",
  "Até vigência do contrato ou julgamento TCU",
  "Durante a vigência",
  "Durante o prazo da licitação",
  "Eliminação no momento do recebimento",
  "Enquanto durar a ocupação",
  "Enquanto durar o período de prova",
  "Enquanto durar sessão de julgamento",
  "Enquanto o bem estiver alienado",
  "Enquanto vigente",
  "Enquanto vigora",
  "Imediatamente após a produção",
  "Prazo da licença",
  "Prazo do processo",
  "Validade do Concurso",
];

const initialState = {
  codigo: "",
  descricao: "",
  tabelaTemporalidade: "",
  tipoPrazoFaseCorrente: "",
  prazoGuardaFaseCorrenteAnos: "",
  prazoGuardaFaseCorrenteCondicaoTextual: "",
  prazoGuardaFaseIntermediariaAnos: "",
  destinacaoFinal: "",
  observacoes: "",
  inativo: false,
};

export default function ClassificacaoPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState(initialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof initialState) => (value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
     if (id === 'tipoPrazoFaseCorrente') {
      if (value === 'Anos') {
        setFormState(prev => ({ ...prev, prazoGuardaFaseCorrenteCondicaoTextual: "" }));
      } else if (value === 'Condição Textual') {
        setFormState(prev => ({ ...prev, prazoGuardaFaseCorrenteAnos: "" }));
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, inativo: checked }));
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  const handleSaveChanges = () => {
    console.log("Salvando nova classificação:", {
      ...formState,
      prazoGuardaFaseCorrenteAnos: formState.tipoPrazoFaseCorrente === 'Anos' ? parseInt(formState.prazoGuardaFaseCorrenteAnos, 10) || 0 : undefined,
      prazoGuardaFaseIntermediariaAnos: parseInt(formState.prazoGuardaFaseIntermediariaAnos, 10) || 0,
    });
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Classificação" description="Gerencie os códigos de classificação de assuntos dos documentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Classificação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">Nova Classificação</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigo" className="text-right">
                  Código*
                </Label>
                <Input id="codigo" value={formState.codigo} onChange={handleInputChange} placeholder="Ex: 020.1" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Assunto*
                </Label>
                <Input id="descricao" value={formState.descricao} onChange={handleInputChange} placeholder="Ex: Processos Judiciais Cíveis" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tabelaTemporalidade" className="text-right">
                  Tab. Temp.
                </Label>
                <Input id="tabelaTemporalidade" value={formState.tabelaTemporalidade} onChange={handleInputChange} placeholder="Ex: TTD-01" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipoPrazoFaseCorrente" className="text-right">
                  Tipo Prazo Corrente
                </Label>
                <Select onValueChange={handleSelectChange('tipoPrazoFaseCorrente')} value={formState.tipoPrazoFaseCorrente}>
                  <SelectTrigger id="tipoPrazoFaseCorrente" className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Anos">Anos</SelectItem>
                    <SelectItem value="Condição Textual">Condição Textual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formState.tipoPrazoFaseCorrente === "Anos" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prazoGuardaFaseCorrenteAnos" className="text-right">
                    Prazo Corrente (Anos)
                  </Label>
                  <Input id="prazoGuardaFaseCorrenteAnos" type="number" value={formState.prazoGuardaFaseCorrenteAnos} onChange={handleInputChange} placeholder="Nº de anos (ex: 5)" className="col-span-3" />
                </div>
              )}

              {formState.tipoPrazoFaseCorrente === "Condição Textual" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prazoGuardaFaseCorrenteCondicaoTextual" className="text-right">
                    Prazo Corrente (Condição)
                  </Label>
                  <Select onValueChange={handleSelectChange('prazoGuardaFaseCorrenteCondicaoTextual')} value={formState.prazoGuardaFaseCorrenteCondicaoTextual}>
                    <SelectTrigger id="prazoGuardaFaseCorrenteCondicaoTextual" className="col-span-3">
                      <SelectValue placeholder="Selecione a condição textual" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoesCondicaoTextualFaseCorrente.map(opcao => (
                        <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prazoGuardaFaseIntermediariaAnos" className="text-right">
                  Prazo Intermed. (Anos)*
                </Label>
                <Input id="prazoGuardaFaseIntermediariaAnos" type="number" value={formState.prazoGuardaFaseIntermediariaAnos} onChange={handleInputChange} placeholder="Nº de anos (ex: 15, pode ser 0)" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="destinacaoFinal" className="text-right">
                  Destinação Final*
                </Label>
                <Select onValueChange={handleSelectChange('destinacaoFinal')} value={formState.destinacaoFinal}>
                  <SelectTrigger id="destinacaoFinal" className="col-span-3">
                    <SelectValue placeholder="Selecione a destinação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eliminação">Eliminação</SelectItem>
                    <SelectItem value="Guarda Permanente">Guarda Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoes" className="text-right">
                  Observações
                </Label>
                <Textarea id="observacoes" value={formState.observacoes} onChange={handleInputChange} placeholder="Detalhes adicionais" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inativo" className="text-right">
                  Inativo
                </Label>
                <Checkbox id="inativo" checked={formState.inativo} onCheckedChange={handleCheckboxChange} className="col-span-3 justify-self-start" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Classificação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Classificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Destinação Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderClassificacoes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>{item.destinacaoFinal}</TableCell>
                  <TableCell>
                    <Badge variant={item.inativo ? 'destructive' : 'secondary'}>
                      {item.inativo ? 'Inativo' : 'Ativo'}
                    </Badge>
                  </TableCell>
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
