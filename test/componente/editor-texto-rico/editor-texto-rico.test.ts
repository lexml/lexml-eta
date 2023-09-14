import { expect, fixture, html } from '@open-wc/testing';
import { EditorTextoRicoComponent, Usuario } from '../../../src';
import { ajustaHtmlFromEditor, ajustaHtmlToEditor } from '../../../src/components/editor-texto-rico/texto-rico-util';
import { rootStore } from '../../../src/redux/store';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { atualizarUsuarioAction } from '../../../src/model/lexml/acao/atualizarUsuarioAction';

let editorTextoRico: EditorTextoRicoComponent;

const htmlEditor =
  '<p>Parágrafo alinhado à esquerda.</p><p class="ql-align-center">Parágrafo centralizado.</p><p class="ql-align-right">Parágrafo alinhado à direita.</p><p class="ql-align-justify">Parágrafo justificado.</p><table table_id="h2tap0hfojd" border="1"><tr row_id="ghi2y63a2wp"><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="o2xtredkgr"><p>1</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="y3kpm6x0qp8"><p>2</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="mq6yrrboj9n"><p>3</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="0xai4ouu7g8" colspan="2" rowspan="1"><p>4 5</p></td><td cell_id="87sznwm1sm6" row_id="ghi2y63a2wp" table_id="h2tap0hfojd" merge_id="0xai4ouu7g8"><p><br></p></td></tr><tr row_id="u6x50lx471h"><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="u3bfb5o0u1q"><p>6</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="gun68mala0v" colspan="1" rowspan="2"><p>7</p><p>12</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="1347b2f1wgc"><p>8</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="897bot8bdtq"><p>9</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="3wis8gkd39v"><p>10</p></td></tr><tr row_id="tf6pmpb0u8"><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="2zcd2xzlgm4"><p>11</p></td><td cell_id="sij2a8lbxsn" row_id="tf6pmpb0u8" table_id="h2tap0hfojd" merge_id="gun68mala0v"><p><br></p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="gctz0gcm4no"><p>13</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="yvdp5cr7kb"><p>14</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="a34mcja4ld5"><p>15</p></td></tr></table><p>Parágrafo final.</p>';

const htmlEmenda =
  '<p>Parágrafo alinhado à esquerda.</p><p class="align-center">Parágrafo centralizado.</p><p class="align-right">Parágrafo alinhado à direita.</p><p class="align-justify">Parágrafo justificado.</p><table table_id="h2tap0hfojd" border="1"><tbody><tr row_id="ghi2y63a2wp"><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="o2xtredkgr"><p>1</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="y3kpm6x0qp8"><p>2</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="mq6yrrboj9n"><p>3</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="0xai4ouu7g8" colspan="2" rowspan="1"><p>4 5</p></td></tr><tr row_id="u6x50lx471h"><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="u3bfb5o0u1q"><p>6</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="gun68mala0v" colspan="1" rowspan="2"><p>7</p><p>12</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="1347b2f1wgc"><p>8</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="897bot8bdtq"><p>9</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="3wis8gkd39v"><p>10</p></td></tr><tr row_id="tf6pmpb0u8"><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="2zcd2xzlgm4"><p>11</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="gctz0gcm4no"><p>13</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="yvdp5cr7kb"><p>14</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="a34mcja4ld5"><p>15</p></td></tr></tbody></table><p>Parágrafo final.</p>';

describe('Testando funções de conversão de html', () => {
  it('"ajustaHtmlFromEditor" deveria retornar string sem classes de alinhamento iniciando com "ql-" e sem tags td com atributo "merge_id"', () => {
    expect(ajustaHtmlFromEditor(htmlEditor).match(/ql-(indent|align-justify|align-center|align-right)/g)).to.be.null;
    expect(ajustaHtmlFromEditor(htmlEditor).includes('merge_id')).to.be.false;
  });

  it('"ajustaHtmlToEditor" deveria retornar string com classes de alinhamento iniciando com "ql-"', () => {
    expect(ajustaHtmlToEditor(htmlEmenda).match(/ql-(indent|align-justify|align-center|align-right)/g)).not.to.be.null;
  });
});

