

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { Usuario } from "@/types";
import { PlusCircle, Edit, Trash2, ShieldCheck, ShieldX, ShieldQuestion, Upload, Download, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, ColumnsIcon, CheckSquare, Square, FilterIcon, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { initialUsers, allPermissions, allTruePermissions, standardUserPermissions } from "@/lib/mock-data";
import { parseCsvRow } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUserSession } from "@/hooks/use-user-session";


const USUARIOS_STORAGE_KEY = 'arquivocentral_usuarios';

type UserFormState = Partial<Omit<Usuario, 'senhaHash' | 'permissoes'>> & {
  senha?: string;
  confirmarSenha?: string;
  permissoes: Usuario['permissoes'];
};

const initialFormState: UserFormState = {
  nomeCompleto: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  sigla: "",
  setor: "",
  statusAprovacao: "Pendente",
  tipoUsuario: "Padrão",
  permissoes: standardUserPermissions,
};

const initialFiltersState = {
  nomeCompleto: "",
  email: "",
  sigla: "",
  setor: "",
  statusAprovacao: "",
};
const ALL_VALUES_SENTINEL = "ALL_VALUES";

type ColumnConfigUsuarios = {
  id: keyof Usuario | string;
  header: string;
  accessorKey: keyof Usuario | string;
  defaultVisible: boolean;
  enableSorting: boolean;
  cellFormatter?: (value: any, item: Usuario) => React.ReactNode;
};

type SortConfig = { id: string; direction: 'asc' | 'desc' };

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

const ALL_COLUMNS_CONFIG: ColumnConfigUsuarios[] = [
  { id: 'nomeCompleto', header: 'Nome Completo', accessorKey: 'nomeCompleto', defaultVisible: true, enableSorting: true },
  { 
    id: 'statusAprovacao', 
    header: 'Status', 
    accessorKey: 'statusAprovacao', 
    defaultVisible: true, 
    enableSorting: true, 
    cellFormatter: (value: Usuario['statusAprovacao']) => (
      <Badge variant={value === 'Aprovado' ? 'secondary' : value === 'Reprovado' ? 'destructive' : 'default'} className="flex items-center gap-2 w-fit">
        {getStatusIcon(value)}
        {value}
      </Badge>
    )
  },
  { id: 'email', header: 'E-mail', accessorKey: 'email', defaultVisible: true, enableSorting: true },
  { id: 'setor', header: 'Setor', accessorKey: 'setor', defaultVisible: true, enableSorting: true, cellFormatter: (value) => value || "N/A" },
  { id: 'sigla', header: 'Sigla', accessorKey: 'sigla', defaultVisible: false, enableSorting: true, cellFormatter: (value) => value || "N/A" },
];


