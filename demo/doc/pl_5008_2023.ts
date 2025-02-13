export const PL_5008_2023 = {
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
        urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2023;05008',
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
            content: ['PROJETO DE LEI Nº 05008 de 2023 '],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              'Dispõe sobre a produção, importação, exportação, comercialização, controle, fiscalização e propaganda dos cigarros eletrônicos, e dá outras providências. \n',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['\n    O CONGRESSO NACIONAL decreta: \n'],
              },
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
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
                localPart: 'Capitulo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Capitulo',
                string: '{http://www.lexml.gov.br/1.0}Capitulo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'cap1',
                rotulo: 'CAPÍTULO I',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
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
                        content: ['DISPOSIÇÕES INICIAIS'],
                      },
                    },
                  ],
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
                                  '\n    A produção, importação, exportação, comercialização e o consumo dos cigarros eletrônicos em todo o território nacional fica permitida, nos termos e restrições previstas nesta lei e de acordo com a regulamentação aplicável. \n\n',
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
                            id: 'art1_par1',
                            rotulo: '§ 1º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Enquadra-se no conceito de cigarro eletrônico os sistemas eletrônicos de administração de nicotina (SEAN) e os sistemas eletrônicos de sem nicotina (SESN), como vaporizadores,',
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
                                      content: ['vapes'],
                                    },
                                  },
                                  ', ',
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
                                      content: ['pods, mods'],
                                    },
                                  },
                                  ', ',
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
                                      content: ['eletronic cigarettes, e-cigs, cig-a-like'],
                                    },
                                  },
                                  ' e assemelhados, os sistemas eletrônicos de aquecimento de tabaco (SEAT), como produtos de tabaco aquecido, ',
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
                                      content: ['heat-not-burn'],
                                    },
                                  },
                                  ' e assemelhados, e sistemas eletrônicos de aquecimento sem tabaco (SEAST), como produtos de aquecimento herbais. \n\n',
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
                            id: 'art1_par2',
                            rotulo: '§ 2º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Esta lei abrange os refis, cartuchos, líquidos, barras ou bastões de tabaco ou herbais ou quaisquer outros acessórios utilizados em conjunto com os cigarros eletrônicos. \n\n',
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
                id: 'cap2',
                rotulo: 'CAPÍTULO II',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
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
                        content: ['REGISTRO E CADASTRO DE CIGARRO ELETRÔNICO'],
                      },
                    },
                  ],
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
                                  '\n    É obrigatório o registro junto à Agência Nacional de Vigilância Sanitária (Anvisa), de acordo com o ',
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
                                      href: 'urn:lex:br:federal:lei:1999-01-26;9782!art8_par4',
                                      content: ['art. 8º, §4º da Lei Federal nº 9.782, de 26 de janeiro de 1999'],
                                    },
                                  },
                                  ', de todos os cigarros eletrônicos para consumo no Brasil, com vistas à:  fabricação e comercialização no território nacional; e  importação e comercialização no território nacional. \n\n',
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
                                  '\n    É vedada a utilização do número de registro na Anvisa para divulgação, publicidade ou promoção vinculada ao processo de registro junto à Anvisa, sendo facultado à empresa fabricante ou empresa importadora imprimir, de forma indelével, o número de registro na embalagem dos cigarros eletrônicos exclusivamente para fins de conferência pelo consumidor a respeito da procedência do produto junto à Anvisa. \n\n',
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
                            id: 'art2_par2',
                            rotulo: '§ 2º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Caberá o recolhimento da Taxa de Vigilância e Fiscalização Sanitária, prevista na ',
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
                                      href: 'urn:lex:br:federal:lei:1999-01-26;9782',
                                      content: ['Lei Federal nº 9.782, de 26 de janeiro de 1999'],
                                    },
                                  },
                                  ', no valor anual de R$100.000,00 (cem mil) reais por pedido de registro ou renovação perante a Anvisa, a ser corrigido a partir da vigência desta lei por portaria conjunta do Ministério da Saúde e do Ministério da Fazenda. \n\n',
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
                                  '\n    As empresas exportadoras de cigarros eletrônicos devem providenciar o cadastro do produto na Anvisa para fins de controle quanto ao destino do produto, sendo vedado que produto destinado exclusivamente à exportação tenha reentrância no mercado nacional sem o registro apropriado na Anvisa. \n\n',
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
                            id: 'art3_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A prática dolosa de reintrodução em território nacional de produto destinado exclusivamente à exportação, com o intuito inequívoco de burlar esta lei, a legislação sanitária ou fiscal, sujeita o infrator e os responsáveis legais pela empresa infratora, em caso de cometimento por pessoa jurídica, no crime de contrabando, conforme previsto no art. 334-A do Código Penal. \n\n',
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
                                  '\n    É obrigatório o cadastro junto à Receita Federal do Brasil dos cigarros eletrônicos fabricados, importados ou exportados, de acordo com regulamentação própria, para fins de controle fiscal. \n\n',
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
                                content: ['\n    É obrigatória a apresentação de laudo de avaliação toxicológica do cigarro eletrônico quando do registro perante a Anvisa. \n\n'],
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
                                  '\n    A avaliação de risco toxicológico deve, na medida em que for relevante para a avaliação do cigarro eletrônico objeto de pedido de registro:  indicar os aditivos usados ​​na fabricação do cigarro eletrônico;  indicar o material utilizado na fabricação do cigarro eletrônico;  considerar a comparação toxicológica entre o cigarro eletrônico e o cigarro convencional e, de forma objetiva e no cômputo total dos indicadores, avaliar se o cigarro eletrônico objeto de pedido de registro oferece risco inerente à saúde maior, igual ou menor que o risco inerente ao consumo de cigarro convencional, utilizando-se como parâmetro comparativo as avaliações de emissões de substâncias tóxicas exigidas para registro de cigarros convencionais na Anvisa vigentes na edição desta lei. \n\n',
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
                                  '\n    O laudo de avaliação toxicológica poderá conter outros laudos de avaliação toxicológica, parciais ou totais, aceitos e aprovados previamente por Autoridade Reguladora Estrangeira Equivalente, conforme definido pela Anvisa, em processo de registro análogo, como parte ou todo do laudo de avaliação toxicológica exigido nesta lei. \n\n',
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
                                  '\n    Compete ao Instituto Nacional de Metrologia, Qualidade e Tecnologia (Inmetro), a partir de regulamentação apropriada, definir os critérios não sanitários de funcionamento do produto, tais como segurança no carregamento elétrico e especificações da bateria. \n\n',
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
                            id: 'art7_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    É obrigatório o cadastro junto ao Inmetro dos cigarros eletrônicos fabricados, importados ou exportados, de acordo com regulamentação própria, para fins de controle de qualidade. \n\n',
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
                                  '\n    Compete à Agência Nacional de Telecomunicações (Anatel), a partir de regulamentação apropriada, definir os critérios não sanitários de funcionamento dos cigarros eletrônicos quanto à sua comunicabilidade, como tecnologia ',
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
                                      content: ['bluetooth'],
                                    },
                                  },
                                  ' ou outras tecnologias sem fio similares, com outros dispositivos eletrônicos não abrangidos por esta lei. \n\n',
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
                            id: 'art8_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    É obrigatório o cadastro junto à Anatel dos cigarros eletrônicos fabricados, importados ou exportados, de acordo com regulamentação própria, quando houver comunicabilidade sem fio com dispositivos eletrônicos não abrangidos por esta lei. \n\n',
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
                                content: [
                                  '\n    Os cigarros eletrônicos se submetem ao ',
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
                                      href: 'urn:lex:br:federal:lei:2010-08-02;12305!art33_cpt_inc2',
                                      content: ['art. 33, incisos II'],
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
                                      href: 'urn:lex:br:federal:lei:2010-08-02;12305!art33_cpt_inc6',
                                      content: ['VI da Lei Federal nº 12.305, de 02 de agosto de 2010'],
                                    },
                                  },
                                  ' - Lei Nacional de Resíduos Sólidos - e, quanto a seus componentes de bateria e eletroeletrônicos, as empresas fabricantes ou importadoras devem providenciar a sua logística reversa e tratamento ambientalmente adequado, de acordo com a Lei Nacional de Resíduos Sólidos e suas regulamentações. \n\n',
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
                id: 'cap3',
                rotulo: 'CAPÍTULO III',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
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
                        content: ['ESPECIFICAÇÕES DOS CIGARROS ELETRÔNICOS'],
                      },
                    },
                  ],
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
                                content: ['\n    Os cigarros eletrônicos do tipo SEAN devem obedecer às seguinte especificações: \n\n'],
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
                                  id: 'art10_cpt_inc1',
                                  rotulo: 'I –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    líquidos contendo nicotina devem ter o volume total máximo de 22 mililitros; \n\n'],
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
                                  id: 'art10_cpt_inc2',
                                  rotulo: 'II –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    líquidos contendo nicotina não devem ter concentração de nicotina maior que 35 miligramas por mililitro; \n\n'],
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
                                  id: 'art10_cpt_inc3',
                                  rotulo: 'III –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    apenas aditivos de alta pureza farmacêutica ou alimentícia, de acordo com a regulamentação aplicável, devem ser utilizados na sua fabricação; \n\n',
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
                                  id: 'art10_cpt_inc4',
                                  rotulo: 'IV –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    os dispositivos SEAN, sejam descartáveis ou de modalidade de cartucho, devem ser resistentes à adulteração pelo consumidor e à violação por crianças. \n\n',
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
                            id: 'art10_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Fica proibida a fabricação, importação e comercialização de dispositivos SEAN que permitam ao consumidor final manipular diretamente o líquido para recarga, conhecidos como de sistema aberto. \n\n',
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
                                content: ['\n    Os cigarros eletrônicos do tipo SESN devem obedecer às seguinte especificações: \n\n'],
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
                                  id: 'art11_cpt_inc1',
                                  rotulo: 'I –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    líquidos devem ter o volume total máximo de 22 mililitros; \n\n'],
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
                                  id: 'art11_cpt_inc2',
                                  rotulo: 'II –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    apenas aditivos de alta pureza farmacêutica ou alimentícia, de acordo com a regulamentação aplicável, devem ser utilizados na sua fabricação; \n\n',
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
                                  id: 'art11_cpt_inc3',
                                  rotulo: 'III –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    os dispositivos SESN, sejam descartáveis ou de modalidade de cartucho, devem ser resistentes à adulteração pelo consumidor e à violação por crianças. \n\n',
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
                            id: 'art11_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Fica proibida a fabricação, importação e comercialização de dispositivos SESN que permitam ao consumidor final manipular diretamente o líquido para recarga, conhecidos como de sistema aberto. \n\n',
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
                                content: ['\n    Os cigarros eletrônicos do tipo SEAT devem obedecer às seguinte especificações: \n\n'],
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
                                  id: 'art12_cpt_inc1',
                                  rotulo: 'I –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    as embalagens de barras ou bastões de tabaco para aquecimento devem conter 20 unidades; \n\n'],
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
                                  id: 'art12_cpt_inc2',
                                  rotulo: 'II –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    as barras de tabaco devem ter no máximo 1 miligrama de nicotina na emissão; \n\n'],
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
                                  id: 'art12_cpt_inc3',
                                  rotulo: 'III –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    apenas aditivos de alta pureza farmacêutica ou alimentícia, de acordo com a regulamentação aplicável, devem ser utilizados na sua fabricação; \n\n',
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
                                  id: 'art12_cpt_inc4',
                                  rotulo: 'IV –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    os dispositivos SEAT devem ser resistentes à adulteração pelo consumidor e à violação por crianças. \n\n'],
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
                            id: 'art12_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Fica proibida a fabricação, importação e comercialização de dispositivos SEAT que permitam ao consumidor manipular, com o fim de customizar ou adulterar, diretamente a barra ou bastão de tabaco para uso com o produto. \n\n',
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
                                content: ['\n    Os cigarros eletrônicos do tipo SEAST devem obedecer às seguinte especificações: \n\n'],
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
                                  id: 'art13_cpt_inc1',
                                  rotulo: 'I –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    as embalagens de barras ou bastões de não tabaco para aquecimento devem conter 20 unidades; \n\n'],
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
                                  id: 'art13_cpt_inc2',
                                  rotulo: 'II –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    apenas aditivos de alta pureza farmacêutica ou alimentícia, de acordo com a regulamentação aplicável, devem ser utilizados na sua fabricação; \n\n',
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
                                  id: 'art13_cpt_inc3',
                                  rotulo: 'III –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['\n    os dispositivos SEAST devem ser resistentes à adulteração pelo consumidor e à violação por crianças. \n\n'],
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
                            id: 'art13_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Fica proibida a fabricação, importação e comercialização de dispositivos SEAST que permitam ao consumidor manipular, com o fim de customizar ou adulterar, diretamente a barra ou bastão de tabaco para uso com o produto. \n\n',
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
                                  '\n    Os cigarros eletrônicos devem conter instruções claras direcionadas aos consumidores adultos, em idioma nacional, em especial: \n\n',
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
                                  id: 'art14_cpt_inc1',
                                  rotulo: 'I –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    as embalagens devem incluir folheto com informações, quando aplicável, sobre:  instruções para uso e armazenamento do produto, incluindo referência de que o produto é proibido para menores de 18 anos e não é recomendado para não fumantes;  recomendação para que o produto não seja deixado ao acesso de animais de estimação;  contra-indicações;  alertas para grupos de risco específicos, como mulheres grávidas, diabéticos e cardiopatas;  possíveis efeitos adversos;  dependência e toxicidade; e  informações de contato, incluindo CNPJ e endereço sintético, para o fabricante ou importador. \n\n',
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
                                  id: 'art14_cpt_inc2',
                                  rotulo: 'II –',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n    embalagens devem incluir no seu exterior:  lista dos ingredientes contidos no produto, por categoria de aditivo;  indicação da concentração de nicotina, de forma clara e compreensível;  número do lote, data de fabricação e prazo de validade;  indicação ostensiva para que o produto não seja deixado ao acesso de crianças ou adolescentes;  advertência sanitária, ocupando 20% das maiores faces visíveis ao consumidor, quando se tratar de SEAN ou SEAT, com a seguinte expressão: “Este produto contém nicotina que é uma substância que causa dependência. Não é recomendado o consumo por não fumantes”. \n\n',
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
                                content: [
                                  '\n    É vedada a utilização de dispositivos sonoros, palavras, símbolos, desenhos ou imagens nas embalagens dos cigarros eletrônicos que possam:  induzir diretamente o consumo;  sugerir o consumo exagerado ou irresponsável;  induzir o consumo em locais ou situações perigosas ou ilegais;  atribuir aos produtos propriedades calmantes ou estimulantes, que reduzam a fadiga ou tensão ou produzam efeito similar;  insinuar o aumento de virilidade masculina ou feminina ou associar ideia ou imagem de maior êxito na sexualidade das pessoas fumantes;  associar o uso do produto a atividades culturais ou esportivas ou a celebrações cívicas ou religiosas;  conduzir a conclusões errôneas quanto às características e à composição do produto e quanto aos riscos à saúde inerentes ao seu uso;  exerçam apelo especificamente direcionado a menores de 18 anos, tais como desenhos infantis, ',
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
                                      content: ['cartoons'],
                                    },
                                  },
                                  ', sobremesas, doces, balas, bonecos, brinquedos ou alusões ao universo infanto-juvenil. \n\n',
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
                            id: 'art15_par1',
                            rotulo: '§ 1º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    São proibidos no nome do cigarro eletrônico, número, expressão ou artifício gráfico que indique sabor notadamente de sobremesa, doces ou que remeta ao universo infanto-juvenil. \n\n',
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
                            id: 'art15_par2',
                            rotulo: '§ 2º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Não são caracterizados como sabores notadamente de sobremesa os de tabaco, frutas, mentolados, menta ou similares, desde que não sejam acompanhados de palavras, símbolos ou artifícios gráficos que remetem a sobremesas, doces, balas ou ao universo infanto-juvenil. \n\n',
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
                                content: [
                                  '\n    Os cigarros eletrônicos não devem conter as seguintes substâncias:  vitaminas;  cafeína e taurina;  aditivos que tenham efeitos corantes no aerossol;  aditivos (com exceção da nicotina e seus sais) que representem risco intolerável, para além do esperado no risco inerente ao cigarro eletrônico, para a saúde humana;  aditivos que contenham acetato de vitamina E, óleos minerais, óleos vegetais ou gorduras animais como veículos ou diluentes ou que sejam considerados impróprios para aquecimento e inalação. \n\n',
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
                            id: 'art16_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Compete à Anvisa definir a lista de substâncias proibidas para uso nos cigarros eletrônicos, ressalvada a nicotina e seus sais e os agentes de sabor restritos de apelo infanto-juvenil explícito, conforme definidos no art. 15, §§1º e 2º desta lei. \n\n',
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
                id: 'cap4',
                rotulo: 'CAPÍTULO IV',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
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
                        content: ['MONITORAMENTO DOS CIGARROS ELETRÔNICOS'],
                      },
                    },
                  ],
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
                      id: 'art17',
                      rotulo: 'Art. 17.',
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
                            id: 'art17_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A empresa fabricante ou importadora de cigarros eletrônicos deve estabelecer e manter um sistema para coletar informações sobre todos os efeitos adversos à saúde suspeitos em seres humanos de que tomar conhecimento. \n\n',
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
                            id: 'art17_par1',
                            rotulo: '§ 1º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O caput se aplica quando a empresa fabricante ou importadora de um produto de cigarro eletrônico considera ou tem motivos para acreditar que um cigarro eletrônico que foi por si comercializado não está em conformidade com os requisitos toxicológicos requeridos por esta lei. \n\n',
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
                            id: 'art17_par2',
                            rotulo: '§ 2º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A empresa fabricante ou importadora deve tomar imediatamente a ação corretiva necessária para colocar o produto em conformidade com esta lei e retirar do mercado com ela em desconformidade em prazo não superior a 30 (trinta) dias úteis. \n\n',
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
                      id: 'art18',
                      rotulo: 'Art. 18.',
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
                            id: 'art18_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A empresa fabricante ou empresa importadora deve informar à Anvisa em prazo de 30 (trinta) dias úteis da ciência em caso de incidência do art. 17 desta lei, dando detalhes de, em especial, riscos para a saúde e segurança humana, qualquer ação corretiva tomada e seus respectivos resultados. \n\n',
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
                      id: 'art19',
                      rotulo: 'Art. 19.',
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
                            id: 'art19_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    As empresas fabricantes ou importadoras deverão disponibilizar sistema de atendimento ao consumidor, com funcionamento 24 (vinte e quatro) horas, 7 (sete) dias por semana. \n\n',
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
                      id: 'art20',
                      rotulo: 'Art. 20.',
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
                            id: 'art20_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A Anvisa deverá disponibilizar um canal de comunicação eletrônico para o consumidor informar à Anvisa a respeito de eventos adversos no consumo do produto, contribuindo para o monitoramento sanitário. \n\n',
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
                            id: 'art20_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A Anvisa deverá disponibilizar canal de comunicação eletrônico para o Sistema Nacional de Vigilância Sanitária e para toda a rede credenciada ao Sistema Único de Saúde, seja privado ou público, para comunicação de eventos de saúde graves envolvendo cigarros eletrônicos, devendo ser categorizado o tipo de dispositivo, concentração de nicotina, modelo, fabricante e/ou importador, origem, perfil de consumo, doença desenvolvida (classificada por CID), número de registro na Anvisa e coleta da amostra do produto e envio para a Agência para devida avaliação e providências junto à empresa fabricante ou importadora. \n\n',
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
                id: 'cap5',
                rotulo: 'CAPÍTULO V',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
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
                        content: ['COMERCIALIZAÇÃO DE CIGARROS ELETRÔNICOS'],
                      },
                    },
                  ],
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
                      id: 'art21',
                      rotulo: 'Art. 21.',
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
                            id: 'art21_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    São proibidas propagandas comerciais de cigarros eletrônicos independentemente independentemente do veículo, seja TV, rádio, outdoor, impresso e virtual, inclusive pelas redes sociais, sendo ressalvada a exposição e comunicação dos cigarros eletrônicos exclusivamente no interior do ponto de venda ou em comércio eletrônico com estrito controle de maioridade, nos termos desta lei. \n\n',
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
                            id: 'art21_par1',
                            rotulo: '§ 1º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Não se consideram propagandas comerciais as publicações de cunho estritamente informativo e de debate científico e social de dispositivos eletrônicos de cigarros eletrônicos, desde que sem menção ou exposição, direta ou indiretamente, de marca comercial de cigarro eletrônico. \n\n',
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
                            id: 'art21_par2',
                            rotulo: '§ 2º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Publicações impressas destinadas exclusivamente a distribuidores e pontos de venda, com o fim estritamente comercial e informativo entre empresas, não se incluem na proibição deste artigo. \n\n',
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
                      id: 'art22',
                      rotulo: 'Art. 22.',
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
                            id: 'art22_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A exposição e comunicação dos cigarros eletrônicos nos pontos de venda ou no comércio eletrônico deve:  deixar claro que o produto é um cigarro eletrônico;  indicar claramente se o produto contém nicotina ou se pode vir a ser utilizado com produto contendo nicotina;  ser apoiado por provas documentais que demonstrem que qualquer alegação feita na comunicação é precisa e não enganosa; e  incluir advertência sanitária de 20% da área da comunicação. \n\n',
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
                      id: 'art23',
                      rotulo: 'Art. 23.',
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
                            id: 'art23_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A exposição e comunicação de cigarros eletrônicos nos pontos de venda e no comércio eletrônico não deve:  conter quaisquer alegações medicinais;  usar profissionais de saúde para endossar produtos;  visar deliberadamente não fumantes ou não consumidores de nicotina com o objetivo de incentivá-los a usar cigarros eletrônicos, contendo eles nicotina ou não;  apresentar ou retratar qualquer pessoa com menos de 25 anos ou que pareça ter menos de 25 anos;  ser particularmente susceptíveis de atrair particularmente pessoas com menos de 18 anos, por:  refletir ou estar associado à cultura jovem;  apresentar ou retratar pessoas usando cigarros eletrônicos que desempenhem um papel significativo no anúncio, comportando-se de maneira que é razoavelmente provável que apareça como adolescente ou comportamento juvenil ; e/ou  apresentar ou retratar personagens ou objetos reais ou fictícios que sejam razoavelmente susceptíveis de atrair particularmente pessoas com menos de 18 anos, desenhos infantis, ',
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
                                      content: ['cartoons'],
                                    },
                                  },
                                  ', personagens infantis, sobremesas, doces, balas, bonecos, brinquedos ou alusões ao universo infanto-juvenil.  sugerir que o uso de produtos de cigarro eletrônico é essencial para proeminência, distinção, sucesso ou desejo sexual; ou  retratar um consumidor de cigarro eletrônico participando ou tendo acabado de participar de uma atividade física que requer resistência ou condicionamento físico além da recreação normal. \n\n',
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
                      id: 'art24',
                      rotulo: 'Art. 24.',
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
                            id: 'art24_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O fabricante, importador, comerciante ou qualquer pessoa não deve fornecer ou oferecer o fornecimento de qualquer cigarro eletrônico a pessoa menor de 18 anos ou fornecer ou oferecer o fornecimento de um cigarro eletrônico a uma pessoa com a intenção de que seja fornecido (direta ou indiretamente) a uma pessoa menor de 18 anos anos de idade, seja gratuita ou onerosamente. \n\n',
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
                            id: 'art24_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Aquele que infringir o caput deste artigo dolosamente estará sujeito a aplicação de multa não inferior a R$10.000,00 (dez mil reais) e não superior a R$10.000.000,00 (dez milhões de reais), incidindo o infrator ou os responsáveis legais por pessoa jurídica infratora no crime previsto no ',
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
                                      href: 'urn:lex:br:federal:lei:1990-07-13;8069!art243',
                                      content: ['art. 243 da Lei Federal nº 8.069, de 13 de julho de 1990'],
                                    },
                                  },
                                  ', Estatuto da Criança e do Adolescente. \n\n',
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
                      id: 'art25',
                      rotulo: 'Art. 25.',
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
                            id: 'art25_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O fabricante, importador e/ou comerciante que, em local público, se oferece para fornecer cigarro eletrônico deve afixar de forma visível aviso ao público de que a venda de um produto de cigarro eletrônico para menores de 18 anos anos é proibida. \n\n',
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
                      id: 'art26',
                      rotulo: 'Art. 26.',
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
                            id: 'art26_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O fabricante, importador e/ou comerciante que realizar a exposição e venda de cigarro eletrônico a um consumidor por meio de uma venda pela Internet deve operar um sistema de verificação de idade para acesso ao site e no momento da venda. \n\n',
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
                            id: 'art26_par1u',
                            rotulo: 'Parágrafo único.',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O sistema de verificação de idade no momento da venda deve confirmar, de forma segura e confiável, com biometria ou sistema com segurança equiparável, que o consumidor é maior de 18 anos de idade. \n\n',
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
                      id: 'art27',
                      rotulo: 'Art. 27.',
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
                            id: 'art27_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O fabricante, importador e/ou comerciante que forneça cigarro eletrônico a um consumidor por meio de entrega após venda pela internet deve usar um método de entrega que exija uma pessoa com idade igual ou superior a 18 anos, comprovadamente por meio de documento oficial com foto, para assinar e aceitar entrega do produto no endereço de entrega. \n\n',
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
                      id: 'art28',
                      rotulo: 'Art. 28.',
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
                            id: 'art28_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O fabricante, importador e/ou comerciante que fornece ou se oferece para fornecer cigarro eletrônico em um local físico dentro do ponto de venda só pode exibir tais produtos em uma área das instalações que não seja acessível aos clientes, como por exemplo, área atrás do balcão de vendas, balcão este onde não seja permitida a entrada de clientes. \n\n',
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
                            id: 'art28_par1',
                            rotulo: '§ 1º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A exposição dos cigarros eletrônicos no ponto de venda deve se situar acima de 1 (um) metro e 50 (cinquenta) centímetros de altura, para que não seja visível diretamente por crianças na altura de sua visão. \n\n',
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
                            id: 'art28_par2',
                            rotulo: '§ 2º',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A exposição dos cigarros eletrônicos no ponto de venda não deve estar imediatamente adjacente de doces, balas, chocolates, brinquedos ou outros produtos infantis. \n\n',
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
                      id: 'art29',
                      rotulo: 'Art. 29.',
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
                            id: 'art29_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Nenhuma exibição de autoatendimento de cigarro eletrônico é permitida em qualquer local público, ressalvados estabelecimentos em que haja controle de entrada com verificação documental de maioridade, com manutenção de registros pelo estabelecimento adequados para conferência pelas autoridades sanitárias competentes. \n\n',
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
                      id: 'art30',
                      rotulo: 'Art. 30.',
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
                            id: 'art30_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    É proibido o fornecimento por fabricante, importador e/ou comerciante de cigarros eletrônicos gratuitamente a consumidores para fins promocionais. \n\n',
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
                id: 'cap6',
                rotulo: 'CAPÍTULO VI',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
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
                        content: ['DISPOSIÇÕES FINAIS E TRANSITÓRIAS'],
                      },
                    },
                  ],
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
                      id: 'art31',
                      rotulo: 'Art. 31.',
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
                            id: 'art31_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    É proibida a fabricação, importação, exportação, exposição, comunicação, propaganda e a comercialização no território nacional de qualquer cigarro eletrônico que não esteja de acordo com esta lei. \n\n',
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
                      id: 'art32',
                      rotulo: 'Art. 32.',
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
                            id: 'art32_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    A Anvisa poderá realizar inspeções junto às empresas fabricantes, exportadoras, importadoras ou empresas terceirizadas envolvidas em alguma das etapas da produção do produto, para fins de verificação de conformidade das informações declaradas nas respectivas petições de registro ou cadastro. \n\n',
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
                      id: 'art33',
                      rotulo: 'Art. 33.',
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
                            id: 'art33_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    As empresas fabricantes nacionais ou importadoras de cigarro eletrônico devem manter arquivados, por um período de 10 (dez) anos, os dados completos que permitam identificar a cadeia de distribuição dos produtos para os casos de auditoria sanitária ou fiscal. \n\n',
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
                      id: 'art34',
                      rotulo: 'Art. 34.',
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
                            id: 'art34_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    Aplicam-se quanto ao consumo de cigarros eletrônicos as mesmas regras previstas para cigarros convencionais, sendo proibido o consumo em locais fechados, de acordo com regulamentação aplicável. \n\n',
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
                      id: 'art35',
                      rotulo: 'Art. 35.',
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
                            id: 'art35_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n    O descumprimento das disposições contidas nesta Resolução constitui infração sanitária, nos termos da ',
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
                                      href: 'urn:lex:br:federal:lei:1977-08-20;6437',
                                      content: ['Lei nº 6.437, de 20 de agosto de 1977'],
                                    },
                                  },
                                  ', sujeitando o infrator às penalidades previstas neste diploma legal e demais disposições aplicáveis, sem prejuízo das sanções de natureza civil, administrativa e penal cabíveis. \n\n',
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
                      id: 'art36',
                      rotulo: 'Art. 36.',
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
                            id: 'art36_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    Os órgãos indicados nesta lei a regulamentarão no prazo de 90 (noventa) dias. \n\n'],
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
                      id: 'art37',
                      rotulo: 'Art. 37.',
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
                            id: 'art37_cpt',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    Esta lei entra em vigor na data de sua publicação. \n\n'],
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
