// #1078: a partir de artigo, o agrupador pode ser criado antes ou depois dele.
export {};

const OPCAO_AGRUPADOR = 'Adicionar Título, Capítulo, Seção e outros';
const DIALOGO = '#slDialogAdicionarAgrupadorArtigo';

const textosDoMenu = ($botao: JQuery<HTMLElement>): string[] =>
  $botao
    .closest('div.container__elemento')
    .find('sl-menu-item')
    .toArray()
    .map(el => (el.textContent || '').replace(/\s+/g, ' ').trim());

// Sequência de artigos e agrupadores na tela, com o rótulo de cada linha.
const linhasDaArticulacao = (): Cypress.Chainable<string[]> =>
  cy.get('div.container__elemento').then($els =>
    $els
      .toArray()
      .filter(el => /elemento-tipo-(artigo|capitulo|secao)\b/.test(el.className))
      .map(el => (el.querySelector('label.texto__rotulo')?.textContent || '').trim())
  );

const clicar = (seletor: string): void => {
  cy.get(seletor).then($el => $el[0].dispatchEvent(new MouseEvent('click', { bubbles: true })));
};

const confirmarDialogo = (): void => {
  clicar(`${DIALOGO} sl-button[variant="primary"]`);
  cy.get(DIALOGO).should('not.exist');
};

describe('Agrupador antes ou depois de artigo (#1078)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º']);
  });

  it('o menu do artigo oferece a opção de agrupador sem indicar a posição', () => {
    cy.getContainerArtigoByNumero(2)
      .getOpcoesDeMenuDoDispositivo()
      .should('exist')
      .then($botao => {
        const textos = textosDoMenu($botao);
        expect(
          textos.some(t => t.startsWith(OPCAO_AGRUPADOR)),
          OPCAO_AGRUPADOR
        ).to.be.true;
        expect(
          textos.some(t => t.startsWith(OPCAO_AGRUPADOR + ' antes')),
          'opção com "antes"'
        ).to.be.false;
        expect(
          textos.some(t => t.includes('Ctrl+Alt+G')),
          'atalho Ctrl+Alt+G no menu'
        ).to.be.false;
      });
  });

  // O atalho conflitava com atalhos do navegador e foi removido.
  it('Ctrl+Alt+G no artigo não abre o modal de agrupador', () => {
    cy.getContainerArtigoByNumero(2).getOpcoesDeMenuDoDispositivo().should('exist');
    cy.get('#lx-eta-editor .ql-editor').trigger('keydown', { key: 'g', code: 'KeyG', ctrlKey: true, altKey: true });
    cy.wait(500);
    cy.get(DIALOGO).should('not.exist');
    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º']);
  });

  it('o modal mostra o posicionamento com Antes marcado, e confirmar direto cria o capítulo antes do artigo', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo(OPCAO_AGRUPADOR);
    cy.get(`${DIALOGO} sl-radio#Capitulo`).should('have.attr', 'aria-checked', 'true');
    cy.get(`${DIALOGO} #rdgPosicao`).should('be.visible');
    cy.get(`${DIALOGO} #posicao-antes`).should('have.attr', 'aria-checked', 'true').and('not.have.attr', 'disabled');
    cy.get(`${DIALOGO} #posicao-depois`).should('have.attr', 'aria-checked', 'false').and('not.have.attr', 'disabled');
    confirmarDialogo();

    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'CAPÍTULO ÚNICO', 'Art. 2º']);
  });

  it('Depois no último artigo cria o capítulo vazio depois dele', () => {
    criarCapituloDepoisDoArt2();
  });

  // Sem dispositivo depois do capítulo, o refazer lançava TypeError e o desfazer da remoção o recriava antes do art. 2º.
  it('desfazer e refazer a inclusão devolvem o capítulo vazio ao fim do documento', () => {
    criarCapituloDepoisDoArt2();

    aguardarHistoricoDoQuillVazio();
    cy.get(BOTAO_DESFAZER).click({ force: true });
    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º']);

    aguardarHistoricoDoQuillVazio();
    cy.get(BOTAO_DESFAZER).next().click({ force: true });
    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º', 'CAPÍTULO ÚNICO']);
  });

  it('desfazer a remoção devolve o capítulo vazio ao fim, sem levar o último artigo', () => {
    criarCapituloDepoisDoArt2();

    cy.get('div.container__elemento.elemento-tipo-capitulo').first().selecionarOpcaoDeMenuDoDispositivo('Remover');
    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º']);

    aguardarHistoricoDoQuillVazio();
    cy.get(BOTAO_DESFAZER).click({ force: true });
    linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º', 'CAPÍTULO ÚNICO']);
  });
});

// O botão de refazer não tem classe própria: é o seguinte ao de desfazer.
const BOTAO_DESFAZER = '.lx-eta-btn-desfazer';

// A linha nova entra no histórico de texto do Quill, limpo num setTimeout; antes disso, o botão desfaz só o texto do Quill.
function aguardarHistoricoDoQuillVazio(): void {
  cy.window().should(win => {
    const quill = (win.document.querySelector('lexml-eta-proposicao-editor') as any).quill;
    expect(quill.history.stack.undo.length + quill.history.stack.redo.length, 'histórico de texto do Quill').to.equal(0);
  });
}

function criarCapituloDepoisDoArt2(): void {
  cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo(OPCAO_AGRUPADOR);
  cy.get(`${DIALOGO} sl-radio#Capitulo`).should('have.attr', 'aria-checked', 'true');
  cy.get(`${DIALOGO} #posicao-depois`).then($r => ($r[0] as any).click());
  cy.get(`${DIALOGO} #posicao-depois`).should('have.attr', 'aria-checked', 'true');
  cy.get(`${DIALOGO} #posicao-antes`).should('have.attr', 'aria-checked', 'false');
  confirmarDialogo();

  linhasDaArticulacao().should('deep.equal', ['Art. 1º', 'Art. 2º', 'CAPÍTULO ÚNICO']);
}
