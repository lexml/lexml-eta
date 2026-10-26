/**
 * Abertura de documento articulado com penas (change 2026-10-19-c02-editar-pena, #1019).
 *
 * Fixture: demo/doc/teste_pena_abertura.json, gerada por criarDocumentoArticulado() (mesmo código de produção usado
 * ao salvar) a partir da resposta real do conversor (test/doc/pena/lexml-com-penas.ts), não escrita à mão. Penas no
 * caput, no parágrafo, no inciso e no caput omissis de um artigo de bloco de alteração. O rótulo da pena do § 1º
 * foi trocado à mão para "Pena -" (hífen simples), como vem do Planalto, para conferir a normalização ao abrir.
 */
export {};

const SEL_PENA_A = '.elemento-tipo-pena';

const tiposDasLinhasA = (): Cypress.Chainable<(string | undefined)[]> =>
  cy.get('[class*="elemento-tipo-"]').then($linhas => Array.from($linhas).map(linha => /elemento-tipo-(\w+)/.exec(linha.className)?.[1]));

const textosDe = (seletor: string): Cypress.Chainable<string[]> => cy.get(seletor).then($els => Array.from($els).map(el => (el.textContent || '').trim()));

describe('Abertura de documento com penas', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    cy.get('#fileUpload').selectFile('demo/doc/teste_pena_abertura.json', { force: true });
    cy.get(SEL_PENA_A).should('have.length', 4);
  });

  it('exibe as quatro penas com o rótulo normalizado, inclusive a que veio com hífen', () => {
    textosDe(`${SEL_PENA_A} label`).should('deep.equal', ['Pena –', 'Infração –', 'Pena –', 'Pena –']);
  });

  it('exibe o texto de cada pena', () => {
    textosDe(`${SEL_PENA_A} p.texto__dispositivo`).should('deep.equal', [
      'reclusão, de seis a vinte anos.',
      'multa.',
      'reclusão, de doze a trinta anos.',
      'reclusão, de seis a dez anos.',
    ]);
  });

  it('a pena de cada dispositivo é a última linha dele', () => {
    tiposDasLinhasA().then(tipos => {
      const indiceArtigo = tipos.indexOf('artigo');
      // Art. 1º: caput, pena do caput, § 1º, inciso I com pena, inciso II e pena do § 1º por último.
      expect(tipos.slice(indiceArtigo, indiceArtigo + 8)).to.deep.equal(['artigo', 'pena', 'paragrafo', 'inciso', 'pena', 'inciso', 'pena', 'artigo']);
    });
  });

  it('a pena do bloco de alteração vem depois do omissis do caput', () => {
    tiposDasLinhasA().then(tipos => {
      const indicePenaDoBloco = tipos.lastIndexOf('pena');
      expect(tipos[indicePenaDoBloco - 1]).to.equal('omissis');
    });
  });

  it('a pena do bloco fecha as aspas, mostra (NR) e permite alterar o rótulo pelo clique', () => {
    const penaDoBloco = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(SEL_PENA_A).last();
    penaDoBloco().find('fecha-aspas').should('exist');
    penaDoBloco().find('nota-alteracao').should('contain.text', '(NR)');

    // A linha é marcada antes para o rótulo ficar clicável (guia §4).
    penaDoBloco().getOpcoesDeMenuDoDispositivo();
    penaDoBloco().find('label').click({ force: true });
    cy.get('sl-dialog').should('have.attr', 'label', 'Alterar rótulo');

    cy.get('sl-dialog sl-radio').contains('Infração').click({ force: true });
    cy.get('sl-dialog sl-button[variant="primary"]').shadow().find('button').should('not.have.attr', 'disabled');
    cy.get('sl-dialog sl-button[variant="primary"]').click({ force: true });
    cy.get('sl-dialog').should('not.exist');
    penaDoBloco().find('label').should('contain.text', 'Infração –');
  });
});
