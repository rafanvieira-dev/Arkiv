
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import type { AuditLog } from "@/types";
import { initialUsers } from "@/lib/mock-data";
import { ClientSideDateFormatter } from "@/components/client-side-date-formatter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DateInputPicker } from "@/components/date-input-picker";
import { parseISO, isAfter, isBefore } from 'date-fns';
import { Badge } from "@/components/ui/badge";

const AUDIT_LOG_STORAGE_KEY = 'arquivocentral_audit_logs';
const USUARIOS_STORAGE_KEY = 'arquivocentral_usuarios';

const initialFilters = {
    userId: "",
    action: "",
    details: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
};

interface MemoizedLogRowProps {
    log: AuditLog;
}

const MemoizedLogRow = React.memo(function MemoizedLogRow({ log }: MemoizedLogRowProps) {
    return (
        <TableRow>
            <TableCell className="whitespace-nowrap"><ClientSideDateFormatter isoDateString={log.timestamp} /></TableCell>
            <TableCell>{log.userName} ({log.userId})</TableCell>
            <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
            <TableCell><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre></TableCell>
        </TableRow>
    );
});


export default function AuditoriaPage() {
    const [logs, setLogs] = React.useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = React.useState<AuditLog[]>([]);
    const [users, setUsers] = React.useState<{id: string; nomeCompleto: string}[]>([]);
    const [actions, setActions] = React.useState<string[]>([]);
    const [filters, setFilters] = React.useState(initialFilters);

    React.useEffect(() => {
        try {
            const storedLogs = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
            const allLogs = storedLogs ? JSON.parse(storedLogs) : [];
            setLogs(allLogs);
            setFilteredLogs(allLogs);
            
            const uniqueActions = [...new Set(allLogs.map((log: AuditLog) => log.action))].sort();
            setActions(uniqueActions);

            const storedUsers = window.localStorage.getItem(USUARIOS_STORAGE_KEY);
            const allUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;
            setUsers(allUsers.map((u: any) => ({ id: u.id, nomeCompleto: u.nomeCompleto })));

        } catch (error) {
            console.error("Failed to load audit logs from localStorage", error);
        }
    }, []);

    React.useEffect(() => {
        const result = logs.filter(log => {
            if (filters.userId && log.userId !== filters.userId) return false;
            if (filters.action && log.action !== filters.action) return false;
            if (filters.details && !JSON.stringify(log.details).toLowerCase().includes(filters.details.toLowerCase())) return false;
            
            const logDate = parseISO(log.timestamp);
            if (filters.startDate && isBefore(logDate, filters.startDate)) return false;
            if (filters.endDate && isAfter(logDate, filters.endDate)) return false;
            
            return true;
        });
        setFilteredLogs(result);
    }, [filters, logs]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSelectChange = (name: keyof typeof filters) => (value: string) => {
        setFilters(prev => ({ ...prev, [name]: value === 'ALL' ? "" : value }));
    };

    const handleDateChange = (name: keyof typeof filters) => (date?: Date) => {
        setFilters(prev => ({...prev, [name]: date}));
    };
    
    const clearFilters = () => {
        setFilters(initialFilters);
    };

    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Auditoria do Sistema" description="Visualize o registro de todas as ações realizadas no sistema." />
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filtros de Auditoria</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="filter-user">Usuário</Label>
                        <Select value={filters.userId} onValueChange={handleSelectChange('userId')}>
                            <SelectTrigger id="filter-user"><SelectValue placeholder="Todos os Usuários" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos os Usuários</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.nomeCompleto}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="filter-action">Ação</Label>
                        <Select value={filters.action} onValueChange={handleSelectChange('action')}>
                            <SelectTrigger id="filter-action"><SelectValue placeholder="Todas as Ações" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas as Ações</SelectItem>
                                {actions.map(action => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="filter-details">Detalhes</Label>
                        <Input id="filter-details" name="details" placeholder="Buscar nos detalhes..." value={filters.details} onChange={handleFilterChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="filter-start-date">Data Inicial</Label>
                        <DateInputPicker value={filters.startDate} onChange={handleDateChange('startDate')} placeholder="dd/mm/aaaa" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="filter-end-date">Data Final</Label>
                        <DateInputPicker value={filters.endDate} onChange={handleDateChange('endDate')} placeholder="dd/mm/aaaa" />
                    </div>
                    <div className="flex items-end">
                        <Button variant="outline" onClick={clearFilters} className="w-full">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Limpar Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Logs de Auditoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] w-full">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-card">
                                <TableRow>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map(log => (
                                    <MemoizedLogRow key={log.id} log={log} />
                                ))}
                                {filteredLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Nenhum log encontrado para os filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
