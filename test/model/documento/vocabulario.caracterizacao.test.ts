import { expect } from '@open-wc/testing';
import { VOCABULARIO } from '../../../src/model/lexml/documento/vocabulario';
import { buildFakeUrn, getAutoridade, getPreambuloPadrao, getSigla, getTipo, getTipoDocumentoUrn } from '../../../src/model/lexml/documento/urnUtil';

// Fixa o comportamento do vocabulário antes e depois de separá-lo por autoridade (#1026).
// Os dados abaixo são literais de propósito: não leem o VOCABULARIO, para não compará-lo consigo mesmo.

const urn = (autoridade: string, tipo: string): string => `urn:lex:br:${autoridade}:${tipo}:2026;1`;

// tipo da URN → [descrição, gênero, sigla]
const TIPOS: Record<string, [string, string, string]> = {
  lei: ['Lei', 'F', ''],
  'lei.complementar': ['Lei Complementar', 'F', ''],
  'lei.delegada': ['Lei Delegada', 'F', ''],
  'decreto.legislativo': ['Decreto Legislativo', 'M', ''],
  'decreto.lei': ['Decreto-Lei', 'M', ''],
  decreto: ['Decreto', 'M', ''],
  'consolidacao.leis.trabalho': ['Consolidação das Leis do Trabalho', 'F', ''],
  resolucao: ['Resolução', 'F', ''],
  'regimento.interno': ['Regimento Interno', 'M', ''],
  constituicao: ['Constituição', 'F', ''],
  'ato.disposicoes.constitucionais.transitorias': ['Ato das Disposições Constitucionais Transitórias', 'M', ''],
  'medida.provisoria': ['Medida Provisória', 'F', 'MPV'],
  'medida.provisoria;mpv': ['Medida Provisória', 'F', 'MPV'],
  'emenda.constitucional': ['Emenda Constitucional', 'F', ''],
  'emenda.constitucional.revisao': ['Emenda Constitucional de Revisão', 'F', ''],
  'proposta.emenda.constitucional;pec': ['Proposta de Emenda Constitucional', 'F', 'PEC'],
  'projeto.lei;pl': ['Projeto de Lei', 'M', 'PL'],
  'projeto.lei;pls': ['Projeto de Lei do Senado', 'M', 'PLS'],
  'projeto.lei.complementar;plp': ['Projeto de Lei Complementar', 'M', 'PLP'],
  'projeto.lei.complementar;pl': ['Projeto de Lei Complementar', 'M', ''],
  'projeto.lei.complementar;pls': ['Projeto de Lei Complementar do Senado', 'M', ''],
  'projeto.lei;plc': ['Projeto de Lei da Câmara', 'M', 'PLC'],
  'projeto.lei.complementar;plc': ['Projeto de Lei Complementar da Câmara', 'M', ''],
  'projeto.lei.conversao;plv': ['Projeto de Lei de Conversão', 'M', 'PLV'],
  'projeto.resolucao;prs': ['Projeto de Resolução do Senado', 'M', 'PRS'],
  'projeto.decreto.legislativo;pds': ['Projeto de Decreto Legislativo', 'M', 'PDS'],
  'projeto.decreto.legislativo;pdl': ['Projeto de Decreto Legislativo', 'M', 'PDL'],
  'projeto.decreto.legislativo;pdn': ['Projeto de Decreto Legislativo do Congresso Nacional', 'M', 'PDN'],
  'projeto.resolucao;prn': ['Projeto de Resolução do Congresso Nacional', 'M', 'PRN'],
  'substitutivo.projeto.lei.senado;scd': ['Substitutivo da Câmara dos Deputados', 'M', 'SCD'],
  'emenda.projeto.lei.senado;ecd': ['Emenda(s) da Câmara dos Deputados', 'F', 'ECD'],
  'projeto.resolucao;prc': ['Projeto de Resolução da Câmara dos Deputados', 'M', 'PRC'],
};

// sigla → [autoridade, tipo] da URN de proposição nova
const FAKE_URNS: Record<string, [string, string]> = {
  PEC: ['senado.federal', 'proposta.emenda.constitucional;pec'],
  PL: ['senado.federal', 'projeto.lei;pl'],
  PLS: ['senado.federal', 'projeto.lei;pls'],
  PLP: ['senado.federal', 'projeto.lei.complementar;plp'],
  PLC: ['senado.federal', 'projeto.lei;plc'],
  PRS: ['senado.federal', 'projeto.resolucao;prs'],
  PDS: ['senado.federal', 'projeto.decreto.legislativo;pds'],
  PDL: ['senado.federal', 'projeto.decreto.legislativo;pdl'],
  SCD: ['senado.federal', 'substitutivo.projeto.lei.senado;scd'],
  ECD: ['senado.federal', 'emenda.projeto.lei.senado;ecd'],
  PDN: ['congresso.nacional', 'projeto.decreto.legislativo;pdn'],
  PRN: ['congresso.nacional', 'projeto.resolucao;prn'],
  PRC: ['camara.deputados', 'projeto.resolucao;prc'],
};

