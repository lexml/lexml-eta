export const MPV_1232_2024 = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2024-06-12;1232',
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
            content: ['MEDIDA PROVISÓRIA Nº 1.232, DE 12 DE JUNHO DE 2024 '],
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
                  href: 'urn:lex:br:federal:lei:2009-12-09;12111',
                  content: ['Lei nº 12.111, de 9 de dezembro de 2009'],
                },
              },
              ', que dispõe sobre os serviços de energia elétrica nos Sistemas Isolados, e a ',
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
                  href: 'urn:lex:br:federal:lei:2013-01-11;12783',
                  content: ['Lei nº 12.783, de 11 de janeiro de 2013'],
                },
              },
              ', que dispõe sobre as concessões de geração, transmissão e distribuição de energia elétrica, sobre a redução dos encargos setoriais e sobre a modicidade tarifária. \n',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: [
                  '\n    O VICE-PRESIDENTE DA REPÚBLICA, no exercício do cargo de PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei: \n  ',
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
                                href: 'urn:lex:br:federal:lei:2009-12-09;12111',
                                content: ['Lei nº 12.111, de 9 de dezembro de 2009'],
                              },
                            },
                            ', passa a vigorar com as seguintes alterações: \n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:2009-12-09;12111',
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
                              href: 'art4-4',
                              id: 'art1_cpt_alt1_art4-4',
                              abreAspas: 's',
                              rotulo: 'Art. 4º-D.',
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
                                    href: 'art4-4_cpt',
                                    id: 'art1_cpt_alt1_art4-4_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Os contratos de compra e venda de energia elétrica relativos aos agentes de distribuição alcançados pelo art. 4º-C e lastreados, direta ou indiretamente, por usinas termelétricas cujas despesas com a infraestrutura de transporte dutoviário de gás natural sejam reembolsáveis pela CCC, poderão, a critério da parte vendedora, ser convertidos em Contratos de Energia de Reserva - CER, de que trata o ',
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
                                              href: 'urn:lex:br:federal:lei:2004-03-15;10848!art3_par3',
                                              content: ['art. 3º, § 3º, da Lei nº 10.848, de 15 de março de 2004'],
                                            },
                                          },
                                          ', a partir da publicação da Medida Provisória nº 1.232 , de 12 , de junho de 2024. \n\n  ',
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
                                    href: 'art4-4_par1',
                                    id: 'art1_cpt_alt1_art4-4_par1',
                                    rotulo: '§ 1º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O termo final dos CER de que trata o ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'b',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}b',
                                              string: '{http://www.lexml.gov.br/1.0}b',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                {
                                                  name: {
                                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                    localPart: 'i',
                                                    prefix: '',
                                                    key: '{http://www.lexml.gov.br/1.0}i',
                                                    string: '{http://www.lexml.gov.br/1.0}i',
                                                  },
                                                  value: {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['caput'],
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                          ' coincidirá com o final do prazo de vigência do contrato vigente de compra e venda de gás natural cujas despesas sejam reembolsáveis pela CCC. \n\n  ',
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
                                    href: 'art4-4_par2',
                                    id: 'art1_cpt_alt1_art4-4_par2',
                                    rotulo: '§ 2º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Para os contratos de compra e venda de energia elétrica cujo período de suprimento se encerre na data final de vigência do contrato de compra e venda de gás natural de que trata o § 1º, os CER resultantes da conversão de que trata o ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'i',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}i',
                                              string: '{http://www.lexml.gov.br/1.0}i',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['caput'],
                                            },
                                          },
                                          ' deverão manter as condições de preço unitário, de quantidade e de inflexibilidade, entre outras, e de reembolso de despesas, inclusive os tributos não recuperáveis, com os recursos da CCC aplicáveis aos contratos originais, durante todo o prazo de suprimento. \n\n  ',
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
                                    href: 'art4-4_par3',
                                    id: 'art1_cpt_alt1_art4-4_par3',
                                    rotulo: '§ 3º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Para os contratos de compra e venda de energia elétrica cujo período de suprimento se encerre antes da data final de vigência do contrato de gás natural de que trata o § 1º, os CER resultantes da conversão de que trata o ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'i',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}i',
                                              string: '{http://www.lexml.gov.br/1.0}i',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['caput'],
                                            },
                                          },
                                          ' deverão preservar as quantidades originalmente fixadas e estabelecer: \n\n  ',
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
                                          href: 'art4-4_par3_inc1',
                                          id: 'art1_cpt_alt1_art4-4_par3_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    até a data de termo final dos contratos originais, a manutenção das mesmas condições, tais como preço unitário e inflexibilidade, e de reembolso de despesas, inclusive os tributos não recuperáveis, com os recursos da CCC aplicáveis aos contratos originais; e \n\n  ',
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
                                          href: 'art4-4_par3_inc2',
                                          id: 'art1_cpt_alt1_art4-4_par3_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    para o período remanescente, compreendido entre a data de termo final dos contratos originais e o termo final do CER de que trata o § 1º, a adoção das mesmas condições de preço unitário e de inflexibilidade, entre outras, e de reembolso de despesas, inclusive os tributos não recuperáveis, com os recursos da CCC aplicáveis a Contratos de Comercialização de Energia no Ambiente Regulado - CCEARs vinculados a usinas termelétricas conectadas à mesma infraestrutura de transporte dutoviário de gás natural. \n\n  ',
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
                                    href: 'art4-4_par4',
                                    id: 'art1_cpt_alt1_art4-4_par4',
                                    rotulo: '§ 4º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Caberá à Aneel, no prazo de até quarenta e cinco dias contados da data de publicação da Medida Provisória nº 1.232, de 12, de junho de 2024, publicar ato que veicule as minutas dos CER referidos neste artigo. \n\n  ',
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
                                    href: 'art4-4_par5',
                                    id: 'art1_cpt_alt1_art4-4_par5',
                                    rotulo: '§ 5º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    A Câmara de Comercialização de Energia Elétrica - CCEE, na condição de representante dos usuários de energia de reserva, deverá concluir o processo de assinatura dos CER referidos neste artigo no prazo de até quinze dias, contados da data de publicação do ato de que trata o § 4º. \n\n  ',
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
                                    href: 'art4-4_par6',
                                    id: 'art1_cpt_alt1_art4-4_par6',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 6º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    As distribuidoras e os agentes de geração de que trata o ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'i',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}i',
                                              string: '{http://www.lexml.gov.br/1.0}i',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['caput'],
                                            },
                                          },
                                          ' deverão renunciar a eventuais direitos preexistentes contra a União relativos à compra e venda de energia elétrica decorrentes de eventos anteriores à troca de contratos pelo CER.\n\n  ',
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
                                href: 'urn:lex:br:federal:lei:2013-01-11;12783',
                                content: ['Lei nº 12.783, de 11 de janeiro de 2013'],
                              },
                            },
                            ', passa a vigorar com as seguintes alterações: \n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:2013-01-11;12783',
                        id: 'art2_cpt_alt1',
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
                              href: 'art8-3',
                              id: 'art2_cpt_alt1_art8-3',
                              abreAspas: 's',
                              rotulo: 'Art. 8º-C.',
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
                                    href: 'art8-3_cpt',
                                    id: 'art2_cpt_alt1_art8-3_cpt',
                                    textoOmitido: 's',
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
                                    href: 'art8-3_par1',
                                    id: 'art2_cpt_alt1_art8-3_par1',
                                    rotulo: '§ 1º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Na hipótese de reconhecimento pela Aneel da perda das condições econômicas, técnicas ou operacionais para prestação do serviço concedido, durante o prazo de carência das concessões de que trata o ',
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'i',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}i',
                                              string: '{http://www.lexml.gov.br/1.0}i',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['caput'],
                                            },
                                          },
                                          ', a aprovação de plano de transferência do controle societário como alternativa à extinção da concessão, nos termos do disposto no ',
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
                                              href: 'urn:lex:br:federal:lei:1995-07-07;9074!art4-3',
                                              content: ['art. 4º-C da Lei nº 9.074, de 7 de julho de 1995'],
                                            },
                                          },
                                          ', estará vinculada à celebração de termo aditivo ao contrato de concessão. \n\n  ',
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
                                    href: 'art8-3_par2',
                                    id: 'art2_cpt_alt1_art8-3_par2',
                                    rotulo: '§ 2º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O plano de transferência do controle societário e o termo aditivo de que trata o § 1º deverão prever as condições para promover a recuperação da sustentabilidade econômico-financeira do serviço de distribuição de energia elétrica, com vistas a obter o menor impacto tarifário para os consumidores. \n\n  ',
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
                                    href: 'art8-3_par3',
                                    id: 'art2_cpt_alt1_art8-3_par3',
                                    rotulo: '§ 3º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Com o objetivo de assegurar o reequilíbrio econômico-financeiro da concessão, o termo aditivo de que trata o § 1º poderá prever, por até três ciclos tarifários, a critério da Aneel, a cobertura da Conta de Consumo de Combustíveis - CCC para: \n\n  ',
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
                                          href: 'art8-3_par3_inc1',
                                          id: 'art2_cpt_alt1_art8-3_par3_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    as flexibilizações temporárias em parâmetros regulatórios de eficiência, como os custos operacionais, o fator X, as perdas não técnicas e as receitas irrecuperáveis; \n\n  ',
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
                                          href: 'art8-3_par3_inc2',
                                          id: 'art2_cpt_alt1_art8-3_par3_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    a carência temporária para a aplicação de parâmetros de eficiência econômica e energética previstos no ',
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
                                                    href: 'urn:lex:br:federal:lei:2009-12-09;12111!art3_par12',
                                                    content: ['art. 3º, § 12, da Lei nº 12.111, de 9 de dezembro 2009'],
                                                  },
                                                },
                                                '; \n\n  ',
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
                                          href: 'art8-3_par3_inc3',
                                          id: 'art2_cpt_alt1_art8-3_par3_inc3',
                                          rotulo: 'III –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    a não aplicação do fator de corte de perdas no reembolso da CCC; e \n\n  '],
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
                                          href: 'art8-3_par3_inc4',
                                          id: 'art2_cpt_alt1_art8-3_par3_inc4',
                                          rotulo: 'IV –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    a extensão do prazo do ônus decorrente da sobrecontratação involuntária da concessionária, de que trata o ',
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
                                                    href: 'urn:lex:br:federal:lei:2009-12-09;12111!art4-3',
                                                    content: ['art. 4º-C da Lei nº 12.111, de 9 de dezembro 2009'],
                                                  },
                                                },
                                                '. \n\n  ',
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
                                    href: 'art8-3_par4',
                                    id: 'art2_cpt_alt1_art8-3_par4',
                                    rotulo: '§ 4º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    Em contrapartida ao termo aditivo de que trata o §1º: \n\n  '],
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
                                          href: 'art8-3_par4_inc1',
                                          id: 'art2_cpt_alt1_art8-3_par4_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    o novo controlador deverá demonstrar capacidade técnica e econômica para adequar o serviço de distribuição, apresentar benefícios à concessão e aos consumidores de energia elétrica, inclusive mediante o aporte de capital e de soluções que promovam a redução estrutural dos custos suportados pela CCC, a eficiência e a inclusão energética; e \n\n  ',
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
                                          href: 'art8-3_par4_inc2',
                                          id: 'art2_cpt_alt1_art8-3_par4_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    a transferência de controle da pessoa jurídica deverá ocorrer por valor simbólico, aprovado pela assembleia geral do atual controlador. \n\n  ',
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
                                    href: 'art8-3_par5',
                                    id: 'art2_cpt_alt1_art8-3_par5',
                                    rotulo: '§ 5º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    A Aneel deliberará sobre os planos de transferência do controle societário e sobre as condições pactuadas quanto à renegociação da dívida por parte dos credores mais representativos, em processo administrativo que assegure a transparência, com vistas à readequação do serviço prestado com o maior benefício ao consumidor. \n\n  ',
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
                                    href: 'art8-3_par6',
                                    id: 'art2_cpt_alt1_art8-3_par6',
                                    rotulo: '§ 6º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O atual concessionário garantirá o acesso amplo e não discriminatório a todas informações necessárias à formulação de plano de transferência do controle societário pelos interessados. \n\n  ',
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
                                    href: 'art8-3_par7',
                                    id: 'art2_cpt_alt1_art8-3_par7',
                                    rotulo: '§ 7º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    É responsabilidade do formulador do plano de transferência do controle societário a negociação com os atuais acionistas e seus credores, inclusive quanto à conversão de créditos em participação acionária e eventuais aportes de capital, devendo ser estabelecido o valor simbólico para fins de transferência de controle da pessoa jurídica pelos atuais acionistas. \n\n  ',
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
                                    href: 'art8-3_par8',
                                    id: 'art2_cpt_alt1_art8-3_par8',
                                    rotulo: '§ 8º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    Deverá constar do plano de transferência do controle societário submetido à Aneel documentos que assegurem: \n\n  '],
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
                                          href: 'art8-3_par8_inc1',
                                          id: 'art2_cpt_alt1_art8-3_par8_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    a aceitação das condições pactuadas por parte dos credores com maior quantidade de créditos a receber; \n\n  '],
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
                                          href: 'art8-3_par8_inc2',
                                          id: 'art2_cpt_alt1_art8-3_par8_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    a aceitação das condições pactuadas para a transferência do controle por parte dos atuais acionistas; e \n\n  '],
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
                                          href: 'art8-3_par8_inc3',
                                          id: 'art2_cpt_alt1_art8-3_par8_inc3',
                                          rotulo: 'III –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    que as condições negociadas, em conjunto com as medidas adicionais a serem implementadas pelos futuros controladores, sejam suficientes para assegurar a sustentabilidade econômico-financeira da concessionária. \n\n  ',
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
                                    href: 'art8-3_par9',
                                    id: 'art2_cpt_alt1_art8-3_par9',
                                    rotulo: '§ 9º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    No advento da transferência de controle societário, tanto o novo controlador quanto o atual devem renunciar a eventuais direitos preexistentes contra a União relativos à concessão, decorrentes de eventos anteriores à transferência de controle. \n\n  ',
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
                                    href: 'art8-3_par10',
                                    id: 'art2_cpt_alt1_art8-3_par10',
                                    rotulo: '§ 10.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    As flexibilizações relativas aos custos operacionais e à não aplicação do fator de corte de perdas e dos parâmetros de eficiência econômica e energética nos reembolsos da CCC ficam postergadas por cento e vinte dias, contados de seus encerramentos, previstos no contrato de concessão ou no termo de compromisso a ele vinculado, ou até a transferência do controle societário, o que ocorrer primeiro, garantidas suas coberturas pela CCC. \n\n  ',
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
                                    href: 'art8-3_par11',
                                    id: 'art2_cpt_alt1_art8-3_par11',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 11.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    As flexibilizações de que trata o § 10º constarão de ato que declarar eventual intervenção administrativa instaurada pela Aneel, com o fim de assegurar a continuidade, a prestação adequada do serviço e a efetividade do processo de transferência do controle societário e vigorarão durante todo o período da intervenção.\n\n  ',
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
                          content: ['\n    Ficam revogados: \n\n  '],
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
                            id: 'art3_cpt_inc1',
                            rotulo: 'I –',
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
                                      href: 'urn:lex:br:federal:lei:2009-12-09;12111!art3_par16',
                                      content: ['art. 3º, § 16, da Lei nº 12.111, de 9 de dezembro de 2009'],
                                    },
                                  },
                                  '; e \n\n  ',
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
                            id: 'art3_cpt_inc2',
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
                                      href: 'urn:lex:br:federal:lei:2013-01-11;12783!art27',
                                      content: ['art. 27 da Lei nº 12.783, de 11 de janeiro de 2013'],
                                    },
                                  },
                                  '. \n\n  ',
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
