export const EXEMPLO_ARTIGOS = {
  Articulacao: {
    '@id': 'prt1',
    Rotulo: 'PARTE I',
    NomeAgrupador: 'Texto da Parte 1',
    Livro: [
      {
        '@id': 'prt1_liv1',
        Rotulo: 'LIVRO I',
        NomeAgrupador: 'Texto do Livro 1',
        Titulo: [
          {
            '@id': 'prt1_liv1_tit1',
            Rotulo: 'TÍTULO I',
            NomeAgrupador: 'Texto do Título 1',
            Capitulo: [
              {
                '@id': 'prt1_liv1_tit1_cap1',
                Rotulo: 'CAPÍTULO I',
                NomeAgrupador: 'Texto do Capítulo 1',
                Artigo: [
                  {
                    '@id': 'art1',
                    Rotulo: 'Art. 1º',
                    Caput: {
                      '@id': 'art1_cpt',
                      p: 'Texto do caput do Artigo 1.',
                    },
                  },
                  {
                    '@id': 'art2',
                    Rotulo: 'Art. 2º',
                    Caput: {
                      '@id': 'art2_cpt',
                      p: 'Texto do caput do Artigo 2.',
                    },
                  },
                ],
              },
              {
                '@id': 'prt1_liv1_tit1_cap2',
                Rotulo: 'CAPÍTULO II',
                NomeAgrupador: 'Texto do Capítulo 2',
                Artigo: [
                  {
                    '@id': 'art3',
                    Rotulo: 'Art. 3º',
                    Caput: {
                      '@id': 'art3_cpt',
                      p: 'Texto do caput do Artigo 3.',
                    },
                    Paragrafo: {
                      '@id': 'art3_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'Texto do parágrafo único do artigo 3.',
                    },
                  },
                  {
                    '@id': 'art4',
                    Rotulo: 'Art. 4º',
                    Caput: {
                      '@id': 'art4_cpt',
                      p: 'Texto do caput do Artigo 4:',
                      Inciso: [
                        {
                          '@id': 'art4_cpt_inc1',
                          Rotulo: 'I –',
                          p: 'texto do inciso  1 da caput do artigo 4:',
                          Alinea: [
                            {
                              '@id': 'art4_cpt_inc2_ali1',
                              Rotulo: 'a)',
                              p: 'Texto da alinea 1 do inciso 1 do caput do artigo 4;',
                            },
                            {
                              '@id': 'art4_cpt_inc3_ali2',
                              Rotulo: 'b)',
                              p: 'Texto da alinea 2 do inciso 1 do caput do artigo 4;',
                            },
                            {
                              '@id': 'art4_cpt_inc3_ali3',
                              Rotulo: 'c)',
                              p: 'Texto da alinea 3 do inciso 1 do caput do artigo 4:',
                              Item: [
                                {
                                  '@id': 'art4_cpt_inc3_ali3_ite1',
                                  Rotulo: '1.',
                                  p: 'Texto do item 1 da alinea 1 do inciso 1 do artigo 4;',
                                },
                                {
                                  '@id': 'art4_cpt_inc3_ali3_ite2',
                                  Rotulo: '2.',
                                  p: 'Texto do item 2 da alinea 1 do inciso 1 do artigo 4.',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          '@id': 'art4_cpt_inc2',
                          Rotulo: 'II –',
                          p: 'texto do inciso  2 da caput do artigo 4;',
                        },
                        {
                          '@id': 'art4_cpt_inc3',
                          Rotulo: 'III –',
                          p: 'texto do inciso  3 da caput do artigo 4;',
                        },
                        {
                          '@id': 'art4_cpt_inc4',
                          Rotulo: 'IV –',
                          p: 'texto do inciso  4 da caput do artigo 4.',
                        },
                      ],
                    },
                    Paragrafo: {
                      '@id': 'art4_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'Texto do parágrafo 1 do artigo 4.',
                    },
                  },
                  {
                    '@id': 'art5',
                    Rotulo: 'Art. 5º',
                    Caput: {
                      '@id': 'art5_cpt',
                      p: 'Texto do caput do Artigo 5.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
