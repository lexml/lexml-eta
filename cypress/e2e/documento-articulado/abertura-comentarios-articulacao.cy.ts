/**
 * Abertura de documento articulado com comentários na articulação e na justificação.
 *
 * Cobre, pela UI real, a change 2026-11-08-c02-salvar-abrir-comentarios-articulacao (issue #972).
 * Fixture: demo/doc/teste_comentarios_articulacao.json, gerada por getDocumentoArticulado() com o componente real,
 * não escrita à mão: comentários no art. 1º, no inciso I do art. 1º, no parágrafo único (excluído em revisão)
 * e num trecho da justificação.
 * O salvamento captura o blob de URL.createObjectURL (precedente: abertura-comentarios.cy.ts).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_comentarios_articulacao.json';
const ALERTA = 'Este documento contém comentários e não deve ser protocolado até que sejam removidos.';
const SEL_CARD = 'lexml-eta-comentarios .comentario-sequencia';
const SEL_ICONE = '#lx-eta-editor .blot__opcoes_comentario';

const lexedit = (documento: any): any => documento.value.metadado.metadadoProprietario?.[0].any[0].value ?? {};

const abrir = (opcoes: string | { contents: ReturnType<typeof Cypress.Buffer.from>; fileName: string }): void => {
  cy.get('#fileUpload').selectFile(opcoes, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
};

// Três ícones na articulação (artigo, inciso e o parágrafo excluído em revisão), quatro sequências e o alerta.
const conferirComentarios = (): void => {
  cy.get(SEL_ICONE).should('have.length', 3);
  cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('.blot__opcoes_comentario').should('exist');
  cy.get(SEL_CARD).should('have.length', 4);
  cy.get(`${SEL_CARD} .comentario-sequencia__origem`).should($origens => {
    expect($origens.toArray().map(o => o.textContent)).to.deep.equal(['No texto', 'No texto', 'No texto', 'Na justificação']);
  });
  cy.get(`${SEL_CARD} .comentario-sequencia__trecho-texto`).should($trechos => {
    expect(
      $trechos
        .toArray()
        .slice(0, 3)
        .map(t => t.textContent)
    ).to.deep.equal(['art. 1º', 'inciso I do art. 1º', 'parágrafo único do art. 1º']);
  });
  cy.get(`${SEL_CARD} .comentario-item__texto`).should($textos => {
    expect($textos.toArray().map(t => t.textContent)).to.deep.equal(['Comentário no artigo', 'Comentário no inciso', 'Comentário no parágrafo', 'Comentário na justificação']);
  });
  cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').to.include(ALERTA));
};

describe('Abertura de comentários persistidos na articulação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  });

  it('exibe os ícones, as sequências com local e identificação, e o alerta', () => {
    abrir(FIXTURE);
    conferirComentarios();
  });

  it('salvar o documento aberto devolve os mesmos refs e comentários', () => {
    abrir(FIXTURE);
    conferirComentarios();

    cy.readFile(FIXTURE).then(arquivo => {
      cy.get('lexml-eta').should($el => {
        const documento = ($el[0] as any).getDocumentoArticulado();
        const resumo = (doc: any): string[][] =>
          lexedit(doc).comentarios.sequenciaComentario.map((s: any) => [s.refIdElementoComentado.replace(/^_tc.*_1$/, '_tc_1'), s.comentario[0].p[0].content[0]]);
        expect(resumo(documento)).to.deep.equal(resumo(arquivo));
        expect(lexedit(documento).pendencias.pendencia).to.include('Remover comentários.');
      });
    });
  });

  it('salvar pelo botão, reabrir o arquivo gerado e conferir os mesmos comentários', () => {
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
        abrir({ contents: Cypress.Buffer.from(conteudo as string), fileName: 'comentarios-articulacao-salvo.json' });
      });

    conferirComentarios();
  });
});
