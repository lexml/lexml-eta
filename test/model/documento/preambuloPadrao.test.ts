import { expect } from '@open-wc/testing';
import { getPreambuloPadrao } from '../../../src/model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const decreta = 'O CONGRESSO NACIONAL decreta:';
const PEC = 'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:';
const MPV = 'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:';
const urn = (autoridade: string, tipo: string): string => `urn:lex:br:${autoridade}:${tipo}:2026;1`;

describe('Texto padrão do preâmbulo por tipo e autoridade da URN', () => {
  after(() => inicializarVocabulario('SF'));

  describe('SF', () => {
    before(() => inicializarVocabulario('SF'));

    [
      ['senado.federal', 'projeto.lei;pl'],
      ['senado.federal', 'projeto.lei;pls'],
      ['senado.federal', 'projeto.lei.complementar;plp'],
      ['senado.federal', 'projeto.decreto.legislativo;pdl'],
      ['senado.federal', 'projeto.decreto.legislativo;pds'],
      ['congresso.nacional', 'projeto.lei;pln'],
      ['congresso.nacional', 'projeto.lei.conversao;plv'],
      ['congresso.nacional', 'projeto.decreto.legislativo;pdn'],
    ].forEach(([autoridade, tipo]) => {
      it(`${tipo} (${autoridade}) recebe "decreta"`, () => {
        expect(getPreambuloPadrao(urn(autoridade, tipo))).to.equal(decreta);
      });
    });

    it('a sigla não influencia o texto', () => {
      expect(getPreambuloPadrao(urn('senado.federal', 'projeto.lei;pl'))).to.equal(getPreambuloPadrao(urn('senado.federal', 'projeto.lei;pls')));
    });

    it('tipo sem sigla também é reconhecido', () => {
      expect(getPreambuloPadrao(urn('senado.federal', 'projeto.lei'))).to.equal(decreta);
    });

    it('projeto de resolução depende da autoridade', () => {
      expect(getPreambuloPadrao(urn('senado.federal', 'projeto.resolucao;prs'))).to.equal('O SENADO FEDERAL resolve:');
      expect(getPreambuloPadrao(urn('congresso.nacional', 'projeto.resolucao;prn'))).to.equal('O CONGRESSO NACIONAL resolve:');
    });

    it('PEC do Senado', () => {
      expect(getPreambuloPadrao(urn('senado.federal', 'proposta.emenda.constitucional;pec'))).to.equal(PEC);
    });

    it('MPV federal', () => {
      expect(getPreambuloPadrao(urn('federal', 'medida.provisoria;mpv'))).to.equal(MPV);
    });

    it('combinações fora da tabela não têm texto', () => {
      expect(getPreambuloPadrao(urn('senado.federal', 'projeto.lei.conversao;plv'))).to.be.undefined;
      expect(getPreambuloPadrao(urn('senado.federal', 'medida.provisoria;mpv'))).to.be.undefined;
      expect(getPreambuloPadrao(urn('federal', 'projeto.resolucao;prs'))).to.be.undefined;
      expect(getPreambuloPadrao(urn('congresso.nacional', 'proposta.emenda.constitucional;pec'))).to.be.undefined;
    });

    it('autoridade fora do vocabulário da casa não tem texto', () => {
      expect(getPreambuloPadrao(urn('camara.deputados', 'projeto.lei;pl'))).to.be.undefined;
    });

    it('tipo sem texto padrão (norma) devolve undefined', () => {
      expect(getPreambuloPadrao(urn('federal', 'lei'))).to.be.undefined;
      expect(getPreambuloPadrao(urn('federal', 'decreto.lei'))).to.be.undefined;
    });

    it('URN vazia devolve undefined', () => {
      expect(getPreambuloPadrao('')).to.be.undefined;
    });
  });

  describe('CD', () => {
    before(() => inicializarVocabulario('CD'));

    [
      ['camara.deputados', 'projeto.lei;pl'],
      ['camara.deputados', 'projeto.lei.complementar;plp'],
      ['congresso.nacional', 'projeto.lei.conversao;plv'],
    ].forEach(([autoridade, tipo]) => {
      it(`${tipo} (${autoridade}) recebe "decreta"`, () => {
        expect(getPreambuloPadrao(urn(autoridade, tipo))).to.equal(decreta);
      });
    });

    it('projeto de resolução da Câmara', () => {
      expect(getPreambuloPadrao(urn('camara.deputados', 'projeto.resolucao;prc'))).to.equal('A CÂMARA DOS DEPUTADOS resolve:');
    });

    it('PEC da Câmara e MPV federal', () => {
      expect(getPreambuloPadrao(urn('camara.deputados', 'proposta.emenda.constitucional;pec'))).to.equal(PEC);
      expect(getPreambuloPadrao(urn('federal', 'medida.provisoria;mpv'))).to.equal(MPV);
    });

    it('autoridade do Senado não tem texto', () => {
      expect(getPreambuloPadrao(urn('senado.federal', 'projeto.lei;pl'))).to.be.undefined;
      expect(getPreambuloPadrao(urn('senado.federal', 'projeto.resolucao;prs'))).to.be.undefined;
    });
  });
});
