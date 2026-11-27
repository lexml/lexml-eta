// #1080: indicador flutuante do agrupador do topo do texto, visível por 3 s depois da rolagem do usuário.
//
// Fixture: demo/doc/plc_artigos_agrupados.json (arts. 1 a 3 fora de agrupador; TÍTULO I › CAPÍTULO I: arts. 4 a 7;
// CAPÍTULO II: arts. 8 e 9). O documento não é montado pelo menu: com vários artigos, o clique em "Adicionar Título,
// Capítulo, Seção e outros" lança "leaf.position is not a function" no focus do Quill (defeito anterior, reproduzido
// sem esta change).
export {};

const FIXTURE = 'demo/doc/plc_artigos_agrupados.json';
const SEL_INDICADOR = '.lx-eta-area-texto > .indicador-agrupador';
const CLASSE_VISIVEL = 'indicador-agrupador--visivel';

// A roda do mouse antes da rolagem a identifica como do usuário.
const rolarComARodaAte = ($alvo: JQuery<HTMLElement>): void => {
  cy.get('#lx-eta-editor .ql-editor').then($root => {
    $root[0].dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
    $alvo[0].scrollIntoView({ block: 'start' });
  });
};

// Com retry: a cadeia é recalculada no quadro seguinte à rolagem.
const deveMostrarNiveis = (esperado: string[]): void => {
  cy.get(SEL_INDICADOR).should($ind => {
    expect(Cypress._.map($ind.find('.indicador-agrupador__nivel'), n => n.textContent!.trim())).to.deep.equal(esperado);
  });
};

describe('Indicador do agrupador atual (#1080)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
    cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
    cy.getContainerArtigoByNumero(9).should('exist');
    // O foco inicial na ementa (setTimeout da carga) rolaria o texto de volta depois da rolagem do teste.
    cy.wait(1000);
    // Altura mínima da área de texto (min-height do .ql-editor), para rolar com poucos artigos.
    cy.get('#lx-eta-editor').invoke('css', 'height', '250px');
  });

  it('não aparece ao abrir nem com artigo fora de agrupador no topo', () => {
    cy.wait(300);
    cy.get(SEL_INDICADOR).should('not.have.class', CLASSE_VISIVEL);

    cy.getContainerArtigoByNumero(2).then(rolarComARodaAte);
    cy.wait(300);
    cy.get(SEL_INDICADOR).should('not.have.class', CLASSE_VISIVEL);
  });

  it('aparece ao rolar, acompanha o capítulo do topo e some 3 s depois', () => {
    cy.getContainerArtigoByNumero(5).then(rolarComARodaAte);
    cy.get(SEL_INDICADOR).should('have.class', CLASSE_VISIVEL).and('have.css', 'pointer-events', 'none');
    deveMostrarNiveis(['TÍTULO I', 'CAPÍTULO I']);

    // Os arts. 8 e 9 ficam perto demais do fim para chegar ao topo; a linha do capítulo termina a cadeia nele.
    cy.get('div.container__elemento.elemento-tipo-capitulo').eq(1).then(rolarComARodaAte);
    deveMostrarNiveis(['TÍTULO I', 'CAPÍTULO II']);
    cy.get(SEL_INDICADOR).should('have.class', CLASSE_VISIVEL);

    cy.wait(3500);
    cy.get(SEL_INDICADOR).should('not.have.class', CLASSE_VISIVEL).and('have.css', 'visibility', 'hidden');
  });
});
