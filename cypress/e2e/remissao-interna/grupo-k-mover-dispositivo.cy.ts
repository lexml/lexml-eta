/**
 * Grupo K — Atualização de remissões ao mover dispositivo (issue #1004)
 *
 * Change 2026-09-23-c01-atualizar-remissao-ao-mover-dispositivo. Mover troca o uuid da subárvore
 * movida (resetUuidTodaArvore); a remissão é resolvida pelo uuid2 e reancorada, e o href do link
 * (#lxEtaId{uuid}) precisa acompanhar o container atual do destino.
 *
 *   CT-K-01 — mover o destino atualiza texto, data-lexml-ref e href do link
 *   CT-K-02 — mover a origem mantém o link funcional (popup navega para o destino)
 *   CT-K-03 — undo do movimento restaura o texto e o destino do link
 *
 * CT-K-04 (artigo movido para outro agrupador mantendo o número) não foi implementado: não há
 * comando Cypress para criar agrupadores (ver grupo-g-atualizacao.cy.ts). O risco é coberto por
 * reducer-atualiza-remissao-mover.test.ts e moduloRemissao.test.ts.
 *
 * Cuidado: alterarTextoDoDispositivo seguido de clique no menu do MESMO dispositivo quebra com
 * IndexSizeError (CLAUDE.md) — a última edição antes de abrir um menu é sempre em outro dispositivo.
 * O texto de preenchimento só existe no DOM (não chega ao Redux) e some quando o dispositivo movido é
 * recriado — as âncoras usam o próprio link, nunca esse texto.
 */

const SEL_LINK_K = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO_K = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_BTN_DESFAZER_K = '.lx-eta-btn-desfazer';
const TEXTO_ART3_K = 'Os recursos serão aplicados conforme o regulamento.';

// O href do link deve apontar para o container atual do destino.
const verificarHrefApontaPara = (numeroArtigoOrigem: number, numeroArtigoDestino: number): void => {
  cy.getContainerArtigoByNumero(numeroArtigoDestino)
    .invoke('attr', 'id')
    .then(idDestino => {
      cy.getContainerArtigoByNumero(numeroArtigoOrigem).find(SEL_LINK_K).should('have.attr', 'href', `#${idDestino}`);
    });
};

describe('Mover: remissão para o dispositivo movido', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Art. 1 referencia o Art. 3
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o art. 3º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_K).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art3');

    cy.getContainerArtigoByNumero(3).alterarTextoDoDispositivo(TEXTO_ART3_K);
    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições aplicam-se à administração direta.');
  });

  it('CT-K-01: mover o Art. 3 para cima atualiza o link para art. 2º', () => {
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Mover para cima');

    cy.getContainerArtigoByNumero(1).find(SEL_LINK_K).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2').and('have.text', 'art. 2º');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_K).should('not.exist');
    verificarHrefApontaPara(1, 2);
  });

  it('CT-K-03: undo do movimento restaura o link para art. 3º', () => {
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Mover para cima');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_K).should('have.attr', 'data-lexml-ref', 'art2');

    cy.get(SEL_BTN_DESFAZER_K).click();

    cy.getContainerArtigoByNumero(1).find(SEL_LINK_K).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art3').and('have.text', 'art. 3º');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_K).should('not.exist');
    verificarHrefApontaPara(1, 3);
  });
});

describe('Mover: remissão contida no dispositivo movido', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Art. 3 (que será movido) referencia o Art. 1
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK_K).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece normas gerais.');
    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições aplicam-se à administração direta.');
  });

  it('CT-K-02: após mover a origem, o link continua e o popup navega para o destino', () => {
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Mover para cima');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'Conforme o'); // âncora

    cy.getContainerArtigoByNumero(2).find(SEL_LINK_K).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1').and('have.text', 'art. 1º');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO_K).should('not.exist');
    verificarHrefApontaPara(2, 1);

    // Posiciona o cursor dentro do link (abre o popup) e clica no rótulo navegável (padrão do grupo A)
    cy.getContainerArtigoByNumero(2).then($container => {
      return cy.window().then(win => {
        const quill = (win.document.querySelector('lexml-eta-proposicao-editor') as any)?.quill;
        const link = $container[0].querySelector(SEL_LINK_K);
        const blot = (quill.constructor as any).find(link);
        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');
        (win.document.querySelector('.remissao-popup__rotulo--navegavel') as HTMLElement)?.click();
      });
    });
    cy.getDestinoRemissaoDestacado().should('exist');
    cy.getContainerArtigoByNumero(1).should('have.class', 'lexml-remissao-destaque');
  });
});
