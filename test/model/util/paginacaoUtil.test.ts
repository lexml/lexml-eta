import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { PLP_68_2024 } from '../../../demo/doc/plp_68_2024';
import { configurarPaginacao } from '../../../src/redux/elemento/util/paginacaoUtil';
import { Paginacao } from '../../../src/redux/state';

let articulacao: Articulacao;
let dispositivos: Dispositivo[];
let paginacao: Paginacao | undefined;

const isIdArtigo = (id: string | undefined): boolean => !!id?.match(/^art\d+$/);

describe('Testando paginação de uma articulação', () => {
  beforeEach(() => {
    articulacao = buildProjetoNormaFromJsonix(PLP_68_2024).articulacao!;
    dispositivos = getDispositivoAndFilhosAsLista(articulacao);
  });

  it('Deveria possuir 3610 dispositivos na articulação', () => {
    expect(dispositivos.length).to.be.equal(3610);
  });

  describe('configurarPaginacao - Passando range de artigos', () => {
    beforeEach(() => {
      paginacao = configurarPaginacao(articulacao, {
        rangeArtigos: [
          { numInicial: 1, numFinal: 160 },
          { numInicial: 161, numFinal: 392 },
          { numInicial: 393, numFinal: 499 },
        ],
      });
    });

    it('Deveria possuir 3 páginas', () => {
      expect(paginacao?.paginasArticulacao?.length).to.be.equal(3);
    });

    it('Deveria possuir 160 artigos na primeira página', () => {
      // expect(paginacao?.paginasArticulacao?.[0].dispositivos.filter(d => isArtigo(d) && !isDispositivoAlteracao(d)).length).to.be.equal(160);
      expect(paginacao?.paginasArticulacao?.[0].ids.filter(isIdArtigo).length).to.be.equal(160);
    });

    it('Deveria possuir 232 artigos na segunda página', () => {
      // expect(paginacao?.paginasArticulacao?.[1].dispositivos.filter(d => isArtigo(d) && !isDispositivoAlteracao(d)).length).to.be.equal(232);
      expect(paginacao?.paginasArticulacao?.[1].ids.filter(isIdArtigo).length).to.be.equal(232);
    });

    it('Deveria possuir 107 artigos na terceira página', () => {
      // expect(paginacao?.paginasArticulacao?.[2].dispositivos.filter(d => isArtigo(d) && !isDispositivoAlteracao(d)).length).to.be.equal(107);
      expect(paginacao?.paginasArticulacao?.[2].ids.filter(isIdArtigo).length).to.be.equal(107);
    });
  });

  describe('configurarPaginacao - Passando maxItensPorPagina = 700', () => {
    beforeEach(() => {
      paginacao = configurarPaginacao(articulacao, {
        maxItensPorPagina: 700,
      });
    });

    it('Deveria possuir 6 páginas', () => {
      expect(paginacao?.paginasArticulacao?.length).to.be.equal(6);
    });
  });

  describe('configurarPaginacao - Passando maxItensPorPagina = 850', () => {
    beforeEach(() => {
      paginacao = configurarPaginacao(articulacao, {
        maxItensPorPagina: 850,
      });
    });

    it('Deveria possuir 5 páginas', () => {
      expect(paginacao?.paginasArticulacao?.length).to.be.equal(5);
    });
  });
});
