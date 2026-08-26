import { expect, fixture, html } from '@open-wc/testing';
import 'quill/dist/quill';
import PrivateQuill from '../../src/internal/quill/private-quill';
import { QuillRuntime } from '../../src/internal/quill/quill-types';

const Quill = (window as unknown as { Quill: typeof QuillRuntime }).Quill;

describe('Isolamento do registry do Quill em desenvolvimento e testes', () => {
  it('a aplicação e a biblioteca usam registries distintos', async () => {
    class ModuloDaAplicacao {}
    Quill.register('modules/modulo-da-aplicacao-caracterizacao', ModuloDaAplicacao, true);
    const registryDaAplicacao = (Quill as any).imports;
    const modulosDaAplicacaoAntes = Object.keys(registryDaAplicacao);

    await import('../../src/index');
    expect(PrivateQuill).to.not.equal(Quill);
    expect((PrivateQuill as any).imports).to.not.equal(registryDaAplicacao);
    expect(Quill.import('modules/modulo-da-aplicacao-caracterizacao')).to.equal(ModuloDaAplicacao);
    expect(Object.keys(registryDaAplicacao)).to.deep.equal(modulosDaAplicacaoAntes);
    expect((Quill as any).imports['modules/revisao']).to.be.undefined;
    expect(PrivateQuill.import('modules/revisao')).to.exist;
  });

  it('a inicialização não sobrescreve o keyboard registrado pela aplicação', async () => {
    class KeyboardDaAplicacao {}
    const keyboardOriginal = Quill.import('modules/keyboard');
    try {
      Quill.register('modules/keyboard', KeyboardDaAplicacao, true);
      await import('../../src/index');
      const editor = await fixture<any>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
      expect(editor.quill.constructor).to.equal(PrivateQuill);
      expect(Quill.import('modules/keyboard')).to.equal(KeyboardDaAplicacao);
      expect(PrivateQuill.import('modules/keyboard')).to.not.equal(KeyboardDaAplicacao);
    } finally {
      Quill.register('modules/keyboard', keyboardOriginal, true);
    }
  });

  it('permite criar, editar, destruir e recriar o editor rico', async () => {
    await import('../../src/index');
    const primeiro = await fixture<any>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
    primeiro.quill.setText('Primeiro editor');
    expect(primeiro.quill.getText()).to.equal('Primeiro editor\n');
    primeiro.remove();

    const segundo = await fixture<any>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
    try {
      segundo.quill.setText('Editor recriado');
      expect(segundo.quill.getText()).to.equal('Editor recriado\n');
    } finally {
      segundo.remove();
    }
  });

  it('mantém o editor da aplicação e o editor rico da biblioteca funcionais simultaneamente', async () => {
    await import('../../src/index');
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      const editorDaAplicacao = new Quill(container, {});
      const editorDaBiblioteca = await fixture<any>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
      editorDaAplicacao.setText('Texto da aplicação');
      editorDaBiblioteca.quill.setText('Texto da biblioteca');
      expect(editorDaAplicacao.getText()).to.equal('Texto da aplicação\n');
      expect(editorDaBiblioteca.quill.getText()).to.equal('Texto da biblioteca\n');
      expect((Quill as any).imports['modules/table']).to.be.undefined;
      editorDaBiblioteca.remove();
    } finally {
      container.remove();
    }
  });
});
