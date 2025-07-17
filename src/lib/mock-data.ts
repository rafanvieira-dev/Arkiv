

import type { Documento, ListagemEliminacao, Solicitacao, Usuario, Transferencia, Caixa, TipoOrigem, Classificacao, ParteDocumento, ParteDetalhe, MidiaDetalhe, ClasseJudicial, ApensoDetalhe, AprovacaoContas } from "@/types";
import { getYear, parseISO, isValid } from 'date-fns';

export const AUDIT_LOG_STORAGE_KEY = 'arquivocentral_audit_logs';

export const initialCaixas: Caixa[] = [
  { id: "CX001", codigoCaixa: "CX-A-001", descricao: "Caixa de processos judiciais antigos", tipo: "JUD", status: "Fechada", predio: "Sede", sala: "Arquivo Central", estante: "1", prateleira: "A", situacao: "Completa", condicao: "Ocupada", documentoIds: ["DOC001", "DOC003"] },
  { id: "CX002", codigoCaixa: "CX-B-015", descricao: "Documentos administrativos SIGA", tipo: "ADM/SIGA", status: "Aberta", predio: "Sede", sala: "Arquivo Central", estante: "2", prateleira: "C", situacao: "Incompleta", condicao: "Ocupada", documentoIds: ["DOC002"] },
  { id: "CX003", codigoCaixa: "PST-X-007", descricao: "Pastas de documentos diversos", tipo: "Pasta", status: "Aberta", predio: "Sede", sala: "Arquivo Corrente", estante: "5", prateleira: "B", situacao: "Completa", condicao: "Vazia" },
];

export const placeholderClassificacoesSimulado: Classificacao[] = [
  { id: "CLA001", codigo: "020.1", descricao: "Processos Judiciais Cíveis", status: "Ativo", prazoGuardaFaseIntermediariaAnos: 15, destinacaoFinal: 'Guarda Permanente' as const, tipoPrazoFaseCorrente: "Anos" as const, prazoGuardaFaseCorrenteAnos: 5, tipoPlanoClassificacao: "Judicial" },
  { id: "CLA002", codigo: "030.5", descricao: "Correspondências Recebidas", status: "Inativo", prazoGuardaFaseIntermediariaAnos: 3, destinacaoFinal: 'Eliminação' as const, tipoPrazoFaseCorrente: "Condição Textual" as const, prazoGuardaFaseCorrenteCondicaoTextual: "Até a próxima atualização", tipoPlanoClassificacao: "Administrativo" },
  { id: "CLA003", codigo: "045.2", descricao: "Relatórios Anuais", status: "Ativo", prazoGuardaFaseIntermediariaAnos: 0, destinacaoFinal: 'Guarda Permanente' as const, tipoPrazoFaseCorrente: "Anos" as const, prazoGuardaFaseCorrenteAnos: 1, tipoPlanoClassificacao: "Administrativo" },
];

export const simulatedListagensData: ListagemEliminacao[] = [
  { 
    id: "LE001", 
    numeroListagem: "LE-2023-001", 
    orgao: "Tribunal Regional Federal da 2ª Região (TRF2)",
    documentoIds: ["DOC001", "DOC007"], 
    dataPublicacaoEdital: new Date("2023-10-15").toISOString(),
    dataProducaoListagem: new Date("2023-09-30").toISOString(),
    numeroEditalCiencia: "EDITAL-005/2023",
    numeroTermoEliminacao: "TE-2023-001",
    dataProducaoTermoEliminacao: new Date("2023-11-01").toISOString(),
    tipoListagem: 'Processos Judiciais',
    unidadeSetor: '1ª Vara Federal',
    observacoes: 'Eliminação de processos cíveis antigos.'
  },
  { 
    id: "LE002", 
    numeroListagem: "LE-2024-001", 
    orgao: "Seção Judiciária do Rio de Janeiro (SJRJ)",
    documentoIds: ["DOC008"], 
    dataPublicacaoEdital: undefined,
    dataProducaoListagem: new Date("2024-02-10").toISOString(),
    tipoListagem: 'Documentos',
    unidadeSetor: 'Arquivo Central',
    observacoes: 'Listagem para documentos diversos.'
  },
  { 
    id: "LE003", 
    numeroListagem: "LE-2024-002", 
    orgao: "Seção Judiciária do Espírito Santo (SJES)",
    documentoIds: ["DOC005"], 
    dataPublicacaoEdital: new Date("2024-05-01").toISOString(),
    dataProducaoListagem: new Date("2024-04-15").toISOString(),
    numeroEditalCiencia: "EDITAL-001/2024",
    tipoListagem: 'Processos Judiciais',
    unidadeSetor: '2ª Vara Federal',
    observacoes: 'Edital publicado aguardando prazo.'
  },
];


