import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN_REFERENCIADA = 'urn:lex:br:senado.federal:projeto.lei;pl:2025;10';

const salvar = (dados: DadosLexEdit): any => {
  const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
  return lexeditSalvo(criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, dados));
};

const documentoCom = (grupos: Record<string, unknown>): any => {
  const documento = novoDocumentoArticulado();
  documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit(grupos)];
  return documento;
};

describe('Modo de anexo de parecer e documento referenciado — salvar', () => {
  it('grava anexoParecer true no modo de anexo de parecer', () => {
    expect(salvar({ anexoParecer: true }).anexoParecer).to.be.true;
  });

  it('grava anexoParecer false no modo normal', () => {
    expect(salvar({ anexoParecer: false }).anexoParecer).to.be.false;
  });

  it('grava a URN do documento referenciado', () => {
    expect(salvar({ anexoParecer: false, urnDocumentoReferenciado: URN_REFERENCIADA }).urnDocumentoReferenciado).to.equal(URN_REFERENCIADA);
  });

  it('omite a URN do documento referenciado quando não há referência', () => {
    expect(salvar({ anexoParecer: false })).not.to.have.property('urnDocumentoReferenciado');
    expect(salvar({ anexoParecer: false, urnDocumentoReferenciado: '  ' })).not.to.have.property('urnDocumentoReferenciado');
  });
});

describe('Modo de anexo de parecer e documento referenciado — abrir', () => {
  it('lê os dois atributos válidos', () => {
    const dados = lerMetadadoLexEdit(documentoCom({ anexoParecer: true, urnDocumentoReferenciado: URN_REFERENCIADA }));

    expect(dados.anexoParecer).to.be.true;
    expect(dados.urnDocumentoReferenciado).to.equal(URN_REFERENCIADA);
  });

  it('atributos ausentes equivalem ao modo normal e sem referência', () => {
    const dados = lerMetadadoLexEdit(documentoCom({ local: 'Sala das sessões' }));

    expect(!!dados.anexoParecer).to.be.false;
    expect(dados.urnDocumentoReferenciado).to.be.undefined;
  });

  it('valores inválidos são descartados sem invalidar os demais', () => {
    const dados = lerMetadadoLexEdit(documentoCom({ anexoParecer: 'sim', urnDocumentoReferenciado: 42, local: 'Sala das sessões' }));

    expect(!!dados.anexoParecer).to.be.false;
    expect(dados.urnDocumentoReferenciado).to.be.undefined;
    expect(dados.local).to.equal('Sala das sessões');
  });

  it('ida e volta preserva o modo e a referência', () => {
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { anexoParecer: true, urnDocumentoReferenciado: URN_REFERENCIADA });
    const dados = lerMetadadoLexEdit(lerDocumentoArticulado(JSON.stringify(salvo)));

    expect(dados.anexoParecer).to.be.true;
    expect(dados.urnDocumentoReferenciado).to.equal(URN_REFERENCIADA);
  });
});
