import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { buscaDispositivoById, findDispositivoByUuid } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { PLP_68_2024 } from '../../../demo/doc/plp_68_2024';
import { Paginacao } from '../../../src/redux/state';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';

let state: any;

// A inclusão preserva a identidade dos dispositivos, então o artigo incluído é rastreado por uuid.
// A movimentação recria os dispositivos, então lá ele é localizado por ser o único artigo sem texto.
const artigosIncluidos = (): any[] => state.articulacao.artigos.filter((a: any) => !a.texto);

const artigoIncluido = (): any => artigosIncluidos()[0];

const porUuid = (uuid: number): any => findDispositivoByUuid(state.articulacao, uuid)!;

const artigoPosteriorA = (d: any): any => d.pai.filhos[d.pai.indexOf(d) + 1];

const indicePaginaDe = (d: any): number => (state.ui.paginacao as Paginacao).paginasArticulacao!.findIndex(p => p.ids.includes(d.id));

const indicePaginaDoTituloV = (): number => indicePaginaDe(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);

describe('Testando inclusão de dispositivos em proposições paginadas', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(PLP_68_2024, false);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Inclui artigo antes do Título V do Livro I', () => {
    let uuidIncluido: number;

    beforeEach(function () {
      const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });
      uuidIncluido = artigoIncluido().uuid;
    });

    it('O artigo incluído deveria estar na mesma página do Título V do Livro I (liv1_tit5)', () => {
      expect(indicePaginaDe(porUuid(uuidIncluido))).to.be.equal(indicePaginaDoTituloV());
    });
  });

  describe('Inclui artigo antes do Título V do Livro I, e depois inclui artigo após art. 160', () => {
    let uuidAntesDoTitulo: number;
    let uuidAposArt160: number;

    beforeEach(function () {
      const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });
      uuidAntesDoTitulo = artigoIncluido().uuid;

      const e2 = createElemento(buscaDispositivoById(state.articulacao, 'art160')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e2, novo: { tipo: 'Artigo' }, posicao: 'depois' });
      uuidAposArt160 = artigosIncluidos().find((a: any) => a.uuid !== uuidAntesDoTitulo)!.uuid;
    });

    it('O artigo incluído após o Art. 160 deveria estar na mesma página do Art. 160', () => {
      expect(indicePaginaDe(porUuid(uuidAposArt160))).to.be.equal(indicePaginaDe(buscaDispositivoById(state.articulacao, 'art160')!));
    });

    it('O artigo incluído antes do Título V deveria estar na mesma página do Título V do Livro I (liv1_tit5)', () => {
      expect(indicePaginaDe(porUuid(uuidAntesDoTitulo))).to.be.equal(indicePaginaDoTituloV());
    });

    it('A página do artigo incluído antes do Título V não deveria possuir o artigo incluído após o Art. 160', () => {
      const paginasArticulacao = (state.ui.paginacao as Paginacao).paginasArticulacao!;
      expect(paginasArticulacao[indicePaginaDe(porUuid(uuidAntesDoTitulo))].ids.includes(porUuid(uuidAposArt160).id)).to.be.false;
    });

    it('Os novos artigos deveriam estar em páginas diferentes', () => {
      expect(indicePaginaDe(porUuid(uuidAposArt160))).to.not.be.equal(indicePaginaDe(porUuid(uuidAntesDoTitulo)));
    });
  });

  describe('Testando movimentação de dispositivos entre páginas', () => {
    describe('Inclui artigo antes do Título V do Livro I e move para cima', () => {
      beforeEach(function () {
        const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });

        state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(artigoIncluido()) });
      });

      it('O artigo movido deveria estar na mesma página do artigo que passou a sucedê-lo', () => {
        const movido = artigoIncluido();
        expect(indicePaginaDe(movido)).to.be.equal(indicePaginaDe(artigoPosteriorA(movido)));
      });
    });

    describe('Inclui artigo antes do Título V do Livro I, move para cima e depois move para baixo 2 vezes', () => {
      beforeEach(function () {
        const e = createElemento(buscaDispositivoById(state.articulacao, 'liv1_tit5')!);
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'antes' });

        state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(artigoIncluido()) });
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(artigoIncluido()) });
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(artigoIncluido()) });
      });

      it('Pai do artigo movido deveria ser o Título V do Livro I (liv1_tit5)', () => {
        expect(artigoIncluido().pai?.id).to.be.equal('liv1_tit5');
      });

      it('Página 0 não deveria possuir o artigo movido', () => {
        const pagina0 = (state.ui.paginacao as Paginacao).paginasArticulacao![0];
        expect(pagina0.ids.includes(artigoIncluido().id)).to.be.false;
      });

      it('Página 1 deveria possuir o artigo movido', () => {
        const pagina1 = (state.ui.paginacao as Paginacao).paginasArticulacao![1];
        expect(pagina1.ids.includes(artigoIncluido().id)).to.be.true;
      });

      it('O artigo movido deveria estar na mesma página do Título V do Livro I (liv1_tit5)', () => {
        expect(indicePaginaDe(artigoIncluido())).to.be.equal(indicePaginaDoTituloV());
      });
    });
  });

  // TODO: testar exclusão em modo de revisão (o dispositivo excluído deve permanecer na página e os ids devem ser atualizados)
  // TODO: testar incluindo arts. 160-1 e 160-2 (ambos na página de índice 1), e 160-3 (na página de índice 2) e excluindo o art. 160-1 em modo de revisão
});
