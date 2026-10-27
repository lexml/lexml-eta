export {};

describe('Seleção inicial da ementa', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('inicia com a ementa ativa e permite digitar diretamente sem erros', () => {
    // A ementa deve iniciar com a classe de elemento ativo (borda verde e alça)
    cy.get('.elemento-tipo-ementa').should('have.class', 'container__elemento--ativo');

    // Confirma que o modelo interno do Quill tem linhaAtual apontando para a Ementa
    cy.window().then(win => {
      const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
      expect(editorEl?.quill?.linhaAtual).to.exist;
      expect(editorEl?.quill?.linhaAtual?.tipo).to.equal('Ementa');
    });

    // Digita diretamente na ementa
    cy.get('.elemento-tipo-ementa p.texto__dispositivo').focus().type('Texto de teste digitado na ementa.', { force: true });

    cy.get('.elemento-tipo-ementa p.texto__dispositivo').should('contain.text', 'Texto de teste digitado na ementa.');

    // Confirma que não houve erros no console (ex.: TypeError em eta-keyboard)
    cy.get('@consoleError').should('not.have.been.called');
  });
});
