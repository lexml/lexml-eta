import { expect } from '@open-wc/testing';
import { buildFakeUrn, getAutoridade, getPreambuloPadrao, getSigla, getTipo, getTipoDocumentoUrn, validaUrn } from '../../../src/model/lexml/documento/urnUtil';
import { getVocabularioCompleto, getVocabularioDaCasa, inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

// Fixa o vocabulário de cada casa (#1026). Os dados abaixo são literais de propósito: não leem o vocabulário, para não compará-lo consigo mesmo.

const urn = (autoridade: string, tipo: string): string => `urn:lex:br:${autoridade}:${tipo}:2026;1`;

// [descrição, gênero, sigla, ativo]
type Tipo = [string, string, string, boolean];

const FEDERAL: Record<string, Tipo> = {
  lei: ['Lei', 'F', '', true],
  'lei.complementar': ['Lei Complementar', 'F', '', true],
  'lei.delegada': ['Lei Delegada', 'F', '', true],
  'decreto.lei': ['Decreto-Lei', 'M', '', true],
  decreto: ['Decreto', 'M', '', true],
  'consolidacao.leis.trabalho': ['Consolidação das Leis do Trabalho', 'F', '', true],
  constituicao: ['Constituição', 'F', '', true],
  'ato.disposicoes.constitucionais.transitorias': ['Ato das Disposições Constitucionais Transitórias', 'M', '', true],
  'emenda.constitucional': ['Emenda Constitucional', 'F', '', true],
  'emenda.constitucional.revisao': ['Emenda Constitucional de Revisão', 'F', '', true],
  'medida.provisoria;mpv': ['Medida Provisória', 'F', 'MPV', true],
};

const CONGRESSO: Record<string, Tipo> = {
  'decreto.legislativo': ['Decreto Legislativo', 'M', '', true],
  resolucao: ['Resolução', 'F', '', true],
  'projeto.resolucao;prn': ['Projeto de Resolução do Congresso Nacional', 'M', 'PRN', true],
  'projeto.lei;pln': ['Projeto de Lei do Congresso Nacional', 'M', 'PLN', true],
  'projeto.lei.conversao;plv': ['Projeto de Lei de Conversão', 'M', 'PLV', true],
  'projeto.decreto.legislativo;pdn': ['Projeto de Decreto Legislativo do Congresso Nacional', 'M', 'PDN', true],
};

const SENADO: Record<string, Tipo> = {
  'decreto.legislativo': ['Decreto Legislativo', 'M', '', true],
  'regimento.interno': ['Regimento Interno', 'M', '', true],
  resolucao: ['Resolução', 'F', '', true],
  'proposta.emenda.constitucional;pec': ['Proposta de Emenda Constitucional', 'F', 'PEC', true],
  'projeto.lei;pl': ['Projeto de Lei', 'M', 'PL', true],
  'projeto.lei;pls': ['Projeto de Lei do Senado', 'M', 'PLS', false],
  'projeto.lei;plc': ['Projeto de Lei da Câmara', 'M', 'PLC', false],
  'projeto.lei.complementar;plp': ['Projeto de Lei Complementar', 'M', 'PLP', true],
  'projeto.lei.complementar;pls': ['Projeto de Lei Complementar do Senado', 'M', 'PLS', false],
  'projeto.lei.complementar;plc': ['Projeto de Lei Complementar da Câmara', 'M', 'PLC', false],
  'projeto.resolucao;prs': ['Projeto de Resolução do Senado', 'M', 'PRS', true],
  'projeto.decreto.legislativo;pds': ['Projeto de Decreto Legislativo', 'M', 'PDS', false],
  'projeto.decreto.legislativo;pdl': ['Projeto de Decreto Legislativo', 'M', 'PDL', true],
};

const CAMARA: Record<string, Tipo> = {
  'decreto.legislativo': ['Decreto Legislativo', 'M', '', true],
  'regimento.interno': ['Regimento Interno', 'M', '', true],
  resolucao: ['Resolução', 'F', '', true],
  'proposta.emenda.constitucional;pec': ['Proposta de Emenda Constitucional', 'F', 'PEC', true],
  'projeto.lei;pl': ['Projeto de Lei', 'M', 'PL', true],
  'projeto.lei.complementar;plp': ['Projeto de Lei Complementar', 'M', 'PLP', true],
  'projeto.resolucao;prc': ['Projeto de Resolução', 'M', 'PRC', true],
  'substitutivo;sbt': ['Substitutivo', 'M', 'SBT', true],
  'subemenda.substitutiva;pep': ['Subemenda Substitutiva', 'M', 'PEP', true],
};

const decreta = 'O CONGRESSO NACIONAL decreta:';
const PEC_TEXTO =
  'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:';
const MPV_TEXTO = 'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:';

interface Casa {
  nome: 'SF' | 'CD';
  proprio: [string, Record<string, Tipo>];
  autoridades: string[];
  // sigla → [autoridade, tipo] da URN de proposição nova
  fakeUrns: Record<string, [string, string]>;
  comPreambulo: [string, string, string][];
  semPreambulo: [string, string][];
  // [autoridade, tipo, sigla]: da outra casa, resolvem pela visão completa.
  daOutraCasa: [string, string, string][];
}

const CASAS: Casa[] = [
  {
    nome: 'SF',
    proprio: ['senado.federal', SENADO],
    autoridades: ['federal', 'senado.federal', 'congresso.nacional'],
    fakeUrns: {
      PEC: ['senado.federal', 'proposta.emenda.constitucional;pec'],
      PL: ['senado.federal', 'projeto.lei;pl'],
      PLP: ['senado.federal', 'projeto.lei.complementar;plp'],
      PRS: ['senado.federal', 'projeto.resolucao;prs'],
      PDL: ['senado.federal', 'projeto.decreto.legislativo;pdl'],
      PRN: ['congresso.nacional', 'projeto.resolucao;prn'],
      PLN: ['congresso.nacional', 'projeto.lei;pln'],
      PLV: ['congresso.nacional', 'projeto.lei.conversao;plv'],
      PDN: ['congresso.nacional', 'projeto.decreto.legislativo;pdn'],
      MPV: ['federal', 'medida.provisoria;mpv'],
    },
    comPreambulo: [
      ['senado.federal', 'projeto.lei;pl', decreta],
      ['senado.federal', 'projeto.lei.complementar;plp', decreta],
      ['senado.federal', 'projeto.decreto.legislativo;pdl', decreta],
      ['senado.federal', 'proposta.emenda.constitucional;pec', PEC_TEXTO],
      ['senado.federal', 'projeto.resolucao;prs', 'O SENADO FEDERAL resolve:'],
      ['congresso.nacional', 'projeto.lei;pln', decreta],
      ['congresso.nacional', 'projeto.lei.conversao;plv', decreta],
      ['congresso.nacional', 'projeto.decreto.legislativo;pdn', decreta],
      ['congresso.nacional', 'projeto.resolucao;prn', 'O CONGRESSO NACIONAL resolve:'],
      ['federal', 'medida.provisoria;mpv', MPV_TEXTO],
    ],
    semPreambulo: [
      ['senado.federal', 'projeto.lei.conversao;plv'],
      ['senado.federal', 'medida.provisoria;mpv'],
      ['federal', 'projeto.lei;pl'],
      ['federal', 'projeto.resolucao;prs'],
      ['congresso.nacional', 'projeto.lei.complementar;plp'],
      ['congresso.nacional', 'proposta.emenda.constitucional;pec'],
      ['congresso.nacional', 'medida.provisoria;mpv'],
      ['federal', 'lei'],
    ],
    daOutraCasa: [
      ['camara.deputados', 'projeto.lei;pl', 'PL'],
      ['camara.deputados', 'substitutivo;sbt', 'SBT'],
      ['camara.deputados', 'projeto.resolucao;prc', 'PRC'],
      ['camara.deputados', 'regimento.interno', ''],
      ['camara.deputados', 'resolucao', ''],
    ],
  },
  {
    nome: 'CD',
    proprio: ['camara.deputados', CAMARA],
    autoridades: ['federal', 'camara.deputados', 'congresso.nacional'],
    fakeUrns: {
      PEC: ['camara.deputados', 'proposta.emenda.constitucional;pec'],
      PL: ['camara.deputados', 'projeto.lei;pl'],
      PLP: ['camara.deputados', 'projeto.lei.complementar;plp'],
      PRC: ['camara.deputados', 'projeto.resolucao;prc'],
      SBT: ['camara.deputados', 'substitutivo;sbt'],
      PEP: ['camara.deputados', 'subemenda.substitutiva;pep'],
      PRN: ['congresso.nacional', 'projeto.resolucao;prn'],
      PLN: ['congresso.nacional', 'projeto.lei;pln'],
      PLV: ['congresso.nacional', 'projeto.lei.conversao;plv'],
      PDN: ['congresso.nacional', 'projeto.decreto.legislativo;pdn'],
      MPV: ['federal', 'medida.provisoria;mpv'],
    },
    comPreambulo: [
      ['camara.deputados', 'projeto.lei;pl', decreta],
      ['camara.deputados', 'projeto.lei.complementar;plp', decreta],
      ['camara.deputados', 'proposta.emenda.constitucional;pec', PEC_TEXTO],
      ['camara.deputados', 'projeto.resolucao;prc', 'A CÂMARA DOS DEPUTADOS resolve:'],
      ['congresso.nacional', 'projeto.lei.conversao;plv', decreta],
      ['federal', 'medida.provisoria;mpv', MPV_TEXTO],
    ],
    semPreambulo: [
      ['camara.deputados', 'projeto.lei.conversao;plv'],
      ['camara.deputados', 'medida.provisoria;mpv'],
      ['camara.deputados', 'substitutivo;sbt'],
      ['federal', 'projeto.lei;pl'],
      ['congresso.nacional', 'proposta.emenda.constitucional;pec'],
    ],
    daOutraCasa: [
      ['senado.federal', 'projeto.lei;pl', 'PL'],
      ['senado.federal', 'projeto.resolucao;prs', 'PRS'],
      ['senado.federal', 'resolucao', ''],
    ],
  },
];

CASAS.forEach(casa => {
  describe(`vocabulário — caracterização de ${casa.nome} (#1026)`, () => {
    before(() => inicializarVocabulario(casa.nome));
    after(() => inicializarVocabulario('SF'));

    const esperados: [string, string, Tipo][] = [
      ...Object.entries(FEDERAL).map(([t, d]): [string, string, Tipo] => ['federal', t, d]),
      ...Object.entries(casa.proprio[1]).map(([t, d]): [string, string, Tipo] => [casa.proprio[0], t, d]),
      ...Object.entries(CONGRESSO).map(([t, d]): [string, string, Tipo] => ['congresso.nacional', t, d]),
    ];

    describe('tipos de documento', () => {
      esperados.forEach(([autoridade, tipo, [descricao, genero, sigla, ativo]]) => {
        it(`${autoridade}:${tipo}`, () => {
          const u = urn(autoridade, tipo);
          const resolvido = getTipo(u);
          expect(resolvido?.urnAutoridade).to.equal(autoridade);
          expect(resolvido?.descricao).to.equal(descricao);
          expect(resolvido?.genero).to.equal(genero);
          expect(getTipoDocumentoUrn(u)?.descricao).to.equal(descricao);
          expect(getSigla(u)).to.equal(sigla);
          if (sigla) expect(resolvido?.ativo).to.equal(ativo);
        });
      });

      it('tipo desconhecido não resolve', () => {
        expect(getTipo(urn('federal', 'xyz'))).to.equal(undefined);
        expect(getTipoDocumentoUrn(urn('federal', 'xyz'))).to.equal(undefined);
        expect(getSigla(urn('federal', 'xyz'))).to.equal('');
      });

      casa.daOutraCasa.forEach(([autoridade, tipo, sigla]) => {
        it(`${autoridade}:${tipo} é da outra casa e resolve`, () => {
          const u = urn(autoridade, tipo);
          expect(getTipo(u)?.urnAutoridade).to.equal(autoridade);
          expect(getTipo(u)?.urn).to.equal(tipo);
          expect(getSigla(u)).to.equal(sigla);
          expect(validaUrn(u)).to.equal(true);
        });
      });
    });

    describe('autoridades', () => {
      casa.autoridades.forEach(a => it(a, () => expect(getAutoridade(urn(a, 'lei'))?.urn).to.equal(a)));

      it('autoridade desconhecida não resolve', () => {
        expect(getAutoridade(urn('xyz', 'lei'))).to.equal(undefined);
      });

      it('autoridade da outra casa resolve', () => {
        const outra = casa.nome === 'SF' ? 'camara.deputados' : 'senado.federal';
        expect(getAutoridade(urn(outra, 'lei'))?.urn).to.equal(outra);
      });
    });

    describe('URN de proposição nova (buildFakeUrn)', () => {
      Object.entries(casa.fakeUrns).forEach(([sigla, [autoridade, tipo]]) => {
        it(sigla, () => {
          expect(buildFakeUrn(sigla, '1', '2026')).to.equal(`urn:lex:br:${autoridade}:${tipo}:2026;1`);
          expect(buildFakeUrn(sigla.toLowerCase(), '1', '2026')).to.equal(`urn:lex:br:${autoridade}:${tipo}:2026;1`);
        });
      });

      it('sigla desconhecida ou inativa lança', () => {
        expect(() => buildFakeUrn('XYZ', '1', '2026')).to.throw();
        expect(() => buildFakeUrn('PLS', '1', '2026')).to.throw();
      });
    });

    describe('preâmbulo padrão', () => {
      casa.comPreambulo.forEach(([autoridade, tipo, texto]) => {
        it(`${autoridade}:${tipo}`, () => expect(getPreambuloPadrao(urn(autoridade, tipo))).to.equal(texto));
      });

      casa.semPreambulo.forEach(([autoridade, tipo]) => {
        it(`sem texto em ${autoridade}:${tipo}`, () => expect(getPreambuloPadrao(urn(autoridade, tipo))).to.equal(undefined));
      });
    });

    describe('invariantes do vocabulário', () => {
      it('as entradas do vocabulário são exatamente as esperadas', () => {
        const reais = getVocabularioDaCasa()
          .tiposDocumento.map(t => `${t.urnAutoridade}:${t.urn}`)
          .sort();
        expect(reais).to.deep.equal(esperados.map(([a, t]) => `${a}:${t}`).sort());
      });

      it('uma só proposição ativa por sigla', () => {
        const siglas = getVocabularioDaCasa().tiposDocumentoAtivos.map(t => t.sigla);
        expect(new Set(siglas).size).to.equal(siglas.length);
      });

      it('cópias do mesmo tipo têm descrição e gênero idênticos', () => {
        const porTipo = new Map<string, { descricao: string; genero: string }>();
        getVocabularioDaCasa().tiposDocumento.forEach(t => {
          const anterior = porTipo.get(t.urn);
          if (anterior) {
            expect(t.descricao, t.urn).to.equal(anterior.descricao);
            expect(t.genero, t.urn).to.equal(anterior.genero);
          }
          porTipo.set(t.urn, t);
        });
      });

      it('só os tipos de autoridade da casa estão presentes', () => {
        const autoridades = new Set(getVocabularioDaCasa().tiposDocumento.map(t => t.urnAutoridade));
        expect([...autoridades].sort()).to.deep.equal([...casa.autoridades].sort());
      });
    });
  });
});

describe('vocabulário — mudanças deliberadas da change (#1026)', () => {
  after(() => inicializarVocabulario('SF'));

  ['SF', 'CD'].forEach(nome => {
    it(`${nome}: MPV nova usa a autoridade federal`, () => {
      inicializarVocabulario(nome);
      expect(buildFakeUrn('MPV', '1', '2026')).to.equal('urn:lex:br:federal:medida.provisoria;mpv:2026;1');
    });

    it(`${nome}: PLV novo usa a autoridade congresso.nacional`, () => {
      inicializarVocabulario(nome);
      expect(buildFakeUrn('PLV', '1', '2026')).to.equal('urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;1');
    });

    it(`${nome}: PLV com autoridade antiga (senado.federal) não resolve mais`, () => {
      inicializarVocabulario(nome);
      expect(getSigla(urn('senado.federal', 'projeto.lei.conversao;plv'))).to.equal('');
    });
  });
});

describe('vocabulário — visão completa', () => {
  afterEach(() => inicializarVocabulario('SF'));

  it('tem tipos das quatro autoridades', () => {
    const autoridades = new Set(getVocabularioCompleto().tiposDocumento.map(t => t.urnAutoridade));
    expect([...autoridades].sort()).to.deep.equal(['camara.deputados', 'congresso.nacional', 'federal', 'senado.federal']);
  });

  it('não muda ao reinicializar a casa do editor', () => {
    inicializarVocabulario('SF');
    const completa = getVocabularioCompleto();
    inicializarVocabulario('CD');
    expect(getVocabularioCompleto()).to.equal(completa);
    expect(getVocabularioDaCasa().autoridades.map(a => a.urn)).to.include('camara.deputados');
  });
});

describe('vocabulário — reinicialização da visão da casa', () => {
  afterEach(() => inicializarVocabulario('SF'));

  it('a mesma casa não remonta a visão', () => {
    const primeira = inicializarVocabulario('CD');
    expect(inicializarVocabulario('CD')).to.equal(primeira);
    expect(getVocabularioDaCasa()).to.equal(primeira);
  });

  it('outra casa remonta a visão', () => {
    const cd = inicializarVocabulario('CD');
    const sf = inicializarVocabulario('SF');
    expect(sf).to.not.equal(cd);
    expect(sf.autoridades.map(a => a.urn)).to.include('senado.federal');
  });

  it('casa inválida reaproveita a visão de SF já montada', () => {
    const sf = inicializarVocabulario('SF');
    expect(inicializarVocabulario('XX')).to.equal(sf);
  });
});
