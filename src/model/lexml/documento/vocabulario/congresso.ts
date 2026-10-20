import { VocabularioAutoridade } from './tipos';

const decreta = 'O CONGRESSO NACIONAL decreta:';

export const congresso: VocabularioAutoridade = {
  autoridade: { urn: 'congresso.nacional', descricao: 'Congresso Nacional' },
  tiposDocumento: [
    { urn: 'decreto.legislativo', descricao: 'Decreto Legislativo', genero: 'M' },
    { urn: 'resolucao', descricao: 'Resolução', genero: 'F' },
    { urn: 'projeto.decreto.legislativo;pdn', descricao: 'Projeto de Decreto Legislativo do Congresso Nacional', genero: 'M' },
    { urn: 'projeto.resolucao;prn', descricao: 'Projeto de Resolução do Congresso Nacional', genero: 'M' },
    { urn: 'projeto.lei.conversao;plv', descricao: 'Projeto de Lei de Conversão', genero: 'M' },
  ],
  // `PLN` e `MPV` nunca casam em getSigla (tipo sem `;sigla`); a limpeza fica para outra etapa da #1026.
  siglas: [
    { urnTipoDocumento: 'projeto.lei', sigla: 'PLN' },
    { urnTipoDocumento: 'medida.provisoria', sigla: 'MPV' },
    { urnTipoDocumento: 'projeto.decreto.legislativo;pdn', sigla: 'PDN' },
    { urnTipoDocumento: 'projeto.resolucao;prn', sigla: 'PRN' },
  ],
  fakeUrns: [
    { sigla: 'PDN', urnTipoDocumento: 'projeto.decreto.legislativo;pdn' },
    { sigla: 'PRN', urnTipoDocumento: 'projeto.resolucao;prn' },
    { sigla: 'PLV', urnTipoDocumento: 'projeto.lei.conversao;plv' },
  ],
  preambulosPadrao: [
    { urnTipoDocumento: 'projeto.lei', texto: decreta },
    { urnTipoDocumento: 'projeto.lei.conversao', texto: decreta },
    { urnTipoDocumento: 'projeto.decreto.legislativo', texto: decreta },
    { urnTipoDocumento: 'projeto.resolucao', texto: 'O CONGRESSO NACIONAL resolve:' },
  ],
};
