import { expect } from '@open-wc/testing';
import { getPreambuloNovaProposicao, PREAMBULO_FALLBACK } from '../../../src/components/nova-proposicao/preambuloNovaProposicao';
import { montaEpigrafePadrao } from '../../../src/components/nova-proposicao/epigrafePadrao';
import { getIdentificacaoDocumento, getNovoOuNova } from '../../../src/components/nova-proposicao/identificacaoDocumento';
import { montaUrnNovaProposicao } from '../../../src/components/nova-proposicao/montaUrnNovaProposicao';
import {
  getSiglasNovaProposicao,
  getSiglasOutraProposicao,
  getSiglasProposicaoReferenciada,
  getSiglasSubstitutivo,
} from '../../../src/components/nova-proposicao/siglasNovaProposicao';
import { DadosIdentificacao } from '../../../src/components/nova-proposicao/tiposNovaProposicao';
import { montaUrlComissoes, montaUrlProposicao, validarConfigNovaProposicao } from '../../../src/components/nova-proposicao/urlsNovaProposicao';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoRelacaoSubstitutivo } from '../../../src/model/lexml/documento/vocabulario/tiposVocabulario';

const tipo = (casa: CasaLegislativaEditor, sigla: string, referenciada = false): any => {
  const lista = referenciada ? getSiglasProposicaoReferenciada() : getSiglasNovaProposicao(casa);
  return lista.find(t => t.sigla === sigla);
};

const dados = (casa: CasaLegislativaEditor, parcial: Partial<DadosIdentificacao>): DadosIdentificacao => ({
  casa,
  especie: 'proposicao',
  numeroProposicao: '',
  anoProposicao: '2026',
  anoSubstitutivo: '2026',
  numeroMpv: '',
  anoMpv: '2026',
  ...parcial,
});

