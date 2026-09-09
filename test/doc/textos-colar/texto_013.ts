/*

    I - teste A:
      a) teste B;
      b) teste C.
    II - teste D:
      a) teste E;
      b) teste F.
    III - teste G:
      a) teste H;
      b) teste I.
    IV - teste J:
      a) teste K;
      b) teste L.
    V - teste M:
      a) teste N;
      b) teste O.
    VI - teste P:
      a) teste Q;
      b) teste R.

*/
export const TEXTO_013 = {
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
                localPart: 'Inciso',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Inciso',
                string: '{http://www.lexml.gov.br/1.0}Inciso',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'inc1',
                rotulo: 'I –',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    teste A:\n\n  '],
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
                      id: 'inc1_ali1',
                      rotulo: 'a)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste B;\n\n  '],
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
                      id: 'inc1_ali2',
                      rotulo: 'b)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste C.\n\n  '],
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
                id: 'inc2',
                rotulo: 'II –',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    teste D:\n\n  '],
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
                      id: 'inc2_ali1',
                      rotulo: 'a)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste E;\n\n  '],
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
                      id: 'inc2_ali2',
                      rotulo: 'b)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste F.\n\n  '],
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
                id: 'inc3',
                rotulo: 'III –',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    teste G:\n\n  '],
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
                      id: 'inc3_ali1',
                      rotulo: 'a)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste H;\n\n  '],
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
                      id: 'inc3_ali2',
                      rotulo: 'b)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste I.\n\n  '],
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
                id: 'inc4',
                rotulo: 'IV –',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    teste J:\n\n  '],
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
                      id: 'inc4_ali1',
                      rotulo: 'a)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste K;\n\n  '],
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
                      id: 'inc4_ali2',
                      rotulo: 'b)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste L.\n\n  '],
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
                id: 'inc5',
                rotulo: 'V –',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    teste M:\n\n  '],
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
                      id: 'inc5_ali1',
                      rotulo: 'a)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste N;\n\n  '],
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
                      id: 'inc5_ali2',
                      rotulo: 'b)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste O.\n\n  '],
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
                id: 'inc6',
                rotulo: 'VI –',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    teste P:\n\n  '],
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
                      id: 'inc6_ali1',
                      rotulo: 'a)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste Q;\n\n  '],
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
                      id: 'inc6_ali2',
                      rotulo: 'b)',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    teste R.\n\n  '],
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
