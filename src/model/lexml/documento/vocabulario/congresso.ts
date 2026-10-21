import { TextoPreambuloPadrao, TipoRelacaoSubstitutivo, VocabularioAutoridade } from './tipos';

export const congresso: VocabularioAutoridade = {
  autoridade: { urn: 'congresso.nacional', descricao: 'Congresso Nacional' },
  tiposDocumento: [
    { urnTipoDocumento: 'decreto.legislativo', descricao: 'Decreto Legislativo', genero: 'M' },
    { urnTipoDocumento: 'resolucao', descricao: 'Resolução', genero: 'F' },
    {
      urnTipoDocumento: 'projeto.resolucao',
      sigla: 'PRN',
      descricao: 'Projeto de Resolução do Congresso Nacional',
      genero: 'M',
      tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO,
    },
    { urnTipoDocumento: 'projeto.lei', sigla: 'PLN', descricao: 'Projeto de Lei do Congresso Nacional', genero: 'M' },
    { urnTipoDocumento: 'projeto.lei.conversao', sigla: 'PLV', descricao: 'Projeto de Lei de Conversão', genero: 'M' },
    { urnTipoDocumento: 'projeto.decreto.legislativo', sigla: 'PDN', descricao: 'Projeto de Decreto Legislativo do Congresso Nacional', genero: 'M' },
  ],
  preambulosPadrao: [
    { urnTipoDocumento: 'projeto.lei', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA },
    { urnTipoDocumento: 'projeto.lei.conversao', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA },
    { urnTipoDocumento: 'projeto.decreto.legislativo', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA },
    { urnTipoDocumento: 'projeto.resolucao', texto: TextoPreambuloPadrao.CONGRESSO_RESOLVE },
  ],
};
