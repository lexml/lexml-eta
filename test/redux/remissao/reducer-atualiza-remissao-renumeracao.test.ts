import { expect } from '@open-wc/testing';
import { adicionarArtigoAntes, adicionarArtigoDepois } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { renumerarElementoAction } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

let state: State;

// Fase 5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): o mecanismo de
// RemissaoRenumerada (evento emitido pelos reducers, consumido por moduloRemissao.atualizarReferencias)
// foi substituído por sincronizarRemissoesPosAcao (recálculo direto do registro por targetUuid). Este
// arquivo testava a emissão do evento antigo; agora testa o efeito equivalente: o registro de
// remissões (`state.remissoes`) reflete o novo lexmlId/texto do destino após a ação.

// Cria uma entrada de remissão manual no registro, apontando de `origem` para `destino`, com texto
// canônico embutido em `origem.texto` na posição correta.
const criaEntradaRemissao = (origem: any, destino: any, textoRef: string): RemissaoInternaValue => {
  const prefixo = 'Conforme o ';
  origem.texto = `${prefixo}${textoRef}, aplica-se o disposto.`;
  return {
    refId: 'ref_teste',
    sourceUuid: origem.uuid,
    targetUuid: destino.uuid,
    targetLexmlId: destino.id,
    textoRef,
    inicio: prefixo.length,
  };
};

