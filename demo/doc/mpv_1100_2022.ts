export const MPV_1100_2022 = {
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
      identificacao: { TYPE_NAME: 'br_gov_lexml__1.Identificacao', urn: 'urn:lex:br:federal:medida.provisoria:LEXML_URN_ID' },
    },
    projetoNorma: {
      TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
      norma: {
        TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
        parteInicial: {
          TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
          epigrafe: { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'epigrafe', content: ['MEDIDA PROVISÓRIA Nº LEXML_EPIGRAFE_NUMERO de LEXML_EPIGRAFE_DATA '] },
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
                value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'urn:lex:br:federal:lei:1997-08-06;9478', content: ['Lei nº 9.478, de 6 de agosto de 1997'] },
              },
              ', e a ',
              {
                name: {
                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                  localPart: 'span',
                  prefix: '',
                  key: '{http://www.lexml.gov.br/1.0}span',
                  string: '{http://www.lexml.gov.br/1.0}span',
                },
                value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'urn:lex:br:federal:lei:1998-11-27;9718', content: ['Lei nº 9.718, de 27 de novembro de 1998'] },
              },
              ', para promover ajustes na cobrança da Contribuição para os Programas de Integração Social e de Formação do Patrimônio do Servidor Público - PIS/Pasep e da Contribuição para o Financiamento da Seguridade Social - Cofins incidentes sobre a cadeia de produção e de comercialização de etanol hidratado combustível.\n',
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
                            '\n    Esta Medida Provisória altera a ',
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
                                href: 'urn:lex:br:federal:lei:1997-08-06;9478',
                                content: ['Lei nº 9.478, de 6 de agosto de 1997'],
                              },
                            },
                            ', e a ',
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
                                href: 'urn:lex:br:federal:lei:1998-11-27;9718',
                                content: ['Lei nº 9.718, de 27 de novembro de 1998'],
                              },
                            },
                            ', para promover ajustes na cobrança da Contribuição para os Programas de Integração Social e de Formação do Patrimônio do Servidor Público - PIS/Pasep e da Contribuição para o Financiamento da Seguridade Social - Cofins incidentes sobre a cadeia de produção e de comercialização de etanol hidratado combustível.\n\n  ',
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
                              value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'urn:lex:br:federal:lei:1997;9478', content: ['Lei nº 9.478, de 1997'] },
                            },
                            ', passa a vigorar com as seguintes alterações:\n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:1997;9478',
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
                              href: 'art68-5',
                              id: 'art2_cpt_alt1_art68-5',
                              abreAspas: 's',
                              rotulo: 'Art. 68-E.',
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
                                    href: 'art68-5_cpt',
                                    id: 'art2_cpt_alt1_art68-5_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Sem prejuízo das demais hipóteses previstas na regulação, o agente produtor, a empresa comercializadora e o importador de etanol hidratado combustível ficam autorizados a comercializá-lo com:\n\n  ',
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
                                          href: 'art68-5_cpt_inc1',
                                          id: 'art2_cpt_alt1_art68-5_cpt_inc1',
                                          rotulo: 'I –',
                                          p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    agente distribuidor;\n\n  '] }],
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
                                          href: 'art68-5_cpt_inc2',
                                          id: 'art2_cpt_alt1_art68-5_cpt_inc2',
                                          rotulo: 'II –',
                                          p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    revendedor varejista de combustíveis;\n\n  '] }],
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
                                          href: 'art68-5_cpt_inc3',
                                          id: 'art2_cpt_alt1_art68-5_cpt_inc3',
                                          rotulo: 'III –',
                                          p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    transportador-revendedor-retalhista; e\n\n  '] }],
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
                                          href: 'art68-5_cpt_inc4',
                                          id: 'art2_cpt_alt1_art68-5_cpt_inc4',
                                          rotulo: 'IV –',
                                          p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    mercado externo.\n\n  '] }],
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
                                    href: 'art68-5_par1u',
                                    id: 'art2_cpt_alt1_art68-5_par1u',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: 'Parágrafo único.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Para fins do disposto neste artigo, a cooperativa de produção de etanol hidratado combustível equipara-se a agente produtor.\n\n  ',
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
                              href: 'art68-6',
                              id: 'art2_cpt_alt1_art68-6',
                              abreAspas: 's',
                              rotulo: 'Art. 68-F.',
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
                                    href: 'art68-6_cpt',
                                    id: 'art2_cpt_alt1_art68-6_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Sem prejuízo das demais hipóteses previstas na regulação, o agente revendedor fica autorizado a adquirir e a comercializar etanol hidratado combustível:\n\n  ',
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
                                          href: 'art68-6_cpt_inc1',
                                          id: 'art2_cpt_alt1_art68-6_cpt_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    do agente produtor, da empresa comercializadora ou do importador;\n\n  '],
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
                                          href: 'art68-6_cpt_inc2',
                                          id: 'art2_cpt_alt1_art68-6_cpt_inc2',
                                          rotulo: 'II –',
                                          p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    do agente distribuidor; e\n\n  '] }],
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
                                          href: 'art68-6_cpt_inc3',
                                          id: 'art2_cpt_alt1_art68-6_cpt_inc3',
                                          rotulo: 'III –',
                                          p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    do transportador-revendedor-retalhista.\n\n  '] }],
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
                                    href: 'art68-6_par1u',
                                    id: 'art2_cpt_alt1_art68-6_par1u',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: 'Parágrafo único.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Para fins do disposto neste artigo, a cooperativa de produção de etanol hidratado combustível equipara-se a agente produtor.\n\n  ',
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
                              value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'urn:lex:br:federal:lei:1998;9718', content: ['Lei nº 9.718, de 1998'] },
                            },
                            ', passa a vigorar com as seguintes alterações:\n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:1998;9718',
                        id: 'art3_cpt_alt1',
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
                              href: 'art5',
                              id: 'art3_cpt_alt1_art5',
                              abreAspas: 's',
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
                                  value: { TYPE_NAME: 'br_gov_lexml__1.DispositivoType', href: 'art5_cpt', id: 'art3_cpt_alt1_art5_cpt', textoOmitido: 's' },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: { TYPE_NAME: 'br_gov_lexml__1.Omissis', id: 'art3_cpt_alt1_art5_omi1' },
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
                                    href: 'art5_par4-1',
                                    id: 'art3_cpt_alt1_art5_par4-1',
                                    rotulo: '§ 4º-A.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Na hipótese de venda efetuada diretamente do produtor ou do importador para as pessoas jurídicas comerciantes varejistas, a alíquota aplicável, conforme o caso, será aquela resultante do somatório das alíquotas previstas:\n\n  ',
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
                                  value: { TYPE_NAME: 'br_gov_lexml__1.Omissis', id: 'art3_cpt_alt1_art5_omi2' },
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
                                    href: 'art5_par4-2',
                                    id: 'art3_cpt_alt1_art5_par4-2',
                                    textoOmitido: 's',
                                    rotulo: '§ 4º-B.',
                                    lXcontainersOmissis: [
                                      {
                                        name: {
                                          namespaceURI: 'http://www.lexml.gov.br/1.0',
                                          localPart: 'Omissis',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Omissis',
                                          string: '{http://www.lexml.gov.br/1.0}Omissis',
                                        },
                                        value: { TYPE_NAME: 'br_gov_lexml__1.Omissis', id: 'art3_cpt_alt1_art5_par4-2_omi1' },
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
                                          href: 'art5_par4-2_inc2',
                                          id: 'art3_cpt_alt1_art5_par4-2_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    de as vendas serem efetuadas pelas pessoas jurídicas comerciantes varejistas, quando elas efetuarem a importação; e\n\n  ',
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
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: { TYPE_NAME: 'br_gov_lexml__1.Omissis', id: 'art3_cpt_alt1_art5_omi3' },
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
                                    href: 'art5_par4-4',
                                    id: 'art3_cpt_alt1_art5_par4-4',
                                    rotulo: '§ 4º-D.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Na hipótese de venda de etanol hidratado combustível efetuada diretamente de cooperativa para as pessoas jurídicas comerciantes varejistas:\n\n  ',
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
                                          href: 'art5_par4-4_inc1',
                                          id: 'art3_cpt_alt1_art5_par4-4_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    no caso de cooperativa não optante pelo regime especial de que trata o § 4º, o valor da Contribuição para o PIS/Pasep e da Cofins devido será obtido pelo somatório de duas parcelas, calculadas mediante a aplicação das alíquotas:\n\n  ',
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
                                                href: 'art5_par4-4_inc1_ali1',
                                                id: 'art3_cpt_alt1_art5_par4-4_inc1_ali1',
                                                rotulo: 'a)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    de que trata o inciso I do caput sobre a receita auferida na venda de etanol hidratado combustível, respectivamente; e\n\n  ',
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
                                                href: 'art5_par4-4_inc1_ali2',
                                                id: 'art3_cpt_alt1_art5_par4-4_inc1_ali2',
                                                rotulo: 'b)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    de R$ 19,81 (dezenove reais e oitenta e um centavos) e de R$ 91,10 (noventa e um reais e dez centavos) por metro cúbico de etanol hidratado combustível, respectivamente; e\n\n  ',
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
                                          localPart: 'Inciso',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Inciso',
                                          string: '{http://www.lexml.gov.br/1.0}Inciso',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                          href: 'art5_par4-4_inc2',
                                          id: 'art3_cpt_alt1_art5_par4-4_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    no caso de cooperativa optante pelo regime especial de que trata o § 4º, será aplicado o disposto no inciso II do § 4º-A.\n\n  ',
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
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: { TYPE_NAME: 'br_gov_lexml__1.Omissis', id: 'art3_cpt_alt1_art5_omi4' },
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
                                    href: 'art5_par20-1',
                                    id: 'art3_cpt_alt1_art5_par20-1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 20-A.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O transportador-revendedor-retalhista fica sujeito às disposições da legislação da Contribuição para o PIS/Pasep e da Cofins aplicáveis à pessoa jurídica comerciante varejista.\n\n  ',
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
                            '\n    Fica revogada a ',
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
                                href: 'urn:lex:br:federal:medida.provisoria:2021-09-13;1069',
                                content: ['Medida Provisória nº 1.069, de 13 de setembro de 2021'],
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
                      p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    Esta Medida Provisória entra em vigor na data de sua publicação.\n\n  '] }],
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
