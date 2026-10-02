/**
 * Grupo L — Remissão para o caput em ações que recriam o artigo
 *
 * Change 2026-09-23-c02-preservar-identidade-caput-no-undo. O undo recria o artigo removido ou movido;
 * o caput precisa voltar com a mesma identidade, senão a remissão para ele perde o vínculo.
 *
 *   CT-L-01 — remover o artigo invalida o link para o caput; desfazer o torna válido de novo
 *   CT-L-02 — mover o artigo e desfazer mantém o link para o caput, com o texto da posição restaurada
 *   CT-L-03 — com o foco na origem, um único desfazer restaura o artigo removido (a marcação de inválido
 *             sincronizada ao perder o foco não vira passo de desfazer)
 *   CT-L-04 — refazer a remoção invalida de novo o link para o caput; desfazer o torna válido de novo
 *
 *   CT-L-05 — digitar "caput do art. 2º" cria o link para o caput (change 2026-09-30-c02), que acompanha a
 *             remoção e o desfazer como o link vindo do arquivo
 *   CT-L-06 — vários links inválidos ao mesmo destino excluído (três formas de "caput do art. 2º") salvam sem
 *             alerta e gravam um id `_ri` distinto em cada <Remissao>
 *
 * Fixture: demo/doc/teste_remissao_caput.json, gerado por criarDocumentoArticulado() — três artigos, o
 * art. 1º com remissão para o caput do art. 2º. Os CT-L-01 a 04 usam o arquivo, que cobre o caminho de abrir;
 * o CT-L-05 digita o texto, que cobre a detecção ao vivo.
 *
 * O caput não tem container próprio no DOM, então o href não é comparado com o id de um container
 * (como no grupo K): a verificação é que o href depois do undo é o mesmo de antes da ação, isto é,
 * o caput restaurado tem o mesmo uuid.
 */

const SEL_LINK_L = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO_L = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_BTN_DESFAZER_L = '.lx-eta-btn-desfazer';
// O botão de refazer não tem classe própria; o title sozinho colide com o do editor-texto-rico (ql-redo).
const SEL_BTN_REFAZER_L = 'button.lx-eta-ql-button[title="Refazer (Ctrl+y)"]';
const SEL_MENSAGEM_INVALIDA_L = '.container__texto--mensagem .mensagem--danger';

describe('Remissão para o caput ao desfazer ações que recriam o artigo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_caput.json', { force: true });
    cy.getContainerArtigoByNumero(3).should('exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });

  it('CT-L-01: remover invalida o link para o caput e desfazer o torna válido de novo', () => {
    cy.getContainerArtigoByNumero(1)
      .find(SEL_LINK_L)
      .invoke('attr', 'href')
      .then(hrefOriginal => {
        cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

        cy.get(SEL_BTN_DESFAZER_L).click();

        cy.getContainerArtigoByNumero(3).should('exist'); // âncora: art. 2º restaurado
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt').and('have.attr', 'href', hrefOriginal);
      });
  });

  it('CT-L-03: com o foco na origem, um único desfazer restaura o artigo removido', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

    // No uso manual a origem pode já ser a linha atual quando o link recebe a classe de inválido; no Cypress a
    // marcação chega antes da troca de linha. Emula esse tempo: htmlAnt sem a classe deixa a origem "alterada".
    cy.getContainerArtigoByNumero(1).then($container => {
      cy.window().then((win: any) => {
        const quill = win.document.querySelector('lexml-eta-proposicao-editor').quill;
        const p = $container[0].querySelector('p.texto__dispositivo') as HTMLElement;
        const linha = quill.getLinha(parseInt(p.id.replace('texto__dispositivo', ''), 10));
        quill.atualizarLinhaCorrente(linha);
        linha.blotConteudo.htmlAnt = linha.blotConteudo.html.replace(' lexml-remissao-invalida', '');
      });
    });

    // Tira o foco do editor como um clique humano (cy.click não move o foco para o botão): dispara o flush do Gatilho B.
    cy.get(SEL_BTN_DESFAZER_L).then($botao => {
      ($botao[0] as HTMLElement).focus();
      ($botao[0] as HTMLElement).click();
    });

    // cy.get reconsulta até o art. 2º voltar; getContainerArtigoByNumero resolve uma única vez e não serve de âncora aqui.
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });

  it('CT-L-04: refazer a remoção invalida de novo o link para o caput, e desfazer o torna válido', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

    cy.get(SEL_BTN_DESFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');

    cy.get(SEL_BTN_REFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA_L).should('exist');

    cy.get(SEL_BTN_DESFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });

  it('CT-L-02: desfazer o movimento mantém o link para o caput na posição restaurada', () => {
    cy.getContainerArtigoByNumero(1)
      .find(SEL_LINK_L)
      .invoke('attr', 'href')
      .then(hrefOriginal => {
        cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Mover para cima');
        // A origem desce para art. 2º e o destino sobe para art. 1º.
        cy.getContainerArtigoByNumero(2).find(SEL_LINK_L).should('have.attr', 'data-lexml-ref', 'art1_cpt');

        cy.get(SEL_BTN_DESFAZER_L).click();

        cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt').and('contain.text', 'caput do art. 2º');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
        cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.attr', 'href', hrefOriginal);
      });
  });
});

describe('Remissão para o caput digitada no texto', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');
  });

  it('CT-L-05: "caput do art. 2º" digitado vira link para o caput e acompanha remover e desfazer', () => {
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o caput do art. 2º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt').and('contain.text', 'caput do art. 2º');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 1);

    cy.get(SEL_BTN_DESFAZER_L).click();
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2_cpt');
  });
});

describe('Salvar com vários links inválidos para o mesmo destino excluído', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');
  });

  it('CT-L-06: salva sem alerta e com ids _ri distintos após excluir o destino de três links ao caput', () => {
    // O download é um blob: captura o conteúdo em vez de depender do diretório de downloads do navegador.
    const arquivosSalvos: Promise<string>[] = [];
    const alertas: string[] = [];
    cy.window().then(win => {
      const criarOriginal = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, 'createObjectURL').callsFake((obj: Blob) => {
        arquivosSalvos.push(obj.text());
        return criarOriginal(obj);
      });
      cy.stub(win, 'alert').callsFake((mensagem: string) => alertas.push(mensagem));
    });

    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Veja o caput do art. 2º, o caput do art. 2 e o CAPUT DO ART. 2º.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_L).should('have.length', 3).and('have.attr', 'data-lexml-ref', 'art2_cpt');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO_L).should('have.length', 3);

    cy.get('input[type="button"][value="Salvar"]').click();

    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));
    cy.wrap(null)
      .then(() => {
        expect(alertas, 'nenhum alerta de erro ao salvar').to.deep.equal([]);
        return cy.wrap(arquivosSalvos[0]);
      })
      .then(texto => {
        const ids: string[] = [];
        const coletar = (valor: any): void => {
          if (!valor || typeof valor !== 'object') return;
          if (Array.isArray(valor)) return valor.forEach(coletar);
          if (valor.name?.localPart === 'Remissao' && valor.value?.id) ids.push(valor.value.id);
          Object.values(valor).forEach(coletar);
        };
        coletar(JSON.parse(texto as string));
        expect(ids, 'um <Remissao id> por link inválido').to.have.length(3);
        expect(new Set(ids).size, 'ids distintos').to.equal(3);
      });
  });
});
