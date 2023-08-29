export const MPV_1171_2023 = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2023-04-30;1171',
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
            content: ['MEDIDA PROVISÓRIA Nº 1.171, DE 30 DE ABRIL DE 2023 '],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              'Dispõe sobre a tributação da renda auferida por pessoas físicas residentes no País em aplicações financeiras, entidades controladas e trusts no exterior, altera os valores da tabela mensal do Imposto sobre a Renda da Pessoa Física de que trata o ',
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
                  href: 'urn:lex:br:federal:lei:2007-05-31;11482!art1',
                  content: ['art. 1º da Lei nº 11.482, de 31 de maio de 2007'],
                },
              },
              ', e altera os valores de dedução previstos no ',
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
                  href: 'urn:lex:br:federal:lei:1995-12-26;9250!art4',
                  content: ['art. 4º da Lei nº 9.250, de 26 de dezembro de 1995'],
                },
              },
              '.\n',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: [
                  '\n    O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:\n  ',
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
                localPart: 'Titulo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Titulo',
                string: '{http://www.lexml.gov.br/1.0}Titulo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'tit1',
                rotulo: 'TÍTULO I',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['\n    DA TRIBUTAÇÃO DA RENDA AUFERIDA NO EXTERIOR\n\n  '],
                },
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
                                  '\n    A renda auferida por pessoas físicas residentes no País em aplicações financeiras, entidades controladas e trusts no exterior será tributada pelo Imposto sobre a Renda das Pessoas Físicas - IRPF segundo o disposto nesta Medida Provisória.\n\n  ',
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'tit1_cap1',
                      rotulo: 'CAPÍTULO I',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    DISPOSIÇÕES GERAIS\n\n  '],
                      },
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
                                      content: [
                                        '\n    A pessoa física residente no País computará, a partir de 1º de janeiro de 2024, de forma separada dos demais rendimentos e dos ganhos de capital, na Declaração de Ajuste Anual - DAA, os rendimentos do capital aplicado no exterior, nas modalidades de aplicações financeiras, lucros e dividendos de entidades controladas e bens e direitos objeto de trust.\n\n  ',
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
                                  id: 'art2_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os rendimentos de que trata o caput ficarão sujeitos à incidência do IRPF, no ajuste anual, pelas seguintes alíquotas, não se aplicando nenhuma dedução da base de cálculo:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art2_par1_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    0% (zero por cento) sobre a parcela anual dos rendimentos que não ultrapassar R$ 6.000,00 (seis mil reais);\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art2_par1_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    15% (quinze por cento) sobre a parcela anual dos rendimentos que exceder a R$ 6.000,00 (seis mil reais) e não ultrapassar R$ 50.000,00 (cinquenta mil reais);\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art2_par1_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    22,5% (vinte e dois inteiros e cinco décimos por cento) sobre a parcela anual dos rendimentos que ultrapassar R$ 50.000,00 (cinquenta mil reais).\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art2_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os ganhos de capital percebidos pela pessoa física residente no País na alienação, na baixa ou na liquidação de bens e direitos localizados no exterior que não constituam aplicações financeiras nos termos desta Medida Provisória permanecem sujeitos às regras específicas de tributação dispostas no ',
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
                                            href: 'urn:lex:br:federal:lei:1995-01-20;8981!art21',
                                            content: ['art. 21 da Lei nº 8.981, de 20 de janeiro de 1995'],
                                          },
                                        },
                                        '.\n\n  ',
                                      ],
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
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'tit1_cap2',
                      rotulo: 'CAPÍTULO II',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    DAS APLICAÇÕES FINANCEIRAS NO EXTERIOR\n\n  '],
                      },
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
                            id: 'art3',
                            rotulo: 'Art. 3º',
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
                                  id: 'art3_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os rendimentos auferidos a partir de 1º de janeiro de 2024 em aplicações financeiras no exterior pelas pessoas físicas residentes no País serão tributados na forma prevista no art. 2º.\n\n  ',
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
                                  id: 'art3_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Para fins do disposto deste artigo, consideram-se:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art3_par1_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    aplicações financeiras - exemplificativamente, depósitos bancários, certificados de depósitos, cotas de fundos de investimento, com exceção daqueles tratados como entidades controladas no exterior, instrumentos financeiros, apólices de seguro, certificados de investimento ou operações de capitalização, depósitos em cartões de crédito, fundos de aposentadoria ou pensão, títulos de renda fixa e de renda variável, derivativos e participações societárias, com exceção daquelas tratadas como entidades controladas no exterior; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art3_par1_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    rendimentos - remuneração produzida pelas aplicações financeiras, incluindo, exemplificativamente, variação cambial da moeda estrangeira frente à moeda nacional, juros, prêmios, comissões, ágio, deságio, participações nos lucros, dividendos e ganhos em negociações no mercado secundário, incluindo ganhos na venda de ações das entidades não controladas em bolsa de valores no exterior.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art3_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os rendimentos de que trata o caput serão computados na DAA e submetidos à incidência do IRPF no período de apuração em que forem efetivamente percebidos pela pessoa física, no resgate, na amortização, na alienação, no vencimento ou na liquidação das aplicações financeiras.\n\n  ',
                                      ],
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
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'tit1_cap3',
                      rotulo: 'CAPÍTULO III',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    DAS ENTIDADES CONTROLADAS NO EXTERIOR\n\n  '],
                      },
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
                            id: 'art4',
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
                                  id: 'art4_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os lucros apurados a partir de 1º de janeiro de 2024 pelas entidades controladas no exterior por pessoas físicas residentes no País, enquadradas nas hipóteses previstas neste artigo, serão tributados em 31 de dezembro de cada ano, na forma prevista no art. 2º.\n\n  ',
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
                                  id: 'art4_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Para fins do disposto nesta Medida Provisória, serão consideradas como controladas as sociedades e as demais entidades, personificadas ou não, incluindo fundos de investimento e fundações, em que a pessoa física:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par1_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    detiver, de forma direta ou indireta, isoladamente ou em conjunto com outras partes, inclusive em função da existência de acordos de votos, direitos que lhe assegurem preponderância nas deliberações sociais ou poder de eleger ou destituir a maioria dos seus administradores; ou\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par1_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    possuir, direta ou indiretamente, isoladamente ou em conjunto com pessoas vinculadas, mais de 50% (cinquenta por cento) de participação no capital social, ou equivalente, ou nos direitos à percepção de seus lucros, ou ao recebimento de seus ativos na hipótese de sua liquidação.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art4_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Para fins do disposto no inciso II do § 1º, será considerada pessoa vinculada à pessoa física residente no País:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par2_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    a pessoa física que for cônjuge, companheiro ou parente, consanguíneo ou afim, até o terceiro grau, da pessoa física residente no País;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par2_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    a pessoa jurídica cujos diretores ou administradores forem cônjuges, companheiros ou parentes, consanguíneos ou afins, até o terceiro grau, da pessoa física residente no País;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par2_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    a pessoa jurídica da qual a pessoa física residente no País for sócia, titular ou cotista; ou\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par2_inc4',
                                        rotulo: 'IV –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    a pessoa física que for sócia da pessoa jurídica da qual a pessoa física residente no País seja sócia, titular ou cotista.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art4_par3',
                                  rotulo: '§ 3º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Para fins de aplicação do disposto nos incisos III e IV do § 2º, serão consideradas as participações que representarem mais de 10% (dez por cento) do capital votante.\n\n  ',
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
                                  id: 'art4_par4',
                                  rotulo: '§ 4º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Sujeitam-se ao regime tributário deste artigo somente as controladas que se enquadrarem em uma ou mais das seguintes hipóteses:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par4_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    estejam localizadas em país ou dependência com tributação favorecida ou sejam beneficiárias de regime fiscal privilegiado, de que tratam os ',
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
                                                  href: 'urn:lex:br:federal:lei:1996-12-27;9430!art24',
                                                  content: ['art. 24'],
                                                },
                                              },
                                              ' e ',
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
                                                  href: 'urn:lex:br:federal:lei:1996-12-27;9430!art24-1',
                                                  content: ['art. 24-A da Lei nº 9.430, de 27 de dezembro de 1996'],
                                                },
                                              },
                                              '; ou\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par4_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    apurem renda ativa própria inferior a 80% (oitenta por cento) da renda total.\n\n  '],
                                          },
                                        ],
                                      },
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
                                  id: 'art4_par5',
                                  rotulo: '§ 5º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Para fins do disposto neste artigo, considera-se:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par5_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    renda ativa própria - aquela obtida diretamente pela pessoa jurídica mediante a exploração de atividade econômica própria, excluídas as receitas decorrentes, exclusivamente, de:\n\n  ',
                                            ],
                                          },
                                        ],
                                        lXcontainersOmissis: [
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali1',
                                              rotulo: 'a)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    royalties;\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali2',
                                              rotulo: 'b)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    juros;\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali3',
                                              rotulo: 'c)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    dividendos;\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali4',
                                              rotulo: 'd)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    participações societárias;\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali5',
                                              rotulo: 'e)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    aluguéis;\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali6',
                                              rotulo: 'f)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: [
                                                    '\n    ganhos de capital, exceto na alienação de participações societárias ou ativos de caráter permanente adquiridos há mais de dois anos;\n\n  ',
                                                  ],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali7',
                                              rotulo: 'g)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    aplicações financeiras; e\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art4_par5_inc1_ali8',
                                              rotulo: 'h)',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['\n    intermediação financeira.\n\n  '],
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par5_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    renda total - somatório de todas as receitas, incluindo as não operacionais.\n\n  '],
                                          },
                                        ],
                                      },
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
                                  id: 'art4_par6',
                                  rotulo: '§ 6º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Os lucros das controladas de que trata este artigo serão:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par6_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    apurados de forma individualizada, em balanço anual da controlada no exterior, elaborado com observância aos princípios contábeis, de acordo com o disposto na legislação;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par6_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    convertidos em moeda nacional pela cotação de fechamento do dólar dos Estados Unidos da América divulgada, para venda, pelo Banco Central do Brasil, para o último dia útil do mês de dezembro;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par6_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    computados na DAA, em 31 de dezembro do ano em que forem apurados no balanço, independentemente de qualquer deliberação acerca da sua distribuição, na proporção da participação da pessoa física no capital social, ou equivalente, da controlada no exterior, e submetidos à incidência do IRPF no respectivo período de apuração; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art4_par6_inc4',
                                        rotulo: 'IV –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    incluídos na DAA, na ficha de bens e direitos, como custo de aquisição adicional do investimento e, quando distribuídos para a pessoa física controladora, reduzirão o custo de aquisição do investimento e não serão tributados novamente.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art4_par7',
                                  rotulo: '§ 7º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Poderão ser deduzidos do lucro da controlada os prejuízos apurados em balanço, pela própria controlada, a partir da data em que preencher os requisitos de que trata o § 1º, desde que referentes a períodos posteriores à data de produção de efeitos desta Medida Provisória e anteriores à data da apuração dos lucros.\n\n  ',
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
                                  id: 'art4_par8',
                                  rotulo: '§ 8º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Poderá ser deduzida do lucro da pessoa jurídica controlada a parcela correspondente aos lucros e dividendos de suas investidas que sejam pessoas jurídicas domiciliadas no País.\n\n  ',
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
                                  id: 'art4_par9',
                                  rotulo: '§ 9º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Na determinação do imposto devido, a pessoa física poderá deduzir, na proporção de sua participação no capital social, ou equivalente, o imposto sobre a renda pago no exterior pela controlada e suas investidas, incidente sobre o lucro computado na base de cálculo do imposto a que se refere este artigo, até o limite do imposto devido no País.\n\n  ',
                                      ],
                                    },
                                  ],
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
                            id: 'art5',
                            rotulo: 'Art. 5º',
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
                                  id: 'art5_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Serão tributados no momento da efetiva disponibilização para a pessoa física residente no País, na forma prevista no art. 2º:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art5_cpt_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    os lucros apurados até 31 de dezembro de 2023 pelas controladas no exterior de pessoas físicas residentes no País, enquadradas ou não nas hipóteses previstas no § 4º do art. 4º; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art5_cpt_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    os lucros apurados a partir de 1º de janeiro de 2024 pelas controladas no exterior de pessoas físicas residentes no País que não se enquadrarem nas hipóteses previstas no § 4º do art. 4º.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art5_par1u',
                                  rotulo: 'Parágrafo único.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Para fins do disposto neste artigo, os lucros serão considerados efetivamente disponibilizados para a pessoa física residente no País:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art5_par1u_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    no pagamento, no crédito, na entrega, no emprego ou na remessa dos lucros, o que ocorrer primeiro; ou\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art5_par1u_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    em quaisquer operações de crédito realizadas com a pessoa física, ou com pessoa a ela vinculada, conforme o disposto no § 2º do art. 4º, se a credora possuir lucros ou reservas de lucros.\n\n  ',
                                            ],
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
                            id: 'art6',
                            rotulo: 'Art. 6º',
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
                                  id: 'art6_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    A variação cambial do principal aplicado nas controladas no exterior, enquadradas ou não nas hipóteses previstas no § 4º do art. 4º, comporá o ganho de capital percebido pela pessoa física no momento da alienação, da baixa ou da liquidação do investimento, inclusive por meio de devolução de capital.\n\n  ',
                                      ],
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
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'tit1_cap4',
                      rotulo: 'CAPÍTULO IV',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    DOS TRUSTS NO EXTERIOR\n\n  '],
                      },
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
                            id: 'art7',
                            rotulo: 'Art. 7º',
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
                                  id: 'art7_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Para fins do disposto nesta Medida Provisória, os bens e direitos objeto de trust no exterior serão considerados como:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art7_cpt_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    permanecendo sob titularidade do instituidor após a instituição do trust; e\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art7_cpt_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    passando à titularidade do beneficiário no momento da distribuição pelo trust para o beneficiário ou do falecimento do instituidor, o que ocorrer primeiro.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art7_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os rendimentos e ganhos de capital relativos aos bens e direitos objeto do trust auferidos a partir de 1º de janeiro de 2024 serão:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art7_par1_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    considerados auferidos pelo titular de tais bens e direitos na respectiva data, conforme o disposto nos incisos I e II do caput; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art7_par1_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    submetidos à incidência do IRPF segundo as regras aplicáveis ao titular.\n\n  '],
                                          },
                                        ],
                                      },
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
                                  id: 'art7_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Caso o trust detenha uma controlada no exterior, esta será considerada como detida diretamente pelo titular dos bens e direitos objeto do trust, aplicando-se as regras de tributação de investimentos em controladas no exterior previstas no Capítulo III.\n\n  ',
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
                                  id: 'art7_par3',
                                  rotulo: '§ 3º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Para fins do disposto nesta Medida Provisória, a distribuição pelo trust ao beneficiário, a partir de 1º de janeiro de 2024, possuirá natureza jurídica de transmissão a título gratuito pelo instituidor para o beneficiário, consistindo em doação, se ocorrida durante a vida do instituidor, ou transmissão causa mortis, se decorrente do falecimento do instituidor.\n\n  ',
                                      ],
                                    },
                                  ],
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
                            id: 'art8',
                            rotulo: 'Art. 8º',
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
                                  id: 'art8_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Os bens e direitos objeto do trust, independentemente da data da sua aquisição, deverão, a partir de 1º de janeiro de 2024, em relação à data-base de 31 de dezembro de 2023, ser declarados diretamente pelo titular na DAA, pelo custo de aquisição.\n\n  ',
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
                                  id: 'art8_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Caso o titular tenha informado anteriormente o trust na sua DAA, o trust deverá ser substituído pelos bens e direitos subjacentes, alocando-se o custo de aquisição para cada um desses bens e direitos, considerando a proporção do valor de cada bem ou direito frente ao valor total do patrimônio objeto do trust.\n\n  ',
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
                                  id: 'art8_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Caso a pessoa que tenha informado anteriormente o trust na sua DAA seja distinta do titular estabelecido por esta Medida Provisória, o declarante poderá, excepcionalmente, ser considerado como o titular para efeitos do IRPF.\n\n  ',
                                      ],
                                    },
                                  ],
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
                            id: 'art9',
                            rotulo: 'Art. 9º',
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
                                  id: 'art9_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Para fins do disposto nesta Medida Provisória, considera-se:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    trust - figura contratual regida por lei estrangeira que dispõe sobre a relação jurídica entre o instituidor, o trustee e os beneficiários, em relação aos bens e direitos indicados na escritura do trust;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    instituidor (settlor) - a pessoa física que, por meio da escritura do trust, destina bens e direitos de sua titularidade para formar o trust;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    administrador do trust (trustee) - a pessoa física ou instituição responsável por administrar os bens e direitos objeto do trust, de acordo com as regras da escritura do trust e da carta de desejos;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc4',
                                        rotulo: 'IV –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    beneficiário (beneficiary) - uma ou mais pessoas indicadas pelo instituidor para receber do administrador do trust os bens e direitos objeto do trust, acrescidos dos seus frutos, de acordo com as regras estabelecidas na escritura do trust e na carta de desejos;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc5',
                                        rotulo: 'V –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    distribuição (distribution) - qualquer ato de disposição de bens e direitos objeto do trust em favor do beneficiário, tais como a disponibilização da posse, usufruto e propriedade de bens e direitos;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc6',
                                        rotulo: 'VI –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    escritura do trust (trust deed) - ato escrito de manifestação de vontade do instituidor que rege a constituição e o funcionamento do trust, incluindo as regras de distribuição dos bens e direitos aos beneficiários, além de eventuais encargos, termos e condições; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_cpt_inc7',
                                        rotulo: 'VII –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    carta de desejos (letter of wishes) - ato suplementar que pode ser escrito pelo instituidor em relação às regras de funcionamento do trust e da distribuição de bens e direitos para os beneficiários.\n\n  ',
                                            ],
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
                      ],
                    },
                  },
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'tit1_cap5',
                      rotulo: 'CAPÍTULO V',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    DA ATUALIZAÇÃO DO VALOR DOS BENS E DIREITOS NO EXTERIOR\n\n  '],
                      },
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
                            id: 'art10',
                            rotulo: 'Art. 10.',
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
                                  id: 'art10_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    A pessoa física residente no País poderá optar por atualizar o valor dos bens e direitos no exterior informados na sua DAA para o valor de mercado em 31 de dezembro de 2022 e tributar a diferença para o custo de aquisição, pelo IRPF, à alíquota definitiva de 10% (dez por cento).\n\n  ',
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
                                  id: 'art10_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    A opção de que trata o caput se aplica a:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par1_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    aplicações financeiras de que trata o inciso I do § 1º do art. 3º;\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par1_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    bens imóveis em geral ou ativos que representem direitos sobre bens imóveis;\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par1_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    veículos, aeronaves, embarcações e demais bens móveis sujeitos a registro em geral, ainda que em alienação fiduciária; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par1_inc4',
                                        rotulo: 'IV –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    participações em entidades controladas, observado o disposto no art. 4º.\n\n  '],
                                          },
                                        ],
                                      },
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
                                  id: 'art10_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Para fins da tributação de que trata o caput, os bens e direitos serão atualizados para o seu valor de mercado em 31 de dezembro de 2022:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par2_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    para os ativos de que trata o inciso I do § 1º, o saldo existente na data-base, conforme documento disponibilizado pela instituição financeira custodiante;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par2_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    para os ativos de que tratam os incisos II e III do § 1º, o valor de mercado na data-base conforme avaliação feita por entidade especializada; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par2_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    para os ativos de que trata o inciso IV do § 1º, o valor do patrimônio líquido proporcional à participação no capital social, ou equivalente, conforme demonstrações financeiras preparadas com observância aos princípios contábeis do País, com suporte em documentação hábil e idônea, incluindo a identificação do capital social, ou equivalente, reserva de capital, lucros acumulados e reservas de lucros.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art10_par3',
                                  rotulo: '§ 3º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Para fins de apuração do valor dos bens e direitos em reais, o valor expresso em moeda estrangeira será convertido:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par3_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    em dólar dos Estados Unidos da América, pela cotação de fechamento do dólar dos Estados Unidos da América divulgada, para venda, pelo Banco Central do Brasil, para o último dia útil do ano-calendário de referência de atualização; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par3_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    em moeda nacional, pela cotação de fechamento do dólar dos Estados Unidos da América divulgada, para venda, pelo Banco Central do Brasil, para o último dia útil do ano-calendário de referência de atualização.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art10_par4',
                                  rotulo: '§ 4º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Os saldos tributados na forma prevista neste artigo:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par4_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    serão considerados como acréscimo patrimonial na data em que houver o pagamento do imposto;\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par4_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    serão incluídos na ficha de bens e direitos da DAA como custo de aquisição adicional do respectivo bem ou direito; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par4_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    no caso de controladas no exterior, quando forem disponibilizados para a pessoa física controladora, reduzirão o custo de aquisição do investimento e não serão tributados novamente.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art10_par5',
                                  rotulo: '§ 5º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    O contribuinte poderá optar, inclusive, pela atualização do valor de bens e direitos objeto de trust em relação aos quais a pessoa física seja definida como titular, nos termos desta Medida Provisória.\n\n  ',
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
                                  id: 'art10_par6',
                                  rotulo: '§ 6º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    A opção poderá ser exercida em conjunto ou separadamente para cada bem ou direito no exterior.\n\n  '],
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
                                  id: 'art10_par7',
                                  rotulo: '§ 7º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    O imposto deverá ser pago até 30 de novembro de 2023.\n\n  '],
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
                                  id: 'art10_par8',
                                  rotulo: '§ 8º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    A opção deverá ser exercida na forma e no prazo estabelecidos pela Secretaria Especial da Receita Federal do Brasil do Ministério da Fazenda e deverá conter, no mínimo:\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par8_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    identificação do declarante;\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par8_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    identificação dos bens e direitos;\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par8_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    valor do bem ou direito constante da última DAA relativa ao ano-calendário de 2022; e\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par8_inc4',
                                        rotulo: 'IV –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    valor atualizado do bem ou direito em moeda nacional.\n\n  '],
                                          },
                                        ],
                                      },
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
                                  id: 'art10_par9',
                                  rotulo: '§ 9º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    Não poderão ser objeto de atualização:\n\n  '],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par9_inc1',
                                        rotulo: 'I –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    bens ou direitos que não tiverem sido declarados na DAA relativa ao ano-calendário de 2022, entregue até o dia 31 de maio de 2023;\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par9_inc2',
                                        rotulo: 'II –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    bens ou direitos que tiverem sido alienados, baixados ou liquidados anteriormente à data da formalização da opção de que trata este artigo; e\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art10_par9_inc3',
                                        rotulo: 'III –',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: [
                                              '\n    joias, pedras e metais preciosos, obras de arte, antiguidades de valor histórico ou arqueológico, animais de estimação ou esportivos e material genético de reprodução animal, sujeitos a registro em geral, ainda que em alienação fiduciária.\n\n  ',
                                            ],
                                          },
                                        ],
                                      },
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
                                  id: 'art10_par10',
                                  rotulo: '§ 10.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    A opção de que trata este artigo somente se consumará e se tornará definitiva com o pagamento integral do imposto.\n\n  '],
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
                                  id: 'art10_par11',
                                  rotulo: '§ 11.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Não poderão ser aplicados quaisquer deduções, percentuais ou fatores de redução à base de cálculo, à alíquota ou ao montante devido do imposto de que trata este artigo.\n\n  ',
                                      ],
                                    },
                                  ],
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
                            id: 'art11',
                            rotulo: 'Art. 11.',
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
                                  id: 'art11_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    Especificamente no caso de controladas no exterior, enquadradas ou não nas hipóteses previstas no § 4º do art. 4º, a pessoa física que tiver optado pela atualização até 31 de dezembro de 2022 na forma prevista no art. 10 poderá optar, separadamente, por atualizar o valor de mercado para o período de 1º de janeiro de 2023 a 31 de dezembro de 2023, com pagamento do IRPF pela alíquota definitiva de 10% (dez por cento).\n\n  ',
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
                                  id: 'art11_par1',
                                  rotulo: '§ 1º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    O imposto de que trata este artigo deverá ser pago até 31 de maio de 2024.\n\n  '],
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
                                  id: 'art11_par2',
                                  rotulo: '§ 2º',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    A opção de que trata este artigo está sujeita às disposições do inciso III do § 2º, dos § 3º ao § 5º e dos § 8º ao § 11 do art. 10.\n\n  ',
                                      ],
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
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'tit1_cap6',
                      rotulo: 'CAPÍTULO VI',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    DISPOSIÇÕES FINAIS\n\n  '],
                      },
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
                            id: 'art12',
                            rotulo: 'Art. 12.',
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
                                  id: 'art12_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    A cotação a ser utilizada para converter os valores em moeda estrangeira para moeda nacional é a cotação de fechamento da moeda estrangeira divulgada, para venda, pelo Banco Central do Brasil, para a data do fato gerador, ressalvadas as disposições específicas previstas nesta Medida Provisória.\n\n  ',
                                      ],
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
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Titulo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Titulo',
                string: '{http://www.lexml.gov.br/1.0}Titulo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'tit2',
                rotulo: 'TÍTULO II',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['\n    DA ALTERAÇÃO DOS VALORES DA TABELA MENSAL DO IMPOSTO SOBRE A RENDA DAS PESSOAS FÍSICAS\n\n  '],
                },
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
                      id: 'art13',
                      rotulo: 'Art. 13.',
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
                            id: 'art13_cpt',
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
                                      href: 'urn:lex:br:federal:lei:2007-05-31;11482',
                                      content: ['Lei nº 11.482, de 31 de maio de 2007'],
                                    },
                                  },
                                  ', passa a vigorar com as seguintes alterações:\n\n  ',
                                ],
                              },
                            ],
                            alteracao: {
                              TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                              base: 'urn:lex:br:federal:lei:2007-05-31;11482',
                              id: 'art13_cpt_alt1',
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
                                    href: 'art1',
                                    id: 'art13_cpt_alt1_art1',
                                    abreAspas: 's',
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
                                          href: 'art1_cpt',
                                          id: 'art13_cpt_alt1_art1_cpt',
                                          textoOmitido: 's',
                                          lXcontainersOmissis: [
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
                                                id: 'art13_cpt_alt1_art1_cpt_omi1',
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                href: 'art1_cpt_inc9',
                                                id: 'art13_cpt_alt1_art1_cpt_inc9',
                                                rotulo: 'IX –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    a partir do mês de abril do ano-calendário de 2015 e até o mês de abril do ano-calendário de 2023:\n\n  '],
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
                                                id: 'art13_cpt_alt1_art1_cpt_omi2',
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                href: 'art1_cpt_inc10',
                                                id: 'art13_cpt_alt1_art1_cpt_inc10',
                                                rotulo: 'X –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    a partir do mês de maio do ano-calendário de 2023:\n\n  '],
                                                  },
                                                ],
                                              },
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
                                          id: 'art13_cpt_alt1_art1_omi1',
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
                      id: 'art14',
                      rotulo: 'Art. 14.',
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
                            id: 'art14_cpt',
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
                                      href: 'urn:lex:br:federal:lei:1995-12-26;9250',
                                      content: ['Lei nº 9.250, de 26 de dezembro de 1995'],
                                    },
                                  },
                                  ', passa a vigorar com as seguintes alterações:\n\n  ',
                                ],
                              },
                            ],
                            alteracao: {
                              TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                              base: 'urn:lex:br:federal:lei:1995-12-26;9250',
                              id: 'art14_cpt_alt1',
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
                                    id: 'art14_cpt_alt1_art4',
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
                                          id: 'art14_cpt_alt1_art4_cpt',
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
                                          id: 'art14_cpt_alt1_art4_omi1',
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
                                          href: 'art4_par1',
                                          id: 'art14_cpt_alt1_art4_par1',
                                          rotulo: '§ 1º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A dedução permitida pelo inciso V do caput aplica-se exclusivamente à base de cálculo relativa aos seguintes rendimentos, assegurada, nos demais casos, a dedução dos valores pagos a esse título, por ocasião da apuração da base de cálculo do imposto devido no ano-calendário, conforme disposto na alínea “e” do inciso II do caput do art. 8º:\n\n  ',
                                              ],
                                            },
                                          ],
                                          lXcontainersOmissis: [
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                href: 'art4_par1_inc1',
                                                id: 'art14_cpt_alt1_art4_par1_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    do trabalho com vínculo empregatício ou de administradores; e\n\n  '],
                                                  },
                                                ],
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                href: 'art4_par1_inc2',
                                                id: 'art14_cpt_alt1_art4_par1_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    proventos de aposentados e pensionistas, quando a fonte pagadora for responsável pelo desconto e pelo respectivo pagamento das contribuições previdenciárias.\n\n  ',
                                                    ],
                                                  },
                                                ],
                                              },
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
                                          href: 'art4_par2',
                                          id: 'art14_cpt_alt1_art4_par2',
                                          fechaAspas: 's',
                                          notaAlteracao: 'NR',
                                          rotulo: '§ 2º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    Alternativamente às deduções de que trata o caput, poderá ser utilizado desconto simplificado mensal, correspondente a 25% (vinte e cinco por cento) do valor máximo da faixa com alíquota zero da tabela progressiva mensal, caso seja mais benéfico ao contribuinte, dispensadas a comprovação da despesa e a indicação de sua espécie.\n\n  ',
                                              ],
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
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Titulo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Titulo',
                string: '{http://www.lexml.gov.br/1.0}Titulo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'tit3',
                rotulo: 'TÍTULO III',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['\n    DISPOSIÇÕES FINAIS\n\n  '],
                },
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
                      id: 'art15',
                      rotulo: 'Art. 15.',
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
                            id: 'art15_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    Ficam revogados:\n\n  '],
                              },
                            ],
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Inciso',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Inciso',
                                  string: '{http://www.lexml.gov.br/1.0}Inciso',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art15_cpt_inc1',
                                  rotulo: 'I –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    os seguintes dispositivos do ',
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
                                            href: 'urn:lex:br:federal:medida.provisoria:2001-08-24;2158-35!art24',
                                            content: ['art. 24 da Medida Provisória nº 2.158-35, de 24 de agosto de 2001'],
                                          },
                                        },
                                        ':\n\n  ',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Alinea',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Alinea',
                                        string: '{http://www.lexml.gov.br/1.0}Alinea',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art15_cpt_inc1_ali1',
                                        rotulo: 'a)',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    o § 5º; e\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Alinea',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Alinea',
                                        string: '{http://www.lexml.gov.br/1.0}Alinea',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art15_cpt_inc1_ali2',
                                        rotulo: 'b)',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['\n    o inciso I do § 6º; e\n\n  '],
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Inciso',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Inciso',
                                  string: '{http://www.lexml.gov.br/1.0}Inciso',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art15_cpt_inc2',
                                  rotulo: 'II –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    o ',
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
                                            href: 'urn:lex:br:federal:lei:1995;9250!art4_par1u',
                                            content: ['parágrafo único do art. 4º da Lei nº 9.250, de 1995'],
                                          },
                                        },
                                        '.\n\n  ',
                                      ],
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
                      id: 'art16',
                      rotulo: 'Art. 16.',
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
                            id: 'art16_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    Esta Medida Provisória entra em vigor em 1º de maio de 2023.\n\n  '],
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
          ],
        },
      },
    },
  },
};
