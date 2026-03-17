import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { State } from '../../../src/redux/state';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoRegistry } from '../../../src/model/remissao';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Marca dispositivo (e caput, se artigo) como adicionado. */
const marcaAdicionado = (d: any): void => {
  d.situacao = new DispositivoAdicionado();
  if (d.caput) {
    (d as Artigo).caput!.situacao = new DispositivoAdicionado();
  }
};

/** Monta estado mínimo compatível com adicionaRemissaoInterna. */
const montaState = (articulacao: any): State => ({
  articulacao,
  modo: 'emenda',
  past: [],
  present: [],
  future: [],
  ui: { events: [] },
  remissoes: new RemissaoRegistry(),
});

/**
 * Executa adicionaRemissaoInterna com o texto no dispositivo `source` e
 * retorna o array de remissões criadas (ou []).
 */
const detecta = (state: State, source: any, texto: string): any[] => {
  source.texto = texto;
  const elemento = createElemento(source, true);
  const result = adicionaRemissaoInterna(state, { atual: elemento });
  return (result.remissoes as any)[source.uuid!] ?? [];
};

/**
 * Fixture principal:
 *   Articulação
 *   ├── Capítulo I
 *   │   ├── Seção I
 *   │   │   ├── Subseção I
 *   │   │   │   └── Art. 1º
 *   │   │   └── Art. 2º
 *   │   └── Art. 3º
 *   └── Capítulo II
 *       └── Art. 4º  ← fonte para referências absolutas
 */
const criaStateComCapitulosESections = () => {
  const articulacao = createArticulacao();

  const cap1 = criaDispositivo(articulacao, 'Capitulo');
  const sec1 = criaDispositivo(cap1, 'Secao');
  const subsec1 = criaDispositivo(sec1, 'Subsecao');
  const art1 = criaDispositivo(subsec1, 'Artigo');
  const art2 = criaDispositivo(sec1, 'Artigo');
  const art3 = criaDispositivo(cap1, 'Artigo');
  const cap2 = criaDispositivo(articulacao, 'Capitulo');
  const art4 = criaDispositivo(cap2, 'Artigo');

  // Renumeração top-down para que os números fiquem corretos
  articulacao.renumeraFilhos(); // cap1.numero='1', cap2.numero='2' + todos os arts
  cap1.renumeraFilhos(); // sec1.numero='1'
  sec1.renumeraFilhos(); // subsec1.numero='1'

  updateIdDispositivoAndFilhos(articulacao);

  [cap1, sec1, subsec1, cap2, art1, art2, art3, art4].forEach(marcaAdicionado);

  return { state: montaState(articulacao), articulacao, cap1, cap2, sec1, subsec1, art1, art2, art3, art4 };
};

/**
 * Fixture com Parte, Livro e Título como filhos diretos da Articulação.
 *
 *   Articulação
 *   ├── Parte I
 *   │   └── Livro I
 *   │       └── Título I
 *   │           └── Capítulo I
 *   │               └── Art. 1º
 *   └── Art. 2º  ← fonte para referências absolutas
 */
