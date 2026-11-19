/**
 * Destaque das marcas de revisão de texto na justificação (change 2026-11-03-c01-destaque-marcas-revisao-texto-rico).
 *
 * Fixture: demo/doc/teste_revisao_texto.json, com uma exclusão em dois trechos separados por negrito.
 * O cursor é posicionado pelo Quill do editor, porque o clique sintético não move a seleção.
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_revisao_texto.json';

const SEL_EDITOR = '#lexml-eta-editor-texto-rico-justificativa';
const SEL_TEXTO = `${SEL_EDITOR}-inner > .ql-editor`;
const SEL_MOLDURA = `${SEL_TEXTO} .revisao-selecionada`;

const VERDE = 'rgb(24, 128, 56)';
const TRANSPARENTE = 'rgba(0, 0, 0, 0)';

const abrirJustificacao = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get('sl-tab[panel="justificativa"]').click();
  cy.get(`${SEL_TEXTO} ins, ${SEL_TEXTO} del`).should('have.length', 5);
};

// Põe o cursor no meio do primeiro trecho que contém o texto.
const posicionarCursorEm = (trecho: string): void => {
  cy.get(SEL_EDITOR).then($editor => {
    const quill = ($editor[0] as any).quill;
    const indice = quill.getText().indexOf(trecho);
    expect(indice, `posição de "${trecho}"`).to.be.greaterThan(-1);
    quill.setSelection(indice + 2, 0, 'user');
  });
};

describe('Destaque das marcas de revisão de texto na justificação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    abrirJustificacao();
  });

  it('exibe a inclusão em verde e a exclusão com traço vermelho, ambas sem cor de fundo', () => {
    cy.get(`${SEL_TEXTO} ins`)
      .first()
      .should($ins => {
        const estilo = getComputedStyle($ins[0]);
        expect(estilo.color).to.equal(VERDE);
        expect(estilo.backgroundColor).to.equal(TRANSPARENTE);
      });
    cy.get(`${SEL_TEXTO} del`)
      .first()
      .should($del => {
        const estilo = getComputedStyle($del[0]);
        expect(estilo.backgroundColor).to.equal(TRANSPARENTE);
        expect(estilo.backgroundImage).to.include('linear-gradient');
        expect(estilo.textDecorationLine).to.equal('none');
      });
  });

  it('emoldura os dois trechos da exclusão que atravessa o negrito e retira a moldura em texto comum', () => {
    posicionarCursorEm('Também revoga');

    cy.get(SEL_MOLDURA).should('have.length', 2);
    cy.get(SEL_MOLDURA).should($dels => {
      const dels = $dels.toArray();
      expect(dels.map(d => d.tagName)).to.deep.equal(['DEL', 'DEL']);
      expect(dels[0].getAttribute('id-revisao')).to.equal(dels[1].getAttribute('id-revisao'));
      expect(dels[0].classList.contains('revisao-fragmento-continua-proximo')).to.equal(true);
      expect(dels[1].classList.contains('revisao-fragmento-continua-anterior')).to.equal(true);
    });

    posicionarCursorEm('define prazos');
    cy.get(SEL_MOLDURA).should('not.exist');
  });

  it('na substituição, emoldura só o lado sob o cursor', () => {
    posicionarCursorEm('aquisição');

    cy.get(SEL_MOLDURA).should('have.length', 1);
    cy.get(SEL_MOLDURA).should($el => {
      expect($el[0].tagName).to.equal('INS');
      expect($el[0].textContent).to.include('aquisição');
    });
  });
});
