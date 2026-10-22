import { TextoPreambuloPadrao, VocabularioAutoridade } from './tiposVocabulario';

export const federal: VocabularioAutoridade = {
  autoridade: { urn: 'federal', descricao: 'Federal' },
  tiposDocumento: [
    { urnTipoDocumento: 'lei', descricao: 'Lei', genero: 'F' },
    { urnTipoDocumento: 'lei.complementar', descricao: 'Lei Complementar', genero: 'F' },
    { urnTipoDocumento: 'lei.delegada', descricao: 'Lei Delegada', genero: 'F' },
    { urnTipoDocumento: 'decreto.lei', descricao: 'Decreto-Lei', genero: 'M' },
    { urnTipoDocumento: 'decreto', descricao: 'Decreto', genero: 'M' },
    { urnTipoDocumento: 'consolidacao.leis.trabalho', descricao: 'Consolidação das Leis do Trabalho', genero: 'F' },
    { urnTipoDocumento: 'constituicao', descricao: 'Constituição', genero: 'F' },
    { urnTipoDocumento: 'ato.disposicoes.constitucionais.transitorias', descricao: 'Ato das Disposições Constitucionais Transitórias', genero: 'M' },
    { urnTipoDocumento: 'emenda.constitucional', descricao: 'Emenda Constitucional', genero: 'F' },
    { urnTipoDocumento: 'emenda.constitucional.revisao', descricao: 'Emenda Constitucional de Revisão', genero: 'F' },
    { urnTipoDocumento: 'medida.provisoria', sigla: 'MPV', descricao: 'Medida Provisória', genero: 'F' },
  ],
  preambulosPadrao: [
    {
      urnTipoDocumento: 'medida.provisoria',
      texto: TextoPreambuloPadrao.PRESIDENTE_ADOTA_MPV,
    },
  ],
};
