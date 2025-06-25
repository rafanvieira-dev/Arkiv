
"use client";

import * as React from "react";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Documento, Classificacao, Caixa } from "@/types";
import { getYear, parseISO, isValid } from "date-fns";
import { placeholderDocumentos, initialClassificacoes, initialCaixas } from "@/lib/mock-data";

const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';
const CAIXAS_STORAGE_KEY = 'arquivocentral_caixas';


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

// A single custom tooltip component for all charts
const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const { name, value } = data;
      const { percentage, fill } = data.payload;
  
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
          <div className="font-bold text-foreground mb-1">{label || name}</div>
          <div className="flex items-center text-muted-foreground">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-2"
              style={{ backgroundColor: fill }}
            />
            <div>
              <span className="font-medium text-foreground">{value}</span>
              {percentage !== undefined && (
                <span className="ml-1 text-xs">({percentage.toFixed(1)}%)</span>
              )}
            </div>
          </div>
        </div>
      );
    }
  
    return null;
  };

export default function EstatisticasPage() {
  const [statusData, setStatusData] = React.useState<ChartData[]>([]);
  const [yearData, setYearData] = React.useState<ChartData[]>([]);
  const [anoEliminacaoData, setAnoEliminacaoData] = React.useState<ChartData[]>([]);
  const [destinacaoData, setDestinacaoData] = React.useState<ChartData[]>([]);
  const [meioData, setMeioData] = React.useState<ChartData[]>([]);
  const [classificationData, setClassificationData] = React.useState<ChartData[]>([]);
  const [tipoDocumentoData, setTipoDocumentoData] = React.useState<ChartData[]>([]);
  const [destinacaoCaixaData, setDestinacaoCaixaData] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [statusChartConfig, setStatusChartConfig] = React.useState<ChartConfig>({});
  const [destinacaoChartConfig, setDestinacaoChartConfig] = React.useState<ChartConfig>({});
  const [meioChartConfig, setMeioChartConfig] = React.useState<ChartConfig>({});
  const [destinacaoCaixaChartConfig, setDestinacaoCaixaChartConfig] = React.useState<ChartConfig>({});

  React.useEffect(() => {
    try {
      const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      const allDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
      const totalDocs = allDocs.length;
      
      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      const allClassificacoes: Classificacao[] = storedClassificacoes ? JSON.parse(storedClassificacoes) : initialClassificacoes;
      
      const storedCaixas = window.localStorage.getItem(CAIXAS_STORAGE_KEY);
      const allCaixas: Caixa[] = storedCaixas ? JSON.parse(storedCaixas) : initialCaixas;

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


    } catch (error) {
      console.error("Failed to process chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-2"><PageHeader title="Carregando Estatísticas..." /></div>;
  }
  
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Estatísticas do Acervo" description="Visualização de dados e métricas sobre os documentos arquivados." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Status</CardTitle>
            <CardDescription>Distribuição dos documentos com base no status atual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<CustomTooltipContent />} />
                <Pie 
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={({ percentage }) => `${percentage?.toFixed(1)}%`}
                >
                    {statusData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos por Ano de Arquivamento</CardTitle>
            <CardDescription>Quantidade de documentos arquivados por ano.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <BarChart data={yearData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} name="Documentos"/>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos por Ano de Eliminação Previsto</CardTitle>
            <CardDescription>Quantidade de documentos com previsão de eliminação por ano.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <BarChart data={anoEliminacaoData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} name="Documentos"/>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Destinação Final</CardTitle>
            <CardDescription>Distribuição conforme a destinação final prevista.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={destinacaoChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<CustomTooltipContent />} />
                <Pie 
                    data={destinacaoData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    labelLine={false}
                    label={({ percentage }) => `${percentage?.toFixed(1)}%`}
                >
                   {destinacaoData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Tipo de Meio</CardTitle>
            <CardDescription>Distribuição entre meios físico, digital e híbrido.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={meioChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<CustomTooltipContent />} />
                <Pie
                    data={meioData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={({ percentage }) => `${percentage?.toFixed(1)}%`}
                >
                     {meioData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caixas por Destinação de Conteúdo</CardTitle>
            <CardDescription>Distribuição de caixas com base na destinação dos documentos.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={destinacaoCaixaChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<CustomTooltipContent />} />
                <Pie 
                    data={destinacaoCaixaData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={({ percentage }) => `${percentage?.toFixed(1)}%`}
                >
                   {destinacaoCaixaData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Classificações</CardTitle>
            <CardDescription>Classificações com o maior número de documentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[350px] w-full">
              <BarChart data={classificationData} margin={{ top: 5, right: 20, left: 0, bottom: 100 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  angle={-60}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<CustomTooltipContent />}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={4} name="Documentos" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Espécies Documentais</CardTitle>
            <CardDescription>Espécies de documento com a maior quantidade no acervo.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[350px] w-full">
              <BarChart data={tipoDocumentoData} margin={{ top: 5, right: 20, left: 0, bottom: 100 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  angle={-60}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<CustomTooltipContent />}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={4} name="Documentos" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
