export const MPV_GENERICOS = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2024;999@data.evento;leitura;2024-07-30t14.52',
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
                  href: 'urn:lex:br:federal:lei:1986-12-19;7560',
                  content: ['Lei nº 7.560, de 19 de dezembro de 1986'],
                },
              },
              ', para alterar disposições acerca do Fundo Nacional Antidrogas  Ementa.  Nonononono',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['\n O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:\n '],
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
                localPart: 'Parte',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Parte',
                string: '{http://www.lexml.gov.br/1.0}Parte',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'prt1',
                rotulo: 'PARTE I',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Texto da Parte 1'],
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
                      id: 'prt1_liv1',
                      rotulo: 'LIVRO I',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['    Liv 1'],
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
                            id: 'prt1_liv1_tit1',
                            rotulo: 'TÍTULO I',
                            nomeAgrupador: {
                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                              content: ['    Tit 1'],
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
                                  id: 'prt1_liv1_tit1_cap1',
                                  rotulo: 'CAPÍTULO I',
                                  nomeAgrupador: {
                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                    content: ['    Cap 1'],
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
                                                  content: ['    Nononono.'],
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
                                        id: 'prt1_liv1_tit1_cap1_sec1',
                                        rotulo: 'Seção I',
                                        nomeAgrupador: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['    Sec 1'],
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
                                                        content: ['Nononono'],
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
                                        id: 'prt1_liv1_tit1_cap1_sec2',
                                        rotulo: 'Seção II',
                                        nomeAgrupador: {
                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                          content: ['    Sec 2'],
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
                                                        content: ['Nononono.'],
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
