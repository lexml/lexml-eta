import { EMENDA_010 } from './../../doc/emendas/emenda-010';
import { TipoMensagem } from './../../../src/model/lexml/util/mensagem';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State } from '../../../src/redux/state';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';

let state: State;

describe('Testando inclusão e exclusão de títulos', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  describe('Abrindo emenda 010 e adicionando Título II após Capítulo III ', () => {
    beforeEach(function () {
      beforeEach(function () {
        state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_010.componentes[0].dispositivos });
        const atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap3')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'depois' } });
      });

      it('Título II deveria possuir 4 filhos do tipo capítulo e 2 filhos do tipo artigo', () => {
        const d = buscaDispositivoById(state.articulacao!, 'tit2')!;
        expect(d?.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(4);
        expect(d?.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(2);
      });

      it('Artigo 25 deveria ser filho do Título II', () => {
        const atual = buscaDispositivoById(state.articulacao!, 'art25')!;
        expect(atual.pai?.id).to.equal('tit2');
      });

      describe('Removendo Título II', () => {
        beforeEach(function () {
          const atual = buscaDispositivoById(state.articulacao!, 'tit2')!;
          state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.titulo.tipo, uuid: atual.uuid! } });
        });

        it('Deveria possuir 1 título', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'tit1');
          expect(atual).to.be.exist;
        });

        it('Articulação deveria possuir 1 filho do tipo título', () => {
          expect(state.articulacao?.filhos.length).to.equal(1);
          expect(state.articulacao?.filhos.filter(f => f.tipo === 'Titulo').length).to.equal(1);
        });

        it('Título I deveria possuir 7 filhos do tipo capítulo', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'tit1')!;
          expect(atual?.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(7);
        });

        it('Artigo 25 deveria ser filho do Capítulo 3', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'art25')!;
          expect(atual.pai?.id).to.equal('tit1_cap3');
        });
      });
    });
  });

  describe('Incluindo Título I e removendo-o', () => {
    describe('Incluindo', () => {
      beforeEach(function () {
        const atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'antes' } });
      });

      it('Deveria possuir 1 título', () => {
        expect(state.articulacao?.filhos.length).to.equal(1);
        expect(state.articulacao?.filhos[0].tipo).to.equal('Titulo');
      });

      it('Título I deveria possuir 7 filhos do tipo capítulo', () => {
        expect(state.articulacao?.filhos[0].filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(7);
      });

      describe('Removendo', () => {
        beforeEach(function () {
          const atual = buscaDispositivoById(state.articulacao!, 'tit1')!;
          state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.titulo.tipo, uuid: atual.uuid! } });
        });

        it('Deveria possuir 0 títulos', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'tit1');
          expect(atual).to.be.undefined;
        });

        it('Articulação deveria possuir 7 filhos do tipo capítulo', () => {
          expect(state.articulacao?.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(7);
        });
      });
    });
  });

  describe('Incluindo Título I e Título II e removendo o Título II', () => {
    describe('Incluindo', () => {
      beforeEach(function () {
        let atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'antes' } });

        atual = createElemento(buscaDispositivoById(state.articulacao!, 'tit1_cap3')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'depois' } });
      });

      it('Deveria possuir 2 título', () => {
        expect(state.articulacao?.filhos.length).to.equal(2);
        expect(state.articulacao?.filhos[0].tipo).to.equal('Titulo');
        expect(state.articulacao?.filhos[1].tipo).to.equal('Titulo');
      });

      it('Título I deveria possuir 3 filhos do tipo capítulo', () => {
        const d = buscaDispositivoById(state.articulacao!, 'tit1')!;
        expect(d?.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(3);
      });

      it('Título II deveria possuir 4 filhos do tipo capítulo e 2 filhos do tipo artigo', () => {
        const d = buscaDispositivoById(state.articulacao!, 'tit2')!;
        expect(d?.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(4);
        expect(d?.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(2);
      });

      describe('Removendo Título II', () => {
        beforeEach(function () {
          const atual = buscaDispositivoById(state.articulacao!, 'tit2')!;
          state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.titulo.tipo, uuid: atual.uuid! } });
        });

        it('Deveria possuir 1 título', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'tit1');
          expect(atual).to.be.exist;
        });

        it('Articulação deveria possuir 1 filho do tipo título', () => {
          expect(state.articulacao?.filhos.length).to.equal(1);
          expect(state.articulacao?.filhos.filter(f => f.tipo === 'Titulo').length).to.equal(1);
        });

        it('Título I deveria possuir 7 filhos do tipo capítulo', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'tit1')!;
          expect(atual?.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(7);
        });

        it('Artigo 25 deveria ser filho do Capítulo 3', () => {
          const atual = buscaDispositivoById(state.articulacao!, 'art25')!;
          expect(atual.pai?.id).to.equal('tit1_cap3');
        });
      });
    });
  });
});

