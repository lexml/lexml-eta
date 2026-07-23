/**
 * Grupo H — D4: referência "enxuta" (sem qualificador) não ganha cadeia nova
 *
 * Bug reportado pelo usuário: ao inserir um novo artigo em outro ponto da árvore, referências
 * ABSOLUTAS "enxutas" (ex.: "inciso I", sem "do art. N") eram incorretamente "promovidas" para forma
 * completa (ex.: "inciso I do art. 3"), mesmo quando a posição do próprio alvo dentro do seu pai
 * imediato não mudou — só o número de um artigo alheio, inserido em outro lugar, mudou. Corrigido em
 * sincronizarRemissoes.ts (textoCanonicoLocal + possuiQualificadorExplicito). Referências JÁ escritas
 * com cadeia explícita ("do art. N") continuam sendo recalculadas por inteiro, como sempre.
 *
 * Ver docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md (D4) e
 * test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts (matriz completa, unitária).
 *
 * Referência "enxuta" não é auto-detectável pelo motor de detecção (a regex absoluta sempre exige um
 * "do art. N" no final) — por isso é injetada diretamente via quill.updateContents com o atributo
 * 'remissao-interna' (formato visual do link) E via window.__rootStore (entrada no registro
 * state.remissoes, que a detecção automática normalmente criaria) — sem a segunda parte, não há
 * registro para sincronizarRemissoesComEstadoAtual processar quando o artigo renumerar.
 */
const SEL_LINK = 'a.lexml-remissao-interna';

describe('D4: referência enxuta ("inciso I") não ganha qualificador ao renumerar artigo alheio', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Inciso I e Inciso II no caput do Art. 1 (Inciso II vai referenciar o Inciso I via link enxuto)
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 2);

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-inciso').first().alterarTextoDoDispositivo('bla bla bla.');
  });

  it('CT-H-01: não ganha qualificador ao renumerar artigo alheio; atualiza numeral quando a posição local do alvo muda', () => {
    // Injeta o link enxuto "inciso I" no Inciso II, apontando para o Inciso I (mesmo caput) — simula
    // criação manual via diálogo, já que "inciso I" sozinho não é reconhecido pelo detector automático.
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .eq(1)
      .then($incDois => {
        return cy.window().then(win => {
          const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
          const quill = editorEl?.quill;
          const incUm = win.document.querySelector('div.container__elemento.elemento-tipo-inciso') as HTMLElement;
          const pUm = incUm.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
          const EtaQuillClass = quill.constructor as any;
          const targetUuid = parseInt(pUm.id!.replace('texto__dispositivo', ''), 10);

          const pDois = $incDois[0].querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
          const blotDois = EtaQuillClass.find(pDois);
          const offset = blotDois.offset(quill.scroll);
          const sourceUuid = parseInt(pDois.id!.replace('texto__dispositivo', ''), 10);

          const refId = 'ref_bare_test';
          const remissao = { refId, targetLexmlId: 'art1_cpt_inc1', targetUuid };
          const Delta = EtaQuillClass.import('delta');
          quill.updateContents(new Delta([{ retain: offset }, { insert: 'inciso I', attributes: { 'remissao-interna': remissao } }, { insert: ' ' }]), 'silent');

          // Injeta a entrada no registro (state.remissoes) — a detecção automática não cria isso
          // sozinha para forma enxuta, então simulamos diretamente o que ela faria.
          const store = (win as any).__rootStore;
          const state = store.getState().elementoReducer;
          state.remissoes = {
            ...state.remissoes,
            [sourceUuid]: [{ refId, sourceUuid, targetUuid, targetLexmlId: 'art1_cpt_inc1', textoRef: 'inciso I' }],
          };
        });
      });

    cy.get('div.container__elemento.elemento-tipo-inciso')
      .eq(1)
      .find(SEL_LINK)
      .should('have.length', 1)
      .and('have.attr', 'data-lexml-ref', 'art1_cpt_inc1')
      .and('contain.text', 'inciso I');

    // Sincroniza o texto do Inciso II (editado via 'silent') com o estado, sem rodar redetecção.
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).sincronizarTextoComQuill();

    // ── Fase 1: insere um novo artigo antes de tudo — Art. 1 (com os incisos) vira Art. 2 ──────────
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(2).should('exist');

    // O texto NÃO deve ganhar qualificador ("do art. 2") — só o data-lexml-ref muda internamente
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .eq(1)
      .find(SEL_LINK)
      .should('have.attr', 'data-lexml-ref', 'art2_cpt_inc1')
      .and('contain.text', 'inciso I')
      .and('not.contain.text', 'do art');

    // ── Fase 2: insere um novo inciso 1 no MESMO caput do alvo — Inciso I (alvo) vira Inciso II ────
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso antes');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 3);

    // Agora sim: o texto enxuto é corrigido, pois a posição LOCAL do alvo mudou — mas continua sem
    // ganhar qualificador nenhum (permanece "inciso II", não "inciso II do art. 2")
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(2).find(SEL_LINK).should('contain.text', 'inciso II').and('not.contain.text', 'do art');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contraste: referência JÁ escrita com cadeia explícita ("do art. N") continua sendo recalculada
// por inteiro, mesmo cruzando para outro artigo — comportamento não alterado por este fix.
// ─────────────────────────────────────────────────────────────────────────────
describe('D4: referência com qualificador explícito continua atualizando por inteiro', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 2);

    // "Adicionar artigo depois" roda ANTES das edições de texto propositalmente: clicar no menu do
    // MESMO dispositivo logo após editar seu texto via alterarTextoDoDispositivo (que bypassa o
    // Quill, deixando o blot interno dessincronizado da posição real no DOM) quebra com
    // IndexSizeError ao calcular o offset da linha no próximo selection-change do Quill.
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(0).alterarTextoDoDispositivo('bla bla bla;');
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).alterarTextoDoDispositivo('bla bla bla.');
  });

  it('CT-H-02: "inciso II do art. 1" atualiza para "inciso II do art. 2" ao inserir artigo antes do art. 1', () => {
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o inciso II do art. 1, aplica-se o disposto.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'inciso II do art. 1');
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_cpt_inc2');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(3).should('exist');

    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art2_cpt_inc2').and('contain.text', 'inciso II do art. 2');
  });
});
