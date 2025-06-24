
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
import { initialTiposDocumento, initialGenerosDocumentais, initialTiposMidia, initialTiposParte } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


const TIPOS_DOCUMENTO_STORAGE_KEY = 'arquivocentral_tipos_documento';
const TIPOS_PARTE_STORAGE_KEY = 'arquivocentral_tipos_parte';
const GENEROS_DOCUMENTAIS_STORAGE_KEY = 'arquivocentral_generos_documentais';
const TIPOS_MIDIA_STORAGE_KEY = 'arquivocentral_tipos_midia';

type DialogMode = 'tipoDocumento' | 'tipoParte' | 'generoDocumental' | 'tipoMidia';


export default function ConfiguracoesPage() {
  const { toast } = useToast();
  
  const [tiposDocumento, setTiposDocumento] = React.useState<string[]>([]);
  const [tiposParte, setTiposParte] = React.useState<string[]>([]);
  const [generosDocumentais, setGenerosDocumentais] = React.useState<string[]>([]);
  const [tiposMidia, setTiposMidia] = React.useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{ mode: DialogMode; title: string } | null>(null);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [formValue, setFormValue] = React.useState("");

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

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setTiposDocumento(initialTiposDocumento);
      setTiposParte(initialTiposParte);
      setGenerosDocumentais(initialGenerosDocumentais);
      setTiposMidia(initialTiposMidia);
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
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [tiposDocumento, tiposParte, generosDocumentais, tiposMidia, isDataLoaded]);

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
            title="Tipos de Documento"
            description="Adicione ou edite os tipos de documento."
            mode="tipoDocumento"
            list={tiposDocumento}
            placeholder="Nenhum tipo de documento cadastrado."
        />
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
    </div>
    </TooltipProvider>
  );
}
