/**
 * Abertura de documento com numeração repetida (change 2026-11-23-c01-validacao-numeracao-flexivel, #1066).
 *
 * Fixture: demo/doc/teste_numeracao_repetida.json, gerada por criarDocumentoArticulado() (mesmo código de produção
 * usado ao salvar), não escrita à mão: "Art. 5º", "Art. 5º" (com dois incisos) e "Art. 6º".
 * demo/doc/teste_numeracao_repetida_ultimo.json é a mesma fixture sem os incisos e o "Art. 6º" (o repetido fica na última linha).
 * O modo flexível é escolhido no seletor `#validacaoNumeracao` da demo antes de abrir o arquivo (o `#fileUpload` da demo
 * lê o arquivo com o mesmo modo do componente).
 */

import { TECLA_ENTER, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const FIXTURE = 'demo/doc/teste_numeracao_repetida.json';
const FIXTURE_ULTIMO = 'demo/doc/teste_numeracao_repetida_ultimo.json';
const ERRO = 'Dispositivo com numeração repetida';
const ERRO_LACUNA = 'Dispositivo com lacuna na numeração';
const ALERTA = 'Existem dispositivos com numeração irregular.';

const SEL_ARTIGO = 'div.container__elemento.elemento-tipo-artigo';
const artigo = (indice: number): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(SEL_ARTIGO).eq(indice);
// Conta com retry (e aceita zero): cy.get('div.mensagem') exigiria ao menos uma mensagem na tela.
const esperarMensagensDeNumeracao = (quantidade: number): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy.get<HTMLElement>('body').should($body => {
    const mensagens = $body.find('div.mensagem').filter((_, el) => (el.textContent ?? '').includes(ERRO));
    expect(mensagens).to.have.length(quantidade);
  });
const textoDosAlertas = (): Cypress.Chainable<string> => cy.get('lexml-eta-alertas').then($el => $el[0].shadowRoot?.textContent ?? '');

const ligarModoFlexivel = (): void => {
  cy.get('#validacaoNumeracao').select('flexivel');
};

const getQuill = (win: Window): any => (win.document.querySelector('lexml-eta-proposicao-editor') as any).quill;
const segundoArtigo = (quill: any): any => {
  const artigos: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) linha.tipo === 'Artigo' && artigos.push(linha);
  return artigos[1];
};
const clicarNoSegundoArtigo = (alvo: (linha: any) => Element, dx?: number): void => {
  cy.window().then(win => {
    const r = alvo(segundoArtigo(getQuill(win))).getBoundingClientRect();
    return cliqueNativo(win, dx === undefined ? r.left + r.width / 2 : r.left + dx, r.top + r.height / 2);
  });
};
// Clique nativo: o sintético não move o cursor, e é o cursor deixado no painel removido que quebrava o Enter (como no #1074).
// A espera deixa o foco inicial (ementa) terminar: depois dele, o clique não é mais desfeito.
const corrigirSegundoArtigoPorCliqueNativo = (): void => {
  cy.wait(1000);
  clicarNoSegundoArtigo(linha => linha.blotConteudo.domNode, 20);
  cy.window().should(win => expect(getQuill(win).linhaAtual === segundoArtigo(getQuill(win)), 'cursor no segundo artigo').to.be.true);
  clicarNoSegundoArtigo(linha => linha.domNode.querySelector('.mensagem__fix'));
};
const esperarCursorNoInicioDoArt2 = (): void => {
  cy.get('lexml-eta-proposicao-editor').should($editor => {
    const quill = ($editor[0] as any).quill;
    expect(quill.linhaAtual.blotRotulo.domNode.textContent).to.equal('Art. 2º');
    expect(quill.getSelection()?.index).to.equal(quill.inicioConteudoAtual);
  });
};
const esperarArtigos = (esperados: { rotulo: string; texto: string }[]): void => {
  cy.get(SEL_ARTIGO).should($artigos => {
    const linhas = $artigos.toArray().map(a => ({ rotulo: a.querySelector('label')?.textContent?.trim(), texto: a.querySelector('p.texto__dispositivo')?.textContent?.trim() }));
    expect(linhas).to.deep.equal(esperados);
  });
};

