/**
 * Grupo F — Invalidação e Restauração de Remissão + Mensagem de Erro
 *
 * CT-F-01: excluir dispositivo referenciado → link recebe classe lexml-remissao-invalida
 * CT-F-02: undo da exclusão → link volta a lexml-remissao-interna; Art. 2 restaurado
 * CT-F-03: mensagem de erro aparece no painel do dispositivo de origem
 * CT-F-04: remover o link inválido via popup Excluir → link e mensagem desaparecem
 * CT-F-05: undo da exclusão → mensagem de erro desaparece
 * CT-F-06: excluir dispositivo não referenciado → nenhuma mensagem; link permanece válido
 *
 * Setup compartilhado (CT-F-01 a CT-F-05):
 *   Art. 1 e Art. 2. Art. 2 tem link para Art. 1 via detecção automática.
 *   Art. 1 é excluído → ex-Art. 2 se torna Art. 1 com link inválido.
 *
 * Nota sobre mensagem DOM:
 *   EtaBlotMensagem cria div.mensagem.mensagem--danger dentro de td.container__texto--mensagem.
 *   Após ElementoValidado com mensagens=[], o tr inteiro é removido — find() retorna 0 elementos.
 *
 * Nota sobre o botão Desfazer:
 *   Seletor: .lx-eta-btn-desfazer. Dispatcha UndoAction() via quill.undo() → undoRedoEstrutura.
 */

const SEL_LINK = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_MENSAGEM_INVALIDA = '.container__texto--mensagem .mensagem--danger';
const SEL_BTN_DESFAZER = '.lx-eta-btn-desfazer';

/**
 * Cria 3 artigos, insere referência "art. 1º" no Art. 2, detecta remissão e
 * exclui o Art. 1. Ao final: existem 2 artigos — ex-Art. 2 vira Art. 1 (com
 * link inválido) e ex-Art. 3 vira Art. 2.
 *
 * Por que 3 artigos e não 2:
 *   Com apenas 2 artigos, após remover o Art. 1 o artigo restante é
 *   renomeado para "Artigo único." — a regex de getContainerArtigoByNumero(1)
 *   não casa com "Artigo único." e o comando retorna jQuery vazio.
 *   Com 3 artigos, após remover o Art. 1 sobram 2 artigos normalmente
 *   numerados ("Art. 1." e "Art. 2.").
 */
