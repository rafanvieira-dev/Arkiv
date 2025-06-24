
"use client";

import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
