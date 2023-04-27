// Texto para testes de colagem

export const TEXTO_004 = {
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
        urn: '',
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
            content: ['TEXTO PARSEADO'],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: ['Texto parseado'],
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
                                href: 'urn:lex:br:federal:lei:2020-04-14;13988',
                                content: ['Lei nº 13.988, de 14 de abril de 2020'],
                              },
                            },
                            ', passa a vigorar com as seguintes alterações:\n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:2020-04-14;13988',
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
                              href: 'art1',
                              id: 'art5_cpt_alt1_art1',
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
                                    id: 'art5_cpt_alt1_art1_cpt',
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
                                    id: 'art5_cpt_alt1_art1_omi1',
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
                                    href: 'art1_par5',
                                    id: 'art5_cpt_alt1_art1_par5',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 5º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    A transação de créditos de natureza tributária será realizada nos termos do ',
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
                                              href: 'urn:lex:br:federal:lei:1966-10-25;5172!art171',
                                              content: ['art. 171 da Lei nº 5.172, de 25 de outubro de 1966'],
                                            },
                                          },
                                          ' (Código Tributário Nacional), considerados para esse fim como litígio os débitos em contencioso ou em cobrança em âmbito administrativo ou judicial.\n\n  ',
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
                              href: 'art2',
                              id: 'art5_cpt_alt1_art2',
                              abreAspas: 's',
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
                                    href: 'art2_cpt',
                                    id: 'art5_cpt_alt1_art2_cpt',
                                    textoOmitido: 's',
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
                                          href: 'art2_cpt_inc1',
                                          id: 'art5_cpt_alt1_art2_cpt_inc1',
                                          fechaAspas: 's',
                                          notaAlteracao: 'NR',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    por proposta individual ou por adesão, na cobrança de créditos inscritos na dívida ativa da União, de suas autarquias e fundações públicas, na cobrança de créditos que seja competência da Procuradoria-Geral da União, ou em cobrança e contencioso administrativo fiscal;\n\n  ',
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
                              href: 'art10-1',
                              id: 'art5_cpt_alt1_art10-1',
                              abreAspas: 's',
                              rotulo: 'Art. 10-A.',
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
                                    href: 'art10-1_cpt',
                                    id: 'art5_cpt_alt1_art10-1_cpt',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    A transação na cobrança de créditos tributários e em contencioso administrativo fiscal poderá ser proposta pela Secretaria Especial da Receita Federal do Brasil, de forma individual ou por adesão, ou por iniciativa do devedor.\n\n  ',
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
    },
  },
};
