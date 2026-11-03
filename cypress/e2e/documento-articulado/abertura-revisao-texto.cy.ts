/**
 * Abertura de documento articulado com marcas de revisão de texto na justificação.
 *
 * Cobre, pela UI real, a change 2026-10-22-c01-salvar-abrir-revisoes-texto-justificacao (issue #994).
 * Fixture: demo/doc/teste_revisao_texto.json, gerado por getDocumentoArticulado() com o Quill real, não escrito à mão:
 * uma inclusão, uma substituição e uma exclusão que atravessa um negrito e contém uma nota de rodapé.
 * Sem download (sem precedente no projeto). O agrupamento ao rejeitar pela dica fica no teste de componente
 * (passar o mouse sobre a marca é frágil no Cypress).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_revisao_texto.json';
const PENDENCIA = 'Resolver marcas de revisão de texto.';
const MENSAGEM_REVISAO = 'Este documento contém marcas de revisão';

const SEL_EDITOR = '#lexml-eta-editor-texto-rico-justificativa';
const SEL_TEXTO = `${SEL_EDITOR}-inner > .ql-editor`;
const SEL_MARCAS = `${SEL_TEXTO} ins, ${SEL_TEXTO} del`;

// Lê o shadow root inteiro: sem alertas não há nenhum sl-alert para o find.
const textoDosAlertas = ($el: JQuery<HTMLElement>): string => $el[0].shadowRoot?.textContent ?? '';

const lexedit = (documento: any): any => documento.value.metadado.metadadoProprietario?.[0].any[0].value ?? {};

const abrirFixture = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get(SEL_TEXTO).should('contain.text', 'consolida as regras de');
};

describe('Abertura de revisões de texto persistidas na justificação', () => {
  beforeEach(() => {
    cy.visit('/');
    // Abrir texto com marcas liga o modo de revisão, que exibe o aviso "Marcas de revisão".
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  });

  it('exibe as marcas com o autor do arquivo, o contador de revisões e o alerta de marcas de revisão', () => {
    abrirFixture();
    cy.get('sl-tab[panel="justificativa"]').click();

    cy.get(SEL_MARCAS).should('have.length', 5);
    cy.get(SEL_MARCAS).then($marcas => {
      const marcas = $marcas.toArray();
      expect(marcas.map(m => m.tagName)).to.deep.equal(['INS', 'DEL', 'INS', 'DEL', 'DEL']);
      marcas.forEach(m => {
        expect(m.getAttribute('usuario')).to.equal('Fulano de Tal');
        expect(m.getAttribute('id-usuario')).to.equal('sf:fulano');
        expect(m.getAttribute('sigla-usuario')).to.equal('FT');
      });
    });
    cy.get(SEL_TEXTO)
      .find('del')
      .filter((_, el) => !!el.closest('b, strong') || !!el.querySelector('b, strong'))
      .should('contain.text', 'o regime anterior');
    cy.get(`${SEL_TEXTO} del lexml-eta-nota-rodape`).should('have.length', 1);

    // Grupos: inclusão, exclusão e inclusão da substituição, exclusão em dois trechos.
    cy.get('#badge-marca-alteracao-justificativa').should('have.text', '4');
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).to.include(MENSAGEM_REVISAO));
  });

  it('salvar o documento aberto devolve a mesma Justificacao, RevisoesTextuais e Usuarios do arquivo', () => {
    abrirFixture();

    cy.readFile(FIXTURE).then(arquivo => {
      cy.get('lexml-eta').should($el => {
        const documento = ($el[0] as any).getDocumentoArticulado();
        expect(documento.value.projetoNorma.justificacao).to.deep.equal(arquivo.value.projetoNorma.justificacao);
        expect(lexedit(documento).revisoesTextuais).to.deep.equal(lexedit(arquivo).revisoesTextuais);
        expect(lexedit(documento).usuarios).to.deep.equal(lexedit(arquivo).usuarios);
        expect(lexedit(documento).pendencias.pendencia).to.include(PENDENCIA);
      });
    });
  });

  it('aceitar todas as revisões da justificação deixa o editor sem marcas e o documento sem RevisoesTextuais nem a pendência', () => {
    abrirFixture();
    cy.get('sl-tab[panel="justificativa"]').click();
    cy.get(SEL_MARCAS).should('have.length', 5);

    cy.get(`${SEL_EDITOR} sl-button.aceitar-revisao`).should('not.have.attr', 'disabled');
    cy.get(`${SEL_EDITOR} sl-button.aceitar-revisao`).click();

    cy.get(SEL_MARCAS).should('not.exist');
    cy.get(SEL_TEXTO).should('contain.text', 'atualiza e consolida as regras de aquisição pública.');
    cy.get(SEL_TEXTO).should('not.contain.text', 'contratação');
    cy.get(SEL_TEXTO).should('not.contain.text', 'o regime anterior');
    cy.get('lexml-eta').should($el => {
      const documento = ($el[0] as any).getDocumentoArticulado();
      expect(JSON.stringify(documento.value.projetoNorma.justificacao)).not.to.match(/"localPart":"(ins|del)"/);
      expect(lexedit(documento)).not.to.have.property('revisoesTextuais');
      expect(lexedit(documento).pendencias?.pendencia ?? []).not.to.include(PENDENCIA);
    });
  });
});
