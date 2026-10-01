import { expect } from '@open-wc/testing';
import 'quill/dist/quill';
import { configurePrivateQuill } from '../../src/internal/quill/configure-private-quill';
import PrivateQuill, { PrivateDefaultClipboardModule, PrivateDefaultKeyboardModule } from '../../src/internal/quill/private-quill';
import { QuillRuntime } from '../../src/internal/quill/quill-types';
import { EtaBlot } from '../../src/util/eta-quill/eta-blot';
import { EtaBlotConteudoOmissis } from '../../src/util/eta-quill/eta-blot-conteudo-omissis';
import { EtaContainer } from '../../src/util/eta-quill/eta-container';
import { EtaClipboard } from '../../src/util/eta-quill/eta-clipboard';
import { EtaKeyboard } from '../../src/util/eta-quill/eta-keyboard';
import { EtaQuill } from '../../src/util/eta-quill/eta-quill';
import { EtaQuillBuffer } from '../../src/util/eta-quill/eta-quill-buffer';

const Quill = (window as unknown as { Quill: typeof QuillRuntime }).Quill;

describe('Núcleo EtaQuill com Quill privado', () => {
  it('EtaQuill, buffer, containers e blots derivam da cópia privada', () => {
    expect(Object.getPrototypeOf(EtaQuill)).to.equal(PrivateQuill);
    expect(Object.getPrototypeOf(EtaQuillBuffer)).to.equal(PrivateQuill);
    expect(Object.getPrototypeOf(EtaBlot)).to.equal(PrivateQuill.import('blots/block'));
    expect(Object.getPrototypeOf(EtaContainer)).to.equal(PrivateQuill.import('blots/container'));
    expect(Object.getPrototypeOf(EtaBlotConteudoOmissis)).to.equal(PrivateQuill.import('blots/inline'));
  });

  it('configura o EtaQuill sem alterar o registry da aplicação', () => {
    const registryDaAplicacao = (Quill as any).imports;
    const modulosDaAplicacaoAntes = Object.keys(registryDaAplicacao);
    configurePrivateQuill();

    expect(Object.keys(registryDaAplicacao)).to.deep.equal(modulosDaAplicacaoAntes);
    expect(PrivateQuill.import('modules/clipboard')).to.equal(PrivateDefaultClipboardModule);
    expect(PrivateQuill.import('modules/keyboard')).to.equal(PrivateDefaultKeyboardModule);
    expect(EtaQuill.import('modules/clipboard')).to.equal(EtaClipboard);
    expect(EtaQuill.import('modules/keyboard')).to.equal(EtaKeyboard);
  });

  it('mantém a configuração idempotente e os dois tipos de editor funcionais', () => {
    configurePrivateQuill();
    const registry = (PrivateQuill as any).imports;
    const registrosAntes = new Map(Object.entries(registry));
    configurePrivateQuill();
    expect(Object.keys(registry)).to.deep.equal([...registrosAntes.keys()]);

    const editorHtml = document.createElement('div');
    const bufferHtml = document.createElement('div');
    const ricoHtml = document.createElement('div');
    document.body.append(editorHtml, bufferHtml, ricoHtml);
    try {
      const estruturado = new EtaQuill(editorHtml, bufferHtml, {});
      const rico = new PrivateQuill(ricoHtml, {});
      expect(estruturado.keyboard).to.be.an.instanceOf(EtaKeyboard);
      expect(estruturado.clipboard).to.be.an.instanceOf(EtaClipboard);
      expect(rico.keyboard).to.be.an.instanceOf(PrivateDefaultKeyboardModule);
      expect(rico.clipboard).to.be.an.instanceOf(PrivateDefaultClipboardModule);
    } finally {
      editorHtml.remove();
      bufferHtml.remove();
      ricoHtml.remove();
    }
  });

  it('converte conteúdo usando um buffer da cópia privada', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      const buffer = new EtaQuillBuffer(container, {});
      const delta = buffer.converterHtmlParaDelta('<p>Conteúdo privado</p>');
      expect(buffer).to.be.an.instanceOf(PrivateQuill);
      expect(delta.ops?.[0].insert).to.equal('Conteúdo privado');
    } finally {
      container.remove();
    }
  });
});
