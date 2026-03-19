import { expect } from '@open-wc/testing';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { marcaAdicionado, montaState, detectaRemissoes } from '../../helpers/dispositivo-helper';
import { atualizarTextoRemissao } from '../../../src/model/remissao/lexmlIdUtil';

/**
 * Reprodução do bug:
 *   Art. 2 referencia "Capítulo I". Ao inserir um novo agrupador antes de
 *   Cap. I (que passa a ser Cap. II), o texto do link permanece "Capítulo I".
 *
 *   Causa raiz: agrupaElemento.ts não emite eventos RemissaoRenumerada
 *   para os agrupadores renumerados (ao contrário de adicionaElemento.ts,
 *   que o faz via mapeamentoLexmlIds).
 */

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Articulação:
 *   ├── Capítulo I  (cap1)
 *   │   └── Art. 1º (art1)
 *   └── Capítulo II (cap2)
 *       └── Art. 2º (art2)  ← fonte das remissões
 */
const criaStateDoisCapitulos = (): { state: State; cap1: any; cap2: any; art1: any; art2: any } => {
  const articulacao = createArticulacao();

  const cap1 = criaDispositivo(articulacao, 'Capitulo');
  const art1 = criaDispositivo(cap1, 'Artigo');
  const cap2 = criaDispositivo(articulacao, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  art1.texto = 'Artigo 1.';

  articulacao.renumeraFilhos();
  cap1.renumeraFilhos();
  cap2.renumeraFilhos();

  [cap1, cap2, art1, art2].forEach(d => d.createRotulo(d));
  updateIdDispositivoAndFilhos(articulacao);
  [cap1, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), cap1, cap2, art1, art2 };
};

/**
 * Articulação:
 *   ├── Capítulo I  (cap1)
 *   │   ├── Seção I  (cap1_sec1)
 *   │   │   └── Art. 1º (art1)
 *   │   └── Seção II (cap1_sec2)
 *   └── Capítulo II (cap2)
 *       └── Art. 2º (art2)   ← fonte das remissões
 */
const criaStateCapituloComDuasSecoes = (): { state: State; cap1: any; cap2: any; sec1: any; sec2: any; art1: any; art2: any } => {
  const articulacao = createArticulacao();

  const cap1 = criaDispositivo(articulacao, 'Capitulo');
  const sec1 = criaDispositivo(cap1, 'Secao');
  const art1 = criaDispositivo(sec1, 'Artigo');
  const sec2 = criaDispositivo(cap1, 'Secao');
  const cap2 = criaDispositivo(articulacao, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  art1.texto = 'Artigo 1.';

  articulacao.renumeraFilhos();
  cap1.renumeraFilhos();
  sec1.renumeraFilhos();
  cap2.renumeraFilhos();

  [cap1, sec1, sec2, cap2, art1, art2].forEach(d => d.createRotulo(d));
  updateIdDispositivoAndFilhos(articulacao);
  [cap1, sec1, sec2, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), cap1, cap2, sec1, sec2, art1, art2 };
};

/**
 * Articulação:
 *   ├── Capítulo I  (cap1)
 *   │   └── Seção I  (cap1_sec1)
 *   │       ├── Subseção I  (cap1_sec1_sub1)
 *   │       │   └── Art. 1º (art1)
 *   │       └── Subseção II (cap1_sec1_sub2)
 *   └── Capítulo II (cap2)
 *       └── Art. 2º (art2)   ← fonte das remissões
 */
const criaStateSecaoComDuasSubsecoes = (): { state: State; cap1: any; cap2: any; sec1: any; sub1: any; sub2: any; art1: any; art2: any } => {
  const articulacao = createArticulacao();

  const cap1 = criaDispositivo(articulacao, 'Capitulo');
  const sec1 = criaDispositivo(cap1, 'Secao');
  const sub1 = criaDispositivo(sec1, 'Subsecao');
  const art1 = criaDispositivo(sub1, 'Artigo');
  const sub2 = criaDispositivo(sec1, 'Subsecao');
  const cap2 = criaDispositivo(articulacao, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  art1.texto = 'Artigo 1.';

  articulacao.renumeraFilhos();
  cap1.renumeraFilhos();
  sec1.renumeraFilhos();
  sub1.renumeraFilhos();
  cap2.renumeraFilhos();

  [cap1, sec1, sub1, sub2, cap2, art1, art2].forEach(d => d.createRotulo(d));
  updateIdDispositivoAndFilhos(articulacao);
  [cap1, sec1, sub1, sub2, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), cap1, cap2, sec1, sub1, sub2, art1, art2 };
};

