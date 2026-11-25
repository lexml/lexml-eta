import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { Usuario } from '../../../src/model/revisao/usuario';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TEXTOS = ['Texto do primeiro artigo para o teste.', 'Texto do segundo artigo para o teste.', '', '', 'Texto do quinto artigo, mais longo que o sexto.', 'Curto.'];

// Artigos do modelo com os textos dados (por padrão, os acima: o 3º e o 4º vazios, como na issue).
const documentoComArtigos = (textos: string[] = TEXTOS): any => {
  const documento = novoDocumentoArticulado();
  const articulacao = documento.value.projetoNorma.norma.articulacao;
  const modelo = JSON.stringify(articulacao.lXhier[0]);
  articulacao.lXhier = textos.map((texto, i) => {
    const n = i + 1;
    const artigo = JSON.parse(modelo.split('art1').join(`art${n}`));
    artigo.value.rotulo = `Art. ${n}º`;
    // Só o caput: o parágrafo do modelo seria o vizinho do artigo.
    artigo.value.lXcontainersOmissis = artigo.value.lXcontainersOmissis.slice(0, 1);
    artigo.value.lXcontainersOmissis[0].value.p[0].content = texto ? [texto] : [];
    return artigo;
  });
  return documento;
};

// #1072: fora do fim/início do texto, ↓/↑ ficavam com o navegador, que pulava os dispositivos vazios.
describe('ETA — setas para cima e para baixo vão ao dispositivo vizinho', () => {
  let quill: any;
  const artigos: any[] = [];

  const inicio = (linha: any): number => quill.getIndex(linha.blotConteudo);
  // Espera o fim do processamento da mudança de linha, que bloqueia as setas.
  const posicionar = async (indice: number): Promise<void> => {
    quill.setSelection(indice, 0, 'user');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(quill.isProcessandoMudancaLinha, 'mudança de linha processada').to.be.false;
  };
  const teclar = (key: string, shiftKey = false): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
    quill.root.dispatchEvent(evento);
    return evento;
  };
  const esquerda = (indice: number): number => quill.getBounds(indice).left;

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComArtigos());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await new Promise(resolve => setTimeout(resolve, 50));
    quill = editor.quill;
    artigos.length = 0;
    for (let linha = quill.linhaAtual; linha; linha = linha.next) {
      if (linha.tipo === 'Artigo') artigos.push(linha);
    }
  });

  it('os artigos têm os textos do cenário e são linhas consecutivas', () => {
    expect(artigos.map(a => a.blotConteudo.tamanho)).to.deep.equal(TEXTOS.map(t => t.length));
    expect(artigos.every((a, i) => i === 0 || artigos[i - 1].next === a)).to.be.true;
  });

  it('↓ no meio do texto do Art. 2º vai ao Art. 3º, vazio', async () => {
    await posicionar(inicio(artigos[1]) + 10);
    teclar('ArrowDown');
    expect(quill.linhaAtual === artigos[2], 'linha atual é o Art. 3º').to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(artigos[2]));
  });

  it('↑ no meio do texto do Art. 5º vai ao Art. 4º, vazio', async () => {
    await posicionar(inicio(artigos[4]) + 10);
    teclar('ArrowUp');
    expect(quill.linhaAtual === artigos[3], 'linha atual é o Art. 4º').to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(artigos[3]));
  });

  it('↓ mantém a posição horizontal quando o texto seguinte a alcança', async () => {
    await posicionar(inicio(artigos[0]) + 15);
    // Medida antes da tecla: a troca de linha remonta o menu e desloca os índices.
    const origem = esquerda(quill.getSelection().index);
    teclar('ArrowDown');
    expect(quill.linhaAtual === artigos[1], 'linha atual é o Art. 2º').to.be.true;
    expect(Math.abs(esquerda(quill.getSelection().index) - origem) < 8, 'mesma posição horizontal').to.be.true;
  });

  it('↓ com o texto seguinte mais curto vai ao fim dele', async () => {
    await posicionar(inicio(artigos[4]) + 40);
    teclar('ArrowDown');
    expect(quill.linhaAtual === artigos[5], 'linha atual é o Art. 6º').to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(artigos[5]) + artigos[5].blotConteudo.tamanho);
  });

  it('Shift+↓ fica com o navegador', async () => {
    await posicionar(inicio(artigos[1]) + 10);
    expect(teclar('ArrowDown', true).defaultPrevented).to.be.false;
  });
});

// #1105: o texto do dispositivo excluído em revisão não é editável, então o navegador não move o cursor entre as linhas dele.
describe('ETA — setas em dispositivo excluído em revisão com o texto em mais de uma linha', () => {
  const LONGO = 'Texto do segundo artigo, longo o bastante para ocupar mais de uma linha na tela do editor. '.repeat(10);
  let component: LexmlEtaComponent;
  let quill: any;
  const artigos: any[] = [];

  const aguarda = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50));
  const inicio = (linha: any): number => quill.getIndex(linha.blotConteudo);
  const fim = (linha: any): number => inicio(linha) + linha.blotConteudo.tamanho;
  const posicionar = async (indice: number): Promise<void> => {
    quill.setSelection(indice, 0, 'user');
    await aguarda();
    expect(quill.isProcessandoMudancaLinha, 'mudança de linha processada').to.be.false;
  };
  const teclar = (key: string): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    quill.root.dispatchEvent(evento);
    return evento;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComArtigos(['Texto do primeiro artigo.', LONGO, 'Texto do terceiro artigo.']));
    component.setUsuario(new Usuario('Fulano de Tal', 'sf:fulano', 'FT'));
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await aguarda();
    quill = editor.quill;
    artigos.length = 0;
    for (let linha = quill.linhaAtual; linha; linha = linha.next) {
      if (linha.tipo === 'Artigo') artigos.push(linha);
    }
    rootStore.dispatch(ativarDesativarRevisaoAction.execute());
    await aguarda();
    await posicionar(inicio(artigos[1]));
    rootStore.dispatch(removerElementoAction.execute(createElemento(buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, 'art2')!), undefined));
    await aguarda();
  });

  afterEach(() => {
    (component?.querySelector('lexml-eta-proposicao-editor') as any)?.cancelarTimerOnChangePendente?.();
    rootStore.getState().elementoReducer.emRevisao && rootStore.dispatch(ativarDesativarRevisaoAction.execute());
  });

  it('o texto excluído continua na tela, não é editável e ocupa mais de uma linha', () => {
    const texto = artigos[1].blotConteudo.domNode as HTMLElement;
    expect(artigos[1].domNode.isConnected).to.be.true;
    expect(texto.isContentEditable, 'texto editável').to.be.false;
    expect(quill.getBounds(fim(artigos[1])).top).to.be.greaterThan(quill.getBounds(inicio(artigos[1])).top);
  });

  it('↓ na primeira linha do texto excluído vai ao dispositivo seguinte', async () => {
    await posicionar(inicio(artigos[1]));
    const evento = teclar('ArrowDown');
    expect(quill.linhaAtual === artigos[2], 'linha atual é o Art. 2º (antigo 3º)').to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(artigos[2]));
    expect(evento.defaultPrevented).to.be.true;
  });

  it('↑ na última linha do texto excluído vai ao dispositivo anterior', async () => {
    await posicionar(fim(artigos[1]));
    const evento = teclar('ArrowUp');
    expect(quill.linhaAtual === artigos[0], 'linha atual é o Art. 1º').to.be.true;
    expect(evento.defaultPrevented).to.be.true;
  });
});
