import { expect, fixture, html } from '@open-wc/testing';
import 'quill/dist/quill';
import PrivateQuill from '../../src/internal/quill/private-quill';
import { QuillRuntime } from '../../src/internal/quill/quill-types';
import { EtaQuill } from '../../src/util/eta-quill/eta-quill';

const AppQuill = (window as unknown as { Quill: typeof QuillRuntime }).Quill;

const snapshotImports = () => new Map(Object.entries((AppQuill as any).imports));

describe('Isolamento definitivo do Quill', () => {
  before(async () => {
    await import('../../src/index');
  });

  it('isola a biblioteca do Quill da aplicação, inclusive para nomes conflitantes', () => {
    class ModuloDaAplicacao {}
    const Parchment = AppQuill.import('parchment');
    const formatoDaAplicacao = new Parchment.Attributor.Class('estiloTextoAplicacao', 'estilo-texto-aplicacao', { scope: Parchment.Scope.INLINE });
    const importsAntes = snapshotImports();
    AppQuill.register('modules/revisao', ModuloDaAplicacao, true);
    AppQuill.register('formats/estilo-texto', formatoDaAplicacao, true);
    try {
      expect(PrivateQuill.import('modules/revisao')).to.not.equal(ModuloDaAplicacao);
      expect(PrivateQuill.import('formats/estilo-texto')).to.not.equal(formatoDaAplicacao);
      expect(AppQuill.import('modules/revisao')).to.equal(ModuloDaAplicacao);
    } finally {
      Object.assign((AppQuill as any).imports, Object.fromEntries(importsAntes));
      Object.keys((AppQuill as any).imports)
        .filter(path => !importsAntes.has(path))
        .forEach(path => delete (AppQuill as any).imports[path]);
    }
  });

  it('não depende de uma versão declarada pela aplicação', () => {
    class ModuloDaAplicacao {}
    class AppQuillOutraVersao extends AppQuill {}
    (AppQuillOutraVersao as any).imports = { ...(AppQuill as any).imports };
    (AppQuillOutraVersao as any).version = '2.0.3-test-runtime';
    AppQuillOutraVersao.register('modules/revisao', ModuloDaAplicacao, true);

    expect((AppQuillOutraVersao as any).version).to.equal('2.0.3-test-runtime');
    expect(AppQuillOutraVersao.import('modules/revisao')).to.equal(ModuloDaAplicacao);
    expect(PrivateQuill.import('modules/revisao')).to.not.equal(ModuloDaAplicacao);
  });

  it('mantém editor estruturado e editor rico simultâneos', async () => {
    const estruturadoHtml = document.createElement('div');
    const bufferHtml = document.createElement('div');
    document.body.append(estruturadoHtml, bufferHtml);
    const rico = await fixture<any>(html`<lexml-eta-editor-texto-rico></lexml-eta-editor-texto-rico>`);
    try {
      const estruturado = new EtaQuill(estruturadoHtml, bufferHtml, {});
      estruturado.setText('Estruturado');
      rico.quill.setText('Rico');
      expect(estruturado.getText()).to.equal('Estruturado\n');
      expect(rico.quill.getText()).to.equal('Rico\n');
    } finally {
      estruturadoHtml.remove();
      bufferHtml.remove();
      rico.remove();
    }
  });
});
