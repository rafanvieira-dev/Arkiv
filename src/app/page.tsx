import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ArrowRight, FileText, Archive, Send, ListFilter, Users, Search } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  link: string;
  linkText: string;
}

function StatCard({ title, value, icon: Icon, link, linkText }: StatCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline text-primary">{value}</div>
        <Link href={link} passHref>
          <Button variant="link" className="px-0 text-sm text-accent hover:text-accent/90">
            {linkText} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const stats = [
    { title: "Total de Documentos", value: "1,234", icon: FileText, link: "/documentos", linkText: "Ver Documentos" },
    { title: "Caixas Arquivadas", value: "56", icon: Archive, link: "/caixas", linkText: "Ver Caixas" },
    { title: "Solicitações Pendentes", value: "8", icon: Send, link: "/solicitacoes", linkText: "Ver Solicitações" },
    { title: "Classificações", value: "120", icon: ListFilter, link: "/classificacao", linkText: "Ver Classificações"},
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Dashboard" description="Visão geral do ArquivoCentral." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/documentos" passHref><Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Cadastrar Documento</Button></Link>
            <Link href="/solicitacoes" passHref><Button variant="outline" className="w-full justify-start"><Send className="mr-2 h-4 w-4" />Nova Solicitação</Button></Link>
            <Link href="/caixas" passHref><Button variant="outline" className="w-full justify-start"><Archive className="mr-2 h-4 w-4" />Gerenciar Caixas</Button></Link>
            <Link href="/busca-avancada" passHref><Button variant="outline" className="w-full justify-start"><Search className="mr-2 h-4 w-4" />Busca Avançada</Button></Link>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nenhuma atividade recente para exibir.</p>
            {/* Placeholder for recent activity feed */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
