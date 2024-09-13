export const MPV_1170_2023_ALTERADA = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2024;999@data.evento;leitura;2024-07-31t14.20',
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
            content: ['MEDIDA PROVISÓRIA Nº 999, DE 2024 '],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: ['Altera a remuneração de servidores e de empregados públicos do Poder Executivo federal. '],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
          },
        },
        articulacao: {
          TYPE_NAME: 'br_gov_lexml__1.Articulacao',
          lXhier: [
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Parte',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Parte',
                string: '{http://www.lexml.gov.br/1.0}Parte',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'prt1u',
                rotulo: 'PARTE ÚNICA',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['\n    REESTRUTURAÇÃO\n '],
                },
                lXhier: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Livro',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Livro',
                      string: '{http://www.lexml.gov.br/1.0}Livro',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'prt1u_liv1',
                      rotulo: 'LIVRO I',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['\n    PLANOS DE CARGOS\n '],
                      },
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
                            id: 'prt1u_liv1_tit1',
                            rotulo: 'TÍTULO I',
                            nomeAgrupador: {
                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                              content: ['\n    DOS PLANOS DE CARREIRA\n '],
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
                                              '\n    Esta Medida Provisória altera a remuneração de servidores e de empregados públicos do Poder Executivo federal de que tratam os artigos subsequentes e os Anexos.\n ',
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
                                  tituloDispositivo: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['Plano Especial de Cargos da Cultura'],
                                  },
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
                                              '\n    Os Anexos IV-A, V-B e V-C à ',
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
                                                  href: 'urn:lex:br:federal:lei:2005-12-22;11233',
                                                  content: ['Lei nº 11.233, de 22 de dezembro de 2005'],
                                                },
                                              },
                                              ', passam a vigorar, respectivamente, na forma dos Anexos I, II e III a esta Medida Provisória.\n ',
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
                                  tituloDispositivo: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['Plano de Carreira dos Cargos de Reforma e Desenvolvimento Agrário'],
                                  },
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
                                              '\n    Os Anexos II e V à ',
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
                                                  href: 'urn:lex:br:federal:lei:2005-01-07;11090',
                                                  content: ['Lei nº 11.090, de 7 de janeiro de 2005'],
                                                },
                                              },
                                              ', passam a vigorar, respectivamente, na forma dos Anexos IV e V a esta Medida Provisória.\n ',
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
                                  id: 'prt1u_liv1_tit1_cap1',
                                  rotulo: 'CAPÍTULO I',
                                  nomeAgrupador: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['\n    INSTITUTOS Plano de Carreiras e Cargos do Instituto Nacional de Metrologia, Qualidade e Tecnologia - Inmetro\n '],
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
                                        fechaAspas: 's',
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
                                                    '\n    Os Anexos XI, XI-A, XI-B e XI-C à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006-10-19;11355',
                                                        content: ['Lei nº 11.355, de 19 de outubro de 2006'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos VI, VII, VIII e IX a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Plano de Carreiras e Cargos do Instituto Nacional da Propriedade Industrial - INPI'],
                                        },
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
                                                    '\n    Os Anexos XVIII, XVIII-A, XVIII-B e XVIII-C à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006;11355',
                                                        content: ['Lei nº 11.355, de 2006'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos X, XI, XII e XIII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Plano de Carreiras e Cargos de Ciência, Tecnologia, Produção e Inovação em Saúde Pública da Fundação Oswaldo Cruz - Fiocruz'],
                                        },
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
                                                    '\n    Os Anexos IX-A, IX-B, IX-C e IX-D à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006;11355',
                                                        content: ['Lei nº 11.355, de 2006'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XIV, XV, XVI e XVII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Planos Especiais de Cargos das Agências Reguladoras'],
                                        },
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
                                                    '\n    O Anexo III à ',
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
                                                        href: 'urn:lex:br:federal:lei:2004-06-09;10882',
                                                        content: ['Lei nº 10.882, de 9 de junho de 2004'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XVIII a esta Medida Provisória.\n ',
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
                                                    '\n    Os Anexos XIV, XIV-C e XIV-D à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006-10-19;11357',
                                                        content: ['Lei nº 11.357, de 19 de outubro de 2006'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XIX, XX e XXI a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Carreiras das Agências Reguladoras'],
                                        },
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
                                                    '\n    Os Anexos XXVIII e XXIX à ',
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
                                                        href: 'urn:lex:br:federal:lei:2016-07-29;13326',
                                                        content: ['Lei nº 13.326, de 29 de julho de 2016'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XXII e XXIII a esta Medida Provisória.\n ',
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
                                        id: 'art10',
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Quadro de Pessoal da Advocacia-Geral da União'],
                                        },
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
                                                    '\n    O Anexo I à ',
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
                                                        href: 'urn:lex:br:federal:lei:2002-07-02;10480',
                                                        content: ['Lei nº 10.480, de 2 de julho de 2002'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XXIV a esta Medida Provisória.\n ',
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
                                                    '\n    O Anexo I à ',
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
                                                        href: 'urn:lex:br:federal:lei:2004-07-15;10907',
                                                        content: ['Lei nº 10.907, de 15 de julho de 2004'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XXV a esta Medida Provisória.\n ',
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
                                  id: 'prt1u_liv1_tit1_cap2',
                                  rotulo: 'CAPÍTULO II',
                                  nomeAgrupador: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['\n    PODER EXECUTIVO Plano Geral de Cargos do Poder Executivo\n '],
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
                                                    '\n    Os Anexos III, V-A e V-B à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006;11357',
                                                        content: ['Lei nº 11.357, de 2006'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XXVI, XXVII e XXVIII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Plano Especial de Cargos do Ministério da Fazenda'],
                                        },
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
                                                    '\n    Os Anexos CXXXVII, CXXXVIII e CXL à ',
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
                                                        href: 'urn:lex:br:federal:lei:2009-02-02;11907',
                                                        content: ['Lei nº 11.907, de 2 de fevereiro de 2009'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XXIX, XXX e XXXI a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Plano de Carreiras e Cargos do Hospital das Forças Armadas'],
                                        },
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
                                                    '\n    Os Anexos LXII, LXIII e LXV à ',
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
                                                        href: 'urn:lex:br:federal:lei:2008-09-22;11784',
                                                        content: ['Lei nº 11.784, de 22 de setembro de 2008'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XXXII, XXXIII e XXXIV a esta Medida Provisória.\n ',
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
                                                    '\n    O Anexo à ',
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
                                                        href: 'urn:lex:br:federal:lei:2001-05-15;10225',
                                                        content: ['Lei nº 10.225, de 15 de maio de 2001'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XXXV a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Quadro de Pessoal da Imprensa Nacional'],
                                        },
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
                                                    '\n    O Anexo XII à ',
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
                                                        href: 'urn:lex:br:federal:lei:2005;11090',
                                                        content: ['Lei nº 11.090, de 2005'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XXXVI a esta Medida Provisória.\n ',
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
                                                    '\n    O Anexo XLII à ',
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
                                                        href: 'urn:lex:br:federal:lei:2009;11907',
                                                        content: ['Lei nº 11.907, de 2009'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XXXVII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Plano Especial de Cargos da Agência Brasileira de Promoção Internacional do Turismo - Embratur'],
                                        },
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
                                                    '\n    Os Anexos VI, VI-A e VI-B à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006-10-19;11356',
                                                        content: ['Lei nº 11.356, de 19 de outubro de 2006'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XXXVIII, XXXIX e XL a esta Medida Provisória.\n ',
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
                            id: 'prt1u_liv1_tit2',
                            rotulo: 'TÍTULO II',
                            nomeAgrupador: {
                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                              content: ['\n    DO PLANO ESPECIAL DE CARGOS\n '],
                            },
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
                                  id: 'prt1u_liv1_tit2_cap1',
                                  abreAspas: 's',
                                  rotulo: 'CAPÍTULO I',
                                  nomeAgrupador: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['\n    POLÍCIAS Plano Especial de Cargos da Polícia Rodoviária Federal\n '],
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
                                                    '\n    Os Anexos V, V-B e V-C à ',
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
                                                        href: 'urn:lex:br:federal:lei:2005-01-13;11095',
                                                        content: ['Lei nº 11.095, de 13 de janeiro de 2005'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XLI, XLII e XLIII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Quadro de Pessoal da Fundação Nacional do Índio - Funai'],
                                        },
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
                                                    '\n    Os Anexos LXXXII e LXXXIII à ',
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
                                                        href: 'urn:lex:br:federal:lei:2009;11907',
                                                        content: ['Lei nº 11.907, de 2009'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XLIV e XLV a esta Medida Provisória.\n ',
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
                                        id: 'art21',
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Estrutura Remuneratória de Cargos Específicos'],
                                        },
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
                                                    '\n    Os Anexos XIII e XIV à ',
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
                                                        href: 'urn:lex:br:federal:lei:2010-06-30;12277',
                                                        content: ['Lei nº 12.277, de 30 de junho de 2010'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XLVI e XLVII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Área de Auditoria do Sistema Único de Saúde'],
                                        },
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
                                                    '\n    O Anexo XV à ',
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
                                                        href: 'urn:lex:br:federal:lei:2006-09-08;11344',
                                                        content: ['Lei nº 11.344, de 8 de setembro de 2006'],
                                                      },
                                                    },
                                                    ', passa a vigorar na forma do Anexo XLVIII a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: [
                                            'Servidores do Instituto Nacional de Meteorologia - Inmet e servidores da Comissão Executiva do Plano da Lavoura Cacaueira - Ceplac',
                                          ],
                                        },
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
                                                    '\n    Os Anexos I e II à ',
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
                                                        href: 'urn:lex:br:federal:lei:2012-08-07;12702',
                                                        content: ['Lei nº 12.702, de 7 de agosto de 2012'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos XLIX e L a esta Medida Provisória.\n ',
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
                                        tituloDispositivo: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['Carreira da Seguridade Social e do Trabalho'],
                                        },
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
                                                    '\n    Os Anexos III-A e V à ',
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
                                                        href: 'urn:lex:br:federal:lei:2002-07-03;10483',
                                                        content: ['Lei nº 10.483, de 3 de julho de 2002'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos LI e LII a esta Medida Provisória.\n ',
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
                                                        href: 'urn:lex:br:federal:lei:2004-11-25;10971',
                                                        content: ['Lei nº 10.971, de 25 de novembro de 2004'],
                                                      },
                                                    },
                                                    ', passa a vigorar com as seguintes alterações: \n ',
                                                  ],
                                                },
                                              ],
                                              alteracao: {
                                                TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                                                base: 'urn:lex:br:federal:lei:2004-11-25;10971',
                                                id: 'art25_cpt_alt1',
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
                                                      href: 'art5-1',
                                                      id: 'art25_cpt_alt1_art5-1',
                                                      abreAspas: 's',
                                                      rotulo: 'Art. 5º-A.',
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
                                                            href: 'art5-1_cpt',
                                                            id: 'art25_cpt_alt1_art5-1_cpt',
                                                            fechaAspas: 's',
                                                            p: [
                                                              {
                                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                                content: [
                                                                  '\n    A partir de 1º de maio de 2023, a GESST passa a ter o valor de R$ 224,54 (duzentos e vinte e quatro reais e cinquenta e quatro centavos).\n ',
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
                                  id: 'prt1u_liv1_tit2_cap2',
                                  rotulo: 'CAPÍTULO II',
                                  nomeAgrupador: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['\n    PREVIDÊNCIA Carreira Previdenciária\n '],
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
                                                    '\n    Os Anexos II-A e III à ',
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
                                                        href: 'urn:lex:br:federal:lei:2001-12-26;10355',
                                                        content: ['Lei nº 10.355, de 26 de dezembro de 2001'],
                                                      },
                                                    },
                                                    ', passam a vigorar, respectivamente, na forma dos Anexos LIII e LIV a esta Medida Provisória.\n ',
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
                                                        href: 'urn:lex:br:federal:lei:2001;10355',
                                                        content: ['Lei nº 10.355, de 2001'],
                                                      },
                                                    },
                                                    ', passa a vigorar com as seguintes alterações: \n ',
                                                  ],
                                                },
                                              ],
                                              alteracao: {
                                                TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                                                base: 'urn:lex:br:federal:lei:2001;10355',
                                                id: 'art27_cpt_alt1',
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
                                                      href: 'art3-2',
                                                      id: 'art27_cpt_alt1_art3-2',
                                                      abreAspas: 's',
                                                      rotulo: 'Art. 3º-B.',
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
                                                            href: 'art3-2_cpt',
                                                            id: 'art27_cpt_alt1_art3-2_cpt',
                                                            fechaAspas: 's',
                                                            p: [
                                                              {
                                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                                content: [
                                                                  '\n    A partir de 1º de maio de 2023, a GEP passa a ter o valor de R$ 259,42 (duzentos e cinquenta e nove reais e quarenta e dois centavos).\n ',
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
                                        localPart: 'Secao',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Secao',
                                        string: '{http://www.lexml.gov.br/1.0}Secao',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                                        id: 'prt1u_liv1_tit2_cap2_sec1',
                                        rotulo: 'Seção I',
                                        nomeAgrupador: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['\n    Saúde Carreira da Previdência, da Saúde e do Trabalho\n '],
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
                                                          '\n    Os Anexos IV-A, IV-B e IV-C à ',
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
                                                              href: 'urn:lex:br:federal:lei:2006;11355',
                                                              content: ['Lei nº 11.355, de 2006'],
                                                            },
                                                          },
                                                          ', passam a vigorar, respectivamente, na forma dos Anexos LV, LVI e LVII a esta Medida Provisória.\n ',
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
                                              tituloDispositivo: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  'Gratificação Especial de Atividade de Combate e Controle de Endemias - Gecen e Gratificação de Atividade de Combate e Controle de Endemias - Gacen',
                                                ],
                                              },
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
                                                          '\n    O Anexo XLIX-A à ',
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
                                                              href: 'urn:lex:br:federal:lei:2008;11784',
                                                              content: ['Lei nº 11.784, de 2008'],
                                                            },
                                                          },
                                                          ', passa a vigorar na forma do Anexo LVIII a esta Medida Provisória.\n ',
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
                                              tituloDispositivo: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: ['Emprego público de Agente de Combate às Endemias'],
                                              },
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
                                                          '\n    O Anexo à ',
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
                                                              href: 'urn:lex:br:federal:lei:2006-10-05;11350',
                                                              content: ['Lei nº 11.350, de 5 de outubro de 2006'],
                                                            },
                                                          },
                                                          ', passa a vigorar na forma do Anexo LIX a esta Medida Provisória.\n ',
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
                                              id: 'art31',
                                              tituloDispositivo: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: ['Quadro em Extinção de Combate às Endemias '],
                                              },
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
                                                          '\n    Os Anexos II e III à ',
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
                                                              href: 'urn:lex:br:federal:lei:2014-09-03;13026',
                                                              content: ['Lei nº 13.026, de 3 de setembro de 2014'],
                                                            },
                                                          },
                                                          ', passam a vigorar, respectivamente, na forma dos Anexos LX e LXI a esta Medida Provisória. Remuneração dos empregados beneficiados pela ',
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
                                                              href: 'urn:lex:br:federal:lei:1994-05-11;8878',
                                                              content: ['Lei nº 8.878, de 11 de maio de 1994'],
                                                            },
                                                          },
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
                                                          '\n    O Anexo XLVI à ',
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
                                                              href: 'urn:lex:br:federal:lei:2012;12702',
                                                              content: ['Lei nº 12.702, de 2012'],
                                                            },
                                                          },
                                                          ', passa a vigorar na forma do Anexo LXII a esta Medida Provisória.\n ',
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
                                                          '\n    O Anexo CLXX à ',
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
                                                              href: 'urn:lex:br:federal:lei:2009;11907',
                                                              content: ['Lei nº 11.907, de 2009'],
                                                            },
                                                          },
                                                          ', passa a vigorar na forma do Anexo LXIII a esta Medida Provisória.\n ',
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
                                        localPart: 'Secao',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Secao',
                                        string: '{http://www.lexml.gov.br/1.0}Secao',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                                        id: 'prt1u_liv1_tit2_cap2_sec2',
                                        rotulo: 'Seção II',
                                        nomeAgrupador: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['\n    Defesa Grupo Defesa Aérea e Controle de Tráfego Aéreo - DACTA\n '],
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
                                                          '\n    O Anexo II à ',
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
                                                              href: 'urn:lex:br:federal:lei:2002-11-13;10551',
                                                              content: ['Lei nº 10.551, de 13 de novembro de 2002'],
                                                            },
                                                          },
                                                          ', passa a vigorar na forma do Anexo LXIV a esta Medida Provisória.\n ',
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
                                                          '\n    O Anexo IX à ',
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
                                                              href: 'urn:lex:br:federal:lei:2009;11907',
                                                              content: ['Lei nº 11.907, de 2009'],
                                                            },
                                                          },
                                                          ', passa a vigorar na forma do Anexo LXV a esta Medida Provisória.\n ',
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
                                              tituloDispositivo: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: ['Plano de Carreiras para a Área de Ciência e Tecnologia'],
                                              },
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
                                                        content: [
                                                          '\n    Os Anexos VIII-A e VIII-B à ',
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
                                                              href: 'urn:lex:br:federal:lei:2006;11344',
                                                              content: ['Lei nº 11.344, de 2006'],
                                                            },
                                                          },
                                                          ', passam a vigorar, respectivamente, na forma dos Anexos LXVI e LXVII a esta Medida Provisória.\n ',
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
                                                        content: [
                                                          '\n    Os Anexos XIX e XX à ',
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
                                                              href: 'urn:lex:br:federal:lei:2009;11907',
                                                              content: ['Lei nº 11.907, de 2009'],
                                                            },
                                                          },
                                                          ', passam a vigorar, respectivamente, na forma dos Anexos LXVIII e LXIX a esta Medida Provisória.\n ',
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
                                              id: 'art38',
                                              tituloDispositivo: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: [
                                                  'Plano de Carreiras e Cargos de Pesquisa e Investigação Biomédica em Saúde Pública dos Quadros de Pessoal do Instituto Evandro Chagas - IEC e do Centro Nacional de Primatas - CENP',
                                                ],
                                              },
                                              rotulo: 'Art. 38.',
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
                                                    id: 'art38_cpt',
                                                    p: [
                                                      {
                                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                        content: [
                                                          '\n    Os Anexos CXX, CXXIII, CXXIV, CXXV e CXXVI à ',
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
                                                              href: 'urn:lex:br:federal:lei:2009;11907',
                                                              content: ['Lei nº 11.907, de 2009'],
                                                            },
                                                          },
                                                          ', passam a vigorar, respectivamente, na forma dos Anexos LXX, LXXI, LXXII, LXXIII e LXXIV a esta Medida Provisória.\n ',
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
                                        localPart: 'Secao',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Secao',
                                        string: '{http://www.lexml.gov.br/1.0}Secao',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                                        id: 'prt1u_liv1_tit2_cap2_sec3',
                                        rotulo: 'Seção III',
                                        nomeAgrupador: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['\n    Agências Reguladoras\n '],
                                        },
                                        lXhier: [
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Subsecao',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Subsecao',
                                              string: '{http://www.lexml.gov.br/1.0}Subsecao',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                                              id: 'prt1u_liv1_tit2_cap2_sec3_sub1',
                                              rotulo: 'Subseção I',
                                              nomeAgrupador: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: ['\n    Agência Nacional de Mineração Quadro de Pessoal da Agência Nacional de Mineração - ANM\n '],
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
                                                    id: 'art39',
                                                    rotulo: 'Art. 39.',
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
                                                          id: 'art39_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II, V, VI-A, VI-B, VI-C, VI-D e VII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2004-12-27;11046',
                                                                    content: ['Lei nº 11.046, de 27 de dezembro de 2004'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos LXXV, LXXVI, LXXVII, LXXVIII, LXXIX, LXXX e LXXXI a esta Medida Provisória.\n ',
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
                                                    id: 'art40',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreira dos Cargos de Tecnologia Militar'],
                                                    },
                                                    rotulo: 'Art. 40.',
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
                                                          id: 'art40_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos I, II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:1998-06-03;9657',
                                                                    content: ['Lei nº 9.657, de 3 de junho de 1998'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos LXXXII, LXXXIII e LXXXIV a esta Medida Provisória.\n ',
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
                                                    id: 'art41',
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
                                                          id: 'art41_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo XXI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11355',
                                                                    content: ['Lei nº 11.355, de 2006'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo LXXXV a esta Medida Provisória.\n ',
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
                                              localPart: 'Subsecao',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Subsecao',
                                              string: '{http://www.lexml.gov.br/1.0}Subsecao',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                                              id: 'prt1u_liv1_tit2_cap2_sec3_sub2',
                                              rotulo: 'Subseção II',
                                              nomeAgrupador: {
                                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                content: ['\n    ABIN Plano de Carreiras e Cargos da Agência Brasileira de Inteligência - ABIN\n '],
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
                                                    id: 'art42',
                                                    rotulo: 'Art. 42.',
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
                                                          id: 'art42_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II, III, IV, V e VI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008-09-17;11776',
                                                                    content: ['Lei nº 11.776, de 17 de setembro de 2008'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos LXXXVI, LXXXVII, LXXXVIII, LXXXIX e XC a esta Medida Provisória.\n ',
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
                                                    id: 'art43',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira do Seguro Social'],
                                                    },
                                                    rotulo: 'Art. 43.',
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
                                                          id: 'art43_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos IV-A e VI-A à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2004-04-01;10855',
                                                                    content: ['Lei nº 10.855, de 1º de abril de 2004'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos XCI e XCII a esta Medida Provisória.\n ',
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
                                                    id: 'art44',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Auditor Fiscal Federal Agropecuário'],
                                                    },
                                                    rotulo: 'Art. 44.',
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
                                                          id: 'art44_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2012-12-28;12775',
                                                                    content: ['Lei nº 12.775, de 28 de dezembro de 2012'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo XCIII a esta Medida Provisória.\n ',
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
                                                    id: 'art45',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        'Cargos de Atividades Técnicas da Fiscalização Federal Agropecuária do Quadro de Pessoal Permanente do Ministério da Agricultura e Pecuária',
                                                      ],
                                                    },
                                                    rotulo: 'Art. 45.',
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
                                                          id: 'art45_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2002-07-03;10484',
                                                                    content: ['Lei nº 10.484, de 3 de julho de 2002'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo XCIV a esta Medida Provisória.\n ',
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
                                                    id: 'art46',
                                                    rotulo: 'Art. 46.',
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
                                                          id: 'art46_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo IX à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2005;11090',
                                                                    content: ['Lei nº 11.090, de 2005'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo XCV a esta Medida Provisória.\n ',
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
                                                    id: 'art47',
                                                    rotulo: 'Art. 47.',
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
                                                          id: 'art47_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo XIV-A à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11344',
                                                                    content: ['Lei nº 11.344, de 2006'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo XCVI a esta Medida Provisória.\n ',
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
                                                    id: 'art48',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreira dos Cargos de Atividades Técnicas e Auxiliares de Fiscalização Federal Agropecuária - PCTAF'],
                                                    },
                                                    rotulo: 'Art. 48.',
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
                                                          id: 'art48_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos LXXVII e LXXVIII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2016-07-29;13324',
                                                                    content: ['Lei nº 13.324, de 29 de julho de 2016'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos XCVII e XCVIII a esta Medida Provisória.\n ',
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
                                                    id: 'art49',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        'Carreira de Especialista em Meio Ambiente e Plano Especial de Cargos do Ministério do Meio Ambiente e Mudança do Clima e do Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis - IBAMA',
                                                      ],
                                                    },
                                                    rotulo: 'Art. 49.',
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
                                                          id: 'art49_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos I, II, III e IV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2002-01-11;10410',
                                                                    content: ['Lei nº 10.410, de 11 de janeiro de 2002'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos XCIX, C, CI e CII a esta Medida Provisória.\n ',
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
                                                    id: 'art50',
                                                    rotulo: 'Art. 50.',
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
                                                          id: 'art50_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos I e II à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2005-07-29;11156',
                                                                    content: ['Lei nº 11.156, de 29 de julho de 2005'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CIII e CIV a esta Medida Provisória.\n ',
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
                                                    id: 'art51',
                                                    rotulo: 'Art. 51.',
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
                                                          id: 'art51_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos VIII, X e X-A à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11357',
                                                                    content: ['Lei nº 11.357, de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CV, CVI e CVII a esta Medida Provisória.\n ',
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
                                                    id: 'art52',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Cargos de Médico do Poder Executivo'],
                                                    },
                                                    rotulo: 'Art. 52.',
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
                                                          id: 'art52_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XLV e XLVIII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2012;12702',
                                                                    content: ['Lei nº 12.702, de 2012'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CVIII e CIX a esta Medida Provisória.\n ',
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
                                                    id: 'art53',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Gratificação de Incremento à Atividade de Administração do Patrimônio da União - GIAPU'],
                                                    },
                                                    rotulo: 'Art. 53.',
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
                                                          id: 'art53_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo VI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2005;11095',
                                                                    content: ['Lei nº 11.095, de 2005'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CX a esta Medida Provisória.\n ',
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
                                                    id: 'art54',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreira dos Cargos Técnico-Administrativos em Educação'],
                                                    },
                                                    rotulo: 'Art. 54.',
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
                                                          id: 'art54_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo I-C à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2005-01-12;11091',
                                                                    content: ['Lei nº 11.091, de 12 de janeiro de 2005'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXI a esta Medida Provisória.\n ',
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
                                                    id: 'art55',
                                                    rotulo: 'Art. 55.',
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
                                                          id: 'art55_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo XLVII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2012;12702',
                                                                    content: ['Lei nº 12.702, de 2012'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXII a esta Medida Provisória.\n ',
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
                                                    id: 'art56',
                                                    rotulo: 'Art. 56.',
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
                                                          id: 'art56_cpt',
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
                                                                    href: 'urn:lex:br:federal:lei:2012-12-28;12772',
                                                                    content: ['Lei nº 12.772, de 28 de dezembro de 2012'],
                                                                  },
                                                                },
                                                                ', passa a vigorar com as seguintes alterações: A parcela complementar de que tratam os ',
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
                                                                    href: 'urn:lex:br:federal:lei:2005;11091!art15_par2',
                                                                    content: ['§ 2º'],
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
                                                                    href: 'urn:lex:br:federal:lei:2005;11091!art15_par3',
                                                                    content: ['§ 3º do art. 15 da Lei nº 11.091, de 2005'],
                                                                  },
                                                                },
                                                                ', não será absorvida por força dos aumentos remuneratórios com efeitos financeiros no período de 2013 a 2023." "Art. 43.\n ',
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
                                                    id: 'art57',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        'Carreiras e Planos Especiais de Cargos do Fundo Nacional de Desenvolvimento da Educação - FNDE e do Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira - Inep',
                                                      ],
                                                    },
                                                    rotulo: 'Art. 57.',
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
                                                          id: 'art57_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XVI-G, XVIII-C, XIX-D, XX-A, XX-B, XX-C, XX-D, XXI-F, XXIII-E, XXIV-C, XXV-B, XXV-C, XXV-D e XXV-E à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11357',
                                                                    content: ['Lei nº 11.357, de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXIII, CXIV, CXV, CXVI, CXVII, CXVIII, CXIX, CXX, CXXI, CXXII, CXXIII, CXXIV, CXXV e CXXVI a esta Medida Provisória.\n ',
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
                                                    id: 'art58',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras Tributária e Aduaneira da Receita Federal do Brasil e de Auditoria-Fiscal do Trabalho'],
                                                    },
                                                    rotulo: 'Art. 58.',
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
                                                          id: 'art58_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo IV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2004-07-15;10910',
                                                                    content: ['Lei nº 10.910, de 15 de julho de 2004'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXXVII a esta Medida Provisória.\n ',
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
                                                    id: 'art59',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Diplomata'],
                                                    },
                                                    rotulo: 'Art. 59.',
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
                                                          id: 'art59_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo VII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008-12-24;11890',
                                                                    content: ['Lei nº 11.890, de 24 de dezembro de 2008'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXXVIII a esta Medida Provisória.\n ',
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
                                                    id: 'art60',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras de Oficial de Chancelaria e de Assistente de Chancelaria'],
                                                    },
                                                    rotulo: 'Art. 60.',
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
                                                          id: 'art60_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos I e II à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2012;12775',
                                                                    content: ['Lei nº 12.775, de 2012'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXXIX e CXXX a esta Medida Provisória.\n ',
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
                                                    id: 'art61',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras de Analista de Infraestrutura e cargo isolado de Especialista em Infraestrutura Sênior'],
                                                    },
                                                    rotulo: 'Art. 61.',
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
                                                          id: 'art61_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II, III e IV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2007-11-08;11539',
                                                                    content: ['Lei nº 11.539, de 8 de novembro de 2007'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXXXI, CXXXII e CXXXIII a esta Medida Provisória.\n ',
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
                                                    id: 'art62',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras de Gestão Governamental'],
                                                    },
                                                    rotulo: 'Art. 62.',
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
                                                          id: 'art62_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo IV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008;11890',
                                                                    content: ['Lei nº 11.890, de 2008'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXXXIV a esta Medida Provisória.\n ',
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
                                                    id: 'art63',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreiras e Cargos do Instituto de Pesquisa Econômica Aplicada - IPEA'],
                                                    },
                                                    rotulo: 'Art. 63.',
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
                                                          id: 'art63_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XX, XXI e XXII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008;11890',
                                                                    content: ['Lei nº 11.890, de 2008'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXXXV, CXXXVI e CXXXVII a esta Medida Provisória.\n ',
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
                                                    id: 'art64',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano Especial de Cargos da Superintendência da Zona Franca de Manaus - Suframa'],
                                                    },
                                                    rotulo: 'Art. 64.',
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
                                                          id: 'art64_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos III, III-A e III-B à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11356',
                                                                    content: ['Lei nº 11.356, de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXXXVIII, CXXXIX e CXL a esta Medida Provisória.\n ',
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
                                                    id: 'art65',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreiras e Cargos da Superintendência de Seguros Privados - Susep'],
                                                    },
                                                    rotulo: 'Art. 65.',
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
                                                          id: 'art65_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos IX, X, X-A e XII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008;11890',
                                                                    content: ['Lei nº 11.890, de 2008'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXLI, CXLII, CXLIII e CXLIV a esta Medida Provisória.\n ',
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
                                                    id: 'art66',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreiras e Cargos da Comissão de Valores Mobiliários - CVM'],
                                                    },
                                                    rotulo: 'Art. 66.',
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
                                                          id: 'art66_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XIV, XV, XV-A e XVII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008;11890',
                                                                    content: ['Lei nº 11.890, de 2008'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXLV, CXLVI, CXLVII e CXLVIII a esta Medida Provisória.\n ',
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
                                                    id: 'art67',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Especialista do Banco Central do Brasil'],
                                                    },
                                                    rotulo: 'Art. 67.',
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
                                                          id: 'art67_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo II-A à ',
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
                                                                    href: 'urn:lex:br:federal:lei:1998-05-27;9650',
                                                                    content: ['Lei nº 9.650, de 27 de maio de 1998'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXLIX a esta Medida Provisória.\n ',
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
                                                    id: 'art68',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras Jurídicas'],
                                                    },
                                                    rotulo: 'Art. 68.',
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
                                                          id: 'art68_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo XXXV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2016-07-29;13327',
                                                                    content: ['Lei nº 13.327, de 29 de julho de 2016'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CL a esta Medida Provisória.\n ',
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
                                                    id: 'art69',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras de Policial Federal e de Policial Rodoviário Federal'],
                                                    },
                                                    rotulo: 'Art. 69.',
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
                                                          id: 'art69_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006-10-19;11358',
                                                                    content: ['Lei nº 11.358, de 19 de outubro de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLI e CLII a esta Medida Provisória.\n ',
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
                                                    id: 'art70',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Perito Federal Agrário'],
                                                    },
                                                    rotulo: 'Art. 70.',
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
                                                          id: 'art70_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2002-11-13;10550',
                                                                    content: ['Lei nº 10.550, de 13 de novembro de 2002'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLIII e CLIV a esta Medida Provisória.\n ',
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
                                                    id: 'art71',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Desenvolvimento de Políticas Sociais'],
                                                    },
                                                    rotulo: 'Art. 71.',
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
                                                          id: 'art71_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009-11-19;12094',
                                                                    content: ['Lei nº 12.094, de 19 de novembro de 2009'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLV e CLVI a esta Medida Provisória.\n ',
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
                                                    id: 'art72',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreiras e Plano Especial de Cargos do Departamento Nacional de Infraestrutura de Transportes - DNIT'],
                                                    },
                                                    rotulo: 'Art. 72.',
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
                                                          id: 'art72_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II, V, VII e VIII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2005-09-02;11171',
                                                                    content: ['Lei nº 11.171, de 2 de setembro de 2005'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLVII, CLVIII, CLIX, CLX a esta Medida Provisória.\n ',
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
                                                    id: 'art73',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreiras e Cargos da Fundação Instituto Brasileiro de Geografia e Estatística - IBGE'],
                                                    },
                                                    rotulo: 'Art. 73.',
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
                                                          id: 'art73_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XV, XV-A, XV-B e XV-C à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11355',
                                                                    content: ['Lei nº 11.355, de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXI, CLXII, CLXIII e CLXIV a esta Medida Provisória.\n ',
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
                                                    id: 'art74',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: [
                                                        'Carreiras de Agente Federal de Execução Penal, de Especialista Federal em Assistência à Execução Penal e de Técnico Federal de Apoio à Execução Penal',
                                                      ],
                                                    },
                                                    rotulo: 'Art. 74.',
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
                                                          id: 'art74_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos LXXXV, LXXXVII, LXXXIX e XC à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009;11907',
                                                                    content: ['Lei nº 11.907, de 2009'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXV, CLXVI, CLXVII e CLXVIII a esta Medida Provisória.\n ',
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
                                                    id: 'art75',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano Especial de Cargos da Polícia Federal'],
                                                    },
                                                    rotulo: 'Art. 75.',
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
                                                          id: 'art75_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II, IV e V à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2003-05-28;10682',
                                                                    content: ['Lei nº 10.682, de 28 de maio de 2003'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXIX, CLXX e CLXXI a esta Medida Provisória.\n ',
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
                                                    id: 'art76',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreiras e Cargos da Superintendência Nacional de Previdência Complementar - Previc'],
                                                    },
                                                    rotulo: 'Art. 76.',
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
                                                          id: 'art76_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009-12-23;12154',
                                                                    content: ['Lei nº 12.154, de 23 de dezembro de 2009'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXXII e CLXXIII a esta Medida Provisória.\n ',
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
                                                    id: 'art77',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Carreiras e Cargos de Magistério Federal e Plano de Carreiras de Magistério do Ensino Básico Federal'],
                                                    },
                                                    rotulo: 'Art. 77.',
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
                                                          id: 'art77_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos III e IV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2012;12772',
                                                                    content: ['Lei nº 12.772, de 2012'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXXIV e CLXXV a esta Medida Provisória.\n ',
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
                                                    id: 'art78',
                                                    rotulo: 'Art. 78.',
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
                                                          id: 'art78_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos LXXVII-A, LXXXIII-A, LXXIX-A e LXXXV-A à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008;11784',
                                                                    content: ['Lei nº 11.784, de 2008'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXXVI, CLXXVII, CLXXVIII e CLXXIX a esta Medida Provisória.\n ',
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
                                                    id: 'art79',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Perito Médico Federal e Carreira de Supervisor Médico-Pericial'],
                                                    },
                                                    rotulo: 'Art. 79.',
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
                                                          id: 'art79_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XV e XVI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009;11907',
                                                                    content: ['Lei nº 11.907, de 2009'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXXX e CLXXXI a esta Medida Provisória.\n ',
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
                                                    id: 'art80',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Classificação de Cargos'],
                                                    },
                                                    rotulo: 'Art. 80.',
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
                                                          id: 'art80_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo I à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2004;10971',
                                                                    content: ['Lei nº 10.971, de 2004'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CLXXXII a esta Medida Provisória.\n ',
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
                                                    id: 'art81',
                                                    rotulo: 'Art. 81.',
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
                                                          id: 'art81_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo XL à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009;11907',
                                                                    content: ['Lei nº 11.907, de 2009'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CLXXXIII a esta Medida Provisória.\n ',
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
                                                    id: 'art82',
                                                    rotulo: 'Art. 82.',
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
                                                          id: 'art82_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo IX à ',
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
                                                                    href: 'urn:lex:br:federal:lei:1992-09-17;8460',
                                                                    content: ['Lei nº 8.460, de 17 de setembro de 1992'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CLXXXIV a esta Medida Provisória.\n ',
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
                                                    id: 'art83',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Cargo de Técnico de Planejamento P-1501 do Grupo P-1500'],
                                                    },
                                                    rotulo: 'Art. 83.',
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
                                                          id: 'art83_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos XXIII e XXIV à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2008;11890',
                                                                    content: ['Lei nº 11.890, de 2008'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXXXV e CLXXXVI a esta Medida Provisória.\n ',
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
                                                    id: 'art84',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Gratificação Específica de Produção de Radioisótopos e Radiofármacos e Adicional por Plantão Hospitalar'],
                                                    },
                                                    rotulo: 'Art. 84.',
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
                                                          id: 'art84_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos CLVIII e CLXVI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009;11907',
                                                                    content: ['Lei nº 11.907, de 2009'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CLXXXVII e CLXXXVIII a esta Medida Provisória.\n ',
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
                                                    id: 'art85',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Gratificação Temporária de Agências Reguladoras - GTAR'],
                                                    },
                                                    rotulo: 'Art. 85.',
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
                                                          id: 'art85_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo VI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2004;10882',
                                                                    content: ['Lei nº 10.882, de 2004'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CLXXXIX a esta Medida Provisória.\n ',
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
                                                    id: 'art86',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Adicional por Participação em Missão no Exterior - APME'],
                                                    },
                                                    rotulo: 'Art. 86.',
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
                                                          id: 'art86_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo I à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2010;12277',
                                                                    content: ['Lei nº 12.277, de 2010'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXC a esta Medida Provisória.\n ',
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
                                                    id: 'art87',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira Policial Civil dos extintos Territórios Federais do Acre, do Amapá, de Rondônia e de Roraima'],
                                                    },
                                                    rotulo: 'Art. 87.',
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
                                                          id: 'art87_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo VI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11358',
                                                                    content: ['Lei nº 11.358, de 2006'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXCI a esta Medida Provisória.\n ',
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
                                                    id: 'art88',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Magistério dos optantes pela inclusão em Quadro em Extinção da União dos ex-Territórios'],
                                                    },
                                                    rotulo: 'Art. 88.',
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
                                                          id: 'art88_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo II à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2018-06-18;13681',
                                                                    content: ['Lei nº 13.681, de 18 de junho de 2018'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXCII a esta Medida Provisória.\n ',
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
                                                    id: 'art89',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Plano de Classificação de Cargos dos ex-Territórios Federais'],
                                                    },
                                                    rotulo: 'Art. 89.',
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
                                                          id: 'art89_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos IV e V à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2018;13681',
                                                                    content: ['Lei nº 13.681, de 2018'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXCIII e CXCIV a esta Medida Provisória. Empregados de que trata o ',
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
                                                                    href: 'urn:lex:br:federal:lei:2018;13681!art13',
                                                                    content: ['art. 13 da Lei nº 13.681, de 2018'],
                                                                  },
                                                                },
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
                                                    id: 'art90',
                                                    rotulo: 'Art. 90.',
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
                                                          id: 'art90_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo VI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2018;13681',
                                                                    content: ['Lei nº 13.681, de 2018'],
                                                                  },
                                                                },
                                                                ', passa a vigorar na forma do Anexo CXCV a esta Medida Provisória.\n ',
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
                                                    id: 'art91',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Cargos de Juiz Presidente e Juiz do Tribunal Marítimo'],
                                                    },
                                                    rotulo: 'Art. 91.',
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
                                                          id: 'art91_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006-07-06;11319',
                                                                    content: ['Lei nº 11.319, de 6 de julho de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CXCVI e CXCVII a esta Medida Provisória.\n ',
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
                                                    id: 'art92',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Empregados Reintegrados ao Quadro de Pessoal do Banco Central do Brasil'],
                                                    },
                                                    rotulo: 'Art. 92.',
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
                                                          id: 'art92_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    A remuneração do pessoal submetido ao regime jurídico previsto na ',
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
                                                                    href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452',
                                                                    content: ['Consolidação das Leis do Trabalho'],
                                                                  },
                                                                },
                                                                ', aprovada pelo ',
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
                                                                    href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452',
                                                                    content: ['Decreto-Lei nº 5.452, de 1º de maio de 1943'],
                                                                  },
                                                                },
                                                                ', incluído no quadro de pessoal do Banco Central do Brasil entre 1998 e 2005 em decorrência de decisão judicial será a constante no Anexo CXCVIII a esta Medida Provisória.\n ',
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
                                                          id: 'art92_par1',
                                                          rotulo: '§ 1º',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os empregados de que trata o caput poderão optar, no prazo de trinta dias, contado da data de entrada em vigor desta Medida Provisória, em caráter irretratável, pelo padrão remuneratório anterior.\n ',
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
                                                          id: 'art92_par2',
                                                          rotulo: '§ 2º',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Compete ao Banco Central do Brasil proceder às devidas anotações nas Carteiras de Trabalho e Previdência Social dos empregados que realizarem a opção de que trata o § 1º.\n ',
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
                                                    id: 'art93',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Carreira de Perito Médico da Previdência Social'],
                                                    },
                                                    rotulo: 'Art. 93.',
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
                                                          id: 'art93_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos II, V e VI à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2004-06-02;10876',
                                                                    content: ['Lei nº 10.876, de 2 de junho 2004'],
                                                                  },
                                                                },
                                                                ', passam a vigorar na forma do Anexo CXCIX a esta Medida Provisória.\n ',
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
                                                    id: 'art94',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Cargos em comissão, funções de confiança e gratificações'],
                                                    },
                                                    rotulo: 'Art. 94.',
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
                                                          id: 'art94_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos I, II e III à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2007-10-04;11526',
                                                                    content: ['Lei nº 11.526, de 4 de outubro de 2007'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, com as alterações constantes dos Anexos CC, CCI e CCII a esta Medida Provisória.\n ',
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
                                                    id: 'art95',
                                                    rotulo: 'Art. 95.',
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
                                                          id: 'art95_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos VIII e IX à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2006;11356',
                                                                    content: ['Lei nº 11.356, de 2006'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CCIII e CCIV a esta Medida Provisória.\n ',
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
                                                    id: 'art96',
                                                    rotulo: 'Art. 96.',
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
                                                          id: 'art96_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Os Anexos CLIX, CLX, CLXII e CLXIII à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2009;11907',
                                                                    content: ['Lei nº 11.907, de 2009'],
                                                                  },
                                                                },
                                                                ', passam a vigorar, respectivamente, na forma dos Anexos CCV, CCVI, CCVII e CCVIII a esta Medida Provisória.\n ',
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
                                                    id: 'art97',
                                                    rotulo: 'Art. 97.',
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
                                                          id: 'art97_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    O Anexo XX à ',
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
                                                                    href: 'urn:lex:br:federal:lei:2016-07-29;13328',
                                                                    content: ['Lei nº 13.328, de 29 de julho de 2016'],
                                                                  },
                                                                },
                                                                ' passa a vigorar com a alteração constante do Anexo CCIX a esta Medida Provisória.\n ',
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
                                                    id: 'art98',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Servidores e empregados públicos sem tabela remuneratória'],
                                                    },
                                                    rotulo: 'Art. 98.',
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
                                                          id: 'art98_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Fica majorada em nove por cento a remuneração dos servidores ocupantes de cargo efetivo e dos empregados públicos permanentes no âmbito da administração direta, autárquica e fundacional do Poder Executivo federal não contemplados pelas alterações constantes nesta Medida Provisória e que não possuem remuneração baseada em tabela remuneratória de lei vigente. O aumento de que trata o caput será deduzido das majorações remuneratórias ocorridas em 2023 por força de outras normas, de disposições contratuais ou de decisões judiciais. Parágrafo único.\n ',
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
                                                    id: 'art99',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Aposentados e pensionistas do Poder Executivo federal'],
                                                    },
                                                    rotulo: 'Art. 99.',
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
                                                          id: 'art99_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Aplica-se o disposto nesta Medida Provisória aos aposentados e pensionistas no âmbito da administração pública federal direta, autárquica e fundacional do Poder Executivo federal que tenham como critério de reajuste a paridade, nos termos do disposto na Emenda à ',
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
                                                                    href: 'urn:lex:br:federal:constituicao:1988-10-05;1988',
                                                                    content: ['Constituição'],
                                                                  },
                                                                },
                                                                ' nº 41, de 19 de dezembro de 2003, na Emenda à ',
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
                                                                    href: 'urn:lex:br:federal:constituicao:1988-10-05;1988',
                                                                    content: ['Constituição'],
                                                                  },
                                                                },
                                                                ' nº 47, de 5 de julho de 2005, e na Emenda à ',
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
                                                                    href: 'urn:lex:br:federal:constituicao:1988-10-05;1988',
                                                                    content: ['Constituição'],
                                                                  },
                                                                },
                                                                ' nº 103, de 12 de novembro de 2019.\n ',
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
                                                    id: 'art100',
                                                    tituloDispositivo: {
                                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                      content: ['Vigência'],
                                                    },
                                                    rotulo: 'Art. 100.',
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
                                                          id: 'art100_cpt',
                                                          p: [
                                                            {
                                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                              content: [
                                                                '\n    Esta Medida Provisória entra em vigor na data de sua publicação e produz efeitos financeiros a partir de 1º de maio de 2023.\n ',
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
          ],
        },
      },
    },
  },
};
