import { expect } from '@open-wc/testing';
import { getCasaLegislativaResponsavel, isTipoDocumentoNaoSuportado, verificarUrnDaCasaDoEditor, verificarUrnParaNovaProposicao } from '../../../src/model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { PENDENCIA_DOCUMENTO_NAO_SUPORTADO } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN_PL_SENADO = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';
const URN_PL_CAMARA = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;1';
const URN_PLN = 'urn:lex:br:congresso.nacional:projeto.lei;pln:2026;1';
const URN_MPV = 'urn:lex:br:federal:medida.provisoria;mpv:2026;1';
const URN_PLS = 'urn:lex:br:senado.federal:projeto.lei;pls:2015;1';
const URN_RESOLUCAO_SENADO = 'urn:lex:br:senado.federal:resolucao:2026;1';

describe('Casa responsável derivada da autoridade da URN', () => {
  afterEach(() => inicializarVocabulario('SF'));

  [
    [URN_PL_SENADO, 'SF', 'SF'],
    [URN_PL_CAMARA, 'CD', 'CD'],
    [URN_PLN, 'CN', 'SF'],
  ].forEach(([urn, casa, casaDoEditor]) => {
    it(`${urn} é da casa ${casa} e não é do tipo não suportado no editor ${casaDoEditor}`, () => {
      inicializarVocabulario(casaDoEditor);
      expect(getCasaLegislativaResponsavel(urn)).to.equal(casa);
      expect(isTipoDocumentoNaoSuportado(urn)).to.be.false;
    });
  });

  it('autoridade federal é do tipo não suportado, sem casa', () => {
    expect(getCasaLegislativaResponsavel(URN_MPV)).to.be.undefined;
    expect(isTipoDocumentoNaoSuportado(URN_MPV)).to.be.true;
  });

  it('autoridade desconhecida é do tipo não suportado, sem casa', () => {
    expect(getCasaLegislativaResponsavel('urn:lex:br:xyz:lei:2026;1')).to.be.undefined;
    expect(getCasaLegislativaResponsavel('urn:lex:br:constructor:lei:2026;1')).to.be.undefined;
    expect(isTipoDocumentoNaoSuportado('urn:lex:br:xyz:lei:2026;1')).to.be.true;
  });

  it('norma de autoridade com casa é do tipo não suportado', () => {
    expect(getCasaLegislativaResponsavel(URN_RESOLUCAO_SENADO)).to.equal('SF');
    expect(isTipoDocumentoNaoSuportado(URN_RESOLUCAO_SENADO)).to.be.true;
  });

  it('proposição inativa não é do tipo não suportado', () => {
    expect(isTipoDocumentoNaoSuportado(URN_PLS)).to.be.false;
  });

  it('URN sem a sigla resolve para a proposição ativa', () => {
    expect(isTipoDocumentoNaoSuportado('urn:lex:br:senado.federal:projeto.lei:2026;1')).to.be.false;
  });
});

describe('Tipos permitidos para criar proposição', () => {
  afterEach(() => inicializarVocabulario('SF'));

  [
    ['SF', URN_PL_SENADO],
    ['SF', URN_PLN],
    ['CD', URN_PL_CAMARA],
    ['CD', URN_PLN],
    ['SF', URN_PLS],
  ].forEach(([casa, urn]) => {
    it(`${casa}: aceita ${urn}`, () => {
      inicializarVocabulario(casa);
      expect(() => verificarUrnParaNovaProposicao(urn)).to.not.throw();
    });
  });

  [
    ['SF', URN_PL_CAMARA],
    ['CD', URN_PL_SENADO],
    ['SF', URN_MPV],
    ['CD', URN_MPV],
    ['SF', URN_RESOLUCAO_SENADO],
    ['SF', 'urn:lex:br:senado.federal:tipo.inexistente:2026;1'],
  ].forEach(([casa, urn]) => {
    it(`${casa}: recusa ${urn}`, () => {
      inicializarVocabulario(casa);
      expect(() => verificarUrnParaNovaProposicao(urn)).to.throw(/Não é possível criar proposição deste tipo/);
    });
  });

  it('medida provisória: recusada na criação, aceita na abertura', () => {
    expect(() => verificarUrnParaNovaProposicao(URN_MPV)).to.throw();
    expect(() => verificarUrnDaCasaDoEditor(URN_MPV)).to.not.throw();
  });

  it('documento da casa oposta continua recusado na abertura', () => {
    expect(() => verificarUrnDaCasaDoEditor(URN_PL_CAMARA)).to.throw(/outra casa legislativa/);
  });
});

describe('Pendência de documento não suportado', () => {
  const salvarCom = (urn: string): any => {
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
    return criarDocumentoArticulado(modelo, urn, undefined, undefined, { anexoParecer: false });
  };

  it('documento de tipo não suportado grava a pendência', () => {
    expect(lexeditSalvo(salvarCom(URN_MPV)).pendencias.pendencia).to.include(PENDENCIA_DOCUMENTO_NAO_SUPORTADO);
  });

  it('documento de tipo suportado não grava a pendência', () => {
    expect(lexeditSalvo(salvarCom(URN_PL_SENADO)).pendencias?.pendencia ?? []).not.to.include(PENDENCIA_DOCUMENTO_NAO_SUPORTADO);
  });

  it('a pendência gravada não é lida nem copiada para um documento de tipo suportado', () => {
    const lido = lerDocumentoArticulado(JSON.stringify(salvarCom(URN_PL_SENADO)));
    lexeditSalvo(lido).pendencias = { TYPE_NAME: 'br_gov_lexml_lexedit__1.Pendencias', pendencia: [PENDENCIA_DOCUMENTO_NAO_SUPORTADO] };
    const dados = lerMetadadoLexEdit(lido);
    const reaberto = buildProjetoNormaFromJsonix(lido, true);

    expect(lexeditSalvo(criarDocumentoArticulado(reaberto, URN_PL_SENADO, undefined, undefined, { ...dados, anexoParecer: false }))).not.to.have.property('pendencias');
  });
});
