import { expect } from '@open-wc/testing';
import { montaEpigrafe, preencheModeloEpigrafe } from '../../../src/model/lexml/documento/epigrafe';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const BRANCO = '       ';
const PL_SF_1234 = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1234';
const SUBSTITUTIVO_SF = `${PL_SF_1234}@apresentacao.substitutivo`;

describe('montaEpigrafe', () => {
  afterEach(() => inicializarVocabulario('SF'));

  describe('seleção do modelo', () => {
    it('substitutivo do Senado usa o modelo substitutivo do Senado, com sufixo', () => {
      expect(montaEpigrafe(SUBSTITUTIVO_SF, PL_SF_1234, '- CCJ')).to.equal('EMENDA Nº        - CCJ (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 1.234, de 2026)');
    });

    it('substitutivo do Senado sem sufixo troca {sufixo} por vazio', () => {
      expect(montaEpigrafe(SUBSTITUTIVO_SF, PL_SF_1234)).to.equal('EMENDA Nº         (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 1.234, de 2026)');
    });

    it('tipo que aceita substitutivo, sem ser substitutivo, usa o modelo padrão', () => {
      expect(montaEpigrafe('urn:lex:br:senado.federal:projeto.lei;pl:2026;999999')).to.equal(`PROJETO DE LEI Nº ${BRANCO}, DE 2026`);
    });

    it('substitutivo da Câmara', () => {
      expect(montaEpigrafe('urn:lex:br:camara.deputados:substitutivo;sbt:2025;999999', 'urn:lex:br:camara.deputados:projeto.lei;pl:2025;11')).to.equal(
        'SUBSTITUTIVO AO PROJETO DE LEI Nº 11, DE 2025'
      );
    });

    it('subemenda substitutiva da Câmara com documento referenciado feminino', () => {
      expect(
        montaEpigrafe('urn:lex:br:camara.deputados:subemenda.substitutiva;ssp:2025;999999', 'urn:lex:br:camara.deputados:proposta.emenda.constitucional;pec:2025;11')
      ).to.equal('SUBEMENDA SUBSTITUTIVA À PROPOSTA DE EMENDA CONSTITUCIONAL Nº 11, DE 2025');
    });

    it('PLV não numerado', () => {
      expect(montaEpigrafe('urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999', 'urn:lex:br:federal:medida.provisoria;mpv:2026;1234')).to.equal(
        `PROJETO DE LEI DE CONVERSÃO Nº ${BRANCO}, DE 2026<br/>(Medida Provisória nº 1.234, de 2026)`
      );
    });

    it('caso padrão numerado', () => {
      expect(montaEpigrafe('urn:lex:br:camara.deputados:projeto.lei;pl:2026;12')).to.equal('PROJETO DE LEI Nº 12, DE 2026');
    });

    it('tipo não resolvido usa o modelo padrão com a descrição vazia', () => {
      expect(montaEpigrafe('urn:lex:br:senado.federal:tipo.inexistente;tin:2026;5')).to.equal(' Nº 5, DE 2026');
    });

    it('independe da casa do editor', () => {
      inicializarVocabulario('SF');
      const naCasaSF = montaEpigrafe('urn:lex:br:camara.deputados:substitutivo;sbt:2025;999999', 'urn:lex:br:camara.deputados:projeto.lei;pl:2025;11');
      inicializarVocabulario('CD');
      const naCasaCD = montaEpigrafe(SUBSTITUTIVO_SF, PL_SF_1234, '- CCJ');
      expect(naCasaSF).to.equal('SUBSTITUTIVO AO PROJETO DE LEI Nº 11, DE 2025');
      expect(naCasaCD).to.equal('EMENDA Nº        - CCJ (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 1.234, de 2026)');
    });
  });

  describe('placeholders e formatação', () => {
    it('sem documento referenciado, os placeholders dr.* viram vazio sem normalizar espaços', () => {
      expect(montaEpigrafe('urn:lex:br:camara.deputados:substitutivo;sbt:2025;999999')).to.equal('SUBSTITUTIVO   Nº , DE ');
    });

    it('formata o número com separador de milhar', () => {
      expect(montaEpigrafe('urn:lex:br:senado.federal:projeto.lei;pl:2026;12345')).to.equal('PROJETO DE LEI Nº 12.345, DE 2026');
    });

    it('ano provisório vira vazio', () => {
      expect(montaEpigrafe('urn:lex:br:senado.federal:projeto.lei;pl:9999;999999')).to.equal(`PROJETO DE LEI Nº ${BRANCO}, DE `);
    });

    it('codifica o sufixo como texto XML e mantém o <br/> do modelo', () => {
      expect(montaEpigrafe(SUBSTITUTIVO_SF, PL_SF_1234, '- CCJ & <CAE>')).to.equal(
        'EMENDA Nº        - CCJ &amp; &lt;CAE&gt; (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 1.234, de 2026)'
      );
    });

    it('{sigla} e {dr.sigla} vêm do tipo; sem sigla, viram vazio', () => {
      expect(preencheModeloEpigrafe('[{sigla}|{dr.sigla}]', 'urn:lex:br:federal:lei:2020;1', PL_SF_1234)).to.equal('[|PL]');
    });

    it('{descricao} é a descrição do tipo, sem maiúsculas', () => {
      expect(preencheModeloEpigrafe('{descricao}', 'urn:lex:br:federal:consolidacao.leis.trabalho:1943;5452')).to.equal('Consolidação das Leis do Trabalho');
    });

    it('mantém placeholder desconhecido', () => {
      expect(preencheModeloEpigrafe('{descricaoMaiusculas} {desconhecido}', 'urn:lex:br:federal:lei:2020;1')).to.equal('LEI {desconhecido}');
    });
  });
});