export const placeholderDocumentos: Documento[] = [
  { 
    id: "DOC001", 
    status: "Arquivado", 
    orgao: "TRF2", 
    origem: "Tribunal de Justiça - TJ", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Ação Ordinária", 
    numeroDocumento: "PRC-2023-001", 
    processoOriginario: "0123456-78.2022.4.02.5101",
    numeroAntigo: "PA-2015-XYZ",
    dataAbrangente: "01/2023 - 03/2023",
    descricaoDocumento: "Processo referente à disputa contratual X. Este é um exemplo de descrição um pouco mais longa para testar o comportamento da célula na tabela.",
    partes: [{id: 'p1', nome: 'Empresa Exemplo Ltda', tipoParte: 'Autor', cpfCnpj: '12.345.678/0001-99', usarIniciais: true}],
    documentosRelacionadosIds: "DOC002,DOC003",
    dataArquivamento: new Date("2023-01-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    apensos: [],
    totalMidias: 0,
    midias: [],
    digitalizado: "Não", 
    tipoBaixa: "",
    dataBaixa: undefined,
    classificacaoArquivisticaId: "CLA001",
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2039",
    necessidadeReclassificacao: "Não", 
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX001", 
    codigoAtoM: "ATOM001",
    observacoesGerais: "Nenhuma observação específica para este documento de exemplo.",
    codigoClassificacaoJudicialId: "CJ001",
    numeroListagemEliminacao: "LE-2023-001",
    numeroDocumentoTransferencia: "",
    dataCadastro: new Date("2023-01-01T10:00:00Z").toISOString(), 
  },
  { 
    id: "DOC002", 
    status: "Emprestado", 
    orgao: "SJRJ", 
    origem: "Secretaria Municipal - SM", 
    tipoMeio: "Digital", 
    generoDocumental: "Audiovisual", 
    categoria: "Documento", 
    tipoDocumento: "Solicitação de Informações", 
    numeroDocumento: "OFC-2023-045", 
    processoOriginario: "",
    numeroAntigo: "",
    dataAbrangente: "20/03/2023",
    descricaoDocumento: "Ofício solicitando informações sobre o projeto Y.",
    partes: [{id: 'p2', nome: 'Maria Santos', tipoParte: 'Requerente', cpfCnpj: '123.456.789-00'}],
    documentosRelacionadosIds: "DOC001",
    dataArquivamento: new Date("2023-03-20").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 1,
    apensos: [{id: 'ap-d2-1', numeroApenso: 'AP001', caixaApenso: 'CX002'}],
    totalMidias: 1,
    midias: [{id: "m-d2-1", tipoMidia: 'DVD-R', numeroMidia: 'M001', paginaMidia: '1-10', caixaMidia: 'CX-MIDIA-01'}],
    digitalizado: "Sim", 
    tipoBaixa: "Devolvido ao Arquivo",
    dataBaixa: new Date("2023-04-10").toISOString(),
    classificacaoArquivisticaId: "CLA002", 
    prazoArquivoCorrenteDisplay: "Até a próxima atualização",
    prazoArquivoIntermediarioDisplay: "3 Anos",
    destinacaoFinalDisplay: "Eliminação",
    alteracaoDestinacaoFinal: "Não Alterar",
    anoEliminacaoPrevisto: "2027",
    necessidadeReclassificacao: "Sim",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX002", 
    codigoAtoM: "ATOM002",
    observacoesGerais: "Prioridade alta.",
    codigoClassificacaoJudicialId: "",
    numeroDocumentoTransferencia: "TRANSF_1717088500000",
    dataCadastro: new Date("2023-02-15T11:00:00Z").toISOString(), 
  },
  { 
    id: "DOC003", 
    status: "Arquivado", 
    orgao: "SJES", 
    origem: "Câmara de Vereadores - CV", 
    tipoMeio: "Híbrido", 
    generoDocumental: "Textual", 
    categoria: "Processo Administrativo", 
    tipoDocumento: "Comunicação Interna", 
    numeroDocumento: "MEM-2022-112", 
    processoOriginario: "",
    numeroAntigo: "CI-2022-050",
    dataAbrangente: "05/11/2022",
    descricaoDocumento: "Memorando sobre nova política interna.",
    partes: [{id: 'p3', nome: 'João da Silva', tipoParte: 'Interessado'}],
    documentosRelacionadosIds: "",
    dataArquivamento: new Date("2022-11-05").toISOString(), 
    quantidadeVolumes: 2,
    quantidadeApensos: 0,
    apensos: [],
    totalMidias: 2,
    midias: [
      {id: "m-d3-1", tipoMidia: "Pen Drive", numeroMidia: "M002", paginaMidia: "N/A", caixaMidia: "CX-MIDIA-02"},
      {id: "m-d3-2", tipoMidia: "Pen Drive", numeroMidia: "M003", paginaMidia: "N/A", caixaMidia: "CX-MIDIA-02"},
    ],
    digitalizado: "Sim", 
    tipoBaixa: "",
    dataBaixa: undefined,
    classificacaoArquivisticaId: "CLA003", 
    prazoArquivoCorrenteDisplay: "1 Ano",
    prazoArquivoIntermediarioDisplay: "0 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "",
    necessidadeReclassificacao: "Não",
    segredoJustica: "Sim", 
    grauSigilo: "Secreto", 
    codigosCaixa: "CX001, CX003", 
    codigoAtoM: "ATOM003",
    observacoesGerais: "Documento de acesso restrito.",
    codigoClassificacaoJudicialId: "",
    numeroDocumentoTransferencia: "",
    dataCadastro: new Date("2022-12-01T09:00:00Z").toISOString(), 
  },
   { 
    id: "DOC004", 
    status: "Eliminado", 
    orgao: "TRF2", 
    origem: "Advocacia Geral - AG", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Documento", 
    tipoDocumento: "Requerimento", 
    numeroDocumento: "REQ-2014-001", 
    processoOriginario: "9876543-21.2013.4.02.5101",
    numeroAntigo: "",
    dataAbrangente: "10/06/2014",
    descricaoDocumento: "Requerimento antigo, processo finalizado e eliminado.",
    partes: [{id: 'p4', nome: 'Empresa XYZ', tipoParte: 'Requerente'}],
    documentosRelacionadosIds: "DOC005", 
    dataArquivamento: new Date("2014-06-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    apensos: [],
    totalMidias: 0,
    midias: [],
    digitalizado: "Não", 
    tipoBaixa: "Eliminação Concluída",
    dataBaixa: new Date("2018-12-01").toISOString(),
    classificacaoArquivisticaId: "CLA002",
    prazoArquivoCorrenteDisplay: "Até a próxima atualização",
    prazoArquivoIntermediarioDisplay: "3 Anos", 
    destinacaoFinalDisplay: "Eliminação",      
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2018",
    necessidadeReclassificacao: "Não", 
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX-TEMP-001", 
    codigoAtoM: "",
    observacoesGerais: "Documento eliminado conforme edital.",
    codigoClassificacaoJudicialId: "",
    numeroDocumentoTransferencia: "",
    dataCadastro: new Date("2014-06-01T10:00:00Z").toISOString(), 
  },
  { 
    id: "DOC005", 
    status: "Aguardando prazo para eliminação", 
    orgao: "SJRJ", 
    origem: "Vara Federal - VF", 
    tipoMeio: "Digital", 
    generoDocumental: "Iconográfico", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Petição", 
    numeroDocumento: "PET-2010-555", 
    processoOriginario: "",
    numeroAntigo: "",
    dataAbrangente: "15/08/2010",
    descricaoDocumento: "Petição inicial do processo, aguardando prazo para eliminação.",
    partes: [{id: 'p5', nome: 'Consumidor Teste', tipoParte: 'Autor'}],
    documentosRelacionadosIds: "",
    dataArquivamento: new Date("2010-08-20").toISOString(), 
    quantidadeVolumes: 0,
    quantidadeApensos: 0,
    apensos: [],
    totalMidias: 1,
    midias: [{id: 'm-d5-1', tipoMidia: 'Outro', numeroMidia: 'ARQ001', paginaMidia: '1-50'}],
    digitalizado: "Sim", 
    tipoBaixa: "",
    dataBaixa: undefined,
    classificacaoArquivisticaId: "CLA001", 
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos", 
    destinacaoFinalDisplay: "Guarda Permanente", 
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2026",
    necessidadeReclassificacao: "Não",
    segredoJustica: "Não", 
    grauSigilo: "Reservado", 
    codigosCaixa: "CX-DIG-010", 
    codigoAtoM: "ATOM005",
    observacoesGerais: "Documento sujeito à análise da CPAD.",
    codigoClassificacaoJudicialId: "CJ001",
    numeroDocumentoTransferencia: "",
    numeroListagemEliminacao: "LE-2024-002",
    dataCadastro: new Date("2010-08-01T14:00:00Z").toISOString(), 
  },
  { 
    id: "DOC007", 
    status: "Arquivado", 
    orgao: "TRF2", 
    origem: "Vara Cível - VC", 
    tipoMeio: "Não digital", 
    generoDocumental: "Textual", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Execução Fiscal", 
    numeroDocumento: "EXEC-2020-789", 
    processoOriginario: "",
    numeroAntigo: "",
    dataAbrangente: "07/2020 - 12/2020",
    descricaoDocumento: "Processo de execução fiscal.",
    partes: [{id: 'p7', nome: 'Fazenda Nacional', tipoParte: 'Exequente'}],
    documentosRelacionadosIds: "",
    dataArquivamento: new Date("2020-12-15").toISOString(), 
    quantidadeVolumes: 1,
    quantidadeApensos: 0,
    apensos: [],
    totalMidias: 0,
    midias: [],
    digitalizado: "Não", 
    classificacaoArquivisticaId: "CLA001",
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos",
    destinacaoFinalDisplay: "Guarda Permanente",
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2036",
    necessidadeReclassificacao: "Não",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX004", 
    codigoAtoM: "ATOM007",
    observacoesGerais: "",
    codigoClassificacaoJudicialId: "CJ001",
    numeroListagemEliminacao: "LE-2023-001", 
    numeroDocumentoTransferencia: "",
    dataCadastro: new Date("2020-07-01T10:00:00Z").toISOString(), 
  },
  { 
    id: "DOC008", 
    status: "Aguardando prazo para eliminação", 
    orgao: "SJRJ", 
    origem: "Juizado Especial - JE", 
    tipoMeio: "Digital", 
    generoDocumental: "Textual", 
    categoria: "Processo Judicial", 
    tipoDocumento: "Procedimento do Juizado Especial Cível", 
    numeroDocumento: "JEC-2018-123", 
    processoOriginario: "",
    numeroAntigo: "",
    dataAbrangente: "03/2018",
    descricaoDocumento: "Pequenas causas, aguardando eliminação.",
    partes: [{id: 'p8', nome: 'Fulano de Tal', tipoParte: 'Autor'}],
    documentosRelacionadosIds: "",
    dataArquivamento: new Date("2018-03-20").toISOString(), 
    quantidadeVolumes: 0,
    quantidadeApensos: 0,
    apensos: [],
    totalMidias: 0,
    midias: [],
    digitalizado: "Sim", 
    classificacaoArquivisticaId: "CLA001",
    prazoArquivoCorrenteDisplay: "5 Anos",
    prazoArquivoIntermediarioDisplay: "15 Anos", 
    destinacaoFinalDisplay: "Eliminação", 
    alteracaoDestinacaoFinal: "Não Alterar", 
    anoEliminacaoPrevisto: "2034",
    necessidadeReclassificacao: "Não",
    segredoJustica: "Não", 
    grauSigilo: "Ostensivo", 
    codigosCaixa: "CX-DIG-012", 
    codigoAtoM: "ATOM008",
    observacoesGerais: "Documento digitalizado.",
    codigoClassificacaoJudicialId: "CJ001",
    numeroListagemEliminacao: "LE-2024-001", 
    numeroDocumentoTransferencia: "",
    dataCadastro: new Date("2018-03-01T14:00:00Z").toISOString(), 
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const docIndex = i + 9;
    const anoBase = 2020 - i;
    const mes = (i % 12) + 1;
    const dia = (i % 28) + 1;
    const dataArquivamento = new Date(anoBase, mes - 1, dia);
    const classification = placeholderClassificacoesSimulado[i % placeholderClassificacoesSimulado.length];
    let anoEliminacao = "";
    if (classification.destinacaoFinal === 'Eliminação') {
        const prazoIntermediario = classification.prazoGuardaFaseIntermediariaAnos ?? 0;
        anoEliminacao = (anoBase + prazoIntermediario + 1).toString();
    }
    const isJudicial = (i % 3 === 0);

    return {
      id: `DOC${String(docIndex).padStart(3, '0')}`,
      status: "Arquivado" as const,
      orgao: (["TRF2", "SJRJ", "SJES"] as const)[i % 3],
      origem: `Origem Teste ${i+1}`,
      tipoMeio: (["Não digital", "Digital", "Híbrido"] as const)[i % 3],
      generoDocumental: "Textual",
      categoria: isJudicial ? "Processo Judicial" : "Processo Administrativo" as const,
      tipoDocumento: isJudicial ? "Ação Teste" : "Relatório Teste",
      numeroDocumento: `DOC-TESTE-${docIndex}`,
      dataAbrangente: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anoBase}`,
      descricaoDocumento: `Documento de teste número ${docIndex} para popular a base de dados do acervo.`,
      partes: [{ id: `p${docIndex}`, nome: `Pessoa Teste ${docIndex}`, tipoParte: 'Interessado' }],
      dataArquivamento: dataArquivamento.toISOString(),
      quantidadeVolumes: 1,
      quantidadeApensos: 0,
      apensos: [],
      totalMidias: 0,
      midias: [],
      digitalizado: "Não" as const,
      classificacaoArquivisticaId: classification.id,
      prazoArquivoCorrenteDisplay: classification.tipoPrazoFaseCorrente === 'Anos' ? `${classification.prazoGuardaFaseCorrenteAnos} Anos` : (classification.prazoGuardaFaseCorrenteCondicaoTextual || ''),
      prazoArquivoIntermediarioDisplay: `${classification.prazoGuardaFaseIntermediariaAnos} Anos`,
      destinacaoFinalDisplay: classification.destinacaoFinal,
      alteracaoDestinacaoFinal: "Não Alterar" as const,
      anoEliminacaoPrevisto: anoEliminacao,
      necessidadeReclassificacao: "Não" as const,
      segredoJustica: "Não" as const,
      grauSigilo: "Ostensivo" as const,
      codigosCaixa: `CX-T-${String(docIndex).padStart(3, '0')}`,
      codigoAtoM: `ATOM${String(docIndex).padStart(3, '0')}`,
      dataCadastro: dataArquivamento.toISOString(),
      codigoClassificacaoJudicialId: isJudicial ? "CJ001" : undefined,
    }
  })
];

export const placeholderSolicitacoesInitial: Solicitacao[] = [
  { id: "SOL001", tipo: "Empréstimo", numeroSolicitacao: "SOL-2024-001", nomeSolicitante: "João Silva", setorSolicitante: "Gab. Des. A", siglaServidor: "JSS", matriculaSolicitante: "12345", ramal: "1234", emailContato: "joao.silva@trf2.jus.br", dataSolicitacao: new Date("2024-03-01").toISOString(), documentoIds: ["DOC001"], status: "Pendente" },
  { id: "SOL002", tipo: "Desarquivamento", numeroSolicitacao: "SOL-2024-002", nomeSolicitante: "Maria Oliveira", setorSolicitante: "Vara Federal 1", siglaServidor: "MOO", matriculaSolicitante: "54321", ramal: "4321", emailContato: "maria.oliveira@trf2.jus.br", dataSolicitacao: new Date("2024-03-05").toISOString(), dataAtendimento: new Date("2024-03-06").toISOString(), documentoIds: ["DOC002"], status: "Atendida" },
  { id: "SOL003", tipo: "Empréstimo", numeroSolicitacao: "SOL-2024-003", nomeSolicitante: "Carlos Pereira", setorSolicitante: "Secretaria", siglaServidor: "CAP", matriculaSolicitante: "67890", ramal: "6789", emailContato: "carlos.pereira@trf2.jus.br", dataSolicitacao: new Date("2024-03-10").toISOString(), dataAtendimento: new Date("2024-03-11").toISOString(), dataDevolucao: new Date("2024-03-20").toISOString(), documentoIds: ["DOC003"], status: "Devolvido" },
];

export type SimulatedDocumentForSolicitacaoDialog = Pick<Documento, 
  'id' | 'numeroDocumento' | 'tipoDocumento' | 'descricaoDocumento' | 'status' | 'codigosCaixa' | 'segredoJustica'
>;

export const allPermissions: { id: keyof Usuario['permissoes']; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Permite visualizar a tela principal com estatísticas e atalhos.' },
  { id: 'caixas', label: 'Caixas', description: 'Permite gerenciar as caixas de arquivamento.' },
  { id: 'classificacao', label: 'Classificação', description: 'Permite gerenciar os códigos de classificação arquivística.' },
  { id: 'classesJudiciais', label: 'Classes Judiciais', description: 'Permite gerenciar as classes judiciais e seus prazos.' },
  { id: 'acervo', label: 'Acervo', description: 'Permite cadastrar, editar e excluir documentos do acervo.' },
  { id: 'listagens', label: 'Avaliação Documental', description: 'Permite acesso a Listagens, Editais e Termos de Eliminação.' },
  { id: 'transferencias', label: 'Transferências', description: 'Permite gerenciar a transferência de documentos para o arquivo.' },
  { id: 'solicitacoes', label: 'Solicitações', description: 'Permite gerenciar solicitações de empréstimo e desarquivamento.' },
  { id: 'buscaAvancada', label: 'Busca Avançada', description: 'Permite utilizar a busca com múltiplos filtros.' },
  { id: 'estatisticas', label: 'Estatísticas', description: 'Permite visualizar gráficos e estatísticas sobre o acervo.' },
  { id: 'relatorios', label: 'Relatórios', description: 'Permite visualizar relatórios tabulares detalhados.' },
  { id: 'auditoria', label: 'Auditoria', description: 'Permite visualizar os logs de auditoria do sistema.' },
  { id: 'usuarios', label: 'Usuários', description: 'Permite gerenciar usuários e suas permissões (somente para administradores).' },
  { id: 'configuracoes', label: 'Configurações', description: 'Permite acessar e alterar as configurações globais do sistema.' },
  { id: 'manual', label: 'Manual', description: 'Permite acessar o manual do sistema.' },
  { id: 'exclusaoDados', label: 'Exclusão de Dados', description: 'Permite excluir registros do sistema (caixas, documentos, etc.). Apenas administradores podem conceder esta permissão.' },
];

export const allTruePermissions: Usuario['permissoes'] = {
  dashboard: true, acervo: true, caixas: true, classificacao: true, classesJudiciais: true, listagens: true, solicitacoes: true, buscaAvancada: true, usuarios: true, configuracoes: true, transferencias: true, estatisticas: true, relatorios: true, auditoria: true, manual: true, exclusaoDados: true,
};

export const standardUserPermissions: Usuario['permissoes'] = {
  ...allTruePermissions,
  usuarios: false,
  configuracoes: false,
  auditoria: false,
  exclusaoDados: false,
};


export const initialUsers: Usuario[] = [
  { id: "USR001", nomeCompleto: "Administrador do Sistema", email: "admin@sistem.com", senhaHash: "hashed_password_1", sigla: "ADM", setor: "TI", statusAprovacao: "Aprovado", tipoUsuario: "Administrador", permissoes: allTruePermissions },
  { id: "USR002", nomeCompleto: "Usuário Padrão", email: "user@sistem.com", senhaHash: "hashed_password_2", sigla: "USER", setor: "Arquivo", statusAprovacao: "Aprovado", tipoUsuario: "Padrão", permissoes: standardUserPermissions },
  { id: "USR003", nomeCompleto: "Usuário Pendente", email: "pending@sistem.com", senhaHash: "hashed_password_3", sigla: "PEND", setor: "Estágio", statusAprovacao: "Pendente", tipoUsuario: "Padrão", permissoes: {} as Usuario['permissoes'] },
  { id: "USR004", nomeCompleto: "Usuário 'r'", email: "r", senhaHash: "hashed_password_4", sigla: "R", setor: "Gabinete X", statusAprovacao: "Aprovado", tipoUsuario: "Padrão", permissoes: { ...standardUserPermissions, dashboard: false, acervo: false, caixas: false, classificacao: false, classesJudiciais: false, listagens: false, buscaAvancada: false, transferencias: false } },
];


export const initialTransferencias: Transferencia[] = [
    {
        id: 'TRANSF_1717088400000',
        nomeServidor: 'Carlos Andrade',
        matricula: '11223',
        ramal: '4567',
        setorRemetente: 'Gabinete do Desembargador X',
        dataTransferencia: new Date('2024-05-30T10:00:00Z').toISOString(),
        status: 'Pendente',
        observacoes: "Transferência urgente de processos concluídos.",
        documentos: [
            {
                id: 'DOC_T_1717088400000_0',
                categoria: 'Processo Judicial',
                codigoClassificacao: '020.1',
                descricao: 'Processo sobre licitação de TI',
                dataAbrangente: '01/2022 - 12/2023',
                numeroDocumento: 'PJ-2022-00123',
                quantidadeVolumes: 2,
                quantidadeApensos: 1,
                numerosApensos: 'AP-2022-001',
                digitalizado: 'Não',
                observacoesGerais: 'Documentação sigilosa.'
            }
        ]
    },
    {
        id: 'TRANSF_1717088500000',
        nomeServidor: 'Lúcia Martins',
        matricula: '44556',
        ramal: '8901',
        setorRemetente: 'Secretaria de Recursos Humanos',
        dataTransferencia: new Date('2024-05-28T15:30:00Z').toISOString(),
        status: 'Aprovada',
        observacoes: "Documentos para arquivo permanente.",
        documentos: [
            {
                id: 'DOC_T_1717088500000_0',
                categoria: 'Dossiê',
                codigoClassificacao: '030.5',
                descricao: 'Dossiê de aposentadoria do servidor Y',
                dataAbrangente: '1990 - 2024',
                numeroDocumento: 'D-S-Y-1990',
                quantidadeVolumes: 1,
                quantidadeApensos: 0,
                numerosApensos: '',
                digitalizado: 'Sim',
                observacoesGerais: ''
            },
            {
                id: 'DOC_T_1717088500000_1',
                categoria: 'Processo Administrativo',
                codigoClassificacao: '045.2',
                descricao: 'Processo de férias de 2023',
                dataAbrangente: '2023',
                numeroDocumento: 'PA-FERIAS-2023',
                quantidadeVolumes: 1,
                quantidadeApensos: 0,
                numerosApensos: '',
                digitalizado: 'Sim',
                observacoesGerais: 'Todos os processos de férias do ano.'
            }
        ]
    }
];

export const initialTiposDocumento: string[] = [
  "Ação Ordinária", 
  "Comunicação Interna", 
  "Execução Fiscal", 
  "Petição", 
  "Procedimento do Juizado Especial Cível", 
  "Requerimento", 
  "Solicitação de Informações"
];

export const initialGenerosDocumentais: string[] = ['Textual', 'Iconográfico', 'Cartográfico', 'Sonoro', 'Filmográfico', 'Audiovisual'];

export const initialTiposMidia: string[] = ['CD-R', 'CD-RW', 'Disquete', 'Pen Drive', 'HD', 'Outro'];

export const initialTiposParte: string[] = ["Autor", "Réu", "Magistrado", "Advogado", "Procurador", "Acusado", "Acusador", "Agravado", "Agravante", "Apelado", "Apelante", "Assistente do Réu", "Coator", "Curador", "Declarante", "Depositante", "Depositário", "Depositário Público", "Deprecado", "Deprecante", "Depreciado", "Embargado", "Embargante", "Espólio", "Executado", "Executante", "Exequado", "Exequente", "Falecido", "Impetrado", "Impetrante", "Impugnado", "Impugnante", "Indiciado", "Inventariado", "Inventariante", "Justificante", "Liquidado", "Liquidante", "Litisconsorte", "Notificado", "Notificante", "Paciente", "Requerente", "Requerido", "Requisitado", "Responsável", "Rogado", "Rogante", "Suplicado", "Suplicante", "Testemunhante", "Vítima"];

export const initialTiposOrigem: TipoOrigem[] = [
  { id: 'to1', nome: 'Tribunal de Justiça', sigla: 'TJ' },
  { id: 'to2', nome: 'Secretaria Municipal', sigla: 'SM' },
  { id: 'to3', nome: 'Câmara de Vereadores', sigla: 'CV' },
  { id: 'to4', nome: 'Advocacia Geral', sigla: 'AG' },
  { id: 'to5', nome: 'Vara Federal', sigla: 'VF' },
  { id: 'to6', nome: 'Juizado Especial', sigla: 'JE' },
  { id: 'to7', nome: 'Secretaria de Recursos Humanos', sigla: 'SRH' },
  { id: 'to8', nome: 'Gabinete do Desembargador X', sigla: 'GAB-DES-X' },
  { id: 'to9', nome: 'Vara Cível', sigla: 'VC' },
];

export const initialTiposCaixa: string[] = [
  "JUD",
  "DOC",
  "ADM",
  "ADM/SIGA",
  "JUD/APOLO",
  "JUD/HÍBRIDO",
  "Pasta"
];

export const initialClassificacoes: Classificacao[] = [
  { id: "CLA001", tipoPlanoClassificacao: "Judicial", codigo: "020.1", descricao: "Processos Judiciais Cíveis", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 5, prazoGuardaFaseCorrenteCondicaoTextual: undefined, prazoGuardaFaseIntermediariaAnos: 15, destinacaoFinal: "Guarda Permanente", observacoes: "Manter cópia digitalizada", status: "Ativo" },
  { id: "CLA002", tipoPlanoClassificacao: "Administrativo", codigo: "030.5", descricao: "Correspondências Recebidas", tipoPrazoFaseCorrente: "Condição Textual", prazoGuardaFaseCorrenteAnos: undefined, prazoGuardaFaseCorrenteCondicaoTextual: "Até a próxima atualização", prazoGuardaFaseIntermediariaAnos: 3, destinacaoFinal: "Eliminação", observacoes: "", status: "Inativo" },
  { id: "CLA003", tipoPlanoClassificacao: "Administrativo", codigo: "045.2", descricao: "Relatórios Anuais", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 1, prazoGuardaFaseCorrenteCondicaoTextual: undefined, prazoGuardaFaseIntermediariaAnos: 0, destinacaoFinal: "Guarda Permanente", observacoes: "Manter permanentemente na fase intermediária", status: "Ativo" },
  { id: "CLA004", tipoPlanoClassificacao: "Administrativo", codigo: "020.1", descricao: "Contratos Administrativos", tipoPrazoFaseCorrente: "Anos", prazoGuardaFaseCorrenteAnos: 5, prazoGuardaFaseIntermediariaAnos: 10, destinacaoFinal: "Eliminação", observacoes: "Exemplo de código duplicado em plano diferente.", status: "Ativo" },
];

export const initialClassesJudiciais: ClasseJudicial[] = [
  { id: "CJ001", codigo: "1116", descricao: "Procedimento Comum Cível", prazoGuardaAnos: 2, destinacaoFinal: "Eliminação", inativo: false, observacoes: "Revisar após decisão do CNJ." },
  { id: "CJ002", codigo: "22", descricao: "Ação Penal - Procedimento Ordinário", prazoGuardaAnos: 5, destinacaoFinal: "Guarda Permanente", inativo: false },
  { id: "CJ003", codigo: "12078", descricao: "Cumprimento de Sentença", prazoGuardaAnos: 0, destinacaoFinal: "Vide Guia de Aplicação", inativo: true, observacoes: "Arquivar processo principal junto." },
  { id: "CJ004", codigo: "99", descricao: "Carta Precatória Cível", destinacaoFinal: "Não se Aplica", inativo: false },
];

export const initialAprovacoesContas: AprovacaoContas[] = [
    { id: 'ac1', anoExercicio: '2020', dataAprovacaoTCU: new Date('2021-05-10T00:00:00Z').toISOString(), dataPublicacaoDOU: new Date('2021-05-12T00:00:00Z').toISOString(), secao: '1', pagina: '150' },
    { id: 'ac2', anoExercicio: '2019', dataAprovacaoTCU: new Date('2020-04-20T00:00:00Z').toISOString(), dataPublicacaoDOU: new Date('2020-04-22T00:00:00Z').toISOString(), secao: '1', pagina: '123' },
];

export const PARTES_STORAGE_KEY = 'arquivocentral_partes';

export const initialPartes: ParteDetalhe[] = [
  { id: 'P001', nome: 'Empresa Exemplo Ltda', cpfCnpj: '12.345.678/0001-99', iniciais: 'EEL' },
  { id: 'P002', nome: 'Maria Santos', cpfCnpj: '123.456.789-00', iniciais: 'MS' },
  { id: 'P003', nome: 'João da Silva', iniciais: 'JS' },
  { id: 'P004', nome: 'Fazenda Nacional', cpfCnpj: '00.394.460/0001-41', iniciais: 'FN' },
];
