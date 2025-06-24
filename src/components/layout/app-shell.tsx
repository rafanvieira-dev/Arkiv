
"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainLayout } from './main-layout';
import { useUserSession } from '@/hooks/use-user-session';

// Routes that should NOT have the main layout
const noLayoutRoutes = ['/login', '/transferencias/publica', '/solicitacoes/publica'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUserSession();

  useEffect(() => {
    // Don't run authentication logic for public routes
    if (noLayoutRoutes.includes(pathname)) {
      return;
    }
    
    // If loading is finished on a protected route and there's no user, redirect to login.
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router, pathname]);

  // If the current route is one of the public no-layout routes, just render the children.
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // While loading the user session for a protected route, show a simple loader to prevent layout flashes.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando sessão...</p>
      </div>
    );
  }

  // If there's a user on a protected route, render the main layout.
  if (user) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  // On a protected route, return null while waiting for the redirect to happen from the useEffect hook.
  return null;
}
