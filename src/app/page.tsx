
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Dashboard" description="Visão geral do ArquivoCentral." />
      <p>O servidor foi iniciado com sucesso. O conteúdo do painel pode ser restaurado.</p>
    </div>
  );
}
