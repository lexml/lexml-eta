import { expect, fixture } from '@open-wc/testing';
import type { LexmlEtaComponent } from '../../../src';
import '../../../src';
import { Usuario } from '../../../src/model/revisao/usuario';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

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
});
