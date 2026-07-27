/**
 * Grupo J — Detecção Híbrida por Blur (docs/PLANO_DETECCAO_BLUR.md)
 *
 * Cobre os cenários do §5.3 do plano usando o mecanismo REAL de disparo (cliques reais de DOM
 * para trocar de linha/sair do editor), não o helper sintético dispararDeteccaoRemissao() — o
 * objetivo aqui é validar o mecanismo de blur em si (Gatilho A: troca de linha; Gatilho B: foco
 * sai do editor inteiro; flush determinístico em getProjetoAtualizado), não a lógica de detecção
 * de padrões (já coberta exaustivamente nos grupos A-I).
 *
 * Nota sobre digitação: cy.type() em p.texto__dispositivo não insere texto de forma confiável
 * neste ambiente (Cypress + Quill + contenteditable) — reproduzido isoladamente até no código
 * sem nenhuma mudança deste plano, portanto não é um bug deste trabalho. Por isso o texto é
 * inserido via quill.insertText(index, texto, 'user') (mesma API que uma digitação real usa
 * internamente, dispara os mesmos eventos), e apenas a SAÍDA da linha/editor usa cliques reais.
 *
 * Fora de escopo deste arquivo: remoção de remissão ao editar o link (já coberta em
 * grupo-d-remocao.cy.ts e grupo-d-remocao-dom-limpo.cy.ts — não é afetada pelo mecanismo de blur,
 * continua em tempo real via moduloRemissao.ts).
 *
 * CT-J-01: sair da linha (clique real) cria o link imediatamente, sem esperar 1s
 * CT-J-02: corrigir "art. 1" para "art. 10" antes de sair da linha — link aponta só para art. 10
 * CT-J-03: permanecer na mesma linha por >1s não cria link (debounce de keystroke não cria mais)
 * CT-J-04: clicar em aba do painel lateral (fora do editor) cria o link — Gatilho B
 * CT-J-05: getProjetoAtualizado() sincroniza a remissão mesmo sem sair da linha (flush)
 * CT-J-06: trocar de aba e voltar preserva a edição e a remissão detectada
 */

const SEL_LINK_J = 'a.lexml-remissao-interna';

function encontrarNoRemissao(node: any): any {
  if (!node || typeof node !== 'object') return null;
  if (node.name?.localPart === 'Remissao') return node;
  if (Array.isArray(node)) {
    for (const item of node) {
      const achado = encontrarNoRemissao(item);
      if (achado) return achado;
    }
    return null;
  }
  for (const key of Object.keys(node)) {
    const achado = encontrarNoRemissao(node[key]);
    if (achado) return achado;
  }
  return null;
}

/**
 * Insere texto no dispositivo via quill.insertText(index, texto, 'user') — atualiza o DOM e
 * dispara os eventos reais do Quill (ao contrário de digitarTextoRemissao, que usa 'silent').
 * Retorna o índice logo após o texto inserido, para permitir "continuar digitando" sem sair
 * da linha (ver CT-J-02).
 */
