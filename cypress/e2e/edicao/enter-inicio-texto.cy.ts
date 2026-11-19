/**
 * Issue lexml-eta#1086 (change 2026-11-17-c01-foco-enter-inicio-texto): o Enter no início do texto cria o
 * dispositivo vazio antes do atual e deve deixar o cursor no que manteve o texto; o menu "antes" vai para o novo.
 *
 * Mesma técnica de cursor-apos-transformar.cy.ts: o clique sintético não marca linhaAtual, então o cursor é
 * posicionado pela API do Quill e o Enter é um keydown sintético.
 */
export {};

const SEL_ATIVO_E = 'div.container__elemento--ativo';
const SEL_PARAGRAFO_E = 'div.container__elemento.elemento-tipo-paragrafo';

const editorE = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor');

const uuidDoContainerE = ($c: JQuery<HTMLElement>): number => parseInt($c[0].querySelector('p.texto__dispositivo')!.id.replace('texto__dispositivo', ''), 10);

const linhaE = (uuid: number): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(`div#lxEtaId${uuid}`);

const aguardarTimerZeradoE = (): void => {
  cy.window().should((win: any) => expect(editorE(win).timerOnChange, 'timerOnChange').to.not.be.ok);
};

const posicionarCursorE = (uuid: number, noFim: boolean): void => {
  aguardarTimerZeradoE();
  cy.window().then((win: any) => {
    const quill = editorE(win).quill;
    const linha = quill.getLinha(uuid);
    quill.desmarcarLinhaAtual(quill.linhaAtual);
    quill.atualizarLinhaCorrente(linha);
    const inicio = quill.getIndex(linha.blotConteudo);
    quill.setSelection(noFim ? inicio + linha.blotConteudo.tamanho : inicio, 0, 'silent');
  });
};

const teclarEnterE = (uuid: number): void => {
  linhaE(uuid).find('p.texto__dispositivo').trigger('keydown', { key: 'Enter', bubbles: true, cancelable: true, force: true });
};

// A linha ativa é a do uuid, e o cursor está no início do texto dela.
const conferirCursorNoInicioE = (uuid: number): void => {
  cy.get(SEL_ATIVO_E).should('have.length', 1).and('have.id', `lxEtaId${uuid}`);
  cy.window().should((win: any) => {
    const quill = editorE(win).quill;
    expect(quill.linhaAtual?.uuid, 'linhaAtual').to.equal(uuid);
    const selecao = quill.getSelection();
    expect(selecao, 'seleção do Quill').to.be.ok;
    expect(selecao.index, 'cursor no início do texto').to.equal(quill.getIndex(quill.getLinha(uuid).blotConteudo));
  });
};

const textoDaLinhaE = (uuid: number): Cypress.Chainable<string> => linhaE(uuid).find('p.texto__dispositivo').invoke('text');

const rotuloDaLinhaE = (uuid: number): Cypress.Chainable<string> =>
  linhaE(uuid)
    .find('label')
    .first()
    .invoke('text')
    .then(t => t.trim());

describe('Cursor depois do Enter que cria dispositivo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  describe('com texto no dispositivo', () => {
    let uuidArt1: number;
    let uuidParagrafo: number;

    beforeEach(() => {
      // Menus antes das edições de texto do mesmo dispositivo (IndexSizeError após alterarTextoDoDispositivo).
      cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
      cy.get(SEL_PARAGRAFO_E).should('have.length', 1);

      cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Texto do artigo primeiro.');
      cy.get(SEL_PARAGRAFO_E).first().alterarTextoDoDispositivo('Texto do parágrafo.');

      cy.getContainerArtigoByNumero(1).then($c => {
        uuidArt1 = uuidDoContainerE($c);
      });
      cy.get(SEL_PARAGRAFO_E)
        .first()
        .then($c => {
          uuidParagrafo = uuidDoContainerE($c);
        });
    });

    it('Enter no início do texto de um artigo deixa o cursor no artigo que manteve o texto', () => {
      posicionarCursorE(uuidArt1, false);
      teclarEnterE(uuidArt1);

      cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
      rotuloDaLinhaE(uuidArt1).should('equal', 'Art. 2º');
      textoDaLinhaE(uuidArt1).should('equal', 'Texto do artigo primeiro.');
      cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').invoke('text').should('equal', '');
      conferirCursorNoInicioE(uuidArt1);
    });

    it('Enter no início do texto de um parágrafo deixa o cursor no parágrafo que manteve o texto', () => {
      posicionarCursorE(uuidParagrafo, false);
      teclarEnterE(uuidParagrafo);

      cy.get(SEL_PARAGRAFO_E).should('have.length', 2);
      rotuloDaLinhaE(uuidParagrafo).should('equal', '§ 2º');
      textoDaLinhaE(uuidParagrafo).should('equal', 'Texto do parágrafo.');
      cy.get(SEL_PARAGRAFO_E).first().find('p.texto__dispositivo').invoke('text').should('equal', '');
      conferirCursorNoInicioE(uuidParagrafo);
    });

    it('Enter no fim do texto deixa o cursor no dispositivo novo, como antes', () => {
      posicionarCursorE(uuidParagrafo, true);
      teclarEnterE(uuidParagrafo);

      cy.get(SEL_PARAGRAFO_E).should('have.length', 2);
      rotuloDaLinhaE(uuidParagrafo).should('equal', '§ 1º');
      cy.get(SEL_PARAGRAFO_E)
        .last()
        .then($c => conferirCursorNoInicioE(uuidDoContainerE($c)));
    });
  });

  it('"Adicionar artigo antes" pelo menu deixa o cursor no artigo novo, como antes', () => {
    let uuidArt1: number;
    cy.getContainerArtigoByNumero(1).then($c => {
      uuidArt1 = uuidDoContainerE($c);
    });

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');

    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
    cy.getContainerArtigoByNumero(2).then($c => expect(uuidDoContainerE($c), 'artigo original renumerado').to.equal(uuidArt1));
    cy.getContainerArtigoByNumero(1).then($c => conferirCursorNoInicioE(uuidDoContainerE($c)));
  });
});