describe('Testando a inclusão e exclusão de agrupadores', () => {
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
    expect(state.articulacao!.artigos[0].id).to.equal('art1');
    expect(state.articulacao!.artigos[1].id).to.equal('art2');
    expect(state.articulacao!.artigos[2].id).to.equal('art3');
    expect(state.articulacao!.artigos[3].id).to.equal('art4');
    expect(state.articulacao!.artigos[4].id).to.equal('art5');
  });

  describe('Testando a articulação após criação de estrutura de agrupadores', () => {
    beforeEach(function () {
      /*
          Capitulo I
            Seção Única
              Subseção Única
          Capítulo II
                  Art. 1º
                  ...
                  Art. 5º
        */

      // Cap
      let atual = createElemento(buscaDispositivoById(state.articulacao!, 'ementa')!);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });

      // Seção
      atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1')!);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'depois' } });

      // Subseção
      atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1_sec1')!);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Subsecao', posicao: 'depois' } });

      // Cap 2
      atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1')!);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
    });

    it('Deveria possuir novos agrupadores cap1, cap1_sec1, cap1_sec1_sub1, cap2', () => {
      const cap1 = !!buscaDispositivoById(state.articulacao!, 'cap1');
      const secao = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1');
      const subsecao = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1');
      const cap2 = !!buscaDispositivoById(state.articulacao!, 'cap2');

      expect(cap1).to.be.true;
      expect(secao).to.be.true;
      expect(subsecao).to.be.true;
      expect(cap2).to.be.true;

      expect(state.articulacao!.artigos[0].id).to.equal('art1');
      expect(state.articulacao!.artigos[1].id).to.equal('art2');
      expect(state.articulacao!.artigos[2].id).to.equal('art3');
      expect(state.articulacao!.artigos[3].id).to.equal('art4');
      expect(state.articulacao!.artigos[4].id).to.equal('art5');

      expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap2');
      expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap2');
      expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap2');
      expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap2');
      expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap2');

      expect(state.articulacao!.artigos.length).to.equal(5);
    });

    it('Deveria possuir 2 filhos (cap1 e cap2) na articulação', () => {
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(state.articulacao!.filhos[0].id).to.equal('cap1');
      expect(state.articulacao!.filhos[1].id).to.equal('cap2');
    });

    describe('Testando exclusão da Seção Única', () => {
      beforeEach(function () {
        const sec = buscaDispositivoById(state.articulacao!, 'cap1_sec1')!;
        state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.secao.tipo, uuid: sec.uuid! } });
      });

      it('Deveria retorna articulação sem alterações e mensagem de erro', () => {
        const sec = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1');
        expect(sec).to.be.true;
        expect(state.ui!.message!.descricao).to.equal('Operação não permitida (o agrupador "Subseção Única" não poder estar diretamente subordinado ao agrupador "CAPÍTULO I")');
        expect(state.ui!.message!.tipo).to.equal(TipoMensagem.ERROR);
      });
    });

    describe('Excluindo Capítulo II e testando estado da articulação', () => {
      beforeEach(function () {
        const cap2 = buscaDispositivoById(state.articulacao!, 'cap2')!;
        state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: cap2.uuid! } });
      });

      it('Deveria possuir agrupadores cap1, cap1_sec1 e cap1_sec1_sub1 na articulação', () => {
        const sub = buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1')!;
        expect(!!sub).to.be.true;
        expect(sub.pai!.id).to.equal('cap1_sec1');
        expect(sub.pai!.pai!.id).to.equal('cap1');
        expect(sub.pai!.pai!.pai!.id).to.be.undefined;
      });

      it('Deveria possuir 1 filho (cap1) na articulação', () => {
        expect(state.articulacao!.filhos.length).to.equal(1);
        expect(state.articulacao!.filhos[0].id).to.equal('cap1');
      });

      it('Articulação deveria permanecer com 5 artigos', () => {
        expect(state.articulacao!.artigos.length).to.equal(5);
      });

      it('O pai dos 5 artigos deveria ser "cap1_sec1_sub1"', () => {
        expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap1_sec1_sub1');
        expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap1_sec1_sub1');
        expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap1_sec1_sub1');
        expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap1_sec1_sub1');
        expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap1_sec1_sub1');
      });

      it('Testando ordem dos 5 artigos da articulação', () => {
        expect(state.articulacao!.artigos[0].id).to.equal('art1');
        expect(state.articulacao!.artigos[1].id).to.equal('art2');
        expect(state.articulacao!.artigos[2].id).to.equal('art3');
        expect(state.articulacao!.artigos[3].id).to.equal('art4');
        expect(state.articulacao!.artigos[4].id).to.equal('art5');
      });

      describe('Testando undo da exclusão do Cap 2', () => {
        beforeEach(function () {
          state = undo(state);
        });

        it('Deveria possuir 2 filhos (cap1 e cap2) na articulação', () => {
          expect(state.articulacao!.filhos.length).to.equal(2);
          expect(state.articulacao!.filhos[0].id).to.equal('cap1');
          expect(state.articulacao!.filhos[1].id).to.equal('cap2');
        });

        it('Articulação deveria permanecer com 5 artigos', () => {
          expect(state.articulacao!.artigos.length).to.equal(5);
        });

        it('O pai dos 5 artigos deveria ser "cap2"', () => {
          expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap2');
          expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap2');
          expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap2');
          expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap2');
          expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap2');
        });

        it('Testando ordem dos 5 artigos da articulação', () => {
          expect(state.articulacao!.artigos[0].id).to.equal('art1');
          expect(state.articulacao!.artigos[1].id).to.equal('art2');
          expect(state.articulacao!.artigos[2].id).to.equal('art3');
          expect(state.articulacao!.artigos[3].id).to.equal('art4');
          expect(state.articulacao!.artigos[4].id).to.equal('art5');
        });

        describe('Testando redo da exclusão do cap2', () => {
          beforeEach(function () {
            state = redo(state);
          });

          it('Deveria possuir 1 filho (cap1) na articulação', () => {
            expect(state.articulacao!.filhos.length).to.equal(1);
            expect(state.articulacao!.filhos[0].id).to.equal('cap1');
          });

          it('Articulação deveria permanecer com 5 artigos', () => {
            expect(state.articulacao!.artigos.length).to.equal(5);
          });

          it('O pai dos 5 artigos deveria ser "cap1_sec1_sub1"', () => {
            expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap1_sec1_sub1');
            expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap1_sec1_sub1');
            expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap1_sec1_sub1');
            expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap1_sec1_sub1');
            expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap1_sec1_sub1');
          });

          it('Testando ordem dos 5 artigos da articulação', () => {
            expect(state.articulacao!.artigos[0].id).to.equal('art1');
            expect(state.articulacao!.artigos[1].id).to.equal('art2');
            expect(state.articulacao!.artigos[2].id).to.equal('art3');
            expect(state.articulacao!.artigos[3].id).to.equal('art4');
            expect(state.articulacao!.artigos[4].id).to.equal('art5');
          });
        });
      });
    });
  });
});
