
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Usuario } from "@/types";
import { PlusCircle, Edit, Trash2, ShieldCheck, ShieldX, ShieldQuestion, Upload, Download, FileSpreadsheet } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { initialUsers, allPermissions } from "@/lib/mock-data";


const USUARIOS_STORAGE_KEY = 'arquivocentral_usuarios';

type UserFormState = Partial<Omit<Usuario, 'senhaHash'>> & {
  senha?: string;
  confirmarSenha?: string;
};

const initialFormState: UserFormState = {
  nomeCompleto: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  sigla: "",
  setor: "",
  statusAprovacao: "Pendente",
  permissoes: Object.fromEntries(allPermissions.map(p => [p.id, false])),
};


export default function UsuariosPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [users, setUsers] = React.useState<Usuario[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<UserFormState>(initialFormState);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(USUARIOS_STORAGE_KEY);
      setUsers(stored ? JSON.parse(stored) : initialUsers);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      setUsers(initialUsers);
    }
    setIsDataLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isDataLoaded) {
      try {
        window.localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(users));
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }
  }, [users, isDataLoaded]);

  const resetForm = () => {
    setFormState(initialFormState);
    setIsEditing(false);
    setEditingUserId(null);
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setIsEditing(true);
      setEditingUserId(user.id);
      // We don't load the password fields for editing
      setFormState({
        ...user,
        senha: "",
        confirmarSenha: "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: Usuario['statusAprovacao']) => {
    setFormState(prev => ({ ...prev, statusAprovacao: value }));
  };

  const handlePermissionChange = (permissionId: string) => (checked: boolean | 'indeterminate') => {
    setFormState(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissionId]: !!checked,
      },
    }));
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "Sucesso", description: "Usuário excluído com sucesso." });
  };

  const handleSaveChanges = () => {
    if (!formState.nomeCompleto || !formState.email) {
      toast({ variant: "destructive", title: "Erro", description: "Nome completo e e-mail são obrigatórios." });
      return;
    }
    if (!isEditing && !formState.senha) {
      toast({ variant: "destructive", title: "Erro", description: "A senha é obrigatória para novos usuários." });
      return;
    }
    if (formState.senha !== formState.confirmarSenha) {
      toast({ variant: "destructive", title: "Erro", description: "As senhas não coincidem." });
      return;
    }

    const userData: Omit<Usuario, 'id' | 'senhaHash'> & { senhaHash?: string } = {
        nomeCompleto: formState.nomeCompleto!,
        email: formState.email!,
        sigla: formState.sigla,
        setor: formState.setor,
        statusAprovacao: formState.statusAprovacao!,
        permissoes: formState.permissoes!,
    };

    if (formState.senha) {
        userData.senhaHash = `hashed_${formState.senha}`;
    }

    if (isEditing && editingUserId) {
      const existingUser = users.find(u => u.id === editingUserId)!;
      const updatedUser: Usuario = {
          ...existingUser,
          ...userData,
          senhaHash: userData.senhaHash || existingUser.senhaHash,
      };
      setUsers(prev => prev.map(u => (u.id === editingUserId ? updatedUser : u)));

      try {
        const currentUserJson = localStorage.getItem('currentUser');
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson);
          if (currentUser.id === editingUserId) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            toast({ title: "Sucesso", description: "Usuário atualizado. A página será recarregada para aplicar as permissões." });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
          }
        }
      } catch (error) {
        console.error("Failed to update currentUser in localStorage", error);
        toast({ title: "Sucesso", description: "Usuário atualizado, mas ocorreu um erro ao atualizar a sessão." });
      }
    } else {
      const newUser: Usuario = {
        id: `USR${Date.now()}`,
        ...userData,
        senhaHash: userData.senhaHash!,
      };
      setUsers(prev => [...prev, newUser]);
      toast({ title: "Sucesso", description: "Usuário criado com sucesso." });
    }

    setIsDialogOpen(false);
  };
  
  const handleExportCSV = () => {
    const permissionKeys = allPermissions.map(p => p.id);
    const headers = ['id', 'nomeCompleto', 'email', 'sigla', 'setor', 'statusAprovacao', ...permissionKeys];
    const csvRows = [headers.join(',')];

    users.forEach(user => {
        const rowData: { [key: string]: any } = {
          id: user.id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          sigla: user.sigla || '',
          setor: user.setor || '',
          statusAprovacao: user.statusAprovacao,
          ...user.permissoes,
        };
        const row = headers.map(header => `"${String(rowData[header] ?? '').replace(/"/g, '""')}"`);
        csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'usuarios_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Sucesso", description: "Exportação de usuários concluída." });
  };

  const handleDownloadTemplate = () => {
    const permissionKeys = allPermissions.map(p => p.id);
    const headers = ['nomeCompleto', 'email', 'senha', 'sigla', 'setor', 'statusAprovacao', ...permissionKeys];
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_usuarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        try {
            const rows = text.split('\n').filter(row => row.trim() !== '');
            const headerRow = rows.shift();
            if (!headerRow) throw new Error("Arquivo CSV vazio ou sem cabeçalho.");
            
            const headers = headerRow.split(',').map(h => h.trim().replace(/"/g, ''));
            const permissionKeys = allPermissions.map(p => p.id);
            const requiredHeaders = ['nomeCompleto', 'email', 'senha'];
            
            const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
            if (!hasRequiredHeaders) {
                 toast({ variant: "destructive", title: "Erro de Importação", description: `O cabeçalho do arquivo CSV é inválido. Colunas obrigatórias faltando: ${requiredHeaders.filter(h => !headers.includes(h)).join(', ')}.` });
                 return;
            }

            const newItemsFromCsv: Usuario[] = [];
            rows.forEach((row, index) => {
                if(!row.trim()) return;
                const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                const newItemData: { [key: string]: any } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });

                if (!newItemData.nomeCompleto || !newItemData.email || !newItemData.senha) {
                    throw new Error(`Linha ${index + 2}: Campos obrigatórios (nomeCompleto, email, senha) faltando.`);
                }

                const permissoes: Usuario['permissoes'] = {} as any;
                permissionKeys.forEach(key => {
                    permissoes[key as keyof Usuario['permissoes']] = newItemData[key]?.toLowerCase() === 'true';
                });

                const newItem: Usuario = {
                    id: `USR_IMP_${Date.now()}_${index}`,
                    nomeCompleto: newItemData.nomeCompleto,
                    email: newItemData.email,
                    senhaHash: `hashed_${newItemData.senha}`,
                    sigla: newItemData.sigla,
                    setor: newItemData.setor,
                    statusAprovacao: newItemData.statusAprovacao || 'Pendente',
                    permissoes,
                };
                newItemsFromCsv.push(newItem);
            });

            setUsers(prev => [...prev, ...newItemsFromCsv]);
            toast({ title: "Importação Concluída", description: `${newItemsFromCsv.length} usuários foram importados com sucesso.` });

        } catch (error: any) {
             toast({ variant: "destructive", title: "Erro de Importação", description: `Falha ao processar o arquivo: ${error.message}` });
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    reader.readAsText(file);
  };


  const getStatusIcon = (status: Usuario['statusAprovacao']) => {
    switch (status) {
      case 'Aprovado':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'Reprovado':
        return <ShieldX className="h-5 w-5 text-red-500" />;
      case 'Pendente':
      default:
        return <ShieldQuestion className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento de Usuários" description="Adicione, edite e gerencie os usuários e suas permissões no sistema.">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Baixar Modelo
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={isOpen => {
            setIsDialogOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary">{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  Preencha as informações do usuário e defina suas permissões. Campos com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-6">
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeCompleto">Nome Completo*</Label>
                      <Input id="nomeCompleto" value={formState.nomeCompleto || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Login (E-mail)*</Label>
                      <Input id="email" type="email" value={formState.email || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha{isEditing ? " (Deixe em branco para não alterar)" : "*"}</Label>
                      <Input id="senha" type="password" value={formState.senha || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha{isEditing ? "" : "*"}</Label>
                      <Input id="confirmarSenha" type="password" value={formState.confirmarSenha || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sigla">Sigla</Label>
                      <Input id="sigla" value={formState.sigla || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setor">Setor</Label>
                      <Input id="setor" value={formState.setor || ""} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statusAprovacao">Status da Aprovação*</Label>
                    <Select onValueChange={handleSelectChange} value={formState.statusAprovacao}>
                        <SelectTrigger id="statusAprovacao">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aprovado">Aprovado</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Reprovado">Reprovado</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Permissões do Usuário</Label>
                    <Card>
                      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {allPermissions.map((permission) => (
                          <Tooltip key={permission.id}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${permission.id}`}
                                  checked={formState.permissoes?.[permission.id as keyof typeof formState.permissoes] || false}
                                  onCheckedChange={handlePermissionChange(permission.id)}
                                />
                                <Label htmlFor={`perm-${permission.id}`} className="font-normal cursor-pointer">{permission.label}</Label>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start">
                              <p>{permission.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button type="button" onClick={handleSaveChanges}>Salvar Usuário</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nomeCompleto}</TableCell>
                    <TableCell>
                      <Badge variant={user.statusAprovacao === 'Aprovado' ? 'secondary' : user.statusAprovacao === 'Reprovado' ? 'destructive' : 'default'} className="flex items-center gap-2 w-fit">
                        {getStatusIcon(user.statusAprovacao)}
                        {user.statusAprovacao}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.setor || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
           {users.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhum usuário cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
