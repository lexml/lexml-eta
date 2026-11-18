// #1070: a seleção que alcança o rótulo começa no início do texto, em vez de ser desfeita.
// Eventos nativos (CDP): com eventos sintéticos o navegador não estende a seleção.
import { SHIFT, TECLA_END, TECLA_HOME, TECLA_SETA_DIREITA, arrastoNativo, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

// Retângulos das linhas do texto do <p> na tela.
const linhasDoTexto = (p: HTMLElement): DOMRect[] => {
  const intervalo = p.ownerDocument.createRange();
  intervalo.selectNodeContents(p);
  return Array.from(intervalo.getClientRects()).filter(r => r.width > 0);
};

// Texto de dispositivo visível que ocupa uma só linha na tela.
const textoDeUmaLinha = (root: HTMLElement): HTMLElement | undefined => {
  const area = root.getBoundingClientRect();
  return (Array.from(root.querySelectorAll('p.texto__dispositivo')) as HTMLElement[]).find(p => {
    const r = p.getBoundingClientRect();
    const linhas = linhasDoTexto(p);
    return r.top > area.top + 50 && r.bottom < area.bottom - 50 && (p.textContent || '').length > 30 && linhas.length > 0 && linhas.every(l => Math.abs(l.top - linhas[0].top) < 2);
  });
};

describe('Seleção até o rótulo (#1070)', () => {
  let alvo: HTMLElement;
  let inicio: number;
  let tamanho: number;

  const conferirSelecao = (deslocamento: number, tamanhoEsperado: number): void => {
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(quill.linhaAtual.blotConteudo.domNode === alvo, 'linha atual é a do dispositivo clicado').to.be.true;
      expect(quill.getSelection(), 'seleção do Quill').to.deep.equal({ index: inicio + deslocamento, length: tamanhoEsperado });
      expect(win.document.getSelection()!.toString(), 'texto selecionado').to.equal(quill.getText(inicio + deslocamento, tamanhoEsperado));
    });
  };

  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(30).should('exist');
    cy.wait(1000);
    cy.window().then(win => {
      getQuill(win).root.scrollTop = 3000;
    });
    cy.wait(300);
    cy.window().then(win => {
      const quill = getQuill(win);
      alvo = textoDeUmaLinha(quill.root)!;
      expect(!!alvo, 'dispositivo visível com texto de uma linha').to.be.true;
      const linha = linhasDoTexto(alvo)[0];
      return cliqueNativo(win, linha.left + linha.width / 2, linha.top + linha.height / 2);
    });
    cy.wait(300);
    cy.window().then(win => {
      const quill = getQuill(win);
      inicio = quill.getIndex(quill.linhaAtual.blotConteudo);
      tamanho = quill.linhaAtual.blotConteudo.tamanho;
    });
  });

  it('End seguido de Shift+Home seleciona todo o texto, sem o rótulo', () => {
    cy.then(() => teclaNativa(TECLA_END));
    cy.wait(200);
    cy.then(() => teclaNativa(TECLA_HOME, SHIFT));
    cy.wait(300);
    conferirSelecao(0, tamanho);
  });

  it('Shift+→ depois de End e Shift+Home tira o primeiro caractere da seleção', () => {
    cy.then(() => teclaNativa(TECLA_END));
    cy.wait(200);
    cy.then(() => teclaNativa(TECLA_HOME, SHIFT));
    cy.wait(300);
    cy.then(() => teclaNativa(TECLA_SETA_DIREITA, SHIFT));
    cy.wait(300);
    conferirSelecao(1, tamanho - 1);
  });

  it('Home seguido de Shift+End seleciona todo o texto (controle)', () => {
    cy.then(() => teclaNativa(TECLA_HOME));
    cy.wait(200);
    cy.then(() => teclaNativa(TECLA_END, SHIFT));
    cy.wait(300);
    conferirSelecao(0, tamanho);
  });

  it('arrastar do meio do texto até o rótulo seleciona do início do texto ao ponto inicial', () => {
    let pontoInicial = 0;
    cy.window().then(win => {
      const quill = getQuill(win);
      const linha = linhasDoTexto(alvo)[0];
      const x = linha.left + linha.width / 2;
      const y = linha.top + linha.height / 2;
      const caret = win.document.caretRangeFromPoint(x, y)!;
      pontoInicial = quill.getIndex(quill.constructor.find(caret.startContainer)) + caret.startOffset - inicio;
      const rotulo = quill.linhaAtual.domNode.querySelector('label.texto__rotulo') as HTMLElement;
      const r = rotulo.getBoundingClientRect();
      return arrastoNativo(win, x, y, r.left + r.width / 2, r.top + r.height / 2);
    });
    cy.wait(300);
    cy.then(() => {
      expect(pontoInicial > 0 && pontoInicial < tamanho, 'ponto inicial no meio do texto').to.be.true;
    });
    cy.then(() => conferirSelecao(0, pontoInicial));
  });
});
