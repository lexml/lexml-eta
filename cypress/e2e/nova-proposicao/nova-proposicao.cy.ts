/**
 * Componente de nova proposição na demo (modal) — issue #1050.
 *
 * Cobre, pela UI real, o fluxo das três telas contra o backend simulado da demo (demo/server, servido pelo
 * web-dev-server em /demo-api). Viabilidade conforme docs/guia-cypress.md: o componente usa light DOM e
 * controles Shoelace (apoio em cypress/support/nova-proposicao.ts); o modal é um sl-dialog da demo e o
 * salvamento é conferido pelo blob capturado em URL.createObjectURL (padrão de abertura-tipo-nao-suportado.cy.ts).
 * Documentos de verificação: PL 5008/2023 (com texto), PL 3/2023 (sem texto estruturado) e MPV 1089/2021.
 */
import { abrirLista, deveEstarDesabilitado, deveEstarHabilitado, digitarEmSl, escolherComissao, escolherItemLista, marcarRadioSl } from '../../support/nova-proposicao';

const BOTAO_NOVA = 'div.lexml-eta-main-header--actions input[type="button"][value="Nova proposição"]';
const MODAL = '#dialogNovaProposicao';

const abrirModal = (): void => {
  cy.get(BOTAO_NOVA).click();
  cy.get(`${MODAL}[open]`).should('exist');
  cy.get('#np-g1').should('be.visible');
};

const verificarProposicao = (numero: string, ano = '2026'): void => {
  digitarEmSl('#np-numero-proposicao', numero);
  digitarEmSl('#np-ano-proposicao', ano);
  cy.get('#np-proposicao-verificar').click();
};

const ementaDeve = (seletor: string, vazia: boolean): void => {
  cy.get(seletor)
    .invoke('text')
    .should(texto => expect(texto.trim().length === 0, 'ementa vazia').to.equal(vazia));
};

