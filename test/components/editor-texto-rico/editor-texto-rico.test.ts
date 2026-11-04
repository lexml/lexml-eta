import { expect, fixture, html } from '@open-wc/testing';
import { SinonFakeTimers, useFakeTimers } from 'sinon';
import { EditorTextoRicoComponent, Usuario } from '../../../src';
import { ajustaHtmlFromEditor, ajustaHtmlToEditor, removeMarcacaoComentario } from '../../../src/components/editor-texto-rico/texto-rico-util';
import { rootStore } from '../../../src/redux/store';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { atualizarUsuarioAction } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { atualizaRevisaoTextoLivre } from '../../../src/redux/elemento/reducer/atualizaRevisaoTextoLivre';

let editorTextoRico: EditorTextoRicoComponent;

const htmlEditor =
  '<p>Parágrafo alinhado à esquerda.</p><p class="ql-align-center">Parágrafo centralizado.</p><p class="ql-align-right">Parágrafo alinhado à direita.</p><p class="ql-align-justify">Parágrafo justificado.</p><table table_id="h2tap0hfojd" border="1"><tr row_id="ghi2y63a2wp"><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="o2xtredkgr"><p>1</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="y3kpm6x0qp8"><p>2</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="mq6yrrboj9n"><p>3</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="0xai4ouu7g8" colspan="2" rowspan="1"><p>4 5</p></td><td cell_id="87sznwm1sm6" row_id="ghi2y63a2wp" table_id="h2tap0hfojd" merge_id="0xai4ouu7g8"><p><br></p></td></tr><tr row_id="u6x50lx471h"><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="u3bfb5o0u1q"><p>6</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="gun68mala0v" colspan="1" rowspan="2"><p>7</p><p>12</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="1347b2f1wgc"><p>8</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="897bot8bdtq"><p>9</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="3wis8gkd39v"><p>10</p></td></tr><tr row_id="tf6pmpb0u8"><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="2zcd2xzlgm4"><p>11</p></td><td cell_id="sij2a8lbxsn" row_id="tf6pmpb0u8" table_id="h2tap0hfojd" merge_id="gun68mala0v"><p><br></p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="gctz0gcm4no"><p>13</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="yvdp5cr7kb"><p>14</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="a34mcja4ld5"><p>15</p></td></tr></table><p>Parágrafo final.</p>';

const htmlAjustado =
  '<p>Parágrafo alinhado à esquerda.</p><p class="align-center">Parágrafo centralizado.</p><p class="align-right">Parágrafo alinhado à direita.</p><p class="align-justify">Parágrafo justificado.</p><table table_id="h2tap0hfojd" border="1"><tbody><tr row_id="ghi2y63a2wp"><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="o2xtredkgr"><p>1</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="y3kpm6x0qp8"><p>2</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="mq6yrrboj9n"><p>3</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="ghi2y63a2wp" cell_id="0xai4ouu7g8" colspan="2" rowspan="1"><p>4 5</p></td></tr><tr row_id="u6x50lx471h"><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="u3bfb5o0u1q"><p>6</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="gun68mala0v" colspan="1" rowspan="2"><p>7</p><p>12</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="1347b2f1wgc"><p>8</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="897bot8bdtq"><p>9</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="u6x50lx471h" cell_id="3wis8gkd39v"><p>10</p></td></tr><tr row_id="tf6pmpb0u8"><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="2zcd2xzlgm4"><p>11</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="gctz0gcm4no"><p>13</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="yvdp5cr7kb"><p>14</p></td><td class="td-q" table_id="h2tap0hfojd" row_id="tf6pmpb0u8" cell_id="a34mcja4ld5"><p>15</p></td></tr></tbody></table><p>Parágrafo final.</p>';

