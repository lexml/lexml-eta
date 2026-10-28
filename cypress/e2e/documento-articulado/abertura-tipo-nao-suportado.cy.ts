/**
 * Abertura de documento de tipo "não suportado" (medida provisória, de autoridade `federal`).
 *
 * Cobre, pela UI real, a change 2026-10-27-c01-rever-interface-lexml-eta (#1016).
 * Sem fixture nova: demo/doc/teste_opcoes_impressao.json (gerada por criarDocumentoArticulado) é enviada com a
 * URN trocada em memória, como em abertura-documento-outra-casa.cy.ts. O salvamento real é viável: o download é
 * um blob capturado (padrão de abertura-outros-metadados.cy.ts), então a pendência é conferida no arquivo salvo.
 */
export {};

const ARQUIVO = 'demo/doc/teste_opcoes_impressao.json';
const URN_MPV = 'urn:lex:br:federal:medida.provisoria:2026;1';
const MENSAGEM = 'Este tipo de documento não é completamente suportado pelo editor.';

describe('Abertura de documento de tipo não suportado', () => {
  const arquivosSalvos: Promise<string>[] = [];

  beforeEach(() => {
    arquivosSalvos.length = 0;
    cy.visit('/');
    cy.window().then(win => {
      const criarOriginal = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, 'createObjectURL').callsFake((obj: Blob) => {
        arquivosSalvos.push(obj.text());
        return criarOriginal(obj);
      });
    });
    cy.readFile(ARQUIVO).then(documento => {
      documento.value.metadado.identificacao.urn = URN_MPV;
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'mpv.json' }, { force: true });
    });
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('não exibe os formulários de destino e de autoria', () => {
    cy.get('lexml-eta-destino').should('have.attr', 'hidden').and('not.be.undefined');
    cy.get('lexml-eta-autoria').should('have.attr', 'hidden').and('not.be.undefined');
    cy.get('lexml-eta-destino').should('not.be.visible');
    cy.get('lexml-eta-autoria').should('not.be.visible');
  });

  it('exibe o erro na aba de avisos', () => {
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', MENSAGEM);
  });

  it('permite editar e salvar, gravando a pendência e sem destino nem autoria', () => {
    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));

    cy.wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => {
        const lexedit = JSON.parse(conteudo as string).value.metadado.metadadoProprietario[0].any[0].value;
        expect(lexedit.pendencias.pendencia).to.include(MENSAGEM);
        expect(lexedit.autoria, 'autoria').to.equal(undefined);
        expect(lexedit.colegiadoApreciador, 'destino').to.equal(undefined);
      });
  });
});