describe('Atualização de Remissões na Renumeração', () => {
  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
  });

  describe('Adicionar dispositivo antes', () => {
    it('remissão para art2 (agora art3) atualiza targetLexmlId/textoRef', () => {
      const [art1, art2] = state.articulacao!.artigos;
      expect(art2!.id).to.equal('art2');

      const entrada = criaEntradaRemissao(art1, art2, 'art. 2º');
      state.remissoes = { [art1.uuid!]: [entrada] };

      const elemento = createElemento(art2!, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      expect(art2!.id).to.equal('art3');
      const entradaAtualizada = result.remissoes![art1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art3');
      expect(entradaAtualizada.textoRef).to.equal('art. 3º');
    });

    it('remissões para todos os dispositivos renumerados (art1, art2, art3) atualizam', () => {
      const [art1, art2, art3] = state.articulacao!.artigos;
      const origem1 = criaDispositivo(state.articulacao!, 'Artigo'); // dispositivo extra, fonte das remissões

      const entradaArt1 = criaEntradaRemissao(origem1, art1, 'art. 1º');
      state.remissoes = { [origem1.uuid!]: [entradaArt1] };

      const elemento = createElemento(art1, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      // art1->art2, art2->art3, art3->art4
      expect(art1.id).to.equal('art2');
      expect(art2.id).to.equal('art3');
      expect(art3.id).to.equal('art4');

      const entradaAtualizada = result.remissoes![origem1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art2');
      expect(entradaAtualizada.textoRef).to.equal('art. 2º');
    });
  });

  describe('Adicionar dispositivo depois', () => {
    it('remissão para art3 (agora art4) atualiza ao inserir artigo depois de art2', () => {
      const [art1, art2, art3] = state.articulacao!.artigos;

      const entrada = criaEntradaRemissao(art1, art3, 'art. 3º');
      state.remissoes = { [art1.uuid!]: [entrada] };

      const elemento = createElemento(art2, true);
      const action = adicionarArtigoDepois.execute(elemento);

      const result = elementoReducer(state, action);

      expect(art3.id).to.equal('art4');
      const entradaAtualizada = result.remissoes![art1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art4');
      expect(entradaAtualizada.textoRef).to.equal('art. 4º');
    });
  });

  describe('Renumeração manual', () => {
    it('remissão para art2 (renumerado manualmente para art10) atualiza', () => {
      const [art1, art2] = state.articulacao!.artigos;
      expect(art2.id).to.equal('art2');

      const entrada = criaEntradaRemissao(art1, art2, 'art. 2º');
      state.remissoes = { [art1.uuid!]: [entrada] };

      const elemento = createElemento(art2, true);
      const action = renumerarElementoAction.execute(elemento, '10');

      const result = elementoReducer(state, action);

      const entradaAtualizada = result.remissoes![art1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art10');
      expect(entradaAtualizada.textoRef).to.equal('art. 10');
    });

    it('não altera a entrada quando o número renumerado é o mesmo', () => {
      const [art1, art2] = state.articulacao!.artigos;

      const entrada = criaEntradaRemissao(art1, art2, 'art. 2º');
      state.remissoes = { [art1.uuid!]: [entrada] };

      const elemento = createElemento(art2, true);
      const action = renumerarElementoAction.execute(elemento, '2'); // mesmo número

      const result = elementoReducer(state, action);

      const entradaFinal = result.remissoes![art1.uuid!][0];
      expect(entradaFinal.targetLexmlId).to.equal('art2');
      expect(entradaFinal.textoRef).to.equal('art. 2º');
    });
  });

  describe('Cenário de enter no dispositivo (adicionar no mesmo lugar)', () => {
    it('deve atualizar remissão quando aperta enter no artigo 2 (art2 vira art3)', () => {
      const [art1, art2] = state.articulacao!.artigos;
      expect(art2.id).to.equal('art2');

      const entrada = criaEntradaRemissao(art1, art2, 'art. 2º');
      state.remissoes = { [art1.uuid!]: [entrada] };

      const elemento = createElemento(art2!, true);
      // Adicionar "antes" simula o comportamento de enter no dispositivo.
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      expect(art2.id).to.equal('art3');
      const entradaAtualizada = result.remissoes![art1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art3');
      expect(entradaAtualizada.textoRef).to.equal('art. 3º');
    });

    it('deve atualizar remissão quando aperta enter no artigo 1 (art2 vira art3)', () => {
      const [art1, art2] = state.articulacao!.artigos;
      const origem = criaDispositivo(state.articulacao!, 'Artigo');

      const entrada = criaEntradaRemissao(origem, art2, 'art. 2º');
      state.remissoes = { [origem.uuid!]: [entrada] };

      const elemento = createElemento(art1, true);
      const action = adicionarArtigoAntes.execute(elemento);

      const result = elementoReducer(state, action);

      expect(art2.id).to.equal('art3');
      const entradaAtualizada = result.remissoes![origem.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art3');
      expect(entradaAtualizada.textoRef).to.equal('art. 3º');
    });
  });

  describe('Renumeração manual - Outros tipos de dispositivos', () => {
    describe('Parágrafo', () => {
      it('remissão para parágrafo renumerado manualmente atualiza targetLexmlId/textoRef', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const par1 = criaDispositivo(art1, 'Paragrafo');
        const par2 = criaDispositivo(art1, 'Paragrafo');
        const origem = criaDispositivo(articulacao, 'Artigo');

        par1.texto = 'Parágrafo 1.';
        par2.texto = 'Parágrafo 2.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        par1.createRotulo(par1);
        par2.createRotulo(par2);
        origem.createRotulo(origem);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        par1.situacao = new DispositivoAdicionado();
        par2.situacao = new DispositivoAdicionado();
        origem.situacao = new DispositivoAdicionado();

        expect(par2.id).to.match(/^art1_par/);

        const entrada = criaEntradaRemissao(origem, par2, '§ 2º do art. 1º');
        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
          remissoes: { [origem.uuid!]: [entrada] },
        };

        const elemento = createElemento(par2, true);
        const action = renumerarElementoAction.execute(elemento, '10');
        const result = elementoReducer(testState, action);

        expect(par2.id).to.equal('art1_par10');
        const entradaAtualizada = result.remissoes![origem.uuid!][0];
        expect(entradaAtualizada.targetLexmlId).to.equal('art1_par10');
        expect(entradaAtualizada.textoRef).to.equal('§ 10 do art. 1º');
      });
    });

    describe('Inciso', () => {
      it('remissão para inciso renumerado manualmente atualiza targetLexmlId/textoRef', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const inc2 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const origem = criaDispositivo(articulacao, 'Artigo');

        inc1.texto = 'Inciso I.';
        inc2.texto = 'Inciso II.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        inc1.createRotulo(inc1);
        inc2.createRotulo(inc2);
        origem.createRotulo(origem);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        inc1.situacao = new DispositivoAdicionado();
        inc2.situacao = new DispositivoAdicionado();
        origem.situacao = new DispositivoAdicionado();

        expect(inc2.id).to.match(/^art1_cpt_inc/);

        const entrada = criaEntradaRemissao(origem, inc2, 'inciso II do art. 1º');
        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
          remissoes: { [origem.uuid!]: [entrada] },
        };

        const elemento = createElemento(inc2, true);
        const action = renumerarElementoAction.execute(elemento, 'X');
        const result = elementoReducer(testState, action);

        expect(inc2.id).to.equal('art1_cpt_inc10');
        const entradaAtualizada = result.remissoes![origem.uuid!][0];
        expect(entradaAtualizada.targetLexmlId).to.equal('art1_cpt_inc10');
        expect(entradaAtualizada.textoRef).to.equal('inciso X do art. 1º');
      });
    });

    describe('Alínea', () => {
      it('remissão para alínea renumerada manualmente atualiza targetLexmlId', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        inc1.texto = 'Inciso I.';

        const ali1 = criaDispositivo(inc1, 'Alinea');
        const ali2 = criaDispositivo(inc1, 'Alinea');
        const origem = criaDispositivo(articulacao, 'Artigo');

        ali1.texto = 'Alínea a.';
        ali2.texto = 'Alínea b.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        inc1.createRotulo(inc1);
        ali1.createRotulo(ali1);
        ali2.createRotulo(ali2);
        origem.createRotulo(origem);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        inc1.situacao = new DispositivoAdicionado();
        ali1.situacao = new DispositivoAdicionado();
        ali2.situacao = new DispositivoAdicionado();
        origem.situacao = new DispositivoAdicionado();

        const idAntigoAli2 = ali2.id!;

        const entrada = criaEntradaRemissao(origem, ali2, 'alínea b) do inciso I do art. 1º');
        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
          remissoes: { [origem.uuid!]: [entrada] },
        };

        const elemento = createElemento(ali2, true);
        const action = renumerarElementoAction.execute(elemento, 'z');
        const result = elementoReducer(testState, action);

        expect(ali2.id).to.not.equal(idAntigoAli2);
        const entradaAtualizada = result.remissoes![origem.uuid!][0];
        expect(entradaAtualizada.targetLexmlId).to.equal(ali2.id);
      });
    });

    describe('Item', () => {
      it('remissão para item renumerado manualmente atualiza targetLexmlId', () => {
        const articulacao = createArticulacao();
        const art1 = criaDispositivo(articulacao, 'Artigo');
        art1.texto = 'Este é o artigo 1.';

        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        inc1.texto = 'Inciso I.';

        const ali1 = criaDispositivo(inc1, 'Alinea');
        ali1.texto = 'Alínea a.';

        const item1 = criaDispositivo(ali1, 'Item');
        const item2 = criaDispositivo(ali1, 'Item');
        const origem = criaDispositivo(articulacao, 'Artigo');

        item1.texto = 'Item 1.';
        item2.texto = 'Item 2.';

        articulacao.renumeraFilhos();
        art1.createRotulo(art1);
        inc1.createRotulo(inc1);
        ali1.createRotulo(ali1);
        item1.createRotulo(item1);
        item2.createRotulo(item2);
        origem.createRotulo(origem);
        updateIdDispositivoAndFilhos(articulacao);

        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        inc1.situacao = new DispositivoAdicionado();
        ali1.situacao = new DispositivoAdicionado();
        item1.situacao = new DispositivoAdicionado();
        item2.situacao = new DispositivoAdicionado();
        origem.situacao = new DispositivoAdicionado();

        const idAntigoItem2 = item2.id!;

        const entrada = criaEntradaRemissao(origem, item2, 'item 2 da alínea a) do inciso I do art. 1º');
        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
          remissoes: { [origem.uuid!]: [entrada] },
        };

        const elemento = createElemento(item2, true);
        const action = renumerarElementoAction.execute(elemento, '10');
        const result = elementoReducer(testState, action);

        expect(item2.id).to.not.equal(idAntigoItem2);
        const entradaAtualizada = result.remissoes![origem.uuid!][0];
        expect(entradaAtualizada.targetLexmlId).to.equal(item2.id);
      });
    });

    describe('Agrupador', () => {
      it('remissão para capítulo renumerado manualmente atualiza targetLexmlId/textoRef', () => {
        const articulacao = createArticulacao();

        const cap1 = criaDispositivo(articulacao, 'Capitulo');
        const cap2 = criaDispositivo(articulacao, 'Capitulo');

        cap1.texto = 'Capítulo I.';
        cap2.texto = 'Capítulo II.';

        const art1 = criaDispositivo(cap2, 'Artigo');
        art1.texto = 'Artigo 1.';
        const origem = criaDispositivo(cap1, 'Artigo');
        origem.texto = 'Artigo origem.';

        articulacao.renumeraFilhos();
        cap1.createRotulo(cap1);
        cap2.createRotulo(cap2);
        art1.createRotulo(art1);
        origem.createRotulo(origem);
        updateIdDispositivoAndFilhos(articulacao);

        cap1.situacao = new DispositivoAdicionado();
        cap2.situacao = new DispositivoAdicionado();
        art1.situacao = new DispositivoAdicionado();
        (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
        origem.situacao = new DispositivoAdicionado();
        (origem as Artigo).caput!.situacao = new DispositivoAdicionado();

        expect(cap2.id).to.equal('cap2');

        const entrada = criaEntradaRemissao(origem, cap2, 'Capítulo II');
        const testState: State = {
          articulacao,
          modo: 'emenda',
          past: [],
          present: [],
          future: [],
          ui: { events: [] },
          remissoes: { [origem.uuid!]: [entrada] },
        };

        const elemento = createElemento(cap2, true);
        const action = renumerarElementoAction.execute(elemento, 'X');
        const result = elementoReducer(testState, action);

        expect(cap2.id).to.equal('cap10');
        const entradaAtualizada = result.remissoes![origem.uuid!][0];
        expect(entradaAtualizada.targetLexmlId).to.equal('cap10');
        expect(entradaAtualizada.textoRef).to.equal('Capítulo X');
      });
    });
  });
});
