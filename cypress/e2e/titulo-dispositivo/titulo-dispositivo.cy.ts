/**
 * Título de dispositivo (change 2026-10-06-c01-editar-titulo-dispositivo, #265667)
 *
 * Adicionar, editar (menu e clique), remover, cancelar, avisos, formatação restrita, undo/redo,
 * revisão e dispositivo dentro de bloco de alteração.
 *
 * O texto do diálogo é definido pela API do Quill do diálogo (cy.type não é confiável em contenteditable, ver guia §7).
 * Undo/redo usa o botão da toolbar: atalho de teclado logo após rebuild estrutural perde o foco (guia §14.1).
 */

export {};

const SEL_TITULO_T = 'titulo-dispositivo';
const SEL_EDITOR_DIALOGO_T = 'sl-dialog .titulo-dispositivo-editor';
const SEL_AVISO_DIALOGO_T = 'sl-dialog .titulo-dispositivo-aviso';

const textosDoMenuT = ($botao: JQuery<HTMLElement>): string[] =>
  $botao
    .closest('div.container__elemento')
    .find('sl-menu-item')
    .toArray()
    .map(el => (el.textContent || '').replace(/\s+/g, ' ').trim());

const tituloDoArtigoT = (numero: number): Cypress.Chainable<JQuery<HTMLElement>> => cy.getContainerArtigoByNumero(numero).find(SEL_TITULO_T);

// Define o conteúdo do Quill do diálogo; `preencher` recebe a instância.
const noQuillDoDialogoT = (preencher: (quill: any) => void): void => {
  cy.get(SEL_EDITOR_DIALOGO_T).should('exist');
  cy.window().then((win: any) => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor');
    const container = win.document.querySelector(SEL_EDITOR_DIALOGO_T);
    preencher(editorEl.quill.constructor.find(container));
  });
};

const digitarNoDialogoT = (texto: string): void => noQuillDoDialogoT(quill => quill.setText(texto));

const clicarBotaoDoDialogoT = (variante: 'primary' | 'default' | 'danger'): void => {
  cy.get(`sl-dialog sl-button[variant="${variante}"]`).shadow().find('button').should('not.have.attr', 'disabled');
  cy.get(`sl-dialog sl-button[variant="${variante}"]`).click({ force: true });
};

const confirmarDialogoT = (): void => {
  clicarBotaoDoDialogoT('primary');
  cy.get('sl-dialog').should('not.exist');
};

const adicionarTituloT = (numeroArtigo: number, texto: string): void => {
  cy.getContainerArtigoByNumero(numeroArtigo).selecionarOpcaoDeMenuDoDispositivo('Adicionar título do dispositivo');
  digitarNoDialogoT(texto);
  confirmarDialogoT();
};

