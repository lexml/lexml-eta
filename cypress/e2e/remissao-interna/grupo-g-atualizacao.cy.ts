/**
 * Grupo G — Atualização Automática de Remissões após Renumeração
 *
 * Verifica que remissões criadas pelas diferentes estratégias de detecção
 * são atualizadas corretamente quando os dispositivos referenciados são renumerados.
 *
 * Mecanismo: ao inserir um dispositivo antes de outro, os subsequentes são renumerados.
 * O reducer adicionaElemento.ts emite StateType.RemissaoRenumerada para cada dispositivo
 * cujo lexmlId mudou. O editor responde chamando moduloRemissao.atualizarReferencias(),
 * que atualiza data-lexml-ref e o texto do link no DOM quando o texto era canônico.
 *
 * Verificação central: após renumeração, o atributo data-lexml-ref do link reflete
 * o novo lexmlId do dispositivo referenciado (não o antigo), e o link NÃO foi invalidado.
 * Quando o texto do link era canônico, ele também é atualizado para a forma canônica nova.
 *
 * Estratégias de detecção testadas:
 *   CT-G-01 — Absoluta 1 nível: "art. N" — renumeração de artigo
 *   CT-G-02 — Composta 2 níveis: "§ N do art. N" — renumeração de artigo
 *   CT-G-03 — Contextual parágrafo: "§ N deste artigo" — renumeração de artigo
 *   CT-G-04 — Absoluta 1 nível: source estável, destino renumera por inserção entre eles
 *   CT-G-05 — Contextual inciso: "inciso N deste parágrafo" — renumeração de inciso
 *   CT-G-06 — Contextual alínea: "alínea N deste inciso" — renumeração de alínea
 *   CT-G-07 — Composta 2 níveis: "§ N do art. N" — renumeração de parágrafo
 *   CT-G-08 — Invariante canônico: texto não-canônico preservado; canônico atualizado
 *
 * Nota sobre "Adicionar artigo/inciso/alínea antes":
 *   Insere o novo dispositivo na posição do atual e desloca todos os subsequentes +1.
 *
 * Nota sobre RemissaoRenumerada:
 *   Não dispara RemissaoInvalidada — links atualizados NÃO devem ganhar classe lexml-remissao-invalida.
 *
 * Nota sobre texto do link:
 *   atualizarReferencias() chama atualizarTextoRemissao() — se o texto era canônico (ex: "inciso II
 *   deste parágrafo"), é substituído pela forma canônica do novo ID. Texto não-canônico é preservado.
 *
 * Nota sobre a posição do texto contextual:
 *   "inciso N deste parágrafo" deve estar em um dispositivo filho do parágrafo (ex: inciso I),
 *   não no próprio parágrafo — buscarAncestralPorTipo('par') busca ancestrais, não o próprio device.
 *   Idem para "alínea N deste inciso" estar em uma alínea filha do inciso.
 */