describe('Abertura de documento com numeração repetida', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then(win => win.localStorage.setItem('naoMostrarNovamenteDisclaimerMarcaAlteracao', 'true'));
  });

  describe('modo flexível', () => {
    beforeEach(() => {
      ligarModoFlexivel();
      cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
      cy.get(SEL_ARTIGO).should('have.length', 3);
    });

    it('exibe o alerta global, a lacuna no primeiro "Art. 5º" e o erro de repetição só no segundo', () => {
      cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').to.include(ALERTA));
      cy.get('lexml-eta-alertas').shadow().find('sl-alert').contains(ALERTA).find('.alert__close-button').should('not.exist');

      // O grupo de artigos começa em 5 (o esperado é 1): o primeiro tem lacuna; no segundo, a repetição prevalece sobre ela.
      artigo(0).find('div.mensagem').should('contain.text', ERRO_LACUNA).and('not.contain.text', ERRO);
      artigo(1).find('div.mensagem').should('contain.text', ERRO).and('not.contain.text', ERRO_LACUNA);
      // O "Art. 6º" continua a sequência a partir do maior número anterior: sem erro.
      artigo(2).find('div.mensagem').should('not.exist');
      // Os incisos do segundo artigo repetem o id só por herança: não recebem o erro.
      cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 2).find('div.mensagem').should('not.exist');
      esperarMensagensDeNumeracao(1);
    });

    it('"Corrigir agora" renumera os artigos, retira o erro e o alerta', () => {
      // O clique age na linha do cursor: a linha do segundo artigo é marcada antes (guia, seção 4).
      artigo(1).getOpcoesDeMenuDoDispositivo();
      artigo(1).find('.mensagem__fix').click();

      cy.get(SEL_ARTIGO).should($artigos => {
        expect($artigos.toArray().map(a => a.querySelector('label')?.textContent?.trim())).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º']);
      });
      esperarMensagensDeNumeracao(0);
      cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').not.to.include(ALERTA));
    });

    it('desfazer devolve os dois "Art. 5º", o erro e o alerta', () => {
      artigo(1).getOpcoesDeMenuDoDispositivo();
      artigo(1).find('.mensagem__fix').click();
      cy.get(SEL_ARTIGO).eq(2).find('label').should('contain.text', 'Art. 3º');

      cy.get('.lx-eta-btn-desfazer').click({ force: true });

      cy.get(SEL_ARTIGO).should($artigos => {
        expect($artigos.toArray().map(a => a.querySelector('label')?.textContent?.trim())).to.deep.equal(['Art. 5º', 'Art. 5º', 'Art. 6º']);
      });
      esperarMensagensDeNumeracao(1);
      cy.get('lexml-eta-alertas').should($el => expect($el[0].shadowRoot?.textContent ?? '').to.include(ALERTA));
    });

    it('depois do clique em "Corrigir agora", o cursor fica no início do texto e o Enter cria um artigo antes', () => {
      corrigirSegundoArtigoPorCliqueNativo();
      cy.get(SEL_ARTIGO).eq(2).find('label').should('contain.text', 'Art. 3º');
      esperarCursorNoInicioDoArt2();

      cy.then(() => teclaNativa(TECLA_ENTER));

      esperarArtigos([
        { rotulo: 'Art. 1º', texto: 'Primeiro artigo.' },
        { rotulo: 'Art. 2º', texto: '' },
        { rotulo: 'Art. 3º', texto: 'Segundo artigo, com numeração repetida:' },
        { rotulo: 'Art. 4º', texto: 'Terceiro artigo.' },
      ]);
      cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length', 2);
    });
  });

  // Com a mensagem abaixo da última linha, o clique deixava a seleção salva no menu vazio do fim do documento.
  describe('modo flexível, com o artigo repetido na última linha', () => {
    beforeEach(() => {
      ligarModoFlexivel();
      cy.get('#fileUpload').selectFile(FIXTURE_ULTIMO, { force: true });
      cy.get(SEL_ARTIGO).should('have.length', 2);
    });

    it('depois do clique em "Corrigir agora", o cursor fica no início do texto e o Enter cria um artigo antes', () => {
      corrigirSegundoArtigoPorCliqueNativo();
      cy.get(SEL_ARTIGO).eq(1).find('label').should('contain.text', 'Art. 2º');
      esperarCursorNoInicioDoArt2();

      cy.then(() => teclaNativa(TECLA_ENTER));

      esperarArtigos([
        { rotulo: 'Art. 1º', texto: 'Primeiro artigo.' },
        { rotulo: 'Art. 2º', texto: '' },
        { rotulo: 'Art. 3º', texto: 'Segundo artigo, com numeração repetida.' },
      ]);
    });
  });

  describe('seletor de modo', () => {
    it('começa em rígido e trocar o modo não encerra o documento aberto', () => {
      cy.get('#validacaoNumeracao').should('have.value', 'rigida');
      ligarModoFlexivel();
      cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
      cy.get(SEL_ARTIGO).should('have.length', 3);

      cy.get('#validacaoNumeracao').select('rigida');

      cy.get(SEL_ARTIGO).should('have.length', 3);
      esperarMensagensDeNumeracao(1);
    });
  });

  describe('modo rígido (padrão)', () => {
    it('recusa o mesmo arquivo e não abre o documento', () => {
      cy.window().then(win => cy.stub(win, 'alert').as('alerta'));

      cy.get('#fileUpload').selectFile(FIXTURE, { force: true });

      cy.get('@alerta').should('have.been.calledWithMatch', /repetidos/);
      cy.get(SEL_ARTIGO).should('not.exist');
      textoDosAlertas().should('not.include', ALERTA);
    });
  });
});
