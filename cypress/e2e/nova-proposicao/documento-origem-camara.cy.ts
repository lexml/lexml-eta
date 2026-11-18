/**
 * Texto de outra proposição na Câmara (Tela 2b) — change 2026-11-16-c01-nova-proposicao-cd-lista-documentos.
 *
 * Cobre, pela UI real, a escolha do documento de origem de um substitutivo/subemenda substitutiva da CD contra o
 * mock da demo (GET /demo-api/materias/{sigla}/{numero}/{ano}/documentos e /demo-api/documentos/{id}/texto,
 * demo/server/handlers.mjs, sem cy.intercept). Massa: PL 4/2025 (6 documentos, o PL 480/2025 sem texto
 * estruturado), PL 4687/2023 (sem documentos) e PL 5008/2023 (sem mock: matéria não encontrada).
 * Viabilidade conforme docs/guia-cypress.md: light DOM + Shoelace, apoio em cypress/support/nova-proposicao.ts.
 */
import { deveEstarDesabilitado, deveEstarHabilitado, digitarEmSl, escolherComissao, escolherItemLista, marcarRadioSl } from '../../support/nova-proposicao';

const BOTAO_NOVA = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL = '#dialogNovaProposicao';
const LISTA = '#np-docs-lista';

const linha = (id: string): string => `${LISTA} .np-doc[data-id="${id}"]`;

const identificarProposicao = (especie: string): void => {
  marcarRadioSl('especie', especie);
  escolherItemLista('#np-sigla-proposicao', 'PL');
  digitarEmSl('#np-numero-proposicao', '4');
  digitarEmSl('#np-ano-proposicao', '2025');
  cy.get('#np-proposicao-verificar').click();
  escolherComissao('CCJC');
  cy.get('#np-continuar').click();
};

// O substitutivo é o padrão: a lista completa do mock traz os documentos PL, que a subemenda substitutiva omite.
const irParaTela2 = (especie = 'substitutivo'): void => {
  cy.get('#casaEditor').select('CD');
  cy.get(BOTAO_NOVA).click();
  cy.get(`${MODAL}[open]`).should('exist');
  identificarProposicao(especie);
};

const irParaTela2b = (especie = 'substitutivo'): void => {
  irParaTela2(especie);
  marcarRadioSl('opcaoTexto', 'outra');
  cy.get('#np-continuar').click();
  cy.get('#np-tela-2b').should('exist');
};

