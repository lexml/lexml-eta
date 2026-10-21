import { expect } from '@open-wc/testing';
import { mesclar } from '../../../src/model/lexml/documento/vocabulario/mesclar';
import { montarVocabulario } from '../../../src/model/lexml/documento/vocabulario/montarVocabulario';
import { TextoPreambuloPadrao, TipoDocumentoItem, TipoRelacaoSubstitutivo, VocabularioAutoridade, VocabularioComum } from '../../../src/model/lexml/documento/vocabulario/tipos';

const comum: VocabularioComum = {
  atalhosUrn: [{ urnTipoDocumento: 'constituicao', urnAutoridade: 'federal', urn: 'u', nome: 'n' }],
  eventos: [{ urn: 'leitura', tipoTextoProcessoLegislativo: 'Texto inicial', genero: 'M' }],
};

const autoridade = (urn: string, tipos: TipoDocumentoItem[] = [], preambulos: VocabularioAutoridade['preambulosPadrao'] = []): VocabularioAutoridade => ({
  autoridade: { urn, descricao: urn.toUpperCase() },
  tiposDocumento: tipos,
  preambulosPadrao: preambulos,
});

const pl: TipoDocumentoItem = {
  urnTipoDocumento: 'projeto.lei',
  sigla: 'PL',
  descricao: 'Projeto de Lei',
  genero: 'M',
  tipoRelacaoSubstitutivo: TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO,
};
const lei: TipoDocumentoItem = { urnTipoDocumento: 'lei', descricao: 'Lei', genero: 'F' };

