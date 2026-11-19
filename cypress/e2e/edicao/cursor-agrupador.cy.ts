// #1073: o texto digitado ia para o lado do rótulo do agrupador, pela quebra de linha entre o rótulo e o nome.
// Eventos nativos (CDP): com eventos sintéticos o navegador não move o cursor nem estende a seleção.
import { CTRL, SHIFT, TECLA_END, TECLA_SETA_ACIMA, TECLA_SETA_ESQUERDA, TECLA_X, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

describe('Cursor no nome do agrupador (#1073)', () => {
  let capitulo: any;
  let rotulo: string;
  let nome: string;
  let inicio: number;
  let tamanho: number;

  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(30).should('exist');
    cy.wait(1000);
    cy.window().then(win => {
      const quill = getQuill(win);
      capitulo = quill.getPrimeiraLinha();
      while (capitulo && capitulo.tipo !== 'Capitulo') {
        capitulo = capitulo.next;
      }
      expect(!!capitulo, 'documento tem capítulo').to.be.true;
      quill.root.scrollTop = Math.max(0, capitulo.domNode.offsetTop - 100);
    });
    cy.wait(300);
    cy.window().then(win => {
      const quill = getQuill(win);
      const p = capitulo.blotConteudo.domNode as HTMLElement;
      const r = p.getBoundingClientRect();
      return cliqueNativo(win, r.left + r.width / 2, r.top + r.height / 2).then(() => {
        rotulo = capitulo.domNode.querySelector('label.texto__rotulo').textContent;
        nome = quill.getText(quill.getIndex(capitulo.blotConteudo), capitulo.blotConteudo.tamanho);
      });
    });
    cy.wait(300);
    cy.then(() => teclaNativa(TECLA_END));
    cy.wait(300);
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(quill.linhaAtual === capitulo, 'cursor no capítulo').to.be.true;
      inicio = quill.getIndex(capitulo.blotConteudo);
      tamanho = capitulo.blotConteudo.tamanho;
      expect(quill.getSelection(), 'cursor no fim do nome').to.deep.equal({ index: inicio + tamanho, length: 0 });
    });
  });

  // Desde a #1072, o ↑ na primeira linha visual vai direto ao dispositivo anterior.
  it('↑ a partir do nome sai do agrupador, e o texto digitado não fica ao lado do rótulo', () => {
    cy.then(() => teclaNativa(TECLA_SETA_ACIMA));
    cy.wait(300);
    cy.window().then(win => {
      expect(getQuill(win).linhaAtual === capitulo, 'cursor saiu do capítulo').to.be.false;
    });
    cy.then(() => teclaNativa(TECLA_X));
    cy.wait(300);
    cy.window().then(win => {
      const linha = getQuill(win).getLinha(capitulo.uuid);
      expect(linha.domNode.querySelector('label.texto__rotulo').textContent, 'rótulo inalterado').to.equal(rotulo);
      expect(linha.blotConteudo.domNode.textContent, 'nome inalterado').to.equal(nome);
      expect(linha.blotConteudo.prev.domNode.textContent, 'quebra de linha sem texto').to.equal('');
    });
  });

  it('Ctrl+Shift+← até o início seleciona só o nome', () => {
    for (let i = 0; i < nome.split(' ').length + 3; i++) {
      cy.then(() => teclaNativa(TECLA_SETA_ESQUERDA, CTRL | SHIFT));
      cy.wait(150);
    }
    cy.wait(300);
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(quill.linhaAtual === capitulo, 'cursor continua no capítulo').to.be.true;
      expect(quill.getSelection(), 'seleção do nome inteiro').to.deep.equal({ index: inicio, length: tamanho });
    });
  });
});
