import { getEventosQuePossuemElementos, getEvento } from './../../../src/redux/elemento/evento/eventosUtil';
import { buscaDispositivoById, isDispositivoCabecaAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State, StateEvent, StateType } from '../../../src/redux/state';
import { isAgrupador } from '../../../src/model/dispositivo/tipo';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';

let state: State;
let eventos: StateEvent[];

describe('Testando a inclusão de agrupadores em alteração de norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });
  it('Deveria possuir articulação com 5 artigos', () => {
    const nFilhos = state.articulacao?.filhos.length;
    const nArt = state.articulacao?.filhos.filter(f => f.tipo === 'Artigo').length;
    expect(nFilhos).to.equal(5);
    expect(nArt).to.equal(nFilhos);
    expect(state.articulacao!.artigos[0].id).to.equal('art1');
    expect(state.articulacao!.artigos[1].id).to.equal('art2');
    expect(state.articulacao!.artigos[2].id).to.equal('art3');
    expect(state.articulacao!.artigos[3].id).to.equal('art4');
    expect(state.articulacao!.artigos[4].id).to.equal('art5');
  });

  describe('Incluindo agrupador Capítulo antes de art1_cpt_alt1_art2', () => {
    beforeEach(function () {
      const atual = createElemento(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art2')!);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'antes' } });
      eventos = getEventosQuePossuemElementos(state.ui!.events);
    });

    it('Deveria possuir 4 alterações no Art. 1º da MPV', () => {
      const art1 = state.articulacao!.artigos[0];
      expect(art1.alteracoes?.filhos.length).to.equal(4);
    });

    it('Deveria apresentar novo agrupador como cabeça de alteração', () => {
      const disp = state.articulacao!.artigos[0].alteracoes!.filhos[1];
      expect(isAgrupador(disp)).to.equal(true);
      expect(isDispositivoCabecaAlteracao(disp)).to.equal(true);
    });

    it('Deveria apresentar o dispositivo "art1_cpt_alt1_art1" como referência para inclusão do agrupador no editor', () => {
      const incluidos = getEvento(eventos, StateType.ElementoIncluido);
      expect(incluidos.referencia?.lexmlId).to.equal('art1_cpt_alt1_art1');
    });

    describe('Testando a inclusão de um artigo novo dentro do agrupador', () => {
      beforeEach(function () {
        const disp = createElemento(state.articulacao!.artigos[0].alteracoes!.filhos[1]);
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.artigo.tipo, uuid: disp.uuid },
          novo: {
            tipo: TipoDispositivo.artigo.tipo,
          },
          posicao: 'depois',
        });
      });

      it('Deveria possuir novo artigo dentro do agrupador', () => {
        const cap = state.articulacao!.artigos[0].alteracoes!.filhos[1];
        const art = cap.filhos[0];
        expect(isDispositivoCabecaAlteracao(cap)).to.equal(true);
        expect(!isDispositivoCabecaAlteracao(art)).to.equal(true);
        expect(art.pai!.id).to.equal(cap.id);
        expect(art.rotulo).to.equal('Artigo');
      });

      describe('Testando a inclusão de outro artigo antes do dispositivo art1_cpt_alt1_art2', () => {
        beforeEach(function () {
          const disp = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art2')!;
          state = adicionaElemento(state, {
            type: ADICIONAR_ELEMENTO,
            atual: { tipo: TipoDispositivo.artigo.tipo, uuid: disp.uuid },
            novo: {
              tipo: TipoDispositivo.artigo.tipo,
            },
            posicao: 'antes',
          });
          eventos = getEventosQuePossuemElementos(state.ui!.events);
        });

        it('Deveria possuir 5 alterações no Art. 1º da MPV', () => {
          const art1 = state.articulacao!.artigos[0];
          expect(art1.alteracoes?.filhos.length).to.equal(5);
        });

        it('Deveria apresentar novo artigo como cabeça de alteração', () => {
          const disp = state.articulacao!.artigos[0].alteracoes!.filhos[2];
          expect(isAgrupador(disp)).to.equal(false);
          expect(isDispositivoCabecaAlteracao(disp)).to.equal(true);
          expect(disp.rotulo).to.equal('Artigo');
        });

        it('Testando referência para inclusão do artigo no editor', () => {
          const incluidos = getEvento(eventos, StateType.ElementoIncluido);
          const artAnterior = state.articulacao!.artigos[0].alteracoes!.filhos[1].filhos[0];
          expect(incluidos.referencia?.uuid).to.equal(artAnterior.uuid);
        });
      });
    });
  });
});
