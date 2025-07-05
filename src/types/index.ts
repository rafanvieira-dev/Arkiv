

export interface ParteDetalhe {
  id: string;
  nome: string;
  cpfCnpj?: string;
  iniciais?: string;
}

export interface ParteDocumento {
  id: string; // UUID for the part entry itself
  nome: string;
  cpfCnpj?: string;
  tipoParte: string; // "Autor", "Réu", etc. - allow custom
  usarIniciais?: boolean;
}

export interface MidiaDetalhe {
  id: string;
  tipoMidia?: string;
  numeroMidia?: string;
  paginaMidia?: string;
  caixaMidia?: string;
}

export interface TipoOrigem {
  id: string;
  nome: string;
  sigla?: string;
}

export interface Documento {
  id:string; // UUID, system-generated, read-only for user. Visível, mas não alterável.
  status: 'Arquivado' | 'Eliminado' | 'Emprestado' | 'Desarquivado' | 'Aguardando prazo para eliminação' | 'Pendente de Conferência'; // 1.2
  orgao: 'TRF2' | 'SJRJ' | 'SJES'; // 1.3
  origem: string; // 1.C - Campo para cadastramento da origem. Cada origem cadastrada ficará gravada no sistema, e o usuário poderá escolher
  tipoMeio: 'Não digital' | 'Digital' | 'Híbrido'; // 1.4
  generoDocumental: string; // 1.5 - Opção padrão "Textual"
  categoria: 'Documento' | 'Dossiê' | 'Processo Judicial' | 'Processo Administrativo'; // 1.6 - Opção padrão "Documento"
  tipoDocumento: string; // 1.7 - Campo para cadastramento do Tipo de Documento.
  numeroDocumento?: string; // 1.8
  processoOriginario?: string;
  numeroAntigo?: string;
  dataAbrangente?: string; // 1.9 - Pode ser data completa, mês/ano, ou um intervalo. Ex.: 01/2023 – 12/2024
  descricaoDocumento?: string; // 1.21 - Antigo 'observacoes' ou campo principal de descrição.
  partes?: ParteDocumento[]; // 1.29 - Replaces nomePartePrincipal, etc.
  documentosRelacionadosIds?: string; // 1.34 - Simplificado para string (separada por vírgula)
  dataArquivamento?: string; // 1.10 - ISO Date string
  quantidadeVolumes?: number; // 1.11
  quantidadeApensos?: number; // 1.12
  numerosApensos?: string; // 1.13 - Simplificado para string por agora
  totalMidias?: number; // 1.14
  midias?: MidiaDetalhe[];
  
  digitalizado: 'Sim' | 'Não'; // 1.18
  tipoBaixa?: string; // 1.19
  dataBaixa?: string; // 1.20 - ISO Date string
  classificacaoArquivisticaId?: string; // 1.22 - FK to Classificacao
  
  // Campos para exibição, populados a partir da Classificação (manuais por enquanto)
  prazoArquivoCorrenteDisplay?: string; // 1.23
  prazoArquivoIntermediarioDisplay?: string; // 1.24
  destinacaoFinalDisplay?: 'Eliminação' | 'Guarda Permanente' | 'Vide Guia de Aplicação' | 'Não se Aplica' | string; // 1.25

  alteracaoDestinacaoFinal: 'Não Alterar' | 'Guarda Permanente – Guarda Amostral' | 'Guarda Permanente – Decisão da CPAD'; // 1.26 - Opção padrão “Não Alterar”
  anoEliminacaoPrevisto?: string; // 1.27 - Calculado
  necessidadeReclassificacao?: 'Sim' | 'Não';
  
  segredoJustica: 'Sim' | 'Não'; // 1.30 - Opção padrão “Não”
  grauSigilo: 'Ostensivo' | 'Reservado' | 'Secreto' | 'Ultrassecreto'; // 1.31 - Opção padrão “Ostensivo” (LAI)
  
