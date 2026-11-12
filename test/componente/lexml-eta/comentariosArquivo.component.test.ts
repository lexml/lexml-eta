import { expect, fixture } from '@open-wc/testing';
import type { LexmlEtaComponent } from '../../../src';
import '../../../src';
import { Usuario } from '../../../src/model/revisao/usuario';
import { rootStore } from '../../../src/redux/store';
import { congelarRelogio, lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado, restaurarRelogio } from '../../doc/documentoArticulado';

const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const TEXTO = 'Primeiro trecho e segundo trecho do texto.';

const clicar = (el: Element | null): void => {
  el!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
};
const aguardar = (): Promise<unknown> => new Promise(resolve => setTimeout(resolve, 0));

describe('ETA — comentários da justificação no arquivo', () => {
  let component: LexmlEtaComponent;

  const editor = (): any => component.querySelector('#lexml-eta-editor-texto-rico-justificativa');
  const aba = (): any => component.querySelector('lexml-eta-comentarios');
  const sequencias = (): any[] => (component as any).sequenciasComentario;

  const comentar = async (index: number, length: number, texto: string): Promise<string> => {
    editor().quill.setSelection(index, length, 'silent');
    editor().emitirAbrirModalComentario({ index, length });
    await aba().updateComplete;
    const textarea = aba().containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement;
    textarea.value = texto;
    textarea.dispatchEvent(new Event('input'));
    await aba().updateComplete;
    clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
    await aguardar();
    await component.updateComplete;
    return sequencias()[sequencias().length - 1]?.id;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    component.setUsuario(FULANO);
    editor().setContent(`<p>${TEXTO}</p>`);
    await component.updateComplete;
  });

  describe('Salvar', () => {
    it('grava o trecho como span _tc, a sequência com o autor e a pendência', async () => {
      const id = await comentar(0, 16, 'Linha 1\nLinha 2');

      const salvo: any = component.getDocumentoArticulado();

      expect(JSON.stringify(salvo.value.projetoNorma.justificacao)).to.include(`"id":"_tc${id}_1"`);
      const lexedit = lexeditSalvo(salvo);
      const [seq] = lexedit.comentarios.sequenciaComentario;
      expect(seq.refIdElementoComentado).to.equal(`_tc${id}_1`);
      expect(seq.comentario).to.have.length(1);
      expect(seq.comentario[0]).to.deep.include({ refIdUsuario: 'sf:fulano' });
      expect(seq.comentario[0].p.map((p: any) => p.content?.join('') ?? '')).to.deep.equal(['Linha 1', 'Linha 2']);
      expect(lexedit.usuarios.usuario.map((u: any) => u.idUsuario)).to.deep.equal(['sf:fulano']);
      expect(lexedit.pendencias.pendencia).to.include('Remover comentários.');
    });

    it('sem comentários não grava Comentarios nem a pendência', async () => {
      const lexedit = lexeditSalvo(component.getDocumentoArticulado());

      expect(lexedit.comentarios).to.equal(undefined);
      expect(lexedit.pendencias?.pendencia ?? []).to.not.include('Remover comentários.');
    });

    it('não grava comentários no modo anexo de parecer', async () => {
      const documento = novoDocumentoArticulado();
      documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ anexoParecer: true })];
      await component.abrirDocumentoArticulado(documento);
      await component.updateComplete;

      const lexedit = lexeditSalvo(component.getDocumentoArticulado());

      expect(lexedit.comentarios).to.equal(undefined);
    });
  });

  describe('Abrir', () => {
    const alertasComentarios = (): any[] => rootStore.getState().elementoReducer.ui?.alertas?.filter((a: any) => a.id === 'alerta-global-comentarios') ?? [];
    const cards = (): HTMLElement[] => Array.from(component.querySelectorAll<HTMLElement>('lexml-eta-comentarios .comentario-sequencia'));
    const clonar = (doc: unknown): any => JSON.parse(JSON.stringify(doc));
    const destacados = (): number => editor().quill.root.querySelectorAll('comentario').length;

    // Documento salvo com um comentário do usuário atual, para os cenários alterarem o arquivo.
    const salvarComComentario = async (texto = 'Linha 1\nLinha 2'): Promise<{ doc: any; id: string }> => {
      const id = await comentar(0, 16, texto);
      return { doc: clonar(component.getDocumentoArticulado()), id };
    };
    const reabrir = async (doc: unknown): Promise<void> => {
      await component.abrirDocumentoArticulado(doc);
      await component.updateComplete;
      await aba()?.updateComplete;
    };

    afterEach(() => restaurarRelogio());

    it('recria o trecho, a sequência na aba, o alerta e a pendência', async () => {
      const { doc, id } = await salvarComComentario();
      await reabrir(doc);

      expect(sequencias().map(s => s.id)).to.deep.equal([id]);
      expect(editor().possuiComentario(id)).to.equal(true);
      expect(editor().getTextoComentario(id)).to.equal('Primeiro trecho ');
      expect(cards()).to.have.length(1);
      expect(cards()[0].querySelector('.comentario-item__autor')!.textContent).to.equal('Fulano de Tal');
      expect(alertasComentarios()).to.have.length(1);
      expect((component as any).getPendenciasPreenchimento(component.getProposicao())).to.include('Remover comentários.');
    });

    it('comentário em duas linhas volta em duas linhas', async () => {
      const { doc, id } = await salvarComComentario('Linha 1\nLinha 2');
      await reabrir(doc);

      expect(sequencias().find(s => s.id === id).comentarios[0].texto).to.equal('Linha 1\nLinha 2');
    });

    it('o comentário do usuário atual tem o botão Editar e o de outro autor não', async () => {
      const { doc } = await salvarComComentario('meu');
      const lexedit = lexeditSalvo(doc);
      const [seq] = lexedit.comentarios.sequenciaComentario;
      seq.comentario.push({ ...clonar(seq.comentario[0]), refIdUsuario: 'sf:ciclano' });
      lexedit.usuarios.usuario.push({ TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario', idUsuario: 'sf:ciclano', nome: 'Ciclano' });
      await reabrir(doc);

      const itens = Array.from(cards()[0].querySelectorAll('.comentario-item'));
      expect(itens.map(i => i.querySelector('.comentario-item__autor')!.textContent)).to.deep.equal(['Fulano de Tal', 'Ciclano']);
      expect(itens.map(i => !!i.querySelector('.comentario-item__editar'))).to.deep.equal([true, false]);
    });

    it('autor sem registro em Usuarios aparece pelo id', async () => {
      const { doc } = await salvarComComentario();
      delete lexeditSalvo(doc).usuarios;
      await reabrir(doc);

      expect(cards()[0].querySelector('.comentario-item__autor')!.textContent).to.equal('sf:fulano');
    });

    it('trecho em dois parágrafos volta como uma sequência e excluí-la retira o destaque dos dois fragmentos', async () => {
      editor().setContent('<p>Primeiro parágrafo.</p><p>Segundo parágrafo.</p>');
      const id = await comentar(5, 20, 'Atravessa');
      expect(destacados()).to.equal(2);
      const doc = clonar(component.getDocumentoArticulado());
      expect(JSON.stringify(doc.value.projetoNorma.justificacao)).to.include(`_tc${id}_2`);
      await reabrir(doc);

      expect(sequencias()).to.have.length(1);
      expect(destacados()).to.equal(2);
      clicar(cards()[0].querySelector('.comentario-sequencia__acao--excluir'));
      await aba().updateComplete;
      clicar(aba().containerModais.querySelector('#btn-confirmar-exclusao'));
      await component.updateComplete;
      expect(destacados()).to.equal(0);
      expect(sequencias()).to.have.length(0);
    });

    it('trecho sem sequência vira texto comum', async () => {
      const { doc } = await salvarComComentario();
      delete lexeditSalvo(doc).comentarios;
      await reabrir(doc);

      expect(sequencias()).to.have.length(0);
      expect(destacados()).to.equal(0);
      expect(editor().quill.getText()).to.include('Primeiro trecho e segundo trecho');
      expect(alertasComentarios()).to.have.length(0);
    });

    it('sequência sem trecho na justificação é descartada', async () => {
      const { doc, id } = await salvarComComentario();
      const [seq] = lexeditSalvo(doc).comentarios.sequenciaComentario;
      seq.refIdElementoComentado = '_tcoutro_1';
      await reabrir(doc);

      expect(sequencias()).to.have.length(0);
      expect(editor().possuiComentario(id)).to.equal(false);
      expect(alertasComentarios()).to.have.length(0);
    });

    it('sequência sobre dispositivo da articulação é descartada sem impedir a abertura', async () => {
      const { doc } = await salvarComComentario();
      const sequenciasGravadas = lexeditSalvo(doc).comentarios.sequenciaComentario;
      sequenciasGravadas.push({ ...clonar(sequenciasGravadas[0]), refIdElementoComentado: 'art1' });
      await reabrir(doc);

      expect(sequencias()).to.have.length(1);
    });

    it('abrir um documento sem comentários limpa as sequências do anterior', async () => {
      await comentar(0, 16, 'x');
      await reabrir(novoDocumentoArticulado());

      expect(sequencias()).to.have.length(0);
      expect(alertasComentarios()).to.have.length(0);
    });

    it('salvar, reabrir e salvar de novo gera o mesmo documento', async () => {
      congelarRelogio();
      editor().setContent('<p>Primeiro parágrafo.</p><p>Segundo parágrafo.</p>');
      await comentar(5, 20, 'Linha 1\nLinha 2');
      const primeiro = clonar(component.getDocumentoArticulado());
      await reabrir(primeiro);

      expect(clonar(component.getDocumentoArticulado())).to.deep.equal(primeiro);
    });
  });
});