const AUTORIDADES = ['federal', 'senado.federal', 'congresso.nacional', 'camara.deputados'];

const decreta = 'O CONGRESSO NACIONAL decreta:';
const PEC_TEXTO =
  'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:';
const MPV_TEXTO = 'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:';

describe('vocabulário — caracterização (#1026)', () => {
  describe('tipos de documento', () => {
    Object.entries(TIPOS).forEach(([tipo, [descricao, genero, sigla]]) => {
      it(`${tipo}: descrição, gênero e sigla`, () => {
        const u = urn('federal', tipo);
        expect(getTipo(u)?.urn).to.equal(tipo);
        expect(getTipo(u)?.descricao).to.equal(descricao);
        expect(getTipo(u)?.genero).to.equal(genero);
        expect(getTipoDocumentoUrn(u)?.descricao).to.equal(descricao);
        expect(getSigla(u)).to.equal(sigla);
      });
    });

    it('tipo desconhecido não resolve', () => {
      expect(getTipo(urn('federal', 'xyz'))).to.equal(undefined);
      expect(getTipoDocumentoUrn(urn('federal', 'xyz'))).to.equal(undefined);
      expect(getSigla(urn('federal', 'xyz'))).to.equal('');
    });
  });

  describe('autoridade cruzada que hoje resolve', () => {
    it('camara.deputados:lei', () => {
      expect(getTipo(urn('camara.deputados', 'lei'))?.descricao).to.equal('Lei');
      expect(getAutoridade(urn('camara.deputados', 'lei'))?.urn).to.equal('camara.deputados');
    });

    it('senado.federal:projeto.lei.conversao;plv', () => {
      expect(getTipo(urn('senado.federal', 'projeto.lei.conversao;plv'))?.descricao).to.equal('Projeto de Lei de Conversão');
      expect(getSigla(urn('senado.federal', 'projeto.lei.conversao;plv'))).to.equal('PLV');
    });

    it('senado.federal:medida.provisoria;mpv', () => {
      expect(getTipo(urn('senado.federal', 'medida.provisoria;mpv'))?.descricao).to.equal('Medida Provisória');
      expect(getSigla(urn('senado.federal', 'medida.provisoria;mpv'))).to.equal('MPV');
    });

    it('congresso.nacional:decreto.legislativo e senado.federal:resolucao', () => {
      expect(getTipo(urn('congresso.nacional', 'decreto.legislativo'))?.genero).to.equal('M');
      expect(getTipo(urn('senado.federal', 'resolucao'))?.genero).to.equal('F');
    });

    it('autoridade desconhecida não resolve', () => {
      expect(getAutoridade(urn('xyz', 'lei'))).to.equal(undefined);
    });
  });

  describe('autoridades', () => {
    AUTORIDADES.forEach(a => it(a, () => expect(getAutoridade(urn(a, 'lei'))?.urn).to.equal(a)));
  });

  describe('URN de proposição nova (buildFakeUrn)', () => {
    Object.entries(FAKE_URNS).forEach(([sigla, [autoridade, tipo]]) => {
      it(sigla, () => {
        expect(buildFakeUrn(sigla, '1', '2026')).to.equal(`urn:lex:br:${autoridade}:${tipo}:2026;1`);
        expect(buildFakeUrn(sigla.toLowerCase(), '1', '2026')).to.equal(`urn:lex:br:${autoridade}:${tipo}:2026;1`);
      });
    });

    it('sigla desconhecida lança', () => {
      expect(() => buildFakeUrn('XYZ', '1', '2026')).to.throw();
    });
  });

  describe('preâmbulo padrão preservado', () => {
    const preservados: [string, string, string][] = [
      ...['senado.federal', 'camara.deputados', 'congresso.nacional'].flatMap(a => [
        [a, 'projeto.lei;pl', decreta] as [string, string, string],
        [a, 'projeto.decreto.legislativo;pdl', decreta] as [string, string, string],
      ]),
      ...['senado.federal', 'camara.deputados'].flatMap(a => [
        [a, 'projeto.lei.complementar;plp', decreta] as [string, string, string],
        [a, 'proposta.emenda.constitucional;pec', PEC_TEXTO] as [string, string, string],
      ]),
      ['federal', 'medida.provisoria;mpv', MPV_TEXTO],
      ['senado.federal', 'projeto.resolucao;prs', 'O SENADO FEDERAL resolve:'],
      ['camara.deputados', 'projeto.resolucao;prc', 'A CÂMARA DOS DEPUTADOS resolve:'],
      ['congresso.nacional', 'projeto.resolucao;prn', 'O CONGRESSO NACIONAL resolve:'],
    ];
    preservados.forEach(([autoridade, tipo, texto]) => {
      it(`${autoridade}:${tipo}`, () => expect(getPreambuloPadrao(urn(autoridade, tipo))).to.equal(texto));
    });

    it('tipo sem texto padrão', () => {
      expect(getPreambuloPadrao(urn('federal', 'lei'))).to.equal(undefined);
      expect(getPreambuloPadrao(urn('senado.federal', 'substitutivo.projeto.lei.senado;scd'))).to.equal(undefined);
    });
  });

  describe('invariantes do vocabulário', () => {
    it('uma só entrada por sigla em fakeUrns', () => {
      const siglas = VOCABULARIO.fakeUrns.map(f => f.sigla);
      expect(new Set(siglas).size).to.equal(siglas.length);
    });

    it('cópias do mesmo tipo têm descrição e gênero idênticos', () => {
      const porUrn = new Map<string, { descricao: string; genero: string }>();
      VOCABULARIO.tiposDocumento.forEach(t => {
        const anterior = porUrn.get(t.urn);
        if (anterior) {
          expect(t.descricao, t.urn).to.equal(anterior.descricao);
          expect(t.genero, t.urn).to.equal(anterior.genero);
        }
        porUrn.set(t.urn, t);
      });
    });

    it('todo tipo do teste existe no vocabulário e vice-versa', () => {
      const urns = new Set(VOCABULARIO.tiposDocumento.map(t => t.urn));
      expect([...urns].sort()).to.deep.equal(Object.keys(TIPOS).sort());
    });

    it('fakeUrns tem as siglas esperadas mais MPV e PLV', () => {
      const siglas = VOCABULARIO.fakeUrns.map(f => f.sigla).sort();
      expect(siglas).to.deep.equal([...Object.keys(FAKE_URNS), 'MPV', 'PLV'].sort());
    });
  });

  // Mudanças deliberadas da change: falham contra o vocabulário antigo e passam após a migração.
  describe('mudanças esperadas pela change (valem após a migração)', () => {
    it('MPV nova usa a autoridade federal', () => {
      expect(buildFakeUrn('MPV', '1', '2026')).to.equal('urn:lex:br:federal:medida.provisoria;mpv:2026;1');
    });

    it('PLV novo usa a autoridade congresso.nacional', () => {
      expect(buildFakeUrn('PLV', '1', '2026')).to.equal('urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;1');
    });

    it('PLV e MPV antigos continuam resolvendo tipo e sigla', () => {
      expect(getSigla(urn('senado.federal', 'projeto.lei.conversao;plv'))).to.equal('PLV');
      expect(getSigla(urn('federal', 'medida.provisoria;mpv'))).to.equal('MPV');
    });

    it('PLV tem preâmbulo no Congresso', () => {
      expect(getPreambuloPadrao(urn('congresso.nacional', 'projeto.lei.conversao;plv'))).to.equal(decreta);
    });

    const semTexto: [string, string][] = [
      ['senado.federal', 'projeto.lei.conversao;plv'],
      ['camara.deputados', 'projeto.lei.conversao;plv'],
      ['senado.federal', 'medida.provisoria;mpv'],
      ['camara.deputados', 'medida.provisoria;mpv'],
      ['federal', 'projeto.lei;pl'],
      ['federal', 'projeto.lei.complementar;plp'],
      ['federal', 'projeto.lei.conversao;plv'],
      ['federal', 'projeto.decreto.legislativo;pdl'],
      ['federal', 'proposta.emenda.constitucional;pec'],
      ['federal', 'projeto.resolucao;prs'],
      ['congresso.nacional', 'projeto.lei.complementar;plp'],
      ['congresso.nacional', 'proposta.emenda.constitucional;pec'],
      ['congresso.nacional', 'medida.provisoria;mpv'],
    ];
    semTexto.forEach(([autoridade, tipo]) => {
      it(`sem preâmbulo padrão em ${autoridade}:${tipo}`, () => expect(getPreambuloPadrao(urn(autoridade, tipo))).to.equal(undefined));
    });
  });
});
