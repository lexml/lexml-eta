/**
 * Abertura e salvamento de documento articulado com outros metadados do LexEdit.
 *
 * Cobre, pela UI real, a change 2026-10-21-c01-outros-metadados-lexedit.
 * Fixture: demo/doc/teste_outros_metadados.json, derivada de teste_situacao_e_destino.json (gerada por
 * criarDocumentoArticulado) com o grupo lexedit:OutrosMetadados no mesmo formato que o montador grava.
 */

const SEL_EDITOR = 'lexml-eta';

const ESPERADO = {
  tituloAntesDaEpigrafe: 'COMISSÃO XPTO',
  jsonDadosComissao: '{"id":1,"nome":"A & B <C>"}',
  vazio: '',
};

describe('Abertura e salvamento de outros metadados', () => {
  const arquivosSalvos: Promise<string>[] = [];

  beforeEach(() => {
    arquivosSalvos.length = 0;
    cy.visit('/');
    // O download é um blob: captura o conteúdo em vez de depender do diretório de downloads do navegador.
    cy.window().then(win => {
      const criarOriginal = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, 'createObjectURL').callsFake((obj: Blob) => {
        arquivosSalvos.push(obj.text());
        return criarOriginal(obj);
      });
    });
    cy.get('#fileUpload').selectFile('demo/doc/teste_outros_metadados.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('preenche a propriedade outrosMetadados com os pares do arquivo', () => {
    cy.get(SEL_EDITOR).should($el => {
      expect(($el[0] as any).outrosMetadados).to.deep.equal(ESPERADO);
    });
  });

  it('salvar grava os pares no lexedit:Metadado', () => {
    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));

    cy.wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => {
        const salvo = JSON.parse(conteudo as string);
        const pares = salvo.value.metadado.metadadoProprietario[0].any[0].value.outrosMetadados.outroMetadado;
        expect(pares.map((p: { chave: string; value: string }) => [p.chave, p.value])).to.deep.equal(Object.entries(ESPERADO));
      });
  });
});
