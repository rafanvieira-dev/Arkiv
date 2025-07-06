
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Trash2, Upload, Download, FileSpreadsheet } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { initialTiposDocumento, initialGenerosDocumentais, initialTiposMidia, initialTiposParte, initialTiposOrigem, initialTiposCaixa, initialPartes, initialAprovacoesConta } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { TipoOrigem, ParteDetalhe, AprovacaoConta } from "@/types";
import { parseCsvRow, gerarIniciais } from "@/lib/utils";
import { useUserSession } from "@/hooks/use-user-session";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateInputPicker } from "@/components/date-input-picker";
import { parseISO } from "date-fns";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";


const TIPOS_DOCUMENTO_STORAGE_KEY = 'arquivocentral_tipos_documento';
const TIPOS_PARTE_STORAGE_KEY = 'arquivocentral_tipos_parte';
const GENEROS_DOCUMENTAIS_STORAGE_KEY = 'arquivocentral_generos_documentais';
const TIPOS_MIDIA_STORAGE_KEY = 'arquivocentral_tipos_midia';
const TIPOS_ORIGEM_STORAGE_KEY = 'arquivocentral_tipos_origem';
const TIPOS_CAIXA_STORAGE_KEY = 'arquivocentral_tipos_caixa';
const PARTES_STORAGE_KEY = 'arquivocentral_partes';
const APROVACOES_CONTA_STORAGE_KEY = 'arquivocentral_aprovacoes_conta';

type DialogMode = 'tipoDocumento' | 'tipoParte' | 'generoDocumental' | 'tipoMidia' | 'tipoCaixa';


