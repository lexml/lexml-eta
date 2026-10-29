import { TextoPreambuloPadrao, TipoRelacaoSubstitutivo, VocabularioAutoridade } from './tiposVocabulario';

export const camara: VocabularioAutoridade = {
  autoridade: { urn: 'camara.deputados', descricao: 'Câmara dos Deputados', sigla: 'CD' },
  tiposDocumento: [
    { urnTipoDocumento: 'decreto.legislativo', descricao: 'Decreto Legislativo', genero: 'M' },
    { urnTipoDocumento: 'regimento.interno', descricao: 'Regimento Interno', genero: 'M' },
    { urnTipoDocumento: 'resolucao', descricao: 'Resolução', genero: 'F' },
    {
      urnTipoDocumento: 'proposta.emenda.constitucional',
      sigla: 'PEC',
      descricao: 'Proposta de Emenda Constitucional',
      genero: 'F',
      tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO,
    },
    { urnTipoDocumento: 'projeto.lei', sigla: 'PL', descricao: 'Projeto de Lei', genero: 'M', tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO },
    {
      urnTipoDocumento: 'projeto.lei.complementar',
      sigla: 'PLP',
      descricao: 'Projeto de Lei Complementar',
      genero: 'M',
      tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO,
    },
    {
      urnTipoDocumento: 'projeto.resolucao',
      sigla: 'PRC',
      descricao: 'Projeto de Resolução',
      genero: 'M',
      tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO,
    },
    { urnTipoDocumento: 'substitutivo', sigla: 'SBT', descricao: 'Substitutivo', genero: 'M', tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.E_SUBSTITUTIVO },
    {
      urnTipoDocumento: 'subemenda.substitutiva',
      sigla: 'PEP',
      descricao: 'Subemenda Substitutiva',
      genero: 'M',
      tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA,
    },
  ],
  preambulosPadrao: [
    { urnTipoDocumento: 'projeto.lei', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA },
    { urnTipoDocumento: 'projeto.lei.complementar', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA },
    { urnTipoDocumento: 'projeto.decreto.legislativo', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA },
    { urnTipoDocumento: 'projeto.resolucao', texto: TextoPreambuloPadrao.CAMARA_RESOLVE },
    {
      urnTipoDocumento: 'proposta.emenda.constitucional',
      texto: TextoPreambuloPadrao.MESAS_PROMULGAM_EMENDA,
    },
  ],
};
