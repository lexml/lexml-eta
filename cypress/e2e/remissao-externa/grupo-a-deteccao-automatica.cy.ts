/**
 * Grupo A (remissão externa) — Detecção Automática via lexml-linker (WASM)
 *
 * Cobre a Fase 3/4 de docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md: coordenarDeteccaoExterna
 * (fire-and-forget, chamado de dentro de detectarRemissoesAoSairDaLinha) detecta citações de norma
 * externa via Worker/WASM e cria o link automaticamente, sem diálogo.
 *
 * Trigger: dispararDeteccaoRemissao() chama detectarRemissoesAoSairDaLinha diretamente — o mesmo
 * ponto de entrada usado pelos Grupos A-J de remissão interna. Como a detecção externa é assíncrona
 * (Worker real, não mockado), as asserções usam o retry automático do cy.get()/.should() em vez de
 * aguardar um tempo fixo.
 *
 * IMPORTANTE: usar digitarTextoRemissao (insere no modelo Quill via insertText), nunca
 * alterarTextoDoDispositivo — mesma restrição dos Grupos A-J (ver CLAUDE.md).
 */

const CITACAO_COMPLETA = 'Nos termos do art. 5º da Lei nº 8.069, de 13 de julho de 1990, aplica-se a norma.';
const TEXTO_LINK_ESPERADO = 'art. 5º da Lei nº 8.069, de 13 de julho de 1990';

describe('Detecção automática de remissão externa: criação ao sair da linha', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    // O documento continua assentando por um período após "existir" (achado ao investigar
    // esta suíte — não relacionado à detecção externa em si). Detecção interna nunca expõe
    // isso por ser síncrona; a nossa, por rodar num Worker assíncrono, pode colidir com essa
    // janela e aplicar o link em offsets errados. Ver docs/analises/
    // ANALISE_CORRIDA_ASSENTAMENTO_NOVA_PROPOSICAO.md.
    cy.wait(1500);
  });

  it('cria o link automaticamente, sem diálogo, ao detectar citação completa de norma', () => {
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(CITACAO_COMPLETA);
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'Lei nº 8.069');

    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    // Assíncrono (Worker real) — cy.get()/.should() faz retry automático até o link aparecer.
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 1).and('contain.text', TEXTO_LINK_ESPERADO);
  });

  it('não cria link quando o texto não contém citação de norma alguma', () => {
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Texto sem nenhuma citação a normas externas.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    // Aguarda um ciclo de detecção real (mesmo texto de controle usado nos testes de integração do Worker)
    // antes de confirmar a ausência — sem isso o teste passaria mesmo se a detecção nunca tivesse rodado.
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(' ');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'Texto sem nenhuma');
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 0);
  });
});

describe('Detecção automática de remissão externa: popup e diálogo de edição', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    // O documento continua assentando por um período após "existir" (achado ao investigar
    // esta suíte — não relacionado à detecção externa em si). Detecção interna nunca expõe
    // isso por ser síncrona; a nossa, por rodar num Worker assíncrono, pode colidir com essa
    // janela e aplicar o link em offsets errados. Ver docs/analises/
    // ANALISE_CORRIDA_ASSENTAMENTO_NOVA_PROPOSICAO.md.
    cy.wait(1500);

    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(CITACAO_COMPLETA);
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 1);
  });

  function posicionarCursorNoLink(): void {
    cy.getContainerArtigoByNumero(1).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;
        const link = $container[0].querySelector('a.lexml-remissao-externa');
        if (!link) return;
        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;
        // +1 evita fronteira de Parchment (mesmo padrão do Grupo A de remissão interna).
        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');
      });
    });
  }

  it('popup mostra o texto do link como rótulo (targetNomeNorma nasce vazio na criação automática)', () => {
    posicionarCursorNoLink();
    cy.get('#remissao-popup').should('be.visible');
    cy.get('.remissao-popup__rotulo').should('contain.text', TEXTO_LINK_ESPERADO);
  });

  it('Excluir remove o link do DOM e a entrada de state.remissoesExternas', () => {
    posicionarCursorNoLink();
    cy.get('#remissao-popup').should('be.visible');
    cy.contains('.remissao-popup__btn', 'Excluir').click();

    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 0);
    cy.window().should(win => {
      const store = (win as any).__rootStore;
      expect(Object.keys(store.getState().elementoReducer.remissoesExternas || {})).to.have.length(0);
    });
  });

  it('Editar abre o diálogo e autopreenche o nome da norma via lookup por URN (Fase 4)', () => {
    // normas.json (mock compartilhado) não tem a Lei 8.069, e a query reconstruída por
    // _getNormaByURN (data+número) não bate com o filtro simplório do mock de dev-server —
    // intercepta a API diretamente para isolar este teste do fixture compartilhado.
    cy.intercept('GET', '**/api/autocomplete-norma*', [
      {
        urn: 'urn:lex:br:federal:lei:1990-07-13;8069',
        nomePreferido: 'Lei nº 8.069, de 1990 (ECA)',
        nomePorExtenso: 'Lei nº 8.069, de 13 de julho de 1990',
        ementa: 'Dispõe sobre o Estatuto da Criança e do Adolescente.',
      },
    ]).as('autocompleteNorma');

    posicionarCursorNoLink();
    cy.get('#remissao-popup').should('be.visible');
    cy.contains('.remissao-popup__btn', 'Editar').click();

    cy.get('sl-dialog[label="Editar Remissão"]').should('exist');
    cy.get('.edit-tipo-badge').should('contain.text', 'Externa');

    cy.wait('@autocompleteNorma');
    // Lookup reverso (autocomplete-norma/_getNormaByURN, mesmo mecanismo de informarNormaDialog.ts)
    // resolve o nome amigável a partir da URN — sem isso o resumo continuaria mostrando a URN crua.
    cy.get('#resumo-norma-ext').should('contain.text', '8.069').and('not.contain.text', 'urn:lex');
  });
});
