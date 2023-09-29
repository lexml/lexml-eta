/*
§1º Teste 1.
§2º Teste 2.
*/
export const TEXTO_008 = {
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
                localPart: 'Paragrafo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                string: '{http://www.lexml.gov.br/1.0}Paragrafo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'par1',
                rotulo: '§ 1º',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    Teste 1.\n\n  '],
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
                id: 'par2',
                rotulo: '§ 2º',
                p: [
                  {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    content: ['\n    Teste 2.\n\n  '],
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
