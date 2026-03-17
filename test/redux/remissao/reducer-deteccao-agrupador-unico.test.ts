import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { State } from '../../../src/redux/state';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoRegistry } from '../../../src/model/remissao';

const marcaAdicionado = (d: any): void => {
  d.situacao = new DispositivoAdicionado();
  if (d.caput) {
    (d as Artigo).caput!.situacao = new DispositivoAdicionado();
  }
};

const montaState = (articulacao: any): State => ({
  articulacao,
  modo: 'emenda',
  past: [],
  present: [],
  future: [],
  ui: { events: [] },
  remissoes: new RemissaoRegistry(),
});

const detecta = (state: State, source: any, texto: string): any[] => {
  source.texto = texto;
  const elemento = createElemento(source, true);
  const result = adicionaRemissaoInterna(state, { atual: elemento });
  return (result.remissoes as any)[source.uuid!] ?? [];
};

/**
 * Seção Única como filha direta da articulação:
 *   Articulação
 *   ├── Seção Única  ← único filho Secao
 *   │   └── Art. 1
 *   └── Art. 2  ← fonte das referências absolutas simples
 */
const criaStateComSecaoUnicaFilhaDireta = () => {
  const articulacao = createArticulacao();
  const secUnica = criaDispositivo(articulacao, 'Secao');
  const art1 = criaDispositivo(secUnica, 'Artigo');
  const art2 = criaDispositivo(articulacao, 'Artigo');

  articulacao.renumeraFilhos(); // secUnica.numero='1' (única Secao)

  updateIdDispositivoAndFilhos(articulacao);
  [secUnica, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), articulacao, secUnica, art1, art2 };
};

/**
 * Seção Única aninhada dentro de Capítulo:
 *   Articulação
 *   ├── Capítulo I
 *   │   └── Seção Única  ← único filho Secao de cap1
 *   │       └── Art. 1  ← fonte das referências contextuais
 *   └── Capítulo II
 *       └── Art. 2  ← fonte das referências em cadeia
 */
const criaStateComSecaoUnicaAninhada = () => {
  const articulacao = createArticulacao();
  const cap1 = criaDispositivo(articulacao, 'Capitulo');
  const secUnica = criaDispositivo(cap1, 'Secao');
  const art1 = criaDispositivo(secUnica, 'Artigo');
  const cap2 = criaDispositivo(articulacao, 'Capitulo');
  const art2 = criaDispositivo(cap2, 'Artigo');

  articulacao.renumeraFilhos(); // cap1.numero='1', cap2.numero='2'
  cap1.renumeraFilhos(); //        secUnica.numero='1'

  updateIdDispositivoAndFilhos(articulacao);
  [cap1, secUnica, cap2, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), articulacao, cap1, cap2, secUnica, art1, art2 };
};

/**
 * Capítulo Único como filho direto da articulação:
 *   Articulação
 *   ├── Capítulo Único  ← único filho Capitulo
 *   │   └── Art. 1
 *   └── Art. 2  ← fonte
 */
const criaStateComCapituloUnico = () => {
  const articulacao = createArticulacao();
  const capUnico = criaDispositivo(articulacao, 'Capitulo');
  const art1 = criaDispositivo(capUnico, 'Artigo');
  const art2 = criaDispositivo(articulacao, 'Artigo');

  articulacao.renumeraFilhos(); // capUnico.numero='1'

  updateIdDispositivoAndFilhos(articulacao);
  [capUnico, art1, art2].forEach(marcaAdicionado);

  return { state: montaState(articulacao), articulacao, capUnico, art1, art2 };
};

/**
 * Dois capítulos com duas seções no cap1 — negativo para "Seção Única":
 *   Articulação
 *   └── Capítulo I
 *       ├── Seção I
 *       ├── Seção II
 *       └── Art. 1  ← fonte
 */
