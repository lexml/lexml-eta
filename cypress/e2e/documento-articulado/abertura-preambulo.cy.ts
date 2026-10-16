/**
 * Preâmbulo somente leitura entre a ementa e a articulação.
 *
 * Cobre, pela UI real, a change 2026-10-16-c02-preambulo-somente-leitura. Sem fixture nova: a proposição
 * nova (PL) exercita o texto padrão, e demo/doc/teste_opcoes_impressao.json tem um preâmbulo diferente do
 * padrão, com dois parágrafos. Adicionar agrupador a partir da ementa abre um diálogo e fica coberto
 * no teste de reducer (test/redux/preambulo), pois o diálogo não tem precedente nesta suíte.
 */
export {};

const SEL_PREAMBULO = '.elemento-tipo-preambulo';
const SEL_TEXTO_PREAMBULO = `${SEL_PREAMBULO} p.texto__dispositivo`;
const TEXTO_PADRAO_PL = 'O CONGRESSO NACIONAL decreta:';

const tiposDasLinhasPreambulo = (): Cypress.Chainable<(string | undefined)[]> =>
  cy.get('[class*="elemento-tipo-"]').then($linhas => Array.from($linhas).map(linha => /elemento-tipo-(\w+)/.exec(linha.className)?.[1]));

describe('Preâmbulo somente leitura', () => {
  describe('Nova proposição', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.novaProposicao();
      cy.getContainerArtigoByNumero(1).should('exist');
    });

    it('exibe o texto padrão do tipo entre a ementa e o Art. 1º', () => {
      tiposDasLinhasPreambulo().then(tipos => {
        const indice = tipos.indexOf('preambulo');
        expect(indice, 'linha do preâmbulo').to.be.greaterThan(-1);
        expect(tipos[indice - 1]).to.equal('ementa');
        expect(tipos[indice + 1]).to.equal('artigo');
      });
      cy.get(SEL_TEXTO_PREAMBULO).should('contain.text', TEXTO_PADRAO_PL);
    });

    it('é bloqueado: digitar, apagar e remover não alteram o texto', () => {
      cy.get(SEL_PREAMBULO).should('have.attr', 'bloqueado', 'true');
      // Marca a linha como atual (o clique sintético do Cypress não dispara selection-change no Quill).
      cy.get(SEL_PREAMBULO).getOpcoesDeMenuDoDispositivo().should('not.exist');
      cy.get(SEL_TEXTO_PREAMBULO).type('abc{backspace}{backspace}{del}', { force: true });
      cy.get(SEL_TEXTO_PREAMBULO).should('have.text', TEXTO_PADRAO_PL);
    });

    it('não oferece ações no menu', () => {
      cy.get(SEL_PREAMBULO).getOpcoesDeMenuDoDispositivo().should('not.exist');
    });

    it('um artigo adicionado depois da ementa aparece depois do preâmbulo', () => {
      cy.get('.elemento-tipo-ementa').selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
      cy.get('.elemento-tipo-artigo').should('have.length', 2);

      tiposDasLinhasPreambulo().then(tipos => {
        const indice = tipos.indexOf('preambulo');
        expect(tipos[indice - 1]).to.equal('ementa');
        expect(tipos[indice + 1]).to.equal('artigo');
      });
      cy.get(SEL_TEXTO_PREAMBULO).should('have.text', TEXTO_PADRAO_PL);
    });
  });

  describe('Abertura de arquivo', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('exibe o preâmbulo do arquivo em vez do texto padrão, com os parágrafos em uma linha', () => {
      cy.get('#fileUpload').selectFile('demo/doc/teste_opcoes_impressao.json', { force: true });
      cy.getContainerArtigoByNumero(1).should('exist');

      cy.get(SEL_TEXTO_PREAMBULO)
        .should('contain.text', 'O Congresso Nacional decreta:')
        .and('contain.text', 'Segundo parágrafo do preâmbulo.')
        .and('not.contain.text', TEXTO_PADRAO_PL);
    });
  });
});
