// #1077: o Home leva o cursor ao início do texto do dispositivo, sem rolar a tela para o início.
// Eventos nativos (CDP): o keydown sintético não move o cursor nativo e não reproduz o bug.
import { CTRL, TECLA_HOME, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

// Texto longo de um dispositivo inteiramente visível, longe das bordas da área do editor.
const textoVisivel = (root: HTMLElement): HTMLElement | undefined => {
  const area = root.getBoundingClientRect();
  return (Array.from(root.querySelectorAll('p.texto__dispositivo')) as HTMLElement[]).find(p => {
    const r = p.getBoundingClientRect();
    return r.top > area.top + 100 && r.bottom < area.bottom - 100 && (p.textContent || '').length > 60;
  });
};

describe('Tecla Home sem rolagem (#1077)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(30).should('exist');
    cy.wait(1000);
  });

  it('Home no meio do texto leva o cursor ao início do texto e mantém a rolagem', () => {
    for (let i = 0; i < 12; i++) {
      let rolagem = 0;
      let alvo: HTMLElement;

      cy.window().then(win => {
        getQuill(win).root.scrollTop = 2000 + ((i * 1371) % 20000);
      });
      cy.wait(300);
      cy.window().then(win => {
        const root: HTMLElement = getQuill(win).root;
        alvo = textoVisivel(root)!;
        expect(!!alvo, 'dispositivo visível com texto longo').to.be.true;
        const r = alvo.getBoundingClientRect();
        return cliqueNativo(win, r.left + Math.min(r.width / 2, 200), r.top + 5);
      });
      // Tempos variados entre o clique e o Home: o bug dependia da posição do cursor nativo nesse instante.
      cy.wait(50 + (i % 4) * 150);
      cy.window().then(win => {
        rolagem = getQuill(win).root.scrollTop;
        return teclaNativa(TECLA_HOME);
      });
      cy.wait(500);
      cy.window().then(win => {
        const quill = getQuill(win);
        expect(quill.root.scrollTop, `rolagem na tentativa ${i + 1}`).to.equal(rolagem);
        expect(quill.linhaAtual.blotConteudo.domNode === alvo, 'cursor no dispositivo clicado').to.be.true;
        expect(quill.getSelection().index, 'cursor no início do texto').to.equal(quill.getIndex(quill.linhaAtual.blotConteudo));
      });
    }
  });

  it('Ctrl+Home continua rolando ao início do documento', () => {
    cy.window().then(win => {
      getQuill(win).root.scrollTop = 6000;
    });
    cy.wait(300);
    cy.window().then(win => {
      const r = textoVisivel(getQuill(win).root)!.getBoundingClientRect();
      return cliqueNativo(win, r.left + Math.min(r.width / 2, 200), r.top + 5);
    });
    cy.wait(300);
    cy.window().then(win => {
      expect(getQuill(win).root.scrollTop > 0).to.be.true;
      return teclaNativa(TECLA_HOME, CTRL);
    });
    cy.wait(500);
    cy.window().then(win => {
      expect(getQuill(win).root.scrollTop).to.equal(0);
    });
  });
});
