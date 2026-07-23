/**
 * Bug reportado: ao apertar TAB para transformar um Artigo em Parágrafo (do artigo anterior), o
 * dispositivo transformado desaparecia do editor, mesmo com o estado/registro de remissões corretos.
 *
 * Causa raiz: converteDispositivo (Fase 0 do plano de simplificação de remissão) preserva o uuid do
 * dispositivo convertido — necessário para que remissões continuem resolvendo. Isso faz com que os
 * eventos ElementoIncluido e ElementoRemovido emitidos pela transformação carreguem os MESMOS uuids.
 * O handler de ElementoIncluido reaproveita a linha existente no Quill (atualiza em vez de inserir);
 * o handler de ElementoRemovido, rodando em seguida, apagava essa linha recém-atualizada.
 *
 * Corrigido em editor.component.ts: processarStateEvents agora ignora, na repintura de
 * ElementoRemovido, qualquer uuid que também apareça em um ElementoIncluido do mesmo lote de eventos.
 */
describe('TAB: transformar artigo em parágrafo não pode fazer o dispositivo desaparecer', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Texto do artigo primeiro.');
    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('Texto do artigo segundo.');
  });

  it('TAB no Art. 2 transforma em parágrafo do Art. 1 e o parágrafo permanece visível no editor', () => {
    // O handler de TAB (eta-keyboard.ts) escuta 'keydown' nativo em quill.root e lê ev.key/ev.shiftKey
    // do quill.linhaAtual — não há suporte a `{tab}` em cy.type(), então dispara o keydown diretamente
    // após focar/clicar no conteúdo do Art. 2 (o que atualiza quill.linhaAtual para essa linha).
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').click().trigger('keydown', { key: 'Tab', bubbles: true, cancelable: true });

    // Só deve restar 1 artigo no editor (getContainerArtigoByNumero usa .closest(), que não
    // re-consulta bem quando o elemento subjacente é removido durante o retry logo após a
    // transformação — verifica direto pelos seletores de classe/texto em vez do comando composto)
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 1).and('contain.text', 'Texto do artigo primeiro.');

    // O parágrafo resultante da transformação deve estar visível no DOM (não só no estado Redux)
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length', 1).and('be.visible').and('contain.text', 'Texto do artigo segundo.');
  });
});
