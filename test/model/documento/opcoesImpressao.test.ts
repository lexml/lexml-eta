import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, lerDocumentoArticulado, serializarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { OpcoesImpressao } from '../../../src/model/proposicao/proposicao';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado, TYPE_NAME_OPCOES_IMPRESSAO } from '../../doc/documentoArticulado';

const FONTE_LEXEDIT = 'http://www.lexml.gov.br/lexedit/1.0';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const opcoesAlteradas = (): OpcoesImpressao => ({
  imprimirBrasao: false,
  textoCabecalho: 'Gabinete do Senador',
  reduzirEspacoEntreLinhas: true,
  tamanhoFonte: 16,
});

describe('Opções de impressão — salvar (especificação 02)', () => {
  it('grava os quatro atributos com os valores alterados', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { opcoesImpressao: opcoesAlteradas() });

    const metadadoProprietario = documento.value.metadado.metadadoProprietario!;
    expect(metadadoProprietario).to.have.length(1);
    expect(metadadoProprietario[0].fonte).to.equal(FONTE_LEXEDIT);
    expect(lexeditSalvo(documento).opcoesImpressao).to.deep.equal({ TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...opcoesAlteradas() });
  });

  it('grava os quatro atributos também quando são os valores padrão', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { opcoesImpressao: new OpcoesImpressao() });

    expect(lexeditSalvo(documento).opcoesImpressao).to.deep.equal({
      TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO,
      imprimirBrasao: true,
      textoCabecalho: '',
      reduzirEspacoEntreLinhas: false,
      tamanhoFonte: 14,
    });
  });

  it('documento criado sem dados do LexEdit e sem remissão inválida não inclui MetadadoProprietario', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn);

    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('opções de impressão e remissão inválida ficam no mesmo MetadadoProprietario', () => {
    const modelo = novoModelo();
    const caput = (modelo.articulacao.filhos[0] as Artigo).caput!;
    const textoRef = 'educação';
    const remissoes: Record<number, any[]> = {
      [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
    };

    const documento = criarDocumentoArticulado(modelo, modelo.urn, remissoes, undefined, { opcoesImpressao: opcoesAlteradas() });

    const metadadoProprietario = documento.value.metadado.metadadoProprietario!;
    expect(metadadoProprietario).to.have.length(1);
    const lexedit = lexeditSalvo(documento);
    expect(lexedit.opcoesImpressao).to.deep.equal({ TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...opcoesAlteradas() });
    expect(lexedit.remissoesInternasInvalidas.refIdsRemissoesInternas).to.equal(remissoes[caput.uuid!][0].idPersistido);
    expect(lexedit.pendencias).to.deep.equal({ TYPE_NAME: 'br_gov_lexml_lexedit__1.Pendencias', pendencia: ['Corrigir remissões internas inválidas.'] });
  });

  it('alterar as opções de origem depois de criar o documento não altera o documento', () => {
    const modelo = novoModelo();
    const opcoes = opcoesAlteradas();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { opcoesImpressao: opcoes });

    opcoes.textoCabecalho = 'Outro cabeçalho';
    opcoes.tamanhoFonte = 18;

    expect(lexeditSalvo(documento).opcoesImpressao).to.deep.equal({ TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...opcoesAlteradas() });
  });
});

describe('Opções de impressão — abrir (especificação 02)', () => {
  const PADRAO: OpcoesImpressao = { imprimirBrasao: true, textoCabecalho: '', reduzirEspacoEntreLinhas: false, tamanhoFonte: 14 };

  const documentoCom = (...lexedits: any[]): any => ({
    value: {
      metadado: {
        metadadoProprietario: lexedits.map(lexedit => metadadoProprietarioLexEdit({ ...lexedit })),
      },
    },
  });

  it('lê todos os atributos', () => {
    const dados = lerMetadadoLexEdit(
      documentoCom({ opcoesImpressao: { imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 } })
    );
    expect(dados.opcoesImpressao).to.deep.equal({ imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 });
  });

  it('atributos ausentes assumem o padrão', () => {
    const dados = lerMetadadoLexEdit(documentoCom({ opcoesImpressao: { textoCabecalho: 'Liderança' } }));
    expect(dados.opcoesImpressao).to.deep.equal({ ...PADRAO, textoCabecalho: 'Liderança' });
  });

  it('grupo vazio assume o padrão em todos os atributos', () => {
    expect(lerMetadadoLexEdit(documentoCom({ opcoesImpressao: {} })).opcoesImpressao).to.deep.equal(PADRAO);
  });

  for (const tamanhoFonte of [0, -2, 14.5, '16', 'grande', null]) {
    it(`tamanhoFonte inválido (${JSON.stringify(tamanhoFonte)}) assume 14 sem afetar os demais atributos`, () => {
      const dados = lerMetadadoLexEdit(documentoCom({ opcoesImpressao: { tamanhoFonte, imprimirBrasao: false } }));
      expect(dados.opcoesImpressao).to.deep.equal({ ...PADRAO, imprimirBrasao: false });
    });
  }

  it('aceita qualquer inteiro positivo em tamanhoFonte', () => {
    expect(lerMetadadoLexEdit(documentoCom({ opcoesImpressao: { tamanhoFonte: 15 } })).opcoesImpressao!.tamanhoFonte).to.equal(15);
  });

  it('valores lógicos em texto assumem o padrão', () => {
    const dados = lerMetadadoLexEdit(documentoCom({ opcoesImpressao: { imprimirBrasao: 'false', reduzirEspacoEntreLinhas: 'true', textoCabecalho: 12 } }));
    expect(dados.opcoesImpressao).to.deep.equal(PADRAO);
  });

  it('documento sem MetadadoProprietario não traz opções de impressão', () => {
    expect(lerMetadadoLexEdit(novoDocumentoArticulado())).to.deep.equal({});
    expect(lerMetadadoLexEdit(undefined)).to.deep.equal({});
  });

  it('MetadadoProprietario sem o grupo não traz opções de impressão', () => {
    expect(lerMetadadoLexEdit(documentoCom({ pendencias: { pendencia: ['x'] } }))).to.deep.equal({});
    expect(lerMetadadoLexEdit(documentoCom(undefined))).to.deep.equal({});
  });

  it('lê o grupo junto com remissões inválidas e um grupo desconhecido', () => {
    const documento = documentoCom({
      grupoFuturo: { qualquer: [1, 2] },
      remissoesInternasInvalidas: { refIdsRemissoesInternas: '_ri1' },
      opcoesImpressao: { tamanhoFonte: 16 },
      pendencias: { pendencia: ['Corrigir remissões internas inválidas.'] },
    });
    expect(lerMetadadoLexEdit(documento).opcoesImpressao).to.deep.equal({ ...PADRAO, tamanhoFonte: 16 });
    expect(lerIdsRemissoesInvalidas(documento)).to.deep.equal(['_ri1']);
  });
});

describe('Opções de impressão — salvar e reabrir pelo código do editor', () => {
  it('reabre as mesmas opções salvas', () => {
    const modelo = novoModelo();
    const salvo = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { opcoesImpressao: opcoesAlteradas() });

    const reaberto = lerDocumentoArticulado(serializarDocumentoArticulado(salvo));

    expect(lerMetadadoLexEdit(reaberto)).to.deep.equal({ opcoesImpressao: opcoesAlteradas() });
  });
});
