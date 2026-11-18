// #1072: ↓ e ↑ vão ao dispositivo imediatamente abaixo ou acima, mesmo sem texto, na mesma posição horizontal.
// Eventos nativos (CDP): o navegador é quem pulava os dispositivos vazios.
import { TECLA_SETA_ABAIXO, TECLA_SETA_ACIMA, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const TEXTO_LONGO = Array.from({ length: 12 }, () => 'Texto longo do sexto artigo, que ocupa várias linhas na tela').join(', ') + '.';
const TEXTOS = ['Texto do primeiro artigo para o teste.', 'Texto do segundo artigo para o teste.', '', '', 'Texto do quinto artigo para o teste.', TEXTO_LONGO];

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

const artigos = (quill: any): any[] => {
  const lista: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) {
    if (linha.tipo === 'Artigo') lista.push(linha);
  }
  return lista;
};

// Retângulos das linhas do texto do <p> na tela.
const linhasDoTexto = (p: HTMLElement): DOMRect[] => {
  const intervalo = p.ownerDocument.createRange();
  intervalo.selectNodeContents(p);
  return Array.from(intervalo.getClientRects()).filter(r => r.width > 0);
};

const clicarNoTexto = (artigo: number, fracao = 0.5, linhaVisual = 0): void => {
  cy.window().then(win => {
    const p = artigos(getQuill(win))[artigo - 1].blotConteudo.domNode as HTMLElement;
    const r = linhasDoTexto(p)[linhaVisual];
    return cliqueNativo(win, r.left + r.width * fracao, r.top + r.height / 2);
  });
  // Espera a mudança de linha ser processada, que bloqueia as setas.
  cy.window().should(win => expect(getQuill(win).isProcessandoMudancaLinha).to.be.false);
};

const linhaAtualDeveSer = (artigo: number): void => {
  cy.window().should(win => {
    const quill = getQuill(win);
    expect(quill.linhaAtual === artigos(quill)[artigo - 1], `cursor no Art. ${artigo}º`).to.be.true;
  });
};

describe('Setas para cima e para baixo vão ao dispositivo vizinho (#1072)', () => {
  beforeEach(() => {
    cy.visit('/');
    // Arts. 1º a 6º só com caput: o 3º e o 4º vazios, como na issue; o 6º com texto de várias linhas.
    cy.readFile('demo/doc/teste_opcoes_impressao.json').then(documento => {
      const articulacao = documento.value.projetoNorma.norma.articulacao;
      const modelo = JSON.stringify(articulacao.lXhier[0]);
      articulacao.lXhier = TEXTOS.map((texto, i) => {
        const artigo = JSON.parse(modelo.split('art1').join(`art${i + 1}`));
        artigo.value.rotulo = `Art. ${i + 1}º`;
        artigo.value.lXcontainersOmissis = artigo.value.lXcontainersOmissis.slice(0, 1);
        artigo.value.lXcontainersOmissis[0].value.p[0].content = texto ? [texto] : [];
        return artigo;
      });
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'setas.json' }, { force: true });
    });
    cy.getContainerArtigoByNumero(6).should('exist');
    cy.wait(1000);
  });

  it('↓ no meio do texto do Art. 2º vai ao Art. 3º, vazio', () => {
    clicarNoTexto(2);
    cy.then(() => teclaNativa(TECLA_SETA_ABAIXO));
    linhaAtualDeveSer(3);
  });

  it('↑ no meio do texto do Art. 5º vai ao Art. 4º, vazio', () => {
    clicarNoTexto(5);
    cy.then(() => teclaNativa(TECLA_SETA_ACIMA));
    linhaAtualDeveSer(4);
  });

  it('↓ entre artigos com texto mantém a posição horizontal (controle)', () => {
    let esquerda = 0;
    clicarNoTexto(1);
    cy.window().then(win => {
      const quill = getQuill(win);
      esquerda = quill.getBounds(quill.getSelection().index).left;
    });
    cy.then(() => teclaNativa(TECLA_SETA_ABAIXO));
    linhaAtualDeveSer(2);
    cy.window().then(win => {
      const quill = getQuill(win);
      expect(Math.abs(quill.getBounds(quill.getSelection().index).left - esquerda) < 8, 'mesma posição horizontal').to.be.true;
    });
  });

  it('↓ na primeira linha de um texto de várias linhas fica no mesmo artigo', () => {
    clicarNoTexto(6, 0.3);
    cy.window().then(win => {
      expect(linhasDoTexto(artigos(getQuill(win))[5].blotConteudo.domNode).length > 1, 'texto com várias linhas').to.be.true;
    });
    cy.then(() => teclaNativa(TECLA_SETA_ABAIXO));
    cy.wait(300);
    linhaAtualDeveSer(6);
  });
});
