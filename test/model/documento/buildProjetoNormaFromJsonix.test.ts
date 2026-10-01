import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { metadadoProprietarioLexEdit } from '../../doc/documentoArticulado';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { NORMA_DEFAULT } from '../../doc/parser/normaDefault';
import { PROJETO_DEFAULT } from '../../doc/parser/projetoDefault';
import { ALTERA_NORMA_TRAVA_EDITOR } from '../../assets/altera_norma_trava_editor';
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

  it('deve emitir data-ri-id quando o nó Remissao tem id (remissão inválida persistida)', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art9', id: '_ri1758000000000', content: ['art. 9º'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.include('data-ri-id="_ri1758000000000"');
  });

  it('não deve emitir data-ri-id quando o nó Remissao não tem id (remissão válida)', () => {
    const doc = montarDocumentoComRemissao([
      {
        name: { localPart: 'Remissao' },
        value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'art5_cpt', content: ['art. 5'] },
      },
    ]);

    const projeto = buildProjetoNormaFromJsonix(doc);
    const texto = projeto.articulacao!.filhos![0].texto;

    expect(texto).to.not.include('data-ri-id');
  });
});

// ---------------------------------------------------------------------------
// Leitura de MetadadoProprietario/lexedit:Metadado (especificações 00, 10, 13)
// ---------------------------------------------------------------------------

// Formato provisório (anterior ao jsonix-lexml 2.0.0): chave `lexedit` direto em MetadadoProprietario.
const metadadoProprietarioProvisorio = (lexedit: Record<string, unknown>): any => ({
  TYPE_NAME: 'br_gov_lexml__1.MetadadoProprietario',
  fonte: 'http://www.lexml.gov.br/lexedit/1.0',
  lexedit,
});

const documentoComMetadado = (...metadadoProprietario: any[]): any => {
  const doc = montarDocumentoComRemissao([]);
  doc.value.metadado.metadadoProprietario = metadadoProprietario;
  return doc;
};

describe('lerIdsRemissoesInvalidas', () => {
  it('retorna lista vazia quando não há MetadadoProprietario', () => {
    const doc = montarDocumentoComRemissao([]);
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal([]);
  });

  it('lê os ids separados por espaço do formato novo', () => {
    const doc = documentoComMetadado(
      metadadoProprietarioLexEdit({
        remissoesInternasInvalidas: { TYPE_NAME: 'br_gov_lexml_lexedit__1.RemissoesInternasInvalidas', refIdsRemissoesInternas: '_ri1 _ri2' },
      })
    );
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_ri1', '_ri2']);
  });

  it('descarta espaços extras e ids repetidos', () => {
    const doc = documentoComMetadado(metadadoProprietarioLexEdit({ remissoesInternasInvalidas: { refIdsRemissoesInternas: '  _ri1   _ri2 _ri1\n' } }));
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_ri1', '_ri2']);
  });

  it('lê os ids em lista do formato provisório', () => {
    const doc = documentoComMetadado(metadadoProprietarioProvisorio({ remissoesInternasInvalidas: { refIdsRemissoesInternas: ['_ri1', '_ri2'] } }));
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_ri1', '_ri2']);
  });

  it('grupo suportado convive com grupo do LexEdit ainda não implementado, sem lançar erro', () => {
    const doc = documentoComMetadado(
      metadadoProprietarioLexEdit({
        remissoesInternasInvalidas: { refIdsRemissoesInternas: '_ri1' },
        autoria: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Autoria', tipo: 'Parlamentar' },
      })
    );

    expect(() => lerIdsRemissoesInvalidas(doc)).to.not.throw();
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_ri1']);
  });
});

