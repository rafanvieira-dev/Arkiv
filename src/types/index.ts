
export interface ParteDocumento {
  id: string; // UUID for the part entry itself
  nome: string;
  cpfCnpj?: string;
  tipoParte: string; // "Autor", "Réu", etc. - allow custom
}

export interface MidiaDetalhe {
  id: string; // UUID for the midia entry
  tipoMidia: "CD-R" | "CD-RW" | "DVD-R" | "DVD-RW" | "Disquete" | "Pen Drive" | "HD" | string; // Allow "Outro"
  numeroMidia?: string;
  paginaMidia?: string;
}

export interface Documento {
  id: string; // UUID, system-generated, read-only for user. Visível, mas não alterável.
  status: 'Arquivado' | 'Eliminado' | 'Emprestado' | 'Desarquivado' | 'Aguardando prazo para eliminação'; // 1.2
  orgao: 'TRF2' | 'SJRJ' | 'SJES'; // 1.3
  origem: string; // 1.C - Campo para cadastramento da origem. Cada origem cadastrada ficará gravada no sistema, e o usuário poderá escolher
  tipoMeio: 'Não digital' | 'Digital' | 'Híbrido'; // 1.4
  generoDocumental: 'Textual' | 'Iconográfico' | 'Cartográfico' | 'Sonoro' | 'Filmográfico' | 'Audiovisual' | string; // 1.5 - Opção padrão "Textual"
  categoria: 'Documento' | 'Dossiê' | 'Processo Judicial' | 'Processo Administrativo'; // 1.6 - Opção padrão "Documento"
  tipoDocumento: string; // 1.7 - Campo para cadastramento do Tipo de Documento.
  numeroDocumento?: string; // 1.8
  dataAbrangente?: string; // 1.9 - Pode ser data completa, mês/ano, ou um intervalo. Ex.: 01/2023 – 12/2024
  dataArquivamento?: string; // 1.10 - ISO Date string
  quantidadeVolumes?: number; // 1.11
  quantidadeApensos?: number; // 1.12
  numerosApensos?: string; // 1.13 - Simplificado para string por agora
  totalMidias?: number; // 1.14
  // Campos para uma mídia, simplificado:
  tipoMidiaDetalhe?: "CD-R" | "CD-RW" | "DVD-R" | "DVD-RW" | "Disquete" | "Pen Drive" | "HD" | string; // 1.15
  outroTipoMidiaDetalhe?: string;
  numeroMidiaDetalhe?: string; // 1.16
  paginaMidiaDetalhe?: string; // 1.17
  
  digitalizado: 'Sim' | 'Não'; // 1.18
  tipoBaixa?: string; // 1.19
  dataBaixa?: string; // 1.20 - ISO Date string
  descricaoDocumento?: string; // 1.21 - Antigo 'observacoes' ou campo principal de descrição.
  classificacaoArquivisticaId?: string; // 1.22 - FK to Classificacao

  // Campos para exibição, populados a partir da Classificação (manuais por enquanto)
  prazoArquivoCorrenteDisplay?: string; // 1.23
  prazoArquivoIntermediarioDisplay?: string; // 1.24
  destinacaoFinalDisplay?: 'Eliminação' | 'Guarda Permanente' | string; // 1.25

  alteracaoDestinacaoFinal: 'Não Alterar' | 'Guarda Permanente – Guarda Amostral' | 'Guarda Permanente – Decisão da CPAD'; // 1.26 - Opção padrão “Não Alterar”
  anoEliminacaoPrevisto?: string; // 1.27 - Calculado

  historicoClassificacoesArquivisticas?: string[]; // 1.28 - System-managed log (não é campo de formulário direto)

  // Simplificado para Partes (1.29)
  nomePartePrincipal?: string;
  tipoPartePrincipal?: string; // Lista extensa, permitir "Outro"
  outroTipoPartePrincipal?: string;
  // partes?: ParteDocumento[]; // Estrutura completa para o futuro

  segredoJustica: 'Sim' | 'Não'; // 1.30 - Opção padrão “Não”
  grauSigilo: 'Ostensivo' | 'Reservado' | 'Secreto' | 'Ultrassecreto'; // 1.31 - Opção padrão “Ostensivo” (LAI)
  
  codigosCaixa?: string; // 1.32 - Simplificado para string (separada por vírgula) por agora
  codigoAtoM?: string; // 1.33
  documentosRelacionadosIds?: string; // 1.34 - Simplificado para string (separada por vírgula)
  observacoesGerais?: string; // 1.35
  codigoClassificacaoJudicialId?: string; // 1.36 - FK to ClasseJudicial, habilitado se categoria for "Processo Judicial"
  
  classificacaoInativa?: boolean; 
  dataCadastro: string; // ISO Date string - system set (não é campo de formulário direto)
}

export interface Classificacao {
  id: string;
  codigo: string; 
  descricao: string; 
  tipoPrazoFaseCorrente?: 'Anos' | 'Condição Textual';
  prazoGuardaFaseCorrenteAnos?: number;
  prazoGuardaFaseCorrenteCondicaoTextual?: string;
  prazoGuardaFaseIntermediariaAnos: number; 
  destinacaoFinal: 'Eliminação' | 'Guarda Permanente'; 
  observacoes?: string;
  inativo: boolean; 
}

export interface ClasseJudicial {
  id: string;
  codigo: string; 
  descricao: string; 
  prazoGuardaAnos?: number; 
  destinacaoFinal: 'Não se Aplica' | 'Vide Guia de Aplicação' | 'Eliminação' | 'Guarda Permanente'; 
  observacoes?: string;
  inativo: boolean; 
}

export interface ListagemEliminacao {
  id: string;
  numeroListagem: string;
  documentoIds: string[]; 
  numeroEditalCiencia?: string;
  dataPublicacaoEdital?: string; 
  dataProducaoListagem: string; 
  numeroTermoEliminacao?: string;
}

export interface Solicitacao {
  id: string;
  numeroSolicitacao: string;
  nomeSolicitante: string;
  contatoSolicitante?: string;
  unidadeSetorSolicitante?: string;
  dataSolicitacao: string; 
  dataAtendimento?: string; 
  dataDevolucao?: string; 
  documentoIds: string[]; 
  status: 'Pendente' | 'Atendida' | 'Devolvido' | 'Cancelada';
  observacoes?: string;
}

export interface Caixa {
  id: string;
  codigoCaixa: string;
  descricao?: string;
  tipo: string; 
  status: 'Aberta' | 'Fechada';
  localizacao?: string;
  situacao: 'Completa' | 'Incompleta';
  documentoIds?: string[];
}

export type DataTableColumn<T> = {
  accessorKey: keyof T | string;
  header: string;
  cell?: (props: any) => React.ReactNode;
};
