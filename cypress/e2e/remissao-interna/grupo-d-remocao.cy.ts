/**
 * Grupo D — Remoção de Remissão
 *
 * CT-D-01: Posicionar cursor sobre link → botão habilitado → clicar → link removido, texto preservado.
 * CT-D-02: Selecionar trecho com dois links → clicar remover → ambos removidos, texto preservado.
 * CT-D-03: Cursor em texto sem link → botão disabled.
 *
 * Setup de remissões via digitarTextoRemissao + dispararDeteccaoRemissao (sem fixture JSON),
 * consistente com os padrões dos Grupos A–C.
 */

const SEL_BTN_REMOVER = '.btn-remover-remissao';
const SEL_LINK = 'a.lexml-remissao-interna';

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-01 — Remover remissão posicionando cursor sobre o link
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: cursor sobre link → botão habilitado → link removido', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // Inserir texto com referência ao Art. 1 no Art. 2
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    // Disparar detecção e aguardar link criado
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
  });

  it('CT-D-01: clicar no link habilita botão; clicar no botão remove o link', () => {
    // Clicar no link posiciona o cursor sobre ele (Quill dispara selection-change)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).click();

    // Botão de remoção deve ficar habilitado
    cy.get(SEL_BTN_REMOVER).should('not.have.attr', 'disabled');

    // Clicar no botão de remoção
    cy.get(SEL_BTN_REMOVER).click();

    // Link deve ter desaparecido
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('not.exist');

    // Texto deve permanecer intacto
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-02 — Remover múltiplas remissões selecionando um trecho
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: seleção de trecho com dois links → ambos removidos', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Inserir texto com referências ao Art. 1 e Art. 2 no Art. 3
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Nos termos do art. 1º e do art. 2º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    // Disparar detecção e aguardar os dois links
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 2);
  });

  it('CT-D-02: selecionar trecho inteiro via Quill e remover apaga ambos os links', () => {
    // Selecionar o texto completo do p.texto__dispositivo do Art. 3 via quill.setSelection
    cy.getContainerArtigoByNumero(3).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const p = $container[0].querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
        if (!p) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(p);
        if (!blot) return;

        const blotStart = blot.offset(quill.scroll);
        const blotLength = blot.length();
        // blotLength inclui o newline terminal; selecionar blotLength - 1 para cobrir só o texto
        quill.setSelection(blotStart, blotLength - 1, 'user');
      });
    });

    // Botão de remoção deve estar habilitado (seleção cobre links)
    cy.get(SEL_BTN_REMOVER).should('not.have.attr', 'disabled');

    // Clicar no botão de remoção
    cy.get(SEL_BTN_REMOVER).click();

    // Ambos os links devem ter desaparecido
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('not.exist');

    // Texto deve permanecer intacto
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-03 — Botão desabilitado quando não há remissão no cursor
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: botão disabled quando cursor está em texto sem link', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('CT-D-03: após posicionar cursor em texto sem link, botão permanece disabled', () => {
    // Posicionar cursor no Art. 1 (sem nenhuma remissão)
    cy.getContainerArtigoByNumero(1).posicionarCursorNoDispositivo();

    // Botão de remoção deve permanecer desabilitado
    cy.get(SEL_BTN_REMOVER).should('have.attr', 'disabled');
  });
});
