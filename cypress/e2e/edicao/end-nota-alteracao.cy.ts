// #1103: na linha que termina com o fecho de aspas e a nota de alteração, End levava o cursor ao dispositivo seguinte.
// Eventos nativos (CDP): com eventos sintéticos o navegador não move o cursor.
import { SHIFT, TECLA_END, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

// Retângulos das linhas do texto do <p> na tela.
const linhasDoTexto = (p: HTMLElement): DOMRect[] => {
  const intervalo = p.ownerDocument.createRange();
  intervalo.selectNodeContents(p);
  return Array.from(intervalo.getClientRects()).filter(r => r.width > 0);
};

const mesmaLinhaVisual = (a: { top: number; height: number }, b: { top: number; height: number }): boolean => Math.abs(a.top - b.top) < Math.max(a.height, b.height) / 2;

const textoComNotaNaMesmaLinhaVisual = (root: HTMLElement): HTMLElement | undefined =>
  (Array.from(root.querySelectorAll('nota-alteracao[exibir]')) as HTMLElement[])
    .map(nota => ({ nota, p: nota.parentElement!.querySelector('p.texto__dispositivo') as HTMLElement }))
    .find(({ nota, p }) => {
      const linhas = p && (p.textContent || '').length > 30 && !/^\.+$/.test((p.textContent || '').trim()) ? linhasDoTexto(p) : [];
      return linhas.length > 0 && mesmaLinhaVisual(linhas[linhas.length - 1], nota.getBoundingClientRect());
    })?.p;

const textoDeVariasLinhas = (root: HTMLElement): HTMLElement | undefined =>
  (Array.from(root.querySelectorAll('p.texto__dispositivo')) as HTMLElement[]).find(p => p.isContentEditable && linhasDoTexto(p).length > 2);

describe('End e Shift+End ficam no texto do dispositivo (#1103)', () => {
  let alvo: HTMLElement;
  let inicio: number;
  let fim: number;
  let clique: number;

  // Clique nativo perto do início da primeira ou da última linha visual do texto do alvo.
  const clicarNoTexto = (encontrar: (root: HTMLElement) => HTMLElement | undefined, linhaVisual: 'primeira' | 'ultima'): void => {
    cy.window().then(win => {
      alvo = encontrar(getQuill(win).root)!;
      expect(!!alvo, 'dispositivo para o teste').to.be.true;
      alvo.scrollIntoView({ block: 'center' });
    });
    cy.wait(300);
    cy.window().then(win => {
      const linhas = linhasDoTexto(alvo);
      const r = linhaVisual === 'primeira' ? linhas[0] : linhas[linhas.length - 1];
      return cliqueNativo(win, r.left + 5, r.top + r.height / 2);
    });
    cy.wait(300);
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(quill.linhaAtual.blotConteudo.domNode === alvo, 'cursor no dispositivo clicado').to.be.true;
      inicio = quill.getIndex(quill.linhaAtual.blotConteudo);
      fim = inicio + quill.linhaAtual.blotConteudo.tamanho;
      clique = quill.getSelection().index;
    });
  };

  const tecla = (shift = false): void => {
    cy.then(() => teclaNativa(TECLA_END, shift ? SHIFT : 0));
    cy.wait(300);
  };

  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(30).should('exist');
    cy.wait(1000);
  });

  it('End na linha com (NR) leva o cursor ao fim do texto, sem mudar de dispositivo', () => {
    clicarNoTexto(textoComNotaNaMesmaLinhaVisual, 'ultima');
    tecla();
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(quill.linhaAtual.blotConteudo.domNode === alvo, 'linha atual não muda').to.be.true;
      expect(quill.getSelection()).to.deep.equal({ index: fim, length: 0 });
    });
  });

  it('Shift+End na linha com (NR) seleciona até o fim do texto, sem o fecho de aspas nem a nota', () => {
    clicarNoTexto(textoComNotaNaMesmaLinhaVisual, 'ultima');
    tecla(true);
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(quill.linhaAtual.blotConteudo.domNode === alvo, 'linha atual não muda').to.be.true;
      expect(quill.getSelection()).to.deep.equal({ index: clique, length: fim - clique });
      expect(win.document.getSelection()!.toString(), 'texto selecionado').to.equal(quill.getText(clique, fim - clique));
    });
  });

  it('End na primeira linha visual de um texto de várias linhas para no fim dela, dentro do texto', () => {
    clicarNoTexto(textoDeVariasLinhas, 'primeira');
    tecla();
    cy.window().then(win => {
      const quill = getQuill(win);
      const { index } = quill.getSelection();
      expect(quill.linhaAtual.blotConteudo.domNode === alvo, 'linha atual não muda').to.be.true;
      expect(index > clique && index < fim, 'cursor dentro do texto').to.be.true;
      expect(mesmaLinhaVisual(quill.getBounds(index - 1), quill.getBounds(clique)), 'cursor no fim da primeira linha visual').to.be.true;
    });
  });
});
