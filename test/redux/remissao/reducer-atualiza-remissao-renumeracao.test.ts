import { expect } from '@open-wc/testing';
import { adicionarArtigoAntes, adicionarArtigoDepois } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { renumerarElementoAction } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';

let state: State;

const getState = (): State => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, 'Artigo');
  const art2 = criaDispositivo(articulacao, 'Artigo');
  const art3 = criaDispositivo(articulacao, 'Artigo');

  // Define algum texto para os artigos
  art1.texto = 'Este é o artigo 1.';
  art2.texto = 'Este é o artigo 2.';
  art3.texto = 'Este é o artigo 3.';

  // Renumera os artigos e atualiza seus lexmlIds
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

describe('Atualização de Remissões na Renumeração', () => {
  beforeEach(() => {
    state = getState();
  });

  describe('Adicionar dispositivo antes', () => {
    it('deve emitir evento RemissaoRenumerada quando adiciona artigo antes', () => {
      const artigo2 = state.articulacao!.artigos[1];

      expect(artigo2).to.exist;
      expect(artigo2!.id).to.equal('art2');

      const elemento = createElemento(artigo2!, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      // Verifica se há eventos de RemissaoRenumerada
      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      // Deve ter pelo menos um evento de renumeração (Art. 2 -> Art. 3, Art. 3 -> Art. 4)
      expect(eventosRemissaoRenumerada.length).to.be.greaterThan(0);

      // Verifica se o evento contém o mapeamento correto
      const eventoArt2 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2');
      expect(eventoArt2).to.exist;
      expect(eventoArt2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art3');
      expect(eventoArt2!.remissaoRenumeracao!.novoUuid).to.exist;
    });

    it('deve emitir evento RemissaoRenumerada para todos os dispositivos renumerados', () => {
      const artigo1 = state.articulacao!.artigos[0];

      const elemento = createElemento(artigo1, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      // Deve renumerar art1->art2, art2->art3, art3->art4
      expect(eventosRemissaoRenumerada.length).to.equal(3);

      // Verifica os mapeamentos
      const eventoArt1 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art1');
      expect(eventoArt1).to.exist;
      expect(eventoArt1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art2');

      const eventoArt2 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2');
      expect(eventoArt2).to.exist;
      expect(eventoArt2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art3');

      const eventoArt3 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art3');
      expect(eventoArt3).to.exist;
      expect(eventoArt3!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art4');
    });
  });

  describe('Adicionar dispositivo depois', () => {
    it('não deve emitir evento RemissaoRenumerada quando adiciona artigo depois', () => {
      const artigo2 = state.articulacao!.artigos[1];

      const elemento = createElemento(artigo2, true);
      const action = adicionarArtigoDepois.execute(elemento);

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      // Não deve haver eventos de renumeração ao adicionar depois
      expect(eventosRemissaoRenumerada.length).to.equal(0);
    });
  });

  describe('Renumeração manual', () => {
    it('deve emitir evento RemissaoRenumerada quando renumera manualmente', () => {
      const artigo2 = state.articulacao!.artigos[1];

      expect(artigo2.id).to.equal('art2');

      const elemento = createElemento(artigo2, true);
      const action = renumerarElementoAction.execute(elemento, '10');

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      expect(eventosRemissaoRenumerada.length).to.equal(1);

      const evento = eventosRemissaoRenumerada[0];
      expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.equal('art2');
      expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.equal('art10');
      expect(evento.remissaoRenumeracao!.novoUuid).to.exist;
    });

    it('não deve emitir evento RemissaoRenumerada quando número não muda', () => {
      const artigo2 = state.articulacao!.artigos[1];

      const elemento = createElemento(artigo2, true);
      const action = renumerarElementoAction.execute(elemento, '2'); // Mesmo número

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      expect(eventosRemissaoRenumerada.length).to.equal(0);
    });
  });

  describe('Estrutura do evento', () => {
    it('evento RemissaoRenumerada deve ter estrutura correta', () => {
      const artigo1 = state.articulacao!.artigos[0];

      const elemento = createElemento(artigo1, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      expect(eventosRemissaoRenumerada.length).to.be.greaterThan(0);

      const evento = eventosRemissaoRenumerada[0];

      // Verifica estrutura do evento
      expect(evento.stateType).to.equal(StateType.RemissaoRenumerada);
      expect(evento.elementos).to.be.an('array').that.is.empty;
      expect(evento.remissaoRenumeracao).to.exist;
      expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.be.a('string');
      expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.be.a('string');
      expect(evento.remissaoRenumeracao!.novoUuid).to.be.a('number');
    });
  });

  describe('Cenário de enter no dispositivo (adicionar no mesmo lugar)', () => {
    it('deve atualizar remissão quando aperta enter no artigo 2', () => {
      // Simula: foco no art. 2, aperta enter
      // Resultado: cria novo art. 2, o antigo vira art. 3
      // Remissão para art. 2 antigo deve apontar para art. 3 novo

      const artigo2 = state.articulacao!.artigos[1];

      expect(artigo2.id).to.equal('art2');

      const elemento = createElemento(artigo2!, true);

      // Adicionar "antes" simula o comportamento de enter no dispositivo
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      // Deve renumerar art2->art3, art3->art4
      expect(eventosRemissaoRenumerada.length).to.equal(2);

      // Verifica se art2 foi renumerado para art3
      const eventoArt2 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2');
      expect(eventoArt2).to.exist;
      expect(eventoArt2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art3');
    });

    it('deve atualizar remissão quando aperta enter no artigo 1', () => {
      // Simula: foco no art. 1, aperta enter
      // Resultado: cria novo art. 2, art. 1 antigo vira art. 2, art. 2 antigo vira art. 3
      // Remissão para art. 2 antigo deve apontar para art. 3 novo

      const artigo1 = state.articulacao!.artigos[0];

      const elemento = createElemento(artigo1, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      // Deve renumerar art1->art2, art2->art3, art3->art4
      expect(eventosRemissaoRenumerada.length).to.equal(3);

      // Verifica se art2 foi renumerado para art3
      const eventoArt2 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2');
      expect(eventoArt2).to.exist;
      expect(eventoArt2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art3');
    });
  });
});
