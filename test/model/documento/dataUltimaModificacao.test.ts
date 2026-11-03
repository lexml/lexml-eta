import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const DATA = '2026-05-12T10:15:00-03:00';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const salvar = (dados?: DadosLexEdit): any => {
  const modelo = novoModelo();
  return criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, dados);
};

const documentoCom = (grupos: Record<string, unknown>): any => {
  const documento = novoDocumentoArticulado();
  documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit(grupos)];
  return documento;
};

const opcoesImpressao = { TYPE_NAME: 'br_gov_lexml_lexedit__1.OpcoesImpressao', imprimirBrasao: false, textoCabecalho: 'X', reduzirEspacoEntreLinhas: true, tamanhoFonte: 16 };

describe('Data da última modificação — salvar (especificação 13)', () => {
  it('grava o valor informado pelo editor', () => {
    expect(lexeditSalvo(salvar({ dataUltimaModificacao: DATA })).dataUltimaModificacao).to.equal(DATA);
  });

  it('sem dados do editor, ou sem o campo, não grava o atributo', () => {
    expect(salvar().value.metadado.metadadoProprietario).to.be.undefined;
    expect(lexeditSalvo(salvar({ anexoParecer: false }))).to.not.have.property('dataUltimaModificacao');
  });

  it('não grava aplicacao nem versaoAplicacao', () => {
    const lexedit = lexeditSalvo(salvar({ dataUltimaModificacao: DATA }));

    expect(lexedit).to.not.have.property('aplicacao');
    expect(lexedit).to.not.have.property('versaoAplicacao');
  });
});

describe('Data da última modificação — abrir', () => {
  ['2026-05-12T10:15:00-03:00', '2026-05-12T13:15:00Z', '2026-05-12T10:15:00.123-03:00', '2026-05-12T10:15:00'].forEach(valor => {
    it(`lê o valor como gravado (${valor})`, () => {
      expect(lerMetadadoLexEdit(documentoCom({ dataUltimaModificacao: valor })).dataUltimaModificacao).to.equal(valor);
    });
  });

  [undefined, '', 'ontem', '2026-05-12', '2026-13-45T99:99:99-03:00', 20260512].forEach(valor => {
    it(`valor ausente ou inválido não é lido e não afeta outro grupo (${valor})`, () => {
      const dados = lerMetadadoLexEdit(documentoCom({ dataUltimaModificacao: valor, opcoesImpressao }));

      expect(dados).to.not.have.property('dataUltimaModificacao');
      expect(dados.opcoesImpressao?.tamanhoFonte).to.equal(16);
    });
  });

  it('ignora aplicacao e versaoAplicacao', () => {
    const dados = lerMetadadoLexEdit(documentoCom({ dataUltimaModificacao: DATA, aplicacao: 'LexEdit', versaoAplicacao: '1.0.0' }));

    expect(dados).to.not.have.property('aplicacao');
    expect(dados).to.not.have.property('versaoAplicacao');
    expect(dados.dataUltimaModificacao).to.equal(DATA);
  });

  it('salvar o documento reaberto com os dados lidos gera o mesmo arquivo', () => {
    const salvo = salvar({ dataUltimaModificacao: DATA });
    const documento = lerDocumentoArticulado(salvo);
    const reaberto = buildProjetoNormaFromJsonix(documento, true);

    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, lerMetadadoLexEdit(documento))).to.deep.equal(salvo);
  });
});
