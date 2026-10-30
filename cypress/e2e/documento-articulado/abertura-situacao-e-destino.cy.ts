/**
 * Abertura de documento articulado salvo com situação na norma vigente e colegiado apreciador.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-10-19-c01-metadados-lexedit-situacao-colegiado.
 * Fixture: demo/doc/teste_situacao_e_destino.json, gerada por criarDocumentoArticulado() (mesmo código
 * de produção usado ao salvar), não escrita à mão: bloco de alteração com o art. 5º existente e o
 * art. 6º novo, e destino Comissão (CCJ).
 */

describe('Abertura de situação na norma vigente e destino persistidos', () => {
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
    cy.get('#fileUpload').selectFile('demo/doc/teste_situacao_e_destino.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('restaura "Existente" e "Novo" nos dispositivos do bloco de alteração', () => {
    cy.getContainerArtigoNormaByNumero(5).should('have.attr', 'existenanormaalterada', 'true');
    cy.getContainerArtigoNormaByNumero(6).should('have.attr', 'existenanormaalterada', 'false');
  });

  it('não exibe formulário de destino e preserva a comissão do arquivo ao salvar', () => {
    cy.get('lexml-eta-destino').should('not.exist');
    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));

    cy.wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => {
        const lexedit = JSON.parse(conteudo as string).value.metadado.metadadoProprietario[0].any[0].value;
        expect(lexedit.colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
      });
  });
});
