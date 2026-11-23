// #1074: excluir o Art. 1º deixava o cursor no preâmbulo, que não é editável, e ele sumia.
// #1075: o cursor vai para o artigo que toma o lugar do excluído; só sobe quando ele é o último.
// O Delete em linha vazia fica no teste de componente: eventos-nativos.ts não tem a tecla Delete.
// Eventos nativos (CDP): o clique sintético não move a seleção do Quill, da qual parte a exclusão;
// por isso o menu também é aberto por cliques nativos, e não por selecionarOpcaoDeMenuDoDispositivo.
import { CTRL, TECLA_D, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

type Modo = 'Ctrl+D' | 'menu';

const TEXTOS = ['Texto do primeiro artigo.', 'Texto do segundo artigo.', 'Texto do terceiro artigo.', 'Texto do quarto artigo.'];

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

const artigos = (quill: any): any[] => {
  const lista: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) {
    if (linha.tipo === 'Artigo') lista.push(linha);
  }
  return lista;
};

const textoDe = (artigo: any): string => artigo.blotConteudo.domNode.textContent.trim();

const clicarNoCentro = (win: Window, elemento: Element): Promise<void> => {
  const r = elemento.getBoundingClientRect();
  return cliqueNativo(win, r.left + r.width / 2, r.top + r.height / 2);
};

const clicarNoTexto = (artigo: number): void => {
  cy.window().then(win => {
    const r = (artigos(getQuill(win))[artigo - 1].blotConteudo.domNode as HTMLElement).getBoundingClientRect();
    return cliqueNativo(win, r.left + 20, r.top + r.height / 2);
  });
  cy.window().should(win => {
    const quill = getQuill(win);
    expect(quill.linhaAtual === artigos(quill)[artigo - 1], `cursor no Art. ${artigo}º`).to.be.true;
    expect(quill.isProcessandoMudancaLinha).to.be.false;
  });
};

const removerPeloMenu = (artigo: number): void => {
  cy.window().then(win => {
    const linha = artigos(getQuill(win))[artigo - 1].domNode as HTMLElement;
    return clicarNoCentro(win, linha.querySelector('sl-dropdown sl-button[slot="trigger"]')!);
  });
  // O painel do sl-dropdown pode ficar fora da linha: procura o item visível.
  cy.contains('sl-menu-item', /^\s*Remover/)
    .filter(':visible')
    .then($item => cy.window().then(win => clicarNoCentro(win, $item[0])));
};

const remover = (artigo: number, modo: Modo): void => {
  clicarNoTexto(artigo);
  if (modo === 'menu') removerPeloMenu(artigo);
  else cy.then(() => teclaNativa(TECLA_D, CTRL));
  cy.window().should(win => expect(artigos(getQuill(win)).length).to.equal(TEXTOS.length - 1));
};

// Linha atual e seleção no início do texto do artigo com o texto dado.
const cursorNoInicioDe = (texto: string): void => {
  cy.window().should(win => {
    const quill = getQuill(win);
    const artigo = artigos(quill).find(a => textoDe(a) === texto);
    expect(!!artigo, `artigo "${texto}"`).to.be.true;
    expect(quill.linhaAtual === artigo, `linha atual é "${texto}"`).to.be.true;
    expect(quill.getSelection()?.index).to.equal(quill.getIndex(artigo.blotConteudo));
  });
};

describe('Cursor depois de excluir um dispositivo (#1074, #1075)', () => {
  beforeEach(() => {
    cy.visit('/');
    // Preâmbulo da fixture e os Arts. 1º a 4º, só com caput.
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
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'cursor.json' }, { force: true });
    });
    cy.getContainerArtigoByNumero(4).should('exist');
    cy.wait(1000);
  });

  (['Ctrl+D', 'menu'] as Modo[]).forEach(modo => {
    it(`${modo}: excluir o Art. 1º leva o cursor ao início do texto do novo Art. 1º`, () => {
      remover(1, modo);
      cursorNoInicioDe(TEXTOS[1]);
    });

    it(`${modo}: excluir o Art. 3º leva o cursor ao início do texto do novo Art. 3º`, () => {
      remover(3, modo);
      cursorNoInicioDe(TEXTOS[3]);
    });

    it(`${modo}: excluir o Art. 4º, o último, leva o cursor ao início do texto do Art. 3º`, () => {
      remover(4, modo);
      cursorNoInicioDe(TEXTOS[2]);
    });
  });
});
