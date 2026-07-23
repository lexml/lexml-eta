import { expect } from '@open-wc/testing';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

// Fase 5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): o mecanismo
// de RemissaoRenumerada (evento emitido pelos reducers, consumido por moduloRemissao.atualizarReferencias)
// foi substituído por sincronizarRemissoesPosAcao (recálculo direto do registro por targetUuid, ver
// sincronizarRemissoes.ts). Este arquivo testava a emissão do evento antigo; agora testa o efeito
// equivalente: o registro de remissões (`state.remissoes`) reflete o novo lexmlId/texto do destino.

// Cria uma entrada de remissão manual no registro, apontando de `origem` para `destino`, com texto
// canônico embutido em `origem.texto` na posição correta (para o mecanismo novo poder verificar
// que o texto não foi editado à mão antes de atualizar).
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

describe('Atualização de Remissões ao Remover Dispositivo', () => {
  describe('Remover artigo do início — renumera todos os posteriores', () => {
    it('remissão para art2 (agora art1) e para art3 (agora art2) atualiza targetLexmlId/textoRef', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const [art1, art2, art3] = artigos;

      // art1 referencia art2; um dispositivo fictício (usamos o próprio art3 como origem) referencia art3.
      const entradaArt2 = criaEntradaRemissao(art3, art2, 'art. 2º');
      state.remissoes = { [art3.uuid!]: [entradaArt2] };

      const elemento = createElemento(art1, true);
      const action = removerElementoAction.execute(elemento, createElemento(art1, true));

      const result = elementoReducer(state, action);

      expect(art2.id).to.equal('art1'); // renumerado in-place
      const entradaAtualizada = result.remissoes![art3.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art1');
      expect(entradaAtualizada.textoRef).to.equal('art. 1º');
    });
  });

  describe('Remover artigo do meio — renumera apenas os posteriores', () => {
    it('remissão para art3 (agora art2) atualiza; remissão não aponta para o artigo removido', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const [art1, art2, art3] = artigos;

      const entradaArt3 = criaEntradaRemissao(art1, art3, 'art. 3º');
      state.remissoes = { [art1.uuid!]: [entradaArt3] };

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      const entradaAtualizada = result.remissoes![art1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art2');
      expect(entradaAtualizada.textoRef).to.equal('art. 2º');
      // A remissão nunca apontou para o uuid removido (art2) — sanity check do próprio teste.
      expect(entradaAtualizada.targetUuid).to.not.equal(art2.uuid);
    });
  });

  describe('Remover artigo do fim — nenhuma renumeração necessária', () => {
    it('remissão para art1 permanece intocada ao remover o último artigo', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const [art1, , art3] = artigos;

      const entrada = criaEntradaRemissao(art3, art1, 'art. 1º');
      state.remissoes = { [art3.uuid!]: [entrada] };

      const elemento = createElemento(art3, true);
      const action = removerElementoAction.execute(elemento, createElemento(art3, true));

      const result = elementoReducer(state, action);

      // art3 foi removido, mas isso não afeta a entrada em si (o destino, art1, não mudou de id) —
      // a limpeza de entradas órfãs pertencentes a um source removido é responsabilidade de outro
      // mecanismo, não do recálculo por targetUuid.
      const entradaIntacta = result.remissoes![art3.uuid!][0];
      expect(entradaIntacta.targetLexmlId).to.equal('art1');
      expect(entradaIntacta.textoRef).to.equal('art. 1º');
    });
  });

  describe('Remover artigo do meio em documento com 4 artigos', () => {
    it('remissões para art3 (agora art2) e art4 (agora art3) atualizam ao remover art2', () => {
      const { state, artigos } = criaStateComNArtigos(4);
      const [art1, art2, art3, art4] = artigos;

      const entradaArt3 = criaEntradaRemissao(art1, art3, 'art. 3º');
      state.remissoes = { [art1.uuid!]: [entradaArt3] };

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      expect(art3.id).to.equal('art2');
      expect(art4.id).to.equal('art3');
      const entradaAtualizada = result.remissoes![art1.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art2');
      expect(entradaAtualizada.textoRef).to.equal('art. 2º');
    });
  });

  describe('Remissão composta — parágrafo renumerado em cascata ao excluir artigo', () => {
    it('remissão para art2_par1 (agora art1_par1) atualiza targetLexmlId/textoRef ao remover art1', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      const par1Art2 = criaDispositivo(art2, 'Paragrafo');
      const origem = criaDispositivo(articulacao, 'Artigo'); // dispositivo fonte da remissão

      art1.texto = 'Artigo 1.';
      art2.texto = 'Artigo 2.';
      par1Art2.texto = 'Parágrafo do artigo 2.';

      articulacao.renumeraFilhos();
      art2.renumeraFilhos();
      [art1, art2, par1Art2, origem].forEach(d => d.createRotulo(d));
      updateIdDispositivoAndFilhos(articulacao);

      [art1, art2, par1Art2, origem].forEach(d => {
        d.situacao = new DispositivoAdicionado();
      });
      (art1 as Artigo).caput!.situacao = new DispositivoAdicionado();
      (art2 as Artigo).caput!.situacao = new DispositivoAdicionado();

      expect(art2.id).to.equal('art2');
      expect(par1Art2.id).to.equal('art2_par1');

      const entrada = criaEntradaRemissao(origem, par1Art2, '§ 1º do art. 2º');

      const state: State = {
        articulacao,
        modo: 'emenda',
        past: [],
        present: [],
        future: [],
        ui: { events: [] },
        remissoes: { [origem.uuid!]: [entrada] },
      };

      const elemento = createElemento(art1, true);
      const action = removerElementoAction.execute(elemento, createElemento(art1, true));

      const result = elementoReducer(state, action);

      expect(par1Art2.id).to.equal('art1_par1');
      const entradaAtualizada = result.remissoes![origem.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('art1_par1');
      expect(entradaAtualizada.textoRef).to.equal('§ 1º do art. 1º');
      expect(entradaAtualizada.targetUuid).to.equal(par1Art2.uuid);
    });
  });

  describe('Coexistência com RemissaoInvalidada', () => {
    it('remissão para o dispositivo removido fica inválida; remissão para os posteriores continua sendo atualizada', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const [art1, art2, art3] = artigos;

      // origem1 aponta para o artigo que será removido (art2) — deve ficar inválida.
      const entradaInvalidada = criaEntradaRemissao(art1, art2, 'art. 2º');
      // art3 aponta para art3 renumerado (art2) — deve ser atualizada normalmente.
      const entradaAtualizada = criaEntradaRemissao(art3, art3, 'art. 3º');

      state.remissoes = {
        [art1.uuid!]: [entradaInvalidada],
        [art3.uuid!]: [entradaAtualizada],
      };

      const elemento = createElemento(art2, true);
      const action = removerElementoAction.execute(elemento, createElemento(art2, true));

      const result = elementoReducer(state, action);

      expect(result.remissoes![art1.uuid!][0].valida).to.equal(false);

      const entradaArt3 = result.remissoes![art3.uuid!]?.[0];
      expect(entradaArt3, 'entrada de art3 deve sobreviver (é o mesmo dispositivo, só renumerado)').to.exist;
      expect(entradaArt3.targetLexmlId).to.equal('art2');
      expect(entradaArt3.textoRef).to.equal('art. 2º');
    });
  });
});
