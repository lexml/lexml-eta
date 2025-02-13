export const PLP_197_2023 = {
  name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'LexML', prefix: '', key: '{http://www.lexml.gov.br/1.0}LexML', string: '{http://www.lexml.gov.br/1.0}LexML' },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.LexML',
    metadado: {
      TYPE_NAME: 'br_gov_lexml__1.Metadado',
      identificacao: { TYPE_NAME: 'br_gov_lexml__1.Identificacao', urn: 'urn:lex:br:senado.federal:projeto.lei.complementar;plp:2023;00197' },
    },
    projetoNorma: {
      TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
      norma: {
        TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
        parteInicial: {
          TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
          epigrafe: { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'epigrafe', content: ['PROJETO DE LEI COMPLEMENTAR Nº 00197 de 2023 '] },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              'Dispõe sobre a promoção conjunta, envolvendo a União, os Estados, o Distrito Federal e os Municípios, de ações de acolhimento de refugiados em âmbito nacional, em conformidade com o disposto no ',
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
                  href: 'urn:lex:br:federal:constituicao:1988-10-05;1988!art23_par1u',
                  content: ['parágrafo único do art. 23 da Constituição Federal'],
                },
              },
              '. \n',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    O CONGRESSO NACIONAL decreta: \n  '] }],
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
                            '\n    A União, os Estados, o Distrito Federal e os Municípios promoverão ações conjuntas de acolhimento de refugiados, tendo em vista o equilíbrio do desenvolvimento e do bem-estar em âmbito nacional, em conformidade com o disposto no ',
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
                                href: 'urn:lex:br:federal:constituicao:1988-10-05;1988!art23_par1u',
                                content: ['parágrafo único do art. 23 da Constituição Federal'],
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
                      id: 'art1_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    Para os efeitos desta Lei Complementar, considera-se refugiado todo cidadão de outra nacionalidade que ingresse no território brasileiro por qualquer meio, de toda e qualquer forma, incluindo de forma clandestina e abrupta, fugindo de condições adversas de qualquer natureza em seu país de origem. \n\n  ',
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
                            '\n    A União, com a colaboração dos Estados, do Distrito Federal e dos Municípios, manterá cadastro atualizado dos refugiados em território nacional, divulgando semestralmente relatório detalhado, incluindo, dentre outras informações, em quais municípios onde os refugiados encontram-se alojados. \n\n  ',
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
                      id: 'art1_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    Os refugiados terão livre acesso aos serviços públicos ofertados nas localidades onde encontram-se alojados, além das ações que lhes forem exclusivamente promovidas. \n\n  ',
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
                            '\n    Entre as ações a serem promovidas com base nesta Lei Complementar, destacam-se ações de acolhimento, integração, aculturamento social, ações de aprendizagem da língua nacional e ações voltadas para orientação profissional visando a geração de renda e participação no mercado de trabalho, além de outras ações que possam ser consideradas urgentes e necessárias. \n\n  ',
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
                            '\n    A União entregará aos demais entes subnacionais, independente da celebração de convênio ou qualquer instrumento congênere, recursos adicionais calculados com base no valor ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'i',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}i',
                                string: '{http://www.lexml.gov.br/1.0}i',
                              },
                              value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['per capita'] },
                            },
                            ' do Fundo de Participação dos Estados ou dos Municípios, respectivo, multiplicado pelo número de refugiados alojados no território do ente, a título de suporte financeiro visando a promoção das ações de acolhimento previstas nesta Lei Complementar, bem como na expansão dos serviços públicos já regularmente ofertados, para que possa melhor atender a população local e os refugiados. \n\n  ',
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
                            '\n    Compete ao Tribunal de Contas da União o cálculo semestral dos valores a serem transferidos pela União com base no relatório de que trata o § 2º do art. 1º desta Lei. \n\n  ',
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
                            '\n    O disposto nesta Lei Complementar passa a integrar as diretrizes, objetivos, prioridades e metas do plano plurianual em vigor e da lei de diretrizes orçamentárias em vigor, nos termos do ',
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
                                href: 'urn:lex:br:federal:lei.complementar:2000-05-04;101!art16_par1_inc2',
                                content: ['inciso II do § 1º do art. 16 da Lei Complementar nº 101, de 4 de maio de 2000'],
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
                      id: 'art4_par1u',
                      rotulo: 'Parágrafo único.',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    O plano plurianual e a lei de diretrizes orçamentárias, elaborados posteriormente à data de publicação desta Lei Complementar, deverão incluir referência a esta Lei Complementar expressamente em suas diretrizes, objetivos, prioridades e metas. \n\n  ',
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
                                  'Na ausência de inclusão, pelo Poder Executivo, das despesas decorrentes desta Lei Complementar no projeto de lei orçamentária cuja apresentação se der após a publicação desta Lei Complementar, o Congresso Nacional solicitará ao Poder Executivo envio de mensagem de que trata o ',
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
                                      href: 'urn:lex:br:federal:constituicao:1988-10-05;1988!art166_par5',
                                      content: ['§ 5º do art. 166 da Constituição Federal'],
                                    },
                                  },
                                  ', solicitando a correspondente inclusão, com atendimento da legislação orçamentária e financeira.',
                                ],
                              },
                            },
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
                      id: 'art5_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    Na ausência da mensagem de que trata o ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'i',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}i',
                                string: '{http://www.lexml.gov.br/1.0}i',
                              },
                              value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['caput'] },
                            },
                            ', o Congresso Nacional, em atendimento ao disposto no inciso II do art. 5º e nos art. 16 e 17 da ',
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
                                href: 'urn:lex:br:federal:lei.complementar:2000-05-04;101',
                                content: ['Lei Complementar nº 101, de 4 de maio de 2000'],
                              },
                            },
                            ', e demais normas orçamentárias, financeiras e de responsabilidade fiscal, incluirá, no projeto da lei orçamentária, o montante do aumento de despesas decorrente desta Lei Complementar na forma do § 3º, II, do ',
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
                                href: 'urn:lex:br:federal:constituicao:1988-10-05;1988!art166',
                                content: ['art. 166 da Constituição Federal'],
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
                      id: 'art5_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    A inclusão de que trata o § 1º compete à Comissão Mista de Planos, Orçamentos Públicos e Fiscalização e seu desatendimento implica em suspensão da votação do projeto da lei orçamentária. \n\n  ',
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
                            '\n    Esta Lei Complementar entra em vigor na data de sua publicação com a produção de efeitos financeiros a partir do primeiro dia do ano subsequente ao de inclusão de seus gastos na lei orçamentária decorrente do art. 5º. \n\n  ',
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
  },
};
