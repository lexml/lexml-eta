import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
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

describe('Testando a inclusão de agrupadores seção antes e depois a partir do Capítulo I', () => {
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

    describe('Testando a inclusão de agrupadores para adicionar seção antes e depois', () => {
      describe('Testando a articulação após criação de estrutura de agrupadores', () => {
        beforeEach(function () {
          let atual = createElemento(state.articulacao!.filhos[0]); // Secao
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'depois' } });

          atual = createElemento(state.articulacao!.filhos[1]); // Secao
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'depois' } });
        });

        it('Deveria manter a ordem original dos artigos', () => {
          expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
        });

        it('Deveria possuir novos agrupadores cap1, cap1_sec1, cap1_sec0_sec1', () => {
          const cap1 = !!buscaDispositivoById(state.articulacao!, 'cap1');
          const secao1 = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1');
          const secao2 = !!buscaDispositivoById(state.articulacao!, 'sec1_sec2');

          expect(cap1).to.be.true;
          expect(secao1).to.be.true;
          expect(secao2).to.be.true;
        });
      });
    });
  });
});
