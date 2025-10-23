import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { PLP_68_2024 } from '../../../demo/doc/plp_68_2024';
import { Paginacao } from '../../../src/redux/state';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';

let state: any;

describe('Testando inclusão de dispositivos em proposições paginadas', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(PLP_68_2024, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Inclui artigo antes do Título V do Livro I', () => {
    beforeEach(function () {
      const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });
    });

    it('Artigo "art160-1" deveria estar na mesma página do Título V do Livro I (liv1_tit5)', () => {
      const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
      const indexPagLiv1Tit5 = paginasArticulacao.findIndex(p => p.ids.includes('liv1_tit5'));
      const indexPagArt160_1 = paginasArticulacao.findIndex(p => p.ids.includes('art160-1'));
      expect(indexPagArt160_1).to.be.equal(indexPagLiv1Tit5);
    });
  });

  describe('Inclui artigo antes do Título V do Livro I, e depois inclui artigo após art. 160', () => {
    beforeEach(function () {
      // Inclui artigo antes do Título V do Livro I (o artigo Art. 160-1 será criado)
      const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });

      // Inclui artigo após o Art. 160 (um NOVO artigo Art. 160-1 será criado e o artigo anterior será renumerado para Art. 160-2)
      const e2 = createElemento(buscaDispositivoById(state.articulacao, 'art160')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e2, novo: { tipo: 'Artigo' }, posicao: 'depois' });
    });

    it('Artigo "art160-1" deveria estar na mesma página do Art. 160', () => {
      const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
      const indexPagArt160 = paginasArticulacao.findIndex(p => p.ids.includes('art160'));
      const indexPagArt160_1 = paginasArticulacao.findIndex(p => p.ids.includes('art160-1'));
      expect(indexPagArt160_1).to.be.equal(indexPagArt160);
    });

    it('Artigo "art160-2" deveria estar na mesma página do Título V do Livro I (liv1_tit5)', () => {
      const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
      const indexPagLiv1Tit5 = paginasArticulacao.findIndex(p => p.ids.includes('liv1_tit5'));
      const indexPagArt160_2 = paginasArticulacao.findIndex(p => p.ids.includes('art160-2'));
      expect(indexPagArt160_2).to.be.equal(indexPagLiv1Tit5);
    });

    it('Página do Art. 160-2 não deveria possuir o Art. 160-1', () => {
      const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
      const indexPagArt160_2 = paginasArticulacao.findIndex(p => p.ids.includes('art160-2'));
      expect(paginasArticulacao[indexPagArt160_2].ids.includes('art160-1')).to.be.false;
    });

    it('Os novos artigos deveriam estar em páginas diferentes', () => {
      const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
      const indexPagArt160_1 = paginasArticulacao.findIndex(p => p.ids.includes('art160-1'));
      const indexPagArt160_2 = paginasArticulacao.findIndex(p => p.ids.includes('art160-2'));
      expect(indexPagArt160_1).to.not.be.equal(indexPagArt160_2);
    });
  });

  describe('Testando movimentação de dispositivos entre páginas', () => {
    describe('Inclui artigo antes do Título V do Livro I e move para cima', () => {
      beforeEach(function () {
        const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });

        const e2 = createElemento(buscaDispositivoById(state.articulacao, 'art160-1')!);
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: e2 });
        // Obs: artigo "art160-1" virou "art159-1"
      });

      it('Artigo "art159-1" deveria estar na mesma página do Art. 160', () => {
        const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
        const indexPagArt160 = paginasArticulacao.findIndex(p => p.ids.includes('art160'));
        const indexPagArt160_1 = paginasArticulacao.findIndex(p => p.ids.includes('art159-1'));
        expect(indexPagArt160_1).to.be.equal(indexPagArt160);
      });
    });

    describe('Inclui artigo antes do Título V do Livro I, move para cima e depois move para baixo 2 vezes', () => {
      beforeEach(function () {
        const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });

        const e2 = createElemento(buscaDispositivoById(state.articulacao, 'art160-1')!);
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: e2 });
        // Obs: artigo "art160-1" virou "art159-1"

        const e3 = createElemento(buscaDispositivoById(state.articulacao, 'art159-1')!);
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: e3 });

        const e4 = createElemento(buscaDispositivoById(state.articulacao, 'art160-1')!);
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: e4 });
      });

      it('Pai do Artigo "art160-1" deveria ser o Título V do Livro I (liv1_tit5)', () => {
        const art160_1 = buscaDispositivoById(state.articulacao, 'art160-1')!;
        expect(art160_1.pai?.id).to.be.equal('liv1_tit5');
      });

      it('Página 0 não deveria possuir o Art. 160-1', () => {
        const pagina0 = (state.ui.paginacao as Paginacao).paginasArticulacao![0];
        expect(pagina0.ids.includes('art160-1')).to.be.false;
      });

      it('Página 1 deveria possuir o Art. 160-1', () => {
        const pagina1 = (state.ui.paginacao as Paginacao).paginasArticulacao![1];
        expect(pagina1.ids.includes('art160-1')).to.be.true;
      });

      it('Artigo "art160-1" deveria estar na mesma página do Título V do Livro I (liv1_tit5)', () => {
        const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
        const indexPagLiv1Tit5 = paginasArticulacao.findIndex(p => p.ids.includes('liv1_tit5'));
        const indexPagArt160_1 = paginasArticulacao.findIndex(p => p.ids.includes('art160-1'));
        expect(indexPagArt160_1).to.be.equal(indexPagLiv1Tit5);
      });
    });
  });

  // TODO: testar exclusão em modo de revisão (o dispositivo excluído deve permanecer na página e os ids devem ser atualizados)
  // TODO: testar incluindo arts. 160-1 e 160-2 (ambos na página de índice 1), e 160-3 (na página de índice 2) e excluindo o art. 160-1 em modo de revisão
});
