/// <reference types="cypress" />

// Seletores confirmados via inspeção DOM (light DOM — sem shadow())
const SEL_BTN_ADICIONAR_REMISSAO = '.btn-remissao-interna';
const SEL_BTN_REMOVER_REMISSAO = '.btn-remover-remissao';
const SEL_LINK_REMISSAO = 'a.lexml-remissao-interna';
const SEL_LINK_REMISSAO_INVALIDA = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_DESTAQUE_REMISSAO = '.lexml-remissao-destaque';

/**
 * Clica no botão "Adicionar remissão" na toolbar.
 */
Cypress.Commands.add('clicarAdicionarRemissao', (): void => {
  cy.get(SEL_BTN_ADICIONAR_REMISSAO).click();
});

/**
 * Clica no botão "Remover remissão" na toolbar (só habilitado quando cursor está sobre um link).
 */
Cypress.Commands.add('clicarRemoverRemissao', (): void => {
  cy.get(SEL_BTN_REMOVER_REMISSAO).should('not.be.disabled').click();
});

/**
 * Retorna o botão "Adicionar remissão".
 */
Cypress.Commands.add('getBotaoAdicionarRemissao', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_BTN_ADICIONAR_REMISSAO);
});

/**
 * Retorna o botão "Remover remissão".
 */
Cypress.Commands.add('getBotaoRemoverRemissao', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_BTN_REMOVER_REMISSAO);
});

/**
 * Retorna todos os links de remissão presentes no documento.
 */
Cypress.Commands.add('getLinksRemissao', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_LINK_REMISSAO);
});

/**
 * Retorna links de remissão inválidos (com classe lexml-remissao-invalida).
 */
Cypress.Commands.add('getLinksRemissaoInvalidos', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_LINK_REMISSAO_INVALIDA);
});

/**
 * Retorna um link de remissão pelo seu data-ref-id.
 */
Cypress.Commands.add('getLinkRemissaoPorRefId', (refId: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(`${SEL_LINK_REMISSAO}[data-ref-id="${refId}"]`);
});

/**
 * Retorna o elemento com destaque de navegação após clicar num link de remissão.
 */
Cypress.Commands.add('getDestinoRemissaoDestacado', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(SEL_DESTAQUE_REMISSAO);
});

/**
 * Insere texto no modelo Quill do dispositivo atual (linhaAtual).
 * Usa quill.insertText() para atualizar tanto o delta do Quill quanto o DOM,
 * garantindo que quill.getText() retorne o texto correto em renderizarRemissoesDoState.
 * NÃO usar alterarTextoDoDispositivo — ele bypassa o Quill e não aciona a detecção.
 */
Cypress.Commands.add('digitarTextoRemissao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, texto: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.window().then(win => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
    const quill = editorEl?.quill;
    if (!quill) return;

    // Localiza o p.texto__dispositivo diretamente pelo container (subject)
    const p = subject[0]?.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
    if (!p) return;

    // Usa o construtor herdado (EtaQuill extends Quill) para encontrar o blot via Quill.find()
    const EtaQuillClass = quill.constructor as any;
    const blot = EtaQuillClass.find(p);
    if (!blot) return;

    const blotStart = blot.offset(quill.scroll);

    // Insere o texto no Quill (atualiza delta + DOM simultaneamente).
    quill.insertText(blotStart, texto, 'silent');

    // Atualiza linhaAtual para o dispositivo onde o texto foi inserido,
    // pois linhaAtual pode ainda apontar para o dispositivo anterior.
    const uuidStr = p.id?.replace('texto__dispositivo', '');
    const uuid = uuidStr ? parseInt(uuidStr, 10) : NaN;
    if (!isNaN(uuid) && quill.getLinha) {
      const linha = quill.getLinha(uuid);
      if (linha) {
        quill.atualizarLinhaCorrente(linha);
      }
    }
  });
  return cy.wrap(subject);
});

/**
 * Dispara detecção de remissão via cy.window(), simulando a saída da linha sem depender de
 * cursor move em elementos de largura 0 (docs/PLANO_DETECCAO_BLUR.md).
 *
 * Pré-condição: quill.linhaAtual deve ser o dispositivo cujo texto queremos detectar.
 * Após selecionarOpcaoDeMenuDoDispositivo, o linhaAtual é automaticamente o novo dispositivo.
 */
Cypress.Commands.add('dispararDeteccaoRemissao', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.window().then(win => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
    if (editorEl) {
      // Força htmlAnt = '' para garantir alterado = true, depois dispara detecção
      const lc = editorEl.quill?.linhaAtual;
      if (lc?.blotConteudo) {
        lc.blotConteudo.htmlAnt = '';
      }
      // somenteFormatoMudouNaLinha precisa vir antes de emitirEventoOnChange, que já muta o estado contra o qual ele compara.
      const somenteFormatoMudou = editorEl.somenteFormatoMudouNaLinha?.(lc);
      editorEl.emitirEventoOnChange?.('cypress');
      editorEl.detectarRemissoesAoSairDaLinha?.(lc, somenteFormatoMudou);
    }
  });
  return cy.wrap(subject);
});

