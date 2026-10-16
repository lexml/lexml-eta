import { expect } from '@open-wc/testing';
import { getPreambuloPadrao } from '../../../src/model/lexml/documento/urnUtil';

const decreta = 'O CONGRESSO NACIONAL decreta:';
const urn = (autoridade: string, tipo: string): string => `urn:lex:br:${autoridade}:${tipo}:2026;1`;

describe('Texto padrão do preâmbulo por tipo da URN', () => {
  [
    ['senado.federal', 'projeto.lei;pl'],
    ['senado.federal', 'projeto.lei;pls'],
    ['camara.deputados', 'projeto.lei;plc'],
    ['congresso.nacional', 'projeto.lei;pln'],
    ['senado.federal', 'projeto.lei.complementar;plp'],
    ['senado.federal', 'projeto.lei.conversao;plv'],
    ['senado.federal', 'projeto.decreto.legislativo;pdl'],
    ['senado.federal', 'projeto.decreto.legislativo;pds'],
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
    expect(getPreambuloPadrao(urn('camara.deputados', 'projeto.resolucao;prc'))).to.equal('A CÂMARA DOS DEPUTADOS resolve:');
    expect(getPreambuloPadrao(urn('congresso.nacional', 'projeto.resolucao;prn'))).to.equal('O CONGRESSO NACIONAL resolve:');
  });

  it('projeto de resolução de autoridade desconhecida não tem texto', () => {
    expect(getPreambuloPadrao(urn('federal', 'projeto.resolucao;prs'))).to.be.undefined;
  });

  it('PEC', () => {
    expect(getPreambuloPadrao(urn('senado.federal', 'proposta.emenda.constitucional;pec'))).to.equal(
      'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:'
    );
  });

  it('MPV', () => {
    expect(getPreambuloPadrao(urn('senado.federal', 'medida.provisoria;mpv'))).to.equal(
      'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:'
    );
  });

  it('tipo sem texto padrão (norma, substitutivo) devolve undefined', () => {
    expect(getPreambuloPadrao(urn('federal', 'lei'))).to.be.undefined;
    expect(getPreambuloPadrao(urn('federal', 'decreto.lei'))).to.be.undefined;
    expect(getPreambuloPadrao(urn('senado.federal', 'substitutivo.projeto.lei.senado;scd'))).to.be.undefined;
  });

  it('URN vazia devolve undefined', () => {
    expect(getPreambuloPadrao('')).to.be.undefined;
  });
});
