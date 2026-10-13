import { expect } from '@open-wc/testing';
import 'quill/dist/quill';
import { configurePrivateQuill } from '../../../src/internal/quill/configure-private-quill';
import { Elemento } from '../../../src/model/elemento';
import { editarTituloDispositivoAction } from '../../../src/model/lexml/acao/atualizarTituloDispositivoAction';
import { EtaContainerTable } from '../../../src/util/eta-quill/eta-container-table';
import { EtaQuill } from '../../../src/util/eta-quill/eta-quill';
import { EtaQuillUtil } from '../../../src/util/eta-quill/eta-quill-util';

const criaElemento = (tituloDispositivo?: string, acoesPossiveis: Elemento['acoesPossiveis'] = []): Elemento => ({
  ...new Elemento(),
  uuid: 1,
  tipo: 'Artigo',
  rotulo: 'Art. 1º',
  numero: '1',
  conteudo: { texto: 'Texto do artigo.' },
  tituloDispositivo,
  acoesPossiveis,
});

describe('EtaContainerTable - título do dispositivo', () => {
  let editorHtml: HTMLElement;
  let bufferHtml: HTMLElement;
  let quill: EtaQuill;
  let linha: EtaContainerTable;

  const criaLinha = (elemento: Elemento): void => {
    linha = EtaQuillUtil.criarContainerLinha(elemento);
    linha.insertInto(quill.scroll);
  };
  const tituloNoDom = (): HTMLElement | null => linha.domNode.querySelector('titulo-dispositivo');

  beforeEach(() => {
    configurePrivateQuill();
    editorHtml = document.createElement('div');
    bufferHtml = document.createElement('div');
    document.body.append(editorHtml, bufferHtml);
    quill = new EtaQuill(editorHtml, bufferHtml, {});
  });

  afterEach(() => {
    editorHtml.remove();
    bufferHtml.remove();
  });

  it('não exibe o título quando o elemento não tem título', () => {
    criaLinha(criaElemento());
    expect(tituloNoDom()).to.be.null;
    expect(linha.blotTituloDispositivo).to.be.undefined;
  });

  it('exibe o título, antes do rótulo, ao criar a linha', () => {
    criaLinha(criaElemento('Objeto'));
    expect(tituloNoDom()?.innerHTML).to.equal('Objeto');
    expect(linha.blotTituloDispositivo).to.not.be.undefined;
    expect(linha.blotRotulo?.prev).to.equal(linha.blotTituloDispositivo);
  });

  it('exibe o blot para título vazio', () => {
    criaLinha(criaElemento(''));
    expect(tituloNoDom()).to.not.be.null;
    expect(tituloNoDom()?.innerHTML).to.equal('');
  });

  it('cria o título em linha existente sem recriar a linha', () => {
    criaLinha(criaElemento());
    const domAntes = linha.domNode;
    linha.atualizarElemento(criaElemento('Novo título'));
    expect(linha.domNode).to.equal(domAntes);
    expect(tituloNoDom()?.innerHTML).to.equal('Novo título');
    expect(linha.blotRotulo?.prev).to.equal(linha.blotTituloDispositivo);
    expect(linha.blotConteudo.html).to.equal('Texto do artigo.');
  });

  it('atualiza o título existente', () => {
    criaLinha(criaElemento('Antigo'));
    const blotAntes = linha.blotTituloDispositivo;
    linha.atualizarElemento(criaElemento('<i>Novo</i>'));
    expect(linha.blotTituloDispositivo).to.equal(blotAntes);
    expect(tituloNoDom()?.innerHTML).to.equal('<i>Novo</i>');
  });

  it('remove o título quando o elemento fica sem título', () => {
    criaLinha(criaElemento('Objeto'));
    const domAntes = linha.domNode;
    linha.atualizarElemento(criaElemento());
    expect(linha.domNode).to.equal(domAntes);
    expect(tituloNoDom()).to.be.null;
    expect(linha.blotRotulo).to.not.be.undefined;
  });

  it('só marca o título como clicável e dispara o evento quando a ação de título é possível', () => {
    criaLinha(criaElemento('Objeto'));
    expect(tituloNoDom()?.classList.contains('titulo-dispositivo-editavel')).to.be.false;

    const elemento = criaElemento('Objeto', [editarTituloDispositivoAction]);
    linha.atualizarElemento(elemento);
    const titulo = tituloNoDom()!;
    expect(titulo.classList.contains('titulo-dispositivo-editavel')).to.be.true;

    let detalhe: Elemento | undefined;
    linha.domNode.addEventListener('titulo-dispositivo', (e: Event) => (detalhe = (e as CustomEvent).detail.elemento));
    titulo.click();
    expect(detalhe).to.equal(elemento);
  });
});
