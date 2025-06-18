
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Caixa } from "@/types";
import { PlusCircle, Edit, Trash2, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const tiposCaixaPadrao = ["JUD", "DOC", "ADM", "ADM/SIGA", "JUD/APOLO", "JUD/HÍBRIDO"];

const placeholderCaixas: Caixa[] = [
  { id: "CX001", codigoCaixa: "CX-A-001", tipo: "JUD", status: "Fechada", localizacao: "Estante 1, Prateleira A", situacao: "Completa", documentoIds: ["DOC001", "DOC003"] },
  { id: "CX002", codigoCaixa: "CX-B-015", tipo: "ADM/SIGA", status: "Aberta", localizacao: "Estante 2, Prateleira C", situacao: "Incompleta", documentoIds: ["DOC002"] },
  { id: "CX003", codigoCaixa: "PST-X-007", tipo: "DOC", status: "Aberta", localizacao: "Arquivo Corrente", situacao: "Completa" },
];

export default function CaixasPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTipoCaixa, setSelectedTipoCaixa] = React.useState<string>("");
  const [outroTipoCaixa, setOutroTipoCaixa] = React.useState<string>("");

  const handleSaveChanges = () => {
    // Lógica para salvar os dados da nova caixa será implementada aqui
    // Exemplo de como obter o tipo final:
    const tipoFinal = selectedTipoCaixa === "Outro" ? outroTipoCaixa : selectedTipoCaixa;
    console.log("Salvando nova caixa com tipo:", tipoFinal);
    // Adicionar aqui a lógica para coletar todos os campos do formulário
    setIsDialogOpen(false); 
    setSelectedTipoCaixa("");
    setOutroTipoCaixa("");
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Caixas" description="Gerencie os dados das caixas que armazenam os documentos.">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setSelectedTipoCaixa("");
            setOutroTipoCaixa("");
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Caixa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-primary">Nova Caixa</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para cadastrar uma nova caixa. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigoCaixa" className="text-right">
                  Código*
                </Label>
                <Input id="codigoCaixa" placeholder="Ex: CX-A-001" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricaoCaixa" className="text-right">
                  Descrição
                </Label>
                <Textarea id="descricaoCaixa" placeholder="Detalhes adicionais sobre a caixa" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipoCaixa" className="text-right">
                  Tipo*
                </Label>
                <Select onValueChange={setSelectedTipoCaixa} value={selectedTipoCaixa}>
                  <SelectTrigger id="tipoCaixa" className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCaixaPadrao.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                    <SelectItem value="Outro">Outro (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedTipoCaixa === "Outro" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="outroTipoCaixa" className="text-right">
                    Espec. Tipo*
                  </Label>
                  <Input
                    id="outroTipoCaixa"
                    placeholder="Digite o novo tipo"
                    className="col-span-3"
                    value={outroTipoCaixa}
                    onChange={(e) => setOutroTipoCaixa(e.target.value)}
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="localizacaoCaixa" className="text-right">
                  Localização
                </Label>
                <Input id="localizacaoCaixa" placeholder="Ex: Estante 1, Prateleira A" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statusCaixa" className="text-right">
                  Status*
                </Label>
                <Select defaultValue="Aberta">
                  <SelectTrigger id="statusCaixa" className="col-span-3">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberta">Aberta</SelectItem>
                    <SelectItem value="Fechada">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="situacaoCaixa" className="text-right">
                  Situação*
                </Label>
                <Select defaultValue="Incompleta">
                  <SelectTrigger id="situacaoCaixa" className="col-span-3">
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completa">Completa</SelectItem>
                    <SelectItem value="Incompleta">Incompleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>Salvar Caixa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Caixas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Qtd. Docs</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderCaixas.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigoCaixa}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.localizacao}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Fechada' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={item.situacao === 'Completa' ? 'secondary' : 'outline'}>
                        {item.situacao}
                      </Badge>
                  </TableCell>
                  <TableCell>{item.documentoIds?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Ver Documentos">
                      <PackageOpen className="h-4 w-4" />
                    </Button>
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