describe('Título de dispositivo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('adiciona o título pelo menu e passa a oferecer editar e remover', () => {
    adicionarTituloT(1, 'Do objeto');

    tituloDoArtigoT(1).should('have.text', 'Do objeto');

    cy.getContainerArtigoByNumero(1)
      .getOpcoesDeMenuDoDispositivo()
      .should('exist')
      .then($botao => {
        const textos = textosDoMenuT($botao);
        expect(
          textos.some(t => t.startsWith('Editar título')),
          'editar'
        ).to.be.true;
        expect(
          textos.some(t => t.startsWith('Remover título')),
          'remover'
        ).to.be.true;
        expect(
          textos.some(t => t.startsWith('Adicionar título do dispositivo')),
          'adicionar'
        ).to.be.false;
      });
  });

  it('edita o título pelo menu, com o valor atual preenchido', () => {
    adicionarTituloT(1, 'Do objeto');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Editar título');
    cy.get(`${SEL_EDITOR_DIALOGO_T} .ql-editor`).should('have.text', 'Do objeto');
    digitarNoDialogoT('Da finalidade');
    confirmarDialogoT();

    tituloDoArtigoT(1).should('have.text', 'Da finalidade');
  });

  it('edita o título pelo clique no título', () => {
    adicionarTituloT(1, 'Do objeto');

    tituloDoArtigoT(1).click({ force: true });
    cy.get(`${SEL_EDITOR_DIALOGO_T} .ql-editor`).should('have.text', 'Do objeto');
    digitarNoDialogoT('Da vigência');
    confirmarDialogoT();

    tituloDoArtigoT(1).should('have.text', 'Da vigência');
  });

  it('remove o título pelo menu', () => {
    adicionarTituloT(1, 'Do objeto');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover título');

    cy.getContainerArtigoByNumero(1).find(SEL_TITULO_T).should('not.exist');
  });

  it('cancelar não altera o título', () => {
    adicionarTituloT(1, 'Do objeto');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Editar título');
    digitarNoDialogoT('Outro texto');
    clicarBotaoDoDialogoT('default');
    cy.get('sl-dialog').should('not.exist');

    tituloDoArtigoT(1).should('have.text', 'Do objeto');
  });

  it('avisa título vazio e minúscula; Ok fica desabilitado sem texto', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar título do dispositivo');
    cy.get('sl-dialog sl-button[variant="primary"]').should('have.attr', 'disabled');

    // Ao adicionar, o aviso só aparece depois da primeira edição
    digitarNoDialogoT('x');
    cy.get('sl-dialog sl-button[variant="primary"]').should('not.have.attr', 'disabled');
    digitarNoDialogoT('');
    cy.get(SEL_AVISO_DIALOGO_T).should('contain.text', 'Não foi informado um texto para o título do artigo');
    cy.get('sl-dialog sl-button[variant="primary"]').should('have.attr', 'disabled');

    digitarNoDialogoT('do objeto');
    cy.get(SEL_AVISO_DIALOGO_T).should('contain.text', 'deveria iniciar com letra maiúscula');

    confirmarDialogoT();
    tituloDoArtigoT(1).should('have.text', 'do objeto');
  });

  it('Ok fica desabilitado ao apagar todo o texto na edição', () => {
    adicionarTituloT(1, 'Do objeto');
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Editar título');
    digitarNoDialogoT('');
    cy.get('sl-dialog sl-button[variant="primary"]').should('have.attr', 'disabled');
    clicarBotaoDoDialogoT('default');
    cy.get('sl-dialog').should('not.exist');
    tituloDoArtigoT(1).should('have.text', 'Do objeto');
  });

  it('aceita só itálico, sublinhado, subscrito e sobrescrito', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar título do dispositivo');
    noQuillDoDialogoT(quill => {
      quill.setText('');
      quill.insertText(0, 'Ital', { italic: true });
      quill.insertText(4, 'Subl', { italic: false, underline: true });
      quill.insertText(8, 'Sub', { underline: false, script: 'sub' });
      quill.insertText(11, 'Sup', { script: 'super' });
      // Negrito não é um formato aceito pelo Quill do diálogo
      quill.insertText(14, 'Neg', { script: false, bold: true });
    });
    confirmarDialogoT();

    tituloDoArtigoT(1).should($t => {
      expect($t.html()).to.equal('<i>Ital</i><u>Subl</u><sub>Sub</sub><sup>Sup</sup>Neg');
    });
  });

  it('desfaz e refaz a adição do título', () => {
    adicionarTituloT(1, 'Do objeto');
    tituloDoArtigoT(1).should('exist');

    cy.get('.lx-eta-btn-desfazer').click();
    cy.getContainerArtigoByNumero(1).find(SEL_TITULO_T).should('not.exist');

    // O botão de refazer não tem classe própria: é o irmão seguinte do de desfazer
    cy.get('.lx-eta-btn-desfazer').next().click();
    tituloDoArtigoT(1).should('have.text', 'Do objeto');
  });

  it('desfaz a remoção do título', () => {
    adicionarTituloT(1, 'Do objeto');
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover título');
    cy.getContainerArtigoByNumero(1).find(SEL_TITULO_T).should('not.exist');

    cy.get('.lx-eta-btn-desfazer').click();
    tituloDoArtigoT(1).should('have.text', 'Do objeto');
  });

  it('remove o título pelo botão Remover do diálogo e desfaz', () => {
    adicionarTituloT(1, 'Do objeto');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Editar título');
    clicarBotaoDoDialogoT('danger');
    cy.get('sl-dialog').should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_TITULO_T).should('not.exist');

    cy.get('.lx-eta-btn-desfazer').click();
    tituloDoArtigoT(1).should('have.text', 'Do objeto');
  });

  it('não oferece o botão Remover ao adicionar', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar título do dispositivo');
    cy.get('sl-dialog .titulo-dispositivo-editor').should('exist');
    cy.get('sl-dialog sl-button[variant="danger"]').should('not.exist');
    clicarBotaoDoDialogoT('default');
    cy.get('sl-dialog').should('not.exist');
  });
});

describe('Título de dispositivo - revisão', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.ativarRevisaoDispositivo();
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().as('contadorRevisaoTitulo').contains('0');
  });

  it('gera revisão ao adicionar título e a rejeição remove o título', () => {
    adicionarTituloT(1, 'Do objeto');
    cy.get('@contadorRevisaoTitulo').contains('1');

    cy.get('[id^="buttonRevisaoRecusar"]').first().click({ force: true });

    cy.getContainerArtigoByNumero(1).find(SEL_TITULO_T).should('not.exist');
    cy.get('@contadorRevisaoTitulo').contains('0');
  });

  it('aceitar a revisão mantém o título', () => {
    adicionarTituloT(1, 'Do objeto');
    cy.get('@contadorRevisaoTitulo').contains('1');

    cy.get('[id^="buttonRevisaoAceitar"]').first().click({ force: true });

    tituloDoArtigoT(1).should('have.text', 'Do objeto');
    cy.get('@contadorRevisaoTitulo').contains('0');
  });
});

describe('Título de dispositivo - bloco de alteração', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alteração de norma');
    // O artigo inicial do bloco de alteração também é um container de artigo
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
  });

  it('adiciona título ao artigo dentro do bloco de alteração', () => {
    cy.get('div.container__elemento.elemento-tipo-artigo').eq(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar título do dispositivo');
    digitarNoDialogoT('Da redação');
    confirmarDialogoT();

    cy.get('div.container__elemento.elemento-tipo-artigo').eq(1).find(SEL_TITULO_T).should('have.text', 'Da redação');
    cy.get('div.container__elemento.elemento-tipo-artigo').eq(0).find(SEL_TITULO_T).should('not.exist');
  });
});