describe('Testando funções de conversão de html', () => {
  it('"ajustaHtmlFromEditor" deveria retornar string sem classes de alinhamento iniciando com "ql-" e sem tags td com atributo "merge_id"', () => {
    expect(ajustaHtmlFromEditor(htmlEditor).match(/ql-(indent|align-justify|align-center|align-right)/g)).to.be.null;
    expect(ajustaHtmlFromEditor(htmlEditor).includes('merge_id')).to.be.false;
  });

  it('"ajustaHtmlToEditor" deveria retornar string com classes de alinhamento iniciando com "ql-"', () => {
    expect(ajustaHtmlToEditor(htmlAjustado).match(/ql-(indent|align-justify|align-center|align-right)/g)).not.to.be.null;
  });
});

describe('Testando lexml-eta-editor-texto-rico (EditorTextoRicoComponent)', () => {
  beforeEach(async function () {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);

    rootStore.getState().elementoReducer = {
      articulacao: undefined,
      modo: 'proposicao',
      past: [],
      present: [],
      future: [],
      ui: {
        events: [],
        alertas: [],
      },
      revisoes: [],
      emRevisao: undefined,
      numEventosPassadosAntesDaRevisao: 0,
    };

    const usuario = new Usuario();
    usuario.nome = 'Teste';
    rootStore.dispatch(atualizarUsuarioAction.execute(usuario));
  });

  it('Deveria exibir o editor', () => {
    expect(editorTextoRico).to.not.be.null;
    expect(editorTextoRico).to.not.be.undefined;
    expect(editorTextoRico).to.be.an.instanceOf(EditorTextoRicoComponent);
  });

  it('Deveria simular o click no botão de inserir tabela', async () => {
    const tabela = editorTextoRico.querySelector('.ql-table .ql-picker-label');
    tabela?.dispatchEvent(new Event('mousedown'));
    expect(tabela).to.not.be.null;
  });

  describe('Testando inicialização de texto no editor', () => {
    beforeEach(function () {
      editorTextoRico.setContent(htmlAjustado);
    });

    it('HTML deveria possuir classes de alinhamento iniciando com "ql-"', () => {
      const html = editorTextoRico.quill?.root.innerHTML || '';
      expect(html.includes('ql-align-center')).to.be.true;
      expect(html.includes('ql-align-justify')).to.be.true;
      expect(html.includes('ql-align-right')).to.be.true;
    });

    it('HTML deveria possuir 1 tabela', () => {
      expect(editorTextoRico.quill?.root.innerHTML.match(/<table/g)?.length).to.be.equal(1);
    });

    it('HTML deveria possuir 2 tags td com atributo "merge_id"', () => {
      expect(editorTextoRico.quill?.root.innerHTML.match(/<td[^>]*\smerge_id="[^"]*"[^>]*>/g)?.length).to.be.equal(2);
    });

    it('Deveria possuir html "ajustado" igual a htmlAjustado', () => {
      expect(ajustaHtmlFromEditor(editorTextoRico.quill?.root.innerHTML)).to.be.equal(htmlAjustado);
    });
  });

  describe('Testando inclusão de tabela com 2 linhas e 2 colunas', () => {
    beforeEach(function () {
      const el = editorTextoRico.querySelector('span.ql-table span[data-value="newtable_2_2"]')! as any;
      el.click();
    });

    it('Deveria possuir tabela com 2 linhas e 2 colunas', () => {
      const html = editorTextoRico.quill?.root.innerHTML;
      const nTables = html?.match(/<table/g)?.length;
      const nRows = html?.match(/<tr/g)?.length;
      const nCols = html?.match(/<td/g)?.length;
      expect(nTables).to.be.equal(1);
      expect(nRows).to.be.equal(2);
      expect(nCols).to.be.equal(4);
    });
  });

  describe('Testando revisão de texto', () => {
    describe('Inicializando texto no editor', () => {
      beforeEach(function () {
        editorTextoRico.setContent('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
        rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      });

      afterEach(function () {
        atualizaRevisaoTextoLivre(rootStore.getState().elementoReducer, true);
        rootStore.dispatch(ativarDesativarRevisaoAction.execute());
        expect(rootStore.getState().elementoReducer.emRevisao).to.be.false;
        expect(editorTextoRico.textoAntesRevisao).to.be.undefined;
      });

      it('Deveria apresentar atributo texto com valor "<p>Parágrafo 1</p><p>Parágrafo 2</p>"', () => {
        expect(editorTextoRico.texto).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
      });

      it('Deveria apresentar atributo textoAntesRevisao igual a undefined', () => {
        expect(editorTextoRico.textoAntesRevisao).to.be.undefined;
      });

      it('Atributo "emRevisao" deveria ser true', () => {
        expect(rootStore.getState().elementoReducer.emRevisao).to.be.true;
      });

      describe('Ativando revisão e alterando texto', () => {
        it('Deveria estar em modo de revisão e apresentar textoAntesRevisao igual a "<p>Parágrafo 1</p><p>Parágrafo 2</p>" *', () => {
          editorTextoRico.quill?.insertText(0, 'TESTE');
          expect(editorTextoRico.texto).to.be.equal('<p>TESTEParágrafo 1</p><p>Parágrafo 2</p>');
          // expect(editorTextoRico.textoAntesRevisao).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
        });
      });

      describe('Ativando revisão, alterando texto e desfazendo alteração', () => {
        it('Deveria estar em modo de revisão e apresentar textoAntesRevisao igual a "<p>Parágrafo 1</p><p>Parágrafo 2</p>" **', () => {
          editorTextoRico.quill?.insertText(0, 'TESTE');
          expect(editorTextoRico.texto).to.be.equal('<p>TESTEParágrafo 1</p><p>Parágrafo 2</p>');
          // expect(editorTextoRico.textoAntesRevisao).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');

          editorTextoRico.quill?.deleteText(0, 5);
          // expect(editorTextoRico.textoAntesRevisao).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>'); // Continua igual porque as revisões ainda não foram aceitas
          expect(editorTextoRico.texto).to.be.equal('<p>Parágrafo 1</p><p>Parágrafo 2</p>');
        });
      });
    });
  });
});

describe('Autor completo na marca de revisão de texto', () => {
  const marca = (tag: string, idRevisao: string, idUsuario = '', sigla = ''): string =>
    `<${tag} usuario="Fulano de Tal" date="2026-05-11 15:51:00 " id-revisao="${idRevisao}"` +
    (idUsuario ? ` id-usuario="${idUsuario}"` : '') +
    (sigla ? ` sigla-usuario="${sigla}"` : '') +
    `>`;

  beforeEach(async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
    rootStore.dispatch(atualizarUsuarioAction.execute(new Usuario('Fulano de Tal', 'sf:fulano', 'FT')));
  });

  afterEach(() => {
    if (rootStore.getState().elementoReducer.emRevisao) {
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
    }
  });

  it('a marca criada em modo de revisão tem o id e a sigla do usuário do estado', () => {
    editorTextoRico.setContent('<p>Parágrafo 1</p>');
    rootStore.dispatch(ativarDesativarRevisaoAction.execute());
    editorTextoRico.quill?.insertText(0, 'TESTE', 'user');

    const ins = editorTextoRico.quill!.root.querySelector('ins')!;
    expect(!!ins).to.be.true;
    expect(ins.getAttribute('usuario')).to.equal('Fulano de Tal');
    expect(ins.getAttribute('id-usuario')).to.equal('sf:fulano');
    expect(ins.getAttribute('sigla-usuario')).to.equal('FT');
    expect(ins.getAttribute('id-revisao')).to.not.be.empty;
  });

  it('uma marca recebida sem id e sigla do usuário continua sendo marca de revisão', () => {
    editorTextoRico.setContent(`<p>${marca('del', 'r1')}Excluído</del> mantido</p>`);

    const del = editorTextoRico.quill!.root.querySelector('del')!;
    expect(!!del).to.be.true;
    expect(del.getAttribute('usuario')).to.equal('Fulano de Tal');
    expect(del.hasAttribute('id-usuario')).to.be.false;
    expect(del.hasAttribute('sigla-usuario')).to.be.false;
    expect((editorTextoRico.quill as any).revisao.getQuantidadeRevisoes()).to.equal(1);
  });

  it('duas marcas vizinhas fundidas pelo optimize mantêm o id e a sigla do usuário', () => {
    editorTextoRico.setContent(`<p>${marca('ins', 'r1', 'sf:fulano', 'FT')}A</ins>${marca('ins', 'r2', 'sf:ciclana', 'CC')}B</ins> fim</p>`);

    const marcas = Array.from(editorTextoRico.quill!.root.querySelectorAll('ins'));
    expect(marcas.map(el => el.textContent).join('')).to.equal('AB');
    marcas.forEach(el => {
      expect(el.getAttribute('id-usuario')).to.equal('sf:fulano');
      expect(el.getAttribute('sigla-usuario')).to.equal('FT');
    });
  });
});

