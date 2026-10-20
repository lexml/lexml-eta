export const VOCABULARIO = {
  autoridades: [
    {
      urn: 'federal',
      descricao: 'Federal',
    },
    {
      urn: 'senado.federal',
      descricao: 'Senado Federal',
    },
    {
      urn: 'congresso.nacional',
      descricao: 'Congresso Nacional',
    },
    {
      urn: 'camara.deputados',
      descricao: 'Câmara dos Deputados',
    },
  ],
  tiposDocumento: [
    {
      urn: 'lei',
      descricao: 'Lei',
      genero: 'F',
    },
    {
      urn: 'lei.complementar',
      descricao: 'Lei Complementar',
      genero: 'F',
    },
    {
      urn: 'lei.delegada',
      descricao: 'Lei Delegada',
      genero: 'F',
    },
    {
      urn: 'decreto.legislativo',
      descricao: 'Decreto Legislativo',
      genero: 'M',
    },
    {
      urn: 'decreto.lei',
      descricao: 'Decreto-Lei',
      genero: 'M',
    },
    {
      urn: 'decreto',
      descricao: 'Decreto',
      genero: 'M',
    },
    {
      urn: 'consolidacao.leis.trabalho',
      descricao: 'Consolidação das Leis do Trabalho',
      genero: 'F',
    },
    {
      urn: 'resolucao',
      descricao: 'Resolução',
      genero: 'F',
    },
    {
      urn: 'regimento.interno',
      descricao: 'Regimento Interno',
      genero: 'M',
    },
    {
      urn: 'constituicao',
      descricao: 'Constituição',
      genero: 'F',
    },
    {
      urn: 'ato.disposicoes.constitucionais.transitorias',
      descricao: 'Ato das Disposições Constitucionais Transitórias',
      genero: 'M',
    },
    {
      urn: 'medida.provisoria',
      descricao: 'Medida Provisória',
      genero: 'F',
    },
    {
      urn: 'medida.provisoria;mpv',
      descricao: 'Medida Provisória',
      genero: 'F',
    },
    {
      urn: 'emenda.constitucional',
      descricao: 'Emenda Constitucional',
      genero: 'F',
    },
    {
      urn: 'emenda.constitucional.revisao',
      descricao: 'Emenda Constitucional de Revisão',
      genero: 'F',
    },
    {
      urn: 'proposta.emenda.constitucional;pec',
      descricao: 'Proposta de Emenda Constitucional',
      genero: 'F',
    },
    {
      urn: 'projeto.lei;pl',
      descricao: 'Projeto de Lei',
      genero: 'M',
    },
    {
      urn: 'projeto.lei;pls',
      descricao: 'Projeto de Lei do Senado',
      genero: 'M',
    },
    {
      urn: 'projeto.lei.complementar;plp',
      descricao: 'Projeto de Lei Complementar',
      genero: 'M',
    },
    {
      urn: 'projeto.lei.complementar;pl',
      descricao: 'Projeto de Lei Complementar',
      genero: 'M',
    },
    {
      urn: 'projeto.lei.complementar;pls',
      descricao: 'Projeto de Lei Complementar do Senado',
      genero: 'M',
    },
    {
      urn: 'projeto.lei;plc',
      descricao: 'Projeto de Lei da Câmara',
      genero: 'M',
    },
    {
      urn: 'projeto.lei.complementar;plc',
      descricao: 'Projeto de Lei Complementar da Câmara',
      genero: 'M',
    },
    {
      urn: 'projeto.lei.conversao;plv',
      descricao: 'Projeto de Lei de Conversão',
      genero: 'M',
    },
    {
      urn: 'projeto.resolucao;prs',
      descricao: 'Projeto de Resolução do Senado',
      genero: 'M',
    },
    {
      urn: 'projeto.decreto.legislativo;pds',
      descricao: 'Projeto de Decreto Legislativo',
      genero: 'M',
    },
    {
      urn: 'projeto.decreto.legislativo;pdl',
      descricao: 'Projeto de Decreto Legislativo',
      genero: 'M',
    },
    {
      urn: 'projeto.decreto.legislativo;pdn',
      descricao: 'Projeto de Decreto Legislativo do Congresso Nacional',
      genero: 'M',
    },
    {
      urn: 'projeto.resolucao;prn',
      descricao: 'Projeto de Resolução do Congresso Nacional',
      genero: 'M',
    },
    {
      urn: 'substitutivo.projeto.lei.senado;scd',
      descricao: 'Substitutivo da Câmara dos Deputados',
      genero: 'M',
    },
    {
      urn: 'emenda.projeto.lei.senado;ecd',
      descricao: 'Emenda(s) da Câmara dos Deputados',
      genero: 'F',
    },
    {
      urn: 'projeto.resolucao;prc',
      descricao: 'Projeto de Resolução da Câmara dos Deputados',
      genero: 'M',
    },
  ],
  fakeUrns: [
    {
      sigla: 'PEC',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'proposta.emenda.constitucional;pec',
    },
    {
      sigla: 'PL',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei;pl',
    },
    {
      sigla: 'PLS',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei;pls',
    },
    {
      sigla: 'PLP',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei.complementar;plp',
    },
    {
      sigla: 'PLC',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei;plc',
    },
    {
      sigla: 'PLV',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei.conversao;plv',
    },
    {
      sigla: 'PRS',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.resolucao;prs',
    },
    {
      sigla: 'PDS',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.decreto.legislativo;pds',
    },
    {
      sigla: 'PDL',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.decreto.legislativo;pdl',
    },
    {
      sigla: 'SCD',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'substitutivo.projeto.lei.senado;scd',
    },
    {
      sigla: 'ECD',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'emenda.projeto.lei.senado;ecd',
    },
    {
      sigla: 'MPV',
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'medida.provisoria;mpv',
    },
    {
      sigla: 'PDN',
      urnAutoridade: 'congresso.nacional',
      urnTipoDocumento: 'projeto.decreto.legislativo;pdn',
    },
    {
      sigla: 'PRN',
      urnAutoridade: 'congresso.nacional',
      urnTipoDocumento: 'projeto.resolucao;prn',
    },
    {
      sigla: 'PRC',
      urnAutoridade: 'camara.deputados',
      urnTipoDocumento: 'projeto.resolucao;prc',
    },
  ],
  // Tipo da URN sem o `;sigla`; `urnAutoridade` só distingue textos do mesmo tipo.
  preambulosPadrao: [
    { urnTipoDocumento: 'projeto.lei', texto: 'O CONGRESSO NACIONAL decreta:' },
    { urnTipoDocumento: 'projeto.lei.complementar', texto: 'O CONGRESSO NACIONAL decreta:' },
    { urnTipoDocumento: 'projeto.lei.conversao', texto: 'O CONGRESSO NACIONAL decreta:' },
    { urnTipoDocumento: 'projeto.decreto.legislativo', texto: 'O CONGRESSO NACIONAL decreta:' },
    { urnTipoDocumento: 'projeto.resolucao', urnAutoridade: 'senado.federal', texto: 'O SENADO FEDERAL resolve:' },
    { urnTipoDocumento: 'projeto.resolucao', urnAutoridade: 'camara.deputados', texto: 'A CÂMARA DOS DEPUTADOS resolve:' },
    { urnTipoDocumento: 'projeto.resolucao', urnAutoridade: 'congresso.nacional', texto: 'O CONGRESSO NACIONAL resolve:' },
    {
      urnTipoDocumento: 'proposta.emenda.constitucional',
      texto: 'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:',
    },
    {
      urnTipoDocumento: 'medida.provisoria',
      texto: 'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:',
    },
  ] as { urnTipoDocumento: string; urnAutoridade?: string; texto: string }[],
  siglas: [
    {
      urnAutoridade: 'federal',
      urnTipoDocumento: 'medida.provisoria',
      sigla: 'MPV',
    },
    {
      urnAutoridade: 'congresso.nacional',
      urnTipoDocumento: 'projeto.lei',
      sigla: 'PLN',
    },
    {
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei',
      sigla: 'PLS',
    },
    {
      urnAutoridade: 'congresso.nacional',
      urnTipoDocumento: 'medida.provisoria',
      sigla: 'MPV',
    },
    {
      urnAutoridade: 'senado.federal',
      urnTipoDocumento: 'projeto.lei.senado.federal',
      sigla: 'PLS',
    },
    {
      urnAutoridade: 'camara.deputados',
      urnTipoDocumento: 'projeto.lei',
      sigla: 'PLC',
    },
    {
      urnAutoridade: 'congresso.nacional',
      urnTipoDocumento: 'projeto.decreto.legislativo;pdn',
      sigla: 'PDN',
    },
    {
      urnAutoridade: 'congresso.nacional',
      urnTipoDocumento: 'projeto.resolucao;prn',
      sigla: 'PRN',
    },
  ],
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