const criaStateComParteELivroETitulo = () => {
  const articulacao = createArticulacao();

  const prt1 = criaDispositivo(articulacao, 'Parte');
  const liv1 = criaDispositivo(prt1, 'Livro');
  const tit1 = criaDispositivo(liv1, 'Titulo');
  const cap1 = criaDispositivo(tit1, 'Capitulo');
  const art1 = criaDispositivo(cap1, 'Artigo');
  const art2 = criaDispositivo(articulacao, 'Artigo');

  articulacao.renumeraFilhos(); // prt1.numero='1'
  prt1.renumeraFilhos(); // liv1.numero='1'
  liv1.renumeraFilhos(); // tit1.numero='1'
  tit1.renumeraFilhos(); // cap1.numero='1'

  updateIdDispositivoAndFilhos(articulacao);

  [prt1, liv1, tit1, cap1, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), articulacao, prt1, liv1, tit1, cap1, art1, art2 };
};

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('Detecção de Remissões a Agrupadores (Etapa 1.4)', () => {
  // ── Absolutos: agrupador único ────────────────────────────────────────────

  describe('Absolutas — agrupador único', () => {
    it('[AG-01] "Capítulo I" → 1 remissão para cap1', () => {
      const { state, cap1, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme o Capítulo I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(cap1.uuid);
    });

    it('[AG-02] "Capítulo II" → 1 remissão para cap2', () => {
      const { state, cap2, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme o Capítulo II.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(cap2.uuid);
    });

    it('[AG-03] "Título I do Livro I da Parte I" → 1 remissão para tit1 (cadeia 3 níveis)', () => {
      const { state, tit1, art2 } = criaStateComParteELivroETitulo();
      const remissoes = detecta(state, art2, 'Conforme o Título I do Livro I da Parte I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(tit1.uuid);
    });

    it('[AG-04] "Livro I da Parte I" → 1 remissão para liv1 (cadeia 2 níveis)', () => {
      const { state, liv1, art2 } = criaStateComParteELivroETitulo();
      const remissoes = detecta(state, art2, 'Conforme o Livro I da Parte I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(liv1.uuid);
    });

    it('[AG-05] "Parte I" → 1 remissão para prt1', () => {
      const { state, prt1, art2 } = criaStateComParteELivroETitulo();
      const remissoes = detecta(state, art2, 'Conforme a Parte I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(prt1.uuid);
    });
  });

  // ── Absolutos: cadeia de agrupadores ─────────────────────────────────────

  describe('Absolutas — cadeia de agrupadores', () => {
    it('[AG-06] "Seção I do Capítulo I" → 1 remissão para sec1 (não para cap1)', () => {
      const { state, sec1, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme a Seção I do Capítulo I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(sec1.uuid);
    });

    it('[AG-07] "Subseção I da Seção I do Capítulo I" → 1 remissão para subsec1', () => {
      const { state, subsec1, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme a Subseção I da Seção I do Capítulo I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(subsec1.uuid);
    });
  });

  // ── Negativos ─────────────────────────────────────────────────────────────

  describe('Casos que não devem criar remissão a agrupador', () => {
    it('[AG-08] Capítulo inexistente → 0 remissões', () => {
      const { state, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme o Capítulo X.');

      expect(remissoes).to.have.length(0);
    });

    it('[AG-09] "Seção I" sem seção direta na articulação → 0 remissões', () => {
      // Seção I está dentro de Capítulo I, não diretamente na articulação
      const { state, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme a Seção I.');

      expect(remissoes).to.have.length(0);
    });

    it('[AG-10] Seção com número errado na cadeia → 0 remissões', () => {
      const { state, art4 } = criaStateComCapitulosESections();
      // Capítulo I existe mas não tem Seção III
      const remissoes = detecta(state, art4, 'Conforme a Seção III do Capítulo I.');

      expect(remissoes).to.have.length(0);
    });

    it('[AG-11] Texto sem nenhum agrupador → 0 remissões', () => {
      const { state, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme o art. 1º.');

      // Pode haver remissão para o art1, mas nenhuma para agrupador
      const remissoesAgrupador = remissoes.filter((r: any) => r.targetLexmlId?.startsWith('cap') || r.targetLexmlId?.startsWith('sec'));
      expect(remissoesAgrupador).to.have.length(0);
    });
  });

  // ── Contextuais de agrupador ──────────────────────────────────────────────

  describe('Contextuais — agrupador filho de ancestral', () => {
    it('[AG-12] "Seção I deste Capítulo" → encontra sec1 via ancestral cap1', () => {
      // art1 tem cap1 como ancestral; busca sec1 entre os filhos de cap1
      const { state, sec1, art1 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art1, 'Conforme a Seção I deste Capítulo.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(sec1.uuid);
    });

    it('[AG-13] "Subseção I desta Seção" → encontra subsec1 via ancestral sec1', () => {
      const { state, subsec1, art1 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art1, 'Conforme a Subseção I desta Seção.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(subsec1.uuid);
    });

    it('[AG-14] Agrupador filho inexistente → 0 remissões', () => {
      // art1 tem cap1 como ancestral; Seção III não existe em cap1
      const { state, art1 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art1, 'Conforme a Seção III deste Capítulo.');

      expect(remissoes).to.have.length(0);
    });

    it('[AG-15] Ancestral inexistente → 0 remissões', () => {
      // art4 está em cap2 que não tem Seção; não há ancestral Seção
      const { state, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme a Subseção I desta Seção.');

      expect(remissoes).to.have.length(0);
    });
  });

  // ── Múltiplos e misto ─────────────────────────────────────────────────────

  describe('Múltiplas remissões e misto com artigos', () => {
    it('[AG-16] Dois capítulos no mesmo texto → 2 remissões', () => {
      const { state, cap1, cap2, art4 } = criaStateComCapitulosESections();
      const remissoes = detecta(state, art4, 'Conforme o Capítulo I e o Capítulo II.');

      expect(remissoes).to.have.length(2);
      const uuids = remissoes.map((r: any) => r.targetUuid);
      expect(uuids).to.include(cap1.uuid);
      expect(uuids).to.include(cap2.uuid);
    });

    it('[AG-17] Capítulo + artigo no mesmo texto → 2 remissões independentes', () => {
      const { state, cap1, art4 } = criaStateComCapitulosESections();
      // art1 é o Art. 1º da articulação
      const remissoes = detecta(state, art4, 'Conforme o Capítulo I e o art. 1º.');

      expect(remissoes).to.have.length(2);
      const uuids = remissoes.map((r: any) => r.targetUuid);
      expect(uuids).to.include(cap1.uuid);
    });
  });
});
