
"use client";

import * as React from "react";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Documento, Classificacao } from "@/types";
import { getYear, parseISO, isValid } from "date-fns";
import { placeholderDocumentos, initialClassificacoes } from "@/lib/mock-data";

const DOCUMENTOS_STORAGE_KEY = 'arquivocentral_documentos';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';


interface ChartData {
  name: string;
  value: number;
  fill: string;
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

export default function EstatisticasPage() {
  const [statusData, setStatusData] = React.useState<ChartData[]>([]);
  const [yearData, setYearData] = React.useState<ChartData[]>([]);
  const [anoEliminacaoData, setAnoEliminacaoData] = React.useState<ChartData[]>([]);
  const [destinacaoData, setDestinacaoData] = React.useState<ChartData[]>([]);
  const [meioData, setMeioData] = React.useState<ChartData[]>([]);
  const [classificationData, setClassificationData] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    try {
      const storedDocs = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
      const allDocs: Documento[] = storedDocs ? JSON.parse(storedDocs) : placeholderDocumentos;
      
      const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
      const allClassificacoes: Classificacao[] = storedClassificacoes ? JSON.parse(storedClassificacoes) : initialClassificacoes;

      // Process status data
      const statusCounts = allDocs.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const statusChartData = Object.entries(statusCounts).map(([name, value], index) => ({
        name,
        value,
        fill: chartColors[index % chartColors.length],
      }));
      setStatusData(statusChartData);
      
      // Process year data
      const yearCounts = allDocs.reduce((acc, doc) => {
        if (doc.dataArquivamento && isValid(parseISO(doc.dataArquivamento))) {
          const year = getYear(parseISO(doc.dataArquivamento)).toString();
          acc[year] = (acc[year] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const yearChartData = Object.entries(yearCounts)
        .map(([name, value], index) => ({ name, value, fill: "hsl(var(--chart-1))" }))
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
        .map(([name, value]) => ({ name, value, fill: "hsl(var(--chart-2))" }))
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
        fill: chartColors[index % chartColors.length],
      }));
      setDestinacaoData(destinacaoChartData);

      // Process tipo de meio data
      const meioCounts = allDocs.reduce((acc, doc) => {
          const meio = doc.tipoMeio || "Indefinido";
          acc[meio] = (acc[meio] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const meioChartData = Object.entries(meioCounts).map(([name, value], index) => ({
        name,
        value,
        fill: chartColors[index % chartColors.length],
      }));
      setMeioData(meioChartData);
      
      // Process classification data
      const classificationCounts = allDocs.reduce((acc, doc) => {
        if (doc.classificacaoArquivisticaId) {
          acc[doc.classificacaoArquivisticaId] = (acc[doc.classificacaoArquivisticaId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const classificationChartData = Object.entries(classificationCounts)
        .map(([id, value]) => {
            const classif = allClassificacoes.find(c => c.id === id);
            const name = classif ? `${classif.codigo} - ${classif.descricao}` : `ID: ${id}`;
            return { name, value, fill: "hsl(var(--chart-3))" };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      setClassificationData(classificationChartData);


    } catch (error) {
      console.error("Failed to process chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pieChartConfig = {
    value: { label: "Documentos" },
  } as ChartConfig;


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
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
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
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} />
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
             <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={destinacaoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} label>
                   {destinacaoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={meioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                     {meioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
