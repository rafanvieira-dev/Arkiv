
"use client";

import { useState, useEffect } from 'react';
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
};

export function useUserSession(): UserSession {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    permissions: user?.permissoes || defaultPermissions,
    isLoading,
  };
}
