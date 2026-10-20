import { VocabularioAutoridade } from './tipos';

export const federal: VocabularioAutoridade = {
  autoridade: { urn: 'federal', descricao: 'Federal' },
  tiposDocumento: [
    { urn: 'lei', descricao: 'Lei', genero: 'F' },
    { urn: 'lei.complementar', descricao: 'Lei Complementar', genero: 'F' },
    { urn: 'lei.delegada', descricao: 'Lei Delegada', genero: 'F' },
    { urn: 'decreto.lei', descricao: 'Decreto-Lei', genero: 'M' },
    { urn: 'decreto', descricao: 'Decreto', genero: 'M' },
    { urn: 'consolidacao.leis.trabalho', descricao: 'Consolidação das Leis do Trabalho', genero: 'F' },
    { urn: 'constituicao', descricao: 'Constituição', genero: 'F' },
    { urn: 'ato.disposicoes.constitucionais.transitorias', descricao: 'Ato das Disposições Constitucionais Transitórias', genero: 'M' },
    { urn: 'emenda.constitucional', descricao: 'Emenda Constitucional', genero: 'F' },
    { urn: 'emenda.constitucional.revisao', descricao: 'Emenda Constitucional de Revisão', genero: 'F' },
    { urn: 'medida.provisoria', descricao: 'Medida Provisória', genero: 'F' },
    { urn: 'medida.provisoria;mpv', descricao: 'Medida Provisória', genero: 'F' },
  ],
  siglas: [{ urnTipoDocumento: 'medida.provisoria', sigla: 'MPV' }],
  fakeUrns: [{ sigla: 'MPV', urnTipoDocumento: 'medida.provisoria;mpv' }],
  preambulosPadrao: [
    {
      urnTipoDocumento: 'medida.provisoria',
      texto: 'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:',
    },
  ],
};
