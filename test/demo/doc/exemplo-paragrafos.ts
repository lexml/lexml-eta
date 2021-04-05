export const EXEMPLO_PARAGRAFOS = {
  Articulacao: {
    Artigo: [
      {
        '@id': 'art1',
        Rotulo: 'Art. 1º',
        Caput: {
          '@id': 'art1_cpt',
          p: 'Texto do caput do Artigo 1 que possui DOIS parágrafos.',
        },
        Paragrafo: [
          {
            '@id': 'art1_par1',
            Rotulo: '§ 1º',
            p: 'Texto do parágrafo 1 do Artigo 1 que não possui incisos.',
          },
          {
            '@id': 'art1_par2',
            Rotulo: '§ 2º',
            p: 'Texto do parágrafo 2 do Artigo 1 que não possui incisos.',
          },
        ],
      },
      {
        '@id': 'art2',
        Rotulo: 'Art. 2º',
        Caput: {
          '@id': 'art2_cpt',
          p: 'Texto do caput do Artigo 2 que possui DOIS incisos e um parágrafo único:',
          Inciso: [
            {
              '@id': 'art2_cpt_inc1',
              Rotulo: 'I –',
              p: 'texto do inciso I do caput do Artigo 2;',
            },
            {
              '@id': 'art2_cpt_inc2',
              Rotulo: 'II –',
              p: 'texto do inciso II do caput do Artigo 2.',
            },
          ],
        },
        Paragrafo: {
          '@id': 'art2_par1u',
          Rotulo: 'Parágrafo único.',
          p: 'Texto do parágrafo único do artigo 2:',
          Inciso: [
            {
              '@id': 'art2_par1u_inc1',
              Rotulo: 'I –',
              p: 'texto do inciso I do parágrafo único do artigo 2;',
            },
            {
              '@id': 'art3_par1u_inc2',
              Rotulo: 'II –',
              p: 'texto do inciso II do parágrafo único do artigo 2.',
            },
          ],
        },
      },
      {
        '@id': 'art3',
        Rotulo: 'Art. 3º',
        Caput: {
          '@id': 'art3_cpt',
          p: 'Texto do caput do artigo 3 que possui DOIS parágrafos sendo que o primeiro tem DOIS incisos.',
        },
        Paragrafo: [
          {
            '@id': 'art3_par1',
            Rotulo: '§ 1º',
            p: 'Texto do parágrafo 1 do Artigo 3 que possui incisos:',
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
          {
            '@id': 'art3_par2',
            Rotulo: '§ 2º',
            p: 'Texto do parágrafo 2 do Artigo 3 que não possui incisos.',
          },
        ],
      },
    ],
  },
};