export default function UsuariosPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { permissions } = useUserSession();
  const [users, setUsers] = React.useState<Usuario[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [displayedUsers, setDisplayedUsers] = React.useState<Usuario[]>([]);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<UserFormState>(initialFormState);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortConfig[]>([]);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  
  const [filters, setFilters] = React.useState(initialFiltersState);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);


  React.useEffect(() => {
    setColumnVisibility(
      ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: col.defaultVisible }), {})
    );
  }, []);

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

  const getSortableValue = (item: Usuario, columnId: string): any => {
    const column = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!column) return null;
    return item[column.accessorKey as keyof Usuario];
  };

  React.useEffect(() => {
    let itemsToDisplay = users.filter(user => {
        if (filters.nomeCompleto && !user.nomeCompleto.toLowerCase().includes(filters.nomeCompleto.toLowerCase())) return false;
        if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
        if (filters.sigla && !user.sigla?.toLowerCase().includes(filters.sigla.toLowerCase())) return false;
        if (filters.setor && !user.setor?.toLowerCase().includes(filters.setor.toLowerCase())) return false;
        if (filters.statusAprovacao && user.statusAprovacao !== filters.statusAprovacao) return false;
        return true;
    });

    if (sorting.length > 0) {
      itemsToDisplay.sort((a, b) => {
        for (const sortConfig of sorting) {
          const valA = getSortableValue(a, sortConfig.id);
          const valB = getSortableValue(b, sortConfig.id);

          let comparisonResult = 0;
          if (valA === null || valA === undefined) comparisonResult = 1;
          else if (valB === null || valB === undefined) comparisonResult = -1;
          else {
            comparisonResult = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
          }
    
          if (comparisonResult !== 0) {
            return sortConfig.direction === 'asc' ? comparisonResult : -comparisonResult;
          }
        }
        return 0;
      });
    }
    setDisplayedUsers(itemsToDisplay);
  }, [users, filters, sorting]);

  const resetForm = () => {
    setFormState(initialFormState);
    setIsEditing(false);
    setEditingUserId(null);
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setIsEditing(true);
      setEditingUserId(user.id);
      setFormState({
        ...user,
        senha: "",
        confirmarSenha: "",
        tipoUsuario: user.tipoUsuario || 'Padrão',
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
  
  const handleProfileChange = (value: 'Administrador' | 'Padrão') => {
    let newPermissions = { ...formState.permissoes };
    if (value === 'Administrador') {
      newPermissions = { ...allTruePermissions };
    } else {
      newPermissions = { ...standardUserPermissions };
    }
    setFormState(prev => ({ 
      ...prev, 
      tipoUsuario: value,
      permissoes: newPermissions
    }));
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
    if (userId === "USR001") {
      toast({ variant: "destructive", title: "Ação não permitida", description: "O usuário administrador padrão não pode ser excluído." });
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "Sucesso", description: "Usuário excluído com sucesso." });
  };
  
  const handleBulkDelete = () => {
    const filteredIds = selectedRowIds.filter(id => id !== "USR001");
    if (filteredIds.length < selectedRowIds.length) {
       toast({ variant: "destructive", title: "Ação Parcialmente Bloqueada", description: "O usuário administrador padrão não pode ser excluído e foi ignorado." });
    }
    setUsers(prev => prev.filter(u => !filteredIds.includes(u.id)));
    toast({ title: "Exclusão em Bloco Concluída", description: `${filteredIds.length} usuário(s) foram removidos com sucesso.` });
    setSelectedRowIds([]);
    setIsBulkDeleteOpen(false);
  };

  const handleSaveChanges = () => {
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
        tipoUsuario: formState.tipoUsuario || 'Padrão',
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
    const headers = ['id', 'nomeCompleto', 'email', 'sigla', 'setor', 'statusAprovacao', 'tipoUsuario', ...permissionKeys];
    const csvRows = [headers.join(',')];

    users.forEach(user => {
        const rowData: { [key: string]: any } = {
          id: user.id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          sigla: user.sigla || '',
          setor: user.setor || '',
          statusAprovacao: user.statusAprovacao,
          tipoUsuario: user.tipoUsuario,
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
    const headers = ['nomeCompleto', 'email', 'senha', 'sigla', 'setor', 'statusAprovacao', 'tipoUsuario', ...permissionKeys];
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
            
            const headers = parseCsvRow(headerRow);
            const permissionKeys = allPermissions.map(p => p.id);
            
            const newItemsFromCsv: Usuario[] = [];
            rows.forEach((row, index) => {
                if(!row.trim()) return;
                const values = parseCsvRow(row);
                const newItemData: { [key: string]: any } = {};
                headers.forEach((header, i) => {
                  newItemData[header] = values[i] || "";
                });
                
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
                    tipoUsuario: newItemData.tipoUsuario || 'Padrão',
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
  
  const handleSort = (columnId: string) => {
    const columnConfig = ALL_COLUMNS_CONFIG.find(col => col.id === columnId);
    if (!columnConfig || !columnConfig.enableSorting) return;

    setSorting(prevSorting => {
      const existingSortIndex = prevSorting.findIndex(s => s.id === columnId);
      let newSorting = [...prevSorting];

      if (existingSortIndex !== -1) {
        if (newSorting[existingSortIndex].direction === 'asc') {
          newSorting[existingSortIndex].direction = 'desc';
        } else {
          newSorting.splice(existingSortIndex, 1);
        }
      } else {
        newSorting.push({ id: columnId, direction: 'asc' });
      }
      return newSorting;
    });
  };
  
  const renderSortIcon = (columnId: string) => {
    const sortConfig = sorting.find(s => s.id === columnId);
    if (!sortConfig) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleSelectAllColumns = () => {
    setColumnVisibility(ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: true }), {}));
  };

  const handleDeselectAllColumns = () => {
    setColumnVisibility(ALL_COLUMNS_CONFIG.reduce((acc, col) => ({ ...acc, [col.id as string]: false }), {}));
  };
  
  const getCellValue = (item: Usuario, column: ColumnConfigUsuarios) => {
    const value = item[column.accessorKey as keyof Usuario];
    if (column.cellFormatter) {
      return column.cellFormatter(value, item);
    }
    return value === undefined || value === null ? 'N/A' : String(value);
  };
  
  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (name: keyof typeof initialFiltersState) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === ALL_VALUES_SENTINEL ? "" : value }));
  };

  const clearFilters = () => {
    setFilters(initialFiltersState);
  };
  
  const numDisplayed = displayedUsers.length;
  const numSelected = selectedRowIds.length;

  const filtersAreActive = React.useMemo(() => {
    return Object.values(filters).some(value => !!value);
  }, [filters]);

  return (
    <TooltipProvider>
    <div className="container mx-auto py-2">
      <PageHeader title="Gerenciamento de Usuários" description="Adicione, edite e gerencie os usuários e suas permissões no sistema.">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="destructive" disabled={selectedRowIds.length === 0 || !permissions.usuarios} onClick={() => setIsBulkDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir ({selectedRowIds.length})
          </Button>
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
                    <div className="space-y-2">
                      <Label htmlFor="tipoUsuario">Perfil de Usuário*</Label>
                      <Select 
                        onValueChange={handleProfileChange} 
                        value={formState.tipoUsuario}
                        disabled={!permissions.usuarios || editingUserId === 'USR001'}
                      >
                          <SelectTrigger id="tipoUsuario">
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Padrão">Padrão</SelectItem>
                            <SelectItem value="Administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
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
      
      <Accordion type="single" collapsible className="w-full mb-6 mt-6" value={isFiltersOpen ? "filters" : ""} onValueChange={(value) => setIsFiltersOpen(value === "filters")}>
        <AccordionItem value="filters" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <CardTitle className="font-headline text-primary text-xl">Filtros de Usuários</CardTitle>
            </div>
            {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </AccordionTrigger>
          <AccordionContent>
            <CardDescription className="px-6 pb-4 text-sm">
              Refine a lista de usuários aplicando um ou mais filtros abaixo.
            </CardDescription>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="filterNomeCompleto">Nome Completo</Label>
                <Input id="filterNomeCompleto" name="nomeCompleto" value={filters.nomeCompleto} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterEmail">Email</Label>
                <Input id="filterEmail" name="email" value={filters.email} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterSigla">Sigla</Label>
                <Input id="filterSigla" name="sigla" value={filters.sigla} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterSetor">Setor</Label>
                <Input id="filterSetor" name="setor" value={filters.setor} onChange={handleFilterInputChange} placeholder="Contém..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterStatusAprovacao">Status</Label>
                <Select onValueChange={handleFilterSelectChange('statusAprovacao')} value={filters.statusAprovacao}>
                  <SelectTrigger id="filterStatusAprovacao"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUES_SENTINEL}>Todos os status</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 px-6 pb-6">
              <Button variant="outline" onClick={clearFilters}><RotateCcw className="mr-2 h-4 w-4" /> Limpar Filtros</Button>
            </CardFooter>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Card className="mt-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-primary">Lista de Usuários</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {filtersAreActive
                ? `Exibindo ${displayedUsers.length} de ${users.length} usuários com base nos filtros aplicados.`
                : `Exibindo todos os ${users.length} usuários cadastrados.`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ColumnsIcon className="mr-2 h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Exibir/Ocultar Colunas</DropdownMenuLabel>
                <DropdownMenuItem onSelect={handleSelectAllColumns} className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Selecionar Todas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDeselectAllColumns} className="cursor-pointer">
                  <Square className="mr-2 h-4 w-4" />
                  Limpar Todas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_COLUMNS_CONFIG.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibility[column.id as string] ?? false}
                    onCheckedChange={() => toggleColumnVisibility(column.id as string)}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-12 py-2 px-3">
                        <Checkbox
                        checked={numDisplayed > 0 && numSelected === numDisplayed ? true : numSelected > 0 ? 'indeterminate' : false}
                        onCheckedChange={(value) => setSelectedRowIds(value === true ? displayedUsers.map(u => u.id) : [])}
                        aria-label="Selecionar todas as linhas"
                        />
                    </TableHead>
                    {ALL_COLUMNS_CONFIG.map((column) =>
                        columnVisibility[column.id as string] ? (
                        <TableHead key={column.id as string} className="py-2 px-3">
                            {column.enableSorting ? (
                            <Button
                                variant="ghost"
                                onClick={() => handleSort(column.id as string)}
                                className="px-1 py-1 h-auto -ml-2"
                            >
                                {column.header}
                                {renderSortIcon(column.id as string)}
                            </Button>
                            ) : (
                            column.header
                            )}
                        </TableHead>
                        ) : null
                    )}
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user.id} data-state={selectedRowIds.includes(user.id) ? "selected" : ""}>
                    <TableCell className="py-2 px-3">
                        <Checkbox
                        checked={selectedRowIds.includes(user.id)}
                        onCheckedChange={(value) => setSelectedRowIds(prev => value ? [...prev, user.id] : prev.filter(id => id !== user.id))}
                        aria-label={`Selecionar usuário ${user.nomeCompleto}`}
                        />
                    </TableCell>
                    {ALL_COLUMNS_CONFIG.map((column) =>
                        columnVisibility[column.id as string] ? (
                        <TableCell key={`${user.id}-${column.id as string}`} className="py-2 px-3">
                            {getCellValue(user, column)}
                        </TableCell>
                        ) : null
                    )}
                    <TableCell className="text-right">
                       <AlertDialog>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                                <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Usuário</p></TooltipContent>
                            </Tooltip>
                        </AlertDialog>
                        <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive" disabled={user.id === 'USR001' || !permissions.usuarios}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>{user.id === 'USR001' ? 'Administrador não pode ser excluído' : (permissions.usuarios ? 'Excluir Usuário' : 'Permissão necessária')}</p></TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário "{user.nomeCompleto}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)}>Sim, excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
      
        <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente {selectedRowIds.length} usuário(s) selecionado(s). O usuário administrador será ignorado.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>Sim, excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
