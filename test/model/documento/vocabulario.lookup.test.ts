import { expect } from '@open-wc/testing';
import { getSigla, getTipo, getTipoDocumentoUrn, validaUrn } from '../../../src/model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const urn = (autoridade: string, tipo: string): string => `urn:lex:br:${autoridade}:${tipo}:2026;1`;

[
  { casa: 'SF', autoridadesComDecreto: ['senado.federal', 'congresso.nacional'], outra: 'camara.deputados' },
  { casa: 'CD', autoridadesComDecreto: ['camara.deputados', 'congresso.nacional'], outra: 'senado.federal' },
].forEach(({ casa, autoridadesComDecreto, outra }) => {
  describe(`vocabulário — lookups pela autoridade da URN (${casa})`, () => {
    beforeEach(() => inicializarVocabulario(casa));
    after(() => inicializarVocabulario('SF'));

    describe('entrada da própria autoridade', () => {
      autoridadesComDecreto.forEach(autoridade => {
        it(`decreto.legislativo em ${autoridade}`, () => {
          expect(getTipo(urn(autoridade, 'decreto.legislativo')).urnAutoridade).to.equal(autoridade);
          expect(getTipoDocumentoUrn(urn(autoridade, 'decreto.legislativo')).urnAutoridade).to.equal(autoridade);
        });
      });

      it('lei em federal', () => {
        expect(getTipo(urn('federal', 'lei')).urnAutoridade).to.equal('federal');
      });
    });

    describe('sem fallback para outra autoridade', () => {
      it('lei em autoridade que não a declara não resolve', () => {
        expect(getTipo(urn(autoridadesComDecreto[0], 'lei'))).to.equal(undefined);
        expect(getTipoDocumentoUrn(urn(autoridadesComDecreto[0], 'lei'))).to.equal(undefined);
      });

      it('PLV só existe no Congresso Nacional', () => {
        expect(getTipo(urn(autoridadesComDecreto[0], 'projeto.lei.conversao;plv'))).to.equal(undefined);
        expect(getSigla(urn(autoridadesComDecreto[0], 'projeto.lei.conversao;plv'))).to.equal('');
        expect(getSigla(urn('congresso.nacional', 'projeto.lei.conversao;plv'))).to.equal('PLV');
      });

      it('decreto.legislativo na federal não cai na primeira autoridade da mesclagem', () => {
        expect(getTipo(urn('federal', 'decreto.legislativo'))).to.equal(undefined);
      });

      it('autoridade da outra casa resolve para a própria entrada', () => {
        expect(getTipo(urn(outra, 'decreto.legislativo')).urnAutoridade).to.equal(outra);
      });
    });

    describe('norma da outra casa', () => {
      it('Regimento Interno da Câmara resolve e é válido', () => {
        const u = 'urn:lex:br:camara.deputados:resolucao:1989-09-21;17';
        expect(getTipo(u).urnAutoridade).to.equal('camara.deputados');
        expect(getTipo(u).urn).to.equal('resolucao');
        expect(validaUrn(u)).to.equal(true);
      });

      it('Regimento Interno do Senado resolve e é válido', () => {
        const u = 'urn:lex:br:senado.federal:resolucao:1970-11-27;93';
        expect(getTipo(u).urnAutoridade).to.equal('senado.federal');
        expect(getTipo(u).urn).to.equal('resolucao');
        expect(validaUrn(u)).to.equal(true);
      });

      it('proposição da outra casa resolve para o tipo dela', () => {
        expect(getTipo(urn(outra, 'projeto.lei;pl')).urnAutoridade).to.equal(outra);
        expect(getSigla(urn(outra, 'projeto.lei;pl'))).to.equal('PL');
      });
    });

    describe('tipo sem sigla na URN', () => {
      it('medida provisória sem sigla resolve para MPV ativa', () => {
        const u = 'urn:lex:br:federal:medida.provisoria:2019-11-11;905';
        expect(getTipo(u).urn).to.equal('medida.provisoria;mpv');
        expect(getTipoDocumentoUrn(u).descricao).to.equal('Medida Provisória');
        expect(getSigla(u)).to.equal('MPV');
        expect(validaUrn(u)).to.equal(true);
      });

      it('com e sem sigla apontam para a mesma entrada ativa', () => {
        expect(getTipo('urn:lex:br:federal:medida.provisoria;mpv:2019;905')).to.equal(getTipo('urn:lex:br:federal:medida.provisoria:2019-11-11;905'));
        const autoridade = autoridadesComDecreto[0] === 'senado.federal' ? 'senado.federal' : 'camara.deputados';
        expect(getTipo(urn(autoridade, 'projeto.lei;pl'))).to.equal(getTipo(urn(autoridade, 'projeto.lei')));
        expect(getTipo(urn(autoridade, 'projeto.lei')).ativo).to.equal(true);
      });

      it('projeto de lei sem sigla resolve para o tipo ativo, não para o inativo', () => {
        const u = urn(autoridadesComDecreto[0] === 'senado.federal' ? 'senado.federal' : 'camara.deputados', 'projeto.lei');
        expect(getSigla(u)).to.equal('PL');
      });

      it('a autoridade continua obrigatória', () => {
        expect(getTipo(urn('federal', 'projeto.lei'))).to.equal(undefined);
      });

      it('na autoridade da outra casa, resolve para o tipo ativo dela', () => {
        expect(getTipo(urn(outra, 'projeto.lei')).urnAutoridade).to.equal(outra);
        expect(getSigla(urn(outra, 'projeto.lei'))).to.equal('PL');
      });

      it('norma declarada sem sigla tem precedência', () => {
        expect(getTipo(urn('federal', 'lei')).sigla).to.equal(undefined);
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
      });

      it('MPV com autoridade antiga não resolve', () => {
        expect(getSigla(urn('senado.federal', 'medida.provisoria;mpv'))).to.equal('');
      });

      it('tipo sem sigla devolve vazio', () => {
        expect(getSigla(urn('federal', 'lei'))).to.equal('');
        expect(getSigla(urn('federal', 'decreto'))).to.equal('');
      });
    });
  });
});
