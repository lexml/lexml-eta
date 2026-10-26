import { expect } from '@open-wc/testing';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/card/card';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/tab/tab';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import { Elemento } from '../../../src/model/elemento';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { StateType } from '../../../src/redux/state';
import { TextoDiff, exibirDiferencasDialog, montaTextoDiff } from '../../../src/components/editor/exibirDiferencaDialog';

const quillFalso = { blur: (): void => undefined, focus: (): void => undefined };

const abre = (dados: Partial<TextoDiff>): void => {
  const diff = Object.assign(new TextoDiff(), { quill: quillFalso, textoAtual: '', adicionado: true, ...dados }) as TextoDiff;
  exibirDiferencasDialog(diff);
};

const dialog = (): HTMLElement | null => document.body.querySelector('#slDialogExibirDiferencas');
const abas = (): string[] => Array.from(dialog()!.querySelectorAll('sl-tab')).map(a => a.textContent!.trim());
const cards = (painel: string): HTMLElement[] => Array.from(dialog()!.querySelectorAll(`sl-tab-panel[name="${painel}"] sl-card`));
const corpo = (card: HTMLElement): string => card.querySelector('p.texto-quill')!.innerHTML.trim();

describe('exibirDiferencasDialog', () => {
  // Remover o dialog antes de o sl-tab-group renderizar lança no ResizeObserver do Shoelace.
  afterEach(async () => {
    for (const d of Array.from(document.body.querySelectorAll('#slDialogExibirDiferencas'))) {
      await Promise.all(Array.from(d.querySelectorAll('sl-tab-group')).map(t => (t as any).updateComplete));
      d.remove();
    }
  });

  describe('abertura', () => {
    it('abre o popup de uma revisão sem título', () => {
      abre({ comRevisao: true, textoAntesRevisao: 'Teste 3.', textoOriginal: 'Teste 3.', textoAtual: 'Teste 3 alterado.' });

      expect(dialog()).to.not.equal(null);
      expect(abas()).to.deep.equal(['Texto antes da revisão']);
    });

    it('abre o popup de uma revisão com título', () => {
      abre({
        comRevisao: true,
        textoAntesRevisao: 'Teste 3.',
        textoOriginal: 'Teste 3.',
        textoAtual: 'Teste 3.',
        tituloAntesRevisao: 'Do objeto',
        tituloAtual: 'Da finalidade',
      });

      expect(dialog()).to.not.equal(null);
      expect(abas()).to.deep.equal(['Texto antes da revisão']);
    });
  });

  describe('card Diferença do texto (sem título)', () => {
    it('marca o trecho inserido e mantém os demais cards com o texto', () => {
      abre({ comRevisao: true, textoAntesRevisao: 'Teste 3.', textoOriginal: 'Teste 3.', textoAtual: 'Teste 3 alterado.' });

      const [antes, diferenca, atual] = cards('modificadoRevisao');
      expect(corpo(antes)).to.equal('Teste&nbsp;3.');
      expect(corpo(atual)).to.equal('Teste&nbsp;3&nbsp;alterado.');
      expect(corpo(diferenca)).to.equal('Teste 3<ins> alterado</ins>.');
    });

    it('troca de palavra aparece como removida e inserida', () => {
      abre({ comRevisao: true, textoAntesRevisao: 'A b', textoOriginal: 'A b', textoAtual: 'A c' });

      expect(corpo(cards('modificadoRevisao')[1])).to.equal('A <del>b</del><ins>c</ins>');
    });

    it('a aba Texto original compara o texto da norma com o atual, antes da aba de revisão', () => {
      abre({ comRevisao: true, adicionado: false, textoAntesRevisao: 'A b', textoOriginal: 'A x', textoAtual: 'A c' });

      expect(abas()).to.deep.equal(['Texto original', 'Texto antes da revisão']);
      expect(corpo(cards('modificado')[1])).to.equal('A <del>x</del><ins>c</ins>');
      expect(corpo(cards('modificadoRevisao')[1])).to.equal('A <del>b</del><ins>c</ins>');
    });
  });

  describe('título', () => {
    const base = { comRevisao: true, textoAntesRevisao: 'Teste 3.', textoOriginal: 'Teste 3.', textoAtual: 'Teste 3.' };
    const titulo = (card: HTMLElement): string | undefined => card.querySelector('.titulo-diff')?.innerHTML;
    const [ANTES, DIFERENCA, ATUAL] = [0, 1, 2];

    it('título alterado: o anterior no card antes, o atual no card atual e a comparação no card Diferença', () => {
      abre({ ...base, tituloAntesRevisao: 'Do objeto', tituloAtual: 'Da finalidade' });

      const c = cards('modificadoRevisao');
      expect(titulo(c[ANTES])).to.equal('Do objeto');
      expect(titulo(c[ATUAL])).to.equal('Da finalidade');
      expect(titulo(c[DIFERENCA])).to.contain('<del>').and.to.contain('<ins>');
    });

    it('título parcialmente alterado: o trecho acrescentado aparece como inserido', () => {
      abre({ ...base, tituloAntesRevisao: 'Do objeto', tituloAtual: 'Do objeto e da finalidade' });

      expect(titulo(cards('modificadoRevisao')[DIFERENCA])).to.equal('Do objeto<ins> e da finalidade</ins>');
    });

    it('título adicionado: o card antes mostra "Sem título" e a comparação marca o título todo como inserido', () => {
      abre({ ...base, tituloAtual: 'Do objeto' });

      const c = cards('modificadoRevisao');
      expect(c[ANTES].querySelector('.titulo-diff--ausente')!.textContent).to.equal('Sem título');
      expect(titulo(c[ATUAL])).to.equal('Do objeto');
      expect(titulo(c[DIFERENCA])).to.equal('<ins>Do objeto</ins>');
    });

    it('título removido: o card atual mostra "Sem título" e a comparação marca o título todo como removido', () => {
      abre({ ...base, tituloAntesRevisao: 'Do objeto' });

      const c = cards('modificadoRevisao');
      expect(titulo(c[ANTES])).to.equal('Do objeto');
      expect(c[ATUAL].querySelector('.titulo-diff--ausente')!.textContent).to.equal('Sem título');
      expect(titulo(c[DIFERENCA])).to.equal('<del>Do objeto</del>');
    });

    it('o marcador "Sem título" não entra na comparação', () => {
      abre({ ...base, tituloAtual: 'Do objeto' });

      expect(titulo(cards('modificadoRevisao')[DIFERENCA])).to.not.contain('Sem título');
    });

    it('só o texto alterado: os três cards trazem o mesmo título e a comparação não o marca', () => {
      abre({ ...base, textoAtual: 'Teste 3 alterado.', tituloAntesRevisao: 'Do objeto', tituloAtual: 'Do objeto' });

      cards('modificadoRevisao').forEach(card => expect(titulo(card)).to.equal('Do objeto'));
    });

    it('sem título nos dois lados: nenhum card ganha a linha de título', () => {
      abre({ ...base, textoAtual: 'Teste 3 alterado.' });

      cards('modificadoRevisao').forEach(card => expect(card.querySelector('.titulo-diff')).to.equal(null));
    });

    it('preserva itálico e subscrito do título', () => {
      abre({ ...base, tituloAtual: 'Do <i>objeto</i> H<sub>2</sub>O' });

      expect(titulo(cards('modificadoRevisao')[ATUAL])).to.equal('Do <i>objeto</i> H<sub>2</sub>O');
    });

    it('descarta marcação fora das permitidas no título', () => {
      abre({ ...base, tituloAtual: '<script>alert(1)</script><b>negrito</b>' });

      expect(titulo(cards('modificadoRevisao')[ATUAL])).to.equal('negrito');
    });

    it('a aba de revisão existe com texto anterior vazio quando só o título mudou', () => {
      abre({ comRevisao: true, textoAntesRevisao: '', textoOriginal: '', textoAtual: '', tituloAntesRevisao: 'Do objeto', tituloAtual: 'Da finalidade' });

      expect(abas()).to.deep.equal(['Texto antes da revisão']);
    });

    it('a aba Texto original não exibe título', () => {
      abre({
        comRevisao: true,
        adicionado: false,
        textoAntesRevisao: 'A b',
        textoOriginal: 'A x',
        textoAtual: 'A c',
        tituloAntesRevisao: 'Do objeto',
        tituloAtual: 'Da finalidade',
      });

      cards('modificado').forEach(card => expect(card.querySelector('.titulo-diff')).to.equal(null));
      cards('modificadoRevisao').forEach(card => expect(card.querySelector('.titulo-diff')).to.not.equal(null));
    });
  });
  describe('rótulo da pena', () => {
    const base = { comRevisao: true, textoAntesRevisao: 'reclusão.', textoOriginal: 'reclusão.', textoAtual: 'reclusão.' };
    const rotulo = (card: HTMLElement): string | undefined => card.querySelector('.rotulo-diff')?.innerHTML;

    it('rótulo alterado: o anterior no card antes, o atual no card atual e a comparação no card Diferença', () => {
      abre({ ...base, rotuloAntesRevisao: 'Pena –', rotuloAtual: 'Infração –' });

      const [antes, diferenca, atual] = cards('modificadoRevisao');
      expect(rotulo(antes)).to.equal('Pena –');
      expect(rotulo(atual)).to.equal('Infração –');
      expect(rotulo(diferenca)).to.contain('<del>').and.to.contain('<ins>');
    });

    it('rótulo igual nos dois lados não é marcado na comparação', () => {
      abre({ ...base, rotuloAntesRevisao: 'Pena –', rotuloAtual: 'Pena –' });

      expect(rotulo(cards('modificadoRevisao')[1])).to.equal('Pena –');
    });

    it('sem rótulo informado nenhum card ganha a linha', () => {
      abre(base);

      expect(cards('modificadoRevisao').every(c => c.querySelector('.rotulo-diff') === null)).to.equal(true);
    });
  });
});

