
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { MainLayout } from './main-layout';

// Routes that should NOT have the main layout
const noLayoutRoutes = ['/login', '/transferencias/publica', '/solicitacoes/publica'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If the current route is one of the no-layout routes, just render the children.
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }
  
  // Otherwise, wrap the children in the main application layout.
  return (
      <MainLayout>
          {children}
      </MainLayout>
  );
}
