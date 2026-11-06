export {};

/**
 * Alteração dos dados básicos da proposição em edição pela demo — issue #1051.
 *
 * O documento é criado pelo modal de nova proposição (as fixtures com autoria e justificação usam PLS, sigla
 * inativa que o modo de edição não oferece). O grupo "Dados básicos" fica no shadow DOM de
 * lexml-eta-dados-basicos; o arquivo salvo é lido do blob capturado em URL.createObjectURL.
 */
import { digitarEmSl, escolherComissao, escolherItemLista, marcarRadioSl } from '../../support/nova-proposicao';

const BOTAO_NOVA_DB = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL_DB = '#dialogNovaProposicao';
const GRUPO_DB = 'lexml-eta-dados-basicos';

const davi = { identificacao: '5012', nome: 'Davi Alcolumbre', sexo: 'M', siglaPartido: 'UNIÃO', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: '' };

const abrirModal = (): void => {
  cy.get(BOTAO_NOVA_DB).click();
  cy.get(`${MODAL_DB}[open]`).should('exist');
  cy.get('#np-g1').should('be.visible');
};

const criarPl = (): void => {
  abrirModal();
  escolherItemLista('#np-sigla-proposicao', 'PL');
  cy.get('#np-continuar').click();
  cy.get('#np-continuar').click();
  cy.get(`${MODAL_DB}[open]`).should('not.exist');
  cy.getContainerArtigoByNumero(1).should('exist');
};

// Substitutivo do PL 5008/2023 em comissão: traz o texto do documento referenciado.
const criarSubstitutivoComTexto = (): void => {
  abrirModal();
  marcarRadioSl('especie', 'substitutivo');
  escolherItemLista('#np-sigla-proposicao', 'PL');
  digitarEmSl('#np-numero-proposicao', '5008');
  digitarEmSl('#np-ano-proposicao', '2023');
  cy.get('#np-proposicao-verificar').click();
  cy.get('#np-proposicao-ementa').invoke('text').should('not.be.empty');
  escolherComissao('CCJ');
  cy.get('#np-continuar').click();
  cy.get('#np-continuar').click();
  cy.get(`${MODAL_DB}[open]`).should('not.exist');
  cy.getContainerArtigoByNumero(1).should('exist');
};

const grupo = (seletor: string): Cypress.Chainable => cy.get(GRUPO_DB).shadow().find(seletor);

const abrirAlteracao = (): void => {
  cy.get('sl-tab[panel="autoria"]').click();
  grupo('#botao-alterar-dados-basicos').click();
  cy.get(`${MODAL_DB}[open]`).should('exist');
  cy.get('#np-titulo').should('have.text', 'Alterar dados básicos');
};

const confirmarPerda = (mensagem: string): void => {
  cy.get('#np-continuar').click();
  cy.get('#np-confirmacao[open]').should('contain.text', mensagem);
  cy.get('#np-confirmar-sim').click();
  cy.get(`${MODAL_DB}[open]`).should('not.exist');
};

