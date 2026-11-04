/**
 * Issue lexml-eta#1038: Shift+Tab seguido de Tab fazia o cursor subir para o dispositivo anterior.
 *
 * A transformação recria a linha, e inserirNovoElementoNoQuill só seleciona a linha recriada com timerOnChange
 * inativo; a transformação anterior arma esse debounce de 1 s. O keydown sintético não gera o focusout real que às
 * vezes zera o timer no uso manual, por isso o caso pendente arma o timer pela API do editor.
 */
export {};

const SEL_ATIVO_C = 'div.container__elemento--ativo';

const editorC = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor');

const uuidDoContainerC = ($c: JQuery<HTMLElement>): number => parseInt($c[0].querySelector('p.texto__dispositivo')!.id.replace('texto__dispositivo', ''), 10);

const linhaC = (uuid: number): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(`div#lxEtaId${uuid}`);

// O clique sintético não marca linhaAtual (docs/guia-cypress.md); marca a linha e põe o cursor no início dela.
const posicionarCursorC = (uuid: number): void => {
  cy.window().then((win: any) => {
    const quill = editorC(win).quill;
    const linha = quill.getLinha(uuid);
    quill.atualizarLinhaCorrente(linha);
    quill.setSelection(quill.getIndex(linha.blotConteudo), 0, 'silent');
  });
};

const aguardarTimerZeradoC = (): void => {
  cy.window().should((win: any) => expect(editorC(win).timerOnChange, 'timerOnChange').to.not.be.ok);
};

const teclarTabC = (uuid: number, shiftKey: boolean): void => {
  linhaC(uuid).find('p.texto__dispositivo').trigger('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true, force: true });
};

const conferirCursorNaLinhaC = (uuid: number, tipo: string): void => {
  linhaC(uuid).should('have.class', `elemento-tipo-${tipo}`);
  cy.get(SEL_ATIVO_C).should('have.length', 1).and('have.id', `lxEtaId${uuid}`);
  cy.window().should((win: any) => {
    const quill = editorC(win).quill;
    expect(quill.linhaAtual?.uuid, 'linhaAtual').to.equal(uuid);
    const linha = quill.getLinha(uuid);
    const inicio = quill.getIndex(linha);
    const selecao = quill.getSelection();
    expect(selecao, 'seleção do Quill').to.be.ok;
    expect(selecao.index, 'seleção dentro da linha transformada').to.be.within(inicio, inicio + linha.length() - 1);
  });
};

describe('Cursor após transformar dispositivo (Tab/Shift+Tab)', () => {
  let uuidInciso2: number;

  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Menus antes das edições de texto do mesmo dispositivo (IndexSizeError após alterarTextoDoDispositivo).
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length', 1);
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 1);
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 2);

    // Dispositivo vazio tem largura 0 e não é clicável.
    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Texto do artigo primeiro.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('Texto do parágrafo:');
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(0).alterarTextoDoDispositivo('inciso um;');
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).alterarTextoDoDispositivo('inciso dois.');

    cy.get('div.container__elemento.elemento-tipo-inciso')
      .eq(1)
      .then($c => {
        uuidInciso2 = uuidDoContainerC($c);
      });
  });

  it('Shift+Tab seguido de Tab com onChange pendente mantém o cursor no inciso', () => {
    posicionarCursorC(uuidInciso2);
    aguardarTimerZeradoC();

    teclarTabC(uuidInciso2, true);
    linhaC(uuidInciso2).should('have.class', 'elemento-tipo-paragrafo');

    // Armado pela API: no uso manual é o debounce deixado pela transformação anterior.
    cy.window().then((win: any) => editorC(win).agendarEmissaoEventoOnChange('teste'));
    cy.window().should((win: any) => expect(editorC(win).timerOnChange, 'timerOnChange armado').to.be.ok);

    teclarTabC(uuidInciso2, false);
    conferirCursorNaLinhaC(uuidInciso2, 'inciso');
  });

  it('Shift+Tab seguido de Tab sem onChange pendente mantém o cursor no inciso', () => {
    posicionarCursorC(uuidInciso2);
    aguardarTimerZeradoC();

    teclarTabC(uuidInciso2, true);
    conferirCursorNaLinhaC(uuidInciso2, 'paragrafo');
    aguardarTimerZeradoC();

    teclarTabC(uuidInciso2, false);
    conferirCursorNaLinhaC(uuidInciso2, 'inciso');
  });
});
