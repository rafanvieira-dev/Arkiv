
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Send } from "lucide-react";
import { DateInputPicker } from "@/components/date-input-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Transferencia, DocumentoTransferencia, Classificacao } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const TRANSFERENCIAS_STORAGE_KEY = 'arquivocentral_transferencias';
const CLASSIFICACOES_STORAGE_KEY = 'arquivocentral_classificacoes';

type FormDoc = Omit<DocumentoTransferencia, 'id'>;

const createEmptyDoc = (): FormDoc => ({
    categoria: "Documento",
    codigoClassificacao: "",
    descricao: "",
    dataAbrangente: "",
    numeroDocumento: "",
    quantidadeVolumes: 0,
    quantidadeApensos: 0,
    numerosApensos: "",
    digitalizado: "Não",
    observacoesGerais: "",
});

export default function TransferenciasPage() {
    const { toast } = useToast();
    
    const [nomeServidor, setNomeServidor] = React.useState("");
    const [matricula, setMatricula] = React.useState("");
    const [ramal, setRamal] = React.useState("");
    const [setorRemetente, setSetorRemetente] = React.useState("");
    const [dataTransferencia, setDataTransferencia] = React.useState<Date | undefined>(new Date());
    const [documentos, setDocumentos] = React.useState<FormDoc[]>([createEmptyDoc()]);
    
    const [classificacoes, setClassificacoes] = React.useState<Classificacao[]>([]);

    React.useEffect(() => {
        try {
            const storedClassificacoes = window.localStorage.getItem(CLASSIFICACOES_STORAGE_KEY);
            if (storedClassificacoes) setClassificacoes(JSON.parse(storedClassificacoes));
        } catch (error) {
            console.error("Failed to read classificacoes from localStorage:", error);
        }
    }, []);

    const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCount = parseInt(e.target.value, 10);
        if (isNaN(newCount) || newCount < 1) {
            setDocumentos([createEmptyDoc()]);
            return;
        }
        if (newCount > 50) { // Safety limit
            toast({ variant: "destructive", title: "Limite excedido", description: "Não é possível adicionar mais de 50 documentos por transferência."});
            return;
        }

        const currentCount = documentos.length;
        if (newCount > currentCount) {
            const newDocs = Array(newCount - currentCount).fill(null).map(() => createEmptyDoc());
            setDocumentos(prev => [...prev, ...newDocs]);
        } else if (newCount < currentCount) {
            setDocumentos(prev => prev.slice(0, newCount));
        }
    };

    const handleDocChange = (index: number, field: keyof FormDoc, value: any) => {
        const newDocumentos = [...documentos];
        const docToUpdate = { ...newDocumentos[index], [field]: value };
        newDocumentos[index] = docToUpdate;
        setDocumentos(newDocumentos);
    };

    const handleNumericDocChange = (index: number, field: keyof FormDoc, value: string) => {
        const numValue = value === "" ? 0 : parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            handleDocChange(index, field, numValue);
        }
    };

    const handleSubmit = () => {
        if (!nomeServidor || !matricula || !setorRemetente || !dataTransferencia) {
            toast({ variant: "destructive", title: "Campos obrigatórios", description: "Por favor, preencha os dados do servidor e a data da transferência."});
            return;
        }
        if(documentos.some(d => !d.codigoClassificacao || !d.descricao)) {
            toast({ variant: "destructive", title: "Campos obrigatórios", description: "Para cada documento, o código de classificação e a descrição são obrigatórios."});
            return;
        }

        const novaTransferencia: Transferencia = {
            id: `TRANSF_${Date.now()}`,
            nomeServidor,
            matricula,
            ramal,
            setorRemetente,
            dataTransferencia: dataTransferencia.toISOString(),
            status: "Pendente",
            documentos: documentos.map((doc, index) => ({ ...doc, id: `DOC_T_${Date.now()}_${index}` })),
        };
        
        try {
            const stored = window.localStorage.getItem(TRANSFERENCIAS_STORAGE_KEY);
            const transferencias: Transferencia[] = stored ? JSON.parse(stored) : [];
            transferencias.push(novaTransferencia);
            window.localStorage.setItem(TRANSFERENCIAS_STORAGE_KEY, JSON.stringify(transferencias));
            
            toast({ title: "Sucesso!", description: `Transferência registrada com o ID ${novaTransferencia.id} e aguardando aprovação.`});
            resetForm();
        } catch(error) {
            console.error("Failed to save transfer to localStorage", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar a transferência." });
        }
    };

    const resetForm = () => {
        setNomeServidor("");
        setMatricula("");
        setRamal("");
        setSetorRemetente("");
        setDataTransferencia(new Date());
        setDocumentos([createEmptyDoc()]);
    };

    const handleCodigoClassificacaoBlur = (index: number) => {
        const doc = documentos[index];
        const found = classificacoes.find(c => c.codigo === doc.codigoClassificacao && !c.inativo);
        if (!found && doc.codigoClassificacao) {
            toast({
                variant: "destructive",
                title: `Código de Classificação Inválido (Doc ${index + 1})`,
                description: "O código digitado não foi encontrado ou está inativo. Por favor, verifique.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-muted flex flex-col items-center p-4">
            <div className="w-full max-w-6xl">
                <PageHeader title="Registro de Transferência de Documentos" description="Preencha o formulário para registrar o recolhimento de documentos para o arquivo.">
                    <Link href="/login" passHref>
                        <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login</Button>
                    </Link>
                </PageHeader>
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Transferência</CardTitle>
                        <CardDescription>Informações sobre o servidor e setor que está realizando a transferência. Campos com * são obrigatórios.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomeServidor">Nome do Servidor*</Label>
                                <Input id="nomeServidor" value={nomeServidor} onChange={e => setNomeServidor(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="matricula">Matrícula*</Label>
                                <Input id="matricula" value={matricula} onChange={e => setMatricula(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ramal">Ramal</Label>
                                <Input id="ramal" value={ramal} onChange={e => setRamal(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="setorRemetente">Setor Remetente*</Label>
                                <Input id="setorRemetente" value={setorRemetente} onChange={e => setSetorRemetente(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dataTransferencia">Data da Transferência*</Label>
                                <DateInputPicker value={dataTransferencia} onChange={setDataTransferencia} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantidadeDocumentos">Quantidade de Documentos*</Label>
                                <Input id="quantidadeDocumentos" type="number" min="1" max="50" value={documentos.length} onChange={handleQuantidadeChange} />
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <CardTitle>Detalhes dos Documentos Encaminhados</CardTitle>
                        <CardDescription>Preencha as informações para cada documento a ser transferido.</CardDescription>

                        <ScrollArea className="h-[450px] w-full mt-4 pr-4">
                            <div className="space-y-6">
                                {documentos.map((doc, index) => (
                                    <Card key={index} className="p-4 bg-muted/50">
                                        <CardHeader className="p-0 pb-4">
                                            <CardTitle className="text-lg">Documento {index + 1}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`categoria-${index}`}>Categoria*</Label>
                                                <Select value={doc.categoria} onValueChange={(value) => handleDocChange(index, 'categoria', value)}>
                                                    <SelectTrigger id={`categoria-${index}`}><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Documento">Documento</SelectItem>
                                                        <SelectItem value="Dossiê">Dossiê</SelectItem>
                                                        <SelectItem value="Processo Judicial">Processo Judicial</SelectItem>
                                                        <SelectItem value="Processo Administrativo">Processo Administrativo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor={`codigoClassificacao-${index}`}>Código de Classificação*</Label>
                                                <Input id={`codigoClassificacao-${index}`} value={doc.codigoClassificacao} onChange={(e) => handleDocChange(index, 'codigoClassificacao', e.target.value)} onBlur={() => handleCodigoClassificacaoBlur(index)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`numeroProcesso-${index}`}>Número do Processo/Documento</Label>
                                                <Input id={`numeroProcesso-${index}`} value={doc.numeroDocumento} onChange={(e) => handleDocChange(index, 'numeroDocumento', e.target.value)} />
                                            </div>
                                             <div className="space-y-2 lg:col-span-3">
                                                <Label htmlFor={`descricao-${index}`}>Descrição*</Label>
                                                <Textarea id={`descricao-${index}`} value={doc.descricao} onChange={(e) => handleDocChange(index, 'descricao', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`periodo-${index}`}>Período (Data Abrangente)</Label>
                                                <Input id={`periodo-${index}`} value={doc.dataAbrangente} onChange={(e) => handleDocChange(index, 'dataAbrangente', e.target.value)} placeholder="Ex: 01/2023 – 12/2024" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`totalVolumes-${index}`}>Total de Volumes</Label>
                                                <Input id={`totalVolumes-${index}`} type="number" value={doc.quantidadeVolumes} onChange={(e) => handleNumericDocChange(index, 'quantidadeVolumes', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`totalApensos-${index}`}>Total de Apensos</Label>
                                                <Input id={`totalApensos-${index}`} type="number" value={doc.quantidadeApensos} onChange={(e) => handleNumericDocChange(index, 'quantidadeApensos', e.target.value)} />
                                            </div>
                                            {doc.quantidadeApensos && doc.quantidadeApensos > 0 && (
                                                <div className="space-y-2">
                                                    <Label htmlFor={`numeroApensos-${index}`}>Número dos Apensos</Label>
                                                    <Input id={`numeroApensos-${index}`} value={doc.numerosApensos} onChange={(e) => handleDocChange(index, 'numerosApensos', e.target.value)} />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label htmlFor={`digitalizado-${index}`}>Digitalizado*</Label>
                                                <Select value={doc.digitalizado} onValueChange={(value) => handleDocChange(index, 'digitalizado', value)}>
                                                    <SelectTrigger id={`digitalizado-${index}`}><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Não">Não</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                                <Label htmlFor={`observacoes-${index}`}>Observações</Label>
                                                <Textarea id={`observacoes-${index}`} value={doc.observacoesGerais} onChange={(e) => handleDocChange(index, 'observacoesGerais', e.target.value)} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>

                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSubmit} size="lg"><Send className="mr-2 h-4 w-4" /> Enviar Transferência</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