const SEL_LINK = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO = 'a.lexml-remissao-interna.lexml-remissao-invalida';

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-01 — Absoluta simples: inserção antes do art. referenciado
// Estratégia: detecção composta 1 nível ("art. N")
// Cobertura unit: reducer-deteccao-composta.test.ts [CT-R1], [CT-R2]
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência absoluta "art. N" atualiza após inserção antes do referenciado', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // Art. 2 referencia Art. 1 via detecção absoluta ("art. 1º")
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para Art. 1 (lexmlId: art1)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
  });

  it('CT-G-01: inserção antes do art. referenciado → data-lexml-ref atualiza de art1 para art2', () => {
    // Insere art. antes do Art. 1 → Art. 1 (referenciado) passa a ser Art. 2 (art2)
    // Resultado: novo Art.1, ex-Art.1 → Art.2, ex-Art.2 (com link) → Art.3
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(3).should('exist'); // âncora: 3 artigos

    // Link está em Art. 3 (ex-Art. 2); deve apontar para Art. 2 (ex-Art. 1, lexmlId: art2)
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2');

    // Renumeração não invalida o link
    cy.getContainerArtigoByNumero(3).find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-02 — Composta 2 níveis: "§ N do art. N" atualiza após renumeração
// Estratégia: detecção composta 2 níveis
// Cobertura unit: reducer-deteccao-composta.test.ts [CT-C1], [CT-C2]
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência composta "§ N do art. N" atualiza após renumeração', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona § 1 ao Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona Art. 2
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // Art. 2 referencia § 1 do Art. 1 via detecção composta ("§ 1º do art. 1º")
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o § 1º do art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', '§ 1º do art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para § 1 do Art. 1 (lexmlId: art1_par1)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1_par1');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
  });

  it('CT-G-02: inserção antes do art. referenciado → data-lexml-ref atualiza de art1_par1 para art2_par1', () => {
    // Insere art. antes do Art. 1 → Art. 1 (e seu § 1) passam a ser Art. 2 / art2_par1
    // Resultado: novo Art.1, ex-Art.1+§1 → Art.2 com art2_par1, ex-Art.2 (com link) → Art.3
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(3).should('exist'); // âncora: 3 artigos

    // Link em Art. 3 (ex-Art. 2) deve apontar para art2_par1 (ex-art1_par1)
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par1');

    cy.getContainerArtigoByNumero(3).find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-03 — Contextual: "§ N deste artigo" atualiza quando artigo ancestral renumera
// Estratégia: detecção contextual (resolve via buscarAncestralPorTipo)
// Cobertura unit: reducer-deteccao-contextual.test.ts [CT-X1], [CT-X2], [CT-X5]
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência contextual "§ N deste artigo" atualiza com artigo ancestral', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona § 1 e § 2 ao Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);

    // § 1 referencia § 2 via detecção contextual ("§ 2º deste artigo")
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o § 2º deste artigo.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', '§ 2º deste artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para § 2 do Art. 1 (lexmlId: art1_par2)
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1_par2');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').eq(1).alterarTextoDoDispositivo('As exceções serão regulamentadas por ato do Poder Executivo.');
  });

  it('CT-G-03: inserção antes do art. ancestral → referência contextual atualiza de art1_par2 para art2_par2', () => {
    // Insere art. antes do Art. 1 → Art. 1 (e § 1, § 2) passam a ser Art. 2
    // Resultado: novo Art.1 (sem parágrafos), ex-Art.1 com §1 e §2 → Art.2 (art2_par1, art2_par2)
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(2).should('exist'); // âncora: 2 artigos

    // O novo Art. 1 não tem parágrafos → first() ainda aponta para § 1 do Art. 2 (ex-§ 1 do Art. 1)
    // Link em § 1 do Art. 2 deve apontar para art2_par2 (ex-art1_par2)
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par2');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-04 — Absoluta simples: destino renumerado por inserção entre source e destino
// Estratégia: detecção composta 1 nível ("art. N") — source estável, destino muda
// Cobertura unit: reducer-deteccao-composta.test.ts [CT-R1], [CT-R3]
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência absoluta atualiza quando novo art. inserido entre source e destino', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // Art. 1 referencia Art. 2 via detecção absoluta ("art. 2º")
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o art. 2º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'art. 2');

    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(1).find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para Art. 2 (lexmlId: art2)
    cy.getContainerArtigoByNumero(1).find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art2');

    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições previstas aplicam-se à administração pública direta e indireta.');
  });

  it('CT-G-04: inserção depois de Art. 1 → Art. 2 (referenciado) vira Art. 3; data-lexml-ref atualiza', () => {
    // Insere art. depois de Art. 1 → novo Art. 2; ex-Art. 2 (referenciado) → Art. 3
    // Resultado: Art.1 (com link), novo Art.2, ex-Art.2 → Art.3
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist'); // âncora: 3 artigos

    // Art. 1 permanece; link deve agora apontar para Art. 3 (ex-Art. 2, lexmlId: art3)
    cy.getContainerArtigoByNumero(1).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art3');

    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-05 — Contextual inciso: "inciso N deste parágrafo" atualiza após renumeração
// Estratégia: detecção contextual — buscarAncestralPorTipo('par') de inciso I = § 1
// Cobertura unit: reducer-deteccao-contextual.test.ts [CT-X3]
//
// Setup: § 1 → inciso I (source, com texto) → inciso II (destino)
// Inciso I está dentro de § 1 → buscarAncestralPorTipo('par') encontra § 1 ✓
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência contextual "inciso N deste parágrafo" atualiza após inserção', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona § 1 ao Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona inciso I ao § 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // Adiciona inciso II após inciso I (destino da referência)
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 2);

    // Inciso I (source) referencia inciso II contextualmente ("inciso II deste parágrafo")
    // Inciso I é filho de § 1 → buscarAncestralPorTipo('par') encontra § 1 → resolve inc2
    cy.get('div.container__elemento.elemento-tipo-inciso').first().digitarTextoRemissao('Conforme o inciso II deste parágrafo, aplica-se.');
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('p.texto__dispositivo').should('contain.text', 'inciso II deste parágrafo');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para inciso II do § 1 do Art. 1 (art1_par1_inc2)
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1_par1_inc2');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).alterarTextoDoDispositivo('à administração indireta');
  });

  it('CT-G-05: inserção de inciso antes do referenciado → data-lexml-ref e texto do link atualizam', () => {
    // Insere inciso após inciso I → inciso II (referenciado) passa a ser inciso III (inc3)
    // Resultado: inciso I (source, inalterado), novo inciso II, ex-inciso II → inciso III
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 3); // âncora

    // Link em inciso I (first): data-lexml-ref atualiza para inc3; texto canônico atualiza
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .first()
      .find(SEL_LINK)
      .should('have.length', 1)
      .and('have.attr', 'data-lexml-ref', 'art1_par1_inc3')
      .and('contain.text', 'inciso III deste parágrafo');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-06 — Contextual alínea: "alínea N deste inciso" atualiza após renumeração
// Estratégia: detecção contextual — buscarAncestralPorTipo('inc') de alínea a) = inciso I
// Cobertura unit: reducer-deteccao-contextual.test.ts [CT-X4]
//
// Setup: § 1 → inciso I → alínea a) (source, com texto) → alínea b) (destino)
// Alínea a) está dentro de inciso I → buscarAncestralPorTipo('inc') encontra inciso I ✓
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência contextual "alínea N deste inciso" atualiza após inserção', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona § 1 ao Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona inciso I ao § 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // Adiciona alínea a) ao inciso I
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length.gte', 1);

    // Adiciona alínea b) após alínea a) (destino da referência)
    cy.get('div.container__elemento.elemento-tipo-alinea').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea depois');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length.gte', 2);

    // Alínea a) (source) referencia alínea b) contextualmente ("alínea b) deste inciso")
    // Alínea a) é filha de inciso I → buscarAncestralPorTipo('inc') encontra inciso I → resolve ali2
    cy.get('div.container__elemento.elemento-tipo-alinea').first().digitarTextoRemissao('Conforme a alínea b) deste inciso, aplica-se.');
    cy.get('div.container__elemento.elemento-tipo-alinea').first().find('p.texto__dispositivo').should('contain.text', 'alínea b) deste inciso');

    cy.get('div.container__elemento.elemento-tipo-alinea').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-alinea').first().find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para alínea b) do inciso I (art1_par1_inc1_ali2)
    cy.get('div.container__elemento.elemento-tipo-alinea').first().find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1_par1_inc1_ali2');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
    cy.get('div.container__elemento.elemento-tipo-inciso').first().alterarTextoDoDispositivo('à administração direta');
    cy.get('div.container__elemento.elemento-tipo-alinea').eq(1).alterarTextoDoDispositivo('entidades constituídas no exterior');
  });

  it('CT-G-06: inserção de alínea antes da referenciada → data-lexml-ref e texto do link atualizam', () => {
    // Insere alínea após alínea a) → alínea b) (referenciada) passa a ser alínea c) (ali3)
    // Resultado: alínea a) (source, inalterada), nova alínea b), ex-alínea b) → alínea c)
    cy.get('div.container__elemento.elemento-tipo-alinea').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea depois');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length.gte', 3); // âncora

    // Link em alínea a) (first): data-lexml-ref atualiza para ali3; texto canônico atualiza
    cy.get('div.container__elemento.elemento-tipo-alinea')
      .first()
      .find(SEL_LINK)
      .should('have.length', 1)
      .and('have.attr', 'data-lexml-ref', 'art1_par1_inc1_ali3')
      .and('contain.text', 'alínea c) deste inciso');

    cy.get('div.container__elemento.elemento-tipo-alinea').first().find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-07 — Composta 2 níveis: "§ N do art. N" atualiza quando parágrafo renumera
// Source estável (Art. 2), destino (§ 2 do Art. 1) renumera por inserção antes
// Cobertura unit: reducer-deteccao-composta.test.ts [CT-C1], [CT-C3]
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: referência absoluta "§ N do art. N" atualiza quando parágrafo renumera', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona § 1 ao Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona § 2 após § 1 (destino da referência)
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);

    // Adiciona Art. 2 (source da referência)
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    // Art. 2 referencia § 2 do Art. 1 via detecção absoluta composta
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o § 2º do art. 1º, aplica-se.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', '§ 2º do art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
    // Pré-condição: link aponta para § 2 do Art. 1 (art1_par2)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1_par2');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
  });

  it('CT-G-07: inserção de § antes do referenciado → data-lexml-ref e texto do link atualizam', () => {
    // Insere § após § 1 → § 2 (referenciado) passa a ser § 3 (par3)
    // Resultado: § 1 (inalterado), novo § 2, ex-§ 2 (referenciado) → § 3
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 3); // âncora

    // Art. 2 permanece source; link deve apontar para § 3 do Art. 1 (art1_par3)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par3').and('contain.text', '§ 3º do art. 1º');

    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-08 — Invariante canônico: texto não-canônico preservado; restaurado atualiza
// Verifica a lógica de atualizarTextoRemissao em lexmlIdUtil.ts:
//   - Prefixo não-canônico ("inciso II teste") → texto preservado após renumeração
//   - Prefixo canônico ("inciso II") → texto atualizado para forma canônica nova
//
// Fluxo:
//   1. Detecta "inciso II deste parágrafo" → link art1_par1_inc2
//   2. Torna não-canônico via Quill API (insere " teste" dentro do link)
//   3. Renumera (inc2 → inc3): data-lexml-ref atualiza, texto NÃO atualiza
//   4. Restaura canônico via Quill API (substitui link para apontar a inc2 atual)
//   5. Renumera (inc2 → inc3): data-lexml-ref e texto ATUALIZAM
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização: texto não-canônico preservado; após restaurar canônico, atualiza', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Adiciona § 1 ao Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona inciso I ao § 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // Adiciona inciso II após inciso I (destino da referência)
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 2);

    // Inciso I referencia inciso II contextualmente
    cy.get('div.container__elemento.elemento-tipo-inciso').first().digitarTextoRemissao('Conforme o inciso II deste parágrafo, aplica-se.');
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('p.texto__dispositivo').should('contain.text', 'inciso II deste parágrafo');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par1_inc2');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
  });

  it('CT-G-08: texto não-canônico preservado; restaurado para canônico volta a atualizar', () => {
    // ── Fase 1: Criar link com texto não-canônico via Quill API ─────────────
    // Substitui link completo por texto "inciso II teste deste parágrafo" usando
    // RemissaoInternaValue completo (com refId e targetUuid) para que data-ref-id
    // e href sejam setados pelo blot — necessário para atualizarReferencias filtrar corretamente.
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .first()
      .then($inc => {
        return cy.window().then(win => {
          const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
          const quill = editorEl?.quill;
          if (!quill) return;

          const link = $inc[0].querySelector('a[data-lexml-ref="art1_par1_inc2"]');
          if (!link) return;

          const EtaQuillClass = quill.constructor as any;
          const blot = EtaQuillClass.find(link);
          if (!blot) return;

          // Captura refId e targetUuid do link original — necessários para o RemissaoInternaValue
          const refId = link.getAttribute('data-ref-id');
          const href = link.getAttribute('href') || '';
          const uuidMatch = href.match(/#lxEtaId(\d+)/);
          const targetUuid = uuidMatch ? parseInt(uuidMatch[1], 10) : 0;

          const linkOffset = blot.offset(quill.scroll);
          const len = blot.length();

          // Usa RemissaoInternaValue completo: create(object) seta data-lexml-ref, data-ref-id e href
          const remissaoNaoCanonica = { refId, targetLexmlId: 'art1_par1_inc2', targetUuid };
          const Delta = EtaQuillClass.import('delta');
          quill.updateContents(
            new Delta([{ retain: linkOffset }, { delete: len }, { insert: 'inciso II teste deste parágrafo', attributes: { 'remissao-interna': remissaoNaoCanonica } }]),
            'silent'
          );
        });
      });

    // Pré-condição fase 1: link existe com texto não-canônico
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK).should('contain.text', 'inciso II teste').and('have.attr', 'data-lexml-ref', 'art1_par1_inc2');

    // ── Fase 2: Renumeração — texto NÃO deve atualizar ──────────────────────
    // Insere inciso após inciso I → inc2 (referenciado) → inc3
    // atualizarTextoRemissao("inciso II teste deste parágrafo", inc2, inc3):
    //   prefixo "inciso II teste" não é canônico de inc2 → preserva texto
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 3); // âncora

    // data-lexml-ref atualiza para inc3, mas texto permanece não-canônico
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK).should('have.attr', 'data-lexml-ref', 'art1_par1_inc3').and('contain.text', 'inciso II teste');

    // ── Fase 3: Restaurar texto canônico apontando para inc3 (ex-inc2) ──────
    // Substitui o link inteiro (data-lexml-ref="art1_par1_inc3") por link canônico
    // "inciso III deste parágrafo" apontando para o mesmo dispositivo (inc3/ex-inc2).
    // Na Fase 4, ao inserir mais um inciso, inc3 → inc4 e o texto canônico será atualizado.
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .first()
      .then($inc => {
        return cy.window().then(win => {
          const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
          const quill = editorEl?.quill;
          if (!quill) return;

          const link = $inc[0].querySelector('a[data-lexml-ref="art1_par1_inc3"]');
          if (!link) return;

          const EtaQuillClass = quill.constructor as any;
          const blot = EtaQuillClass.find(link);
          if (!blot) return;

          const refId = link.getAttribute('data-ref-id');
          const href = link.getAttribute('href') || '';
          const uuidMatch = href.match(/#lxEtaId(\d+)/);
          const targetUuid = uuidMatch ? parseInt(uuidMatch[1], 10) : 0;

          const offset = blot.offset(quill.scroll);
          const len = blot.length();

          // Link canônico para inc3: na próxima renumeração inc3→inc4, atualizarTextoRemissao
          // verá texto canônico "inciso III deste parágrafo" e atualizará para "inciso IV deste parágrafo"
          const remissaoCanonica = { refId, targetLexmlId: 'art1_par1_inc3', targetUuid };
          const Delta = EtaQuillClass.import('delta');
          quill.updateContents(
            new Delta([{ retain: offset }, { delete: len }, { insert: 'inciso III deste parágrafo', attributes: { 'remissao-interna': remissaoCanonica } }]),
            'silent'
          );
        });
      });

    // Pré-condição fase 3: link restaurado com texto canônico "inciso III" e destino inc3
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .first()
      .find(SEL_LINK)
      .should('have.attr', 'data-lexml-ref', 'art1_par1_inc3')
      .and('contain.text', 'inciso III deste parágrafo');

    // ── Fase 4: Renumeração — texto DEVE atualizar desta vez ─────────────────
    // Insere mais um inciso após inciso I → inc3 (alvo, canônico restaurado) → inc4
    // atualizarTextoRemissao("inciso III deste parágrafo", inc3, inc4):
    //   prefixo "inciso III" É canônico de inc3 → atualiza para "inciso IV deste parágrafo"
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 4); // âncora

    // Desta vez data-lexml-ref E texto foram atualizados
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .first()
      .find(SEL_LINK)
      .should('have.attr', 'data-lexml-ref', 'art1_par1_inc4')
      .and('contain.text', 'inciso IV deste parágrafo');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK_INVALIDO).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-G-09 — Renumeração simultânea: múltiplos tipos em um único evento
