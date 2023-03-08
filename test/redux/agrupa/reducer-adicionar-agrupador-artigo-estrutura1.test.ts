import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State } from '../../../src/redux/state';

let state: State;
let idsArtigos = '';

describe('Testando a inclusão de agrupadores', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
    idsArtigos = state.articulacao!.artigos.map(a => a.id).join(',');
  });
  it('Deveria possuir articulação com 7 capítulos filhos', () => {
    const nFilhos = state.articulacao?.filhos.length;
    const nCap = state.articulacao?.filhos.filter(f => f.tipo === 'Capitulo').length;
    expect(nFilhos).to.equal(7);
    expect(nCap).to.equal(nFilhos);
  });

  describe('Testando a inclusão de uma estrutura de agrupadores', () => {
    describe('Testando a articulação após criação de estrutura de agrupadores', () => {
      beforeEach(function () {
        /*
          Parte
            Livro
              Titulo
                Capitulo I
                  Art. 1º
                  ...
                  Art. 5º
                  Secao
                    Art. 6º
                    ...
                    Art. 18º
                Capitulo II
                ...
        */

        let atual = createElemento(state.articulacao!.filhos[0]); // Cap
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'antes' } });

        atual = createElemento(state.articulacao!.filhos[0]); // Tit
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Livro', posicao: 'antes' } });

        atual = createElemento(state.articulacao!.filhos[0]); // Livro
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Parte', posicao: 'antes' } });

        atual = createElemento(state.articulacao!.artigos[5]); // Cria seção antes do Art. 6º
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'antes' } });
      });

      it('Deveria manter a ordem original dos artigos', () => {
        expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
      });

      it('Testando agrupador criado PARTE', () => {
        const dispositivo = state.articulacao!.filhos[0]!; // Parte
        expect(dispositivo.pai!.tipo).to.equal('Articulacao');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Parte');
        expect(dispositivo.filhos.length).to.equal(1);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
      it('Testando agrupador criado LIVRO', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0]; // Livro
        expect(dispositivo.pai!.tipo).to.equal('Parte');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Livro');
        expect(dispositivo.filhos.length).to.equal(1);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
      it('Testando agrupador criado TITULO', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0]; // Título
        expect(dispositivo.pai!.tipo).to.equal('Livro');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Titulo');
        expect(dispositivo.filhos.length).to.equal(7);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
      it('Testando agrupador modificado CAPITULO I', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0].filhos[0]; // Capítulo I
        expect(dispositivo.pai!.tipo).to.equal('Titulo');
        expect(dispositivo.pai!.filhos.length).to.equal(7);
        expect(dispositivo.tipo).to.equal('Capitulo');
        expect(dispositivo.filhos.length).to.equal(6);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
        expect(dispositivo.filhos[4].id).to.equal('art5');
        expect(dispositivo.filhos[5].id).to.equal('prt1_liv1_tit1_cap1_sec1');
      });
      it('Testando agrupador criado SECAO', () => {
        const dispositivo = state.articulacao!.artigos[5].pai!; // Seção
        expect(dispositivo.pai!.tipo).to.equal('Capitulo');
        expect(dispositivo.pai!.filhos.length).to.equal(6);
        expect(dispositivo.pai!.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(5);
        expect(dispositivo.pai!.filhos.filter(f => f.tipo === 'Secao').length).to.equal(1);
        expect(dispositivo.pai!.filhos.every(f => f.pai === dispositivo.pai)).to.equal(true);
        expect(dispositivo.pai!.filhos[4].id).to.equal('art5');
        expect(dispositivo.pai!.filhos[5]).to.equal(dispositivo);
        expect(dispositivo.tipo).to.equal('Secao');
        expect(dispositivo.filhos.length).to.equal(13);
        expect(dispositivo.filhos.every(f => f.tipo === 'Artigo')).to.equal(true);
        expect(dispositivo.filhos[0].id).to.equal('art6');
        expect(dispositivo.id).to.equal('prt1_liv1_tit1_cap1_sec1');
      });
    });
  });
});
