import { expect } from '@open-wc/testing';
import { buildFakeUrn, getAutoridade, getSigla, getTipo, getTipoDocumentoUrn } from '../../../src/model/lexml/documento/urnUtil';
import { getTipoPorSigla, getTiposDocumentoAtivos, getTiposDocumentoInativos } from '../../../src/model/lexml/documento/vocabulario/consultasVocabulario';
import { getVocabularioDaCasa, inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

describe('vocabulário estático e consultas', () => {
  afterEach(() => inicializarVocabulario('SF'));

  describe('inicialização', () => {
    it('monta SF sob demanda e normaliza valor inválido para SF com aviso', () => {
      const avisos: unknown[][] = [];
      const original = console.warn;
      console.warn = (...args: unknown[]) => avisos.push(args);
      try {
        inicializarVocabulario('XX');
      } finally {
        console.warn = original;
      }
      expect(avisos.length).to.equal(1);
      expect(getVocabularioDaCasa().autoridades.map(a => a.urn)).to.not.include('camara.deputados');
    });

    it('reinicializar troca o vocabulário', () => {
      inicializarVocabulario('CD');
      expect(getVocabularioDaCasa().autoridades.map(a => a.urn)).to.include('camara.deputados');
      inicializarVocabulario('SF');
      expect(getVocabularioDaCasa().autoridades.map(a => a.urn)).to.not.include('camara.deputados');
    });
  });

  describe('SF', () => {
    beforeEach(() => inicializarVocabulario('SF'));

    it('lista tipos ativos sem inativos nem normas', () => {
      const ativos = getTiposDocumentoAtivos();
      expect(ativos.length).to.be.greaterThan(0);
      expect(ativos.every(t => t.sigla && t.ativo)).to.equal(true);
    });

    it('lista só proposições inativas', () => {
      const inativos = getTiposDocumentoInativos();
      expect(inativos.map(t => t.sigla)).to.include('PLS');
      expect(inativos.every(t => t.sigla && !t.ativo)).to.equal(true);
    });

    it('identifica o tipo ativo pela sigla sem diferença de caixa', () => {
      expect(getTipoPorSigla('pec')?.urn).to.equal('proposta.emenda.constitucional;pec');
    });

    it('sigla só inativa, de outra casa ou desconhecida não resolve', () => {
      expect(getTipoPorSigla('PLC')).to.equal(undefined);
      expect(getTipoPorSigla('PRC')).to.equal(undefined);
      expect(getTipoPorSigla('ZZZ')).to.equal(undefined);
    });

    it('MPV é federal e PLV é do Congresso', () => {
      expect(buildFakeUrn('MPV', '1', '2020')).to.equal('urn:lex:br:federal:medida.provisoria;mpv:2020;1');
      expect(getTipoPorSigla('PLV')?.urnAutoridade).to.equal('congresso.nacional');
    });

    it('sigla desconhecida na casa falha com mensagem', () => {
      let erro: unknown;
      try {
        buildFakeUrn('PRC', '1', '2020');
      } catch (e) {
        erro = e;
      }
      expect(String(erro)).to.contain("Sigla 'PRC' não encontrada");
    });

    it('resolve tipo ativo, inativo e norma pela autoridade exata', () => {
      expect(getTipo('urn:lex:br:senado.federal:projeto.lei;pl:2026;1')?.urnAutoridade).to.equal('senado.federal');
      expect(getTipo('urn:lex:br:senado.federal:projeto.lei;pls:2026;1')?.ativo).to.equal(false);
      expect(getSigla('urn:lex:br:senado.federal:projeto.lei;pls:2026;1')).to.equal('PLS');
      expect(getSigla('urn:lex:br:federal:medida.provisoria;mpv:2020;930')).to.equal('MPV');
      expect(getTipo('urn:lex:br:federal:lei:2020-01-01;1')?.urnAutoridade).to.equal('federal');
      expect(getSigla('urn:lex:br:federal:lei:2020-01-01;1')).to.equal('');
    });

    it('não usa fallback para outra autoridade', () => {
      expect(getTipo('urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1')).to.equal(undefined);
      expect(getTipoDocumentoUrn('urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1')).to.equal(undefined);
    });

    it('resolve pela URN o tipo da outra casa', () => {
      expect(getTipo('urn:lex:br:camara.deputados:projeto.lei;pl:2026;1')?.urnAutoridade).to.equal('camara.deputados');
      expect(getAutoridade('urn:lex:br:camara.deputados:projeto.lei;pl:2026;1')?.urn).to.equal('camara.deputados');
    });

    it('listagens não trazem tipos da Câmara', () => {
      expect(getTiposDocumentoAtivos().some(t => t.urnAutoridade === 'camara.deputados')).to.equal(false);
      expect(getTiposDocumentoInativos().some(t => t.urnAutoridade === 'camara.deputados')).to.equal(false);
    });
  });

  describe('CD', () => {
    beforeEach(() => inicializarVocabulario('CD'));

    it('PL gera URN da Câmara', () => {
      expect(buildFakeUrn('PL', '1', '2026')).to.equal('urn:lex:br:camara.deputados:projeto.lei;pl:2026;1');
    });

    it('sigla do Senado não resolve, mas a URN do Senado resolve', () => {
      expect(getTipoPorSigla('PRS')).to.equal(undefined);
      expect(getTipo('urn:lex:br:senado.federal:projeto.lei;pl:2026;1')?.urnAutoridade).to.equal('senado.federal');
    });

    it('PL pela sigla é o da Câmara', () => {
      expect(getTipoPorSigla('PL')?.urnAutoridade).to.equal('camara.deputados');
    });

    it('listagens não trazem tipos do Senado', () => {
      expect(getTiposDocumentoAtivos().some(t => t.urnAutoridade === 'senado.federal')).to.equal(false);
      expect(getTiposDocumentoInativos().some(t => t.urnAutoridade === 'senado.federal')).to.equal(false);
    });
  });
});
