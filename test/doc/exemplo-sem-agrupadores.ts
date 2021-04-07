export const EXEMPLO_SEM_AGRUPADORES = {
  Articulacao: {
    Artigo: [
      {
        '@id': 'art1',
        Rotulo: 'Art. 1º',
        Caput: {
          '@id': 'art1_cpt',
          p: 'Toda pessoa é capaz de direitos e deveres na ordem civil.',
        },
      },
      {
        '@id': 'art2',
        Rotulo: 'Art. 2º',
        Caput: {
          '@id': 'art2_cpt',
          p: 'A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.',
        },
      },
      {
        '@id': 'art3',
        Rotulo: 'Art. 3º',
        Caput: {
          '@id': 'art3_cpt',
          p: 'São absolutamente incapazes de exercer pessoalmente os atos da vida civil:',
          Inciso: [
            {
              '@id': 'art3_cpt_inc1',
              Rotulo: 'I –',
              p: 'os menores de dezesseis anos;',
            },
            {
              '@id': 'art3_cpt_inc2',
              Rotulo: 'II –',
              p: 'os que, por enfermidade ou deficiência mental, não tiverem o necessário discernimento para a prática desses atos;',
            },
            {
              '@id': 'art3_cpt_inc3',
              Rotulo: 'III –',
              p: 'os que, mesmo por causa transitória, não puderem exprimir sua vontade.',
            },
          ],
        },
        Paragrafo: {
          '@id': 'art3_par1u',
          Rotulo: 'Parágrafo único.',
          p: 'Parágrafo único do artigo 3.',
          Inciso: [
            {
              '@id': 'art3_par1u_inc1',
              Rotulo: 'I –',
              p:
                'pela concessão dos pais, ou de um deles na falta do outro, mediante instrumento público, independentemente de homologação judicial, ou por sentença do juiz, ouvido o tutor, se o menor tiver dezesseis anos completos;',
            },
            {
              '@id': 'art3_par1u_inc2',
              Rotulo: 'II –',
              p: 'pelo casamento;',
            },
          ],
        },
      },
      {
        '@id': 'art4',
        Rotulo: 'Art. 4º',
        Caput: {
          '@id': 'art4_cpt',
          p: 'São incapazes, relativamente a certos atos, ou à maneira de os exercer:',
          Inciso: [
            {
              '@id': 'art4_cpt_inc1',
              Rotulo: 'I –',
              p: 'os maiores de dezesseis e menores de dezoito anos:',
              Alinea: [
                {
                  '@id': 'art4_cpt_inc3_ali1',
                  Rotulo: 'a)',
                  p: 'Texto da alinea 1 do inciso 3 do caput do artigo 4;',
                },
                {
                  '@id': 'art4_cpt_inc3_ali2',
                  Rotulo: 'b)',
                  p: 'Texto da alinea 2 do inciso 3 do caput do artigo 4;',
                },
                {
                  '@id': 'art4_cpt_inc3_ali3',
                  Rotulo: 'c)',
                  p: 'Texto da alinea 1 do inciso 4 do caput do artigo 4:',
                  Item: [
                    {
                      '@id': 'art4_cpt_inc3_ali3_ite1',
                      Rotulo: '1.',
                      p: 'Um item;',
                    },
                    {
                      '@id': 'art4_cpt_inc3_ali3_ite2',
                      Rotulo: '2.',
                      p: 'outro item.',
                    },
                  ],
                },
              ],
            },
            {
              '@id': 'art4_cpt_inc2',
              Rotulo: 'II –',
              p: 'os ébrios habituais, os viciados em tóxicos, e os que, por deficiência mental, tenham o discernimento reduzido;',
            },
            {
              '@id': 'art4_cpt_inc3',
              Rotulo: 'III –',
              p: 'os excepcionais, sem desenvolvimento mental completo;',
            },
            {
              '@id': 'art4_cpt_inc4',
              Rotulo: 'IV –',
              p: 'os pródigos.',
            },
          ],
        },
        Paragrafo: {
          '@id': 'art4_par1u',
          Rotulo: 'Parágrafo único.',
          p: 'A capacidade dos índios será regulada por legislação especial.',
        },
      },
      {
        '@id': 'art5',
        Rotulo: 'Art. 5º',
        Caput: {
          '@id': 'art5_cpt',
          p: 'A menoridade cessa aos dezoito anos completos, quando a pessoa fica habilitada à prática de todos os atos da vida civil.',
        },
        Paragrafo: {
          '@id': 'art5_par1u',
          Rotulo: 'Parágrafo único.',
          p: 'Cessará, para os menores, a incapacidade:',
          Inciso: [
            {
              '@id': 'art5_par1u_inc1',
              Rotulo: 'I –',
              p:
                'pela concessão dos pais, ou de um deles na falta do outro, mediante instrumento público, independentemente de homologação judicial, ou por sentença do juiz, ouvido o tutor, se o menor tiver dezesseis anos completos;',
            },
            {
              '@id': 'art5_par1u_inc2',
              Rotulo: 'II –',
              p: 'pelo casamento;',
            },
            {
              '@id': 'art5_par1u_inc3',
              Rotulo: 'III –',
              p: 'pelo exercício de emprego público efetivo;',
            },
            {
              '@id': 'art5_par1u_inc4',
              Rotulo: 'IV –',
              p: 'pela colação de grau em curso de ensino superior;',
            },
            {
              '@id': 'art5_par1u_inc5',
              Rotulo: 'V –',
              p:
                'pelo estabelecimento civil ou comercial, ou pela existência de relação de emprego, desde que, em função deles, o menor com dezesseis anos completos tenha economia própria.',
            },
          ],
        },
      },
    ],
  },
};