  codigosCaixa?: string; // 1.32 - Simplificado para string (separada por vírgula) por agora
  codigoAtoM?: string; // 1.33
  observacoesGerais?: string; // 1.35
  codigoClassificacaoJudicialId?: string; // 1.36 - Habilitado se categoria for "Processo Judicial"
  numeroListagemEliminacao?: string; // New field for elimination list number
  numeroDocumentoTransferencia?: string;
  dataCadastro: string; // ISO Date string - system set (não é campo de formulário direto)
}

export interface Classificacao {
  id: string;
  codigo: string; 
  descricao: string; 
  tipoPlanoClassificacao: 'Administrativo' | 'Judicial';
  status: 'Ativo' | 'Inativo' | 'Pendente de Complemento';
  tipoPrazoFaseCorrente?: 'Anos' | 'Condição Textual';
  prazoGuardaFaseCorrenteAnos?: number;
  prazoGuardaFaseCorrenteCondicaoTextual?: string;
  prazoGuardaFaseIntermediariaAnos: number; 
  destinacaoFinal: 'Eliminação' | 'Guarda Permanente' | 'Vide Guia de Aplicação' | 'Não se Aplica'; 
  observacoes?: string;
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
  numeroListagem: string; // 3.1
  documentoIds: string[]; // 3.2 (parsed from comma-separated string)
  numeroEditalCiencia?: string; // 3.3
  dataPublicacaoEdital?: string; // 3.4 (ISO Date string)
  numeroTermoEliminacao?: string; // 3.5
  dataProducaoListagem: string; // Existing field: Date of listing production
  dataProducaoTermoEliminacao?: string; // 3.6 (ISO Date string) - Date of Termo production
  observacoes?: string; // New field for observations
}

export interface Solicitacao {
  id: string;
  numeroSolicitacao: string;
  nomeSolicitante: string;
  setorSolicitante?: string;
  siglaServidor?: string;
  matriculaSolicitante?: string;
  ramal?: string;
  emailContato?: string;
  tipo: 'Empréstimo' | 'Desarquivamento';
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
  proveniencia?: string;
  tipo: string;
  status: 'Aberta' | 'Fechada';
  predio?: string;
  sala?: string;
  estante?: string;
  prateleira?: string;
  situacao: 'Completa' | 'Incompleta';
  condicao: 'Ocupada' | 'Vazia';
  documentoIds?: string[];
  observacoes?: string;
  anosArquivamento?: string;
  prazosGuarda?: string;
  anosEliminacao?: string;
}

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string; // Used as login
  senhaHash: string; // Not the actual password
  sigla?: string;
  setor?: string;
  statusAprovacao: 'Aprovado' | 'Pendente' | 'Reprovado';
  tipoUsuario: 'Administrador' | 'Padrão';
  permissoes: {
    dashboard: boolean;
    acervo: boolean;
    caixas: boolean;
    classificacao: boolean;
    classesJudiciais: boolean;
    listagens: boolean;
    solicitacoes: boolean;
    buscaAvancada: boolean;
    transferencias: boolean;
    usuarios: boolean;
    configuracoes: boolean;
    estatisticas: boolean;
    relatorios: boolean;
    auditoria: boolean;
    manual: boolean;
    exclusaoDados: boolean;
  };
}


export type DataTableColumn<T> = {
  accessorKey: keyof T | string;
  header: string;
  cell?: (props: any) => React.ReactNode;
};


export interface DocumentoTransferencia {
  id: string; 
  categoria: Documento['categoria'];
  codigoClassificacao?: string; 
  descricao?: string;
  dataAbrangente?: string;
  numeroDocumento?: string;
  quantidadeVolumes?: number;
  quantidadeApensos?: number;
  numerosApensos?: string;
  digitalizado: Documento['digitalizado'];
  observacoesGerais?: string;
}

export interface Transferencia {
  id: string;
  nomeServidor: string;
  matricula: string;
  ramal?: string;
  setorRemetente: string;
  dataTransferencia: string;
  status: 'Pendente' | 'Aprovada' | 'Reprovada';
  documentos: DocumentoTransferencia[];
  observacoes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO Date string
  userId: string;
  userName: string;
  action: string; // e.g., "CREATE_DOCUMENT", "UPDATE_USER"
  details: Record<string, any>; // e.g., { documentId: 'DOC123', fieldsChanged: ['status'] }
}