/**
 * Articulação:
 *   ├── Título I  (tit1)
 *   │   └── Capítulo I (tit1_cap1)
 *   │       └── Art. 1º  (art1)
 *   └── Título II (tit2)
 *       └── Capítulo I (tit2_cap1)
 *           └── Art. 2º (art2)  ← fonte das remissões
 */
const criaStateDoisTitulos = (): { state: State; tit1: any; tit2: any; art2: any } => {
  const articulacao = createArticulacao();

  const tit1 = criaDispositivo(articulacao, 'Titulo');
  const cap1 = criaDispositivo(tit1, 'Capitulo');
  const art1 = criaDispositivo(cap1, 'Artigo');
  const tit2 = criaDispositivo(articulacao, 'Titulo');
  const cap2 = criaDispositivo(tit2, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  art1.texto = 'Artigo 1.';

  articulacao.renumeraFilhos();
  tit1.renumeraFilhos();
  cap1.renumeraFilhos();
  tit2.renumeraFilhos();
  cap2.renumeraFilhos();

  [tit1, cap1, tit2, cap2, art1, art2].forEach(d => d.createRotulo(d));
  updateIdDispositivoAndFilhos(articulacao);
  [tit1, cap1, tit2, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), tit1, tit2, art2 };
};

/**
 * Articulação:
 *   ├── Livro I  (liv1)
 *   │   └── Capítulo I (liv1_cap1)
 *   │       └── Art. 1º  (art1)
 *   └── Livro II (liv2)
 *       └── Capítulo I (liv2_cap1)
 *           └── Art. 2º (art2)  ← fonte das remissões
 */
const criaStateDoisLivros = (): { state: State; liv1: any; liv2: any; art2: any } => {
  const articulacao = createArticulacao();

  const liv1 = criaDispositivo(articulacao, 'Livro');
  const cap1 = criaDispositivo(liv1, 'Capitulo');
  const art1 = criaDispositivo(cap1, 'Artigo');
  const liv2 = criaDispositivo(articulacao, 'Livro');
  const cap2 = criaDispositivo(liv2, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  art1.texto = 'Artigo 1.';

  articulacao.renumeraFilhos();
  liv1.renumeraFilhos();
  cap1.renumeraFilhos();
  liv2.renumeraFilhos();
  cap2.renumeraFilhos();

  [liv1, cap1, liv2, cap2, art1, art2].forEach(d => d.createRotulo(d));
  updateIdDispositivoAndFilhos(articulacao);
  [liv1, cap1, liv2, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), liv1, liv2, art2 };
};

/**
 * Articulação:
 *   ├── Parte I  (prt1)
 *   │   └── Capítulo I (prt1_cap1)
 *   │       └── Art. 1º  (art1)
 *   └── Parte II (prt2)
 *       └── Capítulo I (prt2_cap1)
 *           └── Art. 2º (art2)  ← fonte das remissões
 */
