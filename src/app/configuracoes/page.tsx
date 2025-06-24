
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { initialTiposDocumento } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


const TIPOS_DOCUMENTO_STORAGE_KEY = 'arquivocentral_tipos_documento';


export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const [tiposDocumento, setTiposDocumento] = React.useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTipo, setEditingTipo] = React.useState<string | null>(null);
  const [formValue, setFormValue] = React.useState("");

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TIPOS_DOCUMENTO_STORAGE_KEY);
      setTiposDocumento(stored ? JSON.parse(stored) : initialTiposDocumento);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setTiposDocumento(initialTiposDocumento);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
        window.localStorage.setItem(TIPOS_DOCUMENTO_STORAGE_KEY, JSON.stringify(tiposDocumento));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [tiposDocumento, isDataLoaded]);

  const resetForm = () => {
    setEditingTipo(null);
    setFormValue("");
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (tipo?: string) => {
    if (tipo) {
      setEditingTipo(tipo);
      setFormValue(tipo);
    } else {
      setEditingTipo(null);
      setFormValue("");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formValue.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do tipo não pode ser vazio." });
      return;
    }
    
    const isDuplicate = tiposDocumento.some(
      (t) => t.toLowerCase() === formValue.trim().toLowerCase() && t !== editingTipo
    );

    if (isDuplicate) {
       toast({ variant: "destructive", title: "Erro", description: "Este tipo de documento já existe." });
      return;
    }
    
    if (editingTipo) {
      setTiposDocumento(prev => prev.map(t => t === editingTipo ? formValue.trim() : t));
      toast({ title: "Sucesso", description: "Tipo de documento atualizado." });
    } else {
      setTiposDocumento(prev => [...prev, formValue.trim()]);
      toast({ title: "Sucesso", description: "Novo tipo de documento adicionado." });
    }

    resetForm();
  };
  
  const handleDelete = (tipoToDelete: string) => {
    setTiposDocumento(prev => prev.filter(t => t !== tipoToDelete));
    toast({ title: "Sucesso", description: `"${tipoToDelete}" foi removido.` });
  };


  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Configurações do Sistema" description="Ajuste as configurações gerais e os parâmetros do ArquivoCentral." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-primary">Configurações Gerais</CardTitle>
            <CardDescription>Ajustes básicos do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appName">Nome da Aplicação</Label>
              <Input id="appName" defaultValue="ArquivoCentral" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email do Administrador</Label>
              <Input id="adminEmail" type="email" placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retentionPolicy">Política de Retenção Padrão (Anos)</Label>
              <Input id="retentionPolicy" type="number" defaultValue="5" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-primary">Gerenciar Tipos de Documento</CardTitle>
              <CardDescription>Adicione ou edite os tipos de documento.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingTipo ? "Editar" : "Novo"} Tipo de Documento</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-2">
                    <Label htmlFor="tipo-doc-form">Nome do Tipo</Label>
                    <Input 
                      id="tipo-doc-form" 
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder="Ex: Carta Precatória"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Salvar</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
              {tiposDocumento.sort((a,b) => a.localeCompare(b)).map(tipo => (
                <div key={tipo} className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50">
                  <span className="text-sm">{tipo}</span>
                  <div>
                     <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tipo)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Editar</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDelete(tipo)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Excluir</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
              {tiposDocumento.length === 0 && (
                 <p className="text-sm text-center text-muted-foreground py-4">Nenhum tipo cadastrado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-primary">Backup e Restauração</CardTitle>
            <CardDescription>Gerencie backups do banco de dados e arquivos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Opções de backup e restauração ainda não implementadas.</p>
            <Button variant="outline">Iniciar Backup Manual</Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
}
