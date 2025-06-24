
"use client";

import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  // Temporarily bypassing the main layout to diagnose a server start issue.
  return <>{children}</>;
}
