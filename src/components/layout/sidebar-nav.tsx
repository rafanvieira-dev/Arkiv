
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ListFilter,
  Scale, // Alterado de Gavel para Scale
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
  { href: '/caixas', label: 'Caixas', icon: Archive },
  { href: '/classificacao', label: 'Classificação', icon: ListFilter },
  { href: '/classes-judiciais', label: 'Classes Judiciais', icon: Scale }, // Ícone alterado aqui
  { href: '/documentos', label: 'Acervo', icon: FileText },
  { href: '/listagens-eliminacao', label: 'Listagens de Eliminação', icon: Trash2 },
  { href: '/solicitacoes', label: 'Solicitações', icon: Send },
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
            <Link href={item.href} passHref legacyBehavior={false}>
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
                <>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="mt-auto"> {/* Pushes secondary items to the bottom */}
        <SidebarMenu>
          {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
               <Link href={item.href} passHref legacyBehavior={false}>
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
                  <>
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </>
  );
}
