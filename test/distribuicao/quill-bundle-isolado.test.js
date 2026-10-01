import { expect } from '@open-wc/testing';
import 'quill/dist/quill';

describe('Bundle de distribuição com Quill privado', () => {
  it('não altera a referência nem o registry do Quill da aplicação', async () => {
    class ModuloDaAplicacao {}
    const quillDaAplicacao = window.Quill;
    quillDaAplicacao.register('modules/modulo-da-aplicacao-bundle', ModuloDaAplicacao, true);
    const registryDaAplicacao = quillDaAplicacao.imports;
    const modulosAntes = Object.keys(registryDaAplicacao);

    await import('../../dist/index.js');

    expect(window.Quill).to.equal(quillDaAplicacao);
    expect(quillDaAplicacao.imports).to.equal(registryDaAplicacao);
    expect(quillDaAplicacao.import('modules/modulo-da-aplicacao-bundle')).to.equal(ModuloDaAplicacao);
    expect(Object.keys(registryDaAplicacao)).to.deep.equal(modulosAntes);
    expect(registryDaAplicacao['modules/aspasCurvas']).to.be.undefined;
    expect(registryDaAplicacao['modules/revisao']).to.be.undefined;
    expect(registryDaAplicacao['modules/notaRodape']).to.be.undefined;
  });
});
