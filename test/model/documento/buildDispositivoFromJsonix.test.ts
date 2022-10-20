import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../src/model/dispositivo/dispositivo';
import { buildDispositivoFromJsonix } from '../../../src/model/lexml/documento/conversor/buildDispositivoFromJsonix';

let articulacao: Articulacao;

describe('Parser de dispositivos para colar', () => {
  const texto = {
    name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'LexML', prefix: '', key: '{http://www.lexml.gov.br/1.0}LexML', string: '{http://www.lexml.gov.br/1.0}LexML' },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.LexML',
      metadado: { TYPE_NAME: 'br_gov_lexml__1.Metadado', identificacao: { TYPE_NAME: 'br_gov_lexml__1.Identificacao', urn: '' } },
      projetoNorma: {
        TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
        norma: {
          TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
          parteInicial: {
            TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
            epigrafe: { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'epigrafe', content: ['TEXTO PARSEADO'] },
            ementa: { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'ementa', content: ['Texto parseado'] },
            preambulo: { TYPE_NAME: 'br_gov_lexml__1.TextoType', id: 'preambulo' },
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
                        p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n     São requisitos básicos para investidura em cargo público:        \n  '] }],
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
                              id: 'art5_cpt_inc1',
                              rotulo: 'I –',
                              p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    a nacionalidade brasileira;        \n  '] }],
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
                              id: 'art5_cpt_inc2',
                              rotulo: 'II –',
                              p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    o gozo dos direitos políticos;        \n  '] }],
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
                              id: 'art5_cpt_inc3',
                              rotulo: 'III –',
                              p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['\n    aptidão física e mental.\n  '] }],
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
    },
  };
  before(function () {
    articulacao = buildDispositivoFromJsonix(texto).articulacao!;
  });
  it('Deveria reconhecer o artigo', () => {
    expect(articulacao?.filhos.length).equals(1);
    expect(articulacao?.filhos[0].rotulo).equals('Art. 5º');
  });
  it('Deveria reconhecer os incisos filho de artigo', () => {
    expect(articulacao?.filhos[0].filhos.length).equals(3);
    expect(articulacao?.filhos[0].filhos[0].rotulo).equals('I –');
    expect(articulacao?.filhos[0].filhos[1].rotulo).equals('II –');
    expect(articulacao?.filhos[0].filhos[2].rotulo).equals('III –');
  });
});
