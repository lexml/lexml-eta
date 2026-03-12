import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';

const getState = (): State => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, 'Artigo');
  const art2 = criaDispositivo(articulacao, 'Artigo');
  const art3 = criaDispositivo(articulacao, 'Artigo');

  art1.texto = 'Este é o artigo 1.';
  art2.texto = 'Este é o artigo 2.';
  art3.texto = 'Este é o artigo 3.';

  articulacao.renumeraFilhos();
  art1.createRotulo(art1);
  art2.createRotulo(art2);
  art3.createRotulo(art3);
  updateIdDispositivoAndFilhos(articulacao);

  art1.situacao = new DispositivoAdicionado();
  art2.situacao = new DispositivoAdicionado();
  art3.situacao = new DispositivoAdicionado();
  (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
  (art2 as Artigo).caput!.situacao = new DispositivoAdicionado();
  (art3 as Artigo).caput!.situacao = new DispositivoAdicionado();

  return {
    articulacao,
    modo: 'emenda',
    past: [],
    present: [],
    future: [],
    ui: {
      events: [],
    },
  };
};

describe('Invalidação e Restauração de Remissões', () => {
  let state: State;

  beforeEach(() => {
    state = getState();
  });

  describe('RemissaoInvalidada', () => {
    it('deve emitir evento RemissaoInvalidada quando remove dispositivo', () => {
      const artigo2 = state.articulacao!.filhos[1];
      const action = { atual: { uuid: artigo2.uuid } };

      const newState = removeElemento(state, action);

      const eventoRemissaoInvalidada = newState.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      expect(eventoRemissaoInvalidada).to.exist;
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.lexmlId).to.equal('art2');
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.uuid).to.equal(artigo2.uuid);
    });

    it('deve incluir lexmlId e uuid no evento RemissaoInvalidada', () => {
      const artigo1 = state.articulacao!.filhos[0];
      const action = { atual: { uuid: artigo1.uuid } };

      const newState = removeElemento(state, action);

      const eventoRemissaoInvalidada = newState.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      expect(eventoRemissaoInvalidada).to.exist;
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao).to.exist;
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.lexmlId).to.be.a('string');
      expect(eventoRemissaoInvalidada?.remissaoInvalidacao?.uuid).to.be.a('number');
    });

    it('não deve emitir evento RemissaoInvalidada se dispositivo não tem id', () => {
      // Cria um dispositivo sem id (caso hipotético)
      const artigo3 = state.articulacao!.filhos[2];
      delete (artigo3 as any).id;

      const action = { atual: { uuid: artigo3.uuid } };
      const newState = removeElemento(state, action);

      const eventoRemissaoInvalidada = newState.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      expect(eventoRemissaoInvalidada).to.not.exist;
    });
  });

  describe('RemissaoRestaurada', () => {
    it('deve emitir evento RemissaoRestaurada quando faz undo de remoção', () => {
      const artigo2 = state.articulacao!.filhos[1];
      const action = { atual: { uuid: artigo2.uuid } };

      // Remove o dispositivo
      const stateRemoved = removeElemento(state, action);

      // Faz undo da remoção
      const stateUndo = undo(stateRemoved);

      const eventoRemissaoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);

      expect(eventoRemissaoRestaurada).to.exist;
      expect(eventoRemissaoRestaurada?.remissaoInvalidacao?.lexmlId).to.equal('art2');
      expect(eventoRemissaoRestaurada?.remissaoInvalidacao?.uuid).to.equal(artigo2.uuid);
    });

    it('deve restaurar remissão com mesmo lexmlId e uuid da invalidação', () => {
      const artigo1 = state.articulacao!.filhos[0];
      const action = { atual: { uuid: artigo1.uuid } };

      const stateRemoved = removeElemento(state, action);
      const eventoInvalidada = stateRemoved.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);

      const stateUndo = undo(stateRemoved);
      const eventoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);

      expect(eventoRestaurada).to.exist;
      expect(eventoRestaurada?.remissaoInvalidacao?.lexmlId).to.equal(eventoInvalidada?.remissaoInvalidacao?.lexmlId);
      expect(eventoRestaurada?.remissaoInvalidacao?.uuid).to.equal(eventoInvalidada?.remissaoInvalidacao?.uuid);
    });

    it('não deve emitir evento RemissaoRestaurada se não havia RemissaoInvalidada', () => {
      // Cria um estado sem evento de invalidação no passado
      const artigo3 = state.articulacao!.filhos[2];

      // Simula um estado que não tem RemissaoInvalidada no past
      const stateSimulado = {
        ...state,
        past: [
          [
            {
              stateType: StateType.ElementoIncluido,
              elementos: [{ uuid: artigo3.uuid }],
            },
          ],
        ],
      } as any;

      const stateUndo = undo(stateSimulado);

      const eventoRemissaoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);

      expect(eventoRemissaoRestaurada).to.not.exist;
    });
  });

  describe('Fluxo completo: remover -> undo', () => {
    it('deve invalidar e restaurar remissões no fluxo completo', () => {
      const artigo2 = state.articulacao!.filhos[1];
      const lexmlIdOriginal = artigo2.id;
      const uuidOriginal = artigo2.uuid;

      // Passo 1: Remove dispositivo
      const stateRemoved = removeElemento(state, { atual: { uuid: uuidOriginal } });

      const eventoInvalidada = stateRemoved.ui?.events.find(ev => ev.stateType === StateType.RemissaoInvalidada);
      expect(eventoInvalidada).to.exist;
      expect(eventoInvalidada?.remissaoInvalidacao?.lexmlId).to.equal(lexmlIdOriginal);

      // Passo 2: Faz undo (restaura dispositivo)
      const stateUndo = undo(stateRemoved);

      const eventoRestaurada = stateUndo.ui?.events.find(ev => ev.stateType === StateType.RemissaoRestaurada);
      expect(eventoRestaurada).to.exist;
      expect(eventoRestaurada?.remissaoInvalidacao?.lexmlId).to.equal(lexmlIdOriginal);
      expect(eventoRestaurada?.remissaoInvalidacao?.uuid).to.equal(uuidOriginal);
    });
  });
});
