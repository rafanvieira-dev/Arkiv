"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ListFilter,
  Gavel,
  Trash2,
  Send,
  Archive,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documentos', label: 'Documentos', icon: FileText },
  { href: '/classificacao', label: 'Classificação', icon: ListFilter },
  { href: '/classes-judiciais', label: 'Classes Judiciais', icon: Gavel },
  { href: '/listagens-eliminacao', label: 'Listagens de Eliminação', icon: Trash2 },
  { href: '/solicitacoes', label: 'Solicitações', icon: Send },
  { href: '/caixas', label: 'Caixas', icon: Archive },
  { href: '/busca-avancada', label: 'Busca Avançada', icon: Search },
];

const secondaryNavItems = [
 { href: '/usuarios', label: 'Usuários', icon: Users },
 { href: '/configuracoes', label: 'Configurações', icon: Settings },
];


export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                tooltip={item.label}
                className={cn(
                  (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <a>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="mt-auto"> {/* Pushes secondary items to the bottom */}
        <SidebarMenu>
          {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className={cn(
                    (pathname === item.href || pathname.startsWith(item.href))
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <a>
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </>
  );
}
