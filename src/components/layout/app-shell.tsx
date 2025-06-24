
"use client";

import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPages = ['/login', '/solicitacoes/publica', '/transferencias'];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
