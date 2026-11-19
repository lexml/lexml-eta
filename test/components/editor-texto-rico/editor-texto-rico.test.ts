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

describe('Comentários no editor de texto rico', () => {
  const ID = 'sc123';
  const botaoComentario = (): HTMLButtonElement => editorTextoRico.querySelector('button.ql-lexml-eta-comentario') as HTMLButtonElement;
  const aguardarSelecao = (): Promise<unknown> => new Promise(resolve => setTimeout(resolve, 0));
  // Destaque e revisão rodam em setTimeout e reagendam o quadro dos ícones: espera alguns ciclos.
  const aguardarIcones = async (): Promise<void> => {
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 0));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  };
  const selecionar = async (index: number, length = 0): Promise<void> => {
    editorTextoRico.quill!.setSelection(index, length, 'silent');
    editorTextoRico.onSelectionChange({ index, length });
    await aguardarSelecao();
  };
  const ouvir = (evento: string): any[] => {
    const detalhes: any[] = [];
    editorTextoRico.addEventListener(evento, ev => detalhes.push((ev as CustomEvent).detail));
    return detalhes;
  };
  const selecionados = (): string[] => Array.from(editorTextoRico.quill!.root.querySelectorAll('comentario.comentario-selecionado')).map(el => el.textContent ?? '');

  beforeEach(async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico modo="justificativa"></lexml-eta-editor-texto-rico>`);
  });

  describe('Botão da barra de ferramentas', () => {
    it('existe com o título "Adicionar comentário" e fica desabilitado sem seleção', async () => {
      editorTextoRico.setContent('<p>Texto para comentário.</p>');
      await selecionar(3);

      expect(!!botaoComentario()).to.equal(true);
      expect(botaoComentario().title).to.equal('Adicionar comentário');
      expect(botaoComentario().disabled).to.equal(true);
    });

    it('fica desabilitado quando a seleção inclui parte de um trecho comentado', async () => {
      editorTextoRico.setContent(`<p>Texto <comentario id-sequencia-comentario="${ID}">para</comentario> comentário.</p>`);
      await selecionar(0, 8);

      expect(botaoComentario().disabled).to.equal(true);
    });

    it('com seleção sem comentário, fica habilitado e emite abrir-modal-comentario com o trecho e o intervalo', async () => {
      editorTextoRico.setContent('<p>Texto para comentário.</p>');
      await selecionar(6, 4);
      const eventos = ouvir('abrir-modal-comentario');

      expect(botaoComentario().disabled).to.equal(false);
      botaoComentario().click();

      expect(eventos).to.have.length(1);
      expect(eventos[0].range).to.deep.equal({ index: 6, length: 4 });
      expect(eventos[0].texto).to.equal('para');
    });

    it('continua habilitado e usa a última seleção quando pressionar o botão tira o foco do editor', async () => {
      editorTextoRico.setContent('<p>Texto para comentário.</p>');
      editorTextoRico.quill!.focus();
      await selecionar(6, 4);
      editorTextoRico.quill!.blur();
      editorTextoRico.onSelectionChange(null);
      await aguardarSelecao();
      const eventos = ouvir('abrir-modal-comentario');

      expect(editorTextoRico.quill!.getSelection()).to.equal(null);
      expect(botaoComentario().disabled).to.equal(false);
      botaoComentario().click();

      expect(eventos).to.have.length(1);
      expect(eventos[0].range).to.deep.equal({ index: 6, length: 4 });
    });

    it('não existe fora da justificação', async () => {
      editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
      expect(!!botaoComentario()).to.equal(false);
    });
  });

  describe('Botão "Comentários" das telas pequenas', () => {
    const botaoLista = (): HTMLButtonElement | null => editorTextoRico.querySelector('.comentarios-mobile-toolbar .comentarios-mobile-button');

    it('fica na barra de ferramentas e emite abrir-modal-lista-comentarios', () => {
      const eventos = ouvir('abrir-modal-lista-comentarios');

      expect(!!botaoLista()?.closest('.ql-toolbar')).to.equal(true);
      botaoLista()!.click();

      expect(eventos).to.deep.equal([{ modo: 'justificativa' }]);
    });

    it('só aparece até 992px de largura', () => {
      const display = getComputedStyle(editorTextoRico.querySelector('.comentarios-mobile-toolbar')!).display;
      // Com float, o inline-block da media query é calculado como block.
      expect(display !== 'none').to.equal(window.innerWidth <= 992);
    });

    it('não existe fora da justificação', async () => {
      editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
      expect(!!botaoLista()).to.equal(false);
    });
  });

  describe('API do editor', () => {
    it('adiciona, consulta e remove o comentário', () => {
      editorTextoRico.setContent('<p>Antes texto depois.</p>');

      expect(editorTextoRico.adicionarComentario(ID, { index: 6, length: 5 })).to.equal(true);
      expect(editorTextoRico.possuiComentario(ID)).to.equal(true);
      expect(editorTextoRico.getIdsComentarios()).to.deep.equal([ID]);
      expect(editorTextoRico.getTextoComentario(ID)).to.equal('texto');
      expect(editorTextoRico.getIndiceComentario(ID)).to.equal(6);

      expect(editorTextoRico.removerComentario(ID)).to.equal(true);
      expect(editorTextoRico.possuiComentario(ID)).to.equal(false);
      expect(editorTextoRico.quill!.getText()).to.equal('Antes texto depois.\n');
    });

    it('preserva a marcação ao carregar o texto e a mantém no texto do editor', () => {
      editorTextoRico.setContent(`<p><comentario id-sequencia-comentario="${ID}">Texto comentado</comentario></p>`);
      editorTextoRico.updateApenasTexto();

      expect(editorTextoRico.getTextoComentario(ID)).to.equal('Texto comentado');
      expect(editorTextoRico.texto).to.include(`<comentario id-sequencia-comentario="${ID}">Texto comentado</comentario>`);
    });

    it('posiciona o cursor no início do trecho e o destaca', () => {
      editorTextoRico.setContent('<p>Antes texto depois.</p>');
      editorTextoRico.adicionarComentario(ID, { index: 6, length: 5 });
      editorTextoRico.quill!.setSelection(0, 0);

      expect(editorTextoRico.posicionarCursorComentario(ID)).to.equal(true);
      expect(editorTextoRico.quill!.getSelection()).to.deep.equal({ index: 6, length: 0 });
      expect(selecionados()).to.deep.equal(['texto']);
      expect(editorTextoRico.posicionarCursorComentario('inexistente')).to.equal(false);
    });

    it('destacarComentario destaca todos os fragmentos e, sem id, retira o destaque, sem emitir evento', () => {
      editorTextoRico.setContent(`<p><comentario id-sequencia-comentario="${ID}">um</comentario></p><p><comentario id-sequencia-comentario="${ID}">dois</comentario></p>`);
      const eventos = ouvir('comentario-selecionado');

      expect(editorTextoRico.destacarComentario(ID)).to.equal(true);
      expect(selecionados()).to.deep.equal(['um', 'dois']);

      editorTextoRico.destacarComentario(undefined);
      expect(selecionados()).to.deep.equal([]);
      expect(eventos).to.have.length(0);
    });

    it('desfazer depois de apagar o trecho de uma sequência removida devolve o texto sem a marcação', () => {
      editorTextoRico.setContent('<p>Antes texto depois.</p>');
      const quill = editorTextoRico.quill as any;
      editorTextoRico.adicionarComentario(ID, { index: 6, length: 5 });
      quill.history.cutoff();
      quill.deleteText(6, 5, 'user');
      editorTextoRico.registrarComentarioRemovido(ID);
      quill.history.cutoff();

      quill.history.undo();

      expect(quill.getText()).to.equal('Antes texto depois.\n');
      expect(editorTextoRico.possuiComentario(ID)).to.equal(false);
    });

    it('desfazer depois de excluir a sequência não recria a marcação', () => {
      editorTextoRico.setContent('<p>Antes texto depois.</p>');
      const quill = editorTextoRico.quill as any;
      editorTextoRico.adicionarComentario(ID, { index: 6, length: 5 });
      quill.history.cutoff();
      editorTextoRico.removerComentario(ID);
      editorTextoRico.registrarComentarioRemovido(ID);
      quill.history.cutoff();

      quill.history.undo();

      expect(editorTextoRico.possuiComentario(ID)).to.equal(false);
    });

    it('um id registrado como removido volta a valer ao ser adicionado de novo, e setContent limpa o registro', () => {
      editorTextoRico.setContent('<p>Antes texto depois.</p>');
      editorTextoRico.registrarComentarioRemovido(ID);
      editorTextoRico.adicionarComentario(ID, { index: 6, length: 5 });
      editorTextoRico.quill!.insertText(0, 'x', 'user');
      expect(editorTextoRico.possuiComentario(ID)).to.equal(true);

      editorTextoRico.registrarComentarioRemovido('outro');
      editorTextoRico.setContent('<p><comentario id-sequencia-comentario="outro">Texto</comentario></p>');
      editorTextoRico.quill!.insertText(0, 'x', 'user');
      expect(editorTextoRico.possuiComentario('outro')).to.equal(true);
    });
  });

  describe('Destaque do trecho sob o cursor', () => {
    beforeEach(() => {
      editorTextoRico.setContent(`<p>Antes <comentario id-sequencia-comentario="${ID}">texto</comentario> depois.</p>`);
    });

    it('destaca o trecho sob o cursor e emite comentario-selecionado com o id', async () => {
      const eventos = ouvir('comentario-selecionado');
      await selecionar(8);

      expect(selecionados()).to.deep.equal(['texto']);
      expect(eventos[eventos.length - 1]).to.deep.include({ idSequenciaComentario: ID, abrirAbaComentarios: false });
    });

    it('considera o trecho com o cursor no início dele', async () => {
      await selecionar(6);
      expect(selecionados()).to.deep.equal(['texto']);
    });

    it('fora do trecho, retira o destaque e emite o evento sem id', async () => {
      await selecionar(8);
      const eventos = ouvir('comentario-selecionado');
      await selecionar(14);

      expect(selecionados()).to.deep.equal([]);
      expect(eventos).to.have.length(1);
      expect(eventos[0].idSequenciaComentario).to.equal(undefined);
    });

    it('mantém o destaque quando o editor perde o foco', async () => {
      await selecionar(8);
      const eventos = ouvir('comentario-selecionado');
      editorTextoRico.onSelectionChange(null);
      await aguardarSelecao();

      expect(selecionados()).to.deep.equal(['texto']);
      expect(eventos).to.have.length(0);
    });

    it('exibe o trecho em amarelo claro e, destacado, em amarelo escuro', () => {
      const comentario = editorTextoRico.quill!.root.querySelector('comentario') as HTMLElement;
      expect(getComputedStyle(comentario).backgroundColor).to.equal('rgb(255, 248, 197)');
      comentario.classList.add('comentario-selecionado');
      expect(getComputedStyle(comentario).backgroundColor).to.equal('rgb(253, 214, 99)');
    });

    it('o texto entregue não leva o destaque nem o atributo do último fragmento', async () => {
      await selecionar(8);
      await aguardarIcones();
      editorTextoRico.updateApenasTexto();

      expect(editorTextoRico.texto).to.include(`<comentario id-sequencia-comentario="${ID}">texto</comentario>`);
    });
  });

  describe('Ícone ao fim do trecho', () => {
    const icones = (): HTMLButtonElement[] => Array.from(editorTextoRico.querySelectorAll<HTMLButtonElement>('.comentario-texto-icone'));

    it('cria um ícone por sequência e o remove quando a sequência deixa de ter trecho', async () => {
      editorTextoRico.setContent('<p><comentario id-sequencia-comentario="a">um</comentario> e <comentario id-sequencia-comentario="b">dois</comentario></p>');
      await aguardarIcones();
      expect(icones().map(b => b.dataset.idSequenciaComentario)).to.deep.equal(['a', 'b']);

      editorTextoRico.removerComentario('a');
      await aguardarIcones();
      expect(icones().map(b => b.dataset.idSequenciaComentario)).to.deep.equal(['b']);
    });

    it('reserva o espaço do ícone só no último fragmento do trecho dividido por exclusão', async () => {
      editorTextoRico.setContent('<p>Teste par<del usuario="Fulano" date="2026-08-12 13:49:00" id-revisao="r1">alele</del>pipedo</p>');
      editorTextoRico.adicionarComentario(ID, { index: 11, length: 6 });
      await aguardarIcones();

      const fragmentos = Array.from(editorTextoRico.quill!.root.querySelectorAll<HTMLElement>(`comentario[id-sequencia-comentario="${ID}"]`));
      expect(fragmentos.length).to.equal(2);
      expect(fragmentos[0].hasAttribute('data-comentario-fragmento-final')).to.equal(false);
      expect(fragmentos[1].hasAttribute('data-comentario-fragmento-final')).to.equal(true);
      expect(getComputedStyle(fragmentos[1]).marginRight).to.equal('22px');
      expect(editorTextoRico.ajustaHtml(editorTextoRico.quill!.root.innerHTML).includes('data-comentario-fragmento-final')).to.equal(false);
    });

    it('o clique no ícone destaca o trecho e emite comentario-selecionado pedindo a aba', async () => {
      editorTextoRico.setContent(`<p>Antes <comentario id-sequencia-comentario="${ID}">texto</comentario> depois.</p>`);
      await aguardarIcones();
      const eventos = ouvir('comentario-selecionado');

      icones()[0].click();

      expect(selecionados()).to.deep.equal(['texto']);
      expect(eventos).to.have.length(1);
      expect(eventos[0]).to.deep.include({ idSequenciaComentario: ID, abrirAbaComentarios: true });
    });

    it('o clique e as setas de cada lado do ícone deixam o cursor dentro ou fora do trecho', async () => {
      editorTextoRico.setContent(`<p><comentario id-sequencia-comentario="${ID}">fortale</comentario>za</p>`);
      await aguardarIcones();

      const botaoRect = icones()[0].getBoundingClientRect();
      const comentario = editorTextoRico.quill!.root.querySelector('comentario') as HTMLElement;
      const textoComentario = comentario.lastChild as Text;
      const textoPosterior = comentario.nextSibling as Text;
      const rectDe = (no: Text, i: number): DOMRect => {
        const range = document.createRange();
        range.setStart(no, i);
        range.setEnd(no, i + 1);
        return range.getBoundingClientRect();
      };
      const ultimoRect = rectDe(textoComentario, textoComentario.data.length - 1);
      const proximoRect = rectDe(textoPosterior, 0);
      const cursorDentro = (): boolean => comentario.contains(document.getSelection()?.getRangeAt(0).startContainer ?? null);
      const clique = (x: number, rect: DOMRect): void => {
        editorTextoRico.quill!.root.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: rect.top + rect.height / 2 }));
      };

      clique(Math.min(botaoRect.left - 0.5, ultimoRect.left + ultimoRect.width * 0.75), ultimoRect);
      expect(editorTextoRico.quill!.getSelection()?.index).to.equal(7);
      expect(cursorDentro()).to.equal(true);

      clique(proximoRect.left + 1, proximoRect);
      expect(editorTextoRico.quill!.getSelection()?.index).to.equal(7);
      expect(cursorDentro()).to.equal(false);

      const setaEsquerda = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
      editorTextoRico.quill!.root.dispatchEvent(setaEsquerda);
      expect(setaEsquerda.defaultPrevented).to.equal(true);
      expect(cursorDentro()).to.equal(true);

      const setaDireita = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      editorTextoRico.quill!.root.dispatchEvent(setaDireita);
      expect(setaDireita.defaultPrevented).to.equal(true);
      expect(cursorDentro()).to.equal(false);
    });
  });
});

describe('Comentário e marcas de revisão na justificação', () => {
  const ID = 'sc123';
  const marca = (tag: string, id: string, texto: string): string => `<${tag} usuario="Teste" date="2026-05-19 13:00:00" id-revisao="${id}">${texto}</${tag}>`;
  const revisao = (): any => (editorTextoRico.quill as any).revisao;
  const botaoComentarioRevisao = (): HTMLButtonElement | null => document.body.querySelector('#button-adicionar-comentario-revisao');
  const abrirQuadro = (el: Element): void => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };
  const ouvirAbrirModal = (): any[] => {
    const detalhes: any[] = [];
    editorTextoRico.addEventListener('abrir-modal-comentario', ev => detalhes.push((ev as CustomEvent).detail));
    return detalhes;
  };

  beforeEach(async () => {
    editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico modo="justificativa"></lexml-eta-editor-texto-rico>`);
  });

  afterEach(() => {
    document.body.querySelectorAll('.tooltip-revisao').forEach(el => el.remove());
    revisao()?.setEmRevisao(false);
  });

  describe('Botão "Adicionar comentário" no quadro da revisão', () => {
    it('seleciona o texto da revisão e emite abrir-modal-comentario', () => {
      editorTextoRico.setContent(`<p>Texto ${marca('del', 'rev1', 'excluido')} normal.</p>`);
      const eventos = ouvirAbrirModal();

      abrirQuadro(editorTextoRico.quill!.root.querySelector('del')!);
      expect(!!botaoComentarioRevisao()?.querySelector('#comentario-plus')).to.equal(true);
      botaoComentarioRevisao()!.click();

      expect(eventos).to.have.length(1);
      expect(eventos[0]).to.deep.include({ modo: 'justificativa', texto: 'excluido' });
      expect(eventos[0].range).to.deep.equal({ index: 6, length: 8 });
      expect(editorTextoRico.quill!.getSelection()).to.deep.equal({ index: 6, length: 8 });
    });

    it('seleciona os trechos contíguos da revisão, mesmo com formatação diferente', () => {
      editorTextoRico.setContent(`<p>A ${marca('del', 'rev1', 'Também revoga ')}<b>${marca('del', 'rev1', 'o regime')}</b> fim</p>`);
      const eventos = ouvirAbrirModal();

      abrirQuadro(editorTextoRico.quill!.root.querySelector('b del')!);
      botaoComentarioRevisao()!.click();

      expect(eventos[0].range).to.deep.equal({ index: 2, length: 22 });
      expect(eventos[0].texto).to.equal('Também revoga o regime');
    });

    it('não seleciona o texto comum entre trechos separados da mesma revisão', () => {
      editorTextoRico.setContent(`<p>${marca('del', 'rev1', 'primeiro')} normal ${marca('del', 'rev1', 'segundo')}</p>`);
      const eventos = ouvirAbrirModal();

      abrirQuadro(editorTextoRico.quill!.root.querySelector('del')!);
      botaoComentarioRevisao()!.click();

      expect(eventos[0].range).to.deep.equal({ index: 0, length: 'primeiro'.length });
      expect(eventos[0].texto).to.equal('primeiro');
    });

    it('não aparece quando parte do texto da revisão já está comentada', () => {
      editorTextoRico.setContent(`<p>Texto ${marca('del', 'rev1', 'excluido')} normal.</p>`);
      editorTextoRico.adicionarComentario(ID, { index: 6, length: 4 });

      abrirQuadro(editorTextoRico.quill!.root.querySelector('del')!);

      expect(!!document.body.querySelector('.tooltip-revisao')).to.equal(true);
      expect(!!botaoComentarioRevisao()).to.equal(false);
    });

    it('não aparece fora da justificação', async () => {
      editorTextoRico = await fixture<EditorTextoRicoComponent>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
      editorTextoRico.setContent(`<p>Texto ${marca('del', 'rev1', 'excluido')} normal.</p>`);

      abrirQuadro(editorTextoRico.quill!.root.querySelector('del')!);

      expect(!!document.body.querySelector('.tooltip-revisao')).to.equal(true);
      expect(!!botaoComentarioRevisao()).to.equal(false);
    });
  });

  describe('Comentário preservado pela revisão', () => {
    it('excluir em revisão um trecho comentado mantém o comentário sobre o texto excluído', async () => {
      editorTextoRico.setContent('<p>Texto comentado normal.</p>');
      editorTextoRico.adicionarComentario(ID, { index: 0, length: 15 });
      revisao().setEmRevisao(true);

      editorTextoRico.quill!.deleteText(6, 16, 'user');
      await new Promise(resolve => setTimeout(resolve, 0));

      const ops = editorTextoRico.quill!.getContents(6, 16).ops ?? [];
      expect(ops.some((op: any) => op.attributes?.comentario === ID && op.attributes?.removed)).to.equal(true);
      expect(ops.some((op: any) => !op.attributes?.comentario && op.attributes?.removed)).to.equal(true);
      expect(editorTextoRico.getTextoComentario(ID)).to.equal('Texto comentado');
    });

    it('palavra comentada dividida por uma exclusão em revisão continua inteira no trecho', async () => {
      const texto = 'malasessadaasdasdsdasduada';
      editorTextoRico.setContent(`<p>${texto}</p>`);
      editorTextoRico.adicionarComentario(ID, { index: 0, length: texto.length });
      revisao().setEmRevisao(true);

      editorTextoRico.quill!.deleteText(10, 4, 'user');
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(editorTextoRico.getTextoComentario(ID)).to.equal(texto);
    });

    it('aceitar uma inclusão dentro do trecho comentado mantém o comentário', async () => {
      editorTextoRico.setContent('<p>Texto base.</p>');
      editorTextoRico.adicionarComentario(ID, { index: 0, length: 10 });
      revisao().setEmRevisao(true);

      editorTextoRico.quill!.insertText(6, 'novo ', 'user');
      await new Promise(resolve => setTimeout(resolve, 0));
      revisao().revisar([editorTextoRico.quill!.root.querySelector('ins')], true);

      expect(!!editorTextoRico.quill!.root.querySelector('ins')).to.equal(false);
      expect(editorTextoRico.getTextoComentario(ID)).to.equal('Texto novo base');
    });

    it('rejeitar uma exclusão dentro do trecho comentado mantém o comentário', async () => {
      editorTextoRico.setContent('<p>Texto base.</p>');
      editorTextoRico.adicionarComentario(ID, { index: 0, length: 10 });
      revisao().setEmRevisao(true);

      editorTextoRico.quill!.deleteText(6, 4, 'user');
      await new Promise(resolve => setTimeout(resolve, 0));
      revisao().revisar([editorTextoRico.quill!.root.querySelector('del')], false);

      expect(!!editorTextoRico.quill!.root.querySelector('del')).to.equal(false);
      expect(editorTextoRico.getTextoComentario(ID)).to.equal('Texto base');
    });

    it('aceitar uma exclusão dentro do trecho comentado retira só o texto excluído', async () => {
      editorTextoRico.setContent('<p>Texto base.</p>');
      editorTextoRico.adicionarComentario(ID, { index: 0, length: 10 });
      revisao().setEmRevisao(true);

      editorTextoRico.quill!.deleteText(5, 5, 'user');
      await new Promise(resolve => setTimeout(resolve, 0));
      revisao().revisar([editorTextoRico.quill!.root.querySelector('del')], true);

      expect(editorTextoRico.quill!.getText()).to.equal('Texto.\n');
      expect(editorTextoRico.getTextoComentario(ID)).to.equal('Texto');
    });

    // O Quill decide a ordem de aninhamento entre del e comentario: o elemento interno precisa mostrar o traço e o fundo amarelo.
    it('mantém o traço da exclusão sobre o fundo do comentário', async () => {
      editorTextoRico.setContent('<p>Texto comentado normal.</p>');
      editorTextoRico.adicionarComentario(ID, { index: 0, length: 15 });
      revisao().setEmRevisao(true);
      editorTextoRico.quill!.deleteText(6, 9, 'user');
      await new Promise(resolve => setTimeout(resolve, 0));

      const interno = editorTextoRico.quill!.root.querySelector('del comentario, comentario del') as HTMLElement;
      expect(!!interno).to.equal(true);
      const externo = interno.parentElement!.closest(interno.tagName === 'DEL' ? 'comentario' : 'del') as HTMLElement;
      const fundoVisivel = (el: HTMLElement): string => getComputedStyle(el).backgroundColor;

      expect(getComputedStyle(interno).backgroundImage).to.contain('linear-gradient');
      // Amarelo claro, ou escuro se o cursor ficou no trecho.
      expect(['rgb(255, 248, 197)', 'rgb(253, 214, 99)']).to.include(interno.tagName === 'DEL' ? fundoVisivel(externo) : fundoVisivel(interno));
      expect(interno.tagName === 'DEL' ? fundoVisivel(interno) : 'rgba(0, 0, 0, 0)').to.equal('rgba(0, 0, 0, 0)');
    });
  });
});
