import { updateIdDispositivoAndFilhos } from '../../src/model/lexml/util/idUtil';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { State } from '../../src/redux/state';
import { DispositivoAdicionado } from '../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { adicionaRemissaoInterna } from '../../src/redux/elemento/reducer/adicionaRemissaoInterna';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Marca dispositivo (e caput, se artigo) como adicionado */
export function marcaAdicionado(d: any): void {
  d.situacao = new DispositivoAdicionado();
  if (d.caput) {
    (d as Artigo).caput!.situacao = new DispositivoAdicionado();
  }
}

/** Monta state mínimo compatível com adicionaRemissaoInterna a partir de uma articulação já montada. */
export function montaState(articulacao: any): State {
  return {
    articulacao,
    modo: 'emenda',
    past: [],
    present: [],
    future: [],
    ui: { events: [] },
    remissoes: {},
  };
}

/**
 * Cria state com articulação contendo `n` artigos numerados sequencialmente.
 * Retorna o state e a lista de artigos.
 */
export function criaStateComNArtigos(n: number): { state: State; artigos: any[] } {
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

  return { state: montaState(articulacao), artigos };
}

/**
 * Executa adicionaRemissaoInterna com o texto no dispositivo `source` e
 * retorna o array de remissões criadas (ou []).
 */
export function detectaRemissoes(state: State, source: any, texto: string): any[] {
  source.texto = texto;
  const elemento = createElemento(source, true);
  const result = adicionaRemissaoInterna(state, { atual: elemento });
  return (result.remissoes as any)[source.uuid!] ?? [];
}
