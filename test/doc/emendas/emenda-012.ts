/* Emenda com novo artigo e alteração de norma

Art. 1º-1. A Lei nº 7.713, de 22 de dezembro de 1988, passa a vigorar com as seguintes alterações:
  “Art. 6º .........................................................................................................
    ................................................................................................................
    XXIV – teste.” (NR)

*/
export const EMENDA_012 = {
  dataUltimaModificacao: '2024-02-15T19:09:46.180Z',
  aplicacao: '',
  versaoAplicacao: '',
  modoEdicao: 'emenda',
  metadados: {},
  proposicao: {
    urn: 'urn:lex:br:federal:medida.provisoria:2019-11-11;905',
    sigla: 'MPV',
    numero: '905',
    ano: '2019',
    ementa: 'Institui o Contrato de Trabalho Verde e Amarelo, altera a legislação trabalhista, e dá outras providências.\n',
    identificacaoTexto: 'Texto inicial',
  },
  epigrafe: {
    texto: 'EMENDA Nº         - CMMPV 905/2019',
    complemento: '(à MPV 905/2019)',
  },
  componentes: [
    {
      urn: 'urn:lex:br:federal:medida.provisoria:2019-11-11;905',
      articulado: true,
      dispositivos: {
        dispositivosSuprimidos: [],
        dispositivosModificados: [],
        dispositivosAdicionados: [
          {
            tipo: 'Artigo',
            id: 'art1-1',
            rotulo: 'Art. 1º-1.',
            idIrmaoAnterior: 'art1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art1-1_cpt',
                texto: 'A <a href="urn:lex:br:federal:lei:1988-12-22;7713">Lei nº 7.713, de 22 de dezembro de 1988</a>, passa a vigorar com as seguintes alterações:',
                filhos: [
                  {
                    tipo: 'Alteracao',
                    id: 'art1-1_cpt_alt1',
                    urnNormaAlterada: 'urn:lex:br:federal:lei:1988-12-22;7713',
                    filhos: [
                      {
                        tipo: 'Artigo',
                        id: 'art1-1_cpt_alt1_art6',
                        rotulo: 'Art. 6º',
                        existeNaNormaAlterada: true,
                        abreAspas: true,
                        filhos: [
                          {
                            tipo: 'Caput',
                            id: 'art1-1_cpt_alt1_art6_cpt',
                            texto:
                              '.................................................................................................................................................................................................................................................................................',
                            filhos: [
                              {
                                tipo: 'Omissis',
                                id: 'art1-1_cpt_alt1_art6_cpt_omi1',
                                texto:
                                  '.................................................................................................................................................................................................................................................................................',
                              },
                              {
                                tipo: 'Omissis',
                                id: 'art1-1_cpt_alt1_art6_cpt_omi1',
                                texto:
                                  '.................................................................................................................................................................................................................................................................................',
                              },
                              {
                                tipo: 'Inciso',
                                id: 'art1-1_cpt_alt1_art6_cpt_inc24',
                                rotulo: 'XXIV –',
                                texto: 'teste.',
                                existeNaNormaAlterada: true,
                                fechaAspas: true,
                                notaAlteracao: 'NR',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  comandoEmendaTextoLivre: {
    texto: '',
  },
  comandoEmenda: {
    comandos: [
      {
        cabecalho: 'Acrescente-se art. 1º-1 à Medida Provisória, com a seguinte redação:',
        citacao:
          '<p class="artigo">“<Rotulo>Art. 1º-1.</Rotulo> A Lei nº 7.713, de 22 de dezembro de 1988, passa a vigorar com as seguintes alterações:</p><Alteracao><p class="artigo">‘<Rotulo>Art. 6º</Rotulo> <Omissis/></p><p class="omissis"><Rotulo/> <Omissis/></p><p class="inciso"><Rotulo>XXIV –</Rotulo> teste.’ (NR)”</p></Alteracao>',
        complemento:
          'Os dispositivos acima propostos e adjacentes deverão ser devidamente renumerados no momento da consolidação das emendas ao texto da proposição pela Redação Final.',
      },
    ],
  },
  anexos: [],
  justificativa: '',
  local: 'Sala da comissão',
  data: '2024-02-15',
  autoria: {
    tipo: 'Parlamentar',
    imprimirPartidoUF: true,
    quantidadeAssinaturasAdicionaisSenadores: 0,
    quantidadeAssinaturasAdicionaisDeputados: 0,
    parlamentares: [],
  },
  opcoesImpressao: {
    imprimirBrasao: true,
    textoCabecalho: '',
    reduzirEspacoEntreLinhas: false,
    tamanhoFonte: 14,
  },
  revisoes: [],
  colegiadoApreciador: {
    siglaCasaLegislativa: 'CN',
    tipoColegiado: 'Comissão',
    siglaComissao: 'CMMPV 905/2019',
  },
  notasRodape: [],
};
