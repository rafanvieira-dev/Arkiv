
"use client";

import * as React from "react";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Documento, Classificacao, Caixa, Solicitacao, Transferencia } from "@/types";
import { getYear, parseISO, isValid } from "date-fns";
import { placeholderDocumentos, initialClassificacoes, initialCaixas, placeholderSolicitacoesInitial, initialTransferencias } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";


const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';
const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';
const SOLICITACOES_STORAGE_KEY = 'arquivocentral_solicitacoes';
const TRANSFERENCIAS_STORAGE_KEY = 'arquivocentral_transferencias';


interface ChartData {
  name: string;
  value: number;
  fill: string;
  percentage?: number;
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210 50% 52%)", // Primary
  "hsl(16 100% 66%)", // Accent
];


type ChartType = 'status' | 'year' | 'anoEliminacao' | 'destinacao' | 'meio' | 'destinacaoCaixa' | 'condicaoCaixa' | 'situacaoCaixa' | 'classification' | 'tipoDocumento' | 'emprestimoPorSetor' | 'eliminadoPorAno' | 'desarquivamentoPorSetor' | 'transferenciaPorSetor' | 'categoria';


export default function EstatisticasPage() {
  const { toast } = useToast();
  const [statusData, setStatusData] = React.useState<ChartData[]>([]);
  const [yearData, setYearData] = React.useState<ChartData[]>([]);
  const [anoEliminacaoData, setAnoEliminacaoData] = React.useState<ChartData[]>([]);
  const [destinacaoData, setDestinacaoData] = React.useState<ChartData[]>([]);
  const [meioData, setMeioData] = React.useState<ChartData[]>([]);
  const [classificationData, setClassificationData] = React.useState<ChartData[]>([]);
  const [tipoDocumentoData, setTipoDocumentoData] = React.useState<ChartData[]>([]);
  const [destinacaoCaixaData, setDestinacaoCaixaData] = React.useState<ChartData[]>([]);
  const [condicaoCaixaData, setCondicaoCaixaData] = React.useState<ChartData[]>([]);
  const [situacaoCaixaData, setSituacaoCaixaData] = React.useState<ChartData[]>([]);
  const [emprestimosPorSetorData, setEmprestimosPorSetorData] = React.useState<any[]>([]);
  const [desarquivadosPorSetorData, setDesarquivadosPorSetorData] = React.useState<any[]>([]);
  const [eliminadoPorAnoData, setEliminadoPorAnoData] = React.useState<ChartData[]>([]);
  const [transferenciasPorSetorData, setTransferenciasPorSetorData] = React.useState<any[]>([]);
  const [categoriaData, setCategoriaData] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [statusChartConfig, setStatusChartConfig] = React.useState<ChartConfig>({});
  const [destinacaoChartConfig, setDestinacaoChartConfig] = React.useState<ChartConfig>({});
  const [meioChartConfig, setMeioChartConfig] = React.useState<ChartConfig>({});
  const [destinacaoCaixaChartConfig, setDestinacaoCaixaChartConfig] = React.useState<ChartConfig>({});
  const [condicaoCaixaChartConfig, setCondicaoCaixaChartConfig] = React.useState<ChartConfig>({});
  const [situacaoCaixaChartConfig, setSituacaoCaixaChartConfig] = React.useState<ChartConfig>({});
  const [emprestimoChartConfig, setEmprestimoChartConfig] = React.useState<ChartConfig>({});
  const [desarquivamentoChartConfig, setDesarquivamentoChartConfig] = React.useState<ChartConfig>({});
  const [transferenciaChartConfig, setTransferenciaChartConfig] = React.useState<ChartConfig>({});
  const [categoriaChartConfig, setCategoriaChartConfig] = React.useState<ChartConfig>({});


  const [modalContent, setModalContent] = React.useState<{ title: string; description: string; chartType: ChartType } | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = React.useCallback(() => {
    if (chartRef.current === null) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Referência do gráfico não encontrada.' });
        return;
    }
    toPng(chartRef.current, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${modalContent?.title.replace(/ /g, '_').toLowerCase() || 'chart'}.png`;
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => {
            console.error('oops, something went wrong!', err);
            toast({ variant: 'destructive', title: 'Erro ao baixar o gráfico', description: 'Por favor, tente novamente.' });
        });
  }, [modalContent?.title, toast]);

  const handleChartClick = (title: string, description: string, chartType: ChartType) => {
    setModalContent({ title, description, chartType });
  };


  React.useEffect(() => {
    try {
      const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      const allDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
      const totalDocs = allDocs.length;
      
      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      const allClassificacoes: Classificacao[] = storedClassificacoes ? JSON.parse(storedClassificacoes) : initialClassificacoes;
      
      const storedCaixas = window.localStorage.getItem(CAIXAS_STORAGE_KEY);
      const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;
      
      const storedSolicitacoes = window.localStorage.getItem(SOLICITACOES_STORAGE_KEY);
      const allSolicitacoes: Solicitacao[] = storedSolicitacoes ? JSON.parse(storedSolicitacoes) : placeholderSolicitacoesInitial;
      
      const storedTransferencias = window.localStorage.getItem(TRANSFERENCIAS_STORAGE_KEY);
      const allTransferencias: Transferencia[] = storedTransferencias ? JSON.parse(storedTransferencias) : initialTransferencias;


      // Process status data
      const statusCounts = allDocs.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const statusChartData = Object.entries(statusCounts).map(([name, value], index) => ({
        name,
        value,
        percentage: totalDocs > 0 ? (value / totalDocs) * 100 : 0,
        fill: chartColors[index % chartColors.length],
      }));
      setStatusData(statusChartData);
      setStatusChartConfig(
        statusChartData.reduce((acc, entry) => {
            acc[entry.name] = { label: entry.name, color: entry.fill };
            return acc;
        }, {} as ChartConfig)
      );

      // Process year data
      const yearCounts = allDocs.reduce((acc, doc) => {
        if (doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
          const year = getYear(parseISO(doc.dataArquivamento)).toString();
          acc[year] = (acc[year] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const yearChartData = Object.entries(yearCounts)
        .map(([name, value], index) => ({
             name,
             value,
             percentage: totalDocs > 0 ? (value / totalDocs) * 100 : 0,
             fill: "hsl(var(--chart-1))"
        }))
        .sort((a,b) => parseInt(a.name) - parseInt(b.name));
      setYearData(yearChartData);

      // Process ano de eliminação previsto data
      const anoEliminacaoCounts = allDocs.reduce((acc, doc) => {
        if (doc.anoEliminacaoPrevisto) {
          const year = doc.anoEliminacaoPrevisto;
          acc[year] = (acc[year] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const anoEliminacaoChartData = Object.entries(anoEliminacaoCounts)
        .map(([name, value]) => ({
            name,
            value,
            percentage: totalDocs > 0 ? (value / totalDocs) * 100 : 0,
            fill: "hsl(var(--chart-2))"
        }))
        .sort((a,b) => parseInt(a.name) - parseInt(b.name));
      setAnoEliminacaoData(anoEliminacaoChartData);
      
      // Process destinacao data
      const destinacaoCounts = allDocs.reduce((acc, doc) => {
          const destinacao = doc.destinacaoFinalDisplay || "Indefinida";
          acc[destinacao] = (acc[destinacao] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const destinacaoChartData = Object.entries(destinacaoCounts).map(([name, value], index) => ({
        name,
        value,
        percentage: totalDocs > 0 ? (value / totalDocs) * 100 : 0,
        fill: chartColors[index % chartColors.length],
      }));
      setDestinacaoData(destinacaoChartData);
      setDestinacaoChartConfig(
        destinacaoChartData.reduce((acc, entry) => {
            acc[entry.name] = { label: entry.name, color: entry.fill };
            return acc;
        }, {} as ChartConfig)
      );

      // Process tipo de meio data
      const meioCounts = allDocs.reduce((acc, doc) => {
          const meio = doc.tipoMeio || "Indefinido";
          acc[meio] = (acc[meio] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const meioChartData = Object.entries(meioCounts).map(([name, value], index) => ({
        name,
        value,
        percentage: totalDocs > 0 ? (value / totalDocs) * 100 : 0,
        fill: chartColors[index % chartColors.length],
      }));
      setMeioData(meioChartData);
       setMeioChartConfig(
        meioChartData.reduce((acc, entry) => {
            acc[entry.name] = { label: entry.name, color: entry.fill };
            return acc;
        }, {} as ChartConfig)
      );

      // Process "Documentos por Categoria"
      const categoriaCounts = allDocs.reduce((acc, doc) => {
        const categoria = doc.categoria || "Indefinida";
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoriaChartData = Object.entries(categoriaCounts).map(([name, value], index) => ({
        name,
        value,
        percentage: totalDocs > 0 ? (value / totalDocs) * 100 : 0,
        fill: chartColors[(index + 3) % chartColors.length],
      }));
      setCategoriaData(categoriaChartData);
      setCategoriaChartConfig(
        categoriaChartData.reduce((acc, entry) => {
            acc[entry.name] = { label: entry.name, color: entry.fill };
            return acc;
        }, {} as ChartConfig)
      );
      
      // Process caixas por destinação data
      const caixaDestinacaoCounts = {
        Permanente: 0,
        Eliminável: 0,
        Mista: 0,
      };

      allCaixas.forEach(caixa => {
        if (!caixa.codigoCaixa) return;
        const docsInCaixa = allDocs.filter(doc => doc.codigosCaixa?.split(',').map(c => c.trim()).includes(caixa.codigoCaixa));
        if (docsInCaixa.length === 0) return;

        const destinos = new Set(docsInCaixa.map(d => d.destinacaoFinalDisplay).filter(Boolean));

        if (destinos.has('Guarda Permanente') && destinos.has('Eliminação')) {
          caixaDestinacaoCounts.Mista++;
        } else if (destinos.has('Guarda Permanente')) {
          caixaDestinacaoCounts.Permanente++;
        } else if (destinos.has('Eliminação')) {
          caixaDestinacaoCounts.Eliminável++;
        }
      });
      
      const destinacaoCaixaChartData = Object.entries(caixaDestinacaoCounts)
        .map(([name, value], index) => ({ name, value, fill: chartColors[index % chartColors.length] }))
        .filter(d => d.value > 0);

      const totalCaixasAvaliadas = destinacaoCaixaChartData.reduce((sum, item) => sum + item.value, 0);

      const finalDestinacaoCaixaData = destinacaoCaixaChartData.map(item => ({
        ...item,
        percentage: totalCaixasAvaliadas > 0 ? (item.value / totalCaixasAvaliadas) * 100 : 0,
      }));

      setDestinacaoCaixaData(finalDestinacaoCaixaData);
      setDestinacaoCaixaChartConfig(
        finalDestinacaoCaixaData.reduce((acc, entry) => {
            acc[entry.name] = { label: entry.name, color: entry.fill };
            return acc;
        }, {} as ChartConfig)
      );

      // Process caixas por condição
      const condicaoCaixaCounts = allCaixas.reduce((acc, caixa) => {
          const condicao = caixa.condicao || "Indefinida";
          acc[condicao] = (acc[condicao] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const condicaoCaixaChartData = Object.entries(condicaoCaixaCounts).map(([name, value], index) => ({
          name,
          value,
          percentage: allCaixas.length > 0 ? (value / allCaixas.length) * 100 : 0,
          fill: chartColors[(index + 1) % chartColors.length],
      }));
      setCondicaoCaixaData(condicaoCaixaChartData);
      setCondicaoCaixaChartConfig(
          condicaoCaixaChartData.reduce((acc, entry) => {
              acc[entry.name] = { label: entry.name, color: entry.fill };
              return acc;
          }, {} as ChartConfig)
      );

      // Process caixas por situação
      const situacaoCaixaCounts = allCaixas.reduce((acc, caixa) => {
          const situacao = caixa.situacao || "Indefinida";
          acc[situacao] = (acc[situacao] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const situacaoCaixaChartData = Object.entries(situacaoCaixaCounts).map(([name, value], index) => ({
          name,
          value,
          percentage: allCaixas.length > 0 ? (value / allCaixas.length) * 100 : 0,
          fill: chartColors[(index + 2) % chartColors.length],
      }));
      setSituacaoCaixaData(situacaoCaixaChartData);
      setSituacaoCaixaChartConfig(
          situacaoCaixaChartData.reduce((acc, entry) => {
              acc[entry.name] = { label: entry.name, color: entry.fill };
              return acc;
          }, {} as ChartConfig)
      );

      // Process classification data
      const classificationCounts = allDocs.reduce((acc, doc) => {
        if (doc.classificacaoArquivisticaId) {
          acc[doc.classificacaoArquivisticaId] = (acc[doc.classificacaoArquivisticaId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const totalClassifiedDocs = Object.values(classificationCounts).reduce((sum, count) => sum + count, 0);

      const classificationChartData = Object.entries(classificationCounts)
        .map(([id, value]) => {
            const classif = allClassificacoes.find(c => c.id === id);
            const name = classif ? `${classif.codigo} - ${classif.descricao}` : `ID: ${id}`;
            return {
                name,
                value,
                percentage: totalClassifiedDocs > 0 ? (value / totalClassifiedDocs) * 100 : 0,
                fill: "hsl(var(--chart-3))"
            };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      setClassificationData(classificationChartData);

      // Process "Espécie Documental" data
      const tipoDocumentoCounts = allDocs.reduce((acc, doc) => {
        if (doc.tipoDocumento) {
            acc[doc.tipoDocumento] = (acc[doc.tipoDocumento] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const totalTipoDocs = Object.values(tipoDocumentoCounts).reduce((sum, count) => sum + count, 0);

      const tipoDocumentoChartData = Object.entries(tipoDocumentoCounts)
        .map(([name, value]) => ({
            name,
            value,
            percentage: totalTipoDocs > 0 ? (value / totalTipoDocs) * 100 : 0,
            fill: "hsl(var(--chart-4))"
        }))
        .sort((a,b) => b.value - a.value)
        .slice(0,10);
      setTipoDocumentoData(tipoDocumentoChartData);
      
      // Process "Empréstimos por Setor e Ano"
      const emprestimosCounts: { [year: string]: { [setor: string]: number } } = {};
      const allEmprestimoSetores = new Set<string>();
      allSolicitacoes.filter(s => s.tipo === 'Empréstimo' && s.dataAtendimento && s.documentoIds?.length > 0).forEach(s => { const year = getYear(parseISO(s.dataSolicitacao)).toString(); const setor = s.setorSolicitante || "Não especificado"; if (!emprestimosCounts[year]) { emprestimosCounts[year] = {}; } if (!emprestimosCounts[year][setor]) { emprestimosCounts[year][setor] = 0; } emprestimosCounts[year][setor] += s.documentoIds.length; allEmprestimoSetores.add(setor); });
      const sortedEmprestimoSetores = Array.from(allEmprestimoSetores).sort();
      const emprestimosChartData = Object.keys(emprestimosCounts).map(year => { const yearData: { [key: string]: string | number } = { name: year }; sortedEmprestimoSetores.forEach(setor => { yearData[setor] = emprestimosCounts[year][setor] || 0; }); return yearData; }).sort((a, b) => parseInt(a.name as string) - parseInt(b.name as string));
      const emprestimoFinalChartConfig = sortedEmprestimoSetores.reduce((acc, setor, index) => { acc[setor] = { label: setor, color: chartColors[index % chartColors.length] }; return acc; }, {} as ChartConfig);
      setEmprestimosPorSetorData(emprestimosChartData);
      setEmprestimoChartConfig(emprestimoFinalChartConfig);

      // Process "Desarquivamentos por Setor e Ano"
      const desarquivadosCounts: { [year: string]: { [setor: string]: number } } = {};
      const allDesarquivamentoSetores = new Set<string>();
      allSolicitacoes.filter(s => s.tipo === 'Desarquivamento' && s.dataAtendimento && s.documentoIds?.length > 0).forEach(s => { const year = getYear(parseISO(s.dataSolicitacao)).toString(); const setor = s.setorSolicitante || "Não especificado"; if (!desarquivadosCounts[year]) { desarquivadosCounts[year] = {}; } if (!desarquivadosCounts[year][setor]) { desarquivadosCounts[year][setor] = 0; } desarquivadosCounts[year][setor] += s.documentoIds.length; allDesarquivamentoSetores.add(setor); });
      const sortedDesarquivamentoSetores = Array.from(allDesarquivamentoSetores).sort();
      const desarquivadosChartData = Object.keys(desarquivadosCounts).map(year => { const yearData: { [key: string]: string | number } = { name: year }; sortedDesarquivamentoSetores.forEach(setor => { yearData[setor] = desarquivadosCounts[year][setor] || 0; }); return yearData; }).sort((a, b) => parseInt(a.name as string) - parseInt(b.name as string));
      const desarquivamentoFinalChartConfig = sortedDesarquivamentoSetores.reduce((acc, setor, index) => { acc[setor] = { label: setor, color: chartColors[(index + 2) % chartColors.length] }; return acc; }, {} as ChartConfig);
      setDesarquivadosPorSetorData(desarquivadosChartData);
      setDesarquivamentoChartConfig(desarquivamentoFinalChartConfig);
      
      // Process "Documentos Eliminados por Ano"
      const eliminatedDocs = allDocs.filter(doc => doc.status === 'Eliminado' && doc.dataBaixa && isValid(parseISO(doc.dataBaixa)));
      const totalEliminatedDocs = eliminatedDocs.length;
      const eliminadoPorAnoCounts = eliminatedDocs.reduce((acc, doc) => { const year = getYear(parseISO(doc.dataBaixa!)).toString(); acc[year] = (acc[year] || 0) + 1; return acc; }, {} as Record<string, number>);
      const eliminadoPorAnoChartData = Object.entries(eliminadoPorAnoCounts).map(([name, value]) => ({ name, value, percentage: totalEliminatedDocs > 0 ? (value / totalEliminatedDocs) * 100 : 0, fill: "hsl(var(--chart-5))" })).sort((a,b) => parseInt(a.name) - parseInt(b.name));
      setEliminadoPorAnoData(eliminadoPorAnoChartData);
      
      // Process "Transferências por Setor e Ano"
      const transferenciasCounts: { [year: string]: { [setor: string]: number } } = {};
      const allTransferenciaSetores = new Set<string>();
      allTransferencias.filter(t => t.status === 'Aprovada' && t.dataTransferencia && t.documentos?.length > 0).forEach(t => {
          const year = getYear(parseISO(t.dataTransferencia)).toString();
          const setor = t.setorRemetente || "Não especificado";
          if (!transferenciasCounts[year]) {
              transferenciasCounts[year] = {};
          }
          if (!transferenciasCounts[year][setor]) {
              transferenciasCounts[year][setor] = 0;
          }
          transferenciasCounts[year][setor] += t.documentos.length;
          allTransferenciaSetores.add(setor);
      });

      const sortedTransferenciaSetores = Array.from(allTransferenciaSetores).sort();
      const transferenciasChartData = Object.keys(transferenciasCounts).map(year => {
          const yearData: { [key: string]: string | number } = { name: year };
          sortedTransferenciaSetores.forEach(setor => {
              yearData[setor] = transferenciasCounts[year][setor] || 0;
          });
          return yearData;
      }).sort((a, b) => parseInt(a.name as string) - parseInt(b.name as string));
      
      const transferenciaFinalChartConfig = sortedTransferenciaSetores.reduce((acc, setor, index) => {
          acc[setor] = { label: setor, color: chartColors[(index + 4) % chartColors.length] };
          return acc;
      }, {} as ChartConfig);

      setTransferenciasPorSetorData(transferenciasChartData);
      setTransferenciaChartConfig(transferenciaFinalChartConfig);


    } catch (error) {
      console.error("Failed to process chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  if (isLoading) {
    return <div className="container mx-auto py-2"><PageHeader title="Carregando Estatísticas..." /></div>;
  }

  const StatusChart = (
    <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-full w-full">
      <PieChart>
        <ChartTooltip formatter={(value, name, props) => {
            const { payload } = props;
            const percentage = payload.percentage?.toFixed(1);
            return `${value} (${percentage}%)`;
          }} 
          content={<ChartTooltipContent hideLabel />} 
        />
        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
            {statusData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );

  const YearChart = (
    <ChartContainer config={{value: {label: "Documentos", color: "hsl(var(--chart-1))"}}} className="h-full w-full">
      <BarChart data={yearData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis />
        <ChartTooltip 
            cursor={false} 
            content={<ChartTooltipContent indicator="line" formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }} />} 
        />
        <Bar dataKey="value" radius={4} name="Documentos"/>
      </BarChart>
    </ChartContainer>
  );
  
  const AnoEliminacaoChart = (
     <ChartContainer config={{value: {label: "Documentos", color: "hsl(var(--chart-2))"}}} className="h-full w-full">
        <BarChart data={anoEliminacaoData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" formatter={(value, name, props) => {
                const { payload } = props;
                const percentage = payload.percentage?.toFixed(1);
                return `${value} (${percentage}%)`;
              }} />} 
            />
            <Bar dataKey="value" radius={4} name="Documentos"/>
        </BarChart>
    </ChartContainer>
  );

  const EliminadoPorAnoChart = (
    <ChartContainer config={{value: {label: "Documentos Eliminados", color: "hsl(var(--chart-5))"}}} className="h-full w-full">
        <BarChart data={eliminadoPorAnoData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
             <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" formatter={(value, name, props) => {
                const { payload } = props;
                const percentage = payload.percentage?.toFixed(1);
                return `${value} (${percentage}%)`;
              }} />} 
            />
            <Bar dataKey="value" radius={4} name="Documentos Eliminados"/>
        </BarChart>
    </ChartContainer>
  );

  const DestinacaoChart = (
    <ChartContainer config={destinacaoChartConfig} className="mx-auto aspect-square h-full w-full">
        <PieChart>
            <ChartTooltip formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }}
            content={<ChartTooltipContent hideLabel />} 
          />
            <Pie data={destinacaoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
                {destinacaoData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
    </ChartContainer>
  );

  const MeioChart = (
    <ChartContainer config={meioChartConfig} className="mx-auto aspect-square h-full w-full">
        <PieChart>
             <ChartTooltip formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }}
            content={<ChartTooltipContent hideLabel />} 
          />
            <Pie data={meioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
                {meioData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
    </ChartContainer>
  );

  const CategoriaChart = (
    <ChartContainer config={categoriaChartConfig} className="mx-auto aspect-square h-full w-full">
        <PieChart>
             <ChartTooltip formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }}
            content={<ChartTooltipContent hideLabel />} 
          />
            <Pie data={categoriaData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
                {categoriaData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
    </ChartContainer>
  );

  const DestinacaoCaixaChart = (
    <ChartContainer config={destinacaoCaixaChartConfig} className="mx-auto aspect-square h-full w-full">
        <PieChart>
            <ChartTooltip formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }}
            content={<ChartTooltipContent hideLabel />} 
          />
            <Pie data={destinacaoCaixaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
                {destinacaoCaixaData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
    </ChartContainer>
  );

  const CondicaoCaixaChart = (
    <ChartContainer config={condicaoCaixaChartConfig} className="mx-auto aspect-square h-full w-full">
        <PieChart>
            <ChartTooltip formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }}
            content={<ChartTooltipContent hideLabel />}
          />
            <Pie data={condicaoCaixaData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
                {condicaoCaixaData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
    </ChartContainer>
  );
  
  const SituacaoCaixaChart = (
    <ChartContainer config={situacaoCaixaChartConfig} className="mx-auto aspect-square h-full w-full">
        <PieChart>
            <ChartTooltip formatter={(value, name, props) => {
              const { payload } = props;
              const percentage = payload.percentage?.toFixed(1);
              return `${value} (${percentage}%)`;
            }}
            content={<ChartTooltipContent hideLabel />}
          />
            <Pie data={situacaoCaixaData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} labelLine={false} label={({ value, percentage }) => `${value} (${percentage?.toFixed(1)}%)`}>
                {situacaoCaixaData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
    </ChartContainer>
  );

  const ClassificationChart = (
    <ChartContainer config={{value: {label: "Documentos", color: "hsl(var(--chart-3))"}}} className="h-full w-full">
        <BarChart data={classificationData} margin={{ top: 20, right: 20, left: 0, bottom: 100 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-60} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
            <YAxis />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" formatter={(value, name, props) => {
                const { payload } = props;
                const percentage = payload.percentage?.toFixed(1);
                return `${value} (${percentage}%)`;
              }} />} 
            />
            <Bar dataKey="value" radius={4} name="Documentos" />
        </BarChart>
    </ChartContainer>
  );
  
  const TipoDocumentoChart = (
    <ChartContainer config={{value: {label: "Documentos", color: "hsl(var(--chart-4))"}}} className="h-full w-full">
        <BarChart data={tipoDocumentoData} margin={{ top: 20, right: 20, left: 0, bottom: 100 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-60} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
            <YAxis />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" formatter={(value, name, props) => {
                const { payload } = props;
                const percentage = payload.percentage?.toFixed(1);
                return `${value} (${percentage}%)`;
              }} />} 
            />
            <Bar dataKey="value" radius={4} name="Documentos" />
        </BarChart>
    </ChartContainer>
  );
  
    const EmprestimoPorSetorChart = (
    <ChartContainer config={emprestimoChartConfig} className="h-full w-full">
        <BarChart data={emprestimosPorSetorData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} name="Ano" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(emprestimoChartConfig).map(setor => (
                <Bar key={setor} dataKey={setor} stackId="a" fill={`var(--color-${setor})`} radius={4} name={setor} />
            ))}
        </BarChart>
    </ChartContainer>
  );
  
  const DesarquivamentoPorSetorChart = (
    <ChartContainer config={desarquivamentoChartConfig} className="h-full w-full">
        <BarChart data={desarquivadosPorSetorData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} name="Ano" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(desarquivamentoChartConfig).map(setor => (
                <Bar key={setor} dataKey={setor} stackId="a" fill={`var(--color-${setor})`} radius={4} name={setor} />
            ))}
        </BarChart>
    </ChartContainer>
  );
  
  const TransferenciaPorSetorChart = (
    <ChartContainer config={transferenciaChartConfig} className="h-full w-full">
        <BarChart data={transferenciasPorSetorData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} name="Ano" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(transferenciaChartConfig).map(setor => (
                <Bar key={setor} dataKey={setor} stackId="a" fill={`var(--color-${setor})`} radius={4} name={setor} />
            ))}
        </BarChart>
    </ChartContainer>
  );

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Estatísticas do Acervo" description="Visualização de dados e métricas sobre os documentos arquivados." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos por Status", "Distribuição dos documentos com base no status atual.", 'status')}>
          <CardHeader>
            <CardTitle>Documentos por Status</CardTitle>
            <CardDescription>Distribuição dos documentos com base no status atual.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{StatusChart}</CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos por Categoria", "Distribuição de documentos por categoria.", 'categoria')}>
          <CardHeader>
            <CardTitle>Documentos por Categoria</CardTitle>
            <CardDescription>Distribuição de documentos por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{CategoriaChart}</CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos por Tipo de Meio", "Distribuição entre meios físico, digital e híbrido.", 'meio')}>
          <CardHeader>
            <CardTitle>Documentos por Tipo de Meio</CardTitle>
            <CardDescription>Distribuição entre meios físico, digital e híbrido.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{MeioChart}</CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos por Destinação Final", "Distribuição conforme a destinação final prevista.", 'destinacao')}>
          <CardHeader>
            <CardTitle>Documentos por Destinação Final</CardTitle>
            <CardDescription>Distribuição conforme a destinação final prevista.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{DestinacaoChart}</CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Estatísticas das Caixas</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Caixas por Condição", "Distribuição das caixas por condição (ocupada ou vazia).", 'condicaoCaixa')}>
                <CardHeader>
                    <CardTitle>Caixas por Condição</CardTitle>
                    <CardDescription>Distribuição das caixas por condição (ocupada ou vazia).</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">{CondicaoCaixaChart}</CardContent>
            </Card>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Caixas por Situação", "Distribuição das caixas por situação (completa ou incompleta).", 'situacaoCaixa')}>
                <CardHeader>
                    <CardTitle>Caixas por Situação</CardTitle>
                    <CardDescription>Distribuição das caixas por situação (completa ou incompleta).</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">{SituacaoCaixaChart}</CardContent>
            </Card>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Caixas por Destinação de Conteúdo", "Distribuição de caixas com base na destinação dos documentos.", 'destinacaoCaixa')}>
              <CardHeader>
                <CardTitle>Caixas por Destinação de Conteúdo</CardTitle>
                <CardDescription>Distribuição de caixas com base na destinação dos documentos.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">{DestinacaoCaixaChart}</CardContent>
            </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos por Ano de Arquivamento", "Quantidade de documentos arquivados por ano.", 'year')}>
          <CardHeader>
            <CardTitle>Documentos por Ano de Arquivamento</CardTitle>
            <CardDescription>Quantidade de documentos arquivados por ano.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{YearChart}</CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos por Ano de Eliminação Previsto", "Quantidade de documentos com previsão de eliminação por ano.", 'anoEliminacao')}>
          <CardHeader>
            <CardTitle>Documentos por Ano de Eliminação Previsto</CardTitle>
            <CardDescription>Quantidade de documentos com previsão de eliminação por ano.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{AnoEliminacaoChart}</CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos Eliminados por Ano", "Quantidade de documentos efetivamente eliminados por ano.", 'eliminadoPorAno')}>
          <CardHeader>
            <CardTitle>Documentos Eliminados por Ano</CardTitle>
            <CardDescription>Quantidade de documentos efetivamente eliminados por ano.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">{EliminadoPorAnoChart}</CardContent>
        </Card>
      </div>

       <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg lg:col-span-1" onClick={() => handleChartClick("Top 10 Classificações", "Classificações com o maior número de documentos.", 'classification')}>
          <CardHeader>
            <CardTitle>Top 10 Classificações</CardTitle>
            <CardDescription>Classificações com o maior número de documentos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">{ClassificationChart}</CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg lg:col-span-1" onClick={() => handleChartClick("Top 10 Espécies Documentais", "Espécies de documento com a maior quantidade no acervo.", 'tipoDocumento')}>
          <CardHeader>
            <CardTitle>Top 10 Espécies Documentais</CardTitle>
            <CardDescription>Espécies de documento com a maior quantidade no acervo.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">{TipoDocumentoChart}</CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos Emprestados por Setor/Ano", "Quantidade de documentos emprestados, agrupados por setor solicitante e ano da solicitação.", 'emprestimoPorSetor')}>
          <CardHeader>
            <CardTitle>Empréstimos por Setor e Ano</CardTitle>
            <CardDescription>Documentos emprestados por setor solicitante ao longo dos anos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {EmprestimoPorSetorChart}
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos Desarquivados por Setor/Ano", "Quantidade de documentos desarquivados, agrupados por setor solicitante e ano da solicitação.", 'desarquivamentoPorSetor')}>
          <CardHeader>
            <CardTitle>Desarquivamentos por Setor e Ano</CardTitle>
            <CardDescription>Documentos desarquivados por setor solicitante ao longo dos anos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {DesarquivamentoPorSetorChart}
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => handleChartClick("Documentos Transferidos por Setor/Ano", "Quantidade de documentos recebidos em transferência, agrupados por setor remetente e ano.", 'transferenciaPorSetor')}>
          <CardHeader>
            <CardTitle>Transferências por Setor e Ano</CardTitle>
            <CardDescription>Documentos recebidos por setor remetente ao longo dos anos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {TransferenciaPorSetorChart}
          </CardContent>
        </Card>
      </div>

       <Dialog open={!!modalContent} onOpenChange={(isOpen) => !isOpen && setModalContent(null)}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{modalContent?.title}</DialogTitle>
                    <DialogDescription>{modalContent?.description}</DialogDescription>
                </DialogHeader>
                <div className="flex-grow min-h-0" ref={chartRef}>
                    {modalContent?.chartType === 'status' && StatusChart}
                    {modalContent?.chartType === 'year' && YearChart}
                    {modalContent?.chartType === 'anoEliminacao' && AnoEliminacaoChart}
                    {modalContent?.chartType === 'destinacao' && DestinacaoChart}
                    {modalContent?.chartType === 'meio' && MeioChart}
                    {modalContent?.chartType === 'categoria' && CategoriaChart}
                    {modalContent?.chartType === 'destinacaoCaixa' && DestinacaoCaixaChart}
                    {modalContent?.chartType === 'condicaoCaixa' && CondicaoCaixaChart}
                    {modalContent?.chartType === 'situacaoCaixa' && SituacaoCaixaChart}
                    {modalContent?.chartType === 'classification' && ClassificationChart}
                    {modalContent?.chartType === 'tipoDocumento' && TipoDocumentoChart}
                    {modalContent?.chartType === 'emprestimoPorSetor' && EmprestimoPorSetorChart}
                    {modalContent?.chartType === 'eliminadoPorAno' && EliminadoPorAnoChart}
                    {modalContent?.chartType === 'desarquivamentoPorSetor' && DesarquivamentoPorSetorChart}
                    {modalContent?.chartType === 'transferenciaPorSetor' && TransferenciaPorSetorChart}
                </div>
                <DialogFooter className="sm:justify-end shrink-0 pt-4">
                    <Button type="button" variant="outline" onClick={() => setModalContent(null)}>Fechar</Button>
                    <Button type="button" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Baixar Gráfico
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
