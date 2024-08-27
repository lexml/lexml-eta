export const MPV_1234_2024 = {
  name: {
    namespaceURI: 'http://www.lexml.gov.br/1.0',
    localPart: 'LexML',
    prefix: '',
    key: '{http://www.lexml.gov.br/1.0}LexML',
    string: '{http://www.lexml.gov.br/1.0}LexML',
  },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.LexML',
    metadado: {
      TYPE_NAME: 'br_gov_lexml__1.Metadado',
      identificacao: {
        TYPE_NAME: 'br_gov_lexml__1.Identificacao',
        urn: 'urn:lex:br:federal:medida.provisoria:2024-06-18;1234',
      },
    },
    projetoNorma: {
      TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
      norma: {
        TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
        parteInicial: {
          TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
          epigrafe: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'epigrafe',
            content: ['MEDIDA PROVISÓRIA Nº 1.234, DE 18 DE JUNHO DE 2024 '],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              'Altera a ',
              {
                name: {
                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                  localPart: 'span',
                  prefix: '',
                  key: '{http://www.lexml.gov.br/1.0}span',
                  string: '{http://www.lexml.gov.br/1.0}span',
                },
                value: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  href: 'urn:lex:br:federal:medida.provisoria:2024-06-07;1230',
                  content: ['Medida Provisória nº 1.230, de 7 de junho de 2024'],
                },
              },
              ', para dispor sobre a elegibilidade para recebimento do Apoio Financeiro destinado às trabalhadoras e aos trabalhadores domésticos e às pescadoras e aos pescadores profissionais artesanais em Municípios do Estado do Rio Grande do Sul com estado de calamidade pública ou situação de emergência reconhecidos pelo Poder Executivo federal. \n',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: [
                  '\n    O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei: \n  ',
                ],
              },
            ],
          },
        },
        articulacao: {
          TYPE_NAME: 'br_gov_lexml__1.Articulacao',
          lXhier: [
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Artigo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Artigo',
                string: '{http://www.lexml.gov.br/1.0}Artigo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'art1',
                rotulo: 'Art. 1º',
                lXcontainersOmissis: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Caput',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Caput',
                      string: '{http://www.lexml.gov.br/1.0}Caput',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                      id: 'art1_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    A ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:medida.provisoria:2024-06-07;1230',
                                content: ['Medida Provisória nº 1.230, de 7 de junho de 2024'],
                              },
                            },
                            ', passa a vigorar com as seguintes alterações: \n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:medida.provisoria:2024-06-07;1230',
                        id: 'art1_cpt_alt1',
                        content: [
                          {
                            name: {
                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                              localPart: 'Artigo',
                              prefix: '',
                              key: '{http://www.lexml.gov.br/1.0}Artigo',
                              string: '{http://www.lexml.gov.br/1.0}Artigo',
                            },
                            value: {
                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                              href: 'art4',
                              id: 'art1_cpt_alt1_art4',
                              abreAspas: 's',
                              rotulo: 'Art. 4º',
                              lXcontainersOmissis: [
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Caput',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Caput',
                                    string: '{http://www.lexml.gov.br/1.0}Caput',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                    href: 'art4_cpt',
                                    id: 'art1_cpt_alt1_art4_cpt',
                                    textoOmitido: 's',
                                  },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art4_omi1',
                                  },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Paragrafo',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                    string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                    href: 'art4_par4',
                                    id: 'art1_cpt_alt1_art4_par4',
                                    rotulo: '§ 4º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    São também elegíveis ao Apoio Financeiro de que trata o art. 1º as trabalhadoras e os trabalhadores domésticos, de que trata a ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'span',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}span',
                                              string: '{http://www.lexml.gov.br/1.0}span',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              href: 'urn:lex:br:federal:lei.complementar:2015-06-01;150',
                                              content: ['Lei Complementar nº 150, de 1º de junho de 2015'],
                                            },
                                          },
                                          ', inscritos no eSocial até 31 de maio de 2024, nos Municípios com estado de calamidade pública ou situação de emergência em áreas efetivamente atingidas, reconhecidos pelo Poder Executivo federal até a data de publicação desta Medida Provisória, não se aplicando o disposto no § 2º. \n\n  ',
                                        ],
                                      },
                                    ],
                                  },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Paragrafo',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                    string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                    href: 'art4_par5',
                                    id: 'art1_cpt_alt1_art4_par5',
                                    rotulo: '§ 5º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    São também elegíveis ao Apoio Financeiro de que trata o art. 1º as pescadoras e os pescadores profissionais artesanais que, na data de publicação desta Medida Provisória, sejam beneficiários do Seguro-Desemprego do Pescador Artesanal - Seguro Defeso, previsto no ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'span',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}span',
                                              string: '{http://www.lexml.gov.br/1.0}span',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              href: 'urn:lex:br:federal:lei:2003-11-25;10779!art1',
                                              content: ['art. 1º da Lei nº 10.779, de 25 de novembro de 2003'],
                                            },
                                          },
                                          ', nos Municípios com estado de calamidade pública ou situação de emergência em áreas efetivamente atingidas, reconhecidos pelo Poder Executivo federal até a data de publicação desta Medida Provisória, desde que não estejam recebendo parcelas referentes ao benefício do seguro-desemprego pagas durante o período de defeso de atividade pesqueira para a preservação da espécie. \n\n  ',
                                        ],
                                      },
                                    ],
                                  },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art4_omi2',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Artigo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Artigo',
                string: '{http://www.lexml.gov.br/1.0}Artigo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'art2',
                rotulo: 'Art. 2º',
                lXcontainersOmissis: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Caput',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Caput',
                      string: '{http://www.lexml.gov.br/1.0}Caput',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                      id: 'art2_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    Esta Medida Provisória entra em vigor na data de sua publicação.\n\n  '],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};
