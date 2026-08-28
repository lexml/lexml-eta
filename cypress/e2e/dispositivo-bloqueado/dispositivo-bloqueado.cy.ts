describe('MPV 905 - com dispositivos bloqueados', () => {
  it('Testando opções de menu - Art. 1º e filhos bloqueados', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: '_mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });

    // getContainerArtigoByNumero busca por rótulo dentro da PROPOSIÇÃO (nível 0) — nesse fluxo de
    // emenda, "Art. 1º" ali é o artigo vazio recém-criado da emenda, não o Art. 1º da MPV 905/2019
    // (onde os dispositivosBloqueados de fato estão). Além disso a MPV altera outras leis, então
    // até no nível da norma existe mais de um "Art. 1º" (um por lei alterada). O atributo
    // "bloqueado" — setado só no dispositivo cujo id está em dispositivosBloqueados — desambigua.
    cy.get('div.container__elemento.elemento-tipo-artigo[bloqueado="true"] label')
      .contains(/^Art\. 1(\.|º)$/)
      .closest('div.container__elemento.elemento-tipo-artigo')
      .getOpcoesDeMenuDoDispositivo()
      .should('not.contain', 'Adicionar parágrafo')
      .should('not.contain', 'Adicionar inciso')
      .should('not.contain', 'Linha pontilhada')
      .should('not.contain', 'Suprimir');

    // Parágrafo único do Art. 1º: herda o bloqueio total do pai (sem bloquearFilhos: false) — é o
    // primeiro parágrafo bloqueado em ordem de leitura do documento (os demais, art2_par1/par3 e
    // art4_par1u, vêm depois no texto da MPV).
    cy.get('div.container__elemento.elemento-tipo-paragrafo[bloqueado="true"]').first().getOpcoesDeMenuDoDispositivo().should('have.length', 0);
  });
});
