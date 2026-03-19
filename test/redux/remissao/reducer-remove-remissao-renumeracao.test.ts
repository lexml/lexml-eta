import { expect } from '@open-wc/testing';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

describe('Atualização de Remissões ao Remover Dispositivo (RemissaoRenumerada)', () => {
  describe('Remover artigo do início — renumera todos os posteriores', () => {
    it('deve emitir RemissaoRenumerada para art2→art1 e art3→art2 ao remover art1', () => {
      const state = criaStateComNArtigos(3).state;
      const art1 = state.articulacao!.artigos[0];

      expect(art1.id).to.equal('art1');

      const elemento = createElemento(art1, true);
      const elementoAnterior = createElemento(art1, true);
      const action = removerElementoAction.execute(elemento, elementoAnterior);

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      expect(renumerados.length).to.equal(2);

      const eventoArt2 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2');
      expect(eventoArt2).to.exist;
      expect(eventoArt2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art1');
      expect(eventoArt2!.remissaoRenumeracao!.novoUuid).to.be.a('number');

      const eventoArt3 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art3');
      expect(eventoArt3).to.exist;
      expect(eventoArt3!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art2');
    });
  });

  describe('Remover artigo do meio — renumera apenas os posteriores', () => {
    it('deve emitir RemissaoRenumerada apenas para art3→art2 ao remover art2', () => {
      const state = criaStateComNArtigos(3).state;
      const art2 = state.articulacao!.artigos[1];

      expect(art2.id).to.equal('art2');

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      expect(renumerados.length).to.equal(1);

      const eventoArt3 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art3');
      expect(eventoArt3).to.exist;
      expect(eventoArt3!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art2');
      expect(eventoArt3!.remissaoRenumeracao!.novoUuid).to.be.a('number');
    });

    it('não deve emitir RemissaoRenumerada para o artigo removido em si', () => {
      const state = criaStateComNArtigos(3).state;
      const art2 = state.articulacao!.artigos[1];
      const uuidArt2 = art2.uuid;

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      renumerados.forEach(ev => {
        expect(ev.remissaoRenumeracao!.novoUuid).to.not.equal(uuidArt2);
      });
    });
  });

  describe('Remover artigo do fim — nenhuma renumeração necessária', () => {
    it('não deve emitir RemissaoRenumerada ao remover o último artigo', () => {
      const state = criaStateComNArtigos(3).state;
      const art3 = state.articulacao!.artigos[2];

      expect(art3.id).to.equal('art3');

      const elemento = createElemento(art3, true);
      const action = removerElementoAction.execute(elemento, createElemento(art3, true));

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      expect(renumerados.length).to.equal(0);
    });
  });

  describe('Remover artigo do meio em documento com 4 artigos', () => {
    it('deve renumerar art3→art2 e art4→art3 ao remover art2', () => {
      const state = criaStateComNArtigos(4).state;
      const art2 = state.articulacao!.artigos[1];

      expect(art2.id).to.equal('art2');

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      expect(renumerados.length).to.equal(2);

      const eventoArt3 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art3');
      expect(eventoArt3).to.exist;
      expect(eventoArt3!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art2');

      const eventoArt4 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art4');
      expect(eventoArt4).to.exist;
      expect(eventoArt4!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art3');
    });
  });

  describe('Remissão composta — parágrafo renumerado em cascata ao excluir artigo', () => {
    it('deve emitir RemissaoRenumerada para art2_par1→art1_par1 ao remover art1', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      const par1Art2 = criaDispositivo(art2, 'Paragrafo');

      art1.texto = 'Artigo 1.';
      art2.texto = 'Artigo 2.';
      par1Art2.texto = 'Parágrafo do artigo 2.';

      articulacao.renumeraFilhos();
      art2.renumeraFilhos();
      [art1, art2, par1Art2].forEach(d => d.createRotulo(d));
      updateIdDispositivoAndFilhos(articulacao);

      [art1, art2, par1Art2].forEach(d => {
        d.situacao = new DispositivoAdicionado();
      });
      (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
      (art2 as Artigo).caput!.situacao = new DispositivoAdicionado();

      const state: State = {
        articulacao,
        modo: 'emenda',
        past: [],
        present: [],
        future: [],
        ui: { events: [] },
      };

      expect(art2.id).to.equal('art2');
      expect(par1Art2.id).to.equal('art2_par1');

      const elemento = createElemento(art1, true);
      const action = removerElementoAction.execute(elemento, createElemento(art1, true));

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      const eventoArtigo = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2');
      expect(eventoArtigo).to.exist;
      expect(eventoArtigo!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art1');

      const eventoParagrafo = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'art2_par1');
      expect(eventoParagrafo).to.exist;
      expect(eventoParagrafo!.remissaoRenumeracao!.lexmlIdNovo).to.equal('art1_par1');
      expect(eventoParagrafo!.remissaoRenumeracao!.novoUuid).to.equal(par1Art2.uuid);
    });
  });

  describe('Estrutura dos eventos RemissaoRenumerada', () => {
    it('evento deve conter lexmlIdAntigo, lexmlIdNovo e novoUuid válidos', () => {
      const state = criaStateComNArtigos(3).state;
      const art1 = state.articulacao!.artigos[0];

      const elemento = createElemento(art1, true);
      const action = removerElementoAction.execute(elemento, createElemento(art1, true));

      const result = elementoReducer(state, action);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);

      renumerados.forEach(ev => {
        expect(ev.stateType).to.equal(StateType.RemissaoRenumerada);
        expect(ev.elementos).to.be.an('array').that.is.empty;
        expect(ev.remissaoRenumeracao).to.exist;
        expect(ev.remissaoRenumeracao!.lexmlIdAntigo).to.be.a('string').and.not.be.empty;
        expect(ev.remissaoRenumeracao!.lexmlIdNovo).to.be.a('string').and.not.be.empty;
        expect(ev.remissaoRenumeracao!.novoUuid).to.be.a('number');
        expect(ev.remissaoRenumeracao!.lexmlIdAntigo).to.not.equal(ev.remissaoRenumeracao!.lexmlIdNovo);
      });
    });
  });

  describe('Coexistência com RemissaoInvalidada', () => {
    it('deve emitir RemissaoInvalidada para o dispositivo removido e RemissaoRenumerada para os posteriores', () => {
      const state = criaStateComNArtigos(3).state;
      const art2 = state.articulacao!.artigos[1];
      const uuidArt2 = art2.uuid;

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      const invalidados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoInvalidada);
      expect(invalidados.length).to.equal(1);
      expect(invalidados[0].remissaoInvalidacao!.lexmlId).to.equal('art2');
      expect(invalidados[0].remissaoInvalidacao!.uuid).to.equal(uuidArt2);

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      expect(renumerados.length).to.equal(1);
      expect(renumerados[0].remissaoRenumeracao!.lexmlIdAntigo).to.equal('art3');
      expect(renumerados[0].remissaoRenumeracao!.lexmlIdNovo).to.equal('art2');
    });
  });
});
