/**
 * Comentários na justificação (change 2026-11-03-c02-comentarios-justificacao).
 *
 * O trecho é selecionado pelo Quill do editor, porque a seleção sintética não chega a ele.
 * Os modais ficam fora das abas (contêiner .comentarios-modais no body).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_justificacao.json';
const TEXTO = 'Primeiro trecho e segundo trecho do texto.';
const ALERTA = 'Este documento contém comentários e não deve ser protocolado até que sejam removidos.';

const SEL_EDITOR = '#lexml-eta-editor-texto-rico-justificativa';
const SEL_TEXTO = `${SEL_EDITOR}-inner > .ql-editor`;
const SEL_BOTAO_COMENTARIO = `${SEL_EDITOR} button.ql-lexml-eta-comentario`;
const SEL_MODAIS = '.comentarios-modais';
const SEL_CARD = 'lexml-eta-comentarios .comentario-sequencia';
const SEL_LISTA = `${SEL_MODAIS} #dlg-lista-comentarios`;
const AVISO_EXCLUIR_SEQUENCIA = 'Esta ação removerá todos os comentários e respostas associados ao trecho. Essa operação não poderá ser desfeita.';

// sl-button: o clique é disparado direto, sem depender do shadow DOM já renderizado.
const clicarSlButton = (seletor: string): void => {
  cy.get(seletor).then($botao => $botao[0].dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true })));
};

const abrirJustificacao = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get('sl-tab[panel="justificativa"]').click();
  cy.get(SEL_EDITOR).then($editor => ($editor[0] as any).setContent(`<p>${TEXTO}</p>`));
  cy.get(SEL_TEXTO).should('contain.text', TEXTO);
};

const selecionar = (trecho: string): void => {
  cy.get(SEL_EDITOR).then($editor => {
    const quill = ($editor[0] as any).quill;
    const indice = quill.getText().indexOf(trecho);
    expect(indice, `posição de "${trecho}"`).to.be.greaterThan(-1);
    quill.setSelection(indice, trecho.length, 'user');
  });
};

const preencherEConfirmar = (texto: string): void => {
  cy.get(`${SEL_MODAIS} #textarea-comentario`).should('be.visible').type(texto, { delay: 0 });
  clicarSlButton(`${SEL_MODAIS} #btn-confirmar-comentario`);
  cy.get(`${SEL_MODAIS} #dlg-comentario`).should('not.have.attr', 'open');
};

// Os alertas ficam no shadow root de lexml-eta-alertas.
const conferirAlerta = (existe: boolean): void => {
  cy.get('lexml-eta-alertas').should($el => {
    const texto = $el[0].shadowRoot?.textContent ?? '';
    existe ? expect(texto).to.include(ALERTA) : expect(texto).to.not.include(ALERTA);
  });
};

describe('Comentários na justificação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    abrirJustificacao();
  });

  it('comenta um trecho, responde e exclui a sequência', () => {
    selecionar('Primeiro trecho');
    cy.get(SEL_BOTAO_COMENTARIO).should('not.be.disabled').click();

    cy.get(`${SEL_MODAIS} .comentario-modal__trecho-texto`).should('have.text', 'Primeiro trecho');
    preencherEConfirmar('Revisar a redação.');

    cy.get(`${SEL_TEXTO} comentario`).should('have.length', 1).and('have.text', 'Primeiro trecho');
    cy.get('sl-tab[panel="comentarios"]').should('have.attr', 'active');
    cy.get(SEL_CARD).should('have.length', 1).first().should('have.class', 'comentario-sequencia--selecionada');
    cy.get(`${SEL_CARD} .comentario-item__texto`).should('have.text', 'Revisar a redação.');
    conferirAlerta(true);

    cy.get('sl-tab[panel="comentarios"]').click();
    cy.get(`${SEL_CARD} .comentario-sequencia__responder`).click();
    preencherEConfirmar('De acordo.');
    cy.get(`${SEL_CARD} .comentario-item__texto`).should($textos => {
      expect($textos.toArray().map(t => t.textContent)).to.deep.equal(['Revisar a redação.', 'De acordo.']);
    });

    cy.get(`${SEL_CARD} .comentario-sequencia__acao--excluir`).click();
    cy.get(`${SEL_MODAIS} .comentario-confirmacao__titulo`).should('be.visible').and('have.text', 'Excluir esta sequência de comentários?');
    cy.get(`${SEL_MODAIS} .comentario-confirmacao__texto`).should('have.text', AVISO_EXCLUIR_SEQUENCIA);
    clicarSlButton(`${SEL_MODAIS} #btn-confirmar-exclusao`);

    cy.get(SEL_CARD).should('not.exist');
    cy.get('lexml-eta-comentarios').should('contain.text', 'Não há comentários registrados.');
    cy.get(`${SEL_TEXTO} comentario`).should('not.exist');
    cy.get(SEL_TEXTO).should('contain.text', TEXTO);
    conferirAlerta(false);
  });

  it('o modal abre com outra aba ativa no painel da direita', () => {
    cy.get('sl-tab[panel="notas"]').click();
    selecionar('segundo trecho');
    cy.get(SEL_BOTAO_COMENTARIO).click();

    cy.get(`${SEL_MODAIS} #textarea-comentario`).should('be.visible');
    clicarSlButton(`${SEL_MODAIS} #btn-cancelar-comentario`);
    cy.get(`${SEL_TEXTO} comentario`).should('not.exist');
  });

  it('exibir outra aba no painel da direita desfaz a seleção da sequência', () => {
    selecionar('Primeiro trecho');
    cy.get(SEL_BOTAO_COMENTARIO).click();
    preencherEConfirmar('Revisar a redação.');
    cy.get(`${SEL_CARD}.comentario-sequencia--selecionada`).should('have.length', 1);

    cy.get('sl-tab[panel="notas"]').click();

    cy.get(`${SEL_CARD}.comentario-sequencia--selecionada`).should('not.exist');
    cy.get(`${SEL_TEXTO} comentario.comentario-selecionado`).should('not.exist');
  });

  describe('em tela pequena', () => {
    beforeEach(() => {
      cy.viewport(900, 800);
    });

    it('a lista é exibida num modal: ao comentar, pelo botão da barra e fechando ao selecionar', () => {
      selecionar('Primeiro trecho');
      cy.get(SEL_BOTAO_COMENTARIO).click();
      preencherEConfirmar('Revisar a redação.');

      cy.get(SEL_LISTA).should('have.attr', 'open');
      cy.get(`${SEL_LISTA} .comentario-sequencia`).should('have.length', 1).and('have.class', 'comentario-sequencia--selecionada');

      cy.get(`${SEL_LISTA} .comentario-sequencia__trecho`).click();
      cy.get(SEL_LISTA).should('not.have.attr', 'open');

      cy.get(`${SEL_EDITOR} .comentarios-mobile-button`).should('be.visible').click();
      cy.get(SEL_LISTA).should('have.attr', 'open');
      clicarSlButton('#btn-fechar-lista-comentarios');
      cy.get(SEL_LISTA).should('not.have.attr', 'open');
    });

    it('o botão "Comentários" não aparece em tela grande', () => {
      cy.viewport(1280, 800);
      cy.get(`${SEL_EDITOR} .comentarios-mobile-button`).should('not.be.visible');
    });
  });
});
