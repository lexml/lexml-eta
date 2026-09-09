/**
 * Grupo B (remissão externa) — Coexistência com detecção interna no mesmo texto
 *
 * Cobre o achado #4 do plano (docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md): REGEX_ABSOLUTA
 * não tem guarda contra ser seguida de citação de norma externa — sem a reconciliação da Fase 3,
 * um texto como "art. 2º da Lei nº 12.527..." cria uma remissão interna incorreta apontando para
 * o art. 2º LOCAL, quando na verdade é uma citação a uma norma externa.
 *
 * Diferente de test/redux/remissao/reducer-exclusao-span-externo.test.ts (que testa o reducer
 * isolado), este spec exercita o fluxo completo ao vivo: Quill real, Worker/WASM real,
 * dois dispatches (interno síncrono + reconciliação assíncrona) e o DOM final.
 */

describe('Coexistência: citação externa cujo número colide com um artigo local', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    // Ver docs/analises/ANALISE_CORRIDA_ASSENTAMENTO_NOVA_PROPOSICAO.md — mesma mitigação do Grupo A.
    cy.wait(1500);

    // Cria um Art. 2 local — alvo plausível (porém incorreto) para a detecção interna colidir.
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('não cria remissão interna para o art. 2º local — só a remissão externa correta', () => {
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Nos termos do art. 2º da Lei nº 12.527, de 18 de novembro de 2011, aplica-se a norma.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    // A externa deve aparecer (retry automático até o Worker resolver).
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 1).and('contain.text', 'art. 2º da Lei nº 12.527, de 18 de novembro de 2011');

    // A interna (falso positivo do achado #4) não deve sobreviver à reconciliação.
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('have.length', 0);

    // Confirma no state, não só no DOM.
    cy.window().should(win => {
      const store = (win as any).__rootStore;
      const state = store.getState().elementoReducer;
      const remissaoExterna = Object.values(state.remissoesExternas || {})[0] as any;
      expect(remissaoExterna.targetUrn).to.equal('urn:lex:br:federal:lei:2011-11-18;12527');
      expect(remissaoExterna.targetFragmento).to.equal('art2');

      const registryInterno = state.remissoes?.[remissaoExterna.sourceUuid] ?? [];
      expect(registryInterno).to.have.length(0);
    });
  });
});
