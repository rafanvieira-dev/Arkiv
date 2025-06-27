
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Zap, FileUp, FileText, Mail, KeyRound } from "lucide-react";
import { useRouter } from 'next/navigation';
import * as React from 'react';
import type { Usuario } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { initialUsers } from "@/lib/mock-data";
import Link from "next/link";
import { logAction } from "@/lib/audit";
import { Logo } from "@/components/icons/logo";

const USUARIOS_STORAGE_KEY = 'arquivocentral_usuarios';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USUARIOS_STORAGE_KEY);
      if (!storedUsers) {
        localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to seed users into localStorage:", error);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    let allUsers: Usuario[] = [];
    try {
      const storedUsers = localStorage.getItem(USUARIOS_STORAGE_KEY);
      allUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;
    } catch {
      allUsers = initialUsers;
    }

    const user = allUsers.find(u => u.email === email);

    if (user) {
      if (user.statusAprovacao === 'Aprovado') {
        localStorage.setItem('currentUser', JSON.stringify(user));
        logAction('LOGIN_SUCCESS', { email });
        router.push('/');
      } else {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Sua conta de usuário ainda não foi aprovada pelo administrador.",
        });
        logAction('LOGIN_FAIL', { email, reason: 'Account not approved' });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Erro de Login",
        description: "E-mail ou senha inválidos. Por favor, tente novamente.",
      });
      logAction('LOGIN_FAIL', { email, reason: 'Invalid credentials' });
    }
  };

  const handleAdminLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const adminUser = initialUsers.find(u => u.email === 'admin@sistem.com');

    if (!adminUser) {
        toast({
            variant: "destructive",
            title: "Erro Crítico",
            description: "A conta de administrador padrão não foi encontrada.",
        });
        return;
    }

    try {
        const storedUsers = localStorage.getItem(USUARIOS_STORAGE_KEY);
        let allUsers: Usuario[] = storedUsers ? JSON.parse(storedUsers) : [...initialUsers];

        const adminIndex = allUsers.findIndex(u => u.id === adminUser.id);

        if (adminIndex > -1) {
            // Update the existing admin user to restore it to its pristine state
            allUsers[adminIndex] = adminUser;
        } else {
            // If the admin user was deleted, add it back
            allUsers.push(adminUser);
        }
        
        // Save the potentially "healed" user list back to storage
        localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(allUsers));
        
        // Set the current user for the session
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        logAction('LOGIN_SUCCESS', { email: adminUser.email });
        router.push('/');

    } catch (error) {
        console.error("Failed to process admin login:", error);
        toast({
            variant: "destructive",
            title: "Erro de Login",
            description: "Não foi possível processar o login rápido de administrador.",
        });
    }
  };


  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-lg shadow-lg p-8 space-y-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
              <Logo className="h-12 w-12 text-primary" />
              <h1 className="text-2xl font-bold font-headline text-primary">ARKIV</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão Arquivística</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="email">Login (E-mail)</Label>
                  <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        className="pl-10" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative flex items-center">
                      <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Sua senha" 
                        className="pl-10" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                  </div>
              </div>
              <Button className="w-full" type="submit">
                  <LogIn className="mr-2 h-4 w-4" /> Entrar no Sistema
              </Button>
          </form>
          
          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                  OU
                  </span>
              </div>
          </div>

          <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleAdminLogin}>
                  <Zap className="mr-2 h-4 w-4" /> Acesso Rápido (Admin)
              </Button>
              <Link href="/transferencias/publica" passHref>
                <Button variant="outline" className="w-full">
                    <FileUp className="mr-2 h-4 w-4" /> Transferir Documentos
                </Button>
              </Link>
              <Link href="/solicitacoes/publica" passHref>
                <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Nova Solicitação (Público)
                </Button>
              </Link>
          </div>
           <p className="pt-4 text-center text-xs text-muted-foreground">
              Este é um protótipo. O login é simulado. A senha não é validada de forma segura.
           </p>
      </div>
    </div>
  );
}
