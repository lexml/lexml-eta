/**
 * Verificação: ao excluir uma remissão (botão "Excluir" no popup), o DOM deve ficar
 * limpo (sem resquício de <span data-lexml-ref data-ref-id>) e o popup deve fechar
 * imediatamente, sem esperar um clique fora dele.
 */

const SEL_LINK = 'a.lexml-remissao-interna';

describe('Remoção: DOM fica limpo e popup fecha imediatamente após excluir', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
  });

  it('DOM não deve conter data-lexml-ref/data-ref-id residuais e popup deve fechar', () => {
    cy.getContainerArtigoByNumero(2).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const link = $container[0].querySelector('a.lexml-remissao-interna');
        if (!link) return;
        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');

        const btnExcluir = win.document.querySelector('.remissao-popup__btn--excluir') as HTMLElement;
        btnExcluir?.click();
      });
    });

    // Link removido normalmente
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('not.exist');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    // Nenhum resquício de atributo de remissão deve sobrar em NENHUM elemento do dispositivo
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo [data-lexml-ref], p.texto__dispositivo [data-ref-id]').should('not.exist');

    // O popup deve estar fechado (display: none) e permanecer assim
    cy.get('#remissao-popup').should('have.css', 'display', 'none');
    cy.wait(300);
    cy.get('#remissao-popup').should('have.css', 'display', 'none');
  });
});

describe('Exclusão por edição: digitar dentro do link também deixa o DOM limpo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
  });

  it('editar o número dentro do link remove o formato sem deixar resquício e sem manter o popup aberto', () => {
    cy.getContainerArtigoByNumero(2).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const link = $container[0].querySelector('a.lexml-remissao-interna') as HTMLElement;
        if (!link) return;
        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        const blotStart = blot.offset(quill.scroll);
        // Posiciona o cursor no link (abre o popup) e depois digita no MEIO do texto do
        // link ("art. 1º" → "art. 21º"), simulando uma edição interna real do usuário.
        quill.setSelection(blotStart + 1, 0, 'user');
        quill.insertText(blotStart + 5, '2', 'user');
      });
    });

    // O link original some (o texto foi editado internamente)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('not.exist');

    // Nenhum resquício de atributo de remissão deve sobrar em NENHUM elemento do dispositivo
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo [data-lexml-ref], p.texto__dispositivo [data-ref-id]').should('not.exist');

    // O popup (que estava aberto ao posicionar o cursor no link) deve fechar
    cy.get('#remissao-popup').should('have.css', 'display', 'none');
    cy.wait(300);
    cy.get('#remissao-popup').should('have.css', 'display', 'none');
  });
});

export {};
