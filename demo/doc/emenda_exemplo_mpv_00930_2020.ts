export const EMENDA_MPV_00930_2020 = {
  projetoNorma: {
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
          urn: 'urn:lex:br:congresso.nacional:medida.provisoria;mpv:2020;930',
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
              content: ['MEDIDA PROVISÓRIA Nº 930 DE 2020'],
            },
            ementa: {
              TYPE_NAME: 'br_gov_lexml__1.GenInline',
              id: 'ementa',
              content: [
                'Dispõe sobre o tratamento tributário incidente sobre a variação cambial do valor de investimentos realizados por instituições financeiras e demais instituições autorizadas a funcionar pelo Banco Central do Brasil em sociedade controlada domiciliada no exterior e sobre a proteção legal oferecida aos integrantes do Banco Central do Brasil no exercício de suas atribuições e altera a Lei nº 12.865, de 9 de outubro de 2013, que dispõe, dentre outras matérias, sobre os arranjos de pagamento e sobre as instituições de pagamento integrantes do Sistema de Pagamentos Brasileiro.\n',
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
                { TYPE_NAME: 'br_gov_lexml__1.GenInline' },
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
                              '\n    Esta Medida Provisória dispõe sobre o tratamento tributário incidente sobre a variação cambial do valor de investimentos realizados por instituições financeiras e demais instituições autorizadas a funcionar pelo Banco Central do Brasil em sociedade controlada estabelecida no exterior e sobre a proteção legal oferecida aos integrantes da Diretoria Colegiada e aos membros das carreiras do Banco Central do Brasil no exercício de suas atribuições e altera a Lei nº 12.865, de 9 de outubro de 2013, que dispõe, dentre outras matérias, sobre os arranjos de pagamento e sobre as instituições de pagamento integrantes do Sistema de Pagamentos Brasileiro.\n\n  ',
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
                  id: 'cap1',
                  rotulo: 'CAPÍTULO I',
                  nomeAgrupador: {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    DAS OPERAÇÕES DE COBERTURA DE RISCO (HEDGE) DE INVESTIMENTO NO EXTERIOR\n\n  '],
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
                                    '\n    A partir do exercício financeiro do ano de 2021, a variação cambial da parcela com cobertura de risco (hedge) do valor do investimento realizado pelas instituições financeiras e pelas demais instituições autorizadas a funcionar pelo Banco Central do Brasil em sociedade controlada domiciliada no exterior deverá ser computada na determinação do lucro real e na base de cálculo da Contribuição Social sobre o Lucro Líquido da pessoa jurídica controladora domiciliada no País, na proporção de:\n\n  ',
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
                                    id: 'art2_cpt_inc1',
                                    rotulo: 'I –',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    cinquenta por cento, no exercício financeiro do ano de 2021; e\n\n  '],
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
                                    id: 'art2_cpt_inc2',
                                    rotulo: 'II –',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    cem por cento, a partir do exercício financeiro do ano de 2022.\n\n  '],
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
                              id: 'art2_par1',
                              rotulo: '§ 1º',
                              p: [
                                {
                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                  content: [
                                    '\n    O disposto nos art. 3º ao art. 9º da Lei nº 12.838, de 9 de julho de 2013,será aplicado até 31 de dezembro de 2022ao saldo de créditos oriundos de prejuízo fiscal e base negativa de contribuição social decorrentes das operações de cobertura de risco cambial (hedge) do investimento em sociedade controlada domiciliada no exterior, originados a partir de 1º de janeiro de 2018 até 31 de dezembro de 2020.\n\n  ',
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
                                  content: ['\n    A Secretaria Especial da Receita Federal do Brasil do Ministério da Economia disciplinará o disposto neste artigo.\n\n  '],
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
                              id: 'art2_par3',
                              rotulo: '§ 3º',
                              p: [
                                {
                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                  content: [
                                    '\n    O crédito presumido de que trata o § 1º somente será apurado pelas instituições financeiras cuja liquidação extrajudicial ou falência tenha sido decretada após a data de publicação desta Medida Provisória.\n\n  ',
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
                    content: ['\n    DA PROTEÇÃO DOS SERVIDORES DO BANCO CENTRAL DO BRASIL\n\n  '],
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
                                    '\n    Ressalvadas as hipóteses de dolo ou de fraude, os integrantes da Diretoria Colegiada e os servidores do Banco Central do Brasil não serão passíveis de responsabilização por atos praticados no exercício de suas atribuições, exceto pelos respectivos órgãos correcionais ou disciplinares.\n\n  ',
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
                                    '\n    O disposto no caput será aplicável enquanto perdurarem os efeitos das ações, linhas de assistência e programas adotados pelo Banco Central do Brasil em resposta à crise decorrente da pandemia da covid-19 e não afasta a responsabilidade criminal.\n\n  ',
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
                    content: ['\n    DAS ALTERAÇÕES NA LEI Nº 12.865, DE 9 DE OUTUBRO DE 2013\n\n  '],
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
                                  content: ['\n    A Lei nº 12.865, de 2013, passa a vigorar com as seguintes alterações:\n\n  '],
                                },
                              ],
                              alteracao: {
                                TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                                id: 'art4_cpt_alt1',
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
                                      href: 'art12-1',
                                      id: 'art4_cpt_alt1_art12-1',
                                      abreAspas: 's',
                                      rotulo: 'Art. 12-A.',
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
                                            href: 'art12-1_cpt',
                                            id: 'art4_cpt_alt1_art12-1_cpt',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Os recursos recebidos pelos participantes do arranjo de pagamento destinados à liquidação das transações de pagamento necessárias ao recebimento pelo usuário final recebedor ou o direito ao recebimento desses recursos para o cumprimento dessa mesma finalidade:\n\n  ',
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
                                                  href: 'art12-1_cpt_inc1',
                                                  id: 'art4_cpt_alt1_art12-1_cpt_inc1',
                                                  rotulo: 'I –',
                                                  p: [
                                                    {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        '\n    não se comunicam com os demais bens e direitos do participante do arranjo de pagamento e só respondem pelo cumprimento de obrigações de liquidação das transações de pagamento no âmbito do arranjo de pagamento ao qual se vinculem;\n\n  ',
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
                                                  href: 'art12-1_cpt_inc2',
                                                  id: 'art4_cpt_alt1_art12-1_cpt_inc2',
                                                  rotulo: 'II –',
                                                  p: [
                                                    {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        '\n    não podem ser objeto de arresto, de sequestro, de busca e apreensão ou de qualquer outro ato de constrição judicial em função de débitos de responsabilidade de qualquer participante do arranjo de pagamento, exceto para cumprimento das obrigações de liquidação entre os participantes do arranjo de pagamento até o recebimento pelo usuário final recebedor, conforme as regras do arranjo de pagamento;\n\n  ',
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
                                                  href: 'art12-1_cpt_inc3',
                                                  id: 'art4_cpt_alt1_art12-1_cpt_inc3',
                                                  rotulo: 'III –',
                                                  p: [
                                                    {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        '\n    não podem ser objeto de cessão de direitos creditórios ou de dados em garantia, exceto se o produto da cessão dos créditos ou a constituição da garantia forem destinados, respectivamente, para cumprir ou para assegurar o cumprimento das obrigações de liquidação entre os participantes do arranjo de pagamento referentes às transações de pagamento até o recebimento pelo usuário final recebedor, conforme as regras do arranjo de pagamento; e\n\n  ',
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
                                                  href: 'art12-1_cpt_inc4',
                                                  id: 'art4_cpt_alt1_art12-1_cpt_inc4',
                                                  rotulo: 'IV –',
                                                  p: [
                                                    {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        '\n    não se sujeitam à arrecadação nos regimes especiais das instituições autorizadas a funcionar pelo Banco Central do Brasil, à recuperação judicial e extrajudicial, à falência, à liquidação judicial ou a qualquer outro regime de recuperação ou dissolução a que seja submetido o participante do arranjo de pagamento pelo qual transitem os referidos recursos.\n\n  ',
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
                                            href: 'art12-1_par1',
                                            id: 'art4_cpt_alt1_art12-1_par1',
                                            rotulo: '§ 1º',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Os recursos destinados ao pagamento ao usuário final recebedor, a qualquer tempo recebidos por participante do arranjo de pagamento submetido aos regimes de que trata o inciso IV do caput, devem ser repassados aos participantes subsequentes da cadeia de liquidação dos fluxos financeiros referentes às transações de pagamento até alcançarem a instituição designada pelo usuário final recebedor para recebimento desses recursos, conforme as regras do arranjo de pagamento correspondente.\n\n  ',
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
                                            href: 'art12-1_par2',
                                            id: 'art4_cpt_alt1_art12-1_par2',
                                            rotulo: '§ 2º',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Sub-roga-se no direito de recebimento dos recursos destinados ao pagamento do usuário final recebedor participante que entregar previamente recursos próprios, com ou sem ônus, ao usuário final recebedor.\n\n  ',
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
                                            href: 'art12-1_par3',
                                            id: 'art4_cpt_alt1_art12-1_par3',
                                            rotulo: '§ 3º',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Não se aplica o disposto no caput aos recursos disponibilizados por participante do arranjo de pagamento ao usuário final recebedor, ainda que permaneçam depositados na instituição de escolha do usuário final recebedor.\n\n  ',
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
                                            href: 'art12-1_par4',
                                            id: 'art4_cpt_alt1_art12-1_par4',
                                            fechaAspas: 's',
                                            notaAlteracao: 'NR',
                                            rotulo: '§ 4º',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    As regras do arranjo de pagamento poderão prever o redirecionamento dos fluxos financeiros referentes às transações de pagamento do participante submetido a um dos regimes de que trata o inciso IV do caput para outro participante ou agente, na forma prevista no regulamento do arranjo aprovado pelo Banco Central do Brasil.\n\n  ',
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
                                      href: 'art12-2',
                                      id: 'art4_cpt_alt1_art12-2',
                                      abreAspas: 's',
                                      rotulo: 'Art. 12-B.',
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
                                            href: 'art12-2_cpt',
                                            id: 'art4_cpt_alt1_art12-2_cpt',
                                            fechaAspas: 's',
                                            notaAlteracao: 'NR',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    O disposto nos art. 12 e art. 12-A aplica-se aos participantes e aos instituidores de arranjos de pagamento, ainda que esses arranjos não sejam alcançados pelas disposições desta Lei, nos termos do disposto no § 4º do art. 6º.\n\n  ',
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
                                      href: 'art12-3',
                                      id: 'art4_cpt_alt1_art12-3',
                                      abreAspas: 's',
                                      rotulo: 'Art. 12-C.',
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
                                            href: 'art12-3_cpt',
                                            id: 'art4_cpt_alt1_art12-3_cpt',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Os bens e os direitos alocados pelos instituidores e pelos participantes de arranjos de pagamento integrantes do Sistema de Pagamentos Brasileiro para garantir a liquidação das transações de pagamento, na forma e na extensão definidas no regulamento do arranjo aprovado pelo Banco Central do Brasil:\n\n  ',
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
                                                  href: 'art12-3_cpt_inc1',
                                                  id: 'art4_cpt_alt1_art12-3_cpt_inc1',
                                                  rotulo: 'I –',
                                                  p: [
                                                    {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        '\n    constituem patrimônio separado, que não podem ser objeto de arresto, de sequestro, de busca e apreensão ou de qualquer outro ato de constrição judicial, exceto para o cumprimento das obrigações assumidas no âmbito do arranjo; e\n\n  ',
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
                                                  href: 'art12-3_cpt_inc2',
                                                  id: 'art4_cpt_alt1_art12-3_cpt_inc2',
                                                  rotulo: 'II –',
                                                  p: [
                                                    {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        '\n    não se sujeitam à arrecadação nos regimes especiais das instituições autorizadas a funcionar pelo Banco Central do Brasil, à recuperação judicial e extrajudicial, à falência, à liquidação judicial ou a qualquer outro regime de recuperação ou dissolução a que seja submetido o participante do arranjo de pagamento pelo qual transitem os referidos recursos.\n\n  ',
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
                                            href: 'art12-3_par1',
                                            id: 'art4_cpt_alt1_art12-3_par1',
                                            rotulo: '§ 1º',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Após o cumprimento das obrigações garantidas pelos instituidores e pelos participantes de arranjos de pagamento integrantes do Sistema de Pagamentos Brasileiro, os bens e os direitos remanescentes serão revertidos ao participante, de forma que não mais se aplicará o disposto nos incisos I e II do caput.\n\n  ',
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
                                            href: 'art12-3_par2',
                                            id: 'art4_cpt_alt1_art12-3_par2',
                                            fechaAspas: 's',
                                            notaAlteracao: 'NR',
                                            rotulo: '§ 2º',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    O disposto neste artigo não se aplica aos arranjos de pagamento fechados, conforme parâmetros estabelecidos pelo Banco Central do Brasil.\n\n  ',
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
                                  content: ['\n    A Lei nº 12.249, de 11 de junho de 2010, passa a vigorar com as seguintes alterações:\n\n  '],
                                },
                              ],
                              alteracao: {
                                TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                                id: 'art5_cpt_alt1',
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
                                      href: 'art41',
                                      id: 'art5_cpt_alt1_art41',
                                      abreAspas: 's',
                                      rotulo: 'Art. 41.',
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
                                            href: 'art41_cpt',
                                            id: 'art5_cpt_alt1_art41_cpt',
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
                                            id: 'art5_cpt_alt1_art41_omi1',
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
                                            href: 'art41_par1u',
                                            id: 'art5_cpt_alt1_art41_par1u',
                                            fechaAspas: 's',
                                            notaAlteracao: 'NR',
                                            rotulo: 'Parágrafo único.',
                                            p: [
                                              {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  '\n    Fica o CMN autorizado a dispor sobre a emissão de Letra Financeira com prazo de vencimento inferior ao previsto no inciso III do caput, para fins de acesso da instituição emitente a operações de redesconto e empréstimo realizadas com o Banco Central do Brasil.\n\n  ',
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
            ],
          },
        },
      },
    },
  },
  emenda: {
    tipo: 'emenda',
    proposicao: { urn: '', identificacao: '' },
    dispositivos: {
      dispositivosSuprimidos: [{ tipo: 'Paragrafo', id: 'art3_par1u', rotulo: 'Parágrafo único.' }],
      dispositivosModificados: [
        {
          tipo: 'Caput',
          id: 'art1_cpt',
          texto:
            'Esta Medida Provisória dispõe sobre o tratamento tributário incidente sobre a variação cambial do valor de investimentos realizados por instituições financeiras e demais instituições autorizadas a funcionar pelo Banco Central do Brasil em sociedade controlada estabelecida no exterior e sobre a proteção legal oferecida aos integrantes da Diretoria Colegiada e aos membros das carreiras do Banco Central do Brasil no exercício de suas atribuições e altera a Lei nº 12.865, de 9 de outubro de 2013, que dispõe, dentre outras matérias, sobre os arranjos de pagamento e sobre as instituições de pagamento integrantes do Sistema de Pagamentos Brasileiro, teste de modificação.',
          rotulo: 'Art. 1º',
        },
      ],
      dispositivosAdicionados: [
        {
          id: 'art1_par1u',
          rotulo: 'Parágrafo único',
          texto: 'um parágrafo novo.',
          idPai: 'art1',
          tipo: 'Paragrafo',
        },
        {
          id: 'art2_cpt_inc2_ite1',
          rotulo: '1.',
          texto: 'novo item',
          idPai: 'art2_cpt_inc2',
          tipo: 'Item',
        },
        {
          id: 'art2_cpt_inc3',
          rotulo: 'III –',
          texto: 'novo insico.',
          idIrmaoAnterior: 'art2_cpt_inc3',
        },
      ],
    },
    comandoEmenda: {
      comandos: [
        {
          cabecalho:
            'Dê-se nova redação ao art. 1º; acrescente-se inciso III ao caput do art. 2º; e suprima-se o parágrafo único do art. 3º da Medida Provisória, nos termos a seguir:',
          citacao: '',
        },
      ],
    },
    justificativa: '',
  },
};
