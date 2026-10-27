import { expect } from '@open-wc/testing';
import { Articulacao, Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { adicionarPenaAction } from '../../../src/model/lexml/acao/penaAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { configurarPaginacao } from '../../../src/redux/elemento/util/paginacaoUtil';
import { PaginaArticulacao } from '../../../src/model/paginacao/paginacao';
import { Paginacao } from '../../../src/redux/state';

const QTD_ARTIGOS = 8;

// Artigos ímpares terminam na pena do caput; os pares têm um parágrafo sem pena, para receber uma.
const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  for (let i = 1; i <= QTD_ARTIGOS; i++) {
    const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art.caput as any).texto = `Caput ${i}:`;
    if (i % 2 === 1) {
      const pena = criaDispositivo(art, TipoDispositivo.pena.tipo);
      pena.rotulo = 'Pena –';
      (pena as any).texto = `reclusão ${i}.`;
    } else {
      (criaDispositivo(art, TipoDispositivo.paragrafo.tipo) as any).texto = `Parágrafo ${i}.`;
    }
  }
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const LIMITES = [3, 4, 5, 6, 7, 8, 9, 10, 12];

describe('Paginação com pena', () => {
  describe('fronteira de página', () => {
    it('a subárvore de cada artigo, pena inclusive, fica inteira numa só página', () => {
      const violacoes = LIMITES.flatMap(maxItensPorPagina => {
        const articulacao = monta();
        const paginas = configurarPaginacao(articulacao, { maxItensPorPagina }).paginasArticulacao!;
        return articulacao.artigos.flatMap(artigo => {
          const idsDoArtigo = getDispositivoAndFilhosAsLista(artigo).map(d => d.id!);
          const paginasDoArtigo = paginas.filter(p => idsDoArtigo.some(id => p.ids.includes(id)));
          const inteiro = paginasDoArtigo.length === 1 && idsDoArtigo.every(id => paginasDoArtigo[0].ids.includes(id));
          return inteiro ? [] : [`limite ${maxItensPorPagina}: ${artigo.id}`];
        });
      });
      expect(violacoes).to.deep.equal([]);
    });

    it('nenhuma página começa na pena e todos os dispositivos entram em alguma página', () => {
      LIMITES.forEach(maxItensPorPagina => {
        const articulacao = monta();
        const paginas = configurarPaginacao(articulacao, { maxItensPorPagina }).paginasArticulacao!;
        const todos = getDispositivoAndFilhosAsLista(articulacao).map(d => d.id);
        expect(
          paginas.every(p => p.dispositivos[0]?.tipo !== 'Pena'),
          `limite ${maxItensPorPagina}`
        ).to.equal(true);
        expect(
          paginas.flatMap(p => p.ids),
          `limite ${maxItensPorPagina}`
        ).to.deep.equal(todos);
      });
    });

    it('alguma página termina na pena do seu último artigo', () => {
      const terminamNaPena = LIMITES.filter(maxItensPorPagina =>
        configurarPaginacao(monta(), { maxItensPorPagina }).paginasArticulacao!.some(p => p.dispositivos[p.dispositivos.length - 1].tipo === 'Pena')
      );
      expect(terminamNaPena.length).to.be.greaterThan(0);
    });
  });

  describe('pena adicionada no último artigo de uma página', () => {
    const abre = (maxItensPorPagina: number): any => elementoReducer(undefined, openArticulacaoAction(monta(), undefined, { maxItensPorPagina }));
    const paginasDe = (state: any): PaginaArticulacao[] => (state.ui.paginacao as Paginacao).paginasArticulacao!;
    const ultimoArtigoDaPrimeiraPagina = (state: any): Artigo =>
      paginasDe(state)[0]
        .dispositivos.filter(d => d.tipo === 'Artigo')
        .pop() as Artigo;

    it('entra na mesma página, no fim dela, e não na seguinte', () => {
      // O limite certo faz a primeira página terminar num artigo com parágrafo (par), que ainda não tem pena.
      const limite = LIMITES.find(max => {
        const state = abre(max);
        return paginasDe(state).length > 1 && ultimoArtigoDaPrimeiraPagina(state).filhos.some(f => f.tipo === 'Paragrafo');
      })!;
      let state = abre(limite);
      const paragrafo = ultimoArtigoDaPrimeiraPagina(state).filhos.find(f => f.tipo === 'Paragrafo')!;

      state = elementoReducer(state, adicionarPenaAction.execute(createElemento(buscaDispositivoById(state.articulacao, paragrafo.id!)!), 'Pena'));

      const idNovaPena = `${paragrafo.id}_pena`;
      const primeira = paginasDe(state)[0];
      expect(limite).to.not.equal(undefined);
      expect(buscaDispositivoById(state.articulacao, idNovaPena)?.tipo).to.equal('Pena');
      expect(primeira.ids[primeira.ids.length - 1]).to.equal(idNovaPena);
      expect(primeira.dispositivos[primeira.dispositivos.length - 1].id).to.equal(idNovaPena);
      expect(paginasDe(state)[1].ids.includes(idNovaPena)).to.equal(false);
    });
  });
});