function configurarEstadoComRemissaoInvalida(): void {
  cy.visit('/');
  cy.novaProposicao();
  cy.getContainerArtigoByNumero(1).should('exist');

  cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
  cy.getContainerArtigoByNumero(2).should('exist');

  cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
  cy.getContainerArtigoByNumero(3).should('exist');

  // Art. 2 referencia Art. 1
  cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
  cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

  cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
  cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

  cy.getContainerArtigoByNumero(3).alterarTextoDoDispositivo('Ficam revogadas as disposições contrárias.');

  // Exclui Art. 1 (referenciado); ex-Art. 2 → Art. 1 com link inválido; ex-Art. 3 → Art. 2
  cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover');

  // Âncora: 2 artigos remanescentes numerados normalmente
  cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-01 a CT-F-05 — Setup: estado com remissão inválida (Art. 1 excluído)
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação e restauração de remissão', () => {
  beforeEach(() => {
    configurarEstadoComRemissaoInvalida();
  });

  it('CT-F-01: link recebe classe lexml-remissao-invalida após exclusão do dispositivo destino', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO).should('have.length', 1);
  });

  it('CT-F-03: mensagem de erro aparece no painel do dispositivo de origem', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist').and('contain.text', 'excluído');
  });

  it('CT-F-09: mensagem exibe o texto completo de referência para dispositivo excluído', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist').and('contain.text', 'Este dispositivo contém referência para dispositivo que foi excluído.');
  });

  it('CT-F-04: remover link inválido via popup Excluir apaga link e mensagem simultaneamente', () => {
    cy.getContainerArtigoByNumero(1).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const link = $container[0].querySelector('a.lexml-remissao-interna');
        if (!link) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        // linkIndex + 1 evita fronteira de Parchment; selection-change → mostrarPopup() com invalido=true
        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');

        // selection-change é síncrono → popup já visível; click nativo preserva foco no Quill
        const btnExcluir = win.document.querySelector('.remissao-popup__btn--excluir') as HTMLElement;
        btnExcluir?.click();
      });
    });

    cy.getContainerArtigoByNumero(1).find(SEL_LINK).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
  });

  it('CT-F-02: undo restaura Art. 1 e link no Art. 2 volta a ser lexml-remissao-interna', () => {
    cy.get(SEL_BTN_DESFAZER).click();

    // Art. 1 restaurado — 3 artigos novamente; âncora de sync
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);

    // O link estava em Art. 2 (que após remoção/undo volta a ser Art. 2)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO).should('not.exist');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
  });

  it('CT-F-05: undo da exclusão remove a mensagem de erro do dispositivo de origem', () => {
    cy.get(SEL_BTN_DESFAZER).click();

    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
  });

  it('CT-F-07: mensagem persiste após digitar texto no dispositivo com remissão inválida', () => {
    // Pré-condição: mensagem visível antes de digitar
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist');

    // Digita texto adicional no dispositivo com remissão inválida (sem remover o link)
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(' Texto adicional digitado.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    // Mensagem deve permanecer visível — a digitação não pode apagar o painel
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist').and('contain.text', 'excluído');
  });

  it('CT-F-08: mensagem persiste após digitação real (cy.type) no dispositivo com remissão inválida', () => {
    // Pré-condição: mensagem visível e link inválido presente
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO).should('have.length', 1);

    // Foca no conteúdo do dispositivo para habilitar digitação real
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').click({ force: true });

    // Move cursor para o final do texto via tecla End
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').type('{end}', { force: true });

    // Digita texto adicional caractere por caractere (simula usuário real)
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').type(' texto', { force: true });

    // Espera o debounce de 1 segundo disparar
    cy.wait(2000);

    // Mensagem deve permanecer visível após a digitação real e debounce
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist').and('contain.text', 'excluído');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-06 — Excluir dispositivo não referenciado não invalida remissões existentes
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação: excluir dispositivo não referenciado não afeta remissões válidas', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Art. 2 referencia Art. 1 (não Art. 3)
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

    // Exclui Art. 3 — não referenciado por nenhuma remissão
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(3).should('not.exist');
  });

  it('CT-F-06: link no Art. 2 permanece válido; nenhuma mensagem de remissão inválida', () => {
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO).should('not.exist');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-10 — Dois links para o mesmo alvo excluído: ambos invalidados, uma mensagem
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação: dois links no mesmo dispositivo para o mesmo alvo excluído', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Art. 2 referencia Art. 1 duas vezes no mesmo texto
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, o disposto no art. 1º aplica-se.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 2);

    cy.getContainerArtigoByNumero(3).alterarTextoDoDispositivo('Ficam revogadas as disposições contrárias.');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
  });

  it('CT-F-10: dois links para o mesmo alvo excluído → ambos inválidos; uma mensagem por dispositivo', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO).should('have.length', 2);
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-11 — Remissão para dispositivo filho invalidada quando pai é excluído
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação: remissão para parágrafo filho invalidada ao excluir o artigo pai', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // § 1 no Art. 1 — será removido junto com o pai
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Art. 2 (fonte) e Art. 3 (âncora) — ambos adicionados ANTES da detecção
    // (evita selecionarOpcaoDeMenuDoDispositivo após dispararDeteccaoRemissao)
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Detecção: Art. 2 cria link para § 1 do Art. 1 via detecção composta
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o § 1º do art. 1º, aplica-se.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', '§ 1º do art. 1');
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par1');

    // Filler para Art. 3 (âncora); § 1 não precisa de filler — será excluída junto com Art. 1
    cy.getContainerArtigoByNumero(3).alterarTextoDoDispositivo('Ficam revogadas as disposições contrárias.');

    // Exclui Art. 1 (e implicitamente § 1) → ex-Art. 2 vira Art. 1 com link para art1_par1 excluído
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
  });

  it('CT-F-11: excluir artigo pai invalida link que aponta para o parágrafo filho', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO).should('have.length', 1);
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-12 — Link válido e inválido no mesmo dispositivo simultaneamente
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação: dispositivo com link válido e link inválido ao mesmo tempo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Art. 2 (será excluído), Art. 3 (fonte), Art. 4 (âncora) — todos adicionados ANTES da detecção
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'); // Art. 2
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'); // Art. 3
    cy.getContainerArtigoByNumero(3).should('exist');
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'); // Art. 4
    cy.getContainerArtigoByNumero(4).should('exist');

    // Art. 3 (fonte): referencia Art. 1 (sobreviverá) e Art. 2 (será excluído)
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o art. 1º e o art. 2º, aplica-se.');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 2);
    cy.getContainerArtigoByNumero(3).find('a[data-lexml-ref="art1"]').should('exist');
    cy.getContainerArtigoByNumero(3).find('a[data-lexml-ref="art2"]').should('exist');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.getContainerArtigoByNumero(4).alterarTextoDoDispositivo('Ficam revogadas as disposições contrárias.');

    // Exclui Art. 2 — está ANTES da fonte (Art. 3), mesmo padrão de configurarEstadoComRemissaoInvalida
    // → ex-Art. 3 vira Art. 2 (fonte): link para art1 válido + link para art2/excluído inválido
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
  });

  it('CT-F-12: só o link para o dispositivo excluído recebe classe inválida; mensagem aparece uma vez', () => {
    // Fonte (ex-Art. 3, agora Art. 2) tem 2 links
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 2);
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO).should('have.length', 1);

    // Link para art1 (sobrevivente) permanece sem classe inválida
    cy.getContainerArtigoByNumero(2).find('a[data-lexml-ref="art1"]').should('not.have.class', 'lexml-remissao-invalida');

    // Uma mensagem — apenas um destino foi excluído
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-13 / CT-F-13b — Dois dispositivos de origem distintos apontando para o mesmo alvo excluído
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação: dois dispositivos de origem distintos → cada um exibe sua própria mensagem', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'); // Art. 2
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'); // Art. 3
    cy.getContainerArtigoByNumero(3).should('exist');
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'); // Art. 4 (âncora)
    cy.getContainerArtigoByNumero(4).should('exist');

    // Art. 2 e Art. 3 referenciam Art. 1 independentemente
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');

    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('O previsto no art. 1º aplica-se igualmente.');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');

    // Art. 4 precisa de texto via digitarTextoRemissao + dispararDeteccaoRemissao:
    // alterarTextoDoDispositivo dispara emitirEventoOnChange no linhaAtual (Art. 3),
    // não em Art. 4, deixando o Redux com texto vazio e gerando mensagem de validação extra.
    cy.getContainerArtigoByNumero(4).digitarTextoRemissao('Ficam revogadas as disposições contrárias.');
    cy.getContainerArtigoByNumero(4).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(4).find(SEL_MENSAGEM_INVALIDA).should('not.exist');

    // Exclui Art. 1 → ex-Art. 2 vira Art. 1 (inválido), ex-Art. 3 vira Art. 2 (inválido), ex-Art. 4 vira Art. 3
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
  });

  it('CT-F-13: cada dispositivo de origem exibe sua própria mensagem — 2 mensagens no documento', () => {
    // Total: 2 mensagens de remissão inválida nos artigos (uma por dispositivo de origem).
    // Usa seletor scoped a .elemento-tipo-artigo para excluir mensagens de ementa.
    cy.get(`div.container__elemento.elemento-tipo-artigo ${SEL_MENSAGEM_INVALIDA}`).should('have.length', 2);

    // Cada fonte tem sua própria mensagem
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist'); // ex-Art. 2
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('exist'); // ex-Art. 3

    // Cada fonte tem seu link inválido
    cy.get(SEL_LINK_INVALIDO).should('have.length', 2);
  });

  it('CT-F-13b: undo da exclusão restaura Art. 1 e remove ambas as mensagens', () => {
    cy.get(SEL_BTN_DESFAZER).click();

    // 4 artigos restaurados
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 4);

    // Mensagens de invalidação removidas nos dispositivos que referenciavam o Art. 1
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
    cy.getContainerArtigoByNumero(3).find(SEL_MENSAGEM_INVALIDA).should('not.exist');

    // Links voltam a ser válidos (ex-Art. 2 e ex-Art. 3 voltam para Art. 2 e Art. 3)
    cy.get(SEL_LINK_INVALIDO).should('not.exist');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1);
  });
});

export {};
