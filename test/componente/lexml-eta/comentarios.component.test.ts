import { expect, fixture, waitUntil } from '@open-wc/testing';
import type { LexmlEtaComponent } from '../../../src';
import '../../../src';
import { Usuario } from '../../../src/model/revisao/usuario';
import { metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const TEXTO = 'Primeiro trecho e segundo trecho do texto.';

// sl-button só responde ao clique depois de renderizar o shadow DOM: o evento é disparado direto.
const clicar = (el: Element | null): void => {
  el!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
};
const aguardar = (): Promise<unknown> => new Promise(resolve => setTimeout(resolve, 0));

describe('ETA — comentários na justificação', () => {
  let component: LexmlEtaComponent;

  const editor = (): any => component.querySelector('#lexml-eta-editor-texto-rico-justificativa');
  const aba = (): any => component.querySelector('lexml-eta-comentarios');
  const sequencias = (): any[] => (component as any).sequenciasComentario;
  const cards = (): HTMLElement[] => Array.from(component.querySelectorAll<HTMLElement>('lexml-eta-comentarios .comentario-sequencia'));
  const abaAtiva = (grupo: string): string | null => component.querySelector(`#${grupo} > sl-tab[active]`)?.getAttribute('panel') ?? null;

  const preencherModal = async (texto: string): Promise<void> => {
    await aba().updateComplete;
    const textarea = aba().containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement;
    textarea.value = texto;
    textarea.dispatchEvent(new Event('input'));
    await aba().updateComplete;
  };

  const comentar = async (index: number, length: number, texto: string): Promise<string> => {
    editor().quill.setSelection(index, length, 'silent');
    editor().emitirAbrirModalComentario({ index, length });
    await preencherModal(texto);
    clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
    await aguardar();
    await component.updateComplete;
    return sequencias()[sequencias().length - 1]?.id;
  };

  const confirmarExclusao = async (): Promise<void> => {
    await aba().updateComplete;
    clicar(aba().containerModais.querySelector('#btn-confirmar-exclusao'));
    await component.updateComplete;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    component.setUsuario(FULANO);
    editor().setContent(`<p>${TEXTO}</p>`);
    await component.updateComplete;
  });

  describe('Aba', () => {
    it('fica antes de "Notas" e começa sem comentários', () => {
      const paineis = Array.from(component.querySelectorAll('#tabs-direita > sl-tab')).map(tab => tab.getAttribute('panel'));

      expect(paineis.indexOf('comentarios')).to.equal(paineis.indexOf('notas') - 1);
      expect(aba().textContent).to.include('Não há comentários registrados.');
    });

    it('não existe no modo anexo de parecer', async () => {
      const documento = novoDocumentoArticulado();
      documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ anexoParecer: true })];
      await component.abrirDocumentoArticulado(documento);
      await component.updateComplete;

      expect(!!component.querySelector('#tabs-direita > sl-tab[panel="comentarios"]')).to.equal(false);
      expect(!!aba()).to.equal(false);
    });
  });

  describe('Adicionar', () => {
    it('cria a sequência com o usuário atual, destaca o trecho e exibe a aba com a sequência destacada', async () => {
      const id = await comentar(0, 16, 'Meu comentário');

      expect(sequencias()).to.have.length(1);
      expect(sequencias()[0].comentarios[0]).to.deep.include({ texto: 'Meu comentário' });
      expect(sequencias()[0].comentarios[0].usuario).to.deep.include({ nome: 'Fulano de Tal', id: 'sf:fulano' });
      expect(editor().getTextoComentario(id)).to.equal('Primeiro trecho ');
      expect(editor().quill.root.querySelector('comentario').classList.contains('comentario-selecionado')).to.equal(true);
      expect(abaAtiva('tabs-direita')).to.equal('comentarios');
      expect(cards()).to.have.length(1);
      expect(cards()[0].classList.contains('comentario-sequencia--selecionada')).to.equal(true);
      expect(cards()[0].querySelector('.comentario-sequencia__trecho')!.textContent).to.equal('Primeiro trecho ');
      expect(cards()[0].querySelector('.comentario-item__editar')!.textContent).to.include('Editar');
    });

    it('o modal fica visível mesmo com outra aba ativa no painel da direita', async () => {
      expect(abaAtiva('tabs-direita')).to.not.equal('comentarios');
      editor().emitirAbrirModalComentario({ index: 0, length: 8 });
      await aba().updateComplete;
      const painel = (): Element | null | undefined => aba().containerModais.querySelector('#dlg-comentario')?.shadowRoot?.querySelector('[part~="panel"]');

      await waitUntil(() => (painel()?.getBoundingClientRect().width ?? 0) > 0, 'o modal não ficou visível');
      clicar(aba().containerModais.querySelector('#btn-cancelar-comentario'));
    });

    it('cancelar não cria sequência nem destaca o trecho', async () => {
      editor().emitirAbrirModalComentario({ index: 0, length: 8 });
      await preencherModal('Desisti');
      clicar(aba().containerModais.querySelector('#btn-cancelar-comentario'));
      await aguardar();

      expect(sequencias()).to.have.length(0);
      expect(editor().getIdsComentarios()).to.deep.equal([]);
    });
  });

  describe('Responder, editar e excluir', () => {
    let id: string;

    beforeEach(async () => {
      id = await comentar(0, 16, 'Comentário inicial');
    });

    it('responder acrescenta a resposta do usuário atual no fim da sequência', async () => {
      clicar(cards()[0].querySelector('.comentario-sequencia__responder'));
      await preencherModal('Resposta');
      clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
      await component.updateComplete;

      expect(sequencias()[0].comentarios.map((c: any) => c.texto)).to.deep.equal(['Comentário inicial', 'Resposta']);
      expect(sequencias()[0].comentarios[1].usuario.nome).to.equal('Fulano de Tal');
    });

    it('editar troca o texto e mantém o autor e a data', async () => {
      const original = sequencias()[0].comentarios[0];
      clicar(cards()[0].querySelector('.comentario-item__editar'));
      await preencherModal('Comentário corrigido');
      clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
      await component.updateComplete;

      expect(sequencias()[0].comentarios[0]).to.deep.equal({ ...original, texto: 'Comentário corrigido' });
    });

    it('excluir uma resposta mantém a sequência com o primeiro comentário', async () => {
      clicar(cards()[0].querySelector('.comentario-sequencia__responder'));
      await preencherModal('Resposta');
      clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
      await component.updateComplete;

      clicar(cards()[0].querySelectorAll('.comentario-item')[1].querySelector('.comentario-item__excluir'));
      await confirmarExclusao();

      expect(sequencias()[0].comentarios.map((c: any) => c.texto)).to.deep.equal(['Comentário inicial']);
    });

    it('excluir a sequência retira a sequência e o destaque, sem mudar o texto', async () => {
      clicar(cards()[0].querySelector('.comentario-sequencia__excluir'));
      await confirmarExclusao();

      expect(sequencias()).to.have.length(0);
      expect(editor().possuiComentario(id)).to.equal(false);
      expect(editor().quill.getText()).to.equal(`${TEXTO}\n`);
      expect(aba().textContent).to.include('Não há comentários registrados.');
    });

    it('cancelar a exclusão da sequência mantém a sequência e o destaque', async () => {
      clicar(cards()[0].querySelector('.comentario-sequencia__excluir'));
      await aba().updateComplete;
      clicar(aba().containerModais.querySelector('#btn-cancelar-exclusao'));
      await component.updateComplete;

      expect(sequencias()).to.have.length(1);
      expect(editor().possuiComentario(id)).to.equal(true);
    });

    it('desfazer depois de excluir a sequência não recria o destaque', async () => {
      editor().quill.history.cutoff();
      clicar(cards()[0].querySelector('.comentario-sequencia__excluir'));
      await confirmarExclusao();
      editor().quill.history.cutoff();

      editor().quill.history.undo();
      await component.updateComplete;

      expect(editor().possuiComentario(id)).to.equal(false);
      expect(sequencias()).to.have.length(0);
    });
  });

  describe('Sequência removida com o trecho', () => {
    let id: string;

    beforeEach(async () => {
      id = await comentar(0, 16, 'Comentário');
      editor().quill.history.cutoff();
    });

    it('apagar todo o trecho tira a sequência da aba; desfazer devolve o texto sem destaque e sem a sequência', async () => {
      editor().quill.deleteText(0, 16, 'user');
      await component.updateComplete;
      expect(sequencias()).to.have.length(0);

      editor().quill.history.cutoff();
      editor().quill.history.undo();
      await component.updateComplete;

      expect(editor().quill.getText()).to.equal(`${TEXTO}\n`);
      expect(editor().possuiComentario(id)).to.equal(false);
      expect(sequencias()).to.have.length(0);
    });

    it('apagar parte do trecho mantém a sequência e o destaque do restante', async () => {
      editor().quill.deleteText(0, 9, 'user');
      await component.updateComplete;

      expect(sequencias()).to.have.length(1);
      expect(editor().getTextoComentario(id)).to.equal('trecho ');
    });

    it('colar um trecho comentado copiado não cria outra sequência', async () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/html', `<p><comentario id-sequencia-comentario="${id}">Primeiro trecho</comentario></p>`);
      editor().quill.setSelection(TEXTO.length, 0);
      editor().quill.root.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }));
      await aguardar();

      expect(editor().getIdsComentarios()).to.deep.equal([id]);
      expect(editor().getTextoComentario(id)).to.equal('Primeiro trecho ');
      expect(sequencias()).to.have.length(1);
    });

    it('marcação sem sequência perde o destaque', async () => {
      editor().quill.formatText(30, 6, 'comentario', 'orfa', 'user');
      await component.updateComplete;

      expect(editor().getIdsComentarios()).to.deep.equal([id]);
    });
  });

  describe('Seleção entre o texto e a aba', () => {
    let id: string;

    beforeEach(async () => {
      await comentar(0, 8, 'Primeiro');
      id = await comentar(18, 7, 'Segundo');
    });

    it('cursor num trecho comentado destaca a sequência; fora de trechos, nenhuma', async () => {
      editor().onSelectionChange({ index: 2, length: 0 });
      await aguardar();
      await component.updateComplete;
      expect(
        cards()
          .filter(c => c.classList.contains('comentario-sequencia--selecionada'))
          .map(c => c.dataset.idSequenciaComentario)
      ).to.deep.equal([sequencias()[0].id]);

      editor().onSelectionChange({ index: 12, length: 0 });
      await aguardar();
      await component.updateComplete;
      expect(cards().some(c => c.classList.contains('comentario-sequencia--selecionada'))).to.equal(false);
    });

    it('clicar na sequência exibe a justificação com o cursor no início do trecho e destaca a sequência', async () => {
      (component as any)._tabsEsquerda.show('lexml-eta-proposicao');
      const card = cards().find(c => c.dataset.idSequenciaComentario === id)!;

      clicar(card.querySelector('.comentario-sequencia__trecho'));
      await component.updateComplete;

      expect(abaAtiva('tabs-esquerda')).to.equal('justificativa');
      expect(editor().quill.getSelection()).to.deep.equal({ index: 18, length: 0 });
      expect(card.classList.contains('comentario-sequencia--selecionada')).to.equal(true);
    });

    // Exibir a aba da justificação depois de comentar também cria os ícones, que não têm posição com o editor oculto.
    it('o ícone do trecho exibe a aba de comentários com a sequência destacada', async () => {
      (component as any)._tabsDireita.show('notas');
      (component as any)._tabsEsquerda.show('justificativa');
      const seletor = `.comentario-texto-icone[data-id-sequencia-comentario="${id}"]`;
      await waitUntil(() => !!editor().querySelector(seletor), 'o ícone não foi criado ao exibir a justificação');
      const icone = editor().querySelector(seletor);

      clicar(icone);
      await component.updateComplete;

      expect(abaAtiva('tabs-direita')).to.equal('comentarios');
      expect(
        cards()
          .find(c => c.dataset.idSequenciaComentario === id)!
          .classList.contains('comentario-sequencia--selecionada')
      ).to.equal(true);
    });
  });

  it('abrir outro documento descarta os comentários', async () => {
    await comentar(0, 8, 'Comentário');

    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    await component.updateComplete;

    expect(sequencias()).to.have.length(0);
    expect(aba().textContent).to.include('Não há comentários registrados.');
  });
});
