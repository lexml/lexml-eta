/**
 * Pena (change 2026-10-19-c02-editar-pena, #1019)
 *
 * Adicionar pelo menu (modal na primeira), alterar o rótulo, ordem em relação aos incisos, Enter,
 * remover e salvar/reabrir (que também confere o texto editado).
 *
 * O texto é alterado por alterarTextoDoDispositivo (guia §7), porque o que importa aqui é o estado; a linha é
 * marcada antes pelo menu. O salvamento captura o blob de URL.createObjectURL em vez de depender do diretório
 * de downloads do navegador (precedente: titulo-dispositivo.cy.ts).
 */

export {};

const SEL_PENA_P = '.elemento-tipo-pena';
const SEL_DIALOGO_P = 'sl-dialog';
const ADICIONAR_PENA_P = 'Adicionar pena, medida administrativa e outros';

const tiposDasLinhasP = (): Cypress.Chainable<(string | undefined)[]> =>
  cy.get('[class*="elemento-tipo-"]').then($linhas => Array.from($linhas).map(linha => /elemento-tipo-(\w+)/.exec(linha.className)?.[1]));

const rotulosDasPenasP = (): Cypress.Chainable<string[]> => cy.get(`${SEL_PENA_P} label`).then($rotulos => Array.from($rotulos).map(r => (r.textContent || '').trim()));

// Escolhe o radio pelo texto e confirma; o radio do Shoelace responde ao clique no host.
const escolherRotuloNoDialogoP = (rotulo: string): void => {
  cy.get(`${SEL_DIALOGO_P} sl-radio`).contains(rotulo).click({ force: true });
  cy.get(`${SEL_DIALOGO_P} sl-button[variant="primary"]`).shadow().find('button').should('not.have.attr', 'disabled');
  cy.get(`${SEL_DIALOGO_P} sl-button[variant="primary"]`).click({ force: true });
  cy.get(SEL_DIALOGO_P).should('not.exist');
};

// Primeira pena do documento: o modal pergunta o rótulo.
const adicionarPrimeiraPenaP = (container: Cypress.Chainable<JQuery<HTMLElement>>, rotulo: string): void => {
  container.selecionarOpcaoDeMenuDoDispositivo(ADICIONAR_PENA_P);
  escolherRotuloNoDialogoP(rotulo);
};

const paragrafoDoArtigo1P = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('div.container__elemento.elemento-tipo-paragrafo').first();

describe('Pena', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('adiciona a primeira pena escolhendo o rótulo no modal e as seguintes já com o mesmo rótulo', () => {
    adicionarPrimeiraPenaP(cy.getContainerArtigoByNumero(1), 'Penalidade');
    cy.get(SEL_PENA_P).should('have.length', 1);
    rotulosDasPenasP().should('deep.equal', ['Penalidade –']);

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    paragrafoDoArtigo1P().should('exist');
    paragrafoDoArtigo1P().selecionarOpcaoDeMenuDoDispositivo(ADICIONAR_PENA_P);

    cy.get(SEL_PENA_P).should('have.length', 2);
    cy.get(SEL_DIALOGO_P).should('not.exist');
    rotulosDasPenasP().should('deep.equal', ['Penalidade –', 'Penalidade –']);
  });

  it('a pena do artigo pertence ao caput e fica antes dos parágrafos', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    paragrafoDoArtigo1P().should('exist');
    adicionarPrimeiraPenaP(cy.getContainerArtigoByNumero(1), 'Pena');

    // Como último filho do caput, a pena vem antes dos parágrafos do artigo.
    tiposDasLinhasP().then(tipos => {
      const indiceArtigo = tipos.indexOf('artigo');
      expect(tipos.slice(indiceArtigo, indiceArtigo + 3)).to.deep.equal(['artigo', 'pena', 'paragrafo']);
    });
  });

  it('altera o rótulo clicando nele', () => {
    adicionarPrimeiraPenaP(cy.getContainerArtigoByNumero(1), 'Pena');
    cy.get(SEL_PENA_P).getOpcoesDeMenuDoDispositivo();

    cy.get(`${SEL_PENA_P} label.rotulo-pena-editavel`).click({ force: true });
    escolherRotuloNoDialogoP('Infração');

    rotulosDasPenasP().should('deep.equal', ['Infração –']);
  });

  it('um inciso incluído em parágrafo com pena entra antes dela', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    paragrafoDoArtigo1P().should('exist');
    adicionarPrimeiraPenaP(paragrafoDoArtigo1P(), 'Pena');
    cy.get(SEL_PENA_P).should('have.length', 1);

    paragrafoDoArtigo1P().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('.elemento-tipo-inciso').should('have.length', 1);

    tiposDasLinhasP().then(tipos => {
      const indiceParagrafo = tipos.indexOf('paragrafo');
      expect(tipos.slice(indiceParagrafo, indiceParagrafo + 3)).to.deep.equal(['paragrafo', 'inciso', 'pena']);
    });
  });

  it('Enter no fim da pena do inciso cria o inciso seguinte', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('.elemento-tipo-inciso').should('have.length', 1);
    adicionarPrimeiraPenaP(cy.get('.elemento-tipo-inciso').first(), 'Pena');
    cy.get(SEL_PENA_P).should('have.length', 1);

    cy.get(SEL_PENA_P).alterarTextoDoDispositivo('multa.');
    cy.get(`${SEL_PENA_P} p.texto__dispositivo`).focus().type('{end}{enter}', { force: true });

    cy.get('.elemento-tipo-inciso').should('have.length', 2);
    tiposDasLinhasP().then(tipos => {
      const indiceInciso = tipos.indexOf('inciso');
      expect(tipos.slice(indiceInciso, indiceInciso + 3)).to.deep.equal(['inciso', 'pena', 'inciso']);
    });
  });

  it('remove a pena pelo menu', () => {
    adicionarPrimeiraPenaP(cy.getContainerArtigoByNumero(1), 'Pena');
    cy.get(SEL_PENA_P).should('have.length', 1);

    cy.get(SEL_PENA_P).selecionarOpcaoDeMenuDoDispositivo('Remover');

    cy.get(SEL_PENA_P).should('not.exist');
  });

  it('salvar e reabrir preserva o rótulo e o texto da pena', () => {
    const arquivosSalvos: Promise<string>[] = [];
    cy.window().then(win => {
      const criarOriginal = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, 'createObjectURL').callsFake((obj: Blob) => {
        arquivosSalvos.push(obj.text());
        return criarOriginal(obj);
      });
    });

    adicionarPrimeiraPenaP(cy.getContainerArtigoByNumero(1), 'Medida Administrativa');
    cy.get(SEL_PENA_P).getOpcoesDeMenuDoDispositivo();
    cy.get(SEL_PENA_P).alterarTextoDoDispositivo('interdição do estabelecimento.');
    cy.get(`${SEL_PENA_P} p.texto__dispositivo`).should('have.text', 'interdição do estabelecimento.');

    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));

    cy.wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => {
        cy.visit('/');
        cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
        cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(conteudo as string), fileName: 'pena.json' }, { force: true });
      });

    cy.get(SEL_PENA_P).should('have.length', 1);
    rotulosDasPenasP().should('deep.equal', ['Medida Administrativa –']);
    cy.get(`${SEL_PENA_P} p.texto__dispositivo`).should('have.text', 'interdição do estabelecimento.');
  });
});
