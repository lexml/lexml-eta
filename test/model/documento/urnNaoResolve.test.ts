import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import {
  getNomeExtenso,
  getNomeExtensoComDataExtenso,
  getPreambuloPadrao,
  getSigla,
  getTipo,
  validaUrn,
  verificarUrnDaCasaDoEditor,
} from '../../../src/model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const URN_PLV_SENADO = 'urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1';
const URN_PL_SENADO = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';
const URN_PL_CAMARA = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;1';

const documentoCom = (urn: string): any => {
  const documento = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
  documento.value.metadado.identificacao.urn = urn;
  return documento;
};

describe('URN que não resolve no vocabulário', () => {
  afterEach(() => inicializarVocabulario('SF'));

  [
    ['SF', URN_PLV_SENADO],
    ['CD', URN_PLV_SENADO],
  ].forEach(([casa, urn]) => {
    describe(`${casa} com ${urn}`, () => {
      beforeEach(() => inicializarVocabulario(casa));

      it('não resolve tipo nem sigla e a validação falha', () => {
        expect(getTipo(urn)).to.equal(undefined);
        expect(getSigla(urn)).to.equal('');
        expect(validaUrn(urn)).to.equal(false);
      });

      it('os nomes por extenso não lançam exceção', () => {
        expect(() => getNomeExtenso(urn)).to.not.throw();
        expect(() => getNomeExtensoComDataExtenso(urn)).to.not.throw();
      });

      it('não há preâmbulo padrão', () => {
        expect(getPreambuloPadrao(urn)).to.equal(undefined);
      });

      it('a carga do documento não lança exceção e não cria preâmbulo nem epígrafe', () => {
        const projetoNorma = buildProjetoNormaFromJsonix(documentoCom(urn));
        expect(projetoNorma.tipo).to.equal(undefined);
        expect(projetoNorma.preambulo).to.equal(undefined);
      });
    });
  });

  it('a URN do Senado resolve e tem preâmbulo', () => {
    inicializarVocabulario('SF');
    expect(getPreambuloPadrao(URN_PL_SENADO)).to.equal('O CONGRESSO NACIONAL decreta:');
    expect(getPreambuloPadrao('urn:lex:br:senado.federal:medida.provisoria;mpv:2026;1')).to.equal(undefined);
  });
});

describe('URN da outra casa', () => {
  afterEach(() => inicializarVocabulario('SF'));

  [
    ['SF', URN_PL_CAMARA, 'camara.deputados'],
    ['CD', URN_PL_SENADO, 'senado.federal'],
  ].forEach(([casa, urn, autoridade]) => {
    describe(`${casa} com ${urn}`, () => {
      beforeEach(() => inicializarVocabulario(casa));

      it('resolve tipo e sigla pela autoridade da URN e é válida', () => {
        expect(getTipo(urn)?.urnAutoridade).to.equal(autoridade);
        expect(getSigla(urn)).to.equal('PL');
        expect(validaUrn(urn)).to.equal(true);
      });

      it('tem o preâmbulo padrão da própria autoridade', () => {
        expect(getPreambuloPadrao(urn)).to.equal('O CONGRESSO NACIONAL decreta:');
      });

      it('a conversão do documento resolve o tipo', () => {
        expect(buildProjetoNormaFromJsonix(documentoCom(urn)).tipo?.urn).to.equal('projeto.lei;pl');
      });

      it('como documento em edição, é recusada', () => {
        expect(() => verificarUrnDaCasaDoEditor(urn)).to.throw(`Documento de outra casa legislativa não é suportado neste editor (autoridade '${autoridade}').`);
      });
    });
  });
});

describe('Documento em edição da casa do editor', () => {
  afterEach(() => inicializarVocabulario('SF'));

  [
    ['SF', URN_PL_SENADO],
    ['CD', URN_PL_CAMARA],
    ['SF', 'urn:lex:br:federal:medida.provisoria;mpv:2026;1'],
    ['CD', 'urn:lex:br:federal:medida.provisoria;mpv:2026;1'],
    ['SF', 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;1'],
    ['CD', 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;1'],
  ].forEach(([casa, urn]) => {
    it(`${casa}: aceita ${urn}`, () => {
      inicializarVocabulario(casa);
      expect(() => verificarUrnDaCasaDoEditor(urn)).to.not.throw();
    });
  });

  it('recusa autoridade desconhecida', () => {
    expect(() => verificarUrnDaCasaDoEditor('urn:lex:br:xyz:lei:2026;1')).to.throw(/autoridade 'xyz'/);
  });
});
