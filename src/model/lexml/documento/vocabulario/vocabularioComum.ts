import { VocabularioComum } from './tiposVocabulario';

export const comum: VocabularioComum = {
  atalhosUrn: [
    {
      urnTipoDocumento: 'constituicao',
      urnAutoridade: 'federal',
      urn: 'urn:lex:br:federal:constituicao:1988-10-05;1988',
      nome: 'Constituição Federal',
    },
    {
      urnTipoDocumento: 'ato.disposicoes.constitucionais.transitorias',
      urnAutoridade: 'federal',
      urn: 'urn:lex:br:federal:ato.disposicoes.constitucionais.transitorias:1988-10-05;1988',
      nome: 'Ato das Disposições Constitucionais Transitórias - ADCT',
    },
    {
      urnTipoDocumento: 'consolidacao.leis.trabalho',
      urnAutoridade: 'federal',
      urn: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452',
      nome: 'Consolidação das Leis do Trabalho - CLT, aprovada pelo Decreto-Lei nº 5.452, de 1º de maio de 1943',
      genero: 'F',
    },
    {
      urnTipoDocumento: 'regimento.interno',
      urnAutoridade: 'senado.federal',
      urn: 'urn:lex:br:senado.federal:resolucao:1970-11-27;93',
      nome: 'Regimento Interno do Senado Federal',
      genero: 'M',
    },
    {
      urnTipoDocumento: 'regimento.interno',
      urnAutoridade: 'congresso.nacional',
      urn: 'urn:lex:br:congresso.nacional:resolucao:1970-08-11;1',
      nome: 'Regimento Comum do Congresso Nacional',
      genero: 'M',
    },
  ],
  eventos: [
    {
      urn: 'leitura',
      tipoTextoProcessoLegislativo: 'Texto inicial',
      genero: 'M',
    },
    {
      urn: 'aprovacao.substitutivo.decisao.terminativa',
      tipoTextoProcessoLegislativo: 'Redação do vencido em turno suplementar na Comissão',
      substitutivo: 's',
      genero: 'F',
    },
    {
      urn: 'aprovacao.substitutivo',
      tipoTextoProcessoLegislativo: 'Redação do vencido em turno suplementar no Plenário',
      substitutivo: 's',
      genero: 'F',
    },
    {
      urn: 'apresentacao.substitutivo',
      tipoTextoProcessoLegislativo: 'Texto do substitutivo',
      substitutivo: 's',
      genero: 'M',
    },
  ],
};
