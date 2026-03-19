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
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

let state: State;

describe('Atualização de Remissões na Renumeração', () => {
  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
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
    it('deve emitir evento RemissaoRenumerada para dispositivos posteriores ao inserir artigo depois', () => {
      const artigo2 = state.articulacao!.artigos[1];

      const elemento = createElemento(artigo2, true);
      const action = adicionarArtigoDepois.execute(elemento);

      const result = elementoReducer(state, action);

      const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      // art3 é renumerado para art4 (artigo posterior ao ponto de inserção)
      expect(eventosRemissaoRenumerada.length).to.equal(1);

      const eventoArt3 = eventosRemissaoRenumerada.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art3');
      expect(eventoArt3).to.exist;
      expect(eventoArt3!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art4');
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

  describe('Renumeração manual - Outros tipos de dispositivos', () => {
    describe('Parágrafo', () => {
      it('deve emitir evento RemissaoRenumerada quando renumera parágrafo manualmente', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const par1 = criaDispositivo(art1, 'Paragrafo');
        const par2 = criaDispositivo(art1, 'Paragrafo');

        par1.texto = 'Parágrafo 1.';
        par2.texto = 'Parágrafo 2.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        par1.createRotulo(par1);
        par2.createRotulo(par2);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        par1.situacao = new DispositivoAdicionado();
        par2.situacao = new DispositivoAdicionado();

        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
        };

        // ID pode conter [sn:N] se numero não estiver definido - comportamento esperado
        const idAntigoPar2 = par2.id;
        expect(idAntigoPar2).to.match(/^art1_par/); // Verifica que inicia corretamente

        const elemento = createElemento(par2, true);
        const action = renumerarElementoAction.execute(elemento, '10');
        const result = elementoReducer(testState, action);

        const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

        expect(eventosRemissaoRenumerada.length).to.equal(1);

        const evento = eventosRemissaoRenumerada[0];
        expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.equal(idAntigoPar2);
        expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.equal(`art1_par10`);
        expect(evento.remissaoRenumeracao!.novoUuid).to.exist;
      });
    });

    describe('Inciso', () => {
      it('deve emitir evento RemissaoRenumerada quando renumera inciso manualmente', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const inc2 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');

        inc1.texto = 'Inciso I.';
        inc2.texto = 'Inciso II.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        inc1.createRotulo(inc1);
        inc2.createRotulo(inc2);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        inc1.situacao = new DispositivoAdicionado();
        inc2.situacao = new DispositivoAdicionado();

        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
        };

        // ID pode conter [sn:N] se numero não estiver definido - comportamento esperado
        const idAntigoInc2 = inc2.id;
        expect(idAntigoInc2).to.match(/^art1_cpt_inc/); // Verifica que inicia corretamente

        const elemento = createElemento(inc2, true);
        const action = renumerarElementoAction.execute(elemento, 'X');
        const result = elementoReducer(testState, action);

        const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

        expect(eventosRemissaoRenumerada.length).to.equal(1);

        const evento = eventosRemissaoRenumerada[0];
        expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.equal(idAntigoInc2);
        expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.equal(`art1_cpt_inc10`);
        expect(evento.remissaoRenumeracao!.novoUuid).to.exist;
      });
    });

    describe('Alínea', () => {
      it('deve emitir evento RemissaoRenumerada quando renumera alínea manualmente', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        inc1.texto = 'Inciso I.';

        const ali1 = criaDispositivo(inc1, 'Alinea');
        const ali2 = criaDispositivo(inc1, 'Alinea');

        ali1.texto = 'Alínea a.';
        ali2.texto = 'Alínea b.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        inc1.createRotulo(inc1);
        ali1.createRotulo(ali1);
        ali2.createRotulo(ali2);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        inc1.situacao = new DispositivoAdicionado();
        ali1.situacao = new DispositivoAdicionado();
        ali2.situacao = new DispositivoAdicionado();

        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
        };

        const idAntigoAli2 = ali2.id;

        const elemento = createElemento(ali2, true);
        const action = renumerarElementoAction.execute(elemento, 'z');
        const result = elementoReducer(testState, action);

        const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

        expect(eventosRemissaoRenumerada.length).to.equal(1);

        const evento = eventosRemissaoRenumerada[0];
        expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.equal(idAntigoAli2);
        expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.equal(ali2.id);
        expect(evento.remissaoRenumeracao!.novoUuid).to.exist;
      });
    });

    describe('Item', () => {
      it('deve emitir evento RemissaoRenumerada quando renumera item manualmente', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        inc1.texto = 'Inciso I.';

        const ali1 = criaDispositivo(inc1, 'Alinea');
        ali1.texto = 'Alínea a.';

        const item1 = criaDispositivo(ali1, 'Item');
        const item2 = criaDispositivo(ali1, 'Item');

        item1.texto = 'Item 1.';
        item2.texto = 'Item 2.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        inc1.createRotulo(inc1);
        ali1.createRotulo(ali1);
        item1.createRotulo(item1);
        item2.createRotulo(item2);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        inc1.situacao = new DispositivoAdicionado();
        ali1.situacao = new DispositivoAdicionado();
        item1.situacao = new DispositivoAdicionado();
        item2.situacao = new DispositivoAdicionado();

        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
        };

        const idAntigoItem2 = item2.id;

        const elemento = createElemento(item2, true);
        const action = renumerarElementoAction.execute(elemento, '10');
        const result = elementoReducer(testState, action);

        const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

        expect(eventosRemissaoRenumerada.length).to.equal(1);

        const evento = eventosRemissaoRenumerada[0];
        expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.equal(idAntigoItem2);
        expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.equal(item2.id);
        expect(evento.remissaoRenumeracao!.novoUuid).to.exist;
      });
    });

    describe('Agrupador', () => {
      it('deve emitir evento RemissaoRenumerada quando renumera capítulo manualmente', () => {
        const articulacao = createArticulacao();

        const cap1 = criaDispositivo(articulacao, 'Capitulo');
        const cap2 = criaDispositivo(articulacao, 'Capitulo');

        cap1.texto = 'Capítulo I.';
        cap2.texto = 'Capítulo II.';

        const art1 = criaDispositivo(cap2, 'Artigo');
        art1.texto = 'Artigo 1.';

        articulacao.renumeraFilhos();
        cap1.createRotulo(cap1);
        cap2.createRotulo(cap2);
        art1.createRotulo(art1);
        updateIdDispositivoAndFilhos(articulacao);

        cap1.situacao = new DispositivoAdicionado();
        cap2.situacao = new DispositivoAdicionado();
        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();

        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
        };

        expect(cap2.id).to.equal('cap2');

        const elemento = createElemento(cap2, true);
        const action = renumerarElementoAction.execute(elemento, 'X');
        const result = elementoReducer(testState, action);

        const eventosRemissaoRenumerada = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

        expect(eventosRemissaoRenumerada.length).to.equal(1);

        const evento = eventosRemissaoRenumerada[0];
        expect(evento.remissaoRenumeracao!.lexmlIdAntigo).to.equal('cap2');
        expect(evento.remissaoRenumeracao!.lexmlIdNovo).to.equal('cap10');
        expect(evento.remissaoRenumeracao!.novoUuid).to.exist;
      });
    });
  });
});
