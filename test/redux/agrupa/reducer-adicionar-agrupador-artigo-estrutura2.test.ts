import { buscaDispositivoById } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State } from '../../../src/redux/state';
import { getTiposAgrupadoresQuePodemSerInseridosAntes, getTiposAgrupadoresQuePodemSerInseridosDepois } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { isAgrupador } from '../../../src/model/dispositivo/tipo';

let state: State;
let idsArtigos = '';

export const showAgrupadores = (dispositivo: Dispositivo, nivel = 0): void => {
  if (isAgrupador(dispositivo)) {
    console.log(' '.repeat(nivel) + dispositivo.rotulo);
    dispositivo.filhos.forEach(f => showAgrupadores(f, nivel + 1));
  } else if (dispositivo.pai?.indexOf(dispositivo) === 0) {
    console.log(' '.repeat(nivel) + dispositivo.rotulo);
  }
};

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

  it('Testando tipos de agrupadores que podem ser inseridos antes do Capítulo 1', () => {
    const cap = buscaDispositivoById(state.articulacao!, 'cap1')!;
    const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(cap);
    expect(tipos.includes('Titulo')).to.be.true;
    expect(tipos.includes('Capitulo')).to.be.true;

    expect(tipos.includes('Parte')).to.be.false;
    expect(tipos.includes('Livro')).to.be.false;
    expect(tipos.includes('Secao')).to.be.false;
    expect(tipos.includes('Subsecao')).to.be.false;
  });

  it('Testando tipos de agrupadores que podem ser inseridos antes do Capítulo 2', () => {
    const cap = buscaDispositivoById(state.articulacao!, 'cap2')!;
    const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(cap);
    expect(tipos.includes('Capitulo')).to.be.true;
    expect(tipos.includes('Secao')).to.be.true;

    expect(tipos.includes('Parte')).to.be.false;
    expect(tipos.includes('Livro')).to.be.false;
    expect(tipos.includes('Titulo')).to.be.false;
    expect(tipos.includes('Subsecao')).to.be.false;
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
            Livro
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

      it('>>> Testando se novos agrupadores foram adicionados', () => {
        const parte = !!buscaDispositivoById(state.articulacao!, 'prt1');
        const livro = !!buscaDispositivoById(state.articulacao!, 'prt1_liv1');
        const titulo = !!buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1');
        const secao = !!buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1_cap1_sec1');
        expect(parte).to.be.true;
        expect(livro).to.be.true;
        expect(titulo).to.be.true;
        expect(secao).to.be.true;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos depois do título', () => {
        const tit = buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(tit);
        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Secao')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 1', () => {
        const art = state.articulacao!.artigos[0];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Titulo')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 3', () => {
        const art = state.articulacao!.artigos[2];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Titulo')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 7', () => {
        const art = state.articulacao!.artigos[6];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;
        expect(tipos.includes('Subsecao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos depois do último artigo', () => {
        const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 1];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
        expect(tipos.includes('Parte')).to.be.true;
        expect(tipos.includes('Livro')).to.be.true;
        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;

        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos antes Art. 1', () => {
        const art = state.articulacao!.artigos[0];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Titulo')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos antes do título', () => {
        const tit = buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(tit);
        expect(tipos.includes('Livro')).to.be.true;
        expect(tipos.includes('Titulo')).to.be.true;

        expect(tipos.includes('Capitulo')).to.be.false;
        expect(tipos.includes('Secao')).to.be.false;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos antes do capítulo', () => {
        const cap = buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1_cap1')!;
        const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(cap);
        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Secao')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos antes do Art. 3', () => {
        const art = state.articulacao!.artigos[2];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
        expect(tipos.includes('Titulo')).to.be.false;
        expect(tipos.includes('Subsecao')).to.be.false;
      });

      it('>>> Testando tipos de agrupadores que podem ser inseridos antes do Art. 7', () => {
        const art = state.articulacao!.artigos[6];
        const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
        expect(tipos.includes('Titulo')).to.be.true;
        expect(tipos.includes('Capitulo')).to.be.true;
        expect(tipos.includes('Secao')).to.be.true;
        expect(tipos.includes('Subsecao')).to.be.true;

        expect(tipos.includes('Parte')).to.be.false;
        expect(tipos.includes('Livro')).to.be.false;
      });

      it('Testando agrupador criado PARTE', () => {
        const dispositivo = state.articulacao!.filhos[0]!; // Parte
        expect(dispositivo.pai!.tipo).to.equal('Articulacao');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Parte');
        expect(dispositivo.filhos.length).to.equal(1);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });

      it('Testando agrupador criado LIVRO I', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0]; // Livro
        expect(dispositivo.pai!.tipo).to.equal('Parte');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Livro');
        expect(dispositivo.filhos.length).to.equal(1);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
        expect(dispositivo.id).to.equal('prt1_liv1');
      });

      it('Testando agrupador criado TITULO I', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0]; // Livro
        expect(dispositivo.pai!.tipo).to.equal('Livro');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Titulo');
        expect(dispositivo.filhos.length).to.equal(7);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
        expect(dispositivo.id).to.equal('prt1_liv1_tit1');
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
        expect(dispositivo.id).to.equal('prt1_liv1_tit1_cap1');
        expect(dispositivo.pai!.tipo).to.equal('Titulo');
        expect(dispositivo.pai!.filhos.length).to.equal(7);
        expect(dispositivo.tipo).to.equal('Capitulo');
        expect(dispositivo.filhos.length).to.equal(6);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
        expect(dispositivo.filhos[4].id).to.equal('art5');
      });

      describe('Inserindo novo título antes do último artigo e vericando tipos de agrupadores que pode ser adicionados', () => {
        beforeEach(function () {
          const atual = createElemento(state.articulacao!.artigos[state.articulacao!.artigos.length - 1]);
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'antes' } });
        });

        it('Deveria manter a ordem original dos artigos', () => {
          expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
        });

        it('Testando tipos de agrupadores que podem ser inseridos antes do artigo 52', () => {
          const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 2];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Livro')).to.be.true;
          expect(tipos.includes('Titulo')).to.be.true;
          expect(tipos.includes('Capitulo')).to.be.true;
          expect(tipos.includes('Secao')).to.be.true;

          expect(tipos.includes('Parte')).to.be.false;
          expect(tipos.includes('Subsecao')).to.be.false;
        });

        it('Testando tipos de agrupadores que podem ser inseridos antes do artigo 53', () => {
          const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 1];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Parte')).to.be.true;
          expect(tipos.includes('Livro')).to.be.true;
          expect(tipos.includes('Titulo')).to.be.true;
          expect(tipos.includes('Capitulo')).to.be.true;

          expect(tipos.includes('Secao')).to.be.false;
          expect(tipos.includes('Subsecao')).to.be.false;
        });
      });

      describe('Inserindo novo livro antes do último artigo e vericando tipos de agrupadores que pode ser adicionados', () => {
        beforeEach(function () {
          const atual = createElemento(state.articulacao!.artigos[state.articulacao!.artigos.length - 1]);
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Livro', posicao: 'antes' } });
        });

        it('Deveria manter a ordem original dos artigos', () => {
          expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
        });

        it('Testando tipos de agrupadores que podem ser inseridos antes do artigo 52', () => {
          const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 2];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Parte')).to.be.true;
          expect(tipos.includes('Livro')).to.be.true;
          expect(tipos.includes('Titulo')).to.be.true;
          expect(tipos.includes('Capitulo')).to.be.true;
          expect(tipos.includes('Secao')).to.be.true;

          expect(tipos.includes('Subsecao')).to.be.false;
        });

        it('Testando tipos de agrupadores que podem ser inseridos antes do artigo 53', () => {
          const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 1];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Parte')).to.be.true;
          expect(tipos.includes('Livro')).to.be.true;
          expect(tipos.includes('Titulo')).to.be.true;

          expect(tipos.includes('Capitulo')).to.be.false;
          expect(tipos.includes('Secao')).to.be.false;
          expect(tipos.includes('Subsecao')).to.be.false;
        });
      });

      describe('Incluindo mais uma seção antes do Art. 11 e testando tipos que podem ser adicionados', () => {
        beforeEach(function () {
          const atual = createElemento(state.articulacao!.artigos[10]);
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'antes' } });
        });

        it('Deveria manter a ordem original dos artigos', () => {
          expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
        });

        it('>>> Testando se nova seção foi adicionada', () => {
          const secao1 = !!buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1_cap1_sec1');
          const secao2 = !!buscaDispositivoById(state.articulacao!, 'prt1_liv1_tit1_cap1_sec2');
          expect(secao1).to.be.true;
          expect(secao2).to.be.true;
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 7', () => {
          const art = state.articulacao!.artigos[6];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
          expect(tipos.includes('Capitulo')).to.be.true;
          expect(tipos.includes('Secao')).to.be.true;
          expect(tipos.includes('Subsecao')).to.be.true;

          expect(tipos.includes('Parte')).to.be.false;
          expect(tipos.includes('Livro')).to.be.false;
          expect(tipos.includes('Titulo')).to.be.false;
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 12', () => {
          const art = state.articulacao!.artigos[11];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
          expect(tipos.includes('Titulo')).to.be.true;
          expect(tipos.includes('Capitulo')).to.be.true;
          expect(tipos.includes('Secao')).to.be.true;
          expect(tipos.includes('Subsecao')).to.be.true;

          expect(tipos.includes('Parte')).to.be.false;
          expect(tipos.includes('Livro')).to.be.false;
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos antes do Art. 7', () => {
          const art = state.articulacao!.artigos[6];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Capitulo')).to.be.true;
          expect(tipos.includes('Secao')).to.be.true;
          expect(tipos.includes('Subsecao')).to.be.true;

          expect(tipos.includes('Parte')).to.be.false;
          expect(tipos.includes('Livro')).to.be.false;
          expect(tipos.includes('Titulo')).to.be.false;
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos antes do Art. 12', () => {
          const art = state.articulacao!.artigos[11];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Titulo')).to.be.true;
          expect(tipos.includes('Capitulo')).to.be.true;
          expect(tipos.includes('Secao')).to.be.true;
          expect(tipos.includes('Subsecao')).to.be.true;

          expect(tipos.includes('Parte')).to.be.false;
          expect(tipos.includes('Livro')).to.be.false;
        });

        describe('Inserindo novo título antes do Art.15 e testando tipos de agrupadores que podem ser inseridos', () => {
          beforeEach(function () {
            const atual = createElemento(state.articulacao!.artigos[14]);
            state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'antes' } });
          });

          it('Deveria manter a ordem original dos artigos', () => {
            expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
          });

          it('Deveria manter a ordem original dos artigos', () => {
            expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
          });

          it('Testando tipos de agrupadores que podem ser inseridos antes do Art. 12', () => {
            const art = state.articulacao!.artigos[11];
            const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
            expect(tipos.includes('Livro')).to.be.true;
            expect(tipos.includes('Titulo')).to.be.true;
            expect(tipos.includes('Capitulo')).to.be.true;
            expect(tipos.includes('Secao')).to.be.true;
            expect(tipos.includes('Subsecao')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
          });
        });
      });

      describe('Testando tipos que podem ser adicionados quando articulação possui artigo e agrupador', () => {
        beforeEach(function () {
          const parte = state.articulacao!.filhos[0];

          // Adiciona 5 artigos antes da parte
          for (let n = 1; n <= 5; n++) {
            state = adicionaElemento(state, {
              type: ADICIONAR_ELEMENTO,
              atual: { tipo: TipoDispositivo.parte.tipo, uuid: parte.uuid },
              novo: {
                tipo: TipoDispositivo.artigo.tipo,
              },
              posicao: 'antes',
            });
          }

          idsArtigos = state.articulacao!.artigos.map(a => a.id).join(',');
        });

        it('Testando se 5 artigos foram adicionados antes da parte', () => {
          const artigos = state.articulacao!.filhos.filter(f => f.tipo === 'Artigo');
          const parte = state.articulacao!.filhos[5];
          expect(artigos.length).to.equal(5);
          expect(parte.tipo).to.equal('Parte');
          expect(state.articulacao!.filhos.length).to.equal(6);
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 0-1', () => {
          const art = state.articulacao!.artigos[1];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
          expect(tipos.includes('Parte')).to.be.true;

          expect(tipos.includes('Livro')).to.be.false;
          expect(tipos.includes('Titulo')).to.be.false;
          expect(tipos.includes('Capitulo')).to.be.false;
          expect(tipos.includes('Secao')).to.be.false;
          expect(tipos.includes('Subsecao')).to.be.false;
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos depois da parte', () => {
          const parte = state.articulacao!.filhos[5];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(parte);
          expect(tipos.includes('Parte')).to.be.true;
          expect(tipos.includes('Livro')).to.be.true;

          expect(tipos.includes('Titulo')).to.be.false;
          expect(tipos.includes('Capitulo')).to.be.false;
          expect(tipos.includes('Secao')).to.be.false;
          expect(tipos.includes('Subsecao')).to.be.false;
        });

        it('>>> Testando tipos de agrupadores que podem ser inseridos antes Art. 0-1', () => {
          const art = state.articulacao!.artigos[1];
          const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
          expect(tipos.includes('Parte')).to.be.true;

          expect(tipos.includes('Livro')).to.be.false;
          expect(tipos.includes('Titulo')).to.be.false;
          expect(tipos.includes('Capitulo')).to.be.false;
          expect(tipos.includes('Secao')).to.be.false;
          expect(tipos.includes('Subsecao')).to.be.false;
        });

        describe('Excluindo parte e livro e testando agrupadores que podem ser incluídos', () => {
          beforeEach(function () {
            state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.parte.tipo, uuid: state.articulacao!.filhos[5].uuid! } });
            state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.livro.tipo, uuid: state.articulacao!.filhos[5].uuid! } });

            const atual = createElemento(state.articulacao!.artigos[state.articulacao!.artigos.length - 1]);
            state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'antes' } });
          });

          it('Deveria manter a ordem original dos artigos', () => {
            expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
          });

          it('>>> Testando tipos de agrupadores que podem ser inseridos depois Art. 0-1', () => {
            const art = state.articulacao!.artigos[1];
            const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
            expect(tipos.includes('Livro')).to.be.true;
            expect(tipos.includes('Titulo')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
            expect(tipos.includes('Capitulo')).to.be.false;
            expect(tipos.includes('Secao')).to.be.false;
            expect(tipos.includes('Subsecao')).to.be.false;
          });

          it('>>> Testando tipos de agrupadores que podem ser inseridos depois do título 2', () => {
            const parte = state.articulacao!.filhos[5];
            const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(parte);
            expect(tipos.includes('Titulo')).to.be.true;
            expect(tipos.includes('Capitulo')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
            expect(tipos.includes('Livro')).to.be.false;
            expect(tipos.includes('Secao')).to.be.false;
            expect(tipos.includes('Subsecao')).to.be.false;
          });

          it('>>> Testando tipos de agrupadores que podem ser inseridos depois do último artigo', () => {
            const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 1];
            const tipos = getTiposAgrupadoresQuePodemSerInseridosDepois(art);
            expect(tipos.includes('Titulo')).to.be.true;
            expect(tipos.includes('Capitulo')).to.be.true;
            expect(tipos.includes('Secao')).to.be.true;
            expect(tipos.includes('Subsecao')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
            expect(tipos.includes('Livro')).to.be.false;
          });

          it('>>> Testando tipos de agrupadores que podem ser inseridos antes Art. 0-1', () => {
            const art = state.articulacao!.artigos[1];
            const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
            expect(tipos.includes('Livro')).to.be.true;
            expect(tipos.includes('Titulo')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
            expect(tipos.includes('Capitulo')).to.be.false;
            expect(tipos.includes('Secao')).to.be.false;
            expect(tipos.includes('Subsecao')).to.be.false;
          });

          it('>>> Testando tipos de agrupadores que podem ser inseridos antes do último artigo', () => {
            const art = state.articulacao!.artigos[state.articulacao!.artigos.length - 1];
            const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(art);
            expect(tipos.includes('Titulo')).to.be.true;
            expect(tipos.includes('Capitulo')).to.be.true;
            expect(tipos.includes('Secao')).to.be.true;
            expect(tipos.includes('Subsecao')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
            expect(tipos.includes('Livro')).to.be.false;
          });

          it('>>> Testando tipos de agrupadores que podem ser inseridos antes Seção 1 do Capítulo 7', () => {
            const sec = state.articulacao!.artigos[state.articulacao!.artigos.length - 1].pai!;
            const tipos = getTiposAgrupadoresQuePodemSerInseridosAntes(sec);
            expect(tipos.includes('Capitulo')).to.be.true;
            expect(tipos.includes('Secao')).to.be.true;

            expect(tipos.includes('Parte')).to.be.false;
            expect(tipos.includes('Livro')).to.be.false;
            expect(tipos.includes('Titulo')).to.be.false;
            expect(tipos.includes('Subsecao')).to.be.false;
          });
        });
      });

      // it('Testando agrupador criado LIVRO II', () => {
      //   const dispositivo = state.articulacao!.filhos[0]!.filhos[1]; // Livro
      //   expect(dispositivo.pai!.tipo).to.equal('Parte');
      //   expect(dispositivo.pai!.filhos.length).to.equal(2);
      //   expect(dispositivo.tipo).to.equal('Livro');
      //   expect(dispositivo.filhos.length).to.equal(19);
      //   expect(dispositivo.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(13);
      //   expect(dispositivo.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(6);
      //   expect(dispositivo.filhos[0].id).to.equal('art6');
      //   expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      //   expect(dispositivo.id).to.equal('prt1_liv2');
      // });
      // it('Testando agrupador criado TITULO', () => {
      //   const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0]; // Título
      //   expect(dispositivo.pai!.tipo).to.equal('Livro');
      //   expect(dispositivo.pai!.filhos.length).to.equal(1);
      //   expect(dispositivo.tipo).to.equal('Titulo');
      //   expect(dispositivo.filhos.length).to.equal(1);
      //   expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      // });
      // it('Testando agrupador modificado CAPITULO I', () => {
      //   const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0].filhos[0]; // Capítulo I
      //   expect(dispositivo.id).to.equal('prt1_liv1_tit1_cap1');
      //   expect(dispositivo.pai!.tipo).to.equal('Titulo');
      //   expect(dispositivo.pai!.filhos.length).to.equal(1);
      //   expect(dispositivo.tipo).to.equal('Capitulo');
      //   expect(dispositivo.filhos.length).to.equal(5);
      //   expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      //   expect(dispositivo.filhos[4].id).to.equal('art5');
      // });
      // // it('Testando agrupador criado SECAO', () => {
      // //   const dispositivo = state.articulacao!.artigos[5].pai!; // Seção
      // //   expect(dispositivo.pai!.tipo).to.equal('Capitulo');
      // //   expect(dispositivo.pai!.filhos.length).to.equal(6);
      // //   expect(dispositivo.pai!.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(5);
      // //   expect(dispositivo.pai!.filhos.filter(f => f.tipo === 'Secao').length).to.equal(1);
      // //   expect(dispositivo.pai!.filhos.every(f => f.pai === dispositivo.pai)).to.equal(true);
      // //   expect(dispositivo.pai!.filhos[4].id).to.equal('art5');
      // //   expect(dispositivo.pai!.filhos[5]).to.equal(dispositivo);
      // //   expect(dispositivo.tipo).to.equal('Secao');
      // //   expect(dispositivo.filhos.length).to.equal(13);
      // //   expect(dispositivo.filhos.every(f => f.tipo === 'Artigo')).to.equal(true);
      // //   expect(dispositivo.filhos[0].id).to.equal('art6');
      // //   expect(dispositivo.id).to.equal('prt1_liv1_tit1_cap1_sec1');
      // // });
    });
  });
});
