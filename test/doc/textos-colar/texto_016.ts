/*
Art. 1º .....
  Parágrafo único. .....
    I – .....

    I-1 - teste A:
      a) teste B:
        1. teste C;
        2. teste D;
      b) teste E;
      c) teste F;
    I-2 - teste G;

    II – .....
    .....
*/
export const TEXTO_016 = {
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
                          content: ['\n    .....&#160; Parágrafo único. .....&#160; &#160; I – .....\n\n  '],
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
                localPart: 'p',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}p',
                string: '{http://www.lexml.gov.br/1.0}p',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: [
                  '&#160; &#160; I-1 - teste A:&#160; &#160; &#160; a) teste B:&#160; &#160; &#160; &#160; 1. teste C;&#160; &#160; &#160; &#160; 2. teste D;&#160; &#160; &#160; b) teste E;&#160; &#160; &#160; c) teste F;&#160; &#160; I-2 - teste G;\n',
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'p',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}p',
                string: '{http://www.lexml.gov.br/1.0}p',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['&#160; &#160; II – .....&#160; &#160; .....\n'],
              },
            },
          ],
        },
      },
    },
  },
};
