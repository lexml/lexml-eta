import { VocabularioAutoridade } from './tipos';

const decreta = 'O CONGRESSO NACIONAL decreta:';

export const camara: VocabularioAutoridade = {
  autoridade: { urn: 'camara.deputados', descricao: 'Câmara dos Deputados' },
  tiposDocumento: [
    { urn: 'decreto.legislativo', descricao: 'Decreto Legislativo', genero: 'M' },
    { urn: 'regimento.interno', descricao: 'Regimento Interno', genero: 'M' },
    { urn: 'proposta.emenda.constitucional;pec', descricao: 'Proposta de Emenda Constitucional', genero: 'F' },
    { urn: 'projeto.lei;pl', descricao: 'Projeto de Lei', genero: 'M' },
    { urn: 'projeto.lei.complementar;plp', descricao: 'Projeto de Lei Complementar', genero: 'M' },
    { urn: 'projeto.resolucao;prs', descricao: 'Projeto de Resolução do Senado', genero: 'M' },
    { urn: 'projeto.resolucao;prc', descricao: 'Projeto de Resolução da Câmara dos Deputados', genero: 'M' },
  ],
  // Nunca casa em getSigla (tipo sem `;sigla`); a limpeza fica para outra etapa da #1026.
  siglas: [{ urnTipoDocumento: 'projeto.lei', sigla: 'PLC' }],
  fakeUrns: [{ sigla: 'PRC', urnTipoDocumento: 'projeto.resolucao;prc' }],
  preambulosPadrao: [
    { urnTipoDocumento: 'projeto.lei', texto: decreta },
    { urnTipoDocumento: 'projeto.lei.complementar', texto: decreta },
    { urnTipoDocumento: 'projeto.decreto.legislativo', texto: decreta },
    { urnTipoDocumento: 'projeto.resolucao', texto: 'A CÂMARA DOS DEPUTADOS resolve:' },
    {
      urnTipoDocumento: 'proposta.emenda.constitucional',
      texto: 'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:',
    },
  ],
};
