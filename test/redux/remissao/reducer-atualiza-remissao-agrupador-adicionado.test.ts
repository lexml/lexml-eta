import { expect } from '@open-wc/testing';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { marcaAdicionado, montaState, detectaRemissoes } from '../../helpers/dispositivo-helper';

/**
 * Fase 5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): o mecanismo de
 * RemissaoRenumerada (evento emitido pelos reducers) foi substituído por sincronizarRemissoesPosAcao
 * (recálculo direto do registro por targetUuid, ver sincronizarRemissoes.ts). Este arquivo testava a
 * emissão do evento antigo especificamente para agrupadores (bug histórico: agrupaElemento.ts nunca
 * emitia RemissaoRenumerada). Agora testa o efeito equivalente: o registro reflete o novo
 * targetLexmlId/textoRef diretamente, sem depender de nenhum evento.
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

describe('Atualização de remissão ao adicionar agrupador (ADICIONAR_AGRUPADOR_ARTIGO)', () => {
  // ── Inserir Capítulo antes de cap1 ────────────────────────────────────────

  describe('Inserir Capítulo antes de cap1 → cap1 vira cap2, cap2 vira cap3', () => {
    it('remissão para cap1 (agora cap2) atualiza targetLexmlId/textoRef para "Capítulo II"', () => {
      const { state, cap1, art2 } = criaStateDoisCapitulos();

      const remissoes = detectaRemissoes(state, art2, 'Conforme o Capítulo I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap1');
      expect(remissoes[0].targetUuid).to.equal(cap1.uuid);
      expect(remissoes[0].textoRef).to.equal('Capítulo I');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap1, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      expect(cap1.id).to.equal('cap2');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('cap2');
      expect(entradaAtualizada.textoRef).to.equal('Capítulo II');
    });

    it('remissão para cap2 (agora cap3) atualiza targetLexmlId/textoRef para "Capítulo III"', () => {
      const { state, cap1, cap2, art2 } = criaStateDoisCapitulos();

      const remissoes = detectaRemissoes(state, art2, 'Conforme o Capítulo II.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap2');
      expect(remissoes[0].targetUuid).to.equal(cap2.uuid);
      expect(remissoes[0].textoRef).to.equal('Capítulo II');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap1, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      expect(cap2.id).to.equal('cap3');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('cap3');
      expect(entradaAtualizada.textoRef).to.equal('Capítulo III');
    });
  });

  // ── Inserir Capítulo antes de cap2 ────────────────────────────────────────

  describe('Inserir Capítulo antes de cap2 → somente cap2 vira cap3', () => {
    it('remissão para cap2 (agora cap3) atualiza; cap1 não é afetado', () => {
      const { state, cap1, cap2, art2 } = criaStateDoisCapitulos();
      const idCap1Antigo = cap1.id;

      const remissoes = detectaRemissoes(state, art2, 'Conforme o Capítulo II.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap2');
      expect(remissoes[0].textoRef).to.equal('Capítulo II');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(cap2, true),
        novo: { tipo: 'Capitulo', posicao: 'antes' },
      });

      expect(cap1.id, 'cap1 não deve ser renumerado').to.equal(idCap1Antigo);
      expect(cap2.id).to.equal('cap3');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('cap3');
      expect(entradaAtualizada.textoRef).to.equal('Capítulo III');
    });
  });

  // ── Inserir Seção dentro de Capítulo ──────────────────────────────────────

  describe('Inserir Seção antes de sec1 dentro de cap1 → sec1 vira sec2', () => {
    it('remissão para "Seção I do Capítulo I" (sec1) atualiza para "Seção II do Capítulo I"', () => {
      const { state, sec1, art2 } = criaStateCapituloComDuasSecoes();

      expect(sec1.id).to.equal('cap1_sec1');

      const remissoes = detectaRemissoes(state, art2, 'Conforme a Seção I do Capítulo I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap1_sec1');
      expect(remissoes[0].targetUuid).to.equal(sec1.uuid);
      expect(remissoes[0].textoRef).to.equal('Seção I do Capítulo I');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(sec1, true),
        novo: { tipo: 'Secao', posicao: 'antes' },
      });

      expect(sec1.id).to.equal('cap1_sec2');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('cap1_sec2');
      expect(entradaAtualizada.textoRef).to.equal('Seção II do Capítulo I');
    });
  });

  // ── Inserir Subseção dentro de Seção ──────────────────────────────────────

  describe('Inserir Subseção antes de sub1 dentro de sec1 → sub1 vira sub2', () => {
    it('remissão para "Subseção I da Seção I do Capítulo I" (sub1) atualiza para "Subseção II..."', () => {
      const { state, sub1, art2 } = criaStateSecaoComDuasSubsecoes();

      expect(sub1.id).to.equal('cap1_sec1_sub1');

      const remissoes = detectaRemissoes(state, art2, 'Conforme a Subseção I da Seção I do Capítulo I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('cap1_sec1_sub1');
      expect(remissoes[0].targetUuid).to.equal(sub1.uuid);
      expect(remissoes[0].textoRef).to.equal('Subseção I da Seção I do Capítulo I');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(sub1, true),
        novo: { tipo: 'Subsecao', posicao: 'antes' },
      });

      expect(sub1.id).to.equal('cap1_sec1_sub2');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('cap1_sec1_sub2');
      expect(entradaAtualizada.textoRef).to.equal('Subseção II da Seção I do Capítulo I');
    });
  });

  // ── Inserir Título ────────────────────────────────────────────────────────

  describe('Inserir Título antes de tit1 → tit1 vira tit2', () => {
    it('remissão para "Título I" (tit1) atualiza para "Título II"', () => {
      const { state, tit1, art2 } = criaStateDoisTitulos();

      expect(tit1.id).to.equal('tit1');

      const remissoes = detectaRemissoes(state, art2, 'Conforme o Título I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('tit1');
      expect(remissoes[0].targetUuid).to.equal(tit1.uuid);
      expect(remissoes[0].textoRef).to.equal('Título I');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(tit1, true),
        novo: { tipo: 'Titulo', posicao: 'antes' },
      });

      expect(tit1.id).to.equal('tit2');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('tit2');
      expect(entradaAtualizada.textoRef).to.equal('Título II');
    });
  });

  // ── Inserir Livro ─────────────────────────────────────────────────────────

  describe('Inserir Livro antes de liv1 → liv1 vira liv2', () => {
    it('remissão para "Livro I" (liv1) atualiza para "Livro II"', () => {
      const { state, liv1, art2 } = criaStateDoisLivros();

      expect(liv1.id).to.equal('liv1');

      const remissoes = detectaRemissoes(state, art2, 'Conforme o Livro I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('liv1');
      expect(remissoes[0].targetUuid).to.equal(liv1.uuid);
      expect(remissoes[0].textoRef).to.equal('Livro I');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(liv1, true),
        novo: { tipo: 'Livro', posicao: 'antes' },
      });

      expect(liv1.id).to.equal('liv2');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('liv2');
      expect(entradaAtualizada.textoRef).to.equal('Livro II');
    });
  });

  // ── Inserir Parte ─────────────────────────────────────────────────────────

  describe('Inserir Parte antes de prt1 → prt1 vira prt2', () => {
    it('remissão para "Parte I" (prt1) atualiza para "Parte II"', () => {
      const { state, prt1, art2 } = criaStateDoisPartes();

      expect(prt1.id).to.equal('prt1');

      const remissoes = detectaRemissoes(state, art2, 'Conforme a Parte I.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('prt1');
      expect(remissoes[0].targetUuid).to.equal(prt1.uuid);
      expect(remissoes[0].textoRef).to.equal('Parte I');

      state.remissoes = { [art2.uuid!]: remissoes };

      const result = elementoReducer(state, {
        type: ADICIONAR_AGRUPADOR_ARTIGO,
        atual: createElemento(prt1, true),
        novo: { tipo: 'Parte', posicao: 'antes' },
      });

      expect(prt1.id).to.equal('prt2');
      const entradaAtualizada = result.remissoes![art2.uuid!][0];
      expect(entradaAtualizada.targetLexmlId).to.equal('prt2');
      expect(entradaAtualizada.textoRef).to.equal('Parte II');
    });
  });
});