describe('montaTextoDiff — rótulo', () => {
  const elementoEmRevisao = (tipo: string, rotuloAntes: string, rotuloAtual: string, operacoes: string, textoAntes = 'texto.', textoAtual = 'texto.'): Elemento => {
    const antes = { rotulo: rotuloAntes, conteudo: { texto: textoAntes } } as Partial<Elemento>;
    const revisao = new RevisaoElemento('', StateType.ElementoModificado, 'Descrição', { nome: 'X' } as any, '', antes, {});
    revisao.revisao = operacoes;
    return { ...new Elemento(), tipo, rotulo: rotuloAtual, conteudo: { texto: textoAtual }, revisao };
  };
  const diffDe = (e: Elemento): TextoDiff => montaTextoDiff(e, quillFalso as any);

  it('pena com o rótulo trocado informa os dois rótulos', () => {
    const diff = diffDe(elementoEmRevisao('Pena', 'Pena –', 'Infração –', 'alterado'));
    expect([diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal(['Pena –', 'Infração –']);
  });

  it('pena com só o texto alterado informa o mesmo rótulo nos dois lados', () => {
    const diff = diffDe(elementoEmRevisao('Pena', 'Pena –', 'Pena –', 'alterado', 'a.', 'b.'));
    expect([diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal(['Pena –', 'Pena –']);
  });

  it('renumeração manual (alteracaoRotulo) informa os dois rótulos', () => {
    const diff = diffDe(elementoEmRevisao('Paragrafo', '§ 4º', '§ 9º', 'alteracaoRotulo;art1_par4'));
    expect([diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal(['§ 4º', '§ 9º']);
  });

  it('alteracaoRotulo combinada com alterado informa os rótulos', () => {
    const diff = diffDe(elementoEmRevisao('Paragrafo', '§ 4º', '§ 9º', 'alteracaoRotulo;art1_par4,alterado'));
    expect(diff.rotuloAtual).to.equal('§ 9º');
  });

  it('renumeração automática (só alterado) não informa rótulo', () => {
    const diff = diffDe(elementoEmRevisao('Artigo', 'Art. 3º', 'Art. 4º', 'alterado', 'a.', 'b.'));
    expect([diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal([undefined, undefined]);
  });

  it('dispositivo movido não informa rótulo', () => {
    const diff = diffDe(elementoEmRevisao('Paragrafo', '§ 2º', '§ 1º', 'movido;2,alterado'));
    expect(diff.rotuloAtual).to.equal(undefined);
  });

  it('alteracaoRotulo depois de outra operação informa os dois rótulos', () => {
    const diff = diffDe(elementoEmRevisao('Paragrafo', '§ 4º', '§ 9º', 'movido;3,alteracaoRotulo;art1_par4'));
    expect([diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal(['§ 4º', '§ 9º']);
  });

  it('o argumento de outra operação que contenha "alteracaoRotulo" não informa rótulo', () => {
    const diff = diffDe(elementoEmRevisao('Paragrafo', '§ 2º', '§ 1º', 'transformado;alteracaoRotulo'));
    expect([diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal([undefined, undefined]);
  });

  it('operação cujo nome só começa com "alteracaoRotulo" não informa rótulo', () => {
    const diff = diffDe(elementoEmRevisao('Paragrafo', '§ 2º', '§ 1º', 'alteracaoRotuloX;art1_par2'));
    expect(diff.rotuloAtual).to.equal(undefined);
  });

  it('revisão sem o atributo de operações não informa rótulo, exceto na pena', () => {
    const paragrafo = elementoEmRevisao('Paragrafo', '§ 2º', '§ 1º', '');
    (paragrafo.revisao as RevisaoElemento).revisao = undefined;
    const pena = elementoEmRevisao('Pena', 'Pena –', 'Infração –', '');
    (pena.revisao as RevisaoElemento).revisao = undefined;
    expect(diffDe(paragrafo).rotuloAtual).to.equal(undefined);
    expect([diffDe(pena).rotuloAntesRevisao, diffDe(pena).rotuloAtual]).to.deep.equal(['Pena –', 'Infração –']);
  });

  it('elemento sem revisão não informa rótulo nem marca a revisão', () => {
    const diff = diffDe({ ...new Elemento(), tipo: 'Pena', rotulo: 'Pena –', conteudo: { texto: 'multa.' } });
    expect([diff.comRevisao, diff.rotuloAntesRevisao, diff.rotuloAtual]).to.deep.equal([false, undefined, undefined]);
  });
});
