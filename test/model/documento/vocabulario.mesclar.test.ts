import { expect } from '@open-wc/testing';
import { mesclar } from '../../../src/model/lexml/documento/vocabulario/mesclar';
import { VocabularioAutoridade, VocabularioComum } from '../../../src/model/lexml/documento/vocabulario/tipos';

const comum: VocabularioComum = {
  atalhosUrn: [{ urnTipoDocumento: 'constituicao', urnAutoridade: 'federal', urn: 'u', nome: 'n' }],
  eventos: [{ urn: 'leitura', tipoTextoProcessoLegislativo: 'Texto inicial', genero: 'M' }],
};

const a: VocabularioAutoridade = {
  autoridade: { urn: 'a', descricao: 'A' },
  tiposDocumento: [{ urn: 'lei', descricao: 'Lei', genero: 'F' }],
  siglas: [{ urnTipoDocumento: 'lei', sigla: 'L' }],
  fakeUrns: [{ sigla: 'X', urnTipoDocumento: 'lei;x' }],
  preambulosPadrao: [{ urnTipoDocumento: 'lei', texto: 'A decreta:' }],
};

const b: VocabularioAutoridade = {
  autoridade: { urn: 'b', descricao: 'B' },
  tiposDocumento: [{ urn: 'lei', descricao: 'Lei', genero: 'F' }],
};

describe('mesclar', () => {
  it('carimba a autoridade em cada item', () => {
    const v = mesclar(comum, [a]);
    expect(v.tiposDocumento[0].urnAutoridade).to.equal('a');
    expect(v.siglas[0].urnAutoridade).to.equal('a');
    expect(v.fakeUrns[0].urnAutoridade).to.equal('a');
    expect(v.preambulosPadrao[0].urnAutoridade).to.equal('a');
  });

  it('concatena na ordem informada e lista as autoridades', () => {
    const v = mesclar(comum, [b, a]);
    expect(v.tiposDocumento.map(t => t.urnAutoridade)).to.deep.equal(['b', 'a']);
    expect(v.autoridades.map(x => x.urn)).to.deep.equal(['b', 'a']);
  });

  it('trata arrays ausentes como vazios', () => {
    const v = mesclar(comum, [b]);
    expect(v.siglas).to.deep.equal([]);
    expect(v.fakeUrns).to.deep.equal([]);
    expect(v.preambulosPadrao).to.deep.equal([]);
  });

  it('passa os itens do comum sem carimbo e preserva o urnAutoridade dos atalhos', () => {
    const v = mesclar(comum, [a]);
    expect(v.eventos).to.deep.equal(comum.eventos);
    expect(v.atalhosUrn).to.deep.equal(comum.atalhosUrn);
  });

  it('não altera os dados de entrada', () => {
    mesclar(comum, [a]);
    expect('urnAutoridade' in (a.tiposDocumento as any[])[0]).to.equal(false);
  });
});