export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const { permissions } = useUserSession();
  
  const [tiposDocumento, setTiposDocumento] = React.useState<string[]>([]);
  const [tiposParte, setTiposParte] = React.useState<string[]>([]);
  const [generosDocumentais, setGenerosDocumentais] = React.useState<string[]>([]);
  const [tiposMidia, setTiposMidia] = React.useState<string[]>([]);
  const [tiposOrigem, setTiposOrigem] = React.useState<TipoOrigem[]>([]);
  const [tiposCaixa, setTiposCaixa] = React.useState<string[]>([]);
  const [partes, setPartes] = React.useState<ParteDetalhe[]>([]);
  const [aprovacoesConta, setAprovacoesConta] = React.useState<AprovacaoConta[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{ mode: DialogMode; title: string } | null>(null);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [formValue, setFormValue] = React.useState("");
  
  const [isOrigemDialogOpen, setIsOrigemDialogOpen] = React.useState(false);
  const [origemFormState, setOrigemFormState] = React.useState<{ id?: string; nome: string; sigla: string }>({ nome: "", sigla: "" });
  const [isEditingOrigem, setIsEditingOrigem] = React.useState(false);
  
  const [isParteDialogOpen, setIsParteDialogOpen] = React.useState(false);
  const [parteFormState, setParteFormState] = React.useState<Partial<ParteDetalhe>>({ nome: "", cpfCnpj: "" });
  const [isEditingParte, setIsEditingParte] = React.useState(false);
  
  const [isAprovacaoDialogOpen, setIsAprovacaoDialogOpen] = React.useState(false);
  const [aprovacaoFormState, setAprovacaoFormState] = React.useState<Partial<AprovacaoConta>>({ anoExercicio: new Date().getFullYear() });
  const [isEditingAprovacao, setIsEditingAprovacao] = React.useState(false);


  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const activeImportContext = React.useRef<{
    setter: React.Dispatch<React.SetStateAction<any>>;
    type: 'simple' | 'origem' | 'parte' | 'aprovacao';
    listName: string;
  } | null>(null);


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
      
      const storedPartes = window.localStorage.getItem(PARTES_STORAGE_KEY);
      setPartes(storedPartes ? JSON.parse(storedPartes) : initialPartes);

      const storedAprovacoes = window.localStorage.getItem(APROVACOES_CONTA_STORAGE_KEY);
      setAprovacoesConta(storedAprovacoes ? JSON.parse(storedAprovacoes) : initialAprovacoesConta);

    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setTiposDocumento(initialTiposDocumento);
      setTiposParte(initialTiposParte);
      setGenerosDocumentais(initialGenerosDocumentais);
      setTiposMidia(initialTiposMidia);
      setTiposOrigem(initialTiposOrigem);
      setTiposCaixa(initialTiposCaixa);
      setPartes(initialPartes);
      setAprovacoesConta(initialAprovacoesConta);
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
        window.localStorage.setItem(PARTES_STORAGE_KEY, JSON.stringify(partes));
        window.localStorage.setItem(APROVACOES_CONTA_STORAGE_KEY, JSON.stringify(aprovacoesConta));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [tiposDocumento, tiposParte, generosDocumentais, tiposMidia, tiposOrigem, tiposCaixa, partes, aprovacoesConta, isDataLoaded]);

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
  
  const resetParteForm = () => {
    setParteFormState({ nome: "", cpfCnpj: "" });
    setIsEditingParte(false);
    setIsParteDialogOpen(false);
  };
  
  const resetAprovacaoForm = () => {
    setAprovacaoFormState({ anoExercicio: new Date().getFullYear() });
    setIsEditingAprovacao(false);
    setIsAprovacaoDialogOpen(false);
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
  
  const handleOpenParteDialog = (parte?: ParteDetalhe) => {
    if (parte) {
      setIsEditingParte(true);
      setParteFormState({ id: parte.id, nome: parte.nome, cpfCnpj: parte.cpfCnpj || "" });
    } else {
      setIsEditingParte(false);
      setParteFormState({ nome: "", cpfCnpj: "" });
    }
    setIsParteDialogOpen(true);
  };

  const handleOpenAprovacaoDialog = (aprovacao?: AprovacaoConta) => {
    if (aprovacao) {
      setIsEditingAprovacao(true);
      setAprovacaoFormState(aprovacao);
    } else {
      setIsEditingAprovacao(false);
      setAprovacaoFormState({ anoExercicio: new Date().getFullYear() });
    }
    setIsAprovacaoDialogOpen(true);
  };

  const handleSaveOrigem = () => {
    if (!origemFormState.nome.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "O nome não pode ser vazio." });
        return;
    }
    
    const isDuplicate = tiposOrigem.some(
      (item) => item?.nome?.toLowerCase() === origemFormState.nome.trim().toLowerCase() && item.id !== origemFormState.id
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
  
  const handleSaveParte = () => {
    if (!parteFormState.nome?.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da parte não pode ser vazio." });
      return;
    }

    const trimmedNome = parteFormState.nome.trim();
    const trimmedCpfCnpj = parteFormState.cpfCnpj?.trim() || "";
    const iniciais = gerarIniciais(trimmedNome);
    
    const isDuplicate = partes.some(p => 
      p.nome.toLowerCase() === trimmedNome.toLowerCase() &&
      (p.cpfCnpj || "").toLowerCase() === trimmedCpfCnpj.toLowerCase() &&
      p.id !== parteFormState.id
    );

    if (isDuplicate) {
      toast({ variant: "destructive", title: "Erro", description: "Uma parte com este nome e CPF/CNPJ já existe." });
      return;
    }
    
    if (isEditingParte) {
      setPartes(prev => prev.map(p => p.id === parteFormState.id ? { ...p, nome: trimmedNome, cpfCnpj: trimmedCpfCnpj, iniciais } : p));
      toast({ title: "Sucesso", description: "Parte atualizada." });
    } else {
      const newParte: ParteDetalhe = {
        id: `parte${Date.now()}`,
        nome: trimmedNome,
        cpfCnpj: trimmedCpfCnpj,
        iniciais,
      };
      setPartes(prev => [...prev, newParte]);
      toast({ title: "Sucesso", description: "Nova parte adicionada." });
    }
    resetParteForm();
  };
  
  const handleSaveAprovacao = () => {
    if (!aprovacaoFormState.anoExercicio) {
      toast({ variant: "destructive", title: "Erro", description: "O ano de exercício é obrigatório." });
      return;
    }
    
    const isDuplicate = aprovacoesConta.some(
      (a) => a.anoExercicio === aprovacaoFormState.anoExercicio && a.id !== aprovacaoFormState.id
    );

    if (isDuplicate) {
      toast({ variant: "destructive", title: "Erro", description: `Já existe um registro para o ano de exercício ${aprovacaoFormState.anoExercicio}.` });
      return;
    }

    if (isEditingAprovacao) {
      setAprovacoesConta(prev => prev.map(a => a.id === aprovacaoFormState.id ? { ...a, ...aprovacaoFormState } as AprovacaoConta : a));
      toast({ title: "Sucesso", description: "Aprovação de contas atualizada." });
    } else {
      const newAprovacao: AprovacaoConta = {
        id: `ac${Date.now()}`,
        anoExercicio: aprovacaoFormState.anoExercicio!,
        dataAprovacaoTcu: aprovacaoFormState.dataAprovacaoTcu,
        dataPublicacaoDou: aprovacaoFormState.dataPublicacaoDou,
        secaoDou: aprovacaoFormState.secaoDou,
        paginaDou: aprovacaoFormState.paginaDou,
      };
      setAprovacoesConta(prev => [...prev, newAprovacao]);
      toast({ title: "Sucesso", description: "Nova aprovação de contas adicionada." });
    }
    resetAprovacaoForm();
  };

  const handleDeleteOrigem = (idToDelete: string) => {
    setTiposOrigem(prev => prev.filter(item => item.id !== idToDelete));
    toast({ title: "Sucesso", description: `Origem removida.` });
  };
  
  const handleDeleteParte = (idToDelete: string) => {
    setPartes(prev => prev.filter(item => item.id !== idToDelete));
    toast({ title: "Sucesso", description: "Parte removida." });
  };
  
  const handleDeleteAprovacao = (idToDelete: string) => {
    setAprovacoesConta(prev => prev.filter(item => item.id !== idToDelete));
    toast({ title: "Sucesso", description: "Registro de aprovação de contas removido." });
  };
  
  const handleImportClick = (setter: React.Dispatch<React.SetStateAction<any>>, type: 'simple' | 'origem' | 'parte' | 'aprovacao', listName: string) => {
    activeImportContext.current = { setter, type, listName };
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeImportContext.current) return;

    const { setter, type, listName } = activeImportContext.current;
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headerRow = rows.shift()?.trim();
        if (!headerRow) throw new Error("Arquivo CSV vazio ou sem cabeçalho.");
        const headers = parseCsvRow(headerRow);

        if (type === 'simple') {
          if (headers[0] !== 'nome') throw new Error("Cabeçalho inválido. A primeira coluna deve ser 'nome'.");
          const newItems = rows.map(row => parseCsvRow(row)[0] || '');
          (setter as React.Dispatch<React.SetStateAction<string[]>>)(prev => {
            const existing = new Set(prev.map(i => i.toLowerCase()));
            const uniqueNewItems = newItems.filter(item => item && !existing.has(item.toLowerCase()));
            return [...prev, ...uniqueNewItems].sort((a,b) => a.localeCompare(b));
          });
          toast({ title: "Importação Concluída", description: `${newItems.length} itens foram importados para ${listName}.` });
        } else if (type === 'origem') {
          const requiredHeaders = ['nome'];
          if (!requiredHeaders.every(h => headers.includes(h))) throw new Error("Cabeçalho inválido. A coluna 'nome' é necessária.");
          const newItems: TipoOrigem[] = [];
          rows.forEach((row, index) => {
            const values = parseCsvRow(row);
            const newItemData: { [key: string]: string } = {};
            headers.forEach((h, i) => newItemData[h] = values[i] || "");
            newItems.push({ id: `to_imp_${Date.now()}_${index}`, nome: newItemData.nome, sigla: newItemData.sigla || undefined });
          });
          (setter as React.Dispatch<React.SetStateAction<TipoOrigem[]>>)(prev => {
            const existingNames = new Set(prev.map(i => i.nome.toLowerCase()));
            const uniqueNewItems = newItems.filter(item => item.nome && !existingNames.has(item.nome.toLowerCase()));
            return [...prev, ...uniqueNewItems].sort((a, b) => a.nome.localeCompare(b.nome));
          });
          toast({ title: "Importação Concluída", description: `${newItems.length} itens foram importados para ${listName}.` });
        } else if (type === 'parte') {
          const requiredHeaders = ['nome'];
          if (!requiredHeaders.every(h => headers.includes(h))) throw new Error("Cabeçalho inválido. A coluna 'nome' é necessária.");
          const newItems: ParteDetalhe[] = [];
          rows.forEach((row, index) => {
            const values = parseCsvRow(row);
            const newItemData: { [key: string]: string } = {};
            headers.forEach((h, i) => newItemData[h] = values[i] || "");
            newItems.push({ id: `parte_imp_${Date.now()}_${index}`, nome: newItemData.nome, cpfCnpj: newItemData.cpfCnpj || "", iniciais: gerarIniciais(newItemData.nome) });
          });
          (setter as React.Dispatch<React.SetStateAction<ParteDetalhe[]>>)(prev => {
            const existingMap = new Map(prev.map(p => [`${p.nome.toLowerCase()}|${(p.cpfCnpj || "").toLowerCase()}`, true]));
            const uniqueNewItems = newItems.filter(item => item.nome && !existingMap.has(`${item.nome.toLowerCase()}|${(item.cpfCnpj || "").toLowerCase()}`));
            return [...prev, ...uniqueNewItems].sort((a, b) => a.nome.localeCompare(b.nome));
          });
          toast({ title: "Importação Concluída", description: `${newItems.length} itens foram importados para ${listName}.` });
        } else if (type === 'aprovacao') {
            const requiredHeaders = ['anoExercicio'];
            if (!requiredHeaders.every(h => headers.includes(h))) throw new Error("Cabeçalho inválido. A coluna 'anoExercicio' é necessária.");
            const newItems: AprovacaoConta[] = [];
             rows.forEach((row, index) => {
                const values = parseCsvRow(row);
                const newItemData: { [key: string]: any } = {};
                headers.forEach((h, i) => newItemData[h] = values[i] || "");
                newItems.push({ 
                    id: `ac_imp_${Date.now()}_${index}`, 
                    anoExercicio: parseInt(newItemData.anoExercicio, 10), 
                    dataAprovacaoTcu: newItemData.dataAprovacaoTcu || undefined, 
                    dataPublicacaoDou: newItemData.dataPublicacaoDou || undefined,
                    secaoDou: newItemData.secaoDou || undefined,
                    paginaDou: newItemData.paginaDou || undefined
                });
            });
            (setter as React.Dispatch<React.SetStateAction<AprovacaoConta[]>>)(prev => {
                const existingYears = new Set(prev.map(i => i.anoExercicio));
                const uniqueNewItems = newItems.filter(item => item.anoExercicio && !isNaN(item.anoExercicio) && !existingYears.has(item.anoExercicio));
                return [...prev, ...uniqueNewItems].sort((a,b) => a.anoExercicio - b.anoExercicio);
            });
            toast({ title: "Importação Concluída", description: `${newItems.length} itens foram importados para ${listName}.` });
        }

      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro de Importação", description: `Falha ao processar o arquivo: ${error.message}` });
      } finally {
        if (event.target) event.target.value = '';
        activeImportContext.current = null;
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleExport = (list: any[], fileName: string, headers: string[]) => {
    if (!list || list.length === 0) {
      toast({ variant: "destructive", title: "Nenhum dado para exportar" });
      return;
    }
    
    const csvRows = [headers.join(',')];
    if (typeof list[0] === 'string') {
      (list as string[]).forEach(item => csvRows.push(`"${item.replace(/"/g, '""')}"`));
    } else {
      list.forEach(item => {
        const row = headers.map(header => `"${String(item[header as keyof typeof item] ?? '').replace(/"/g, '""')}"`);
        csvRows.push(row.join(','));
      });
    }
    
    const blob = new Blob([`\uFEFF${csvRows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = (fileName: string, headers: string[]) => {
    const csvContent = headers.join(',');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const ListManagementCard = ({ 
    title, description, mode, list, placeholder, listName,
  }: { 
    title: string; description: string; mode: DialogMode; list: string[]; placeholder: string; listName: string;
  }) => {
      const setter = getListAndSetter(mode)[1];
      return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-primary">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <div className="flex items-center flex-wrap gap-2 justify-start sm:justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleImportClick(setter, 'simple', listName)}>
                      <Upload className="mr-2 h-4 w-4" /> Importar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport(list, `${listName.toLowerCase().replace(/ /g, '_')}_export.csv`, ['nome'])}>
                      <Download className="mr-2 h-4 w-4" /> Exportar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate(`modelo_${listName.toLowerCase().replace(/ /g, '_')}.csv`, ['nome'])}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Modelo
                  </Button>
                  <Button size="sm" onClick={() => handleOpenDialog(mode, `Novo ${title}`)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo
                  </Button>
              </div>
          </div>
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
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" disabled={!permissions.usuarios}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{permissions.usuarios ? "Excluir" : "Permissão necessária"}</p></TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o item "{item}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(mode, item)}>Sim, excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
  };


  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
      <PageHeader title="Configurações do Sistema" description="Ajuste as configurações gerais e os parâmetros do ARKIV." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListManagementCard
            title="Espécies de Documento"
            description="Adicione ou edite as espécies de documento."
            mode="tipoDocumento"
            list={tiposDocumento}
            placeholder="Nenhuma espécie de documento cadastrada."
            listName="Espécies de Documento"
        />
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-primary">Tipos de Origem</CardTitle>
                <CardDescription>Adicione ou edite os tipos de origem e suas siglas.</CardDescription>
              </div>
              <div className="flex items-center flex-wrap gap-2 justify-start sm:justify-end">
                <Button size="sm" variant="outline" onClick={() => handleImportClick(setTiposOrigem, 'origem', 'Tipos de Origem')}>
                    <Upload className="mr-2 h-4 w-4" /> Importar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport(tiposOrigem, 'tipos_origem_export.csv', ['nome', 'sigla'])}>
                    <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate('modelo_tipos_origem.csv', ['nome', 'sigla'])}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Modelo
                </Button>
                <Button size="sm" onClick={() => handleOpenOrigemDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo
                </Button>
              </div>
            </div>
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
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" disabled={!permissions.usuarios}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent><p>{permissions.usuarios ? "Excluir" : "Permissão necessária"}</p></TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o tipo de origem "{item.nome}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOrigem(item.id)}>Sim, excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
            listName="Tipos de Parte"
        />
        <ListManagementCard
            title="Gêneros Documentais"
            description="Adicione ou edite os gêneros documentais."
            mode="generoDocumental"
            list={generosDocumentais}
            placeholder="Nenhum gênero documental cadastrado."
            listName="Gêneros Documentais"
        />
        <ListManagementCard
            title="Tipos de Mídia"
            description="Adicione ou edite os tipos de mídia física."
            mode="tipoMidia"
            list={tiposMidia}
            placeholder="Nenhum tipo de mídia cadastrado."
            listName="Tipos de Mídia"
        />
        <ListManagementCard
            title="Tipos de Caixa"
            description="Adicione ou edite os tipos de caixa."
            mode="tipoCaixa"
            list={tiposCaixa}
            placeholder="Nenhum tipo de caixa cadastrado."
            listName="Tipos de Caixa"
        />
         <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-primary">Nomes de Partes</CardTitle>
                    <CardDescription>Gerencie o cadastro central de partes envolvidas nos documentos.</CardDescription>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 justify-start sm:justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleImportClick(setPartes, 'parte', 'Nomes de Partes')}>
                          <Upload className="mr-2 h-4 w-4" /> Importar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(partes, 'partes_export.csv', ['id', 'nome', 'cpfCnpj', 'iniciais'])}>
                          <Download className="mr-2 h-4 w-4" /> Exportar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate('modelo_partes.csv', ['nome', 'cpfCnpj'])}>
                          <FileSpreadsheet className="mr-2 h-4 w-4" /> Modelo
                      </Button>
                      <Button size="sm" onClick={() => handleOpenParteDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Nova Parte
                      </Button>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Iniciais</TableHead>
                                <TableHead>CPF/CNPJ</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partes.sort((a,b) => a.nome.localeCompare(b.nome)).map(parte => (
                                <TableRow key={parte.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{parte.id}</TableCell>
                                    <TableCell>{parte.nome}</TableCell>
                                    <TableCell>{parte.iniciais || 'N/A'}</TableCell>
                                    <TableCell>{parte.cpfCnpj || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenParteDialog(parte)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Editar</p></TooltipContent>
                                        </Tooltip>
                                        <AlertDialog>
                                            <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" disabled={!permissions.usuarios}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                </AlertDialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{permissions.usuarios ? "Excluir" : "Permissão necessária"}</p></TooltipContent>
                                            </Tooltip>
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a parte "{parte.nome}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteParte(parte.id)}>Sim, excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                {partes.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhuma parte cadastrada.</p>
                )}
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-primary">Aprovações de Contas (TCU)</CardTitle>
                    <CardDescription>Gerencie os registros de aprovação de contas para usar nos relatórios.</CardDescription>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 justify-start sm:justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleImportClick(setAprovacoesConta, 'aprovacao', 'Aprovações de Conta')}>
                          <Upload className="mr-2 h-4 w-4" /> Importar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(aprovacoesConta, 'aprovacoes_conta_export.csv', ['anoExercicio', 'dataAprovacaoTcu', 'dataPublicacaoDou', 'secaoDou', 'paginaDou'])}>
                          <Download className="mr-2 h-4 w-4" /> Exportar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate('modelo_aprovacoes_conta.csv', ['anoExercicio', 'dataAprovacaoTcu', 'dataPublicacaoDou', 'secaoDou', 'paginaDou'])}>
                          <FileSpreadsheet className="mr-2 h-4 w-4" /> Modelo
                      </Button>
                      <Button size="sm" onClick={() => handleOpenAprovacaoDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Novo Registro
                      </Button>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ano Exercício</TableHead>
                                <TableHead>Data Aprov. TCU</TableHead>
                                <TableHead>Data Pub. DOU</TableHead>
                                <TableHead>Seção/Página</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {aprovacoesConta.sort((a,b) => b.anoExercicio - a.anoExercicio).map(aprovacao => (
                                <TableRow key={aprovacao.id}>
                                    <TableCell className="font-medium">{aprovacao.anoExercicio}</TableCell>
                                    <TableCell><ClientSideDateFormatter isoDateString={aprovacao.dataAprovacaoTcu} placeholderText="-" /></TableCell>
                                    <TableCell><ClientSideDateFormatter isoDateString={aprovacao.dataPublicacaoDou} placeholderText="-" /></TableCell>
                                    <TableCell>{aprovacao.secaoDou && aprovacao.paginaDou ? `Seção ${aprovacao.secaoDou}, pág. ${aprovacao.paginaDou}` : '-'}</TableCell>
                                    <TableCell className="text-right">
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenAprovacaoDialog(aprovacao)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Editar</p></TooltipContent>
                                        </Tooltip>
                                        <AlertDialog>
                                            <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" disabled={!permissions.usuarios}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                </AlertDialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{permissions.usuarios ? "Excluir" : "Permissão necessária"}</p></TooltipContent>
                                            </Tooltip>
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                Esta ação excluirá permanentemente o registro de aprovação de contas do ano {aprovacao.anoExercicio}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteAprovacao(aprovacao.id)}>Sim, excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                {aprovacoesConta.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhum registro de aprovação de contas cadastrado.</p>
                )}
            </CardContent>
        </Card>
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
        
        <Dialog open={isParteDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) resetParteForm();
          else setIsParteDialogOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditingParte ? "Editar Parte" : "Nova Parte"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parte-nome">Nome*</Label>
                <Input
                  id="parte-nome"
                  value={parteFormState.nome || ""}
                  onChange={(e) => setParteFormState(p => ({...p, nome: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parte-cpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="parte-cpfCnpj"
                  value={parteFormState.cpfCnpj || ""}
                  onChange={(e) => setParteFormState(p => ({...p, cpfCnpj: e.target.value}))}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveParte}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAprovacaoDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) resetAprovacaoForm();
          else setIsAprovacaoDialogOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditingAprovacao ? "Editar Aprovação de Contas" : "Nova Aprovação de Contas"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aprov-ano">Ano de Exercício*</Label>
                <Input
                  id="aprov-ano"
                  type="number"
                  value={aprovacaoFormState.anoExercicio || ""}
                  onChange={(e) => setAprovacaoFormState(p => ({...p, anoExercicio: parseInt(e.target.value, 10) || undefined }))}
                  placeholder="AAAA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aprov-data-tcu">Data de Aprovação (TCU)</Label>
                <DateInputPicker value={aprovacaoFormState.dataAprovacaoTcu ? parseISO(aprovacaoFormState.dataAprovacaoTcu) : undefined} onChange={(date) => setAprovacaoFormState(p => ({ ...p, dataAprovacaoTcu: date?.toISOString() }))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="aprov-data-dou">Data de Publicação (DOU)</Label>
                <DateInputPicker value={aprovacaoFormState.dataPublicacaoDou ? parseISO(aprovacaoFormState.dataPublicacaoDou) : undefined} onChange={(date) => setAprovacaoFormState(p => ({ ...p, dataPublicacaoDou: date?.toISOString() }))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="aprov-secao">Seção (DOU)</Label>
                <Input id="aprov-secao" value={aprovacaoFormState.secaoDou || ""} onChange={(e) => setAprovacaoFormState(p => ({...p, secaoDou: e.target.value}))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="aprov-pagina">Página (DOU)</Label>
                <Input id="aprov-pagina" value={aprovacaoFormState.paginaDou || ""} onChange={(e) => setAprovacaoFormState(p => ({...p, paginaDou: e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveAprovacao}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
    </TooltipProvider>
  );
}
