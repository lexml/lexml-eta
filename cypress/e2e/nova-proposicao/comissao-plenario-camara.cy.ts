/**
 * Comissão obrigatória no Plenário, na Câmara — change 2026-11-16-c02-comissao-obrigatoria-plenario-cd.
 *
 * Cobre, pela UI real, a regra da Tela 1: na CD, em substitutivo e subemenda substitutiva, o destino Plenário
 * também exige uma comissão, e o arquivo salvo traz `lexedit:ColegiadoApreciador` Plenário com `siglaComissao`.
 * O salvamento é conferido pelo blob capturado em URL.createObjectURL (padrão de nova-proposicao.cy.ts).
 * Proposição na CD e substitutivo no SF seguem sem comissão no Plenário.
 */
import { deveEstarDesabilitado, deveEstarHabilitado, digitarEmSl, escolherComissao, escolherItemLista, marcarRadioSl } from '../../support/nova-proposicao';

const BOTAO_NOVA = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL = '#dialogNovaProposicao';

const abrirModal = (casa: 'CD' | 'SF'): void => {
  cy.get('#casaEditor').select(casa);
  cy.get(BOTAO_NOVA).click();
  cy.get(`${MODAL}[open]`).should('exist');
  cy.get('#np-g1').should('be.visible');
};

const identificarSubstitutivo = (especie: 'substitutivo' | 'subemenda'): void => {
  marcarRadioSl('especie', especie);
  escolherItemLista('#np-sigla-proposicao', 'PL');
  digitarEmSl('#np-numero-proposicao', '5008');
  digitarEmSl('#np-ano-proposicao', '2023');
  cy.get('#np-proposicao-verificar').click();
};

describe('Nova proposição — comissão obrigatória no Plenário (CD)', () => {
  const arquivosSalvos: Promise<string>[] = [];

  const lerSalvo = (): Cypress.Chainable<any> => {
    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));
    return cy
      .wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => JSON.parse(conteudo as string));
  };

  const colegiadoSalvo = (arquivo: any): any => arquivo.value.metadado.metadadoProprietario[0].any[0].value.colegiadoApreciador;

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

  (['substitutivo', 'subemenda'] as const).forEach(especie => {
    it(`${especie}: Plenário exige a comissão e o arquivo salvo grava Plenário com a comissão`, () => {
      abrirModal('CD');
      identificarSubstitutivo(especie);
      marcarRadioSl('destino', 'Plenário');
      cy.get('#np-comissao').should('exist');
      deveEstarDesabilitado('#np-continuar');

      escolherComissao('CCJC');
      deveEstarHabilitado('#np-continuar');
      cy.get('#np-continuar').click();
      cy.get('#np-continuar').click();

      cy.get(`${MODAL}[open]`).should('not.exist');
      cy.getContainerArtigoByNumero(1).should('exist');
      lerSalvo().then(arquivo => {
        expect(colegiadoSalvo(arquivo)).to.include({ tipoColegiado: 'Plenário', siglaComissao: 'CCJC' });
      });
    });
  });

  it('trocar o destino entre Comissão e Plenário mantém a comissão escolhida', () => {
    abrirModal('CD');
    identificarSubstitutivo('substitutivo');
    escolherComissao('CCJC');
    marcarRadioSl('destino', 'Plenário');
    cy.get('#np-comissao').should($el => expect(($el[0] as any).value).to.equal('CCJC'));
    deveEstarHabilitado('#np-continuar');
    marcarRadioSl('destino', 'Comissão');
    deveEstarHabilitado('#np-continuar');
  });

  it('proposição na CD com Plenário não pede comissão', () => {
    abrirModal('CD');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    cy.get('#np-comissao').should('not.exist');
    deveEstarHabilitado('#np-continuar');
  });

  it('substitutivo no SF com Plenário não pede comissão', () => {
    abrirModal('SF');
    marcarRadioSl('especie', 'substitutivo');
    marcarRadioSl('destino', 'Plenário');
    cy.get('#np-comissao').should('not.exist');
  });
});
