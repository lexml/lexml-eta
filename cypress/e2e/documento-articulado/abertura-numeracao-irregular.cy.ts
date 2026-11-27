/**
 * Abertura de documento com numeração irregular: lacuna, fora de ordem e complemento
 * (change 2026-11-27-c01-numeracao-fora-de-sequencia, #1113).
 *
 * Fixture: demo/doc/teste_numeracao_irregular.json, gerada por criarDocumentoArticulado() (mesmo código de produção
 * usado ao salvar), não escrita à mão: "Art. 1º", "Art. 3º", "Art. 2º", "Art. 4º", "Art. 4º-A" e "Art. 5º", nessa ordem.
 * Os ids não se repetem, então o arquivo abre nos dois modos de validação de numeração (o seletor `#validacaoNumeracao`
 * da demo escolhe o modo antes de abrir o arquivo).
 */

export {};

const FIXTURE = 'demo/doc/teste_numeracao_irregular.json';
const ALERTA = 'Existem dispositivos com numeração irregular.';
const LACUNA = 'Dispositivo com lacuna na numeração';
const FORA_DE_ORDEM = 'Dispositivo com numeração fora de ordem';
const COMPLEMENTO = 'Dispositivo com complemento na numeração';

const SEL_ARTIGO = 'div.container__elemento.elemento-tipo-artigo';
const ROTULOS_ORIGINAIS = ['Art. 1º', 'Art. 3º', 'Art. 2º', 'Art. 4º', 'Art. 4º-A', 'Art. 5º'];
const TEXTOS = ['Primeiro artigo.', 'Artigo com lacuna.', 'Artigo fora de ordem.', 'Quarto artigo.', 'Artigo com complemento.', 'Quinto artigo.'];

const artigo = (indice: number): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(SEL_ARTIGO).eq(indice);

const esperarArtigos = (rotulos: string[]): void => {
  cy.get(SEL_ARTIGO).should($artigos => {
    expect($artigos.toArray().map(a => a.querySelector('label')?.textContent?.trim())).to.deep.equal(rotulos);
  });
};

// Texto das mensagens de numeração de cada artigo, com retry (o artigo sem mensagem tem lista vazia).
const esperarMensagensPorArtigo = (esperadas: string[][]): void => {
  cy.get(SEL_ARTIGO).should($artigos => {
    const atuais = $artigos.toArray().map(a =>
      Array.from(a.querySelectorAll('div.mensagem'))
        .map(m => m.textContent ?? '')
        .filter(t => t.includes('Dispositivo com'))
        .map(t => [LACUNA, FORA_DE_ORDEM, COMPLEMENTO].find(erro => t.includes(erro)) ?? t)
    );
    expect(atuais).to.deep.equal(esperadas);
  });
};

const textosDosArtigos = (): Cypress.Chainable<(string | undefined)[]> =>
  cy.get(SEL_ARTIGO).then($artigos => $artigos.toArray().map(a => a.querySelector('p.texto__dispositivo')?.textContent?.trim()));

const alertaVisivel = (visivel: boolean): void => {
  cy.get('lexml-eta-alertas').should($el => {
    const texto = $el[0].shadowRoot?.textContent ?? '';
    visivel ? expect(texto).to.include(ALERTA) : expect(texto).not.to.include(ALERTA);
  });
};

const MENSAGENS_ORIGINAIS = [[], [LACUNA], [FORA_DE_ORDEM], [], [COMPLEMENTO], []];

describe('Abertura de documento com numeração irregular', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  });

  for (const modo of ['flexivel', 'rigida'] as const) {
    describe(`modo ${modo === 'flexivel' ? 'flexível' : 'rígido (padrão)'}`, () => {
      beforeEach(() => {
        cy.get('#validacaoNumeracao').select(modo);
        cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
        cy.get(SEL_ARTIGO).should('have.length', ROTULOS_ORIGINAIS.length);
      });

      it('exibe o erro só no artigo que causa cada irregularidade, e o alerta global sem botão de fechar', () => {
        esperarArtigos(ROTULOS_ORIGINAIS);
        // O 4º e o 5º continuam a sequência a partir do maior número anterior: sem erro.
        esperarMensagensPorArtigo(MENSAGENS_ORIGINAIS);
        alertaVisivel(true);
        cy.get('lexml-eta-alertas').shadow().find('sl-alert').contains(ALERTA).find('.alert__close-button').should('not.exist');
      });

      it('"Corrigir agora" renumera de 1 a 6 mantendo a ordem dos textos e retira os erros e o alerta', () => {
        // O clique age na linha do cursor: a linha do artigo fora de ordem é marcada antes (guia, seção 4).
        artigo(2).getOpcoesDeMenuDoDispositivo();
        artigo(2).find('.mensagem__fix').click();

        esperarArtigos(['Art. 1º', 'Art. 2º', 'Art. 3º', 'Art. 4º', 'Art. 5º', 'Art. 6º']);
        textosDosArtigos().should('deep.equal', TEXTOS);
        esperarMensagensPorArtigo([[], [], [], [], [], []]);
        alertaVisivel(false);
      });

      it('desfazer devolve a numeração original, os erros e o alerta', () => {
        artigo(2).getOpcoesDeMenuDoDispositivo();
        artigo(2).find('.mensagem__fix').click();
        cy.get(SEL_ARTIGO).eq(5).find('label').should('contain.text', 'Art. 6º');

        cy.get('.lx-eta-btn-desfazer').click({ force: true });

        esperarArtigos(ROTULOS_ORIGINAIS);
        esperarMensagensPorArtigo(MENSAGENS_ORIGINAIS);
        alertaVisivel(true);
      });
    });
  }
});
