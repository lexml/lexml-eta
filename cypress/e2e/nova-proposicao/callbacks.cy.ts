export {};

/**
 * Callbacks opcionais na configuração do componente de nova proposição (OpenSpec 2026-11-06-c03).
 *
 * O componente nasce configurado com as URLs da demo; cada teste substitui `config` do elemento por callbacks
 * (cy.stub) mais as mesmas URLs, para provar que o callback prevalece. O texto devolvido pelos callbacks é o
 * JSONIX do backend simulado da demo, obtido pelo próprio teste (cy.request não passa pelo cy.intercept do app).
 * Apoio: cypress/support/nova-proposicao.ts. Ver docs/guia-cypress.md (§8, acesso ao elemento pelo `cy.document()`).
 */
import { digitarEmSl, escolherItemLista, marcarRadioSl } from '../../support/nova-proposicao';

const BOTAO_NOVA = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL = '#dialogNovaProposicao';
const URL_TEXTO_PL_5008 = '/demo-api/proposicoes/PL/5008/2023/texto';
const EMENTA_CALLBACK = 'Ementa devolvida pelo callback E2E';
const COMISSOES_CALLBACK = [{ siglaCasaLegislativa: 'SF', sigla: 'CBX', nome: 'Comissão do callback E2E' }];

const URLS_DA_DEMO = {
  urlVerificacaoProposicao: '/demo-api/proposicoes/{sigla}/{numero}/{ano}',
  urlTextoEstruturado: '/demo-api/proposicoes/{sigla}/{numero}/{ano}/texto',
  urlComissoes: '/demo-api/comissoes/{casa}',
};

const abrirModal = (): void => {
  cy.get(BOTAO_NOVA).click();
  cy.get(`${MODAL}[open]`).should('exist');
  cy.get('#np-g1').should('be.visible');
};

// Reconfigura o elemento já aberto (a atribuição reinicia o componente na Tela 1).
const configurarComCallbacks = (callbacks: Record<string, unknown>): void => {
  cy.document().then(doc => {
    const el = doc.querySelector('lexml-nova-proposicao') as any;
    el.config = { casaLegislativaEditor: 'SF', ...URLS_DA_DEMO, ...callbacks };
  });
  cy.get('#np-g1').should('be.visible');
};

const textoDoBackendDaDemo = (): Cypress.Chainable<unknown> => cy.request(new URL(URL_TEXTO_PL_5008, Cypress.config('baseUrl') as string).href).its('body');

const irParaTelaDeImportacao = (): void => {
  escolherItemLista('#np-sigla-proposicao', 'PL');
  cy.get('#np-continuar').click();
  marcarRadioSl('opcaoTexto', 'importar');
};

