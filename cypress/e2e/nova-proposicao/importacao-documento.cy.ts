/**
 * Importação de documento pela Tela 2 da nova proposição (issue #1059).
 *
 * Cobre, pela UI real, a change 2026-11-13-c01-importar-documento-nova-proposicao contra o fake de conversão
 * da demo (POST /demo-api/importacao, demo/server/handlers.mjs), sem cy.intercept: XML devolve 200 com um
 * documento da demo, PDF devolve 500 e DOCX/TXT devolvem 400. O caso .json usa demo/doc/teste_justificacao.json,
 * gerado por getDocumentoArticulado(), com um anexo acrescentado em tempo de teste no formato do montador.
 */
import { marcarRadioSl, escolherItemLista } from '../../support/nova-proposicao';

const BOTAO_NOVA = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL = '#dialogNovaProposicao';
const FIXTURE_JSON = 'demo/doc/teste_justificacao.json';
const SEL_EDITOR_JUSTIFICACAO = '#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor';
const MENSAGEM_ANEXOS = 'Não foi possível recuperar os anexos do documento importado.';

// Lê o shadow root inteiro: sem alertas não há nenhum sl-alert para o find.
const textoDosAlertas = ($el: JQuery<HTMLElement>): string => $el[0].shadowRoot?.textContent || '';

const irParaImportacao = (): void => {
  cy.get(BOTAO_NOVA).click();
  cy.get(`${MODAL}[open]`).should('exist');
  cy.get('#np-g1').should('be.visible');
  escolherItemLista('#np-sigla-proposicao', 'PL');
  cy.get('#np-continuar').click();
  marcarRadioSl('opcaoTexto', 'importar');
};

const selecionar = (contents: ReturnType<typeof Cypress.Buffer.from>, fileName: string): void => {
  cy.get('#np-arquivo').selectFile({ contents, fileName }, { force: true });
  cy.get('#np-continuar').click();
};

const documentoEmEdicao = (verificar: (documento: any) => void): void => {
  cy.get('lexml-eta').should($el => verificar(($el[0] as any).getDocumentoArticulado()));
};

describe('Nova proposição — importação de documento', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('XML: o documento convertido pelo serviço preenche o editor, com a identidade da Tela 1', () => {
    irParaImportacao();
    selecionar(Cypress.Buffer.from('<LexML/>'), 'proposicao.xml');

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    documentoEmEdicao(documento => {
      expect(documento.value.metadado.identificacao.urn).to.match(/^urn:lex:br:senado\.federal:projeto\.lei;pl:\d{4};999999$/);
      expect(documento.value.projetoNorma.norma.parteInicial.ementa.content.join('')).to.contain('escassez hídrica');
    });
  });

  it('PDF: a falha do serviço mostra o alerta de erro e mantém a Tela 2', () => {
    irParaImportacao();
    selecionar(Cypress.Buffer.from('%PDF-1.4'), 'proposicao.pdf');

    cy.get('#np-erro-texto')
      .should('have.attr', 'variant', 'danger')
      .and('contain.text', 'Não foi possível converter o arquivo "proposicao.pdf": o serviço de conversão apresentou uma falha.')
      .and('not.contain.text', 'Falha interna.');
    cy.get('#np-arquivo').should('exist');
    cy.get('#np-continuar').should('not.have.attr', 'disabled');
  });

  it('DOCX e TXT: a recusa do serviço mostra o alerta de aviso com a mensagem devolvida', () => {
    irParaImportacao();
    selecionar(Cypress.Buffer.from('docx'), 'minuta.docx');

    cy.get('#np-aviso-importacao')
      .should('have.attr', 'variant', 'warning')
      .and('contain.text', 'O arquivo não pôde ser importado')
      .and('contain.text', 'Conversão de DOCX ou TXT não implementada.')
      .and('contain.text', 'Selecione outro arquivo ou escolha outra forma de iniciar o texto.');

    selecionar(Cypress.Buffer.from('texto'), 'minuta.txt');
    cy.get('#np-aviso-importacao').should('contain.text', 'Conversão de DOCX ou TXT não implementada.');
    cy.get(`${MODAL}[open]`).should('exist');
  });

  it('JSON: lido direto, cria o documento com a justificação do arquivo e avisa que os anexos não foram recuperados', () => {
    cy.readFile(FIXTURE_JSON).then(arquivo => {
      arquivo.value.metadado.metadadoProprietario[0].any[0].value.anexos = {
        TYPE_NAME: 'br_gov_lexml_lexedit__1.Anexos',
        anexo: [
          {
            TYPE_NAME: 'br_gov_lexml_lexedit__1.Anexo',
            idArquivo: 'arquivo-inexistente',
            nomeArquivo: 'anexo.pdf',
            nomeDocumento: 'Anexo',
            tipo: 'outro',
            mimeType: 'application/pdf',
          },
        ],
      };

      irParaImportacao();
      selecionar(Cypress.Buffer.from(JSON.stringify(arquivo)), 'proposicao.json');
    });

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    // Notificação passageira no canto superior, além do item na aba Avisos.
    cy.get('.sl-toast-stack sl-alert').should('have.attr', 'variant', 'warning').and('contain.text', MENSAGEM_ANEXOS);
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).to.include(MENSAGEM_ANEXOS));
    cy.get('sl-tab[panel="justificativa"]').click();
    cy.get(SEL_EDITOR_JUSTIFICACAO).should('contain.text', 'Ciência & Tecnologia');
    documentoEmEdicao(documento => {
      expect(documento.value.metadado.identificacao.urn).to.match(/projeto\.lei;pl:/);
      expect(documento.value.metadado.metadadoProprietario[0].any[0].value).not.to.have.property('anexos');
    });
  });
});
