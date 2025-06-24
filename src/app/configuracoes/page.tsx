
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { initialTiposDocumento, initialGenerosDocumentais, initialTiposMidia, initialTiposParte, initialTiposOrigem, initialTiposCaixa } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { TipoOrigem } from "@/types";


const TIPOS_DOCUMENTO_STORAGE_KEY = 'arquivocentral_tipos_documento';
const TIPOS_PARTE_STORAGE_KEY = 'arquivocentral_tipos_parte';
const GENEROS_DOCUMENTAIS_STORAGE_KEY = 'arquivocentral_generos_documentais';
const TIPOS_MIDIA_STORAGE_KEY = 'arquivocentral_tipos_midia';
const TIPOS_ORIGEM_STORAGE_KEY = 'arquivocentral_tipos_origem';
const TIPOS_CAIXA_STORAGE_KEY = 'arquivocentral_tipos_caixa';

type DialogMode = 'tipoDocumento' | 'tipoParte' | 'generoDocumental' | 'tipoMidia' | 'tipoCaixa';


export default function ConfiguracoesPage() {
  const { toast } = useToast();
  
  const [tiposDocumento, setTiposDocumento] = React.useState<string[]>([]);
  const [tiposParte, setTiposParte] = React.useState<string[]>([]);
  const [generosDocumentais, setGenerosDocumentais] = React.useState<string[]>([]);
  const [tiposMidia, setTiposMidia] = React.useState<string[]>([]);
  const [tiposOrigem, setTiposOrigem] = React.useState<TipoOrigem[]>([]);
  const [tiposCaixa, setTiposCaixa] = React.useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{ mode: DialogMode; title: string } | null>(null);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [formValue, setFormValue] = React.useState("");
  
  const [isOrigemDialogOpen, setIsOrigemDialogOpen] = React.useState(false);
  const [origemFormState, setOrigemFormState] = React.useState<{ id?: string; nome: string; sigla: string }>({ nome: "", sigla: "" });
  const [isEditingOrigem, setIsEditingOrigem] = React.useState(false);


  React.useEffect(() => {
    try {
      const storedTiposDoc = window.localStorage.getItem(TIPOS_DOCUMENTO_STORAGE_KEY);
      setTiposDocumento(storedTiposDoc ? JSON.parse(storedTiposDoc) : initialTiposDocumento);

      const storedTiposParte = window.localStorage.getItem(TIPOS_PARTE_STORAGE_KEY);
      setTiposParte(storedTiposParte ? JSON.parse(storedTiposParte) : initialTiposParte);

      const storedGeneros = window.localStorage.getItem(GENEROS_DOCUMENTAIS_STORAGE_KEY);
      setGenerosDocumentais(storedGeneros ? JSON.parse(storedGeneros) : initialGenerosDocumentais);
      
      const storedMidias = window.localStorage.getItem(TIPOS_MIDIA_STORAGE_KEY);
      setTiposMidia(storedMidias ? JSON.parse(storedMidias) : initialTiposMidia);
      
      const storedTiposOrigem = window.localStorage.getItem(TIPOS_ORIGEM_STORAGE_KEY);
      setTiposOrigem(storedTiposOrigem ? JSON.parse(storedTiposOrigem) : initialTiposOrigem);

      const storedTiposCaixa = window.localStorage.getItem(TIPOS_CAIXA_STORAGE_KEY);
      setTiposCaixa(storedTiposCaixa ? JSON.parse(storedTiposCaixa) : initialTiposCaixa);

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setTiposDocumento(initialTiposDocumento);
      setTiposParte(initialTiposParte);
      setGenerosDocumentais(initialGenerosDocumentais);
      setTiposMidia(initialTiposMidia);
      setTiposOrigem(initialTiposOrigem);
      setTiposCaixa(initialTiposCaixa);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
        window.localStorage.setItem(TIPOS_DOCUMENTO_STORAGE_KEY, JSON.stringify(tiposDocumento));
        window.localStorage.setItem(TIPOS_PARTE_STORAGE_KEY, JSON.stringify(tiposParte));
        window.localStorage.setItem(GENEROS_DOCUMENTAIS_STORAGE_KEY, JSON.stringify(generosDocumentais));
        window.localStorage.setItem(TIPOS_MIDIA_STORAGE_KEY, JSON.stringify(tiposMidia));
        window.localStorage.setItem(TIPOS_ORIGEM_STORAGE_KEY, JSON.stringify(tiposOrigem));
        window.localStorage.setItem(TIPOS_CAIXA_STORAGE_KEY, JSON.stringify(tiposCaixa));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [tiposDocumento, tiposParte, generosDocumentais, tiposMidia, tiposOrigem, tiposCaixa, isDataLoaded]);

  const resetForm = () => {
    setDialogConfig(null);
    setEditingValue(null);
    setFormValue("");
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (mode: DialogMode, title: string, value?: string) => {
    setDialogConfig({ mode, title });
    if (value) {
      setEditingValue(value);
      setFormValue(value);
    } else {
      setEditingValue(null);
      setFormValue("");
    }
    setIsDialogOpen(true);
  };

  const getListAndSetter = (mode: DialogMode): [string[], React.Dispatch<React.SetStateAction<string[]>>] => {
    switch (mode) {
      case 'tipoDocumento': return [tiposDocumento, setTiposDocumento];
      case 'tipoParte': return [tiposParte, setTiposParte];
      case 'generoDocumental': return [generosDocumentais, setGenerosDocumentais];
      case 'tipoMidia': return [tiposMidia, setTiposMidia];
      case 'tipoCaixa': return [tiposCaixa, setTiposCaixa];
    }
  }

  const handleSave = () => {
    if (!dialogConfig) return;
    if (!formValue.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome não pode ser vazio." });
      return;
    }
    
    const [list, setter] = getListAndSetter(dialogConfig.mode);
    const isDuplicate = list.some(
      (item) => item.toLowerCase() === formValue.trim().toLowerCase() && item !== editingValue
    );

    if (isDuplicate) {
       toast({ variant: "destructive", title: "Erro", description: "Este item já existe." });
      return;
    }
    
    if (editingValue) {
      setter(prev => prev.map(item => item === editingValue ? formValue.trim() : item));
      toast({ title: "Sucesso", description: "Item atualizado." });
    } else {
      setter(prev => [...prev, formValue.trim()]);
      toast({ title: "Sucesso", description: "Novo item adicionado." });
    }

    resetForm();
  };
  
  const handleDelete = (mode: DialogMode, valueToDelete: string) => {
    const [, setter] = getListAndSetter(mode);
    setter(prev => prev.filter(item => item !== valueToDelete));
    toast({ title: "Sucesso", description: `"${valueToDelete}" foi removido.` });
  };
  
  const resetOrigemForm = () => {
    setOrigemFormState({ nome: "", sigla: "" });
    setIsEditingOrigem(false);
    setIsOrigemDialogOpen(false);
  };

  const handleOpenOrigemDialog = (origem?: TipoOrigem) => {
    if (origem) {
        setIsEditingOrigem(true);
        setOrigemFormState({ id: origem.id, nome: origem.nome, sigla: origem.sigla || "" });
    } else {
        setIsEditingOrigem(false);
        setOrigemFormState({ nome: "", sigla: "" });
    }
    setIsOrigemDialogOpen(true);
  };

  const handleSaveOrigem = () => {
    if (!origemFormState.nome.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "O nome não pode ser vazio." });
        return;
    }
    
    const isDuplicate = tiposOrigem.some(
      (item) => item && item.nome && item.nome.toLowerCase() === origemFormState.nome.trim().toLowerCase() && item.id !== origemFormState.id
    );

    if (isDuplicate) {
       toast({ variant: "destructive", title: "Erro", description: "Este nome de origem já existe." });
       return;
    }

    const siglaValue = origemFormState.sigla.trim().toUpperCase();

    if (isEditingOrigem && origemFormState.id) {
        setTiposOrigem(prev => prev.map(item => item.id === origemFormState.id ? { ...item, nome: origemFormState.nome.trim(), sigla: siglaValue || undefined } : item));
        toast({ title: "Sucesso", description: "Origem atualizada." });
    } else {
        const newOrigem: TipoOrigem = {
            id: `to${Date.now()}`,
            nome: origemFormState.nome.trim(),
            sigla: siglaValue || undefined,
        };
        setTiposOrigem(prev => [...prev, newOrigem]);
        toast({ title: "Sucesso", description: "Nova origem adicionada." });
    }
    resetOrigemForm();
  };

  const handleDeleteOrigem = (idToDelete: string) => {
    setTiposOrigem(prev => prev.filter(item => item.id !== idToDelete));
    toast({ title: "Sucesso", description: `Origem removida.` });
  };
  
  const ListManagementCard = ({ title, description, mode, list, placeholder }: { title: string; description: string; mode: DialogMode; list: string[]; placeholder: string; }) => (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-primary">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog(mode, `Novo ${title}`)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
          {list.sort((a, b) => a.localeCompare(b)).map(item => (
            <div key={item} className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50">
              <span className="text-sm">{item}</span>
              <div>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(mode, `Editar ${title}`, item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Editar</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDelete(mode, item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Excluir</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
          {list.length === 0 && (
             <p className="text-sm text-center text-muted-foreground py-4">{placeholder}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Configurações do Sistema" description="Ajuste as configurações gerais e os parâmetros do ARKIV." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListManagementCard
            title="Espécies de Documento"
            description="Adicione ou edite as espécies de documento."
            mode="tipoDocumento"
            list={tiposDocumento}
            placeholder="Nenhuma espécie de documento cadastrada."
        />
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="font-headline text-primary">Tipos de Origem</CardTitle>
              <CardDescription>Adicione ou edite os tipos de origem e suas siglas.</CardDescription>
            </div>
            <Button size="sm" onClick={() => handleOpenOrigemDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
              {tiposOrigem.filter(item => item && item.nome).sort((a, b) => a.nome.localeCompare(b.nome)).map(item => {
                const displayValue = item.sigla ? `${item.nome} - ${item.sigla}` : item.nome;
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50">
                    <span className="text-sm">{displayValue}</span>
                    <div>
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenOrigemDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Editar</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteOrigem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Excluir</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
              {tiposOrigem.length === 0 && (
                 <p className="text-sm text-center text-muted-foreground py-4">Nenhum tipo de origem cadastrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <ListManagementCard
            title="Tipos de Parte"
            description="Adicione ou edite os tipos de parte envolvida."
            mode="tipoParte"
            list={tiposParte}
            placeholder="Nenhum tipo de parte cadastrado."
        />
        <ListManagementCard
            title="Gêneros Documentais"
            description="Adicione ou edite os gêneros documentais."
            mode="generoDocumental"
            list={generosDocumentais}
            placeholder="Nenhum gênero documental cadastrado."
        />
        <ListManagementCard
            title="Tipos de Mídia"
            description="Adicione ou edite os tipos de mídia física."
            mode="tipoMidia"
            list={tiposMidia}
            placeholder="Nenhum tipo de mídia cadastrado."
        />
        <ListManagementCard
            title="Tipos de Caixa"
            description="Adicione ou edite os tipos de caixa."
            mode="tipoCaixa"
            list={tiposCaixa}
            placeholder="Nenhum tipo de caixa cadastrado."
        />
      </div>

       <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) resetForm();
          else setIsDialogOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{dialogConfig?.title || 'Gerenciar Item'}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label htmlFor="item-form">Nome</Label>
                <Input 
                  id="item-form" 
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
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
        
        <Dialog open={isOrigemDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) resetOrigemForm();
          else setIsOrigemDialogOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditingOrigem ? "Editar Tipo de Origem" : "Novo Tipo de Origem"}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="origem-nome">Nome*</Label>
                    <Input 
                      id="origem-nome" 
                      value={origemFormState.nome}
                      onChange={(e) => setOrigemFormState(p => ({...p, nome: e.target.value}))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="origem-sigla">Sigla da Unidade (Opcional)</Label>
                    <Input 
                      id="origem-sigla" 
                      value={origemFormState.sigla}
                      onChange={(e) => setOrigemFormState(p => ({...p, sigla: e.target.value}))}
                      className="uppercase"
                    />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSaveOrigem}>Salvar</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
    </TooltipProvider>
  );
}
