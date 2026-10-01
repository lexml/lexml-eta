import { expect } from '@open-wc/testing';
import PrivateQuill, { PrivateDelta, PrivateParchment } from '../../src/internal/quill/private-quill';

describe('Fronteira interna do Quill', () => {
  it('fornece Quill, Parchment e Delta a partir da mesma referência', () => {
    expect(PrivateQuill).to.exist;
    expect(PrivateParchment).to.equal(PrivateQuill.import('parchment'));
    expect(PrivateDelta).to.equal(PrivateQuill.import('delta'));
  });

  it('permite criar e usar uma instância funcional do editor', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      const editor = new PrivateQuill(container, {});
      editor.setText('Quill interno');
      expect(editor.getText()).to.equal('Quill interno\n');
      expect(editor.root).to.equal(container.querySelector('.ql-editor'));
    } finally {
      container.remove();
    }
  });
});
