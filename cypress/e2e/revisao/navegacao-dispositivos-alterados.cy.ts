// #1096: o botão "Ir para o dispositivo alterado anterior" não saía do último artigo, excluído em revisão.
// Edição e exclusão por eventos nativos (CDP), para passarem pelo editor como as do usuário.
import { CTRL, TECLA_D, TECLA_X, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const TEXTOS = [1, 2, 3, 4, 5, 6].map(n => `Texto do artigo ${n}.`);

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

const linhas = (quill: any): any[] => {
  const lista: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) lista.push(linha);
  return lista;
};

// Os artigos são achados pelo número original, que fica no texto: excluir em revisão renumera os de baixo.
const numeroOriginal = (linha: any): string | undefined => /artigo (\d)/.exec(linha?.blotConteudo?.domNode?.textContent ?? '')?.[1];

const linhaDoArtigo = (quill: any, n: number): any => linhas(quill).find(l => l.tipo === 'Artigo' && numeroOriginal(l) === String(n));

const excluido = (linha: any): boolean => linha?.elemento?.revisao?.descricao === 'Dispositivo removido';

const nome = (linha: any): string => `art${numeroOriginal(linha) ?? '?'}${excluido(linha) ? ' (excluído)' : ''}`;

const clicarNoInicioDoTexto = (n: number): void => {
  // O menu da linha é remontado depois de cada ação; um clique logo em seguida pode não mudar a linha.
  cy.wait(500);
  cy.window().then(win => {
    const r = (linhaDoArtigo(getQuill(win), n).blotConteudo.domNode as HTMLElement).getBoundingClientRect();
    return cliqueNativo(win, r.left + 2, r.top + r.height / 2);
  });
  cy.window().should(win => {
    const quill = getQuill(win);
    expect(quill.linhaAtual === linhaDoArtigo(quill, n), `cursor no artigo ${n}`).to.be.true;
    expect(quill.isProcessandoMudancaLinha).to.be.false;
  });
};

// Digita "x" no início do texto e sai da linha, o que grava a alteração.
const alterar = (n: number, saidaPara: number): void => {
  clicarNoInicioDoTexto(n);
  cy.then(() => teclaNativa(TECLA_X));
  clicarNoInicioDoTexto(saidaPara);
  cy.window().should(win => expect(linhaDoArtigo(getQuill(win), n).elemento?.revisao?.descricao).to.equal('Texto do dispositivo foi alterado'));
};

const excluir = (n: number): void => {
  clicarNoInicioDoTexto(n);
  cy.then(() => teclaNativa(TECLA_D, CTRL));
  cy.window().should(win => expect(excluido(linhaDoArtigo(getQuill(win), n)), `artigo ${n} excluído`).to.be.true);
};

const irParaEmenta = (): void => {
  cy.window().then(win => {
    const quill = getQuill(win);
    const ementa = linhas(quill).find(l => l.tipo === 'Ementa');
    quill.setSelection(quill.getIndex(ementa.blotConteudo), 0, 'user');
  });
  cy.window().should(win => expect(getQuill(win).linhaAtual.tipo).to.equal('Ementa'));
};

// Clica no botão até passar por todas as marcas esperadas e confere que um clique a mais não sai da última.
const percorrer = (botao: 'proximo' | 'anterior', esperadas: string[]): void => {
  const visitadas: string[] = [];
  [...esperadas, 'repetida'].forEach(() => {
    cy.get('.button-navegacao-marca')
      .eq(botao === 'proximo' ? 0 : 1)
      .click({ force: true });
    cy.wait(300);
    cy.window().then(win => visitadas.push(nome(getQuill(win).linhaAtual)));
  });
  cy.then(() => expect(visitadas).to.deep.equal([...esperadas, esperadas[esperadas.length - 1]]));
};

// Ordem das marcas na tela, para comparar com a da navegação.
const marcasNaTela = (): Cypress.Chainable<string[]> =>
  cy.window().then(win =>
    linhas(getQuill(win))
      .filter(l => l.tipo === 'Artigo' && l.elemento?.revisao)
      .map(nome)
  );

describe('Navegação entre dispositivos alterados (#1096)', () => {
  beforeEach(() => {
    cy.visit('/');
    // Preâmbulo da fixture e os Arts. 1º a 6º, só com caput.
    cy.readFile('demo/doc/teste_opcoes_impressao.json').then(documento => {
      const articulacao = documento.value.projetoNorma.norma.articulacao;
      const modelo = JSON.stringify(articulacao.lXhier[0]);
      articulacao.lXhier = TEXTOS.map((texto, i) => {
        const artigo = JSON.parse(modelo.split('art1').join(`art${i + 1}`));
        artigo.value.rotulo = `Art. ${i + 1}º`;
        artigo.value.lXcontainersOmissis = artigo.value.lXcontainersOmissis.slice(0, 1);
        artigo.value.lXcontainersOmissis[0].value.p[0].content = [texto];
        return artigo;
      });
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'navegacao.json' }, { force: true });
    });
    cy.getContainerArtigoByNumero(6).should('exist');
    cy.wait(1000);
    cy.ativarRevisaoDispositivo();
  });

  it('descer e subir passam pelas mesmas marcas, e a subida sai do último artigo, excluído', () => {
    alterar(2, 1);
    excluir(3);
    alterar(5, 1);
    excluir(6);
    const marcas = ['art2', 'art3 (excluído)', 'art5', 'art6 (excluído)'];
    marcasNaTela().should('deep.equal', marcas);

    irParaEmenta();
    percorrer('proximo', marcas);
    percorrer('anterior', [...marcas].reverse().slice(1));
  });

  it('dois artigos vizinhos excluídos são alcançados na ordem da tela', () => {
    alterar(1, 2);
    excluir(5);
    excluir(4);
    const marcas = ['art1', 'art4 (excluído)', 'art5 (excluído)'];
    marcasNaTela().should('deep.equal', marcas);

    irParaEmenta();
    percorrer('proximo', marcas);
    percorrer('anterior', [...marcas].reverse().slice(1));
  });
});
