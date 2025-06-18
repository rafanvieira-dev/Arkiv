
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

const placeholderCaixas: Caixa[] = [
  { id: "CX001", codigoCaixa: "CX-A-001", tipo: "Caixa Arquivo", status: "Lacrada", localizacao: "Estante 1, Prateleira A", situacao: "Ativa", documentoIds: ["DOC001", "DOC003"] },
  { id: "CX002", codigoCaixa: "CX-B-015", tipo: "Caixa Arquivo", status: "Fechada", localizacao: "Estante 2, Prateleira C", situacao: "Ativa", documentoIds: ["DOC002"] },
  { id: "CX003", codigoCaixa: "PST-X-007", tipo: "Pasta", status: "Aberta", localizacao: "Arquivo Corrente", situacao: "Ativa" },
];

export default function CaixasPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSaveChanges = () => {
    // Lógica para salvar os dados da nova caixa será implementada aqui
    console.log("Salvando nova caixa...");
    setIsDialogOpen(false); // Fecha o diálogo após salvar (ou tentar salvar)
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Cadastro de Caixas" description="Gerencie os dados das caixas que armazenam os documentos.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
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
                <Select>
                  <SelectTrigger id="tipoCaixa" className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caixa Arquivo">Caixa Arquivo</SelectItem>
                    <SelectItem value="Pasta">Pasta</SelectItem>
                    <SelectItem value="Livro">Livro</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="Lacrada">Lacrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="situacaoCaixa" className="text-right">
                  Situação*
                </Label>
                <Select defaultValue="Ativa">
                  <SelectTrigger id="situacaoCaixa" className="col-span-3">
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
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
                <TableHead>Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderCaixas.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigoCaixa}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.localizacao}</TableCell>
                  <TableCell><Badge variant={item.status === 'Lacrada' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
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

