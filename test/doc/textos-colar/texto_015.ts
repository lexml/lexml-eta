/*
- Emenda que, em modo de revisão, adiciona alguns dispositivos e modifica outros.
- As intervenções são feitas em dispositivos de norma alterada.
- Possui a inclusão de omissis.

Art. 13. A Lei nº 11.482, de 31 de maio de 2007, passa a vigorar com as seguintes alterações:
  "Art. 1º ...
     ...
     IX – a partir do mês de abril do ano-calendário de 2015 e até o mês de abril do ano-calendário de 2023:
     ...
     X – a partir do mês de maio do ano-calendário de 2023:
   ...
   § 1º Novo parágrafo.
   ..." (NR)

Art. 14. A Lei nº 9.250, de 26 de dezembro de 1995, passa a vigorar com as seguintes alterações:
  "Art. 4º ...
   ...
   § 1º A dedução permitida teste pelo inciso V do caput aplica-se exclusivamente à base de cálculo relativa aos seguintes rendimentos, assegurada, nos demais casos, a dedução dos valores pagos a esse título, por ocasião da apuração da base de cálculo do imposto devido no ano-calendário, conforme disposto na alínea “e” do inciso II do caput do art. 8º:
     I – do trabalho com vínculo empregatício ou de administradores; e
     II – proventos de aposentados e pensionistas, quando a fonte pagadora for responsável pelo desconto e pelo respectivo pagamento das contribuições previdenciárias.
   § 1º-A. Outro novo parágrafo.
   § 1º-B. Mais um parágrafo.
   § 2º
   § 3º E mais um parágrafo" (NR)
*/

export const TEXTO_015 = {
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
                                    href: 'art1_par1',
                                    id: 'art13_cpt_alt1_art1_par1',
                                    rotulo: '§ 1º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    Novo parágrafo.\n\n  '],
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
                                    id: 'art13_cpt_alt1_art1_omi2',
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
                                          '\n    A dedução permitida teste pelo inciso V do caput aplica-se exclusivamente à base de cálculo relativa aos seguintes rendimentos, assegurada, nos demais casos, a dedução dos valores pagos a esse título, por ocasião da apuração da base de cálculo do imposto devido no ano-calendário, conforme disposto na alínea “e” do inciso II do caput do art. 8º:\n\n  ',
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
                                    href: 'art4_par1-1',
                                    id: 'art14_cpt_alt1_art4_par1-1',
                                    rotulo: '§ 1º-A.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    Outro novo parágrafo.\n\n  '],
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
                                    href: 'art4_par1-2',
                                    id: 'art14_cpt_alt1_art4_par1-2',
                                    rotulo: '§ 1º-B.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    Mais um parágrafo.\n\n  '],
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
                                    textoOmitido: 's',
                                    rotulo: '§ 2º',
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
                                    href: 'art4_par3',
                                    id: 'art14_cpt_alt1_art4_par3',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 3º',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: ['\n    E mais um parágrafo\n\n  '],
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
