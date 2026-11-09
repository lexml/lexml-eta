import { expect } from '@open-wc/testing';
import { mesclar } from '../../../src/model/lexml/documento/vocabulario/mesclarVocabulario';
import { montarVocabulario, montarVocabularioCompleto } from '../../../src/model/lexml/documento/vocabulario/montarVocabulario';
import {
  TextoPreambuloPadrao,
  TipoDocumento,
  TipoDocumentoItem,
  TipoRelacaoSubstitutivo,
  VocabularioAutoridade,
  VocabularioComum,
} from '../../../src/model/lexml/documento/vocabulario/tiposVocabulario';

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
    expect(v.modelosEpigrafe).to.deep.equal([]);
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

    it('sem a checagem de sigla única (visão completa), aceita a mesma sigla ativa em autoridades diferentes', () => {
      expect(() => mesclar(comum, [autoridade('a', [pl]), autoridade('b', [pl])], { siglaAtivaUnica: false })).not.to.throw();
    });

    it('sem a checagem de sigla única, ainda rejeita tipo duplicado', () => {
      expect(() => mesclar(comum, [autoridade('a', [lei, lei])], { siglaAtivaUnica: false })).to.throw(/tipo duplicado 'a:lei'/);
    });

    describe('modelos de epígrafe', () => {
      const comModelos = (urn: string, tipos: TipoDocumentoItem[], codigos: string[]): VocabularioAutoridade => ({
        ...autoridade(urn, tipos),
        modelosEpigrafe: codigos.map(codigo => ({ codigo, modelo: `modelo ${codigo}` })),
      });

      it('carimba os modelos com a autoridade, mantendo o mesmo código em autoridades diferentes', () => {
        const v = mesclar(comum, [comModelos('a', [], ['substitutivo']), comModelos('b', [], ['substitutivo'])]);
        expect(v.modelosEpigrafe.map(m => [m.urnAutoridade, m.codigo])).to.deep.equal([
          ['a', 'substitutivo'],
          ['b', 'substitutivo'],
        ]);
      });

      it('aceita tipo que aponta para modelo da própria autoridade', () => {
        const tipo = { ...pl, modeloEpigrafe: 'x', modeloEpigrafeSubstitutivo: 'y' };
        expect(() => mesclar(comum, [comModelos('a', [tipo], ['x', 'y'])])).not.to.throw();
      });

      it('rejeita código duplicado na mesma autoridade', () => {
        expect(() => mesclar(comum, [comModelos('a', [], ['x', 'x'])])).to.throw(/modelo de epígrafe duplicado 'a:x'/);
      });

      it('rejeita modeloEpigrafe inexistente', () => {
        expect(() => mesclar(comum, [comModelos('a', [{ ...pl, modeloEpigrafe: 'inexistente' }], [])])).to.throw(
          /tipo 'a:projeto.lei;pl' aponta para o modelo de epígrafe inexistente 'inexistente'/
        );
      });

      it('rejeita modeloEpigrafeSubstitutivo inexistente', () => {
        expect(() => mesclar(comum, [comModelos('a', [{ ...pl, modeloEpigrafeSubstitutivo: 'y' }], ['x'])])).to.throw(/inexistente 'y'/);
      });

      it('não aceita modelo de outra autoridade', () => {
        expect(() => mesclar(comum, [comModelos('a', [{ ...pl, modeloEpigrafe: 'x' }], []), comModelos('b', [], ['x'])])).to.throw(/inexistente 'x'/);
      });
    });

    it('aceita sigla repetida entre ativo e inativo, e entre inativos', () => {
      const inativo = { ...pl, urnTipoDocumento: 'projeto.lei.complementar', ativo: false };
      expect(() => mesclar(comum, [autoridade('a', [pl, inativo])])).not.to.throw();
      expect(() => mesclar(comum, [autoridade('a', [{ ...pl, ativo: false }, inativo])])).not.to.throw();
    });
  });
});

describe('montarVocabulario', () => {
  it('monta o vocabulário do Senado sem tipos da Câmara', () => {
    const v = montarVocabulario('SF');
    expect(v.autoridades.map(a => a.urn)).to.deep.equal(['federal', 'senado.federal', 'congresso.nacional']);
    expect(v.tiposDocumento.some(t => t.urnAutoridade === 'camara.deputados')).to.equal(false);
  });

  it('monta a visão completa com as quatro autoridades, com siglas ativas repetidas entre as casas', () => {
    const v = montarVocabularioCompleto();
    expect(v.autoridades.map(a => a.urn)).to.deep.equal(['federal', 'senado.federal', 'camara.deputados', 'congresso.nacional']);
    expect(v.tiposDocumentoAtivos.filter(t => t.sigla === 'PL').map(t => t.urnAutoridade)).to.deep.equal(['senado.federal', 'camara.deputados']);
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

describe('modelos de epígrafe iniciais (visão completa)', () => {
  const v = montarVocabularioCompleto();
  const tiposDe = (autoridade: string): TipoDocumento[] => v.tiposDocumento.filter(t => t.urnAutoridade === autoridade);
  const tipoPorSigla = (autoridade: string, sigla: string): TipoDocumento => tiposDe(autoridade).find(t => t.sigla === sigla)!;
  const temModelo = (t: TipoDocumento): boolean => t.modeloEpigrafe !== undefined || t.modeloEpigrafeSubstitutivo !== undefined;

  it('declara os modelos por autoridade', () => {
    expect(v.modelosEpigrafe.map(m => `${m.urnAutoridade}:${m.codigo}`)).to.deep.equal([
      'senado.federal:substitutivo',
      'camara.deputados:substitutivo',
      'camara.deputados:subemenda.substitutiva',
      'congresso.nacional:plv',
    ]);
  });

  it('no Senado, todo tipo que aceita substitutivo usa o modelo substitutivo só como substitutivo', () => {
    const aceitam = tiposDe('senado.federal').filter(t => t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO);
    expect(aceitam.length).to.be.greaterThan(0);
    aceitam.forEach(t => {
      expect(t.modeloEpigrafeSubstitutivo, t.urn).to.equal('substitutivo');
      expect(t.modeloEpigrafe, t.urn).to.equal(undefined);
    });
  });

  it('na Câmara, SBT e SSP apontam para os seus modelos', () => {
    expect(tipoPorSigla('camara.deputados', 'SBT').modeloEpigrafe).to.equal('substitutivo');
    expect(tipoPorSigla('camara.deputados', 'SSP').modeloEpigrafe).to.equal('subemenda.substitutiva');
  });

  it('no Congresso, o PLV aponta para o modelo plv', () => {
    expect(tipoPorSigla('congresso.nacional', 'PLV').modeloEpigrafe).to.equal('plv');
  });

  it('nenhum outro tipo tem modelo', () => {
    const comModelo = v.tiposDocumento
      .filter(temModelo)
      .filter(t => !(t.urnAutoridade === 'senado.federal' && t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO));
    expect(comModelo.map(t => `${t.urnAutoridade}:${t.urn}`)).to.deep.equal([
      'camara.deputados:substitutivo;sbt',
      'camara.deputados:subemenda.substitutiva;ssp',
      'congresso.nacional:projeto.lei.conversao;plv',
    ]);
    expect(temModelo(tipoPorSigla('camara.deputados', 'PL'))).to.equal(false);
    expect(temModelo(tipoPorSigla('federal', 'MPV'))).to.equal(false);
  });
});
