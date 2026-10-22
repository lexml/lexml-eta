import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { getNomeExtenso, getNomeExtensoComDataExtenso, getPreambuloPadrao, getSigla, getTipo, validaUrn } from '../../../src/model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const URN_PLV_SENADO = 'urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1';
const URN_PL_SENADO = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';
const URN_PL_CAMARA = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;1';

const documentoCom = (urn: string): any => {
  const documento = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
  documento.value.metadado.identificacao.urn = urn;
  return documento;
};

describe('URN que não resolve no vocabulário da casa', () => {
  afterEach(() => inicializarVocabulario('SF'));

  [
    ['SF', URN_PLV_SENADO],
    ['SF', URN_PL_CAMARA],
    ['CD', URN_PL_SENADO],
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

  it('a mesma URN do Senado resolve em SF e tem preâmbulo', () => {
    inicializarVocabulario('SF');
    expect(getPreambuloPadrao(URN_PL_SENADO)).to.equal('O CONGRESSO NACIONAL decreta:');
    expect(getPreambuloPadrao('urn:lex:br:senado.federal:medida.provisoria;mpv:2026;1')).to.equal(undefined);
  });
});