describe('Módulos puros da nova proposição', () => {
  after(() => inicializarVocabulario('SF'));

  describe('siglas (RN-00 e RN-00a)', () => {
    it('SF: tipos do Senado e do Congresso, sem Câmara, MPV nem substitutivos', () => {
      inicializarVocabulario('SF');
      const siglas = getSiglasNovaProposicao('SF').map(t => `${t.urnAutoridade}:${t.sigla}`);
      expect(siglas).to.include.members(['senado.federal:PL', 'senado.federal:PLP', 'congresso.nacional:PLV', 'congresso.nacional:PLN']);
      expect(siglas.some(s => s.startsWith('camara.deputados'))).to.be.false;
      expect(siglas.some(s => s.endsWith(':MPV'))).to.be.false;
    });

    it('SF: ativos antes dos inativos, cada grupo em ordem alfabética', () => {
      inicializarVocabulario('SF');
      const lista = getSiglasNovaProposicao('SF');
      const primeiroInativo = lista.findIndex(t => !t.ativo);
      expect(primeiroInativo).to.be.greaterThan(0);
      expect(lista.slice(primeiroInativo).every(t => !t.ativo)).to.be.true;
      const ativas = lista.slice(0, primeiroInativo).map(t => t.sigla!);
      expect(ativas).to.deep.equal([...ativas].sort((a, b) => a.localeCompare(b)));
      const inativas = lista.slice(primeiroInativo).map(t => t.sigla!);
      expect(inativas).to.deep.equal([...inativas].sort((a, b) => a.localeCompare(b)));
      expect(inativas).to.include.members(['PLS', 'PLC']);
    });

    it('CD: sem substitutivo, subemenda, tipos do Senado nem MPV', () => {
      inicializarVocabulario('CD');
      const lista = getSiglasNovaProposicao('CD');
      const siglas = lista.map(t => t.sigla);
      expect(siglas).to.include.members(['PL', 'PLP', 'PEC', 'PRC', 'PLV']);
      expect(siglas).to.not.include.members(['SBT', 'PEP', 'MPV']);
      expect(lista.some(t => t.urnAutoridade === 'senado.federal')).to.be.false;
    });

    it('proposição referenciada: só tipos que aceitam substitutivo, ativos e inativos', () => {
      inicializarVocabulario('SF');
      const lista = getSiglasProposicaoReferenciada();
      expect(lista.every(t => t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO)).to.be.true;
      expect(lista.map(t => t.sigla)).to.include.members(['PL', 'PLS', 'PLC', 'PRN']);
      expect(lista.map(t => t.sigla)).to.not.include('PLV');
    });

    it('outra proposição: todas as siglas da casa, ativas antes das inativas, inclusive MPV', () => {
      inicializarVocabulario('SF');
      const sf = getSiglasOutraProposicao();
      expect(sf.map(t => t.sigla)).to.include.members(['PL', 'PLS', 'PLV', 'MPV']);
      expect(sf.some(t => t.urnAutoridade === 'camara.deputados')).to.be.false;
      const primeiroInativo = sf.findIndex(t => !t.ativo);
      expect(sf.slice(primeiroInativo).every(t => !t.ativo)).to.be.true;
      inicializarVocabulario('CD');
      expect(getSiglasOutraProposicao().map(t => t.sigla)).to.include.members(['PL', 'SBT', 'PEP', 'MPV']);
    });

    it('g2 da CD: substitutivo e subemenda substitutiva', () => {
      inicializarVocabulario('CD');
      expect(getSiglasSubstitutivo(TipoRelacaoSubstitutivo.E_SUBSTITUTIVO).map(t => t.sigla)).to.deep.equal(['SBT']);
      expect(getSiglasSubstitutivo(TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA).map(t => t.sigla)).to.deep.equal(['PEP']);
    });
  });

  describe('URN (RN-11 a RN-14 e RN-22)', () => {
    it('documento não numerado no SF', () => {
      inicializarVocabulario('SF');
      expect(montaUrnNovaProposicao(dados('SF', { tipoProposicao: tipo('SF', 'PL') }))).to.deep.equal({ urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2026;999999' });
    });

    it('substitutivo do SF: URN da proposição com sufixo de versão', () => {
      inicializarVocabulario('SF');
      const r = montaUrnNovaProposicao(dados('SF', { especie: 'substitutivo', tipoProposicao: tipo('SF', 'PL', true), numeroProposicao: '0012' }));
      expect(r.urn).to.equal('urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo');
      expect(r.urnDocumentoReferenciado).to.equal('urn:lex:br:senado.federal:projeto.lei;pl:2026;12');
    });

    it('substitutivo da CD: tipo e ano de g2, 999999, sem versão', () => {
      inicializarVocabulario('CD');
      const sbt = getSiglasSubstitutivo(TipoRelacaoSubstitutivo.E_SUBSTITUTIVO)[0];
      const r = montaUrnNovaProposicao(
        dados('CD', { especie: 'substitutivo', tipoProposicao: tipo('CD', 'PL', true), numeroProposicao: '12', tipoSubstitutivo: sbt, anoSubstitutivo: '2026' })
      );
      expect(r.urn).to.equal('urn:lex:br:camara.deputados:substitutivo;sbt:2026;999999');
      expect(r.urnDocumentoReferenciado).to.equal('urn:lex:br:camara.deputados:projeto.lei;pl:2026;12');
    });

    it('subemenda substitutiva da CD referencia a proposição original', () => {
      inicializarVocabulario('CD');
      const pep = getSiglasSubstitutivo(TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA)[0];
      const r = montaUrnNovaProposicao(dados('CD', { especie: 'subemenda', tipoProposicao: tipo('CD', 'PL', true), numeroProposicao: '12', tipoSubstitutivo: pep }));
      expect(r.urn).to.equal('urn:lex:br:camara.deputados:subemenda.substitutiva;pep:2026;999999');
      expect(r.urnDocumentoReferenciado).to.equal('urn:lex:br:camara.deputados:projeto.lei;pl:2026;12');
    });

    it('PLV referencia a MPV', () => {
      inicializarVocabulario('SF');
      const r = montaUrnNovaProposicao(dados('SF', { tipoProposicao: tipo('SF', 'PLV'), numeroMpv: '04321' }));
      expect(r.urn).to.equal('urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999');
      expect(r.urnDocumentoReferenciado).to.equal('urn:lex:br:federal:medida.provisoria;mpv:2026;4321');
    });
  });

  describe('identificação exibida (RN-08)', () => {
    it('proposição: nome do tipo', () => {
      inicializarVocabulario('SF');
      expect(getIdentificacaoDocumento(dados('SF', { tipoProposicao: tipo('SF', 'PLP') }))).to.equal('Projeto de Lei Complementar');
    });

    it('PLV', () => {
      inicializarVocabulario('SF');
      expect(getIdentificacaoDocumento(dados('SF', { tipoProposicao: tipo('SF', 'PLV'), numeroMpv: '0099', anoMpv: '2026' }))).to.equal(
        'Projeto de Lei de Conversão (Medida Provisória nº 99 de 2026)'
      );
    });

    it('substitutivo e subemenda, com ao/à conforme o gênero', () => {
      inicializarVocabulario('CD');
      expect(getIdentificacaoDocumento(dados('CD', { especie: 'substitutivo', tipoProposicao: tipo('CD', 'PL', true), numeroProposicao: '12' }))).to.equal(
        'Substitutivo ao Projeto de Lei nº 12 de 2026'
      );
      expect(getIdentificacaoDocumento(dados('CD', { especie: 'subemenda', tipoProposicao: tipo('CD', 'PEC', true), numeroProposicao: '3' }))).to.equal(
        'Subemenda Substitutiva à Proposta de Emenda Constitucional nº 3 de 2026'
      );
    });
  });

  describe('Novo/Nova conforme o gênero', () => {
    it('proposição acompanha o gênero do tipo', () => {
      inicializarVocabulario('SF');
      expect(getNovoOuNova(dados('SF', { tipoProposicao: tipo('SF', 'PL') }))).to.equal('Novo');
      expect(getNovoOuNova(dados('SF', { tipoProposicao: tipo('SF', 'PEC') }))).to.equal('Nova');
    });

    it('substitutivo é sempre masculino, mesmo de tipo feminino', () => {
      inicializarVocabulario('SF');
      expect(getNovoOuNova(dados('SF', { especie: 'substitutivo', tipoProposicao: tipo('SF', 'PEC', true) }))).to.equal('Novo');
    });

    it('subemenda substitutiva é sempre feminina', () => {
      inicializarVocabulario('CD');
      expect(getNovoOuNova(dados('CD', { especie: 'subemenda', tipoProposicao: tipo('CD', 'PL', true) }))).to.equal('Nova');
    });
  });

  it('epígrafe do caso padrão', () => {
    inicializarVocabulario('SF');
    expect(montaEpigrafePadrao('urn:lex:br:senado.federal:projeto.lei.complementar;plp:2026;999999')).to.equal('PROJETO DE LEI COMPLEMENTAR Nº   , DE 2026');
  });

  describe('URLs', () => {
    it('sigla em maiúsculas e número sem zeros à esquerda', () => {
      expect(montaUrlProposicao('/v/{sigla}/{numero}/{ano}', 'pl', '0012', '2026')).to.equal('/v/PL/12/2026');
    });

    it('casa nas comissões', () => {
      expect(montaUrlComissoes('/comissoes/{casa}', 'CN')).to.equal('/comissoes/CN');
    });

    ['urlVerificacaoProposicao', 'urlTextoEstruturado', 'urlComissoes'].forEach(nome => {
      it(`configuração sem ${nome} falha nomeando a URL`, () => {
        const config: any = { urlVerificacaoProposicao: '/a', urlTextoEstruturado: '/b', urlComissoes: '/c' };
        delete config[nome];
        expect(() => validarConfigNovaProposicao(config)).to.throw(nome);
      });
    });
  });

  describe('preâmbulo (fallback no componente)', () => {
    it('usa o texto padrão do tipo quando existe', () => {
      inicializarVocabulario('SF');
      expect(getPreambuloNovaProposicao('urn:lex:br:senado.federal:projeto.resolucao;prs:2026;999999')).to.equal('O SENADO FEDERAL resolve:');
    });

    it('sem modelo: registra o erro com a URN e usa o texto padrão do Congresso', () => {
      inicializarVocabulario('SF');
      const original = console.error;
      const chamadas: string[] = [];
      console.error = (...args: unknown[]): void => void chamadas.push(args.join(' '));
      try {
        const urn = 'urn:lex:br:senado.federal:regimento.interno:2026;1';
        expect(getPreambuloNovaProposicao(urn)).to.equal(PREAMBULO_FALLBACK);
        expect(chamadas.some(c => c.includes(urn))).to.be.true;
      } finally {
        console.error = original;
      }
    });
  });
});