describe('mesclar', () => {
  it('carimba a autoridade e calcula a urn do tipo', () => {
    const v = mesclar(comum, [autoridade('a', [pl, lei], [{ urnTipoDocumento: 'projeto.lei', texto: TextoPreambuloPadrao.CONGRESSO_DECRETA }])]);
    expect(v.tiposDocumento.map(t => [t.urnAutoridade, t.urn])).to.deep.equal([
      ['a', 'projeto.lei;pl'],
      ['a', 'lei'],
    ]);
    expect(v.preambulosPadrao[0].urnAutoridade).to.equal('a');
  });

  it('assume ativo e não aceita substitutivo para proposição, e nada para norma', () => {
    const v = mesclar(comum, [autoridade('a', [{ urnTipoDocumento: 'projeto.lei.complementar', sigla: 'plp', descricao: 'PLP', genero: 'M' }, lei])]);
    const [proposicao, norma] = v.tiposDocumento;
    expect(proposicao.ativo).to.equal(true);
    expect(proposicao.tipoRelacaoSubstitutivo).to.equal(TipoRelacaoSubstitutivo.NAO_ACEITA_SUBSTITUTIVO);
    expect(proposicao.urn).to.equal('projeto.lei.complementar;plp');
    expect(norma.ativo).to.equal(undefined);
    expect(norma.tipoRelacaoSubstitutivo).to.equal(undefined);
  });

  it('lista como ativos só as proposições ativas', () => {
    const v = mesclar(comum, [autoridade('a', [pl, { ...pl, sigla: 'PLS', ativo: false }, lei])]);
    expect(v.tiposDocumento.length).to.equal(3);
    expect(v.tiposDocumentoAtivos.map(t => t.urn)).to.deep.equal(['projeto.lei;pl']);
  });

  it('concatena na ordem informada e lista as autoridades', () => {
    const v = mesclar(comum, [autoridade('b', [lei]), autoridade('a', [lei])]);
    expect(v.tiposDocumento.map(t => t.urnAutoridade)).to.deep.equal(['b', 'a']);
    expect(v.autoridades.map(x => x.urn)).to.deep.equal(['b', 'a']);
  });

  it('trata arrays ausentes como vazios e passa o comum sem carimbo', () => {
    const v = mesclar(comum, [{ autoridade: { urn: 'a', descricao: 'A' } }]);
    expect(v.tiposDocumento).to.deep.equal([]);
    expect(v.preambulosPadrao).to.deep.equal([]);
    expect(v.eventos).to.deep.equal(comum.eventos);
    expect(v.atalhosUrn).to.deep.equal(comum.atalhosUrn);
  });

  it('não altera os dados de entrada', () => {
    mesclar(comum, [autoridade('a', [pl])]);
    expect('urnAutoridade' in pl).to.equal(false);
    expect('urn' in pl).to.equal(false);
  });

  describe('validação', () => {
    it('aceita a mesma urn de tipo em autoridades diferentes', () => {
      expect(() => mesclar(comum, [autoridade('a', [lei]), autoridade('b', [lei])])).not.to.throw();
    });

    it('rejeita tipo duplicado na mesma autoridade', () => {
      expect(() => mesclar(comum, [autoridade('a', [lei, lei])])).to.throw(/tipo duplicado 'a:lei'/);
    });

    it('rejeita a mesma sigla ativa em duas entradas', () => {
      expect(() => mesclar(comum, [autoridade('a', [pl]), autoridade('b', [pl])])).to.throw(/sigla 'PL' ativa/);
    });

    it('aceita sigla repetida entre ativo e inativo, e entre inativos', () => {
      const inativo = { ...pl, urnTipoDocumento: 'projeto.lei.complementar', ativo: false };
      expect(() => mesclar(comum, [autoridade('a', [pl, inativo])])).not.to.throw();
      expect(() => mesclar(comum, [autoridade('a', [{ ...pl, ativo: false }, inativo])])).not.to.throw();
    });

    it('rejeita referência a tipo inexistente', () => {
      const ref = { ...pl, tiposReferenciaveis: ['projeto.lei;pls'] };
      expect(() => mesclar(comum, [autoridade('a', [ref])])).to.throw(/tipo inexistente 'projeto.lei;pls'/);
    });

    it('rejeita referência a tipo que não aceita substitutivo', () => {
      const ref = { ...pl, tiposReferenciaveis: ['projeto.lei.complementar;plp'] };
      const plp = { urnTipoDocumento: 'projeto.lei.complementar', sigla: 'PLP', descricao: 'PLP', genero: 'M' };
      expect(() => mesclar(comum, [autoridade('a', [ref, plp])])).to.throw(/não aceita substitutivo/);
    });

    it('aceita referência a tipo inativo que aceita substitutivo', () => {
      const pls = { ...pl, sigla: 'PLS', ativo: false };
      const ref = { ...pl, tiposReferenciaveis: ['projeto.lei;pls'] };
      expect(() => mesclar(comum, [autoridade('a', [ref, pls])])).not.to.throw();
    });
  });
});

describe('montarVocabulario', () => {
  it('monta o vocabulário do Senado sem tipos da Câmara', () => {
    const v = montarVocabulario('SF');
    expect(v.autoridades.map(a => a.urn)).to.deep.equal(['federal', 'senado.federal', 'congresso.nacional']);
    expect(v.tiposDocumento.some(t => t.urnAutoridade === 'camara.deputados')).to.equal(false);
  });

  it('monta o vocabulário da Câmara sem tipos do Senado', () => {
    const v = montarVocabulario('CD');
    expect(v.autoridades.map(a => a.urn)).to.deep.equal(['federal', 'camara.deputados', 'congresso.nacional']);
    expect(v.tiposDocumento.some(t => t.urnAutoridade === 'senado.federal')).to.equal(false);
  });

  ['SF', 'CD'].forEach(casa => {
    it(`${casa}: tem uma só proposição ativa por sigla e as cópias de tipo têm descrição e gênero idênticos`, () => {
      const v = montarVocabulario(casa as 'SF' | 'CD');
      const siglas = v.tiposDocumentoAtivos.map(t => t.sigla);
      expect(new Set(siglas).size).to.equal(siglas.length);
      const porUrn = new Map<string, string>();
      v.tiposDocumento.forEach(t => {
        const assinatura = `${t.descricao}|${t.genero}`;
        expect(porUrn.get(t.urn) ?? assinatura).to.equal(assinatura);
        porUrn.set(t.urn, assinatura);
      });
    });
  });
});
