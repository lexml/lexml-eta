/**
 * Grupo L — Remissão para o caput em ações que recriam o artigo
 *
 * Change 2026-09-23-c02-preservar-identidade-caput-no-undo. O undo recria o artigo removido ou movido;
 * o caput precisa voltar com a mesma identidade, senão a remissão para ele perde o vínculo.
 *
 *   CT-L-01 — remover o artigo invalida o link para o caput; desfazer o torna válido de novo
 *   CT-L-02 — mover o artigo e desfazer mantém o link para o caput, com o texto da posição restaurada
 *   CT-L-03 — com o foco na origem, um único desfazer restaura o artigo removido (a marcação de inválido
 *             sincronizada ao perder o foco não vira passo de desfazer)
 *   CT-L-04 — refazer a remoção invalida de novo o link para o caput; desfazer o torna válido de novo
 *
 * Fixture: demo/doc/teste_remissao_caput.json, gerado por criarDocumentoArticulado() — três artigos, o
 * art. 1º com remissão para o caput do art. 2º. A detecção automática não reconhece a forma absoluta
 * "caput do art. Nº" (só a contextual "caput deste artigo"), por isso a remissão vem do arquivo.
 *
 * O caput não tem container próprio no DOM, então o href não é comparado com o id de um container
 * (como no grupo K): a verificação é que o href depois do undo é o mesmo de antes da ação, isto é,
 * o caput restaurado tem o mesmo uuid.
 */

const SEL_LINK_L = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO_L = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_BTN_DESFAZER_L = '.lx-eta-btn-desfazer';
// O botão de refazer não tem classe própria; o title sozinho colide com o do editor-texto-rico (ql-redo).
const SEL_BTN_REFAZER_L = 'button.lx-eta-ql-button[title="Refazer (Ctrl+y)"]';
const SEL_MENSAGEM_INVALIDA_L = '.container__texto--mensagem .mensagem--danger';

describe('Remissão para o caput ao desfazer ações que recriam o artigo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_caput.json', { force: true });
    cy.getContainerArtigoByNumero(3).should('exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });

  it('CT-L-01: remover invalida o link para o caput e desfazer o torna válido de novo', () => {
    cy.getContainerArtigoByNumero(1)
      .find(SEL_LINK_L)
      .invoke('attr', 'href')
      .then(hrefOriginal => {
        cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

        cy.get(SEL_BTN_DESFAZER_L).click();

        cy.getContainerArtigoByNumero(3).should('exist'); // âncora: art. 2º restaurado
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt').and('have.attr', 'href', hrefOriginal);
      });
  });

  it('CT-L-03: com o foco na origem, um único desfazer restaura o artigo removido', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

    // No uso manual a origem pode já ser a linha atual quando o link recebe a classe de inválido; no Cypress a
    // marcação chega antes da troca de linha. Emula esse tempo: htmlAnt sem a classe deixa a origem "alterada".
    cy.getContainerArtigoByNumero(1).then($container => {
      cy.window().then((win: any) => {
        const quill = win.document.querySelector('lexml-eta-proposicao-editor').quill;
        const p = $container[0].querySelector('p.texto__dispositivo') as HTMLElement;
        const linha = quill.getLinha(parseInt(p.id.replace('texto__dispositivo', ''), 10));
        quill.atualizarLinhaCorrente(linha);
        linha.blotConteudo.htmlAnt = linha.blotConteudo.html.replace(' lexml-remissao-invalida', '');
      });
    });

    // Tira o foco do editor como um clique humano (cy.click não move o foco para o botão): dispara o flush do Gatilho B.
    cy.get(SEL_BTN_DESFAZER_L).then($botao => {
      ($botao[0] as HTMLElement).focus();
      ($botao[0] as HTMLElement).click();
    });

    // cy.get reconsulta até o art. 2º voltar; getContainerArtigoByNumero resolve uma única vez e não serve de âncora aqui.
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });

  it('CT-L-04: refazer a remoção invalida de novo o link para o caput, e desfazer o torna válido', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

    cy.get(SEL_BTN_DESFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');

    cy.get(SEL_BTN_REFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA_L).should('exist');

    cy.get(SEL_BTN_DESFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });

  it('CT-L-02: desfazer o movimento mantém o link para o caput na posição restaurada', () => {
    cy.getContainerArtigoByNumero(1)
      .find(SEL_LINK_L)
      .invoke('attr', 'href')
      .then(hrefOriginal => {
        cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Mover para cima');
        // A origem desce para art. 2º e o destino sobe para art. 1º.
        cy.getContainerArtigoByNumero(2).find(SEL_LINK_L).should('have.attr', 'data-lexml-ref', 'art1_cpt');

        cy.get(SEL_BTN_DESFAZER_L).click();

        cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt').and('contain.text', 'caput do art. 2º');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.attr', 'href', hrefOriginal);
      });
  });
});
