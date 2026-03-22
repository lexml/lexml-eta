/**
 * Grupo A — Detecção Automática: Referências Absolutas
 *
 * Setup padrão: nova articulação (DOCUMENTO_PADRAO: Art. 1 limpo) + 2 artigos
 * adicionados via menu, totalizando 3 artigos com IDs previsíveis (art1, art2, art3).
 *
 * Trigger de detecção: dispararDeteccaoRemissao() chama emitirEventoOnChange
 * no editor, que executa atualizarTextoElemento + adicionarRemissaoInternaAction.
 *
 * IMPORTANTE: usar digitarTextoRemissao (insere no modelo Quill via insertText),
 * nunca alterarTextoDoDispositivo, pois este bypassa o Quill e não atualiza
 * o delta interno — renderizarRemissoesDoState usa quill.getText() que leria vazio.
 */
describe('Grupo A — Detecção Automática: Referências Absolutas', () => {
  beforeEach(() => {
    // Inicia nova articulação vazia (Art. 1 com caput vazio)
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona Art. 2 via menu e valida criação
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // Adiciona Art. 3 via menu e valida criação
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');
  });

  it('CT-A-01 — Artigo simples: detecção, criação de link e navegação por clique', () => {
    // Insere texto com referência ao art. 1 no Art. 3
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o art. 1. aplica-se o seguinte.');

    // Verifica que o texto foi inserido no Quill
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    // Dispara detecção via API do editor (emitirEventoOnChange)
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();

    // Verifica que o link foi criado com o texto correto
    cy.getContainerArtigoByNumero(3).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 1');

    // Clica no link de remissão para testar navegação
    cy.getContainerArtigoByNumero(3).find('a.lexml-remissao-interna').click();

    // Verifica que o destino (Art. 1) recebeu o destaque de navegação
    cy.getDestinoRemissaoDestacado().should('exist');
  });
});
