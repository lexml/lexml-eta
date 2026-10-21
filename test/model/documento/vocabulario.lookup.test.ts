import { expect } from '@open-wc/testing';
import { getSigla, getTipo, getTipoDocumentoUrn } from '../../../src/model/lexml/documento/urnUtil';

const urn = (autoridade: string, tipo: string): string => `urn:lex:br:${autoridade}:${tipo}:2026;1`;

describe('vocabulário — lookups pela autoridade da URN', () => {
  describe('entrada da própria autoridade', () => {
    ['senado.federal', 'camara.deputados', 'congresso.nacional'].forEach(autoridade => {
      it(`decreto.legislativo em ${autoridade}`, () => {
        expect(getTipo(urn(autoridade, 'decreto.legislativo')).urnAutoridade).to.equal(autoridade);
        expect(getTipoDocumentoUrn(urn(autoridade, 'decreto.legislativo')).urnAutoridade).to.equal(autoridade);
      });
    });

    it('lei em federal', () => {
      expect(getTipo(urn('federal', 'lei')).urnAutoridade).to.equal('federal');
    });
  });

  describe('fallback para outra autoridade', () => {
    it('camara.deputados:lei resolve pela federal', () => {
      expect(getTipo(urn('camara.deputados', 'lei')).urnAutoridade).to.equal('federal');
      expect(getTipoDocumentoUrn(urn('camara.deputados', 'lei')).descricao).to.equal('Lei');
    });

    it('senado.federal:projeto.lei.conversao;plv resolve pelo Congresso, com sigla PLV', () => {
      expect(getTipo(urn('senado.federal', 'projeto.lei.conversao;plv')).descricao).to.equal('Projeto de Lei de Conversão');
      expect(getSigla(urn('senado.federal', 'projeto.lei.conversao;plv'))).to.equal('PLV');
    });

    it('autoridade que não declara o tipo cai na primeira da ordem de mesclagem', () => {
      expect(getTipo(urn('federal', 'decreto.legislativo')).urnAutoridade).to.equal('senado.federal');
    });
  });

  describe('tipo desconhecido', () => {
    it('não resolve tipo nem sigla', () => {
      expect(getTipo(urn('federal', 'xyz'))).to.equal(undefined);
      expect(getTipoDocumentoUrn(urn('federal', 'xyz'))).to.equal(undefined);
      expect(getSigla(urn('federal', 'xyz'))).to.equal('');
    });

    it('getTipoDocumentoUrn sem URN devolve undefined', () => {
      expect(getTipoDocumentoUrn('')).to.equal(undefined);
    });
  });

  describe('sigla', () => {
    it('MPV federal vem da própria autoridade', () => {
      expect(getSigla(urn('federal', 'medida.provisoria;mpv'))).to.equal('MPV');
      expect(getSigla(urn('federal', 'medida.provisoria'))).to.equal('MPV');
    });

    it('MPV com autoridade antiga continua com sigla', () => {
      expect(getSigla(urn('senado.federal', 'medida.provisoria;mpv'))).to.equal('MPV');
    });

    it('tipo sem sigla devolve vazio', () => {
      expect(getSigla(urn('federal', 'lei'))).to.equal('');
      expect(getSigla(urn('federal', 'decreto'))).to.equal('');
    });
  });
});