const criaStateDoisPartes = (): { state: State; prt1: any; prt2: any; art2: any } => {
  const articulacao = createArticulacao();

  const prt1 = criaDispositivo(articulacao, 'Parte');
  const cap1 = criaDispositivo(prt1, 'Capitulo');
  const art1 = criaDispositivo(cap1, 'Artigo');
  const prt2 = criaDispositivo(articulacao, 'Parte');
  const cap2 = criaDispositivo(prt2, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  art1.texto = 'Artigo 1.';

  articulacao.renumeraFilhos();
  prt1.renumeraFilhos();
  cap1.renumeraFilhos();
  prt2.renumeraFilhos();
  cap2.renumeraFilhos();

  [prt1, cap1, prt2, cap2, art1, art2].forEach(d => d.createRotulo(d));
  updateIdDispositivoAndFilhos(articulacao);
  [prt1, cap1, prt2, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), prt1, prt2, art2 };
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('Bug: RemissaoRenumerada não emitida ao adicionar agrupador (ADICIONAR_AGRUPADOR_ARTIGO)', () => {
  // ── Inserir Capítulo antes de cap1 ────────────────────────────────────────

  describe('Inserir Capítulo antes de cap1 → cap1 vira cap2, cap2 vira cap3', () => {
    it('deve emitir RemissaoRenumerada para cap1 → cap2 e o texto "Capítulo I" atualiza para "Capítulo II"', () => {
      const { state, cap1, art2 } = criaStateDoisCapitulos();

      // Detecta remissão inicial: art2 referencia "Capítulo I" (cap1)
      const remissoes = detectaRemissoes(state, art2, 'Conforme o Capítulo I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap1');
      expect(remissoes[0].targetUuid).to.equal(cap1.uuid);
      expect(remissoes[0].textoRef).to.equal('Capítulo I');

      // Adiciona novo capítulo antes de cap1
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap1, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      // Deve emitir RemissaoRenumerada: cap1 → cap2
      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      const eventoCap1 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'cap1');
      expect(eventoCap1, 'evento RemissaoRenumerada para cap1 deve existir').to.exist;
      expect(eventoCap1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('cap2');
      expect(eventoCap1!.remissaoRenumeracao!.novoUuid).to.equal(cap1.uuid);

      // O texto do link seria atualizado corretamente com os dados do evento
      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoCap1!.remissaoRenumeracao!.lexmlIdAntigo, eventoCap1!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Capítulo II');
    });

    it('deve emitir RemissaoRenumerada para cap2 → cap3 e o texto "Capítulo II" atualiza para "Capítulo III"', () => {
      const { state, cap1, cap2, art2 } = criaStateDoisCapitulos();

      // Detecta remissão inicial: art2 referencia "Capítulo II" (cap2)
      const remissoes = detectaRemissoes(state, art2, 'Conforme o Capítulo II.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap2');
      expect(remissoes[0].targetUuid).to.equal(cap2.uuid);
      expect(remissoes[0].textoRef).to.equal('Capítulo II');

      // Adiciona novo capítulo antes de cap1 → cap2 renumera para cap3
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap1, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      const eventoCap2 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'cap2');
      expect(eventoCap2, 'evento RemissaoRenumerada para cap2 deve existir').to.exist;
      expect(eventoCap2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('cap3');
      expect(eventoCap2!.remissaoRenumeracao!.novoUuid).to.equal(cap2.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoCap2!.remissaoRenumeracao!.lexmlIdAntigo, eventoCap2!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Capítulo III');
    });

    it('deve emitir exatamente 2 eventos RemissaoRenumerada (cap1→cap2 e cap2→cap3)', () => {
      const { state, cap1 } = criaStateDoisCapitulos();

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap1, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      expect(renumerados.length).to.equal(2);
    });
  });

  // ── Inserir Capítulo antes de cap2 ────────────────────────────────────────

  describe('Inserir Capítulo antes de cap2 → somente cap2 vira cap3', () => {
    it('deve emitir RemissaoRenumerada apenas para cap2 → cap3 e o texto "Capítulo II" atualiza para "Capítulo III"', () => {
      const { state, cap2, art2 } = criaStateDoisCapitulos();

      // Detecta remissão inicial: art2 referencia "Capítulo II" (cap2)
      const remissoes = detectaRemissoes(state, art2, 'Conforme o Capítulo II.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap2');
      expect(remissoes[0].textoRef).to.equal('Capítulo II');

      // Adiciona novo capítulo ANTES de cap2 (entre cap1 e cap2)
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap2, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      expect(renumerados.length, 'somente cap2 deve ser renumerado').to.equal(1);

      const eventoCap2 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'cap2');
      expect(eventoCap2).to.exist;
      expect(eventoCap2!.remissaoRenumeracao!.lexmlIdNovo).to.equal('cap3');
      expect(eventoCap2!.remissaoRenumeracao!.novoUuid).to.equal(cap2.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoCap2!.remissaoRenumeracao!.lexmlIdAntigo, eventoCap2!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Capítulo III');
    });

    it('não deve emitir RemissaoRenumerada para cap1 (não é renumerado)', () => {
      const { state, cap2 } = criaStateDoisCapitulos();

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap2, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter(ev => ev.stateType === StateType.RemissaoRenumerada);
      const eventoCap1 = renumerados.find(ev => ev.remissaoRenumeracao?.lexmlIdAntigo === 'cap1');
      expect(eventoCap1, 'cap1 não deve ser renumerado').to.not.exist;
    });
  });

  // ── Inserir Seção dentro de Capítulo ──────────────────────────────────────

  describe('Inserir Seção antes de sec1 dentro de cap1 → sec1 vira sec2', () => {
    it('deve emitir RemissaoRenumerada para cap1_sec1 → cap1_sec2 e o texto "Seção I do Capítulo I" atualiza para "Seção II do Capítulo I"', () => {
      const { state, sec1, art2 } = criaStateCapituloComDuasSecoes();

      expect(sec1.id).to.equal('cap1_sec1');

      // Detecta remissão inicial: art2 referencia "Seção I do Capítulo I" (sec1)
      const remissoes = detectaRemissoes(state, art2, 'Conforme a Seção I do Capítulo I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap1_sec1');
      expect(remissoes[0].targetUuid).to.equal(sec1.uuid);
      expect(remissoes[0].textoRef).to.equal('Seção I do Capítulo I');

      // Adiciona nova seção antes de sec1
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(sec1, true),
        novo: { tipo: 'Secao', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter((ev: any) => ev.stateType === StateType.RemissaoRenumerada);
      const eventoSec1 = renumerados.find((ev: any) => ev.remissaoRenumeracao?.lexmlIdAntigo === 'cap1_sec1');
      expect(eventoSec1, 'evento RemissaoRenumerada para cap1_sec1 deve existir').to.exist;
      expect(eventoSec1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('cap1_sec2');
      expect(eventoSec1!.remissaoRenumeracao!.novoUuid).to.equal(sec1.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoSec1!.remissaoRenumeracao!.lexmlIdAntigo, eventoSec1!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Seção II do Capítulo I');
    });
  });

  // ── Inserir Subseção dentro de Seção ──────────────────────────────────────

  describe('Inserir Subseção antes de sub1 dentro de sec1 → sub1 vira sub2', () => {
    it('deve emitir RemissaoRenumerada para cap1_sec1_sub1 → cap1_sec1_sub2 e o texto "Subseção I da Seção I do Capítulo I" atualiza para "Subseção II da Seção I do Capítulo I"', () => {
      const { state, sub1, art2 } = criaStateSecaoComDuasSubsecoes();

      expect(sub1.id).to.equal('cap1_sec1_sub1');

      // Detecta remissão inicial: art2 referencia "Subseção I da Seção I do Capítulo I"
      const remissoes = detectaRemissoes(state, art2, 'Conforme a Subseção I da Seção I do Capítulo I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap1_sec1_sub1');
      expect(remissoes[0].targetUuid).to.equal(sub1.uuid);
      expect(remissoes[0].textoRef).to.equal('Subseção I da Seção I do Capítulo I');

      // Adiciona nova subseção antes de sub1
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(sub1, true),
        novo: { tipo: 'Subsecao', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter((ev: any) => ev.stateType === StateType.RemissaoRenumerada);
      const eventoSub1 = renumerados.find((ev: any) => ev.remissaoRenumeracao?.lexmlIdAntigo === 'cap1_sec1_sub1');
      expect(eventoSub1, 'evento RemissaoRenumerada para cap1_sec1_sub1 deve existir').to.exist;
      expect(eventoSub1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('cap1_sec1_sub2');
      expect(eventoSub1!.remissaoRenumeracao!.novoUuid).to.equal(sub1.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoSub1!.remissaoRenumeracao!.lexmlIdAntigo, eventoSub1!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Subseção II da Seção I do Capítulo I');
    });
  });

  // ── Inserir Título ────────────────────────────────────────────────────────

  describe('Inserir Título antes de tit1 → tit1 vira tit2', () => {
    it('deve emitir RemissaoRenumerada para tit1 → tit2 e o texto "Título I" atualiza para "Título II"', () => {
      const { state, tit1, art2 } = criaStateDoisTitulos();

      expect(tit1.id).to.equal('tit1');

      // Detecta remissão inicial: art2 referencia "Título I" (tit1)
      const remissoes = detectaRemissoes(state, art2, 'Conforme o Título I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('tit1');
      expect(remissoes[0].targetUuid).to.equal(tit1.uuid);
      expect(remissoes[0].textoRef).to.equal('Título I');

      // Adiciona novo título antes de tit1
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(tit1, true),
        novo: { tipo: 'Titulo', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter((ev: any) => ev.stateType === StateType.RemissaoRenumerada);
      const eventoTit1 = renumerados.find((ev: any) => ev.remissaoRenumeracao?.lexmlIdAntigo === 'tit1');
      expect(eventoTit1, 'evento RemissaoRenumerada para tit1 deve existir').to.exist;
      expect(eventoTit1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('tit2');
      expect(eventoTit1!.remissaoRenumeracao!.novoUuid).to.equal(tit1.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoTit1!.remissaoRenumeracao!.lexmlIdAntigo, eventoTit1!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Título II');
    });
  });

  // ── Inserir Livro ─────────────────────────────────────────────────────────

  describe('Inserir Livro antes de liv1 → liv1 vira liv2', () => {
    it('deve emitir RemissaoRenumerada para liv1 → liv2 e o texto "Livro I" atualiza para "Livro II"', () => {
      const { state, liv1, art2 } = criaStateDoisLivros();

      expect(liv1.id).to.equal('liv1');

      // Detecta remissão inicial: art2 referencia "Livro I" (liv1)
      const remissoes = detectaRemissoes(state, art2, 'Conforme o Livro I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('liv1');
      expect(remissoes[0].targetUuid).to.equal(liv1.uuid);
      expect(remissoes[0].textoRef).to.equal('Livro I');

      // Adiciona novo livro antes de liv1
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(liv1, true),
        novo: { tipo: 'Livro', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter((ev: any) => ev.stateType === StateType.RemissaoRenumerada);
      const eventoLiv1 = renumerados.find((ev: any) => ev.remissaoRenumeracao?.lexmlIdAntigo === 'liv1');
      expect(eventoLiv1, 'evento RemissaoRenumerada para liv1 deve existir').to.exist;
      expect(eventoLiv1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('liv2');
      expect(eventoLiv1!.remissaoRenumeracao!.novoUuid).to.equal(liv1.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoLiv1!.remissaoRenumeracao!.lexmlIdAntigo, eventoLiv1!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Livro II');
    });
  });

  // ── Inserir Parte ─────────────────────────────────────────────────────────

  describe('Inserir Parte antes de prt1 → prt1 vira prt2', () => {
    it('deve emitir RemissaoRenumerada para prt1 → prt2 e o texto "Parte I" atualiza para "Parte II"', () => {
      const { state, prt1, art2 } = criaStateDoisPartes();

      expect(prt1.id).to.equal('prt1');

      // Detecta remissão inicial: art2 referencia "Parte I" (prt1)
      const remissoes = detectaRemissoes(state, art2, 'Conforme a Parte I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('prt1');
      expect(remissoes[0].targetUuid).to.equal(prt1.uuid);
      expect(remissoes[0].textoRef).to.equal('Parte I');

      // Adiciona nova parte antes de prt1
      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(prt1, true),
        novo: { tipo: 'Parte', posicao: 'antes' },
      });

      const renumerados = result.ui!.events.filter((ev: any) => ev.stateType === StateType.RemissaoRenumerada);
      const eventoPrt1 = renumerados.find((ev: any) => ev.remissaoRenumeracao?.lexmlIdAntigo === 'prt1');
      expect(eventoPrt1, 'evento RemissaoRenumerada para prt1 deve existir').to.exist;
      expect(eventoPrt1!.remissaoRenumeracao!.lexmlIdNovo).to.equal('prt2');
      expect(eventoPrt1!.remissaoRenumeracao!.novoUuid).to.equal(prt1.uuid);

      const textoAtualizado = atualizarTextoRemissao(remissoes[0].textoRef, eventoPrt1!.remissaoRenumeracao!.lexmlIdAntigo, eventoPrt1!.remissaoRenumeracao!.lexmlIdNovo);
      expect(textoAtualizado).to.equal('Parte II');
    });
  });
});
