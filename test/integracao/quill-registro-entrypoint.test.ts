import { expect } from '@open-wc/testing';
import 'quill/dist/quill';
import PrivateQuill from '../../src/internal/quill/private-quill';
import { QuillRuntime } from '../../src/internal/quill/quill-types';

const Quill = (window as unknown as { Quill: typeof QuillRuntime }).Quill;

describe('Registro do Quill no entrypoint', () => {
  it('importar a implementação de um módulo não provoca seu registro', async () => {
    expect((PrivateQuill as any).imports['modules/revisao']).to.be.undefined;
    await import('../../src/components/editor-texto-rico/moduloRevisao');
    expect((PrivateQuill as any).imports['modules/revisao']).to.be.undefined;
  });

  it('o entrypoint registra os módulos apenas no Quill privado', async () => {
    const registryDaAplicacao = (Quill as any).imports;
    const modulosDaAplicacaoAntes = Object.keys(registryDaAplicacao);
    const { ModuloRevisao } = await import('../../src/components/editor-texto-rico/moduloRevisao');
    const { ModuloAspasCurvas } = await import('../../src/components/editor-texto-rico/moduloAspasCurvas');
    const { ModuloNotaRodape } = await import('../../src/components/editor-texto-rico/moduloNotaRodape');

    await import('../../src/index');
    expect(PrivateQuill.import('modules/aspasCurvas')).to.equal(ModuloAspasCurvas);
    expect(PrivateQuill.import('modules/revisao')).to.equal(ModuloRevisao);
    expect(PrivateQuill.import('modules/notaRodape')).to.equal(ModuloNotaRodape);
    expect(Object.keys(registryDaAplicacao)).to.deep.equal(modulosDaAplicacaoAntes);
  });
});
