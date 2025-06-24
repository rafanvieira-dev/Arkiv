
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ListFilter,
  Scale,
  Trash2,
  Send,
  Archive,
  Search,
  Settings,
  Users,
  ArrowRightLeft,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { Usuario } from '@/types';
import { useUserSession } from '@/hooks/use-user-session';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permissionKey: keyof Usuario['permissoes'];
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, permissionKey: 'dashboard' },
  { href: '/caixas', label: 'Caixas', icon: Archive, permissionKey: 'caixas' },
  { href: '/classificacao', label: 'Classificação', icon: ListFilter, permissionKey: 'classificacao' },
  { href: '/classes-judiciais', label: 'Classes Judiciais', icon: Scale, permissionKey: 'classesJudiciais' },
  { href: '/documentos', label: 'Acervo', icon: FileText, permissionKey: 'acervo' },
  { href: '/listagens-eliminacao', label: 'Listagens de Eliminação', icon: Trash2, permissionKey: 'listagens' },
  { href: '/transferencias', label: 'Transferências', icon: ArrowRightLeft, permissionKey: 'transferencias' },
  { href: '/solicitacoes', label: 'Solicitações', icon: Send, permissionKey: 'solicitacoes' },
  { href: '/busca-avancada', label: 'Busca Avançada', icon: Search, permissionKey: 'buscaAvancada' },
];

const secondaryNavItems: NavItem[] = [
 { href: '/usuarios', label: 'Usuários', icon: Users, permissionKey: 'usuarios' },
 { href: '/configuracoes', label: 'Configurações', icon: Settings, permissionKey: 'configuracoes' },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { permissions, isLoading } = useUserSession();

  if (isLoading) {
    return (
      <>
        <SidebarMenu>
          {Array.from({ length: 9 }).map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
        </SidebarMenu>
        <div className="mt-auto">
          <SidebarMenu>
            {Array.from({ length: 2 }).map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
          </SidebarMenu>
        </div>
      </>
    );
  }

  const filteredNavItems = navItems.filter(item => permissions[item.permissionKey]);
  const filteredSecondaryNavItems = secondaryNavItems.filter(item => permissions[item.permissionKey]);

  return (
    <>
      <SidebarMenu>
        {filteredNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
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
              <Link href={item.href}>
                <item.icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="mt-auto"> {/* Pushes secondary items to the bottom */}
        <SidebarMenu>
          {filteredSecondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
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
                <Link href={item.href}>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </>
  );
}
