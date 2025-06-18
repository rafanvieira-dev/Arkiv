
export interface Documento {
  id: string;
  identificador: string;
  status: 'Arquivado' | 'Emprestado' | 'Desarquivado' | 'Eliminado';
  origem: string;
  tipoMeio: 'Papel' | 'Digital' | 'Microfilme' | string;
  generoDocumental: 'Textual' | 'Iconográfico' | 'Audiovisual' | string;
  categoria: string;
  tipoDocumento: string;
  dataDocumento: string; // ISO Date string
  dataLimite?: string; // ISO Date string
  volume?: string;
  apenso?: string;
  midia?: string;
  digitalizacao: boolean;
  classificacaoArquivisticaId: string; // FK to Classificacao
  partes?: string;
  segredoJustica: boolean;
  grauSigilo: 'Público' | 'Reservado' | 'Secreto' | string;
  codigoCaixa: string; // FK to Caixa
  codigoAtoM?: string;
  documentosRelacionadosIds?: string[]; // Array of Documento IDs
  observacoes?: string;
  dataCadastro: string; // ISO Date string
}

export interface Classificacao {
  id: string;
  codigo: string;
  descricao: string;
  tabelaTemporalidade?: string;
  prazoGuardaFaseCorrente?: string;
  prazoGuardaFaseIntermediaria?: string;
  destinacaoFinal: 'Eliminação' | 'Guarda Permanente' | string;
  observacoes?: string;
}

export interface ClasseJudicial {
  id: string;
  codigo: string;
  descricao: string;
  tabelaTemporalidade?: string;
  prazoGuarda?: string;
  observacoes?: string;
}

export interface ListagemEliminacao {
  id: string;
  numeroListagem: string;
  documentoIds: string[]; // Array of Documento IDs
  numeroEditalCiencia?: string;
  dataPublicacaoEdital?: string; // ISO Date string
  dataProducaoListagem: string; // ISO Date string
  numeroTermoEliminacao?: string;
}

export interface Solicitacao {
  id: string;
  numeroSolicitacao: string;
  nomeSolicitante: string;
  contatoSolicitante?: string;
  unidadeSetorSolicitante?: string;
  dataSolicitacao: string; // ISO Date string
  dataAtendimento?: string; // ISO Date string
  dataDevolucao?: string; // ISO Date string
  documentoIds: string[]; // Array of Documento IDs
  status: 'Pendente' | 'Atendida' | 'Devolvido' | 'Cancelada';
  observacoes?: string;
}

export interface Caixa {
  id: string;
  codigoCaixa: string;
  descricao?: string;
  // Opções principais: “JUD”, “DOC”, “ADM”, “ADM/SIGA”, “JUD/APOLO”, “JUD/HÍBRIDO”
  // Permitir string para tipos personalizados.
  tipo: string; 
  status: 'Aberta' | 'Fechada'; // Alterado de 'Aberta' | 'Fechada' | 'Lacrada'
  localizacao?: string;
  situacao: 'Completa' | 'Incompleta'; // Alterado de 'Ativa' | 'Inativa'
  documentoIds?: string[]; // Array of Documento IDs
}

// For tables and lists
export type DataTableColumn<T> = {
  accessorKey: keyof T | string;
  header: string;
  cell?: (props: any) => React.ReactNode;
};
