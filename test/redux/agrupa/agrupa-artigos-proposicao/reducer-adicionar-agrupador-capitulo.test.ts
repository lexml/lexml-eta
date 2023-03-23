// import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { MPV_905_2019 } from '../../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';

import { State } from '../../../../src/redux/state';
// import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
// import { REMOVER_ELEMENTO } from '../../../../src/model/lexml/acao/removerElementoAction';
// import { removeElemento } from '../../../../src/redux/elemento/reducer/removeElemento';
// import { undo } from '../../../../src/redux/elemento/reducer/undo';
// import { redo } from '../../../../src/redux/elemento/reducer/redo';

let state: State;
let idsArtigos = '';

describe('Testando a inclusão de agrupadores capítulo antes e depois a partir do Capítulo I', () => {
  describe('Carregando texto da MPV 905/2019', () => {
    beforeEach(function () {
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
      state = openArticulacaoAction(projetoNorma.articulacao!);
      state.ui = {} as any;
      idsArtigos = state.articulacao!.artigos.map(a => a.id).join(',');
    });

    it('Deveria possuir articulação com 7 capítulos filhos', () => {
      const nFilhos = state.articulacao?.filhos.length;
      const nCap = state.articulacao?.filhos.filter(f => f.tipo === 'Capitulo').length;
      expect(nFilhos).to.equal(7);
      expect(nCap).to.equal(nFilhos);
    });

    describe('Testando a inclusão de agrupadores para adicionar capítulo antes e depois', () => {
      describe('Testando a articulação após criação de estrutura de agrupadores', () => {
        beforeEach(function () {
          let atual = createElemento(state.articulacao!.filhos[0]); // Cap
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'antes' } });

          atual = createElemento(state.articulacao!.filhos[0]); // Cap
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
        });

        it('Deveria manter a ordem original dos artigos', () => {
          expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
        });

        it('Testando agrupador modificado CAPITULO 0 - capítulo antes', () => {
          const dispositivo = state.articulacao!.filhos[0]!; // Capítulo 0
          expect(dispositivo.pai!.tipo).to.equal('Articulacao');
          expect(dispositivo.pai!.filhos.length).to.equal(9);
          expect(dispositivo.tipo).to.equal('Capitulo');
          expect(dispositivo.filhos.length).to.equal(0);
          expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
        });
      });
      it('Testando agrupador modificado CAPITULO II - capítulo depois', () => {
        const dispositivo = state.articulacao!.filhos[2]!; // Capítulo II
        expect(dispositivo.pai!.tipo).to.equal('Articulacao');
        expect(dispositivo.pai!.filhos.length).to.equal(7);
        expect(dispositivo.tipo).to.equal('Capitulo');
        expect(dispositivo.filhos.length).to.equal(2);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
    });
  });
});
