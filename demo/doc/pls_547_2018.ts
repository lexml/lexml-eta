export const PLS_547_2018 = {
  name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'LexML', prefix: '', key: '{http://www.lexml.gov.br/1.0}LexML', string: '{http://www.lexml.gov.br/1.0}LexML' },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.LexML',
    metadado: { TYPE_NAME: 'br_gov_lexml__1.Metadado', identificacao: { TYPE_NAME: 'br_gov_lexml__1.Identificacao', urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2018;00547' } },
    projetoNorma: {
      TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
      norma: {
        TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
        parteInicial: {
          TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
          epigrafe: { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'epigrafe', content: ['PROJETO DE LEI Nº 00547 de 2018'] },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              'Dispõe sobre o fim dos chamados “carros oficiais”, com a proibição da utilização de veículos oficiais por autoridades públicas, exceto o Presidente da República, na condição de Chefe de Estado Brasileiro.',
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    O CONGRESSO NACIONAL decreta:\n  '] }, { TYPE_NAME: 'br_gov_lexml__1.GenInline' }],
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
                            '\n    Fica proibida a utilização de veículos oficiais por autoridades públicas, com exceção do Presidente da República, na condição de Chefe de Estado Brasileiro.\n  ',
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
                            '\n    Esta Lei aplica-se aos veículos oficiais de representação à disposição de autoridades públicas, não se aplicando aos veículos oficiais utilizados na prestação direta de serviços públicos específicos à população.\n  ',
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
                      p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    Esta Lei entra em vigor na data de sua publicação.\n  '] }],
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
