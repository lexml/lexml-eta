/**
 * Abertura de documento articulado com comentários na justificação.
 *
 * Cobre, pela UI real, a change 2026-11-03-c03-salvar-abrir-comentarios-justificacao (issue #972).
 * Fixture: demo/doc/teste_comentarios.json, gerada por getDocumentoArticulado() com o Quill real, não escrita à mão:
 * um trecho em dois parágrafos (dois fragmentos) e uma resposta de outro usuário.
 * O salvamento captura o blob de URL.createObjectURL (precedente: titulo-dispositivo.cy.ts).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_comentarios.json';
const ALERTA = 'Este documento contém comentários e não deve ser protocolado até que sejam removidos.';
const PENDENCIA = 'Remover comentários.';

const SEL_EDITOR = '#lexml-eta-editor-texto-rico-justificativa';
const SEL_TEXTO = `${SEL_EDITOR}-inner > .ql-editor`;
const SEL_CARD = 'lexml-eta-comentarios .comentario-sequencia';

const lexedit = (documento: any): any => documento.value.metadado.metadadoProprietario?.[0].any[0].value ?? {};

// Os alertas ficam no shadow root de lexml-eta-alertas.
const conferirAlerta = (): void => {
  cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').to.include(ALERTA));
};

const abrir = (opcoes: string | { contents: Buffer; fileName: string }): void => {
  cy.get('#fileUpload').selectFile(opcoes, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get('sl-tab[panel="justificativa"]').click();
  cy.get(SEL_TEXTO).should('contain.text', 'Segundo parágrafo do texto.');
};

// Dois fragmentos destacados, a sequência com os dois autores e o alerta.
const conferirComentarios = (): void => {
  cy.get(`${SEL_TEXTO} comentario`).should($trechos => {
    expect($trechos.toArray().map(t => t.textContent)).to.deep.equal(['parágrafo do texto.', 'Segundo parágrafo']);
  });
  cy.get(SEL_CARD).should('have.length', 1);
  cy.get(`${SEL_CARD} .comentario-item__autor`).should($autores => {
    expect($autores.toArray().map(a => a.textContent)).to.deep.equal(['Fulano de Tal', 'Ciclano de Tal']);
  });
  cy.get(`${SEL_CARD} .comentario-item__texto`).should($textos => {
    const textos = $textos.toArray().map(t => t.textContent ?? '');
    expect(textos[0]).to.include('Revisar a redação.').and.to.include('Conferir a fonte.');
    expect(textos[1]).to.equal('De acordo.');
  });
  conferirAlerta();
};

describe('Abertura de comentários persistidos na justificação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  });

  it('exibe o trecho nos dois parágrafos, a sequência com os dois autores e o alerta', () => {
    abrir(FIXTURE);
    conferirComentarios();
  });

  it('salvar o documento aberto devolve a mesma sequência e a pendência', () => {
    abrir(FIXTURE);

    cy.readFile(FIXTURE).then(arquivo => {
      cy.get('lexml-eta').should($el => {
        const documento = ($el[0] as any).getDocumentoArticulado();
        expect(lexedit(documento).comentarios.sequenciaComentario).to.deep.equal(lexedit(arquivo).comentarios.sequenciaComentario);
        expect(lexedit(documento).pendencias.pendencia).to.include(PENDENCIA);
        expect(JSON.stringify(documento.value.projetoNorma.justificacao)).to.equal(JSON.stringify(arquivo.value.projetoNorma.justificacao));
      });
    });
  });

  it('salvar pelo botão, reabrir o arquivo gerado e conferir a mesma sequência', () => {
    const arquivosSalvos: Promise<string>[] = [];
    cy.window().then(win => {
      const criarOriginal = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, 'createObjectURL').callsFake((obj: Blob) => {
        arquivosSalvos.push(obj.text());
        return criarOriginal(obj);
      });
    });

    abrir(FIXTURE);
    conferirComentarios();

    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));

    cy.wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => {
        cy.visit('/');
        cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
        abrir({ contents: Cypress.Buffer.from(conteudo as string), fileName: 'comentarios-salvo.json' });
      });

    conferirComentarios();
  });
});