function inserirTextoReal(numeroArtigo: number, texto: string, indiceBase?: number): Cypress.Chainable<number> {
  return cy.getContainerArtigoByNumero(numeroArtigo).then($container => {
    return cy.window().then((win: any): number => {
      const editorEl = win.document.querySelector('lexml-eta-proposicao-editor');
      const quill = editorEl.quill;
      const p = $container[0].querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
      const EtaQuillClass = quill.constructor as any;
      const blot = EtaQuillClass.find(p);
      const indice = indiceBase ?? blot.offset(quill.scroll);
      quill.setSelection(indice, 0, 'user');
      quill.insertText(indice, texto, 'user');

      // insertText/setSelection não atualizam quill.linhaAtual sozinhos (rastreamento próprio do
      // EtaQuill) — sem isso, o Gatilho A não sabe que "a linha atual" mudou para este
      // dispositivo, e a saída de linha seguinte não detecta nada (mesmo padrão de
      // digitarTextoRemissao em remissao-commands.ts).
      const uuid = parseInt(p.id?.replace('texto__dispositivo', '') ?? '', 10);
      const linha = quill.getLinha?.(uuid);
      if (linha) {
        quill.atualizarLinhaCorrente(linha);
        // atualizarLinhaCorrente sincroniza htmlAnt=html como efeito colateral (mesma observação
        // documentada em editor.component.ts sobre setSelection/marcarLinhaAtual), zerando
        // "alterado" — força de volta para true, mesmo truque de dispararDeteccaoRemissao.
        if (linha.blotConteudo) linha.blotConteudo.htmlAnt = '';
      }

      return indice + texto.length;
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Gatilho A — troca de linha dentro do editor (clique real em outro dispositivo)
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo J — Gatilho A: detecção ao trocar de linha', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('CT-J-01: sair da linha (clique real) cria o link imediatamente, sem esperar o antigo debounce de 1s', () => {
    inserirTextoReal(2, 'Conforme o art. 1º.');

    // Sai da linha com um clique real — a asserção usa um timeout bem menor que o antigo
    // debounce de 1000ms para provar que a criação não depende mais dele.
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').click({ force: true });

    cy.getContainerArtigoByNumero(2).find(SEL_LINK_J, { timeout: 500 }).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');
  });

  it('CT-J-03: permanecer na mesma linha por mais de 1s não cria link', () => {
    inserirTextoReal(2, 'Conforme o art. 1º.');

    // Fica na mesma linha por mais tempo que o antigo debounce de keystroke (1000ms).
    cy.wait(1500);

    cy.getContainerArtigoByNumero(2).find(SEL_LINK_J).should('have.length', 0);
  });
});

describe('Grupo J — Gatilho A: correção antes de sair da linha não deixa referência intermediária', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    // Cria Art. 2 a Art. 10 — necessário um alvo de dois dígitos para reproduzir o cenário de
    // digitação incremental ("art. 1" + "0" = "art. 10") sem depender do mecanismo de absorção
    // de ordinal (§6.19), que é uma correção pontual e diferente do que este teste cobre.
    for (let i = 2; i <= 10; i++) {
      cy.getContainerArtigoByNumero(i - 1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
      cy.getContainerArtigoByNumero(i).should('exist');
    }
  });

  it('CT-J-02: corrigir "art. 1" para "art. 10" antes de sair da linha — link aponta só para art. 10', () => {
    // Digita "art. 1" (matchearia Art. 1 se a detecção rodasse agora) e, sem sair da linha,
    // continua digitando "0" — resultado final referencia Art. 10, nunca Art. 1.
    inserirTextoReal(10, 'Conforme o art. 1').then(proximoIndice => {
      inserirTextoReal(10, '0º.', proximoIndice);
    });

    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').click({ force: true });

    cy.getContainerArtigoByNumero(10).find(SEL_LINK_J, { timeout: 500 }).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art10');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gatilho B — foco sai do editor inteiro (painel lateral, abas)
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo J — Gatilho B: detecção ao sair do editor inteiro', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('CT-J-04: clicar em aba do painel lateral (fora do editor) cria o link', () => {
    inserirTextoReal(2, 'Conforme o art. 1º.');

    cy.forcarSaidaDoEditor();

    cy.getContainerArtigoByNumero(2).find(SEL_LINK_J, { timeout: 500 }).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');
  });

  it('CT-J-06: trocar de aba e voltar preserva a edição e a remissão detectada', () => {
    inserirTextoReal(2, 'Conforme o art. 1º.');

    // Reforça alterado=true antes do clique — ver comentário em forcarSaidaDoEditor.
    cy.wait(300);
    cy.window().then((win: any) => {
      const editorEl = win.document.querySelector('lexml-eta-proposicao-editor');
      const linha = editorEl?.quill?.linhaAtual;
      if (linha?.blotConteudo) linha.blotConteudo.htmlAnt = '';
    });
    cy.get('sl-tab[panel="justificativa"]').click();
    cy.get('sl-tab[panel="lexml-eta-proposicao"]').click();

    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'Conforme o art. 1º.');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_J).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Flush determinístico — getProjetoAtualizado() independe de foco/DOM
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo J — flush determinístico ao salvar', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('CT-J-05: getProjetoAtualizado() traz a remissão mesmo sem sair da linha em edição', () => {
    inserirTextoReal(2, 'Conforme o art. 1º.');

    // Não sai da linha — chama getProjetoAtualizado() diretamente, como a aplicação hospedeira
    // faria ao clicar em "Salvar" (ver demo/components/demoview.ts:salvar()).
    cy.window().then((win: any) => {
      const proposicaoEl = win.document.querySelector('lexml-eta-proposicao');
      const projeto = proposicaoEl.getProjetoAtualizado();
      const remissao = encontrarNoRemissao(projeto);

      expect(remissao, 'nó Remissao no JSONIX serializado').to.not.be.null;
      expect(remissao.value.href).to.equal('art1');
    });
  });
});
