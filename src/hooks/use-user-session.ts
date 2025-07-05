
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Usuario } from '@/types';

interface UserSession {
  user: Usuario | null;
  permissions: Usuario['permissoes'];
  isLoading: boolean;
}

const defaultPermissions: Usuario['permissoes'] = {
  dashboard: false,
  acervo: false,
  caixas: false,
  classificacao: false,
  classesJudiciais: false,
  listagens: false,
  solicitacoes: false,
  buscaAvancada: false,
  transferencias: false,
  usuarios: false,
  configuracoes: false,
  estatisticas: false,
  relatorios: false,
  auditoria: false,
  manual: false,
  exclusaoDados: false,
};

export function useUserSession(): UserSession {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Set loading to true on path change to ensure UI waits for session check
    setIsLoading(true);
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        setUser(JSON.parse(userJson));
      } else {
        // Explicitly set user to null if not logged in
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]); // Re-run effect when path changes

  return {
    user,
    permissions: user?.permissoes || defaultPermissions,
    isLoading,
  };
}