describe('lerMetadadoLexEdit — formatos do ponto de extensão', () => {
  const OPCOES = { imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 };
  const DADOS = { local: 'Sala da comissão', data: '2026-04-24', opcoesImpressao: OPCOES };

  it('lê todos os grupos do formato novo', () => {
    const doc = documentoComMetadado(
      metadadoProprietarioLexEdit({
        local: 'Sala da comissão',
        data: '2026-04-24',
        opcoesImpressao: { TYPE_NAME: 'br_gov_lexml_lexedit__1.OpcoesImpressao', ...OPCOES },
        remissoesInternasInvalidas: { TYPE_NAME: 'br_gov_lexml_lexedit__1.RemissoesInternasInvalidas', refIdsRemissoesInternas: '_ri1' },
        pendencias: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Pendencias', pendencia: ['Corrigir remissões internas inválidas.'] },
      })
    );
    expect(lerMetadadoLexEdit(doc)).to.deep.equal(DADOS);
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_ri1']);
  });

  it('lê todos os grupos do formato provisório', () => {
    const doc = documentoComMetadado(
      metadadoProprietarioProvisorio({
        local: 'Sala da comissão',
        data: '2026-04-24',
        opcoesImpressao: OPCOES,
        remissoesInternasInvalidas: { refIdsRemissoesInternas: ['_ri1'] },
        pendencias: ['Corrigir remissões internas inválidas.'],
      })
    );
    expect(lerMetadadoLexEdit(doc)).to.deep.equal(DADOS);
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_ri1']);
  });

  it('com os dois formatos no mesmo arquivo, vale o novo', () => {
    const novo = metadadoProprietarioLexEdit({ local: 'Sala da comissão', remissoesInternasInvalidas: { refIdsRemissoesInternas: '_riNovo' } });
    const provisorio = { local: 'Sala das sessões', data: '2026-01-01', remissoesInternasInvalidas: { refIdsRemissoesInternas: ['_riAntigo'] } };

    // Nos dois arranjos: chave `lexedit` no mesmo MetadadoProprietario e em outro, antes do novo.
    for (const doc of [documentoComMetadado({ ...novo, lexedit: provisorio }), documentoComMetadado(metadadoProprietarioProvisorio(provisorio), novo)]) {
      expect(lerMetadadoLexEdit(doc)).to.deep.equal({ local: 'Sala da comissão' });
      expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal(['_riNovo']);
    }
  });

  it('lê o formato novo sem TYPE_NAME', () => {
    const doc = documentoComMetadado({
      fonte: 'http://www.lexml.gov.br/lexedit/1.0',
      any: [{ name: { namespaceURI: 'http://www.lexml.gov.br/lexedit/1.0', localPart: 'Metadado' }, value: { local: 'Sala das sessões', opcoesImpressao: OPCOES } }],
    });
    expect(lerMetadadoLexEdit(doc)).to.deep.equal({ local: 'Sala das sessões', opcoesImpressao: OPCOES });
  });

  it('ignora elemento de outro namespace em any', () => {
    const doc = documentoComMetadado({
      fonte: 'http://exemplo.gov.br/outro',
      any: [{ name: { namespaceURI: 'http://exemplo.gov.br/outro', localPart: 'Metadado' }, value: { local: 'Outro' } }],
    });
    expect(lerMetadadoLexEdit(doc)).to.deep.equal({});
  });
});

// ---------------------------------------------------------------------------
// Teste de carregamento de documento com alteracao (blocoAlteracao)
// Verifica se buildProjetoNormaFromJsonix processa corretamente
// documentos com estrutura de alteração sem travar (loop infinito)
// ---------------------------------------------------------------------------

describe('Parser de norma com alteracao (blocoAlteracao)', () => {
  let projeto: ProjetoNorma;

  before(function () {
    this.timeout(5000);
    projeto = buildProjetoNormaFromJsonix(ALTERA_NORMA_TRAVA_EDITOR.projetoNorma);
  });

  it('Deveria carregar o documento sem travar', () => {
    expect(projeto).to.not.be.undefined;
    expect(projeto.articulacao).to.not.be.undefined;
  });

  it('Deveria ter 3 artigos na articulacao', () => {
    expect(projeto.articulacao!.filhos.length).equals(3);
  });

  it('Deveria ter rotulos corretos nos artigos', () => {
    expect(projeto.articulacao!.filhos[0].rotulo).equals('Art. 1º');
    expect(projeto.articulacao!.filhos[1].rotulo).equals('Art. 2º');
    expect(projeto.articulacao!.filhos[2].rotulo).equals('Art. 3º');
  });

  it('Deveria ter alteracao no art3', () => {
    const art3 = projeto.articulacao!.filhos[2];
    expect(art3.hasAlteracao()).to.be.true;
  });

  it('Deveria ter Art. 5º dentro da alteracao do art3', () => {
    const art3 = projeto.articulacao!.filhos[2];
    const art5 = art3.alteracoes!.filhos[0];
    expect(art5.rotulo).equals('Art. 5º');
    expect(art5.isDispositivoAlteracao).to.be.true;
  });

  it('Deveria ter Inciso I dentro do caput do Art. 5º', () => {
    const art3 = projeto.articulacao!.filhos[2];
    const art5 = art3.alteracoes!.filhos[0];
    const caput = (art5 as Artigo).caput!;
    const inciso = caput.filhos[0];
    expect(inciso.rotulo).equals('I –');
  });
});