describe('Nova proposição na CD — documento de origem (Tela 2b)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('a opção "Texto de outra proposição" não pede sigla, número nem ano e leva à Tela 2b', () => {
    irParaTela2();
    marcarRadioSl('opcaoTexto', 'outra');
    cy.get('#np-sigla-outra').should('not.exist');
    cy.get('#np-numero-outra').should('not.exist');
    cy.get('#np-outra-verificar').should('not.exist');
    deveEstarHabilitado('#np-continuar');

    cy.get('#np-continuar').click();
    cy.get('#np-tela-2b').should('exist');
    cy.get('#np-g-materia').should('contain.text', 'Nesta mesma matéria (PL 4/2025)');
  });

  it('lista os documentos da matéria, filtra, seleciona e abre o editor com o texto do documento', () => {
    irParaTela2b('subemenda');
    cy.get(`${LISTA} .np-doc`).should('have.length', 3);
    cy.get(linha('prl-1-ccjc-parecer')).should('contain.text', 'Relator: Dep. Beltrano').and('contain.text', '12/08/2025');
    deveEstarDesabilitado('#np-continuar');

    cy.get('#np-docs-filtro').shadow().find('input').type('12/08/2025');
    cy.get(`${LISTA} .np-doc`).should('have.length', 1);
    cy.get(linha('prl-1-ccjc-parecer')).click();
    cy.get('#np-fonte-selecionada').should('contain.text', 'Parecer do relator 1 – CCJC').and('contain.text', 'matéria PL 4/2025');
    deveEstarHabilitado('#np-continuar');

    cy.get('#np-continuar').click();
    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get('lexml-eta').should($el => {
      const urn = ($el[0] as any).getDocumentoArticulado().value.metadado.identificacao.urn;
      expect(urn).to.match(/^urn:lex:br:camara\.deputados:subemenda\.substitutiva;ssp:\d{4};999999$/);
    });
  });

  it('a subemenda substitutiva não lista documentos PL; trocar para substitutivo na Tela 1 os traz de volta', () => {
    irParaTela2b('subemenda');
    cy.get(`${LISTA} .np-doc`).should('have.length', 3);
    cy.get(`${LISTA} .np-doc`).should('not.contain.text', 'PL 117/2025');
    cy.get(linha('pl-4-2025-original')).should('not.exist');

    cy.get('#np-voltar').click();
    cy.get('#np-voltar').click();
    identificarProposicao('substitutivo');
    marcarRadioSl('opcaoTexto', 'outra');
    cy.get('#np-continuar').click();
    cy.get(`${LISTA} .np-doc`).should('have.length', 6);
    cy.get(linha('pl-4-2025-original')).should('exist');
  });

  it('documento sem texto estruturado fica desabilitado e não pode ser selecionado', () => {
    irParaTela2b();
    cy.get(linha('pl-480-2025-apensado')).should('have.attr', 'aria-disabled', 'true').and('contain.text', 'Texto estruturado não disponível');
    cy.get(linha('pl-480-2025-apensado')).click();
    cy.get('#np-fonte-selecionada').should('not.exist');
    deveEstarDesabilitado('#np-continuar');
  });

  it('Trocar descarta a seleção e Voltar retorna à Tela 2 com a opção preservada', () => {
    irParaTela2b();
    cy.get(linha('prl-1-csaude-substitutivo')).click();
    cy.get('#np-fonte-selecionada').should('exist');
    cy.get('#np-trocar').click();
    cy.get('#np-fonte-selecionada').should('not.exist');
    deveEstarDesabilitado('#np-continuar');

    cy.get('#np-voltar').click();
    cy.get('#np-tela-2b').should('not.exist');
    cy.get('sl-radio[name="opcaoTexto"][value="outra"]').should('have.attr', 'checked');
  });

  it('em outra matéria: lista vazia e matéria sem mock informam o resultado', () => {
    irParaTela2b();
    marcarRadioSl('materia', 'outra');
    cy.get(LISTA).should('not.exist');
    escolherItemLista('#np-sigla-materia', 'PL');
    digitarEmSl('#np-numero-materia', '4687');
    digitarEmSl('#np-ano-materia', '2023');
    cy.get('#np-materia-verificar').click();
    cy.get('#np-docs-vazia').should('exist');
    deveEstarDesabilitado('#np-continuar');

    digitarEmSl('#np-numero-materia', '5008');
    cy.get('#np-docs-vazia').should('not.exist');
    cy.get('#np-materia-verificar').click();
    cy.get('#np-materia-nao-encontrada').should('exist');
  });

  it('a ementa aparece abaixo do título, em até 2 linhas, com o texto completo no tooltip', () => {
    irParaTela2b();
    cy.get(`${linha('prl-1-csaude-substitutivo')} .np-doc-ementa`)
      .should('contain.text', 'consolida as alterações propostas ao Código Civil')
      .and($el => {
        const ementa = $el[0];
        const estilo = ementa.ownerDocument.defaultView!.getComputedStyle(ementa);
        expect(estilo.webkitLineClamp, 'limite de linhas').to.equal('2');
        expect(ementa.getAttribute('title'), 'texto completo no tooltip').to.contain('direitos reais');
        // Até 2 linhas: a altura não passa de duas vezes o corpo da fonte com folga para o espaçamento.
        expect(ementa.clientHeight, 'altura de até 2 linhas').to.be.at.most(parseFloat(estilo.fontSize) * 2 * 1.8);
      });
    cy.get(linha('prl-1-csaude-substitutivo')).within(() => {
      cy.get('.np-doc-titulo').next().should('have.class', 'np-doc-ementa');
    });
  });

  it('o filtro alcança a ementa', () => {
    irParaTela2b();
    cy.get('#np-docs-filtro').shadow().find('input').type('garantias reais sobre bens móveis');
    cy.get(`${LISTA} .np-doc`).should('have.length', 1);
    cy.get(linha('pl-480-2025-apensado')).should('exist');
  });

  it('documento sem ementa não tem o bloco, e sem urlDocumento não tem o ícone', () => {
    irParaTela2b();
    cy.get(linha('pl-117-2025-apensado')).should('exist').find('.np-doc-ementa').should('not.exist');
    cy.get(linha('pl-117-2025-apensado')).find('a.np-doc-link').should('exist');
    cy.get(linha('pl-480-2025-apensado')).find('a.np-doc-link').should('not.exist');
  });

  it('o ícone usa o tooltip do host quando informado e o texto padrão quando não', () => {
    irParaTela2b();
    cy.get(`${linha('prl-1-ccjc-parecer')} a.np-doc-link`)
      .should('have.attr', 'title', 'Abrir o parecer na íntegra em outra aba')
      .and('have.attr', 'aria-label', 'Abrir o parecer na íntegra em outra aba')
      .and('have.attr', 'target', '_blank');
    cy.get(`${linha('pl-4-2025-original')} a.np-doc-link`)
      .should('have.attr', 'title', 'Abrir o documento em outra aba')
      .and('have.attr', 'aria-label', 'Abrir o documento em outra aba');
  });
});