describe('Alteração de dados básicos pela demo', () => {
  const arquivosSalvos: Promise<string>[] = [];

  const lerSalvo = (): Cypress.Chainable<any> => {
    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));
    return cy
      .wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => JSON.parse(conteudo as string));
  };

  const lexedit = (arquivo: any): any => arquivo.value.metadado.metadadoProprietario[0].any[0].value;

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
  });

  it('exibe o grupo "Dados básicos" no início da aba "Dados da proposição"', () => {
    criarPl();
    cy.get('sl-tab[panel="autoria"]').should('contain.text', 'Dados da proposição').click();
    grupo('legend').should('have.text', 'Dados básicos');
    grupo('#dados-basicos-descricao').should('have.text', 'Projeto de Lei (PL)');
    grupo('#dados-basicos-colegiado').should('contain.text', 'Plenário');
    grupo('#dados-basicos-parecer').should('contain.text', 'Não');
    grupo('#botao-alterar-dados-basicos').should('not.have.attr', 'disabled');
  });

  it('alterar o colegiado preserva o texto', () => {
    criarSubstitutivoComTexto();
    cy.getContainerArtigoByNumero(1)
      .getTextoDoDispositivo()
      .then(textoAntes => {
        expect(textoAntes.trim()).to.not.be.empty;
        abrirAlteracao();
        marcarRadioSl('destino', 'Plenário');
        cy.get('#np-continuar').click();
        cy.get(`${MODAL_DB}[open]`).should('not.exist');

        grupo('#dados-basicos-colegiado').should('contain.text', 'Plenário');
        cy.getContainerArtigoByNumero(1).getTextoDoDispositivo().should('equal', textoAntes);
        lerSalvo().then(arquivo => expect(lexedit(arquivo).colegiadoApreciador).to.include({ tipoColegiado: 'Plenário' }));
      });
  });

  it('trocar para tipo de outra casa descarta a autoria', () => {
    criarPl();
    cy.get('lexml-eta-autoria').then($autoria => {
      ($autoria[0] as any).autoria = { tipo: 'Parlamentar', imprimirPartidoUF: true, parlamentares: [davi] };
    });
    cy.get('lexml-eta-autoria')
      .shadow()
      .find('lexml-eta-autocomplete')
      .should($ac => expect(($ac[0] as any).value).to.equal('Davi Alcolumbre'));

    abrirAlteracao();
    escolherItemLista('#np-sigla-proposicao', 'PLV');
    digitarEmSl('#np-numero-mpv', '1089');
    digitarEmSl('#np-ano-mpv', '2021');
    cy.get('#np-mpv-verificar').click();
    cy.get('#np-mpv-ementa').invoke('text').should('not.be.empty');
    confirmarPerda('Ao alterar para um tipo de outra casa legislativa a autoria informada será perdida. Deseja continuar?');

    cy.get('lexml-eta-autoria')
      .shadow()
      .find('lexml-eta-autocomplete')
      .should('have.length', 1)
      .should($ac => expect(($ac[0] as any).value ?? '').to.equal(''));
    lerSalvo().then(arquivo => {
      expect(arquivo.value.metadado.identificacao.urn).to.contain('congresso.nacional:projeto.lei.conversao;plv:');
      expect(lexedit(arquivo)).to.not.have.property('autoria');
    });
  });

  it('passar a anexo de parecer descarta a justificação', () => {
    criarPl();
    cy.get('sl-tab[panel="justificativa"]').click();
    cy.get('#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor').should('be.visible').focus().type('Justificação a descartar.', { delay: 0 });
    cy.get('#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor').should('contain.text', 'Justificação a descartar.');

    abrirAlteracao();
    cy.get('#np-anexo-parecer').shadow().find('input').click({ force: true });
    cy.get('#np-anexo-parecer').should('have.prop', 'checked', true);
    confirmarPerda('Ao apresentar o documento em parecer, a justificação informada será perdida. Deseja continuar?');

    grupo('#dados-basicos-parecer').should('contain.text', 'Sim');
    cy.get('sl-tab[panel="justificativa"]').should('not.exist');
    lerSalvo().then(arquivo => {
      expect(lexedit(arquivo).anexoParecer).to.equal(true);
      expect(arquivo.value.projetoNorma).to.not.have.property('justificacao');
    });
  });

  it('desabilita o botão em modo de revisão, com a mensagem abaixo dele', () => {
    criarPl();
    cy.ativarRevisaoDispositivo();
    cy.get('sl-tab[panel="autoria"]').click();
    grupo('#botao-alterar-dados-basicos').should('have.attr', 'disabled');
    grupo('#dados-basicos-aviso').should('have.text', 'Os dados básicos não podem ser alterados em modo de revisão.');
    cy.get('sl-tab[panel="lexml-eta-proposicao"]').click();
    cy.desativarRevisaoDispositivo();
  });
});