describe('Nova proposição — callbacks opcionais na configuração', () => {
  let urlsDaDemoChamadas: string[];

  beforeEach(() => {
    urlsDaDemoChamadas = [];
    cy.visit('/');
    cy.intercept('GET', '**/demo-api/**', req => {
      urlsDaDemoChamadas.push(req.url);
    });
  });

  it('substitutivo: ementa, comissão e texto vêm dos callbacks e nenhuma URL da demo é chamada', () => {
    textoDoBackendDaDemo().then(texto => {
      const onVerificarProposicao = cy.stub().as('verificar').returns({ ementa: EMENTA_CALLBACK, textoEstruturadoDisponivel: true });
      const onObterTexto = cy.stub().as('texto').returns(texto);
      const onObterComissoes = cy.stub().as('comissoes').returns(COMISSOES_CALLBACK);

      abrirModal();
      configurarComCallbacks({ onVerificarProposicao, onObterTexto, onObterComissoes });
      marcarRadioSl('especie', 'substitutivo');
      escolherItemLista('#np-sigla-proposicao', 'PL');
      digitarEmSl('#np-numero-proposicao', '0005008');
      digitarEmSl('#np-ano-proposicao', '2023');
      cy.get('#np-proposicao-verificar').click();
      cy.get('#np-proposicao-ementa').should('have.text', EMENTA_CALLBACK);
      escolherItemLista('#np-comissao', 'CBX');
      cy.get('#np-continuar').click();
      cy.get('sl-radio[name="opcaoTexto"][value="referenciado"]').should('have.prop', 'checked', true);
      cy.get('#np-continuar').click();

      cy.get(`${MODAL}[open]`).should('not.exist');
      cy.getContainerArtigoByNumero(1).should('exist');
      cy.get('@verificar').should('have.been.calledOnce').its('firstCall.args.0').should('deep.equal', { sigla: 'PL', numero: '5008', ano: '2023' });
      cy.get('@texto').should('have.been.calledOnce').its('firstCall.args.0').should('deep.equal', { sigla: 'PL', numero: '5008', ano: '2023' });
      cy.get('@comissoes').its('firstCall.args.0').should('equal', 'SF');
      cy.then(() => expect(urlsDaDemoChamadas, 'URLs da demo chamadas').to.deep.equal([]));
    });
  });

  it('verificação sem resultado informa que o documento não foi encontrado', () => {
    abrirModal();
    configurarComCallbacks({ onVerificarProposicao: cy.stub().returns(undefined) });
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    digitarEmSl('#np-numero-proposicao', '5008');
    digitarEmSl('#np-ano-proposicao', '2023');
    cy.get('#np-proposicao-verificar').click();
    cy.get('#np-nao-encontrado').should('exist');
    cy.get('#np-continuar').should('have.attr', 'disabled');
    cy.then(() =>
      expect(
        urlsDaDemoChamadas.filter(u => u.includes('/demo-api/proposicoes/')),
        'verificações pela URL'
      ).to.deep.equal([])
    );
  });

  it('falha no callback de comissões deixa só o Plenário', () => {
    abrirModal();
    configurarComCallbacks({ onObterComissoes: cy.stub().rejects(new Error('falha simulada')) });
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    cy.get('#np-erro-comissoes').should('exist');
    cy.get('sl-radio[name="destino"][value="Comissão"]').should('have.attr', 'disabled');
    cy.get('sl-radio[name="destino"][value="Plenário"]').should('have.prop', 'checked', true);
  });

  it('importação: o arquivo é entregue ao callback e o texto devolvido cria o documento', () => {
    textoDoBackendDaDemo().then(texto => {
      const onImportarArquivo = cy.stub().as('importar').returns({ texto, erros: [] });

      abrirModal();
      configurarComCallbacks({ onImportarArquivo });
      irParaTelaDeImportacao();
      cy.get('#np-arquivo').selectFile({ contents: Cypress.Buffer.from('texto'), fileName: 'minuta.docx' }, { force: true });
      cy.get('#np-continuar').click();

      cy.get(`${MODAL}[open]`).should('not.exist');
      cy.getContainerArtigoByNumero(1).should('exist');
      cy.get('@importar').should('have.been.calledOnce').its('firstCall.args.0.name').should('equal', 'minuta.docx');
      // As comissões seguem pela URL (origem sem callback); a importação não consulta verificação nem texto.
      cy.then(() =>
        expect(
          urlsDaDemoChamadas.filter(u => u.includes('/demo-api/proposicoes/')),
          'consultas de proposição pela URL'
        ).to.deep.equal([])
      );
    });
  });

  it('importação: falha de comunicação permanece na Tela 2 e erros do conversor levam à Tela 3', () => {
    const onImportarArquivo = cy.stub();
    onImportarArquivo.onFirstCall().rejects(new Error('falha simulada'));
    onImportarArquivo.onSecondCall().returns({ erros: ['Erro do conversor E2E'] });

    abrirModal();
    configurarComCallbacks({ onImportarArquivo });
    irParaTelaDeImportacao();
    cy.get('#np-arquivo').selectFile({ contents: Cypress.Buffer.from('texto'), fileName: 'minuta.txt' }, { force: true });
    cy.get('#np-continuar').click();
    cy.get('#np-erro-texto').should('contain.text', 'Não foi possível converter o arquivo');
    cy.get('#np-arquivo').should('exist');

    cy.get('#np-continuar').click();
    cy.get('#np-erros-titulo').should('contain.text', 'minuta.txt');
    cy.get('#np-erros').should('contain.text', 'Erro do conversor E2E');
  });

  it('arquivo recusado não chega ao callback de importação', () => {
    const onImportarArquivo = cy.stub().as('importar');

    abrirModal();
    configurarComCallbacks({ onImportarArquivo });
    irParaTelaDeImportacao();
    cy.get('#np-arquivo').selectFile({ contents: Cypress.Buffer.alloc(5 * 1024 * 1024 + 1), fileName: 'grande.docx' }, { force: true });
    cy.get('#np-erro-arquivo').should('contain.text', '5 MB');
    cy.get('#np-continuar').should('have.attr', 'disabled');
    cy.get('@importar').should('not.have.been.called');
  });
});