describe('Nova proposição — componente no modal da demo', () => {
  const arquivosSalvos: Promise<string>[] = [];

  const lerSalvo = (): Cypress.Chainable<any> => {
    cy.get('input[type="button"][value="Salvar"]').click();
    cy.wrap(null).should(() => expect(arquivosSalvos, 'o arquivo deve ter sido gerado').to.have.length(1));
    return cy
      .wrap(null)
      .then(() => cy.wrap(arquivosSalvos[0]))
      .then(conteudo => JSON.parse(conteudo as string));
  };

  const metadadoLexEdit = (arquivo: any): any => arquivo.value.metadado.metadadoProprietario[0].any[0].value;

  beforeEach(() => {
    arquivosSalvos.length = 0;
    cy.visit('/');
    cy.window().then(win => {
      const criarOriginal = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, 'createObjectURL').callsFake((obj: Blob) => {
        arquivosSalvos.push(obj.text());
        return criarOriginal(obj);
      });
    });
  });

  it('proposição com texto vazio cria o documento e grava o colegiado Plenário', () => {
    abrirModal();
    deveEstarDesabilitado('#np-continuar');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    deveEstarHabilitado('#np-continuar');
    cy.get('#np-continuar').click();
    cy.get('#np-cabecalho').should('contain.text', 'Novo Projeto de Lei.');
    cy.get('#np-continuar').click();

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    lerSalvo().then(arquivo => {
      expect(arquivo.value.metadado.identificacao.urn).to.match(/^urn:lex:br:senado\.federal:projeto\.lei;pl:\d{4};999999$/);
      expect(metadadoLexEdit(arquivo).colegiadoApreciador).to.include({ tipoColegiado: 'Plenário' });
      expect(metadadoLexEdit(arquivo).anexoParecer).to.equal(false);
    });
  });

  it('lista de siglas é flutuante, tem no máximo 189 px e rola na vertical', () => {
    abrirModal();
    abrirLista('#np-sigla-proposicao');
    cy.get('#np-sigla-proposicao .ac-lista')
      .should('be.visible')
      .and('have.css', 'position', 'fixed')
      .and('have.css', 'max-height', '189px')
      .and('have.css', 'overflow-x', 'hidden')
      .should($lista => {
        expect($lista[0].scrollHeight, 'há mais itens que o visível').to.be.greaterThan($lista[0].clientHeight);
        expect($lista[0].clientHeight, 'altura visível').to.be.at.most(189);
      });
  });

  it('sigla digitada que não é um item é apagada ao perder o foco', () => {
    abrirModal();
    digitarEmSl('#np-sigla-proposicao sl-input', 'xyz');
    cy.get('#np-sigla-proposicao sl-input').shadow().find('input').blur();
    cy.get('#np-sigla-proposicao sl-input').shadow().find('input').should('have.value', '');
    deveEstarDesabilitado('#np-continuar');
  });

  it('comissão: lista flutuante, filtra pelo texto, sem rolagem horizontal e com texto excedente omitido', () => {
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    abrirLista('#np-comissao');
    cy.get('#np-comissao .ac-lista li').should('have.length.greaterThan', 1);
    cy.get('#np-comissao .ac-lista').should('be.visible').and('have.css', 'position', 'fixed').and('have.css', 'overflow-x', 'hidden');
    cy.get('#np-comissao .ac-lista li').first().should('have.css', 'text-overflow', 'ellipsis');
    digitarEmSl('#np-comissao sl-input', 'constituicao');
    cy.get('#np-comissao .ac-lista li').should('have.length', 1).and('contain.text', 'CCJ');
    cy.get('#np-comissao .ac-lista li').click();
    cy.get('#np-comissao sl-input')
      .should('have.prop', 'value')
      .and('match', /^CCJ - /);
  });

  it('comissão digitada que não é um item é apagada ao perder o foco', () => {
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    digitarEmSl('#np-comissao sl-input', 'inexistente');
    cy.get('#np-comissao sl-input').shadow().find('input').blur();
    cy.get('#np-comissao sl-input').shadow().find('input').should('have.value', '');
    cy.get('#np-comissao .ac-lista').should('not.exist');
  });

  it('ementa em fonte normal, sem negrito', () => {
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    verificarProposicao('5008', '2023');
    ementaDeve('#np-proposicao-ementa', false);
    cy.get('#np-proposicao-ementa').should('have.css', 'font-weight', '400');
  });

  it('substitutivo traz o texto do documento referenciado e grava a comissão escolhida', () => {
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    verificarProposicao('5008', '2023');
    ementaDeve('#np-proposicao-ementa', false);
    cy.get('sl-radio[name="destino"][value="Comissão"]').should('have.prop', 'checked', true);
    cy.get('#np-anexo-parecer').should('have.prop', 'checked', true);
    escolherComissao('CCJ');
    cy.get('#np-continuar').click();

    cy.get('#np-cabecalho').should('contain.text', 'Novo Substitutivo ao Projeto de Lei nº 5008 de 2023.');
    cy.get('sl-radio[name="opcaoTexto"][value="referenciado"]').should('have.prop', 'checked', true);
    cy.get('#np-continuar').click();

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    lerSalvo().then(arquivo => {
      const lexedit = metadadoLexEdit(arquivo);
      expect(lexedit.anexoParecer).to.equal(true);
      expect(lexedit.urnDocumentoReferenciado).to.contain('projeto.lei;pl:2023;');
      expect(lexedit.colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
    });
  });

  it('substitutivo de proposição sem texto estruturado exibe o alerta e bloqueia Continuar só nessa opção', () => {
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    verificarProposicao('3', '2023');
    escolherComissao('CCJ');
    cy.get('#np-continuar').click();

    cy.get('#np-texto-indisponivel').should('contain.text', 'Texto estruturado não disponível para edição');
    deveEstarDesabilitado('#np-continuar');
    marcarRadioSl('opcaoTexto', 'vazio');
    cy.get('#np-texto-indisponivel').should('not.exist');
    deveEstarHabilitado('#np-continuar');
  });

  it('proposição inexistente informa que não foi encontrada e mantém Continuar desabilitado', () => {
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    verificarProposicao('1', '1999');
    cy.get('#np-nao-encontrado').should('exist');
    ementaDeve('#np-proposicao-ementa', true);
    deveEstarDesabilitado('#np-continuar');
  });

  it('PLV exige a verificação da MPV e usa o texto dela', () => {
    abrirModal();
    escolherItemLista('#np-sigla-proposicao', 'PLV');
    cy.get('#np-g4').should('exist');
    deveEstarDesabilitado('#np-continuar');
    digitarEmSl('#np-numero-mpv', '1089');
    digitarEmSl('#np-ano-mpv', '2021');
    cy.get('#np-mpv-verificar').click();
    ementaDeve('#np-mpv-ementa', false);
    cy.get('#np-continuar').click();

    cy.get('#np-cabecalho').should('contain.text', 'Projeto de Lei de Conversão (Medida Provisória nº 1089 de 2021)');
    cy.get('sl-radio[name="opcaoTexto"][value="referenciado"]').should('have.prop', 'checked', true);
    cy.get('#np-continuar').click();

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    lerSalvo().then(arquivo => {
      expect(arquivo.value.metadado.identificacao.urn).to.contain('congresso.nacional:projeto.lei.conversao;plv:');
      expect(metadadoLexEdit(arquivo).urnDocumentoReferenciado).to.equal('urn:lex:br:federal:medida.provisoria;mpv:2021;1089');
    });
  });

  it('importação de arquivo simulada leva à Tela 3 e Continuar cria o documento vazio', () => {
    abrirModal();
    escolherItemLista('#np-sigla-proposicao', 'PL');
    cy.get('#np-continuar').click();
    marcarRadioSl('opcaoTexto', 'importar');
    deveEstarDesabilitado('#np-continuar');
    cy.get('#np-arquivo').selectFile({ contents: Cypress.Buffer.from('texto'), fileName: 'minuta.txt' }, { force: true });
    cy.get('#np-continuar').click();

    cy.get('#np-erros-titulo').should('contain.text', 'minuta.txt');
    cy.get('#np-erros').should('contain.text', 'simulado');
    cy.get('#np-voltar').click();
    cy.get('#np-arquivo').should('exist');
    cy.get('#np-continuar').click();
    cy.get('#np-continuar').click();

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('arquivo acima de 5 MB é recusado', () => {
    abrirModal();
    escolherItemLista('#np-sigla-proposicao', 'PL');
    cy.get('#np-continuar').click();
    marcarRadioSl('opcaoTexto', 'importar');
    cy.get('#np-arquivo').selectFile({ contents: Cypress.Buffer.alloc(5 * 1024 * 1024 + 1), fileName: 'grande.docx' }, { force: true });
    cy.get('#np-erro-arquivo').should('contain.text', '5 MB');
    deveEstarDesabilitado('#np-continuar');
  });

  it('Cancelar fecha o modal sem criar documento', () => {
    abrirModal();
    escolherItemLista('#np-sigla-proposicao', 'PL');
    cy.get('#np-cancelar').click();

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.get('.aguardando-inicializacao').should('exist');
  });

  it('na Câmara, substitutivo usa a sigla do substitutivo e as comissões da CD', () => {
    cy.get('#casaEditor').select('CD');
    abrirModal();
    marcarRadioSl('especie', 'substitutivo');
    cy.get('#np-g2').should('exist');
    escolherItemLista('#np-sigla-substitutivo', 'SBT');
    escolherItemLista('#np-sigla-proposicao', 'PL');
    verificarProposicao('5008', '2023');
    escolherComissao('CCJC');
    cy.get('#np-continuar').click();
    cy.get('#np-continuar').click();

    cy.get(`${MODAL}[open]`).should('not.exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    lerSalvo().then(arquivo => {
      expect(arquivo.value.metadado.identificacao.urn).to.match(/^urn:lex:br:camara\.deputados:substitutivo;sbt:\d{4};999999$/);
      expect(metadadoLexEdit(arquivo).anexoParecer).to.equal(true);
      expect(metadadoLexEdit(arquivo).colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CCJC' });
    });
  });

  it('documento aberto de arquivo sem colegiado recebe o colegiado padrão (Plenário)', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_opcoes_impressao.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    lerSalvo().then(arquivo => {
      expect(metadadoLexEdit(arquivo).colegiadoApreciador).to.include({ tipoColegiado: 'Plenário' });
    });
  });
});
