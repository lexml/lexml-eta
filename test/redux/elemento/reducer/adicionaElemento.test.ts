import { expect } from '@open-wc/testing';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../../src/model/lexml/situacao/dispositivoAdicionado';
import { adicionaElemento } from '../../../../src/redux/elemento/reducer/adicionaElemento';
import { State } from '../../../../src/redux/state';

// ---------------------------------------------------------------------------
// adicionaElemento.ts: eventos.build() chamado 3 vezes
//
// Linhas 259-264: buildPast(state, eventos.build()), present: eventos.build(),
// e events: eventos.build() — tres chamadas ao mesmo metodo no mesmo retorno.
// CORRECAO: capturar em variavel: const builtEvents = eventos.build().
//
// Os testes abaixo sao regressao: verificam que o estado retornado por
// adicionaElemento e consistente (past, present e ui.events tem o mesmo conteudo).
// ---------------------------------------------------------------------------

function criarStateMinimal() {
  const articulacao = createArticulacao();
  const art = criaDispositivo(articulacao, 'Artigo');
  art.situacao = new DispositivoAdicionado();
  (art as any).caput.situacao = new DispositivoAdicionado();
  articulacao.renumeraFilhos();
  art.createRotulo(art);
  (art as any).caput.createRotulo((art as any).caput);
  updateIdDispositivoAndFilhos(articulacao);

  const state: State = {
    articulacao,
    modo: 'emenda',
    past: [],
    present: [],
    future: [],
    ui: { events: [] },
  } as any;

  return { state, art };
}

describe('adicionaElemento: past, present e ui.events sao consistentes', () => {
  it('os eventos em past[last], present e ui.events sao equivalentes', () => {
    const { state, art } = criarStateMinimal();
    const elemento = createElemento(art, true);

    const result = adicionaElemento(state, {
      atual: elemento,
      novo: { tipo: 'Artigo' },
    });

    // past contem os eventos da operacao recém-executada (array de arrays)
    const pastEvents = result.past![result.past!.length - 1] as unknown as any[];
    const presentEvents = result.present as any[];
    const uiEvents = result.ui!.events as any[];

    // Todos devem ter o mesmo número de eventos
    expect(pastEvents.length).to.equal(presentEvents.length);
    expect(presentEvents.length).to.equal(uiEvents.length);

    // Os tipos de eventos devem coincidir
    const tiposPast = pastEvents.map((e: any) => e.stateType);
    const tiposPresent = presentEvents.map((e: any) => e.stateType);
    const tiposUi = uiEvents.map((e: any) => e.stateType);

    expect(tiposPast).to.deep.equal(tiposPresent);
    expect(tiposPresent).to.deep.equal(tiposUi);
  });
});

// ---------------------------------------------------------------------------
// Regex recompilada a cada chamada em adicionaRemissaoInterna
//
// new RegExp(...) e instanciado em cada invocacao de detectarReferencias*().
// CORRECAO: compilar uma vez no escopo do modulo e resetar lastIndex antes do uso.
//
// Os testes abaixo sao regressao: verificam que o comportamento de deteccao
// e identico independentemente de quantas vezes a funcao e chamada.
// ---------------------------------------------------------------------------

import { adicionaRemissaoInterna } from '../../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { Artigo } from '../../../../src/model/dispositivo/dispositivo';

function criarStateComArtigo(texto: string) {
  const articulacao = createArticulacao();
  const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
  const art2 = criaDispositivo(articulacao, 'Artigo') as Artigo;
  art.situacao = new DispositivoAdicionado();
  art2.situacao = new DispositivoAdicionado();
  (art as any).caput.situacao = new DispositivoAdicionado();
  (art2 as any).caput.situacao = new DispositivoAdicionado();
  articulacao.renumeraFilhos();
  art.createRotulo(art);
  art2.createRotulo(art2);
  updateIdDispositivoAndFilhos(articulacao);
  (art as any).caput.texto = texto;

  const state: State = {
    articulacao,
    modo: 'emenda',
    past: [],
    present: [],
    future: [],
    ui: { events: [] },
    remissoes: {},
  } as any;

  return { state, art, art2 };
}

describe('Regex de deteccao: resultado identico em chamadas repetidas', () => {
  it('detectar "art. 2o" retorna o mesmo numero de remissoes em 3 chamadas consecutivas', () => {
    const { state, art } = criarStateComArtigo('Conforme o art. 2o.');
    const elemento = createElemento((art as any).caput, true);

    const r1 = adicionaRemissaoInterna(state, { atual: elemento });
    const r2 = adicionaRemissaoInterna(state, { atual: elemento });
    const r3 = adicionaRemissaoInterna(state, { atual: elemento });

    const rem1 = (r1.remissoes as any)[(art as any).caput.uuid!] ?? [];
    const rem2 = (r2.remissoes as any)[(art as any).caput.uuid!] ?? [];
    const rem3 = (r3.remissoes as any)[(art as any).caput.uuid!] ?? [];

    expect(rem1.length).to.equal(rem2.length);
    expect(rem2.length).to.equal(rem3.length);
  });
});
