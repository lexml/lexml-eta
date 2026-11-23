import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';

// #1103: na linha que termina com o fecho de aspas e a nota de alteração, End levava o cursor ao dispositivo seguinte.
// O keydown sintético aciona o tratamento do editor, que move a seleção nativa; sem ele, o cursor não se moveria.
describe('ETA — tecla End', () => {
  let quill: any;

  const inicio = (linha: any): number => quill.getIndex(linha.blotConteudo);
  const fim = (linha: any): number => inicio(linha) + linha.blotConteudo.tamanho;
  const aguarda = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50));
  const linhas = (): any[] => {
    const lista: any[] = [];
    for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) lista.push(linha);
    return lista;
  };
  const retangulosDoTexto = (linha: any): DOMRect[] => {
    const intervalo = document.createRange();
    intervalo.selectNodeContents(linha.blotConteudo.domNode);
    return Array.from(intervalo.getClientRects()).filter(r => r.width > 0);
  };
  const mesmaLinhaVisual = (a: { top: number; height: number }, b: { top: number; height: number }): boolean => Math.abs(a.top - b.top) < Math.max(a.height, b.height) / 2;
  const editavelComTexto = (linha: any): boolean => linha.editavel && linha.blotConteudo?.tamanho > 20;

  // Texto que termina na mesma linha visual que o "(NR)": é onde o navegador pulava para o dispositivo seguinte.
  const linhaComNotaNaMesmaLinhaVisual = (): any =>
    linhas().find(linha => {
      const nota = linha.blotNotaAlteracao?.domNode as HTMLElement | undefined;
      const texto = editavelComTexto(linha) ? retangulosDoTexto(linha) : [];
      return nota?.hasAttribute('exibir') && texto.length > 0 && mesmaLinhaVisual(texto[texto.length - 1], nota.getBoundingClientRect());
    });

  const posicionar = async (indice: number): Promise<void> => {
    quill.setSelection(indice, 0, 'user');
    await aguarda();
  };
  const teclarEnd = async (shiftKey = false): Promise<void> => {
    quill.root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', shiftKey, bubbles: true, cancelable: true }));
    await aguarda();
  };

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(JSON.parse(JSON.stringify(MPV_1234_2024)));
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await aguarda();
    quill = editor.quill;
  });

  afterEach(() => {
    (document.querySelector('lexml-eta-proposicao-editor') as any)?.cancelarTimerOnChangePendente?.();
  });

  describe('na linha que termina com o fecho de aspas e a nota de alteração', () => {
    let linha: any;

    beforeEach(async () => {
      linha = linhaComNotaNaMesmaLinhaVisual();
      expect(!!linha, 'linha com o texto e o (NR) na mesma linha visual').to.be.true;
      await posicionar(fim(linha) - 3);
      expect(quill.linhaAtual === linha, 'cursor na linha com nota').to.be.true;
    });

    it('End leva o cursor ao fim do texto, sem mudar a linha atual', async () => {
      await teclarEnd();
      expect(quill.linhaAtual === linha, 'linha atual não muda').to.be.true;
      expect(quill.getSelection()).to.deep.equal({ index: fim(linha), length: 0 });
    });

    it('Shift+End seleciona até o fim do texto, sem o fecho de aspas nem a nota', async () => {
      await teclarEnd(true);
      expect(quill.linhaAtual === linha, 'linha atual não muda').to.be.true;
      expect(quill.getSelection()).to.deep.equal({ index: fim(linha) - 3, length: 3 });
      expect(document.getSelection()!.toString()).to.equal(quill.getText(fim(linha) - 3, 3));
    });

    it('Shift+End numa seleção feita de trás para frente mantém o ponto onde ela começou', async () => {
      const selecao = quill.selection;
      const [focoNo, focoOffset, ancoraNo, ancoraOffset] = selecao.rangeToNative({ index: fim(linha) - 6, length: 3 });
      document.getSelection()!.setBaseAndExtent(ancoraNo, ancoraOffset, focoNo, focoOffset);
      selecao.update('user');
      await aguarda();
      await teclarEnd(true);
      expect(quill.getSelection()).to.deep.equal({ index: fim(linha) - 3, length: 3 });
    });
  });

  it('End na primeira linha visual de um texto de várias linhas para no fim dela, dentro do texto', async () => {
    const linha = linhas().find(l => editavelComTexto(l) && retangulosDoTexto(l).length > 1);
    expect(!!linha, 'linha com texto de várias linhas visuais').to.be.true;
    await posicionar(inicio(linha));
    await teclarEnd();
    const { index } = quill.getSelection();
    expect(quill.linhaAtual === linha, 'linha atual não muda').to.be.true;
    expect(index > inicio(linha) && index < fim(linha), 'cursor dentro do texto').to.be.true;
    expect(mesmaLinhaVisual(quill.getBounds(index - 1), quill.getBounds(inicio(linha))), 'cursor no fim da primeira linha visual').to.be.true;
  });

  it('End na última linha visual de um texto sem fecho de aspas leva ao fim do texto', async () => {
    const linha = linhas().find(l => editavelComTexto(l) && !l.blotFechaAspas);
    expect(!!linha, 'linha sem fecho de aspas').to.be.true;
    let indice = fim(linha);
    while (indice > inicio(linha) && mesmaLinhaVisual(quill.getBounds(indice - 1), quill.getBounds(fim(linha)))) indice--;
    await posicionar(indice);
    await teclarEnd();
    expect(quill.linhaAtual === linha, 'linha atual não muda').to.be.true;
    expect(quill.getSelection()).to.deep.equal({ index: fim(linha), length: 0 });
  });
});