//
// Uma única inserção (art. antes de Art. 1) dispara RemissaoRenumerada para
// art1, art1_par1 e art1_par2. Cinco remissões apontando para esses alvos
// são atualizadas simultaneamente, cada uma com comportamento distinto:
//
//   A) Absoluta simples    "art. 1º"                   → ref e texto atualizados
//   B) Absoluta em cadeia  "§ 1º do art. 1º"           → ref e texto atualizados
//   C) Manual canônica     "art. 1º" (via Quill)       → ref e texto atualizados
//                           (sem textoFixo desde c5184d59, comportamento igual a A)
//   D) Manual não-canônica "o artigo primeiro"          → ref atualiza, texto preservado
//   E) Contextual §        "§ 2º deste artigo"          → ref atualiza, texto preservado
//   F) Contextual inc      "inciso II deste parágrafo"  → ref atualiza, texto preservado
//   G) Contextual ali      "alínea b) deste inciso"     → ref atualiza, texto preservado
//
// Nota: agrupador único (Seção Única / Capítulo Único) não está incluído —
// a adição de agrupadores requer UI diferente da de dispositivos e não há
// comando Cypress padronizado para esse fluxo ainda.
//
// Setup:
//   Art. 1 (→ Art. 2)
//     § 1 (→ art2_par1)  ← fonte E: "§ 2º deste artigo"
//       Inciso I  (→ art2_par1_inc1)          ← fonte F: "inciso II deste parágrafo"
//       Inciso II (→ art2_par1_inc2)          ← destino F
//         Alínea a) (→ art2_par1_inc2_ali1)   ← fonte G: "alínea b) deste inciso"
//         Alínea b) (→ art2_par1_inc2_ali2)   ← destino G
//     § 2 (→ art2_par2)  ← destino E
//   Art. 2 (→ Art. 3)    ← fonte A (abs. simples)
//   Art. 3 (→ Art. 4)    ← fonte B (abs. em cadeia)
//   Art. 4 (→ Art. 5)    ← fonte C (manual canônica)
//   Art. 5 (→ Art. 6)    ← fonte D (manual não-canônica, modificada no it())
// ─────────────────────────────────────────────────────────────────────────────
describe('Atualização simultânea: absoluta simples, em cadeia, contextual e manual na mesma renumeração', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // ── Art. 1: adiciona § 1 e § 2 ──────────────────────────────────────────
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);

    // ── § 1: adiciona Inciso I e Inciso II ──────────────────────────────────
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 2);

    // ── Inciso II: adiciona Alínea a) e Alínea b) ───────────────────────────
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length.gte', 1);

    cy.get('div.container__elemento.elemento-tipo-alinea').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea depois');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length.gte', 2);

    // § 1 referencia § 2 contextualmente — detecção antes de criar Arts. 2-5
    // para isolar a detecção ao escopo de Art. 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o § 2º deste artigo, conforme estabelecido.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', '§ 2º deste artigo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par2');

    // F: Inciso I referencia Inciso II contextualmente ("inciso II deste parágrafo")
    // Inciso I é filho de § 1 → buscarAncestralPorTipo('par') encontra § 1 → resolve inc2
    cy.get('div.container__elemento.elemento-tipo-inciso').first().digitarTextoRemissao('Conforme o inciso II deste parágrafo, aplica-se.');
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('p.texto__dispositivo').should('contain.text', 'inciso II deste parágrafo');
    cy.get('div.container__elemento.elemento-tipo-inciso').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-inciso').first().find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par1_inc2');

    // G: Alínea a) referencia Alínea b) contextualmente ("alínea b) deste inciso")
    // Alínea a) é filha de Inciso II → buscarAncestralPorTipo('inc') encontra Inciso II → resolve ali2
    cy.get('div.container__elemento.elemento-tipo-alinea').first().digitarTextoRemissao('Conforme a alínea b) deste inciso, aplica-se.');
    cy.get('div.container__elemento.elemento-tipo-alinea').first().find('p.texto__dispositivo').should('contain.text', 'alínea b) deste inciso');
    cy.get('div.container__elemento.elemento-tipo-alinea').first().dispararDeteccaoRemissao();
    cy.get('div.container__elemento.elemento-tipo-alinea').first().find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par1_inc2_ali2');

    // ── Art. 2: absoluta simples "art. 1º" ──────────────────────────────────
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');

    // ── Art. 3: absoluta em cadeia "§ 1º do art. 1º" ───────────────────────
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o § 1º do art. 1º, aplica-se.');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', '§ 1º do art. 1');
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1_par1');

    // ── Art. 4: manual canônico — detectado como "art. 1º" ──────────────────
    // Representa remissão criada via diálogo com texto canônico.
    // Após remoção de textoFixo (c5184d59), texto canônico de remissão manual
    // é atualizado da mesma forma que remissão auto-detectada.
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(4).should('exist');
    cy.getContainerArtigoByNumero(4).digitarTextoRemissao('Ver o art. 1º para mais detalhes.');
    cy.getContainerArtigoByNumero(4).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(4).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(4).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');

    // ── Art. 5: manual não-canônico — detectado como "art. 1º", modificado no it() ──
    // Representa remissão criada via diálogo com texto personalizado ("o artigo primeiro").
    // O texto não-canônico será preservado após renumeração.
    cy.getContainerArtigoByNumero(4).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(5).should('exist');
    cy.getContainerArtigoByNumero(5).digitarTextoRemissao('Conforme previsto no art. 1º, observa-se o seguinte.');
    cy.getContainerArtigoByNumero(5).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(5).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(5).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1');

    // Fillers nos dispositivos de suporte
    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').eq(1).alterarTextoDoDispositivo('As exceções serão regulamentadas por ato do Poder Executivo.');
    cy.get('div.container__elemento.elemento-tipo-inciso').eq(1).alterarTextoDoDispositivo('à administração indireta');
    cy.get('div.container__elemento.elemento-tipo-alinea').eq(1).alterarTextoDoDispositivo('entidades constituídas no exterior');
  });

  it('CT-G-09: renumeração simultânea — abs. simples/cadeia/manual-canônica atualizam; contextual (§, inc, ali) e manual-não-canônica preservam texto', () => {
    // ── Fase 1: tornar Art. 5 não-canônico ──────────────────────────────────
    // Substitui "art. 1º" por "o artigo primeiro" no link de Art. 5.
    // data-ref-id e targetUuid copiados do link existente para que atualizarReferencias
    // localize o link corretamente pelo UUID ao processar RemissaoRenumerada.
    cy.getContainerArtigoByNumero(5).then($art => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const link = $art[0].querySelector('a[data-lexml-ref="art1"]') as HTMLElement;
        if (!link) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        const refId = link.getAttribute('data-ref-id');
        const href = link.getAttribute('href') || '';
        const uuidMatch = href.match(/#lxEtaId(\d+)/);
        const targetUuid = uuidMatch ? parseInt(uuidMatch[1], 10) : 0;

        const offset = blot.offset(quill.scroll);
        const len = blot.length();
        const Delta = EtaQuillClass.import('delta');

        quill.updateContents(
          new Delta([{ retain: offset }, { delete: len }, { insert: 'o artigo primeiro', attributes: { 'remissao-interna': { refId, targetLexmlId: 'art1', targetUuid } } }]),
          'silent'
        );
      });
    });

    // Pré-condição: Art. 5 tem link não-canônico apontando para art1
    cy.getContainerArtigoByNumero(5).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art1').and('contain.text', 'o artigo primeiro');

    // Sincroniza dispositivo.texto com o HTML real do Quill (edição via 'silent' não passa pelo
    // caminho normal de text-change, que numa digitação real do usuário sempre sincronizaria
    // imediatamente — sem isso, a Fase 2 veria o texto ORIGINAL "art. 1º" ainda gravado no estado
    // e sobrescreveria incorretamente o texto manual "o artigo primeiro" preservado no DOM).
    cy.getContainerArtigoByNumero(5).sincronizarTextoComQuill();

    // ── Fase 2: renumeração — insere art. antes de Art. 1 ───────────────────
    // Novo Art. 1 (vazio); ex-Art. 1 → Art. 2 (e filhos); ex-Art. 2 → Art. 3 etc.
    // Dispara RemissaoRenumerada: art1→art2, art1_par1→art2_par1, art1_par2→art2_par2,
    // art1_par1_inc1→art2_par1_inc1, art1_par1_inc2→art2_par1_inc2,
    // art1_par1_inc2_ali1→art2_par1_inc2_ali1, art1_par1_inc2_ali2→art2_par1_inc2_ali2
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(6).should('exist'); // âncora: 6 artigos

    // ── Fase 3: asserções ────────────────────────────────────────────────────

    // A) Absoluta simples — Art. 3 (ex-Art. 2): ref e texto atualizados
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2').and('contain.text', 'art. 2º');

    // B) Absoluta em cadeia — Art. 4 (ex-Art. 3): ref e texto atualizados
    cy.getContainerArtigoByNumero(4).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_par1').and('contain.text', '§ 1º do art. 2º');

    // C) Manual canônica — Art. 5 (ex-Art. 4): ref e texto atualizados
    // Demonstra que, após remoção de textoFixo, remissão manual com texto
    // canônico se comporta igual a remissão auto-detectada
    cy.getContainerArtigoByNumero(5).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2').and('contain.text', 'art. 2º');

    // D) Manual não-canônica — Art. 6 (ex-Art. 5): ref atualiza, texto preservado
    cy.getContainerArtigoByNumero(6).find(SEL_LINK).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2').and('contain.text', 'o artigo primeiro');

    // E) Contextual § — § 1 de Art. 2 (ex-§ 1 de Art. 1): ref atualiza, texto preservado
    // "§ 2º deste artigo" é relativo ao artigo pai — semanticamente correto em Art. 2
    cy.get('div.container__elemento.elemento-tipo-paragrafo')
      .first()
      .find(SEL_LINK)
      .should('have.length', 1)
      .and('have.attr', 'data-lexml-ref', 'art2_par2')
      .and('contain.text', '§ 2º deste artigo');

    // F) Contextual inc — Inciso I (em Art. 2): ref atualiza, texto preservado
    // "inciso II deste parágrafo" não muda — o inciso não foi renumerado, só o artigo-pai
    cy.get('div.container__elemento.elemento-tipo-inciso')
      .first()
      .find(SEL_LINK)
      .should('have.length', 1)
      .and('have.attr', 'data-lexml-ref', 'art2_par1_inc2')
      .and('contain.text', 'inciso II deste parágrafo');

    // G) Contextual ali — Alínea a) (em Art. 2): ref atualiza, texto preservado
    // "alínea b) deste inciso" não muda — a alínea não foi renumerada, só o artigo-pai
    cy.get('div.container__elemento.elemento-tipo-alinea')
      .first()
      .find(SEL_LINK)
      .should('have.length', 1)
      .and('have.attr', 'data-lexml-ref', 'art2_par1_inc2_ali2')
      .and('contain.text', 'alínea b) deste inciso');

    // Renumeração nunca invalida links
    cy.get(SEL_LINK_INVALIDO).should('not.exist');
  });
});

export {};
