// #1095: letra verde, azul ou vermelha no dispositivo revisado, como as situações do lexml-emenda.
// Edição e exclusão por eventos nativos (CDP), para passarem pelo editor como as do usuário.
import { CTRL, TECLA_D, TECLA_X, cliqueNativo, teclaNativa } from '../../support/eventos-nativos';

const TEXTOS = [1, 2, 3, 4].map(n => `Texto do artigo ${n}.`);
const VERDE = 'rgb(0, 128, 0)';
const AZUL = 'rgb(0, 0, 255)';
const VERMELHO = 'rgb(255, 0, 0)';
// Cores normais: texto do `.ql-editor` e rótulo.
const NORMAL = ['rgb(100, 98, 96)', 'rgb(0, 0, 0)'];

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

const linhas = (quill: any): any[] => {
  const lista: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) lista.push(linha);
  return lista;
};

// Os artigos são achados pelo número original, que fica no texto: excluir em revisão renumera os de baixo.
const linhaDoArtigo = (quill: any, n: number): any =>
  linhas(quill).find(l => l.tipo === 'Artigo' && /artigo (\d)/.exec(l.blotConteudo?.domNode?.textContent ?? '')?.[1] === String(n));

// Cor do texto e do rótulo da linha.
const cores = (linha: any): string[] => [getComputedStyle(linha.blotConteudo.domNode).color, getComputedStyle(linha.domNode.querySelector('.texto__rotulo')).color];

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

describe('Cores da letra do dispositivo revisado (#1095)', () => {
  it('incluir, alterar e excluir dão verde, azul e vermelho; aceitar ou rejeitar devolve as cores normais', () => {
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
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'cores.json' }, { force: true });
    });
    cy.getContainerArtigoByNumero(4).should('exist');
    cy.wait(1000);
    cy.ativarRevisaoDispositivo();

    // Altera o Art. 1º ("x" no início do texto) e sai da linha.
    clicarNoInicioDoTexto(1);
    cy.then(() => teclaNativa(TECLA_X));
    clicarNoInicioDoTexto(4);
    cy.window().should(win => expect(cores(linhaDoArtigo(getQuill(win), 1))).to.deep.equal([AZUL, AZUL]));

    // Exclui o Art. 2º.
    clicarNoInicioDoTexto(2);
    cy.then(() => teclaNativa(TECLA_D, CTRL));
    cy.window().should(win => {
      const linha = linhaDoArtigo(getQuill(win), 2);
      expect(cores(linha)).to.deep.equal([VERMELHO, VERMELHO]);
      expect(getComputedStyle(linha.blotConteudo.domNode).textDecorationLine).to.equal('line-through');
    });

    // Inclui um artigo depois do Art. 3º.
    cy.window().then(win => cy.get(`#${CSS.escape(linhaDoArtigo(getQuill(win), 3).domNode.id)}`).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois'));
    cy.window().should(win => {
      const ls = linhas(getQuill(win));
      const incluido = ls[ls.indexOf(linhaDoArtigo(getQuill(win), 3)) + 1];
      expect(incluido.tipo).to.equal('Artigo');
      expect(cores(incluido)).to.deep.equal([VERDE, VERDE]);
    });

    // Aceitar a alteração e rejeitar a exclusão devolvem as cores normais.
    cy.window().then(win => (linhaDoArtigo(getQuill(win), 1).domNode.querySelector('.blot__revisao_aceitar') as HTMLElement).click());
    cy.window().should(win => expect(cores(linhaDoArtigo(getQuill(win), 1))).to.deep.equal(NORMAL));
    cy.wait(500);
    cy.window().then(win => (linhaDoArtigo(getQuill(win), 2).domNode.querySelector('.blot__revisao_recusar') as HTMLElement).click());
    cy.window().should(win => expect(cores(linhaDoArtigo(getQuill(win), 2))).to.deep.equal(NORMAL));
  });

  it('ao abrir um documento, os dispositivos movidos e o transformado ficam em azul', () => {
    cy.visit('/');
    cy.get('#fileUpload').selectFile('demo/doc/teste_revisao_descricao_operacoes.json', { force: true });
    cy.window().should(win => {
      const revisadas = linhas(getQuill(win)).filter(l => /movido|transformado/.test(l.elemento?.revisao?.revisao ?? ''));
      expect(revisadas.length, 'movidos e transformado').to.equal(3);
      revisadas.forEach(l => expect(cores(l), l.elemento.revisao.revisao).to.deep.equal([AZUL, AZUL]));
    });
  });
});
