export const PL_4687_2023 = {
  name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'LexML', prefix: '', key: '{http://www.lexml.gov.br/1.0}LexML', string: '{http://www.lexml.gov.br/1.0}LexML' },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.LexML',
    metadado: { TYPE_NAME: 'br_gov_lexml__1.Metadado', identificacao: { TYPE_NAME: 'br_gov_lexml__1.Identificacao', urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2023;04687' } },
    projetoNorma: {
      TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
      norma: {
        TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
        parteInicial: {
          TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
          epigrafe: { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'epigrafe', content: ['PROJETO DE LEI Nº 04687 de 2023 '] },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              {
                name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'i', prefix: '', key: '{http://www.lexml.gov.br/1.0}i', string: '{http://www.lexml.gov.br/1.0}i' },
                value: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
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
                      value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'urn:lex:br:federal:lei:2021-04-01;14133', content: ['Lei nº 14.133, de 1º de abril de 2021'] },
                    },
                    ', para permitir que os Estados, os Municípios e o Distrito Federal possam prever a obrigatoriedade de programas de integridade em editais de licitação segundo sua realidade e necessidades locais.',
                  ],
                },
              },
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
                                href: 'urn:lex:br:federal:lei:2021-04-01;14133!art25',
                                content: ['art. 25 da Lei nº 14.133, de 1º de abril de 2021'],
                              },
                            },
                            ', passa a vigorar acrescido do seguinte dispositivo: \n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:2021-04-01;14133',
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
                              href: 'art25',
                              id: 'art1_cpt_alt1_art25',
                              abreAspas: 's',
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
                                  value: { TYPE_NAME: 'br_gov_lexml__1.DispositivoType', href: 'art25_cpt', id: 'art1_cpt_alt1_art25_cpt', textoOmitido: 's' },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: { TYPE_NAME: 'br_gov_lexml__1.Omissis', id: 'art1_cpt_alt1_art25_omi1' },
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
                                    href: 'art25_par10',
                                    id: 'art1_cpt_alt1_art25_par10',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: '§ 10.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    A lei estadual, distrital ou municipal poderá prever a obrigatoriedade de implantação de programa de integridade pelo vencedor para contratos de valor estimado inferior ao previsto no inciso XXII do art. 6º a fim de atender suas necessidades locais.\n\n  ',
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
