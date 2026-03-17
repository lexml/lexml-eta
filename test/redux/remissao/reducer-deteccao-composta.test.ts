import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { State } from '../../../src/redux/state';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Marca dispositivo (e caput, se artigo) como adicionado */
const marcaAdicionado = (d: any): void => {
  d.situacao = new DispositivoAdicionado();
  if (d.caput) {
    (d as Artigo).caput!.situacao = new DispositivoAdicionado();
  }
};

/**
 * Cria state com articulação contendo `n` artigos numerados sequencialmente.
 * Retorna o state e a lista de artigos.
 */
const criaStateComNArtigos = (n: number): { state: State; artigos: any[] } => {
  const articulacao = createArticulacao();
  const artigos: any[] = [];
  for (let i = 0; i < n; i++) {
    const art = criaDispositivo(articulacao, 'Artigo');
    art.texto = `Artigo ${i + 1}.`;
    artigos.push(art);
  }
  articulacao.renumeraFilhos();
  artigos.forEach(a => a.createRotulo(a));
  updateIdDispositivoAndFilhos(articulacao);
  artigos.forEach(marcaAdicionado);

  return {
    state: {
      articulacao,
      modo: 'emenda',
      past: [],
      present: [],
      future: [],
      ui: { events: [] },
      remissoes: {},
    },
    artigos,
  };
};

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

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('Detecção de Remissões Compostas (Etapa 1.1)', () => {
  // ── Retrocompatibilidade ───────────────────────────────────────────────────

  describe('Retrocompatibilidade — artigo simples', () => {
    it('[CT-R1] "art. 5º" → 1 remissão para art5', () => {
      const { state, artigos } = criaStateComNArtigos(5);
      const remissoes = detecta(state, artigos[0], 'Conforme o art. 5º.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art5');
    });

    it('[CT-R2] "art. 1º" → 1 remissão para art1', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const remissoes = detecta(state, artigos[1], 'Conforme o art. 1º.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art1');
    });

    it('[CT-R3] Múltiplos artigos simples → 2 remissões', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const remissoes = detecta(state, artigos[0], 'Refere-se ao art. 2º e ao art. 3º.');

      expect(remissoes).to.have.length(2);
      const ids = remissoes.map((r: any) => r.targetLexmlId);
      expect(ids).to.include('art2');
      expect(ids).to.include('art3');
    });
  });

  // ── Composto: artigo + parágrafo ───────────────────────────────────────────

  describe('Composto: artigo + parágrafo', () => {
    let state: State;
    let art1: any;
    let art5: any;

    beforeEach(() => {
      const setup = criaStateComNArtigos(5);
      state = setup.state;
      art1 = setup.artigos[0];
      art5 = setup.artigos[4];

      // Adiciona 2 parágrafos ao art. 5
      const par1 = criaDispositivo(art5, 'Paragrafo');
      const par2 = criaDispositivo(art5, 'Paragrafo');
      par1.texto = 'Parágrafo 1.';
      par2.texto = 'Parágrafo 2.';
      art5.renumeraFilhos();
      par1.createRotulo(par1);
      par2.createRotulo(par2);
      updateIdDispositivoAndFilhos(state.articulacao!);
      marcaAdicionado(par1);
      marcaAdicionado(par2);
    });

    it('[CT-C1] "§ 2º do art. 5º" → 1 remissão para art5_par2', () => {
      const remissoes = detecta(state, art1, 'Conforme o § 2º do art. 5º.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art5_par2');
    });

    it('[CT-C2] "§ 2º do art. 5º" → exatamente 1 remissão (sem double-match)', () => {
      // Garante que § 2º sozinho NÃO cria remissão adicional
      const remissoes = detecta(state, art1, 'Conforme o § 2º do art. 5º.');

      expect(remissoes).to.have.length(1, 'Deve criar exatamente 1 remissão, não 2 (uma para § e outra para art)');
    });

    it('[CT-C3] "parágrafo único do art. 5º" → 1 remissão para art5 (parágrafo 1)', () => {
      // "parágrafo único" referencia o primeiro parágrafo
      const remissoes = detecta(state, art1, 'Conforme o parágrafo único do art. 5º.');

      // Deve criar 1 remissão (o parser resolve "parágrafo único" → busca parágrafo único)
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.match(/^art5_par/);
    });
  });

  // ── Composto: artigo + parágrafo + inciso ─────────────────────────────────

  describe('Composto: artigo + parágrafo + inciso', () => {
    let state: State;
    let art1: any;
    let inciso2: any;

    beforeEach(() => {
      const setup = criaStateComNArtigos(16);
      state = setup.state;
      art1 = setup.artigos[0];
      const art16 = setup.artigos[15];

      // art16: 2 parágrafos
      const par1 = criaDispositivo(art16, 'Paragrafo');
      const par2 = criaDispositivo(art16, 'Paragrafo');
      par1.texto = 'Parágrafo 1.';
      par2.texto = 'Parágrafo 2.';

      // par2: 2 incisos
      const inc1 = criaDispositivo(par2, 'Inciso');
      inciso2 = criaDispositivo(par2, 'Inciso');
      inc1.texto = 'Inciso I.';
      inciso2.texto = 'Inciso II.';

      // Marcar como adicionado ANTES de renumerar (renumeraFilhos só processa adicionados)
      [par1, par2, inc1, inciso2].forEach(marcaAdicionado);

      // Renumerar em cascata: artigo → paragrafos; paragrafo → incisos
      art16.renumeraFilhos(); // seta par1.numero=1, par2.numero=2
      par2.renumeraFilhos(); // seta inc1.numero=1, inc2.numero=2
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-C4] "inciso II do § 2º do art. 16" → 1 remissão para art16_par2_inc2', () => {
      const remissoes = detecta(state, art1, 'Conforme o inciso II do § 2º do art. 16.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art16_par2_inc2');
    });

    it('[CT-C5] "inciso II do § 2º do art. 16" → exatamente 1 remissão (sem double-match)', () => {
      // Antes da correção: gerava 3 remissões (art16, par2 inválido, inc2 inválido)
      const remissoes = detecta(state, art1, 'Conforme o inciso II do § 2º do art. 16.');

      expect(remissoes).to.have.length(1, 'Deve criar exatamente 1 remissão, não 3 (uma para inciso, uma para §, uma para art)');
    });
  });

  // ── Composto: artigo + parágrafo + inciso + alínea ────────────────────────

  describe('Composto: artigo + parágrafo + inciso + alínea', () => {
    let state: State;
    let art1: any;
    let alinea1: any;

    beforeEach(() => {
      const setup = criaStateComNArtigos(5);
      state = setup.state;
      art1 = setup.artigos[0];
      const art5 = setup.artigos[4];

      // art5: 2 parágrafos
      const par1 = criaDispositivo(art5, 'Paragrafo');
      const par2 = criaDispositivo(art5, 'Paragrafo');
      par1.texto = 'Parágrafo 1.';
      par2.texto = 'Parágrafo 2.';

      // par2: 1 inciso
      const inc1 = criaDispositivo(par2, 'Inciso');
      inc1.texto = 'Inciso I.';

      // inc1: 2 alíneas
      alinea1 = criaDispositivo(inc1, 'Alinea');
      const alinea2 = criaDispositivo(inc1, 'Alinea');
      alinea1.texto = 'Alínea a.';
      alinea2.texto = 'Alínea b.';

      // Marcar como adicionado ANTES de renumerar
      [par1, par2, inc1, alinea1, alinea2].forEach(marcaAdicionado);

      // Renumerar em cascata: artigo → paragrafos; paragrafo → incisos; inciso → alíneas
      art5.renumeraFilhos(); // par1.numero=1, par2.numero=2
      par2.renumeraFilhos(); // inc1.numero=1
      inc1.renumeraFilhos(); // ali1.numero=1, ali2.numero=2
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-C6] "alínea a do inciso I do § 2º do art. 5º" → 1 remissão para art5_par2_inc1_ali1', () => {
      const remissoes = detecta(state, art1, 'Conforme a alínea a do inciso I do § 2º do art. 5º.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal(alinea1.id);
      expect(remissoes[0].targetLexmlId).to.match(/^art5_par2_inc1_ali/);
    });

    it('[CT-C7] "alínea a do inciso I do § 2º do art. 5º" → exatamente 1 remissão (sem double-match)', () => {
      const remissoes = detecta(state, art1, 'Conforme a alínea a do inciso I do § 2º do art. 5º.');

      expect(remissoes).to.have.length(1, 'Deve criar exatamente 1 remissão, não 4');
    });
  });

  // ── Casos de não-criação ───────────────────────────────────────────────────

  describe('Casos que não devem criar remissão', () => {
    it('[CT-N1] "§ 2º" isolado (sem artigo âncora) → 0 remissões', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const art1 = artigos[0];
      const art2 = artigos[1];

      // Adiciona parágrafo ao art2
      const par2 = criaDispositivo(art2, 'Paragrafo');
      par2.texto = 'Parágrafo.';
      art2.renumeraFilhos();
      par2.createRotulo(par2);
      updateIdDispositivoAndFilhos(state.articulacao!);
      marcaAdicionado(par2);

      const remissoes = detecta(state, art1, 'Conforme o § 2º.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-N2] "inciso II" isolado (sem artigo âncora) → 0 remissões', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const remissoes = detecta(state, artigos[0], 'Conforme o inciso II.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-N3] Artigo inexistente → 0 remissões', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const remissoes = detecta(state, artigos[0], 'Conforme o art. 999.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-N4] Parágrafo inexistente no artigo → 0 remissões', () => {
      // art2 sem parágrafos, texto menciona "§ 5º do art. 2º"
      const { state, artigos } = criaStateComNArtigos(3);
      const remissoes = detecta(state, artigos[0], 'Conforme o § 5º do art. 2º.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-N5] Inciso inexistente no parágrafo → 0 remissões', () => {
      const { state, artigos } = criaStateComNArtigos(5);
      const art5 = artigos[4];

      // art5 com 1 parágrafo e 1 inciso
      const par1 = criaDispositivo(art5, 'Paragrafo');
      const inc1 = criaDispositivo(par1, 'Inciso');
      par1.texto = 'Par.';
      inc1.texto = 'Inc.';
      art5.renumeraFilhos();
      [par1, inc1].forEach(d => d.createRotulo(d));
      updateIdDispositivoAndFilhos(state.articulacao!);
      [par1, inc1].forEach(marcaAdicionado);

      // Menciona inciso X que não existe
      const remissoes = detecta(state, artigos[0], 'Conforme o inciso X do § 1º do art. 5º.');
      expect(remissoes).to.have.length(0);
    });
  });

  // ── Múltiplas remissões compostas no mesmo texto ───────────────────────────

  describe('Múltiplas remissões compostas no mesmo dispositivo', () => {
    it('[CT-M1] Dois compostos independentes → 2 remissões corretas', () => {
      const { state, artigos } = criaStateComNArtigos(5);
      const art3 = artigos[2];
      const art5 = artigos[4];

      // art3: 2 parágrafos
      const par1art3 = criaDispositivo(art3, 'Paragrafo');
      par1art3.texto = 'Par.';
      art3.renumeraFilhos();
      par1art3.createRotulo(par1art3);
      updateIdDispositivoAndFilhos(state.articulacao!);
      marcaAdicionado(par1art3);

      // art5: 3 parágrafos
      const par1 = criaDispositivo(art5, 'Paragrafo');
      const par2 = criaDispositivo(art5, 'Paragrafo');
      const par3 = criaDispositivo(art5, 'Paragrafo');
      [par1, par2, par3].forEach(p => (p.texto = 'Par.'));
      art5.renumeraFilhos();
      [par1, par2, par3].forEach(p => p.createRotulo(p));
      updateIdDispositivoAndFilhos(state.articulacao!);
      [par1, par2, par3].forEach(marcaAdicionado);

      const remissoes = detecta(state, artigos[0], 'Conforme o § 1º do art. 3º e o § 3º do art. 5º.');

      expect(remissoes).to.have.length(2);
      const ids = remissoes.map((r: any) => r.targetLexmlId);
      expect(ids).to.include('art3_par1');
      expect(ids).to.include('art5_par3');
    });

    it('[CT-M2] Composto e simples no mesmo texto → 2 remissões corretas', () => {
      const { state, artigos } = criaStateComNArtigos(5);
      const art5 = artigos[4];

      // art5: 2 parágrafos
      const par1 = criaDispositivo(art5, 'Paragrafo');
      const par2 = criaDispositivo(art5, 'Paragrafo');
      [par1, par2].forEach(p => (p.texto = 'Par.'));
      art5.renumeraFilhos();
      [par1, par2].forEach(p => p.createRotulo(p));
      updateIdDispositivoAndFilhos(state.articulacao!);
      [par1, par2].forEach(marcaAdicionado);

      const remissoes = detecta(state, artigos[0], 'Conforme o § 2º do art. 5º e o art. 3º.');

      expect(remissoes).to.have.length(2);
      const ids = remissoes.map((r: any) => r.targetLexmlId);
      expect(ids).to.include('art5_par2');
      expect(ids).to.include('art3');
    });
  });
});
