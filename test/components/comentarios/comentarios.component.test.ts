import { expect, fixture, html } from '@open-wc/testing';
import type { ComentariosComponent } from '../../../src';
import '../../../src/components/comentarios/comentarios.component';
import { Comentario, SequenciaComentario } from '../../../src/model/comentario/comentario';
import { Usuario } from '../../../src/model/revisao/usuario';

const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const BELTRANO = new Usuario('Beltrano', 'sf:beltrano', 'BE');

const comentario = (usuario: Usuario, data: string, texto: string): Comentario => ({ usuario, data, texto });

const SEQ_A: SequenciaComentario = { id: 'a', comentarios: [comentario(FULANO, '2026-11-02T09:05:00-03:00', 'Primeira linha\nSegunda linha')] };
const SEQ_B: SequenciaComentario = {
  id: 'b',
  comentarios: [comentario(BELTRANO, '2026-11-01T10:00:00-03:00', 'De outro usuário'), comentario(FULANO, '2026-11-03T08:00:00-03:00', 'Minha resposta')],
};

// sl-button só responde ao clique depois de renderizar o shadow DOM: o evento é disparado direto.
const clicar = (el: Element | null): void => {
  el!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
};

describe('lexml-eta-comentarios', () => {
  let componente: ComentariosComponent;
  const trechos: Record<string, string> = { a: 'trecho A', b: 'trecho B' };
  const posicoes: Record<string, number> = { a: 50, b: 10 };

  const montar = async (sequencias: SequenciaComentario[] = [SEQ_A, SEQ_B], usuario: Usuario = FULANO): Promise<void> => {
    componente = await fixture<ComentariosComponent>(
      html`<lexml-eta-comentarios
        .sequencias=${sequencias}
        .usuario=${usuario}
        .getTrecho=${(id: string): string => trechos[id] ?? ''}
        .getPosicao=${(id: string): number | undefined => posicoes[id]}
      ></lexml-eta-comentarios>`
    );
  };
  const cards = (): HTMLElement[] => Array.from(componente.querySelectorAll<HTMLElement>('.comentario-sequencia'));
  const card = (id: string): HTMLElement => componente.querySelector<HTMLElement>(`[data-id-sequencia-comentario="${id}"]`)!;
  const ouvir = (evento: string): any[] => {
    const detalhes: any[] = [];
    componente.addEventListener(evento, ev => detalhes.push((ev as CustomEvent).detail));
    return detalhes;
  };
  const dialogo = (id: string): any => componente.containerModais.querySelector(`#${id}`);
  const digitar = async (texto: string): Promise<void> => {
    const textarea = componente.containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement;
    textarea.value = texto;
    textarea.dispatchEvent(new Event('input'));
    await componente.updateComplete;
  };
  const botaoComentar = (): any => componente.containerModais.querySelector('#btn-confirmar-comentario');

  describe('Lista', () => {
    it('sem sequências exibe "Não há comentários registrados."', async () => {
      await montar([]);
      expect(componente.textContent).to.include('Não há comentários registrados.');
      expect(cards()).to.have.length(0);
    });

    it('exibe local, trecho, autor, data, texto e os botões da sequência', async () => {
      await montar();
      const a = card('a');

      expect(a.querySelector('.comentario-sequencia__origem')!.textContent).to.equal('Na justificação');
      expect(a.querySelector('.comentario-sequencia__trecho')!.textContent).to.equal('trecho A');
      expect(a.querySelector('.comentario-item__autor')!.textContent).to.equal('Fulano de Tal');
      expect(a.querySelector('.comentario-item__data')!.textContent).to.match(/^\d{2}\/\d{2}\/2026 \d{2}:\d{2}$/);
      expect(!!a.querySelector('.comentario-sequencia__responder')).to.equal(true);
      expect(!!a.querySelector('.comentario-sequencia__excluir')).to.equal(true);
    });

    it('preserva as quebras de linha do comentário', async () => {
      await montar();
      const texto = card('a').querySelector('.comentario-item__texto') as HTMLElement;

      expect(texto.textContent).to.equal('Primeira linha\nSegunda linha');
      expect(getComputedStyle(texto).whiteSpace).to.equal('pre-wrap');
    });

    it('trecho não localizado tem um texto de aviso', async () => {
      await montar([{ id: 'x', comentarios: SEQ_A.comentarios }]);
      expect(card('x').querySelector('.comentario-sequencia__trecho')!.textContent).to.equal('Trecho comentado não localizado.');
    });

    it('"Editar" só para o autor; "Excluir" só para o autor e com mais de um comentário', async () => {
      await montar();
      const acoes = (id: string, i: number): string[] =>
        Array.from(card(id).querySelectorAll('.comentario-item')[i].querySelectorAll('.comentario-item__acao')).map(b => b.textContent!.trim());

      expect(acoes('a', 0)).to.deep.equal(['Editar']);
      expect(acoes('b', 0)).to.deep.equal([]);
      expect(acoes('b', 1)).to.deep.equal(['Editar', 'Excluir']);
    });

    it('ordena pela posição no texto (padrão) ou pelos mais recentes', async () => {
      await montar();
      expect(cards().map(c => c.dataset.idSequenciaComentario)).to.deep.equal(['b', 'a']);

      const select = componente.querySelector('.comentarios__ordenacao') as HTMLSelectElement;
      select.value = 'mais-recentes';
      select.dispatchEvent(new Event('change'));
      await componente.updateComplete;

      expect(cards().map(c => c.dataset.idSequenciaComentario)).to.deep.equal(['b', 'a']);
      componente.sequencias = [SEQ_A, { ...SEQ_B, comentarios: [SEQ_B.comentarios[0]] }];
      await componente.updateComplete;
      expect(cards().map(c => c.dataset.idSequenciaComentario)).to.deep.equal(['a', 'b']);
    });

    it('destaca a sequência atual', async () => {
      await montar();
      componente.idSequenciaAtual = 'a';
      await componente.updateComplete;

      expect(card('a').classList.contains('comentario-sequencia--selecionada')).to.equal(true);
      expect(card('a').getAttribute('aria-selected')).to.equal('true');
      expect(card('b').classList.contains('comentario-sequencia--selecionada')).to.equal(false);
    });
  });

  describe('Seleção', () => {
    it('clicar na sequência emite a seleção; clicar num botão dela não', async () => {
      await montar();
      const eventos = ouvir('comentario-selecionar-sequencia');

      clicar(card('a').querySelector('.comentario-item__texto'));
      clicar(card('a').querySelector('.comentario-sequencia__responder'));

      expect(eventos).to.deep.equal([{ idSequencia: 'a' }]);
    });

    it('as setas selecionam a sequência seguinte e a anterior da lista e levam o foco a ela', async () => {
      await montar();
      const eventos = ouvir('comentario-selecionar-sequencia');

      card('b').focus();
      card('b').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(document.activeElement === card('a')).to.equal(true);

      card('a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      card('a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

      expect(eventos).to.deep.equal([{ idSequencia: 'a' }, { idSequencia: 'b' }]);
    });
  });

  describe('Modal de comentário', () => {
    it('os modais ficam fora do componente e saem do documento com ele', async () => {
      await montar([]);
      const container = componente.containerModais;

      expect(container.parentElement === document.body).to.equal(true);
      expect(!!componente.querySelector('sl-dialog')).to.equal(false);
      expect(!!container.querySelector('#dlg-comentario')).to.equal(true);
      componente.remove();
      expect(container.isConnected).to.equal(false);
    });

    it('adicionar exibe o trecho e só permite comentar com texto', async () => {
      await montar([]);
      const resultado = componente.abrirModalAdicionar('trecho selecionado');
      await componente.updateComplete;

      expect(dialogo('dlg-comentario').open).to.equal(true);
      expect(dialogo('dlg-comentario').label).to.equal('Adicionar comentário');
      expect(componente.containerModais.querySelector('.comentario-modal__trecho blockquote')!.textContent).to.equal('trecho selecionado');
      expect((componente.containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement).maxLength).to.equal(500);
      expect(botaoComentar().disabled).to.equal(true);

      await digitar('   ');
      expect(botaoComentar().disabled).to.equal(true);

      await digitar('  Meu comentário\ncom duas linhas  ');
      expect(componente.containerModais.querySelector('.comentario-modal__contador')!.textContent).to.equal('34 / 500 caracteres');
      expect(botaoComentar().disabled).to.equal(false);

      clicar(botaoComentar());
      expect(await resultado).to.equal('Meu comentário\ncom duas linhas');
      await componente.updateComplete;
      expect(dialogo('dlg-comentario').open).to.equal(false);
    });

    it('cancelar a adição resolve sem texto', async () => {
      await montar([]);
      const resultado = componente.abrirModalAdicionar('trecho');
      await componente.updateComplete;
      await digitar('texto');

      clicar(componente.containerModais.querySelector('#btn-cancelar-comentario'));

      expect(await resultado).to.equal(undefined);
    });

    it('responder abre "Responder comentário" sem trecho e emite a resposta', async () => {
      await montar();
      const eventos = ouvir('comentario-responder');

      clicar(card('a').querySelector('.comentario-sequencia__responder'));
      await componente.updateComplete;
      expect(dialogo('dlg-comentario').label).to.equal('Responder comentário');
      expect(!!componente.containerModais.querySelector('.comentario-modal__trecho')).to.equal(false);

      await digitar('Resposta');
      clicar(botaoComentar());

      expect(eventos).to.deep.equal([{ idSequencia: 'a', texto: 'Resposta' }]);
    });

    it('editar abre "Editar comentário" com o texto atual e emite o novo texto', async () => {
      await montar();
      const eventos = ouvir('comentario-editar');

      clicar(card('b').querySelectorAll('.comentario-item')[1].querySelector('.comentario-item__editar'));
      await componente.updateComplete;
      expect(dialogo('dlg-comentario').label).to.equal('Editar comentário');
      expect((componente.containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement).value).to.equal('Minha resposta');

      await digitar('Resposta corrigida');
      clicar(botaoComentar());

      expect(eventos).to.deep.equal([{ idSequencia: 'b', indice: 1, texto: 'Resposta corrigida' }]);
    });
  });

  describe('Confirmação de exclusão', () => {
    it('excluir a sequência pede confirmação e emite o evento ao confirmar', async () => {
      await montar();
      const eventos = ouvir('comentario-excluir-sequencia');

      clicar(card('a').querySelector('.comentario-sequencia__excluir'));
      await componente.updateComplete;
      expect(dialogo('dlg-excluir-comentario').open).to.equal(true);
      expect(componente.containerModais.querySelector('.comentario-confirmacao__titulo')!.textContent).to.equal('Excluir esta sequência de comentários?');

      clicar(componente.containerModais.querySelector('#btn-confirmar-exclusao'));
      expect(eventos).to.deep.equal([{ idSequencia: 'a' }]);
    });

    it('excluir um comentário pede confirmação; cancelar não emite nada', async () => {
      await montar();
      const eventos = ouvir('comentario-excluir');

      clicar(card('b').querySelectorAll('.comentario-item')[1].querySelector('.comentario-item__excluir'));
      await componente.updateComplete;
      expect(componente.containerModais.querySelector('.comentario-confirmacao__titulo')!.textContent).to.equal('Excluir este comentário?');

      clicar(componente.containerModais.querySelector('#btn-cancelar-exclusao'));
      await componente.updateComplete;
      expect(eventos).to.have.length(0);
      expect(dialogo('dlg-excluir-comentario').open).to.equal(false);

      clicar(card('b').querySelectorAll('.comentario-item')[1].querySelector('.comentario-item__excluir'));
      await componente.updateComplete;
      clicar(componente.containerModais.querySelector('#btn-confirmar-exclusao'));
      expect(eventos).to.deep.equal([{ idSequencia: 'b', indice: 1 }]);
    });
  });
});
