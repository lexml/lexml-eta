// #1084: o link era desenhado deslocado quando o cursor saía para uma linha acima, porque o menu de contexto
// dessa linha conta posições a mais nos blots do Quill do que no texto.
export {};

const TEXTO = 'Isso na lei 432 de 2024.';
const LINK_ESPERADO = 'lei 432 de 2024';

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

const linhaDoTipo = (win: any, tipo: string, ordem: number): any => {
  const linhas: any[] = [];
  for (let l = getQuill(win).getPrimeiraLinha(); l; l = l.next) {
    if (l.tipo === tipo) linhas.push(l);
  }
  return linhas[ordem];
};

// Cursor na linha de cima, com o menu de contexto montado nela (o menu só existe na linha do cursor).
const levarMenuPara = (tipo: string, ordem = 0): void => {
  cy.window().then((win: any) => {
    const quill = getQuill(win);
    const linha = linhaDoTipo(win, tipo, ordem);
    if (quill.linhaAtual !== linha) quill.setSelection(quill.getIndex(linha.blotConteudo), 0, 'user');
  });
  cy.window().should((win: any) => {
    expect(!!linhaDoTipo(win, tipo, ordem).domNode.querySelector('sl-dropdown.lx-eta-dropdown'), `menu de contexto na linha ${tipo}`).to.be.true;
  });
};

const conferirLink = (numero: number): void => {
  cy.getContainerArtigoByNumero(numero).find('a.lexml-remissao-externa', { timeout: 15000 }).should('have.length', 1).and('have.text', LINK_ESPERADO);
  cy.getContainerArtigoByNumero(numero).find('p.texto__dispositivo').should('have.text', TEXTO);
};

describe('Remissão externa desenhada no lugar certo com o menu de contexto acima (#1084)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.wait(1500);
  });

  it('com o menu da ementa acima do artigo', () => {
    levarMenuPara('Ementa');
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(TEXTO);
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    conferirLink(1);
  });

  it('com o menu do art. 1º, que tem mais itens, acima do art. 2º', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    levarMenuPara('Artigo', 0);
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao(TEXTO);
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    conferirLink(2);
  });
});
