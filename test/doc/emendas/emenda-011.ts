// emenda com agrupador, que possui 2 artigos filhos, em alteração de norma
export const EMENDA_011 = {
  dataUltimaModificacao: '2024-01-29T22:11:37.411Z',
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
                texto: 'A <a href="urn:lex:br:federal:lei:1998-03-24;9615">Lei nº 9.615, de 24 de março de 1998</a>, passa a vigorar com as seguintes alterações:',
                filhos: [
                  {
                    tipo: 'Alteracao',
                    id: 'art1-1_cpt_alt1',
                    urnNormaAlterada: 'urn:lex:br:federal:lei:1998-03-24;9615',
                    filhos: [
                      {
                        tipo: 'Capitulo',
                        id: 'art1-1_cpt_alt1_cap1',
                        rotulo: 'CAPÍTULO I',
                        texto: 'TESTE',
                        existeNaNormaAlterada: true,
                        abreAspas: true,
                        filhos: [
                          {
                            tipo: 'Artigo',
                            id: 'art1-1_cpt_alt1_art2',
                            rotulo: 'Art. 2º',
                            existeNaNormaAlterada: true,
                            filhos: [
                              {
                                tipo: 'Caput',
                                id: 'art1-1_cpt_alt1_art2_cpt',
                                texto: 'Teste 2.',
                              },
                            ],
                          },
                          {
                            tipo: 'Artigo',
                            id: 'art1-1_cpt_alt1_art5',
                            rotulo: 'Art. 5º',
                            existeNaNormaAlterada: true,
                            fechaAspas: true,
                            notaAlteracao: 'NR',
                            filhos: [
                              {
                                tipo: 'Caput',
                                id: 'art1-1_cpt_alt1_art5_cpt',
                                texto: 'Teste 5.',
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
          '<p class="artigo">“<Rotulo>Art. 1º-1.</Rotulo> A Lei nº 9.615, de 24 de março de 1998, passa a vigorar com as seguintes alterações:</p><Alteracao><p class="capitulo agrupador">‘<Rotulo>CAPÍTULO I</Rotulo></p><p class="capitulo agrupador"> TESTE</p><p class="artigo"><Rotulo>Art. 2º</Rotulo> Teste 2.</p><p class="artigo"><Rotulo>Art. 5º</Rotulo> Teste 5.’ (NR)”</p></Alteracao>',
        complemento:
          'Os dispositivos acima propostos e adjacentes deverão ser devidamente renumerados no momento da consolidação das emendas ao texto da proposição pela Redação Final.',
      },
    ],
  },
  anexos: [],
  justificativa: '',
  local: 'Sala da comissão',
  data: '2024-01-29',
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