describe('Testando editor-texto-rico (EditorTextoRicoComponent)', () => {
  beforeEach(async function () {
    // const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    // state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ModoEdicaoEmenda.EMENDA_TEXTO_LIVRE });
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<editor-texto-rico></editor-texto-rico>`);

    const usuario = new Usuario();
    usuario.nome = 'Teste';
    rootStore.dispatch(atualizarUsuarioAction.execute(usuario));
  });

  it('Deveria exibir o editor', () => {
    expect(editorTextoRico).to.not.be.null;
    expect(editorTextoRico).to.not.be.undefined;
    expect(editorTextoRico).to.be.an.instanceOf(EditorTextoRicoComponent);
  });

  // it('Deveria simular o click no botão de inserir tabela', async () => {
  //   const tabela = editorTextoRico.querySelector('.ql-table .ql-picker-label');
  //   tabela?.dispatchEvent(new Event('mousedown'));
  //   expect(tabela).to.not.be.null;
  // });

  // describe('Testando inicialização de texto no editor', () => {
  //   beforeEach(async function () {
  //     editorTextoRico.setContent(htmlEmenda);
  //   });

  //   it('HTML deveria possuir classes de alinhamento iniciando com "ql-"', () => {
  //     const html = editorTextoRico.quill?.root.innerHTML || '';
  //     expect(html.includes('ql-align-center')).to.be.true;
  //     expect(html.includes('ql-align-justify')).to.be.true;
  //     expect(html.includes('ql-align-right')).to.be.true;
  //   });

  //   it('HTML deveria possuir 1 tabela', () => {
  //     expect(editorTextoRico.quill?.root.innerHTML.match(/<table/g)?.length).to.be.equal(1);
  //   });

  //   it('HTML deveria possuir 2 tags td com atributo "merge_id"', () => {
  //     expect(editorTextoRico.quill?.root.innerHTML.match(/<td[^>]*\smerge_id="[^"]*"[^>]*>/g)?.length).to.be.equal(2);
  //   });

  //   it('Deveria possuir html "ajustado" igual a htmlEmenda', () => {
  //     expect(ajustaHtmlFromEditor(editorTextoRico.quill?.root.innerHTML)).to.be.equal(htmlEmenda);
  //   });
  // });

  // describe('Testando inclusão de tabela com 2 linhas e 2 colunas', () => {
  //   beforeEach(function () {
  //     const el = editorTextoRico.querySelector('span.ql-table span[data-value="newtable_2_2"]')! as any;
  //     el.click();
  //   });

  //   it('Deveria possuir tabela com 2 linhas e 2 colunas', () => {
  //     const html = editorTextoRico.quill?.root.innerHTML;
  //     const nTables = html?.match(/<table/g)?.length;
  //     const nRows = html?.match(/<tr/g)?.length;
  //     const nCols = html?.match(/<td/g)?.length;
  //     expect(nTables).to.be.equal(1);
  //     expect(nRows).to.be.equal(2);
  //     expect(nCols).to.be.equal(4);
  //   });
  // });

  describe('Testando revisão de texto', () => {
    describe('Inicializando texto no editor', () => {
      beforeEach(function () {
        editorTextoRico.setContent('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
      });

      it('Deveria apresentar atributo texto com valor "<p>Parágrafo 1</p><p>Parágrafo 2</p>"', () => {
        expect(editorTextoRico.texto).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
      });

      it('Deveria apresentar atributo textoAntesRevisao igual a undefined', () => {
        expect(editorTextoRico.textoAntesRevisao).to.be.undefined;
      });

      // describe('Ativando revisão e testando atributoTextoAntesRevisao', () => {
      //   // beforeEach(function () {
      //   //   // rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      //   //   state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      //   // });

      //   it('Deveria estar em modo de revisão e apresentar textoAntesRevisao igual a undefined', () => {
      //     rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      //     expect(rootStore.getState().elementoReducer.emRevisao).to.be.true;
      //     expect(editorTextoRico.textoAntesRevisao).to.be.undefined;
      //     rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      //   });
      // });

      // describe('Ativando revisão', () => {
      //   it('Deveria estar em modo de revisão e apresentar textoAntesRevisao igual a undefined', () => {
      //     state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      //     expect(state.emRevisao).to.be.true;
      //     expect(editorTextoRico.textoAntesRevisao).to.be.undefined;
      //   });
      // });

      describe('Ativando revisão e alterando texto', () => {
        it('Deveria estar em modo de revisão e apresentar textoAntesRevisao igual a "<p>Parágrafo 1</p><p>Parágrafo 2</p>" *', () => {
          expect(!!rootStore.getState().elementoReducer.emRevisao).to.be.false;
          rootStore.dispatch(ativarDesativarRevisaoAction.execute());
          expect(rootStore.getState().elementoReducer.emRevisao).to.be.true;
          expect(editorTextoRico.textoAntesRevisao).to.be.undefined;

          editorTextoRico.quill?.insertText(0, 'TESTE');
          expect(editorTextoRico.texto).to.be.equal('<p>TESTEParágrafo 1</p><p>Parágrafo 2</p>');
          rootStore.dispatch(ativarDesativarRevisaoAction.execute());
          expect(!!rootStore.getState().elementoReducer.emRevisao).to.be.false;

          // console.log(editorTextoRico.texto);
          // console.log(editorTextoRico.textoAntesRevisao);
          // rootStore.dispatch(ativarDesativarRevisaoAction.execute());
          // expect(rootStore.getState().elementoReducer.emRevisao).to.be.true;
          // expect(editorTextoRico.textoAntesRevisao).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
        });
      });

      describe('Ativando revisão, alterando texto e desfazendo alteração', () => {
        it('Deveria estar em modo de revisão e apresentar textoAntesRevisao igual a "<p>Parágrafo 1</p><p>Parágrafo 2</p>" **', () => {
          expect(!!rootStore.getState().elementoReducer.emRevisao).to.be.false;
          rootStore.dispatch(ativarDesativarRevisaoAction.execute());
          expect(rootStore.getState().elementoReducer.emRevisao).to.be.true;
          expect(editorTextoRico.textoAntesRevisao).to.be.undefined;

          editorTextoRico.quill?.insertText(0, 'TESTE');
          expect(editorTextoRico.texto).to.be.equal('<p>TESTEParágrafo 1</p><p>Parágrafo 2</p>');
          expect(editorTextoRico.textoAntesRevisao).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');

          // editorTextoRico.quill?.history.undo();
          editorTextoRico.quill?.deleteText(0, 5);
          expect(editorTextoRico.textoAntesRevisao).to.be.undefined;
          expect(editorTextoRico.texto).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
          rootStore.dispatch(ativarDesativarRevisaoAction.execute());
        });
      });
    });
  });
});
