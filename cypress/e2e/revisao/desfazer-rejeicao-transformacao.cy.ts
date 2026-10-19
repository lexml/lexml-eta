/**
 * Bug reportado: em modo de revisão, transformar um inciso em alínea, adicionar outra alínea depois dela,
 * rejeitar a transformação e desfazer a rejeição deixava a alínea restaurada desenhada na posição do inciso
 * (depois da alínea nova), mesmo com a articulação correta no estado.
 *
 * Causa raiz: o dispositivo preserva o uuid ao trocar de tipo. No undo, a SituacaoElementoModificada que devolve
 * a marca de revisão chegava antes do ElementoIncluido e retipava a linha do inciso para alínea; a inclusão, ao
 * achar uma linha do mesmo tipo, só a atualizava, sem reposicioná-la.
 *
 * Corrigido em editor.component.ts (semLinhasARecriar): a repintura de situação ignora a linha de outro tipo cujo
 * uuid volta numa inclusão do mesmo lote.
 */
const SEL_LINHAS = 'div.container__elemento';
const SEL_BTN_DESFAZER = '.lx-eta-btn-desfazer';
const SEL_RECUSAR = '.blot__revisao_recusar';

const descreverLinhas = ($linhas: JQuery<HTMLElement>): string[] =>
  $linhas.toArray().map(l => `${/elemento-tipo-(\w+)/.exec(l.className)?.[1]}:${(l.querySelector('label')?.textContent ?? '').trim()}`);

describe('Desfazer a rejeição da transformação de inciso em alínea', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 1);
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 2);
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 3);
    cy.ativarRevisaoDispositivo();
  });

  it('a alínea restaurada volta à posição certa, antes da alínea nova', () => {
    // TAB em quill.root: não há suporte a `{tab}` em cy.type() (ver tab-artigo-em-paragrafo.cy.ts). O clique sozinho
    // deixa a linha atual no inciso III, então a linha do inciso II é marcada direto no Quill.
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .eq(1)
      .then($inciso => {
        cy.window().then((win: any) => {
          const quill = win.document.querySelector('lexml-eta-proposicao-editor').quill;
          const p = $inciso[0].querySelector('p.texto__dispositivo') as HTMLElement;
          quill.atualizarLinhaCorrente(quill.getLinha(parseInt(p.id.replace('texto__dispositivo', ''), 10)));
        });
      });
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).find('p.texto__dispositivo').trigger('keydown', { key: 'Tab', bubbles: true, cancelable: true, force: true });
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length', 1);

    cy.get('div.container__elemento.elemento-tipo-alinea').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea depois');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length', 2);

    let antes: string[] = [];
    cy.get(SEL_LINHAS).then($linhas => {
      antes = descreverLinhas($linhas);
      expect(antes.join(' | ')).to.contain('inciso:I – | alinea:a) | alinea:b) | inciso:II –');
    });

    cy.get('div.container__elemento.elemento-tipo-alinea').first().find(SEL_RECUSAR).click({ force: true });
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length', 1);
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 3);

    cy.get(SEL_BTN_DESFAZER).click();
    cy.get(SEL_LINHAS).should($linhas => {
      expect(descreverLinhas($linhas)).to.deep.equal(antes);
    });
  });
});
