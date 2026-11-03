import { expect } from '@open-wc/testing';
import { AVISO_PARAGRAFO_UNICO, NotaRodapeModal, unirLinhas } from '../../../src/components/editor-texto-rico/nota-rodape-modal';
import { NOTA_RODAPE_INPUT_EVENT } from '../../../src/components/editor-texto-rico/notaRodape';
import PrivateQuill from '../../../src/internal/quill/private-quill';

const Delta = PrivateQuill.import('delta');

// O teclado do Quill 1 lê `which`/`keyCode`, que o construtor de KeyboardEvent não preenche.
const teclar = (quill: any, shiftKey = false): void => {
  const evento = new KeyboardEvent('keydown', { key: 'Enter', shiftKey, bubbles: true, cancelable: true });
  Object.defineProperty(evento, 'which', { get: () => 13 });
  Object.defineProperty(evento, 'keyCode', { get: () => 13 });
  quill.root.dispatchEvent(evento);
};

describe('NotaRodapeModal — um só parágrafo', () => {
  let domNode: HTMLElement;
  let enviados: string[];
  let modal: NotaRodapeModal;
  let confirmOriginal: typeof window.confirm;
  let confirmChamado: boolean;

  const abrir = (texto?: string): any => {
    modal = new NotaRodapeModal({ domNodeNotaRodape: domNode, idNotaRodape: 'nr1', textoInicialNotaRodape: texto });
    modal.open();
    return modal.quill;
  };
  const aviso = (): HTMLElement => document.querySelector('.modal-lexml-eta-nota-rodape .modal-aviso') as HTMLElement;
  const linhas = (quill: any): number => quill.getLines().length;

  beforeEach(() => {
    domNode = document.createElement('div');
    document.body.appendChild(domNode);
    enviados = [];
    domNode.addEventListener(NOTA_RODAPE_INPUT_EVENT, (e: any) => enviados.push(e.detail.texto));
    confirmOriginal = window.confirm;
    confirmChamado = false;
    window.confirm = (): boolean => {
      confirmChamado = true;
      return true;
    };
  });

  afterEach(() => {
    window.confirm = confirmOriginal;
    document.querySelectorAll('.modal-lexml-eta-nota-rodape, .overlay').forEach(el => el.remove());
    domNode.remove();
  });

  it('Enter não cria parágrafo e exibe o aviso', () => {
    const quill = abrir('<p>Primeira parte</p>');
    quill.setSelection(quill.getLength() - 1, 0);

    teclar(quill);
    quill.insertText(quill.getSelection().index, ' segunda parte', 'user');

    expect(linhas(quill)).to.equal(1);
    expect(quill.getText()).to.equal('Primeira parte segunda parte\n');
    expect(aviso().hidden).to.be.false;
    expect(aviso().textContent).to.equal(AVISO_PARAGRAFO_UNICO);
  });

  it('Shift+Enter não cria quebra e exibe o aviso', () => {
    const quill = abrir('<p>Texto</p>');
    quill.setSelection(2, 0);

    teclar(quill, true);

    expect(linhas(quill)).to.equal(1);
    expect(quill.getText()).to.equal('Texto\n');
    expect(aviso().hidden).to.be.false;
  });

  it('colar dois parágrafos entra num só, com espaço e com o negrito preservado', () => {
    const quill = abrir('');
    quill.setSelection(0, 0);

    quill.clipboard.dangerouslyPasteHTML(0, '<p>Primeiro</p><p><strong>Segundo</strong></p>', 'user');

    expect(linhas(quill)).to.equal(1);
    expect(quill.getText()).to.equal('Primeiro Segundo\n');
    expect(quill.getContents().ops).to.deep.equal([{ insert: 'Primeiro ' }, { insert: 'Segundo', attributes: { bold: true } }, { insert: '\n' }]);
  });

  it('digitar depois de colar continua no mesmo parágrafo, logo após o texto colado', () => {
    const quill = abrir('<p>Início fim</p>');
    quill.setSelection(7, 0);

    quill.clipboard.dangerouslyPasteHTML(7, '<p>meio</p><p>colado</p>', 'user');
    quill.insertText(quill.getSelection().index, 'X', 'user');

    expect(linhas(quill)).to.equal(1);
    expect(quill.getText()).to.equal('Início meio coladoXfim\n');
  });

  it('unirLinhas descarta linhas vazias, une com espaço e apara as pontas', () => {
    const delta = new Delta().insert('  Primeiro\n\n').insert('Segundo', { italic: true }).insert('  \n\n');

    expect(unirLinhas(delta).ops).to.deep.equal([{ insert: 'Primeiro ' }, { insert: 'Segundo', attributes: { italic: true } }, { insert: '\n' }]);
  });

  it('nota com dois parágrafos abre unida, e fechar sem alterar não pede confirmação', () => {
    const quill = abrir('<p>Primeiro.</p><p>Segundo.</p>');

    expect(linhas(quill)).to.equal(1);
    expect(quill.getText()).to.equal('Primeiro. Segundo.\n');

    modal.close();
    expect(confirmChamado).to.be.false;
    expect(enviados).to.be.empty;
  });

  it('salvar sem alterar uma nota com dois parágrafos envia a nota unida', () => {
    abrir('<p>Primeiro.</p><p>Segundo.</p>');

    modal.save();

    expect(enviados).to.deep.equal(['<p>Primeiro. Segundo.</p>']);
  });

  it('nota de um parágrafo, com negrito e link, salva sem alterar não envia evento', () => {
    const quill = abrir('<p>Ver <strong>lei</strong> em <a href="https://www.lexml.gov.br" rel="noopener noreferrer" target="_blank">LexML</a>.</p>');
    expect(linhas(quill)).to.equal(1);

    modal.save();

    expect(enviados).to.be.empty;
  });
});
