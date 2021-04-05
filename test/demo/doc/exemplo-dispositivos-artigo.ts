export const EXEMPLO_DISPOSITIVOS_ARTIGO = {
  Articulacao: {
    Artigo: [
      {
        '@id': 'art1',
        Rotulo: 'Art. 1º',
        Caput: {
          '@id': 'art1_cpt',
          p: 'Texto do caput do Artigo 1 que possui um inciso:',
          Inciso: [
            {
              '@id': 'art1_cpt_inc1',
              Rotulo: 'I –',
              p: 'texto do inciso do caput do Artigo 1.',
            },
          ],
        },
      },
      {
        '@id': 'art2',
        Rotulo: 'Art. 2º',
        Caput: {
          '@id': 'art2_cpt',
          p: 'Texto do caput do Artigo 1 que possui DOIS incisos sendo que o primeiro possui alíneas:',
          Inciso: [
            {
              '@id': 'art2_cpt_inc1',
              Rotulo: 'I –',
              p: 'texto do inciso I do caput do Artigo 2:',
              Alinea: [
                {
                  '@id': 'art2_cpt_inc1_ali1',
                  Rotulo: 'a)',
                  p: 'texto da alinea 1 do inciso 1 do caput do artigo 2:',
                  Item: [
                    {
                      Rotulo: '1.',
                      p: 'texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.',
                    },
                  ],
                },
                {
                  '@id': 'art2_cpt_inc1_ali2',
                  Rotulo: 'b)',
                  p: 'texto da alinea 2 do inciso 1 do caput do artigo 2:',
                  Item: [
                    {
                      Rotulo: '1.',
                      p: 'texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;',
                    },
                    {
                      Rotulo: '2.',
                      p: 'texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.',
                    },
                  ],
                },
              ],
            },
            {
              '@id': 'art2_cpt_inc2',
              Rotulo: 'II –',
              p: 'texto do inciso II do caput do Artigo 2.',
            },
          ],
        },
      },
      {
        '@id': 'art3',
        Rotulo: 'Art. 3º',
        Caput: {
          '@id': 'art3_cpt',
          p: 'Texto do caput do artigo 3 que possui um inciso e um parágafo com incisos:',
          Inciso: [
            {
              '@id': 'art3_cpt_inc1',
              Rotulo: 'I –',
              p: 'texto do inciso I do caput do Artigo 3;',
            },
            {
              '@id': 'art3_cpt_inc2',
              Rotulo: 'II –',
              p: 'texto do inciso II do caput do Artigo 3:',
              Alinea: [
                {
                  '@id': 'art3_cpt_inc2_ali1',
                  Rotulo: 'a)',
                  p: 'texto da alinea 1 do inciso 2 do caput do artigo 3:',
                  Item: [
                    {
                      Rotulo: '1.',
                      p: 'texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.',
                    },
                  ],
                },
                {
                  '@id': 'art3_cpt_inc2_ali2',
                  Rotulo: 'b)',
                  p: 'texto da alinea 2 do inciso 2 do caput do artigo 3:',
                  Item: [
                    {
                      Rotulo: '1.',
                      p: 'texto do item 1 da alinea 2 do inciso 2 do caput do artigo 3;',
                    },
                    {
                      Rotulo: '2.',
                      p: 'texto do item 2 da alinea 2 do inciso 2 do caput do artigo 3.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        Paragrafo: [
          {
            '@id': 'art3_par1',
            Rotulo: 'Parágrafo único.',
            p: 'Texto do parágrafo único do Artigo 3 que possui incisos:',
            Inciso: [
              {
                '@id': 'art3_par1_inc1',
                Rotulo: 'I –',
                p: 'texto do inciso I do parágrafo 1 do artigo 3;',
              },
              {
                '@id': 'art3_par1_inc2',
                Rotulo: 'II –',
                p: 'texto do inciso II do parágrafo 1 do artigo 3.',
              },
            ],
          },
        ],
      },
      {
        '@id': 'art4',
        Rotulo: 'Art. 1º',
        Caput: {
          '@id': 'art4_cpt',
          p: 'Texto do caput do Artigo 4 que possui um inciso e um parágrafo:',
          Inciso: [
            {
              '@id': 'art4_cpt_inc1',
              Rotulo: 'I –',
              p: 'texto do inciso I do caput do Artigo 4;',
            },
            {
              '@id': 'art4_cpt_inc2',
              Rotulo: 'I –',
              p: 'texto do inciso II do caput do Artigo 4.',
            },
          ],
        },
        Paragrafo: {
          '@id': 'art4_par1',
          Rotulo: 'Parágrafo único.',
          p: 'Texto do parágrafo único do Artigo 4 que não possui incisos.',
        },
      },
    ],
  },
};