/**
 * Sincroniza dispositivo.texto (estado Redux) com o HTML atualmente presente no Quill do
 * dispositivo, SEM rodar a detecção automática de remissão (diferente de dispararDeteccaoRemissao).
 *
 * Uso: depois de editar um link de remissão diretamente via quill.updateContents(..., 'silent')
 * (necessário para simular remissão manual/não-canônica sem passar pela UI de digitação real),
 * o estado nunca vê essa edição — 'silent' é o único source do Quill que não dispara 'text-change'.
 * Numa digitação REAL do usuário, isso sempre sincronizaria imediatamente (mesmo sem trocar de
 * dispositivo depois); este comando reproduz esse efeito colateral sem o risco de rodar a
 * redetecção (que reescreveria o registro de remissões com base só no que for reconhecível).
 */
Cypress.Commands.add('sincronizarTextoComQuill', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.window().then(async win => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
    const quill = editorEl?.quill;
    const p = subject[0]?.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
    if (!quill || !p) return;

    const uuidStr = p.id?.replace('texto__dispositivo', '');
    const uuid = uuidStr ? parseInt(uuidStr, 10) : NaN;
    const linha = quill.getLinha?.(uuid);
    if (!linha?.blotConteudo) return;

    const store = (win as any).__rootStore;
    if (!store) return;

    // @ts-expect-error caminho absoluto servido pelo wds em runtime, sem declaração de tipos
    const { createElemento } = await import('/out-tsc/src/model/elemento/elementoUtil.js');

    const buscarPorUuid = (no: any): any => {
      if (!no) return undefined;
      if (no.uuid === uuid) return no;
      if (no.caput) {
        const achadoCaput = buscarPorUuid(no.caput);
        if (achadoCaput) return achadoCaput;
      }
      for (const filho of no.filhos || no.artigos || []) {
        const achado = buscarPorUuid(filho);
        if (achado) return achado;
      }
      return undefined;
    };

    const dispositivo = buscarPorUuid(store.getState().elementoReducer.articulacao);
    if (!dispositivo) return;

    dispositivo.texto = linha.blotConteudo.html;
    const elemento = createElemento(dispositivo, true);
    store.dispatch({ type: 'ATUALIZAR_TEXTO_ELEMENTO', atual: elemento });
  });
  return cy.wrap(subject);
});

/**
 * Posiciona o cursor do Quill no início do p.texto__dispositivo do container (subject).
 * Pré-condição para `cy.get('.btn-remissao-interna').click()`: o Quill precisa ter uma
 * seleção ativa (quill.getSelection() != null) antes do clique. Clicar num <button> fora
 * do ql-editor não limpa document.getSelection() no browser, portanto a seleção definida
 * aqui persiste quando o handler do botão chama quill.getSelection().
 */
Cypress.Commands.add('posicionarCursorNoDispositivo', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.window().then(win => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
    const quill = editorEl?.quill;
    if (!quill) return;

    const p = subject[0]?.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
    if (!p) return;

    const EtaQuillClass = quill.constructor as any;
    const blot = EtaQuillClass.find(p);
    if (!blot) return;

    const blotStart = blot.offset(quill.scroll);
    quill.setSelection(blotStart, 0, 'user');
  });
  return cy.wrap(subject);
});

/**
 * Simula o Gatilho B (docs/PLANO_DETECCAO_BLUR.md §2.3): foco saindo do editor inteiro, clicando
 * numa aba do painel lateral fora do editor de texto — dispara um focusout real de DOM.
 *
 * Antes de clicar, reforça htmlAnt='' na linha atual: o clique num sl-tab (sem force) passa pelas
 * checagens de "actionability" do Cypress, o que dá tempo para o pipeline reativo de seleção
 * (elementoSelecionado → atualizarAtributos, ver eta-quill.ts:marcarLinhaAtual) sincronizar
 * htmlAnt=html de forma assíncrona e zerar "alterado" antes do clique acontecer — o mesmo problema
 * que dispararDeteccaoRemissao já contorna forçando htmlAnt=''.
 */
Cypress.Commands.add('forcarSaidaDoEditor', (): void => {
  // Espera o pipeline assíncrono de seleção (ver comentário acima) se assentar ANTES do reforço —
  // resetar htmlAnt cedo demais não adianta se o reset reativo ainda vai rodar depois.
  cy.wait(300);
  cy.window().then((win: any) => {
    const editorEl = win.document.querySelector('lexml-eta-proposicao-editor');
    const linha = editorEl?.quill?.linhaAtual;
    if (linha?.blotConteudo) linha.blotConteudo.htmlAnt = '';
  });
  cy.get('sl-tab[panel="autoria"]').click();
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      clicarAdicionarRemissao(): void;
      clicarRemoverRemissao(): void;
      getBotaoAdicionarRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getBotaoRemoverRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getLinksRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      getLinksRemissaoInvalidos(): Cypress.Chainable<JQuery<HTMLElement>>;
      getLinkRemissaoPorRefId(refId: string): Cypress.Chainable<JQuery<HTMLElement>>;
      getDestinoRemissaoDestacado(): Cypress.Chainable<JQuery<HTMLElement>>;
      digitarTextoRemissao(texto: string): Cypress.Chainable<JQuery<HTMLElement>>;
      dispararDeteccaoRemissao(): Cypress.Chainable<JQuery<HTMLElement>>;
      sincronizarTextoComQuill(): Cypress.Chainable<JQuery<HTMLElement>>;
      posicionarCursorNoDispositivo(): Cypress.Chainable<JQuery<HTMLElement>>;
      forcarSaidaDoEditor(): void;
    }
  }
}

export {};
