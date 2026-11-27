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

const abrirDocumentoComArtigos = (): void => {
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
};

describe('Cursor depois de excluir um dispositivo (#1074, #1075)', () => {
  beforeEach(abrirDocumentoComArtigos);
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

const linhasAtivas = (win: any): Element[] => Array.from(win.document.querySelectorAll('.container__elemento--ativo'));

const todasAsLinhas = (quill: any): any[] => {
  const lista: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) lista.push(linha);
  return lista;
};

const excluirPelaTecla = (modo: Modo, artigo: number): void => {
  clicarNoTexto(artigo);
  if (modo === 'menu') removerPeloMenu(artigo);
  else cy.then(() => teclaNativa(TECLA_D, CTRL));
};

// #1105: em revisão a linha excluída continua na tela, marcada como excluída, e o foco permanece nela.
describe('Cursor depois de excluir em modo de revisão (#1105)', () => {
  beforeEach(() => {
    abrirDocumentoComArtigos();
    cy.ativarRevisaoDispositivo();
  });

  (['Ctrl+D', 'menu'] as Modo[]).forEach(modo => {
    it(`${modo}: excluir o Art. 2º deixa o cursor na linha excluída, a única marcada`, () => {
      excluirPelaTecla(modo, 2);

      cy.window().should(win => {
        const quill = getQuill(win);
        const linha = artigos(quill)[1];
        expect(artigos(quill), 'a linha excluída continua na tela').to.have.length(TEXTOS.length);
        expect(quill.linhaAtual === linha, 'linha atual é o Art. 2º excluído').to.be.true;
        expect(quill.getSelection()?.index).to.equal(quill.getIndex(linha.blotConteudo));
        expect(linhasAtivas(win)).to.deep.equal([linha.domNode]);
      });
    });

    it(`${modo}: excluir o Art. 4º, o último, deixa o cursor na linha excluída`, () => {
      excluirPelaTecla(modo, 4);

      cy.window().should(win => {
        const quill = getQuill(win);
        const linha = artigos(quill)[3];
        expect(artigos(quill), 'a linha excluída continua na tela').to.have.length(TEXTOS.length);
        expect(quill.linhaAtual === linha, 'linha atual é o Art. 4º excluído').to.be.true;
        expect(linhasAtivas(win)).to.deep.equal([linha.domNode]);
      });
    });
  });

  it('excluir um artigo adicionado na própria revisão leva o cursor ao artigo seguinte', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.window().should(win => expect(artigos(getQuill(win))).to.have.length(TEXTOS.length + 1));

    cy.then(() => teclaNativa(TECLA_D, CTRL));

    cy.window().should(win => {
      const quill = getQuill(win);
      expect(artigos(quill), 'a linha do artigo adicionado saiu da tela').to.have.length(TEXTOS.length);
      const terceiro = artigos(quill)[2];
      expect(textoDe(terceiro)).to.equal(TEXTOS[2]);
      expect(quill.linhaAtual === terceiro, 'cursor no Art. 3º original').to.be.true;
    });
  });
});

describe('Cursor depois de excluir em modo de revisão, na MPV 905 (#1105)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.wait(1000);
    cy.ativarRevisaoDispositivo();
  });

  const clicarNaLinha = (tipo: string): void => {
    cy.window().then(win => {
      const linha = todasAsLinhas(getQuill(win)).find(l => l.tipo === tipo);
      expect(!!linha, `linha do tipo ${tipo}`).to.be.true;
      const r = (linha.blotConteudo.domNode as HTMLElement).getBoundingClientRect();
      return cliqueNativo(win, r.left + 20, r.top + r.height / 2);
    });
  };

  // A linha excluída fica na tela e é a única marcada como atual.
  const linhaExcluidaEAtual = (tipo: string): void => {
    cy.window().should(win => {
      const quill = getQuill(win);
      const linha = todasAsLinhas(quill).find(l => l.tipo === tipo);
      expect(linha.domNode.isConnected, 'a linha excluída continua na tela').to.be.true;
      expect(quill.linhaAtual === linha, `linha atual é a do tipo ${tipo}`).to.be.true;
      expect(linhasAtivas(win)).to.deep.equal([linha.domNode]);
    });
  };

  it('excluir o parágrafo único do Art. 1º deixa a linha excluída como linha atual, e não o dispositivo seguinte', () => {
    clicarNaLinha('Paragrafo');
    cy.window().should(win => expect(getQuill(win).linhaAtual.tipo).to.equal('Paragrafo'));

    cy.then(() => teclaNativa(TECLA_D, CTRL));

    linhaExcluidaEAtual('Paragrafo');
  });

  it('excluir um capítulo deixa a linha do capítulo como linha atual, e não o primeiro dispositivo dele', () => {
    clicarNaLinha('Capitulo');
    cy.window().should(win => expect(getQuill(win).linhaAtual.tipo).to.equal('Capitulo'));

    cy.then(() => teclaNativa(TECLA_D, CTRL));

    linhaExcluidaEAtual('Capitulo');
  });
});
