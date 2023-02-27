import { buscaDispositivoById } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State } from '../../../src/redux/state';
import { getTiposAgrupadoresQuePodemSerInseridosAntes, getTiposAgrupadoresQuePodemSerInseridosDepois } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';

let state: State;

describe('Testando a inclusão de agrupadores', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });
  it('Deveria possuir articulação com 5 artigos', () => {
    const nFilhos = state.articulacao?.filhos.length;
    const nArt = state.articulacao?.filhos.filter(f => f.tipo === 'Artigo').length;
    expect(nFilhos).to.equal(5);
    expect(nArt).to.equal(nFilhos);
  });

  it('Testando tipos de agrupadores que podem ser inseridos antes do Art. 1', () => {
    const art = buscaDispositivoById(state.articulacao!, 'art1')!;
    const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
    expect(tipos.includes('Parte')).to.be.true;
    expect(tipos.includes('Livro')).to.be.true;
    expect(tipos.includes('Titulo')).to.be.true;
    expect(tipos.includes('Capitulo')).to.be.true;
    expect(tipos.includes('Secao')).to.be.false;
    expect(tipos.includes('Subsecao')).to.be.false;
  });

  it('Testando tipos de agrupadores que podem ser inseridos antes do Art. 2', () => {
    const art = buscaDispositivoById(state.articulacao!, 'art2')!;
    const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
    expect(tipos.includes('Parte')).to.be.true;
    expect(tipos.includes('Livro')).to.be.true;
    expect(tipos.includes('Titulo')).to.be.true;
    expect(tipos.includes('Capitulo')).to.be.true;

    expect(tipos.includes('Secao')).to.be.false;
    expect(tipos.includes('Subsecao')).to.be.false;
  });

  describe('Testando a inclusão de uma estrutura de agrupadores', () => {
    describe('Testando a articulação após criação de estrutura de agrupadores', () => {
      beforeEach(function () {
        /*
          Capitulo I
            Seção 1
              Subseção 1
                  Art. 1º
                  ...
                  Art. 5º
        */

        let atual = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);

        // Cap
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'antes' } });

        // Seção
        atual = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'antes' } });

        // Subseção
        atual = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Subsecao', posicao: 'antes' } });
      });

      it('>>> Testando se novos agrupadores foram adicionados', () => {
        const cap = !!buscaDispositivoById(state.articulacao!, 'cap1');
        const secao = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1');
        const subsecao = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1');
        const ementa = !!buscaDispositivoById(state.articulacao!, 'ementa');
        const art1 = buscaDispositivoById(state.articulacao!, 'art1');
        expect(cap).to.be.true;
        expect(secao).to.be.true;
        expect(subsecao).to.be.true;
        expect(ementa).to.be.true;
        expect(art1?.pai!.id).equals('cap1_sec1_sub1');
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos após a ementa', () => {
        const ementa = buscaDispositivoById(state.articulacao!, 'ementa')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(ementa);

        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Secao')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos antes do Capítulo 1', () => {
        const cap = buscaDispositivoById(state.articulacao!, 'cap1')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(cap);

        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Secao')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos após do Capítulo 1', () => {
        const cap = buscaDispositivoById(state.articulacao!, 'cap1')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(cap);

        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Titulo')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos após a subseção 1', () => {
        const art = buscaDispositivoById(state.articulacao!, 'art1')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);

        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;
        expect(tipos.includes('Subsecao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Titulo')).to.be.false;
      });
    });
  });
});
