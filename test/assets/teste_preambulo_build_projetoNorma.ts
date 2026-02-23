// Documento de teste com preâmbulo contendo tags HTML (<b> e <i>)
export const NORMA_COM_PREAMBULO_HTML = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2025-01-15;1234',
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
            content: ['MEDIDA PROVISÓRIA Nº 1.234, DE 15 DE JANEIRO DE 2025'],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: ['Ementa de teste'],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: [
                  'O PRESIDENTE DA REPÚBLICA, ',
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
                      content: ['no uso da atribuição'],
                    },
                  },
                  ' que lhe confere o art. 62 da Constituição, ',
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'i',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}i',
                      string: '{http://www.lexml.gov.br/1.0}i',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                      content: ['adopta a seguinte Medida Provisória'],
                    },
                  },
                  ', com força de lei:',
                ],
              },
            ],
          },
        },
        articulacao: {
          TYPE_NAME: 'br_gov_lexml__1.Articulacao',
          lXhier: [],
        },
      },
    },
  },
};
