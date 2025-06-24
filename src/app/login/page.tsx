
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Zap, FileUp, FileText, UserPlus, Mail, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { initialUsers } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for the standard user
    const standardUser = initialUsers.find(u => u.email === 'user@sistem.com');
    if (standardUser) {
      localStorage.setItem('currentUser', JSON.stringify(standardUser));
    }
    router.push('/');
  };

  const handleAdminLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Simulate login for the admin user
    const adminUser = initialUsers.find(u => u.email === 'admin@sistem.com');
    if (adminUser) {
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
    }
    router.push('/');
  };


  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-left">
              <h1 className="text-xl font-semibold text-foreground">Acesso ao Sistema de Gestão Arquivística</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="email">Login (E-mail)</Label>
                  <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="seu@email.com" className="pl-10" required defaultValue="user@sistem.com" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative flex items-center">
                      <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="Sua senha" className="pl-10" required defaultValue="password" />
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
                  <Zap className="mr-2 h-4 w-4" /> Acesso Rápido (Admin Padrão)
              </Button>
              <Button variant="outline" className="w-full">
                  <FileUp className="mr-2 h-4 w-4" /> Transferir Documentos
              </Button>
               <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" /> Nova Solicitação (Público)
              </Button>
               <Button variant="outline" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" /> Registrar Nova Conta
              </Button>
          </div>
           <p className="pt-4 text-center text-xs text-muted-foreground">
              Este é um protótipo. O login é simulado. A senha não é validada de forma segura.
           </p>
      </div>
    </div>
  );
}
