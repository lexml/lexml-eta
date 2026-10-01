export const SBT_2_PEC_18_2025 = {
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
        urn: 'urn:lex:br:federal:lei:2023;999@data.evento;leitura;2023-05-29t14.39',
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
            content: ['LEI Nº 999, DE 2023 '],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              'Altera os art. 5º, 15, 22, 23, 24, 40, 49, 84, 103-B, 109, 130-A, 144 e 228, e acrescenta os arts. 91-A, 144-A e 144-B à ',
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
                  content: ['Constituição Federal'],
                },
              },
              ', e dá outras providências. \n',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['\n    O Congresso Nacional decreta: \n  '],
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
                                href: 'urn:lex:br:federal:constituicao:1988-10-05;1988',
                                content: ['Constituição Federal'],
                              },
                            },
                            ' passa a vigorar com as seguintes alterações: \n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:constituicao:1988-10-05;1988',
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
                              href: 'art5',
                              id: 'art1_cpt_alt1_art5',
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
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                    href: 'art5_cpt',
                                    id: 'art1_cpt_alt1_art5_cpt',
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
                                          id: 'art1_cpt_alt1_art5_cpt_omi1',
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
                                          href: 'art5_cpt_inc46-1',
                                          id: 'art1_cpt_alt1_art5_cpt_inc46-1',
                                          rotulo: 'XLVI-A –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    a lei definirá as atividades ilícitas próprias de organizações criminosas de alta periculosidade ou lesividade tais como o comando ou facção criminosos, a organização paramilitar e a milícia privada, e disciplinará sanções mais gravosas e regime legal especial aplicáveis aos seus integrantes e líderes, proporcionais às posições hierárquicas que ocupem, bem como a autores de crimes cometidos mediante violência ou grave ameaça, no que couber, devendo dispor sobre: \n\n  ',
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
                                                href: 'art5_cpt_inc46-1_ali1',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali1',
                                                rotulo: 'a)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    a obrigatoriedade de prisão provisória ou definitiva em estabelecimento penal estadual ou federal de segurança máxima ou de natureza especial, se necessário em regime disciplinar diferenciado; \n\n  ',
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
                                                href: 'art5_cpt_inc46-1_ali2',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali2',
                                                rotulo: 'b)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    a restrição ou vedação de concessão de progressão de regime, de liberdade provisória, com ou sem fiança, e da realização de acordo de não persecução penal, quando cabível, em razão da ocorrência de reiteração delitiva e do perigo de manutenção de sua liberdade; \n\n  ',
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
                                                href: 'art5_cpt_inc46-1_ali3',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali3',
                                                rotulo: 'c)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    a restrição ou vedação de conversão da pena privativa de liberdade em penas restritivas de direito, da concessão de suspensão condicional da pena e de livramento condicional, quando for o caso, da remição da pena e da concessão de saída temporária; \n\n  ',
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
                                                href: 'art5_cpt_inc46-1_ali4',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali4',
                                                rotulo: 'd)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    a imposição de medidas cautelares de natureza patrimonial; \n\n  '],
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
                                                href: 'art5_cpt_inc46-1_ali5',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali5',
                                                rotulo: 'e)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    a expropriação de todo e qualquer bem, direito ou valor de conteúdo econômico envolvido com as atividades criminosas, sem qualquer indenização ao proprietário, assegurado o direito de terceiro de boa-fé, e sua destinação a fundo especial com finalidade específica; \n\n  ',
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
                                                href: 'art5_cpt_inc46-1_ali6',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali6',
                                                rotulo: 'f)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    a responsabilização civil, penal e administrativa de pessoa jurídica envolvida, sem prejuízo da responsabilidade individual de seus dirigentes; \n\n  ',
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
                                                href: 'art5_cpt_inc46-1_ali7',
                                                id: 'art1_cpt_alt1_art5_cpt_inc46-1_ali7',
                                                rotulo: 'g)',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    os meios, as ações e os programas para a proteção e compensação ao noticiante de atos ilícitos e aos seus familiares; \n\n  ',
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
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                          id: 'art1_cpt_alt1_art5_cpt_omi2',
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
                                          href: 'art5_cpt_inc80',
                                          id: 'art1_cpt_alt1_art5_cpt_inc80',
                                          rotulo: 'LXXX –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    é assegurada à vítima de infração penal a tutela judicial efetiva, com atenção especial às mulheres; \n\n  '],
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
                                          href: 'art5_cpt_inc81',
                                          id: 'art1_cpt_alt1_art5_cpt_inc81',
                                          rotulo: 'LXXXI –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    a pena será imposta e executada com o rigor necessário para a prestação de justiça à vítima, à reparação do dano causado e à proteção da sociedade, enquanto prevenção de novo ilícito; \n\n  ',
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
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art5_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art15',
                              id: 'art1_cpt_alt1_art15',
                              abreAspas: 's',
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
                                    href: 'art15_cpt',
                                    id: 'art1_cpt_alt1_art15_cpt',
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
                                          id: 'art1_cpt_alt1_art15_cpt_omi1',
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
                                          href: 'art15_cpt_inc3-1',
                                          id: 'art1_cpt_alt1_art15_cpt_inc3-1',
                                          rotulo: 'III-A –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    prisão provisória, durante o recolhimento. \n\n  '],
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
                                    id: 'art1_cpt_alt1_art15_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art22',
                              id: 'art1_cpt_alt1_art22',
                              abreAspas: 's',
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
                                    href: 'art22_cpt',
                                    id: 'art1_cpt_alt1_art22_cpt',
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
                                          id: 'art1_cpt_alt1_art22_cpt_omi1',
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
                                          href: 'art22_cpt_inc31',
                                          id: 'art1_cpt_alt1_art22_cpt_inc31',
                                          rotulo: 'XXXI –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    normas gerais da atividade de inteligência. \n\n  '],
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
                                    id: 'art1_cpt_alt1_art22_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art23',
                              id: 'art1_cpt_alt1_art23',
                              abreAspas: 's',
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
                                    href: 'art23_cpt',
                                    id: 'art1_cpt_alt1_art23_cpt',
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
                                          id: 'art1_cpt_alt1_art23_cpt_omi1',
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
                                          href: 'art23_cpt_inc13',
                                          id: 'art1_cpt_alt1_art23_cpt_inc13',
                                          rotulo: 'XIII –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    prover os meios necessários à manutenção da segurança pública e defesa social; \n\n  '],
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
                                          href: 'art23_cpt_inc14',
                                          id: 'art1_cpt_alt1_art23_cpt_inc14',
                                          rotulo: 'XIV –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    instituir os respectivos conselhos de segurança pública e defesa social, órgãos colegiados de caráter permanente e consultivo; \n\n  ',
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
                                          href: 'art23_cpt_inc15',
                                          id: 'art1_cpt_alt1_art23_cpt_inc15',
                                          rotulo: 'XV –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    estabelecer as respectivas políticas e planos de segurança pública e defesa social, ouvidos os conselhos de segurança pública. \n\n  ',
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
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art23_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art24',
                              id: 'art1_cpt_alt1_art24',
                              abreAspas: 's',
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
                                    href: 'art24_cpt',
                                    id: 'art1_cpt_alt1_art24_cpt',
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
                                          id: 'art1_cpt_alt1_art24_cpt_omi1',
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
                                          href: 'art24_cpt_inc17',
                                          id: 'art1_cpt_alt1_art24_cpt_inc17',
                                          rotulo: 'XVII –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    segurança pública e defesa social; \n\n  '],
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
                                          href: 'art24_cpt_inc18',
                                          id: 'art1_cpt_alt1_art24_cpt_inc18',
                                          rotulo: 'XVIII –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    forças-tarefa intergovernamentais e interinstitucionais; \n\n  '],
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
                                          href: 'art24_cpt_inc19',
                                          id: 'art1_cpt_alt1_art24_cpt_inc19',
                                          rotulo: 'XIX –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    organização, competências, integração com os demais órgãos de segurança pública, parâmetros básicos para formação e treinamento continuado, garantias, direitos e deveres das polícias e das guardas municipais; \n\n  ',
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
                                          href: 'art24_cpt_inc20',
                                          id: 'art1_cpt_alt1_art24_cpt_inc20',
                                          rotulo: 'XX –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    organização, garantias, direitos e deveres dos órgãos do sistema socioeducativo. \n\n  '],
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
                                    id: 'art1_cpt_alt1_art24_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art40',
                              id: 'art1_cpt_alt1_art40',
                              abreAspas: 's',
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
                                    href: 'art40_cpt',
                                    id: 'art1_cpt_alt1_art40_cpt',
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
                                    id: 'art1_cpt_alt1_art40_omi1',
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
                                    href: 'art40_par7',
                                    id: 'art1_cpt_alt1_art40_par7',
                                    rotulo: '§ 7º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Observado o disposto no § 2º do art. 201, o benefício de pensão por morte será concedido nos termos de lei do respectivo ente federativo, a qual poderá tratar de forma mais favorável a hipótese de morte dos servidores de que trata o § 4º-B, decorrente do exercício da função ou em razão dela. \n\n  ',
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
                                    id: 'art1_cpt_alt1_art40_omi2',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art49',
                              id: 'art1_cpt_alt1_art49',
                              abreAspas: 's',
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
                                    href: 'art49_cpt',
                                    id: 'art1_cpt_alt1_art49_cpt',
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
                                          id: 'art1_cpt_alt1_art49_cpt_omi1',
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
                                          href: 'art49_cpt_inc5',
                                          id: 'art1_cpt_alt1_art49_cpt_inc5',
                                          rotulo: 'V –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    sustar os atos normativos do Poder Executivo, do Conselho Nacional de Justiça e do Conselho Nacional do Ministério Público que exorbitem do poder regulamentar ou dos limites da delegação legislativa; \n\n  ',
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
                                          id: 'art1_cpt_alt1_art49_cpt_omi2',
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
                                          href: 'art49_cpt_inc10-1',
                                          id: 'art1_cpt_alt1_art49_cpt_inc10-1',
                                          rotulo: 'X-A –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    fiscalizar e controlar a atividade de inteligência; \n\n  '],
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
                                    id: 'art1_cpt_alt1_art49_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art84',
                              id: 'art1_cpt_alt1_art84',
                              abreAspas: 's',
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
                                    href: 'art84_cpt',
                                    id: 'art1_cpt_alt1_art84_cpt',
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
                                          id: 'art1_cpt_alt1_art84_cpt_omi1',
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
                                          href: 'art84_cpt_inc29',
                                          id: 'art1_cpt_alt1_art84_cpt_inc29',
                                          rotulo: 'XXIX –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    fixar a Política Nacional de Inteligência. \n\n  '],
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
                                    id: 'art1_cpt_alt1_art84_omi1',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art103-2',
                              id: 'art1_cpt_alt1_art103-2',
                              abreAspas: 's',
                              rotulo: 'Art. 103-B.',
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
                                    href: 'art103-2_cpt',
                                    id: 'art1_cpt_alt1_art103-2_cpt',
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
                                    id: 'art1_cpt_alt1_art103-2_omi1',
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
                                    href: 'art103-2_par4',
                                    id: 'art1_cpt_alt1_art103-2_par4',
                                    textoOmitido: 's',
                                    rotulo: '§ 4º',
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
                                          href: 'art103-2_par4_inc1',
                                          id: 'art1_cpt_alt1_art103-2_par4_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    zelar pela autonomia do Poder Judiciário e pelo cumprimento do Estatuto da Magistratura, podendo expedir atos regulamentares, no âmbito de sua competência, ou recomendar providências, vedada a adoção de quaisquer medidas que atentem contra as competências do Congresso Nacional; \n\n  ',
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
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art103-2_omi2',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              href: 'art130-1',
                              id: 'art1_cpt_alt1_art130-1',
                              abreAspas: 's',
                              rotulo: 'Art. 130-A.',
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
                                    href: 'art130-1_cpt',
                                    id: 'art1_cpt_alt1_art130-1_cpt',
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
                                    id: 'art1_cpt_alt1_art130-1_omi1',
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
                                    href: 'art130-1_par2',
                                    id: 'art1_cpt_alt1_art130-1_par2',
                                    textoOmitido: 's',
                                    rotulo: '§ 2º',
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
                                          href: 'art130-1_par2_inc1',
                                          id: 'art1_cpt_alt1_art130-1_par2_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    zelar pela autonomia funcional e administrativa do Ministério Público, podendo expedir atos regulamentares, no âmbito de sua competência, ou recomendar providências, vedada a adoção de quaisquer medidas que atentem contra as competências do Congresso Nacional; \n\n  ',
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
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art130-1_omi2',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                              id: 'art1_cpt_alt1_sec1',
                              abreAspas: 's',
                              rotulo: 'Seção I',
                              nomeAgrupador: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    DAS DISPOSIÇÕES GERAIS \n\n  '],
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
                                    href: 'art144',
                                    id: 'art1_cpt_alt1_art144',
                                    rotulo: 'Art. 144.',
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
                                          href: 'art144_cpt',
                                          id: 'art1_cpt_alt1_art144_cpt',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A segurança pública, dever do Estado, direito e responsabilidade de todos, é exercida em regime de cooperação federativa, para a preservação da ordem pública, da incolumidade das pessoas e do patrimônio, por meio da atuação integrada e descentralizada dos seguintes órgãos: \n\n  ',
                                              ],
                                            },
                                          ],
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
                                                id: 'art1_cpt_alt1_art144_cpt_omi1',
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
                                                href: 'art144_cpt_inc7',
                                                id: 'art1_cpt_alt1_art144_cpt_inc7',
                                                rotulo: 'VII –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    polícias municipais comunitárias. \n\n  '],
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
                                          id: 'art1_cpt_alt1_art144_omi1',
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
                                          href: 'art144_par1',
                                          id: 'art1_cpt_alt1_art144_par1',
                                          rotulo: '§ 1º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A polícia federal, instituída por lei como órgão permanente, organizado e mantido pela União e estruturado em carreira, destina-se a: \n\n  ',
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
                                                href: 'art144_par1_inc1',
                                                id: 'art1_cpt_alt1_art144_par1_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    apurar infrações penais: \n\n  '],
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
                                                      href: 'art144_par1_inc1_ali1',
                                                      id: 'art1_cpt_alt1_art144_par1_inc1_ali1',
                                                      rotulo: 'a)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: [
                                                            '\n    contra a ordem política e social ou em detrimento de bens, serviços e interesses da União, excetuados aqueles sob administração militar, inclusive o meio ambiente, ou de suas entidades autárquicas e empresas públicas; \n\n  ',
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
                                                      href: 'art144_par1_inc1_ali2',
                                                      id: 'art1_cpt_alt1_art144_par1_inc1_ali2',
                                                      rotulo: 'b)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: [
                                                            '\n    cuja prática tenha repercussão interestadual ou internacional e exija repressão uniforme, como aquelas cometidas por organizações criminosas e milícias privadas; \n\n  ',
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
                                          localPart: 'Omissis',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Omissis',
                                          string: '{http://www.lexml.gov.br/1.0}Omissis',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                          id: 'art1_cpt_alt1_art144_omi2',
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
                                          href: 'art144_par2',
                                          id: 'art1_cpt_alt1_art144_par2',
                                          rotulo: '§ 2º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A polícia rodoviária federal, órgão permanente, organizado e mantido pela União e estruturado em carreira, destina-se, na forma da lei, a exercer o policiamento ostensivo das rodovias, ferrovias e hidrovias federais, ressalvadas as competências da autoridade marítima. \n\n  ',
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
                                          href: 'art144_par2-1',
                                          id: 'art1_cpt_alt1_art144_par2-1',
                                          rotulo: '§ 2º-A.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    O emprego da polícia rodoviária federal poderá ser autorizado ou determinado pela União, nos termos da lei, para: \n\n  ',
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
                                                href: 'art144_par2-1_inc1',
                                                id: 'art1_cpt_alt1_art144_par2-1_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    exercer o policiamento ostensivo na proteção de bens, serviços e instalações federais e daqueles de interesse da União; \n\n  ',
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
                                                href: 'art144_par2-1_inc2',
                                                id: 'art1_cpt_alt1_art144_par2-1_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    prestar auxílio aos órgãos de segurança pública estaduais ou distritais, quando requerido por seus Governadores; \n\n  ',
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
                                                href: 'art144_par2-1_inc3',
                                                id: 'art1_cpt_alt1_art144_par2-1_inc3',
                                                rotulo: 'III –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    atuar em cooperação com os demais órgãos integrantes do sistema único de segurança pública em estado de calamidade pública ou em caso de desastres. \n\n  ',
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
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                          id: 'art1_cpt_alt1_art144_omi3',
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
                                          href: 'art144_par5-1',
                                          id: 'art1_cpt_alt1_art144_par5-1',
                                          rotulo: '§ 5º-A.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    Às polícias penais federal, estaduais e distrital, órgãos de natureza civil, estruturados em carreira, vinculados ao órgão administrador do sistema penal da unidade federativa a que pertencem, cabe, a custódia, a ordem e disciplina, e a segurança dos estabelecimentos penais, na forma da lei. \n\n  ',
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
                                          id: 'art1_cpt_alt1_art144_omi4',
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
                                          href: 'art144_par8-1',
                                          id: 'art1_cpt_alt1_art144_par8-1',
                                          rotulo: '§ 8º-A.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    Os Municípios poderão constituir polícias municipais comunitárias, de natureza civil, organizadas em carreira, para a realização de ações de policiamento ostensivo e comunitário, obedecido ao seguinte: \n\n  ',
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
                                                href: 'art144_par8-1_inc1',
                                                id: 'art1_cpt_alt1_art144_par8-1_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    será realizada acreditação periódica e de padronização pelo Conselho Estadual de Segurança Pública e Defesa Social, conforme lei complementar federal; \n\n  ',
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
                                                href: 'art144_par8-1_inc2',
                                                id: 'art1_cpt_alt1_art144_par8-1_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    para a criação da polícia municipal comunitária, são elegíveis os Municípios que: \n\n  '],
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
                                                      href: 'art144_par8-1_inc2_ali1',
                                                      id: 'art1_cpt_alt1_art144_par8-1_inc2_ali1',
                                                      rotulo: 'a)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: ['\n    tenham população superior a cem mil habitantes; \n\n  '],
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
                                                      href: 'art144_par8-1_inc2_ali2',
                                                      id: 'art1_cpt_alt1_art144_par8-1_inc2_ali2',
                                                      rotulo: 'b)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: ['\n    demonstrem capacidade financeira compatível com a manutenção da corporação; \n\n  '],
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
                                                      href: 'art144_par8-1_inc2_ali3',
                                                      id: 'art1_cpt_alt1_art144_par8-1_inc2_ali3',
                                                      rotulo: 'c)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: [
                                                            '\n    demonstrem o cumprimento integral da legislação a que se refere o § 8º deste artigo, na hipótese de já existir guarda municipal; \n\n  ',
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
                                                      href: 'art144_par8-1_inc2_ali4',
                                                      id: 'art1_cpt_alt1_art144_par8-1_inc2_ali4',
                                                      rotulo: 'd)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: ['\n    realizem a formação de acordo com os parâmetros nacionais básicos; \n\n  '],
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
                                                      href: 'art144_par8-1_inc2_ali5',
                                                      id: 'art1_cpt_alt1_art144_par8-1_inc2_ali5',
                                                      rotulo: 'e)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: [
                                                            '\n    já tenham realizado a pactuação, definida no inciso I deste parágrafo, que assegure a integração das ações de policiamento ostensivo e comunitário; \n\n  ',
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
                                                href: 'art144_par8-1_inc3',
                                                id: 'art1_cpt_alt1_art144_par8-1_inc3',
                                                rotulo: 'III –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    é vedada a coexistência, no âmbito do mesmo Município, de polícia municipal, guarda municipal e de qualquer outro órgão municipal de segurança pública com atribuições semelhantes ou sobrepostas. \n\n  ',
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
                                          href: 'art144_par8-2',
                                          id: 'art1_cpt_alt1_art144_par8-2',
                                          rotulo: '§ 8º-B.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    As guardas e as polícias municipais estão sujeitas ao controle externo pelo Ministério Público. \n\n  '],
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
                                          id: 'art1_cpt_alt1_art144_omi5',
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
                                          href: 'art144_par11',
                                          id: 'art1_cpt_alt1_art144_par11',
                                          rotulo: '§ 11.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A União instituirá o Fundo Nacional de Segurança Pública e o Fundo Penitenciário Nacional, em conformidade com as respectivas políticas de segurança pública e defesa social, os quais serão distribuídos entre os Estados e o Distrito Federal, sendo ao menos 50% (cinquenta por cento) a título de transferência obrigatória, independentemente de convênio ou instrumento congênere, na forma da lei. \n\n  ',
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
                                          href: 'art144_par12',
                                          id: 'art1_cpt_alt1_art144_par12',
                                          rotulo: '§ 12.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A apuração da responsabilidade funcional dos profissionais dos órgãos de segurança pública e de defesa social caberá às respectivas corregedorias, dotadas de autonomia para o exercício de suas competências, sem prejuízo do poder disciplinar hierárquico em cada órgão. \n\n  ',
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
                                          href: 'art144_par13',
                                          id: 'art1_cpt_alt1_art144_par13',
                                          rotulo: '§ 13.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A União, os Estados, o Distrito Federal e os Municípios que constituírem guardas ou polícias municipais instituirão ouvidorias dotadas de autonomia no exercício de suas competências responsáveis pela promoção da transparência e do controle social, na forma da lei. \n\n  ',
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
                                          href: 'art144_par14',
                                          id: 'art1_cpt_alt1_art144_par14',
                                          rotulo: '§ 14.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['\n    São competências comuns, na forma da lei, a todos os órgãos policiais de segurança pública: \n\n  '],
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
                                                href: 'art144_par14_inc1',
                                                id: 'art1_cpt_alt1_art144_par14_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    encaminhar, por meio de sistema eletrônico integrado, o registro das infrações penais de menor potencial ofensivo diretamente ao Poder Judiciário, sem prejuízo da prisão em flagrante ou da apuração pela polícia judiciária competente; \n\n  ',
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
                                                href: 'art144_par14_inc2',
                                                id: 'art1_cpt_alt1_art144_par14_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    conduzir à autoridade de polícia judiciária competente a pessoa presa em flagrante delito ou em razão de cumprimento de mandado de prisão; \n\n  ',
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
                                                href: 'art144_par14_inc3',
                                                id: 'art1_cpt_alt1_art144_par14_inc3',
                                                fechaAspas: 's',
                                                notaAlteracao: 'NR',
                                                rotulo: 'III –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    conduzir à autoridade a pessoa em descumprimento de medida cautelar de natureza penal, protetiva, disciplinar, socioeducativa ou em cometimento de falta grave.\n\n  ',
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
                              localPart: 'Secao',
                              prefix: '',
                              key: '{http://www.lexml.gov.br/1.0}Secao',
                              string: '{http://www.lexml.gov.br/1.0}Secao',
                            },
                            value: {
                              TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                              id: 'art1_cpt_alt1_sec2',
                              abreAspas: 's',
                              rotulo: 'Seção II',
                              nomeAgrupador: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    DO SISTEMA ÚNICO DE SEGURANÇA PÚBLICA \n\n  '],
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
                                    href: 'art144-1',
                                    id: 'art1_cpt_alt1_art144-1',
                                    rotulo: 'Art. 144-A.',
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
                                          href: 'art144-1_cpt',
                                          id: 'art1_cpt_alt1_art144-1_cpt',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    Os órgãos de segurança pública articular-se-ão em regime de cooperação federativa, por meio do Sistema Único de Segurança Pública, destinado a assegurar a eficiência da prevenção, da persecução e da execução penal, sendo regido pelas seguintes diretrizes: \n\n  ',
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
                                                href: 'art144-1_cpt_inc1',
                                                id: 'art1_cpt_alt1_art144-1_cpt_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: [
                                                      '\n    atuação em força-tarefa intergovernamental ou interinstitucional, admitida a participação do Ministério Público, na forma da lei; \n\n  ',
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
                                                href: 'art144-1_cpt_inc2',
                                                id: 'art1_cpt_alt1_art144-1_cpt_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    interoperabilidade de sistemas; \n\n  '],
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
                                                href: 'art144-1_cpt_inc3',
                                                id: 'art1_cpt_alt1_art144-1_cpt_inc3',
                                                rotulo: 'III –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    compartilhamento de informações. \n\n  '],
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
                                          href: 'art144-1_par1',
                                          id: 'art1_cpt_alt1_art144-1_par1',
                                          rotulo: '§ 1º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A lei prevista no § 7º do art. 144 disciplinará a organização e o funcionamento do Sistema Único de Segurança Pública, estabelecendo, no mínimo: \n\n  ',
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
                                                href: 'art144-1_par1_inc1',
                                                id: 'art1_cpt_alt1_art144-1_par1_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    as diretrizes de planejamento pactuado e atuação descentralizada; \n\n  '],
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
                                                href: 'art144-1_par1_inc2',
                                                id: 'art1_cpt_alt1_art144-1_par1_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    o registro simplificado de infrações de menor potencial ofensivo; \n\n  '],
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
                                                href: 'art144-1_par1_inc3',
                                                id: 'art1_cpt_alt1_art144-1_par1_inc3',
                                                rotulo: 'III –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    as regras para aquisição de material de natureza militar; \n\n  '],
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
                                                href: 'art144-1_par1_inc4',
                                                id: 'art1_cpt_alt1_art144-1_par1_inc4',
                                                rotulo: 'IV –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    o regime jurídico especial para: \n\n  '],
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
                                                      href: 'art144-1_par1_inc4_ali1',
                                                      id: 'art1_cpt_alt1_art144-1_par1_inc4_ali1',
                                                      rotulo: 'a)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: [
                                                            '\n    o tratamento e compartilhamento de dados, inclusive os sigilosos, assegurada a finalidade pública e a interoperabilidade; \n\n  ',
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
                                                      href: 'art144-1_par1_inc4_ali2',
                                                      id: 'art1_cpt_alt1_art144-1_par1_inc4_ali2',
                                                      rotulo: 'b)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: ['\n    a regulação, contratação e desenvolvimento de tecnologias avançadas; \n\n  '],
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
                                                      href: 'art144-1_par1_inc4_ali3',
                                                      id: 'art1_cpt_alt1_art144-1_par1_inc4_ali3',
                                                      rotulo: 'c)',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: [
                                                            '\n    a proteção a agentes públicos e colaboradores envolvidos no enfrentamento a organizações criminosas de alta periculosidade ou lesividade, extensivo a seus familiares. \n\n  ',
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
                                          localPart: 'Paragrafo',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                          string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                          href: 'art144-1_par2',
                                          id: 'art1_cpt_alt1_art144-1_par2',
                                          rotulo: '§ 2º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    A investidura em cargos de segurança pública e inteligência observará requisitos especiais, tais como a pesquisa social e o exame psicológico, nos termos da lei. \n\n  ',
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
                                          href: 'art144-1_par3',
                                          id: 'art1_cpt_alt1_art144-1_par3',
                                          fechaAspas: 's',
                                          notaAlteracao: 'NR',
                                          rotulo: '§ 3º',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    É dever de todos cooperar, na forma da lei, com procedimentos preventivos e de fiscalização da segurança pública.\n\n  ',
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
                              id: 'art1_cpt_alt1_sec3',
                              abreAspas: 's',
                              rotulo: 'Seção III',
                              nomeAgrupador: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n    DO SISTEMA DE POLÍTICAS PENAIS \n\n  '],
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
                                    href: 'art144-2',
                                    id: 'art1_cpt_alt1_art144-2',
                                    rotulo: 'Art. 144-B.',
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
                                          href: 'art144-2_cpt',
                                          id: 'art1_cpt_alt1_art144-2_cpt',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    O Sistema de Políticas Penais é o conjunto de órgãos, instituições e políticas públicas destinadas à custódia, ordem e disciplina, correição, reeducação e à integração social das pessoas apenadas, cabendo ao Poder Executivo de cada ente federativo, por meio da respectiva polícia penal: \n\n  ',
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
                                                href: 'art144-2_cpt_inc1',
                                                id: 'art1_cpt_alt1_art144-2_cpt_inc1',
                                                rotulo: 'I –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    alocar e transferir presos por critérios técnicos e legais; \n\n  '],
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
                                                href: 'art144-2_cpt_inc2',
                                                id: 'art1_cpt_alt1_art144-2_cpt_inc2',
                                                rotulo: 'II –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    exercer as funções de polícia administrativa no âmbito do Sistema de Execução Penal; \n\n  '],
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
                                                href: 'art144-2_cpt_inc3',
                                                id: 'art1_cpt_alt1_art144-2_cpt_inc3',
                                                rotulo: 'III –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    definir o regime disciplinar interno e a aplicar sanções administrativas; \n\n  '],
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
                                                href: 'art144-2_cpt_inc4',
                                                id: 'art1_cpt_alt1_art144-2_cpt_inc4',
                                                rotulo: 'IV –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    regulamentar visitas e atendimento jurídico, religioso e escolar; \n\n  '],
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
                                                href: 'art144-2_cpt_inc5',
                                                id: 'art1_cpt_alt1_art144-2_cpt_inc5',
                                                fechaAspas: 's',
                                                notaAlteracao: 'NR',
                                                rotulo: 'V –',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['\n    adotar tecnologias de segurança.\n\n  '],
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
                                    href: 'art228',
                                    id: 'art1_cpt_alt1_art228',
                                    abreAspas: 's',
                                    rotulo: 'Art. 228.',
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
                                          href: 'art228_cpt',
                                          id: 'art1_cpt_alt1_art228_cpt',
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
                                          href: 'art228_par1u',
                                          id: 'art1_cpt_alt1_art228_par1u',
                                          fechaAspas: 's',
                                          notaAlteracao: 'NR',
                                          rotulo: 'Parágrafo único.',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    Nos crimes cometidos com violência ou grave ameaça à pessoa, são penalmente inimputáveis os menores de dezesseis anos, assegurado o cumprimento da pena em estabelecimento distinto dos maiores de dezoito anos e dos menores inimputáveis, na forma da lei.\n\n  ',
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
                            '\n    O quadro de servidores das polícias municipais será preenchido, exclusivamente, por meio de concurso público e pela transformação dos cargos das respectivas carreiras das guardas municipais que já tiverem atendido ao previsto no § 8º-B, do art. 144. \n\n  ',
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
                            '\n    Os Municípios que mantiverem guarda municipal deverão, no prazo máximo de 5 (cinco) anos, contados da data da promulgação desta Emenda Constitucional, adequar integralmente sua guarda municipal aos requisitos previstos na ',
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
                                href: 'urn:lex:br:federal:lei:2014-08-08;13022',
                                content: ['Lei nº 13.022, de 8 de agosto de 2014'],
                              },
                            },
                            '. \n\n  ',
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
                            '\n    O não atendimento integral dos requisitos legais ao término do prazo previsto no caput ensejará a extinção da guarda municipal, nos termos da lei municipal. \n\n  ',
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
                            '\n    Os profissionais de segurança pública ferroviária relacionados através da Portaria nº 76 de 13 de janeiro de 2012 do Ministério da Justiça, publicada no D.O.U de 17/01/2012 e os demais que comprovarem a existência de vínculo de mesma natureza, até esta data, serão transferidos para quadros da polícia rodoviária federal, na forma da lei, assegurado o direito de opção pelo cargo ou função atual. \n\n  ',
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
                            '\n    O ',
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
                                href: 'urn:lex:br:federal:ato.disposicoes.constitucionais.transitorias:1988-10-05;1988',
                                content: ['Ato das Disposições Constitucionais Transitórias'],
                              },
                            },
                            ' (ADCT) passa a vigorar com as seguintes alterações: \n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:ato.disposicoes.constitucionais.transitorias:1988-10-05;1988',
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
                              href: 'art76',
                              id: 'art5_cpt_alt1_art76',
                              abreAspas: 's',
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
                                    href: 'art76_cpt',
                                    id: 'art5_cpt_alt1_art76_cpt',
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
                                    id: 'art5_cpt_alt1_art76_omi1',
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
                                    href: 'art76_par6',
                                    id: 'art5_cpt_alt1_art76_par6',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 6º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    A desvinculação de que trata o caput deste artigo não se aplica às receitas destinadas ao fundo criado pelo ',
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
                                              href: 'urn:lex:br:federal:lei:2010-12-22;12351!art47',
                                              content: ['art. 47 da Lei nº 12.351, de 22 de dezembro de 2010'],
                                            },
                                          },
                                          ', aos recursos a que se refere o ',
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
                                              href: 'urn:lex:br:federal:lei:2013-09-09;12858!art2',
                                              content: ['art. 2º da Lei nº 12.858, de 9 de setembro de 2013'],
                                            },
                                          },
                                          ', às receitas do fundo de que trata o ',
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
                                              href: 'urn:lex:br:federal:lei:2018-12-12;13756!art2',
                                              content: ['art. 2º da Lei nº 13.756, de 12 de dezembro de 2018'],
                                            },
                                          },
                                          ', às receitas do fundo de que trata a ',
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
                                              href: 'urn:lex:br:federal:lei.complementar:1994-01-07;79',
                                              content: ['Lei Complementar nº 79, de 07 de janeiro de 1994'],
                                            },
                                          },
                                          ' e à taxa a que se refere o ',
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
                                              href: 'urn:lex:br:federal:lei:2018-12-12;13756!art32',
                                              content: ['art. 32 da Lei nº 13.756, de 12 de dezembro de 2018'],
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
                              href: 'art139',
                              id: 'art5_cpt_alt1_art139',
                              abreAspas: 's',
                              rotulo: 'Art. 139.',
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
                                    href: 'art139_cpt',
                                    id: 'art5_cpt_alt1_art139_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    São vedados o bloqueio, a limitação de empenho e movimentação financeira e a alocação orçamentária em reservas de contingência dos recursos provenientes: \n\n  ',
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
                                          href: 'art139_cpt_inc1',
                                          id: 'art5_cpt_alt1_art139_cpt_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    da taxa de que trata o ',
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
                                                    href: 'urn:lex:br:federal:lei:2018-12-12;13756!art32',
                                                    content: ['art. 32 da Lei nº 13.756, de 12 de dezembro de 2018'],
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
                                          href: 'art139_cpt_inc2',
                                          id: 'art5_cpt_alt1_art139_cpt_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    das fontes vinculadas ao Fundo Nacional de Segurança Pública, definido na ',
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
                                                    href: 'urn:lex:br:federal:lei:2018-12-12;13756',
                                                    content: ['Lei nº 13.756, de 12 de dezembro de 2018'],
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
                                          href: 'art139_cpt_inc3',
                                          id: 'art5_cpt_alt1_art139_cpt_inc3',
                                          rotulo: 'III –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    das fontes vinculadas ao Fundo Penitenciário Nacional, instituído pela ',
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
                                                    href: 'urn:lex:br:federal:lei.complementar:1994-01-07;79',
                                                    content: ['Lei Complementar nº 79, de 07 de janeiro de 1994'],
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
                                          href: 'art139_cpt_inc4',
                                          id: 'art5_cpt_alt1_art139_cpt_inc4',
                                          fechaAspas: 's',
                                          notaAlteracao: 'NR',
                                          rotulo: 'IV –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    das fontes vinculadas ao Fundo para Aparelhamento e Operacionalização das Atividades-fim da Polícia Federal - FUNAPOL, a que se refere a ',
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
                                                    href: 'urn:lex:br:federal:lei.complementar:1997-02-18;89',
                                                    content: ['Lei Complementar nº 89, de 18 de fevereiro de 1997'],
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
                              href: 'art140',
                              id: 'art5_cpt_alt1_art140',
                              abreAspas: 's',
                              rotulo: 'Art. 140.',
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
                                    href: 'art140_cpt',
                                    id: 'art5_cpt_alt1_art140_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Até que seja publicada lei ulterior, 15% (quinze por cento) das receitas de que tratam os ',
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
                                              href: 'urn:lex:br:federal:lei:2010-12-22;12351!art49_cpt_inc1',
                                              content: ['incisos I'],
                                            },
                                          },
                                          ' a ',
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
                                              href: 'urn:lex:br:federal:lei:2010-12-22;12351!art49_cpt_inc3',
                                              content: ['III do art. 49 da Lei nº 12.351, de 22 de dezembro de 2010'],
                                            },
                                          },
                                          ' serão destinadas ao Fundo Nacional de Segurança Pública, definido na ',
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
                                              href: 'urn:lex:br:federal:lei:2018-12-12;13756',
                                              content: ['Lei nº 13.756, de 12 de dezembro de 2018'],
                                            },
                                          },
                                          ', e do Fundo Penitenciário Nacional, instituído pela ',
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
                                              href: 'urn:lex:br:federal:lei.complementar:1994-01-07;79',
                                              content: ['Lei Complementar nº 79, de 07 de janeiro de 1994'],
                                            },
                                          },
                                          '. \n\n  ',
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
                                    href: 'art140_par1',
                                    id: 'art5_cpt_alt1_art140_par1',
                                    rotulo: '§ 1º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    Regulamento do Poder Executivo determinará a repartição de recursos entre os fundos referidos no caput. \n\n  '],
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
                                    href: 'art140_par2',
                                    id: 'art5_cpt_alt1_art140_par2',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 2º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O disposto no caput entrará em vigor à proporção de um terço ao ano, a partir do exercício de 2026, atingindo a integralidade a partir do exercício de 2028.\n\n  ',
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
                              href: 'art141',
                              id: 'art5_cpt_alt1_art141',
                              abreAspas: 's',
                              rotulo: 'Art. 141.',
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
                                    href: 'art141_cpt',
                                    id: 'art5_cpt_alt1_art141_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Até que seja publicada lei ulterior, do produto da arrecadação da loteria de apostas de quota fixa em meio físico ou virtual, excetuadas as demais modalidades lotéricas previstas no ',
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
                                              href: 'urn:lex:br:federal:lei:2018-12-12;13756!art14_par1',
                                              content: ['§ 1º do art. 14 da Lei nº 13.756, de 12 de dezembro de 2018'],
                                            },
                                          },
                                          ', após dedução das importâncias de prêmios e imposto de renda sobre a premiação: \n\n  ',
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
                                          href: 'art141_cpt_inc1',
                                          id: 'art5_cpt_alt1_art141_cpt_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    82% (oitenta e dois por cento) serão destinados à cobertura de despesas de custeio e manutenção do agente operador da loteria de apostas de quota fixa e demais jogos de apostas; \n\n  ',
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
                                          href: 'art141_cpt_inc2',
                                          id: 'art5_cpt_alt1_art141_cpt_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    6% (seis por cento) serão destinados ao Fundo Nacional de Segurança Pública, definido na ',
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
                                                    href: 'urn:lex:br:federal:lei:2018-12-12;13756',
                                                    content: ['Lei nº 13.756, de 12 de dezembro de 2018'],
                                                  },
                                                },
                                                ', e ao Fundo Penitenciário Nacional, instituído pela ',
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
                                                    href: 'urn:lex:br:federal:lei.complementar:1994-01-07;79',
                                                    content: ['Lei Complementar nº 79, de 07 de janeiro de 1994'],
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
                                          href: 'art141_cpt_inc3',
                                          id: 'art5_cpt_alt1_art141_cpt_inc3',
                                          rotulo: 'III –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    12% (doze por cento) terá a destinação prevista nos incisos do ',
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
                                                    href: 'urn:lex:br:federal:lei:2018-12-12;13756!art30_par1-1',
                                                    content: ['§ 1º-A do art. 30 da Lei 13.756, de 12 de dezembro de 2018'],
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
                                    href: 'art141_par1',
                                    id: 'art5_cpt_alt1_art141_par1',
                                    rotulo: '§ 1º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Regulamento do Poder Executivo determinará a repartição de recursos entre os fundos a que se refere o inciso II do caput. \n\n  ',
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
                                    href: 'art141_par2',
                                    id: 'art5_cpt_alt1_art141_par2',
                                    rotulo: '§ 2º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Até o exercício financeiro de 2028, o disposto nos incisos I e II do caput irá vigorar com os seguintes percentuais: \n\n  ',
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
                                          href: 'art141_par2_inc1',
                                          id: 'art5_cpt_alt1_art141_par2_inc1',
                                          rotulo: 'I –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    o disposto no inciso I irá vigorar com 86% (oitenta e seis por cento) no exercício de 2026 e 84% (oitenta e quatro por cento) no exercício de 2027; e \n\n  ',
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
                                          href: 'art141_par2_inc2',
                                          id: 'art5_cpt_alt1_art141_par2_inc2',
                                          rotulo: 'II –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    o disposto no inciso II irá vigorar com 2% (dois por cento) no exercício de 2026 e 4% (quatro por cento) no exercício de 2027. \n\n  ',
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
                                    href: 'art141_par3',
                                    id: 'art5_cpt_alt1_art141_par3',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 3º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Os recursos provenientes da Taxa de Fiscalização a que se refere o ',
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
                                              href: 'urn:lex:br:federal:lei:2018-12-12;13756!art32',
                                              content: ['art. 32 da Lei nº 13.756, de 12 de dezembro de 2018'],
                                            },
                                          },
                                          ', serão utilizados na identificação e combate a plataformas ilegais de loteria de apostas de quota fixa, inclusive por meio de convênio com outros órgãos do Poder Executivo.\n\n  ',
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
                              href: 'art142',
                              id: 'art5_cpt_alt1_art142',
                              abreAspas: 's',
                              rotulo: 'Art. 142.',
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
                                    href: 'art142_cpt',
                                    id: 'art5_cpt_alt1_art142_cpt',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O parágrafo único do art. 228, para entrar em vigor, dependerá de aprovação mediante referendo, a ser realizado na eleição de outubro de 2028. \n\n  ',
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
                                    href: 'art142_par1u',
                                    id: 'art5_cpt_alt1_art142_par1u',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: 'Parágrafo único.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Aprovado o referendo, o disposto no parágrafo único entrará em vigor na data de publicação de seu resultado pelo Tribunal Superior Eleitoral.\n\n  ',
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
                          content: [
                            '\n    Ficam revogados o ',
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
                                href: 'urn:lex:br:federal:constituicao:1988-10-05;1988!art144_cpt_inc3',
                                content: ['inciso III do caput'],
                              },
                            },
                            ' e o ',
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
                                href: 'urn:lex:br:federal:constituicao:1988-10-05;1988!art144_par3',
                                content: ['§ 3º do art. 144 da Constituição'],
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
                          content: ['\n    Esta emenda constitucional entra em vigor na data de sua publicação. \n\n  '],
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
