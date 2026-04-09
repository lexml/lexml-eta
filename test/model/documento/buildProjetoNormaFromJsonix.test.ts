import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { NORMA_DEFAULT } from '../../doc/parser/normaDefault';
import { PROJETO_DEFAULT } from '../../doc/parser/projetoDefault';
import { NORMA_COM_PREAMBULO_HTML } from '../../assets/teste_preambulo_build_projetoNorma';

let documento: ProjetoNorma;

describe('Parser de norma default', () => {
  before(function () {
    documento = buildProjetoNormaFromJsonix(NORMA_DEFAULT);
  });
  it('Deveria apresentar um documento do tipo norma', () => {
    expect(documento?.classificacao).equals(ClassificacaoDocumento.NORMA);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.tipo?.urn).equals(undefined);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('');
  });
  it('Deveria apresentar ementa vazia', () => {
    expect(documento?.ementa?.texto).equals('');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('');
  });
});

describe('Parser de projeto default', () => {
  before(function () {
    documento = buildProjetoNormaFromJsonix(PROJETO_DEFAULT);
  });
  it('Deveria apresentar um documento classificado como projeto', () => {
    expect(documento?.classificacao).equals(ClassificacaoDocumento.PROJETO);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.tipo?.urn).equals(undefined);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('');
  });
  it('Deveria apresentar ementa vazia', () => {
    expect(documento?.ementa?.texto).equals('');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('');
  });
});

describe('Parser de norma com preâmbulo contendo HTML', () => {
  let documentoHtml: ProjetoNorma;

  before(function () {
    documentoHtml = buildProjetoNormaFromJsonix(NORMA_COM_PREAMBULO_HTML);
  });

  it('Deveria preservar tag <b> no preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('<b>');
    expect(documentoHtml?.preambulo).to.include('</b>');
  });

  it('Deveria preservar tag <i> no preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('<i>');
    expect(documentoHtml?.preambulo).to.include('</i>');
  });

  it('Deveria conter o texto formatado corretamente no preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('<b>no uso da atribuição</b>');
    expect(documentoHtml?.preambulo).to.include('<i>adopta a seguinte Medida Provisória</i>');
  });

  it('Deveria conter todo o conteúdo do preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('O PRESIDENTE DA REPÚBLICA,');
    expect(documentoHtml?.preambulo).to.include('que lhe confere o art. 62 da Constituição,');
    expect(documentoHtml?.preambulo).to.include(', com força de lei:');
  });
});

// ---------------------------------------------------------------------------
// Testes de desserialização de Remissao (Etapa 2 — PLANO_REMISSAO_SAVE_LOAD)
// ---------------------------------------------------------------------------

const montarDocumentoComRemissao = (contentArray: any[]): any => ({
  name: { localPart: 'LexML' },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.LexML',
    metadado: { identificacao: { urn: '' } },
    projetoNorma: {
      norma: {
        parteInicial: {
          epigrafe: { content: [''] },
          ementa: { content: [''] },
          preambulo: { p: [] },
        },
        articulacao: {
          lXhier: [
            {
              name: { localPart: 'Artigo' },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'art1',
                rotulo: 'Art. 1º',
                lXcontainersOmissis: [
                  {
                    name: { localPart: 'Caput' },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                      id: 'art1_cpt',
                      p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: contentArray }],
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
});

describe('Desserialização de elemento Remissao', () => {
  it('deve converter Remissao em link com class lexml-remissao-interna', () => {
    const doc = montarDocumentoComRemissao([
      'Conforme o ',
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art5_cpt', content: ['art. 5'] },
      },
      ' desta lei.',
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('class="lexml-remissao-interna"');
  });

  it('deve usar o lexmlId como data-lexml-ref', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art5_cpt', content: ['art. 5'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('data-lexml-ref="art5_cpt"');
  });

  it('deve usar o lexmlId como href temporário', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art10_par1', content: ['§ 1º do art. 10'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('href="art10_par1"');
  });

  it('deve preservar o conteúdo textual do link', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art5_cpt', content: ['art. 5'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('>art. 5<');
  });

  it('deve incluir target="_self"', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art3_cpt', content: ['art. 3'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('target="_self"');
  });

  it('não deve afetar elemento span convencional', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'span' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'https://externo.gov.br', content: ['link externo'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('href="https://externo.gov.br"');
    expect(texto).to.not.include('lexml-remissao-interna');
    expect(texto).to.not.include('data-lexml-ref');
  });

  it('deve preservar texto ao redor da remissão', () => {
    const doc = montarDocumentoComRemissao([
      'Conforme o ',
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art5_cpt', content: ['art. 5'] },
      },
      ' desta lei.',
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('Conforme o ');
    expect(texto).to.include(' desta lei.');
  });
});
