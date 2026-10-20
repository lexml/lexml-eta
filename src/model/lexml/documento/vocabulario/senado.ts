import { VocabularioAutoridade } from './tipos';

const decreta = 'O CONGRESSO NACIONAL decreta:';

export const senado: VocabularioAutoridade = {
  autoridade: { urn: 'senado.federal', descricao: 'Senado Federal' },
  tiposDocumento: [
    { urn: 'decreto.legislativo', descricao: 'Decreto Legislativo', genero: 'M' },
    { urn: 'regimento.interno', descricao: 'Regimento Interno', genero: 'M' },
    { urn: 'resolucao', descricao: 'Resolução', genero: 'F' },
    { urn: 'proposta.emenda.constitucional;pec', descricao: 'Proposta de Emenda Constitucional', genero: 'F' },
    { urn: 'projeto.lei;pl', descricao: 'Projeto de Lei', genero: 'M' },
    { urn: 'projeto.lei;pls', descricao: 'Projeto de Lei do Senado', genero: 'M' },
    { urn: 'projeto.lei;plc', descricao: 'Projeto de Lei da Câmara', genero: 'M' },
    { urn: 'projeto.lei.complementar;plp', descricao: 'Projeto de Lei Complementar', genero: 'M' },
    { urn: 'projeto.lei.complementar;pl', descricao: 'Projeto de Lei Complementar', genero: 'M' },
    { urn: 'projeto.lei.complementar;pls', descricao: 'Projeto de Lei Complementar do Senado', genero: 'M' },
    { urn: 'projeto.lei.complementar;plc', descricao: 'Projeto de Lei Complementar da Câmara', genero: 'M' },
    { urn: 'projeto.resolucao;prs', descricao: 'Projeto de Resolução do Senado', genero: 'M' },
    { urn: 'projeto.decreto.legislativo;pds', descricao: 'Projeto de Decreto Legislativo', genero: 'M' },
    { urn: 'projeto.decreto.legislativo;pdl', descricao: 'Projeto de Decreto Legislativo', genero: 'M' },
    { urn: 'substitutivo.projeto.lei.senado;scd', descricao: 'Substitutivo da Câmara dos Deputados', genero: 'M' },
    { urn: 'emenda.projeto.lei.senado;ecd', descricao: 'Emenda(s) da Câmara dos Deputados', genero: 'F' },
  ],
  // Nunca casam em getSigla (tipo sem `;sigla`); a limpeza fica para outra etapa da #1026.
  siglas: [
    { urnTipoDocumento: 'projeto.lei', sigla: 'PLS' },
    { urnTipoDocumento: 'projeto.lei.senado.federal', sigla: 'PLS' },
  ],
  fakeUrns: [
    { sigla: 'PEC', urnTipoDocumento: 'proposta.emenda.constitucional;pec' },
    { sigla: 'PL', urnTipoDocumento: 'projeto.lei;pl' },
    { sigla: 'PLS', urnTipoDocumento: 'projeto.lei;pls' },
    { sigla: 'PLP', urnTipoDocumento: 'projeto.lei.complementar;plp' },
    { sigla: 'PLC', urnTipoDocumento: 'projeto.lei;plc' },
    { sigla: 'PRS', urnTipoDocumento: 'projeto.resolucao;prs' },
    { sigla: 'PDS', urnTipoDocumento: 'projeto.decreto.legislativo;pds' },
    { sigla: 'PDL', urnTipoDocumento: 'projeto.decreto.legislativo;pdl' },
    { sigla: 'SCD', urnTipoDocumento: 'substitutivo.projeto.lei.senado;scd' },
    { sigla: 'ECD', urnTipoDocumento: 'emenda.projeto.lei.senado;ecd' },
  ],
  preambulosPadrao: [
    { urnTipoDocumento: 'projeto.lei', texto: decreta },
    { urnTipoDocumento: 'projeto.lei.complementar', texto: decreta },
    { urnTipoDocumento: 'projeto.decreto.legislativo', texto: decreta },
    { urnTipoDocumento: 'projeto.resolucao', texto: 'O SENADO FEDERAL resolve:' },
    {
      urnTipoDocumento: 'proposta.emenda.constitucional',
      texto: 'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:',
    },
  ],
};