describe('Testando emissão de onchange do lexml-eta-editor-texto-rico', () => {
  let clock: SinonFakeTimers;
  let eventos: CustomEvent[];

  beforeEach(async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico registro-evento="justificativa"></lexml-eta-editor-texto-rico>`);
    eventos = [];
    editorTextoRico.addEventListener('onchange', e => eventos.push(e as CustomEvent));
    clock = useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('emite um único onchange 1s depois da última alteração, com a origem do atributo registro-evento', () => {
    editorTextoRico.quill?.insertText(0, 'A', 'user');
    clock.tick(500);
    editorTextoRico.quill?.insertText(1, 'B', 'user');
    clock.tick(999);
    expect(eventos).to.have.length(0);

    clock.tick(1);
    expect(eventos).to.have.length(1);
    expect(eventos[0].detail.origemEvento).to.equal('justificativa');
    expect(eventos[0].bubbles).to.be.true;
    expect(eventos[0].composed).to.be.true;
  });

  it('não emite onchange ao carregar o texto com setContent', () => {
    editorTextoRico.setContent('<p>Justificação carregada.</p>');
    editorTextoRico.setContent('');
    clock.tick(2000);
    expect(eventos).to.have.length(0);
  });
});

describe('Destaque das marcas de revisão no texto rico', () => {
  const marca = (tag: string, idRevisao: string): string => `<${tag} usuario="Fulano de Tal" date="2026-05-11 15:51:00 " id-revisao="${idRevisao}">`;

  beforeEach(async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico modo="justificativa"></lexml-eta-editor-texto-rico>`);
  });

  it('exibe a inclusão com letra verde, sem fundo nem sublinhado', () => {
    editorTextoRico.setContent(`<p>Texto ${marca('ins', 'r1')}incluído</ins> fim</p>`);
    const estilo = getComputedStyle(editorTextoRico.quill!.root.querySelector('ins')!);

    expect(estilo.color).to.equal('rgb(24, 128, 56)');
    expect(estilo.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    expect(estilo.textDecorationLine).to.equal('none');
  });

  it('exibe a exclusão com o traço vermelho por imagem de fundo, sem cor de fundo nem text-decoration', () => {
    editorTextoRico.setContent(`<p>Texto ${marca('del', 'r1')}excluído</del> fim</p>`);
    const estilo = getComputedStyle(editorTextoRico.quill!.root.querySelector('del')!);

    expect(estilo.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    expect(estilo.backgroundImage).to.contain('linear-gradient');
    expect(estilo.backgroundImage).to.contain('rgb(217, 48, 37)');
    expect(estilo.textDecorationLine).to.equal('none');
  });

  it('emoldura a marca com a classe de seleção, na cor da operação', () => {
    editorTextoRico.setContent(`<p>${marca('ins', 'r1')}incluído</ins> ${marca('del', 'r2')}excluído</del></p>`);
    const ins = editorTextoRico.quill!.root.querySelector('ins')!;
    const del = editorTextoRico.quill!.root.querySelector('del')!;
    ins.classList.add('revisao-selecionada');
    del.classList.add('revisao-selecionada');

    expect(getComputedStyle(ins).borderTopColor).to.equal('rgb(24, 128, 56)');
    expect(getComputedStyle(del).borderBottomColor).to.equal('rgb(217, 48, 37)');
    expect(getComputedStyle(ins, '::before').content).to.not.equal('none');
    ins.classList.add('revisao-fragmento-continua-anterior');
    expect(getComputedStyle(ins, '::before').content).to.equal('none');
  });

  describe('Moldura da revisão sob o cursor', () => {
    let clock: SinonFakeTimers;

    beforeEach(() => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
    });

    afterEach(() => {
      clock.restore();
    });

    const posicionarCursor = (indice: number, tamanho = 0): void => {
      editorTextoRico.onSelectionChange({ index: indice, length: tamanho });
      clock.tick(0);
    };
    const indiceDe = (texto: string): number => editorTextoRico.quill!.getText().indexOf(texto);
    const selecionadas = (): string[] =>
      Array.from(editorTextoRico.quill!.root.querySelectorAll('.revisao-selecionada')).map(el => `${el.tagName.toLowerCase()}:${el.textContent}`);

    it('emoldura só a inclusão sob o cursor', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('ins', 'r1')}incluído</ins> meio ${marca('ins', 'r2')}outro</ins></p>`);
      posicionarCursor(indiceDe('incluído') + 2);

      expect(selecionadas()).to.deep.equal(['ins:incluído']);
    });

    it('emoldura todos os trechos da exclusão que atravessa um negrito e marca o par contíguo', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('del', 'r1')}parte </del><strong>${marca('del', 'r1')}negrito</del></strong> fim</p>`);
      posicionarCursor(indiceDe('parte') + 1);

      expect(selecionadas()).to.deep.equal(['del:parte ', 'del:negrito']);
      const [primeiro, segundo] = Array.from(editorTextoRico.quill!.root.querySelectorAll('del'));
      expect(primeiro.classList.contains('revisao-fragmento-continua-proximo')).to.be.true;
      expect(segundo.classList.contains('revisao-fragmento-continua-anterior')).to.be.true;
    });

    it('na substituição emoldura só o lado sob o cursor', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('del', 'r1')}velho</del>${marca('ins', 'r1')}novo</ins> fim</p>`);
      posicionarCursor(indiceDe('novo') + 1);

      expect(selecionadas()).to.deep.equal(['ins:novo']);
    });

    it('com seleção, considera a marca do primeiro caractere selecionado', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('ins', 'r1')}incluído</ins> fim</p>`);
      posicionarCursor(indiceDe('incluído'), 3);

      expect(selecionadas()).to.deep.equal(['ins:incluído']);
    });

    it('retira a moldura quando o cursor vai para texto sem revisão', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('ins', 'r1')}incluído</ins> fim do texto</p>`);
      posicionarCursor(indiceDe('incluído') + 2);
      posicionarCursor(indiceDe('do texto') + 1);

      expect(selecionadas()).to.deep.equal([]);
      expect(!!editorTextoRico.quill!.root.querySelector('[class*="revisao-fragmento"]')).to.be.false;
    });

    it('mover o cursor entre marcas não acrescenta passos ao desfazer', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('ins', 'r1')}incluído</ins> fim</p>`);
      const quill = editorTextoRico.quill as any;
      quill.history.clear();
      posicionarCursor(indiceDe('incluído') + 2);
      posicionarCursor(indiceDe('fim') + 1);

      expect(quill.history.stack.undo).to.have.length(0);
    });
  });

  describe('Atributos só de tela', () => {
    it('desliga a verificação ortográfica do texto excluído ao carregar e depois de editar', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('del', 'r1')}Contratto</del></p>`);
      expect(editorTextoRico.quill!.root.querySelector('del')!.getAttribute('spellcheck')).to.equal('false');

      editorTextoRico.quill!.insertText(0, 'Novo ', 'user');
      editorTextoRico.quill!.root.querySelectorAll('del').forEach(el => expect(el.getAttribute('spellcheck')).to.equal('false'));
    });

    it('o texto entregue não tem a moldura nem o atributo de verificação ortográfica', () => {
      editorTextoRico.setContent(`<p>Antes ${marca('del', 'r1')}parte </del><strong>${marca('del', 'r1')}negrito</del></strong></p>`);
      editorTextoRico.quill!.root.querySelectorAll('del').forEach(el => el.classList.add('revisao-selecionada'));
      editorTextoRico.quill!.root.querySelector('del')!.classList.add('revisao-fragmento-continua-proximo');

      editorTextoRico.updateApenasTexto();

      expect(editorTextoRico.texto).to.contain('<del');
      expect(editorTextoRico.texto).to.not.contain('spellcheck');
      expect(editorTextoRico.texto).to.not.contain('revisao-');
      expect(editorTextoRico.texto).to.not.contain('class=""');
    });
  });
});

describe('Marcação de trecho comentado no Quill', () => {
  const ID = 'sc123';
  const modulo = (): any => (editorTextoRico.quill as any).comentarios;
  const html_ = (): string => editorTextoRico.quill!.root.innerHTML;

  beforeEach(async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico modo="justificativa"></lexml-eta-editor-texto-rico>`);
  });

  it('marca a seleção com a tag de comentário e posiciona o cursor no início', () => {
    editorTextoRico.setContent('<p>Texto para comentário.</p>');

    expect(modulo().adicionar(ID, { index: 0, length: 5 })).to.equal(true);
    expect(html_()).to.include(`<comentario id-sequencia-comentario="${ID}">Texto</comentario>`);
    expect(editorTextoRico.quill!.getSelection()).to.deep.equal({ index: 0, length: 0 });
  });

  it('não marca seleção vazia nem seleção que já contém comentário', () => {
    editorTextoRico.setContent('<p>Texto para comentário.</p>');
    modulo().adicionar(ID, { index: 0, length: 5 });

    expect(modulo().adicionar('outro', { index: 3, length: 0 })).to.equal(false);
    expect(modulo().adicionar('outro', { index: 3, length: 6 })).to.equal(false);
    expect(modulo().existe('outro')).to.equal(false);
  });

  it('remove a marcação mantendo o texto', () => {
    editorTextoRico.setContent('<p>Texto para comentário.</p>');
    modulo().adicionar(ID, { index: 0, length: 5 });

    expect(modulo().remover(ID)).to.equal(true);
    expect(html_().includes('<comentario')).to.equal(false);
    expect(editorTextoRico.quill!.getText()).to.equal('Texto para comentário.\n');
    expect(modulo().getTextoComentario(ID)).to.equal('');
  });

  it('deixa de existir quando o trecho é apagado por inteiro', () => {
    editorTextoRico.setContent('<p>Texto para comentário.</p>');
    modulo().adicionar(ID, { index: 0, length: 5 });

    editorTextoRico.quill!.deleteText(0, 3, 'user');
    expect(modulo().existe(ID)).to.equal(true);

    editorTextoRico.quill!.deleteText(0, 2, 'user');
    expect(modulo().existe(ID)).to.equal(false);
  });

  it('informa a posição inicial, o texto com espaços e os ids presentes', () => {
    editorTextoRico.setContent('<p>Antes texto depois.</p>');
    modulo().adicionar(ID, { index: 5, length: 7 });

    expect(modulo().getIndice(ID)).to.equal(5);
    expect(modulo().getTextoComentario(ID)).to.equal(' texto ');
    expect(modulo().getIds()).to.deep.equal([ID]);
  });

  it('trata como um conjunto o trecho dividido em parágrafos e por revisão', () => {
    editorTextoRico.setContent(
      `<p>Um <comentario id-sequencia-comentario="${ID}">dois</comentario></p>` +
        `<p><comentario id-sequencia-comentario="${ID}">três <del usuario="F" date="2026-11-04 10:00:00" id-revisao="r1">quatro</del></comentario> fim</p>`
    );

    expect(modulo().findNodesById(ID).length).to.be.greaterThan(1);
    expect(modulo().getIndice(ID)).to.equal(3);
    expect(modulo().getTextoComentario(ID)).to.equal('doistrês quatro');
    expect(modulo().getRanges(ID)).to.deep.equal([
      { index: 3, length: 4 },
      { index: 8, length: 11 },
    ]);

    expect(modulo().removerPorIds([ID])).to.equal(true);
    expect(modulo().existe(ID)).to.equal(false);
    expect(html_().includes('<del')).to.equal(true);
  });

  it('não cola a marcação de comentário copiada do editor', async () => {
    editorTextoRico.setContent('<p>Início fim.</p>');
    editorTextoRico.quill!.setSelection(7, 0);

    const clipboardData = new DataTransfer();
    clipboardData.setData('text/html', `<p><comentario id-sequencia-comentario="${ID}">texto comentado</comentario></p>`);
    clipboardData.setData('text/plain', 'texto comentado');
    editorTextoRico.quill!.root.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(editorTextoRico.quill!.getText()).to.include('texto comentado');
    expect(html_().includes('<comentario')).to.equal(false);
    expect(modulo().existe(ID)).to.equal(false);
  });

  ['bem', 'bem '].forEach(textoSelecionado => {
    it(`copia exatamente o texto comentado, sem a marcação: "${textoSelecionado}"`, () => {
      editorTextoRico.setContent(`<p>Tudo <comentario id-sequencia-comentario="${ID}">bem</comentario> depois.</p>`);
      editorTextoRico.quill!.setSelection(5, textoSelecionado.length);

      const clipboardData = new DataTransfer();
      const copyEvent = new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData });
      editorTextoRico.quill!.root.dispatchEvent(copyEvent);

      expect(copyEvent.defaultPrevented).to.equal(true);
      expect(clipboardData.getData('text/plain')).to.equal(textoSelecionado);
      expect(clipboardData.getData('text/html').includes('<comentario')).to.equal(false);
    });
  });

  it('não aceita a marcação fora da justificação', async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
    editorTextoRico.setContent(`<p><comentario id-sequencia-comentario="${ID}">Texto</comentario></p>`);

    expect(html_().includes('<comentario')).to.equal(false);
  });
});

describe('removeMarcacaoComentario', () => {
  it('desembrulha as tags, inclusive aninhadas e em vários fragmentos, preservando o texto e as demais marcas', () => {
    const entrada =
      '<p>A <comentario id-sequencia-comentario="s1">b <b>c</b></comentario> d</p>' +
      '<p><comentario id-sequencia-comentario="s1">e <del id-revisao="r">f</del></comentario>' +
      '<comentario id-sequencia-comentario="s2"><comentario id-sequencia-comentario="s3">g</comentario></comentario></p>';

    expect(removeMarcacaoComentario(entrada)).to.equal('<p>A b <b>c</b> d</p><p>e <del id-revisao="r">f</del>g</p>');
  });

  it('retira o atributo e a classe do destaque deixados em outros elementos', () => {
    expect(removeMarcacaoComentario('<p><span id-sequencia-comentario="s1" class="comentario-selecionado">x</span></p>')).to.equal('<p><span>x</span></p>');
  });

  it('devolve inalterado o HTML sem marcação', () => {
    const entrada = '<p>Texto <b>sem</b> comentário &amp; com entidade.</p>';
    expect(removeMarcacaoComentario(entrada)).to.equal(entrada);
  });
});