const criaStateComDuasSecoes = () => {
  const articulacao = createArticulacao();
  const cap1 = criaDispositivo(articulacao, 'Capitulo');
  const sec1 = criaDispositivo(cap1, 'Secao');
  const sec2 = criaDispositivo(cap1, 'Secao');
  const art1 = criaDispositivo(cap1, 'Artigo');

  articulacao.renumeraFilhos();
  cap1.renumeraFilhos(); // sec1.numero='1', sec2.numero='2'

  updateIdDispositivoAndFilhos(articulacao);
  [cap1, sec1, sec2, art1].forEach(marcaAdicionado);

  return { state: montaState(articulacao), articulacao, cap1, sec1, sec2, art1 };
};

describe('Detecção de Remissões a Agrupadores Únicos (Etapa 1.4-U)', () => {
  describe('Absolutas — agrupador único simples', () => {
    it('[AG-U-01] "Seção Única" (filha direta) → 1 remissão para secUnica', () => {
      const { state, secUnica, art2 } = criaStateComSecaoUnicaFilhaDireta();
      const remissoes = detecta(state, art2, 'Conforme a Seção Única.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(secUnica.uuid);
    });

    it('[AG-U-02] "Capítulo Único" → 1 remissão para capUnico', () => {
      const { state, capUnico, art2 } = criaStateComCapituloUnico();
      const remissoes = detecta(state, art2, 'Conforme o Capítulo Único.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(capUnico.uuid);
    });
  });

  describe('Absolutas — cadeia com agrupador único', () => {
    it('[AG-U-03] "Seção Única do Capítulo I" → 1 remissão para secUnica (cadeia 2 níveis)', () => {
      const { state, secUnica, art2 } = criaStateComSecaoUnicaAninhada();
      const remissoes = detecta(state, art2, 'Conforme a Seção Única do Capítulo I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(secUnica.uuid);
    });
  });

  describe('Contextuais — agrupador único via ancestral', () => {
    it('[AG-U-04] "Seção Única deste Capítulo" → 1 remissão para secUnica via cap1', () => {
      // art1 está dentro de secUnica → cap1 é ancestral do tipo Capitulo
      const { state, secUnica, art1 } = criaStateComSecaoUnicaAninhada();
      const remissoes = detecta(state, art1, 'Conforme a Seção Única deste Capítulo.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(secUnica.uuid);
    });
  });

  describe('Negativos — "único" inválido quando há mais de um irmão do tipo', () => {
    it('[AG-U-05] "Seção Única do Capítulo I" com 2 seções → 0 remissões', () => {
      const { state, art1 } = criaStateComDuasSecoes();
      const remissoes = detecta(state, art1, 'Conforme a Seção Única do Capítulo I.');

      expect(remissoes).to.have.length(0);
    });

    it('[AG-U-06] "Capítulo Único" quando há 2 capítulos → 0 remissões', () => {
      // criaStateComSecaoUnicaAninhada tem cap1 e cap2 → "Capítulo Único" não pode resolver
      const { state, art2 } = criaStateComSecaoUnicaAninhada();
      const remissoes = detecta(state, art2, 'Conforme o Capítulo Único.');

      expect(remissoes).to.have.length(0);
    });
  });

  describe('Regressão — romanos com numero=1 não são afetados', () => {
    it('[AG-U-07] "Seção I do Capítulo I" em fixture de seção única → ainda resolve', () => {
      // secUnica tem numero='1' → "Seção I" (romano) deve continuar encontrando
      const { state, secUnica, art2 } = criaStateComSecaoUnicaAninhada();
      const remissoes = detecta(state, art2, 'Conforme a Seção I do Capítulo I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(secUnica.uuid);
    });

    it('[AG-U-08] "Capítulo I" em fixture de 2 capítulos → ainda resolve (sem regressão)', () => {
      const { state, cap1, art2 } = criaStateComSecaoUnicaAninhada();
      const remissoes = detecta(state, art2, 'Conforme o Capítulo I.');

      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetUuid).to.equal(cap1.uuid);
    });
  });
});
