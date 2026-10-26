/**
 * Anexos da proposição: aba "Anexos", importação, ordem, exclusão e ida e volta pelo arquivo salvo.
 *
 * Cobre, pela UI real, a change 2026-10-23-c01-anexos-proposicao. A demo implementa os callbacks do host
 * com um Map em memória (demo/components/demoview.ts). Fixture: demo/doc/teste_anexos.json, derivada de
 * teste_outros_metadados.json, com três anexos no formato que o montador grava.
 */
export {};

const ABA = 'lexml-eta sl-tab[panel="anexos"]';
const LINHA = 'lexml-eta-anexos .anexo';

const NOMES_ARQUIVO = ['Parecer da Comissão.pdf', 'Emenda Nº 4 - CCJ.docx', 'Relatório final.pdf'];

const abrirAba = (): void => {
  cy.get(ABA).click();
  cy.get(LINHA).should('have.length.at.least', 0);
};

const nomesDosArquivos = (): Cypress.Chainable<string[]> =>
  cy.get(`${LINHA} .anexo-nome-arquivo`).then($el => Array.from($el).map(el => el.textContent!.replace('Anexo', '').trim()));

const escolherTipoNoDialogo = (codigo: string): void => {
  cy.get('#select-tipo-anexo').click();
  cy.get(`#select-tipo-anexo sl-menu-item[value="${codigo}"]`).click({ force: true });
};

const importar = (nome: string, mimeType: string, tipo = 'emenda'): void => {
  cy.get('#btn-importar-anexo').click();
  cy.get('#input-arquivo-anexo').selectFile({ contents: Cypress.Buffer.from('conteudo de teste'), fileName: nome, mimeType }, { force: true });
  escolherTipoNoDialogo(tipo);
  cy.get('#btn-confirmar-importacao').click();
};

describe('Anexos da proposição', () => {
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
    cy.get('#fileUpload').selectFile('demo/doc/teste_anexos.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    abrirAba();
  });

  it('exibe os anexos do arquivo, na ordem, com o tipo e o contador no rótulo da aba', () => {
    cy.get(ABA).should('contain.text', 'Anexos (3)');
    cy.get(LINHA).should('have.length', 3);
    nomesDosArquivos().should('deep.equal', NOMES_ARQUIVO);
    cy.get(`${LINHA} .anexo-tipo`).then($tipos => {
      expect(Array.from($tipos).map(el => (el as any).value)).to.deep.equal(['substitutivo', 'outro', 'emenda']);
    });
    cy.get(`${LINHA}:eq(1) .btn-visualizar`).should('have.prop', 'disabled', true);
  });

  it('importa um PDF, que entra no fim da lista e atualiza o contador', () => {
    importar('novo anexo.pdf', 'application/pdf');

    cy.get(LINHA).should('have.length', 4);
    nomesDosArquivos().should('deep.equal', [...NOMES_ARQUIVO, 'novo anexo.pdf']);
    cy.get(ABA).should('contain.text', 'Anexos (4)');
    cy.get(`${LINHA}:eq(3) .anexo-nome-documento`).should('have.prop', 'value', 'novo anexo');
  });

  it('recusa um arquivo de formato não aceito, sem alterar a lista', () => {
    cy.get('#btn-importar-anexo').click();
    cy.get('#input-arquivo-anexo').selectFile({ contents: Cypress.Buffer.from('x'), fileName: 'planilha.xlsx', mimeType: 'application/vnd.ms-excel' }, { force: true });
    escolherTipoNoDialogo('emenda');

    cy.get('#btn-confirmar-importacao').should('have.prop', 'disabled', true);
    cy.get('#alertaInfo').should('exist');
    cy.get(LINHA).should('have.length', 3);
  });

  it('reordena os anexos', () => {
    cy.get(`${LINHA}:eq(0) .btn-descer`).click();

    nomesDosArquivos().should('deep.equal', [NOMES_ARQUIVO[1], NOMES_ARQUIVO[0], NOMES_ARQUIVO[2]]);
  });

  it('exclui um anexo', () => {
    cy.get(`${LINHA}:eq(0) .btn-excluir`).click();

    cy.get(LINHA).should('have.length', 2);
    nomesDosArquivos().should('deep.equal', [NOMES_ARQUIVO[1], NOMES_ARQUIVO[2]]);
    cy.get(ABA).should('contain.text', 'Anexos (2)');
  });

  it('salva a lista alterada sem o conteúdo dos arquivos e a reabre na mesma ordem', () => {
    importar('novo anexo.pdf', 'application/pdf');
    cy.get(LINHA).should('have.length', 4);
    cy.get(`${LINHA}:eq(0) .btn-excluir`).click();
    cy.get(LINHA).should('have.length', 3);
    cy.get(`${LINHA}:eq(2) .btn-subir`).click();

    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));

    cy.wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => {
        const texto = conteudo as string;
        const salvo = JSON.parse(texto);
        const anexos = salvo.value.metadado.metadadoProprietario[0].any[0].value.anexos.anexo;
        expect(anexos.map((a: { nomeArquivo: string }) => a.nomeArquivo)).to.deep.equal(['Emenda Nº 4 - CCJ.docx', 'novo anexo.pdf', 'Relatório final.pdf']);
        expect(anexos[1]).to.include({ idArquivo: 'demo-1', mimeType: 'application/pdf' });
        expect(texto).not.to.include('conteudo de teste');

        cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(texto), fileName: 'salvo.json' }, { force: true });
      });

    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get(LINHA).should('have.length', 3);
    nomesDosArquivos().should('deep.equal', ['Emenda Nº 4 - CCJ.docx', 'novo anexo.pdf', 'Relatório final.pdf']);
  });
});
