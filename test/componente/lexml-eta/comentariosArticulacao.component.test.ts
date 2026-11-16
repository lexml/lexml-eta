import { expect, fixture, waitUntil } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { adicionarArtigoAntes, adicionarArtigoDepois } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { shiftTabAction } from '../../../src/model/lexml/acao/shiftTabAction';
import { UndoAction } from '../../../src/model/lexml/acao/undoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { Usuario } from '../../../src/model/revisao/usuario';
import { rootStore } from '../../../src/redux/store';
import { StateType } from '../../../src/redux/state';
import { metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const TEXTO = 'Primeiro trecho e segundo trecho do texto.';

const clicar = (el: Element | null): void => {
  el!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
};
const aguardar = (ms = 0): Promise<unknown> => new Promise(resolve => setTimeout(resolve, ms));

describe('ETA — comentários na articulação', () => {
  let component: LexmlEtaComponent;
  let editor: any;

  const articulacao = (): any => rootStore.getState().elementoReducer.articulacao;
  const dispositivo = (id: string): any => buscaDispositivoById(articulacao(), id);
  const justificacao = (): any => component.querySelector('#lexml-eta-editor-texto-rico-justificativa');
  const aba = (): any => component.querySelector('lexml-eta-comentarios');
  const sequencias = (): any[] => (component as any).sequenciasComentario;
  const cards = (): HTMLElement[] => Array.from(component.querySelectorAll<HTMLElement>('lexml-eta-comentarios .comentario-sequencia'));
  const card = (id: string): HTMLElement | undefined => cards().find(c => c.dataset.idSequenciaComentario === id);
  const selecionadas = (): string[] =>
    cards()
      .filter(c => c.classList.contains('comentario-sequencia--selecionada'))
      .map(c => c.dataset.idSequenciaComentario!);
  const abaAtiva = (grupo: string): string | null => component.querySelector(`#${grupo} > sl-tab[active]`)?.getAttribute('panel') ?? null;
  const icone = (uuid2: string): boolean => !!editor.quill.getLinhaByUuid2(uuid2)?.domNode.querySelector('.blot__opcoes_comentario');
  const identificacao = (id: string): string => card(id)!.querySelector('.comentario-sequencia__trecho-texto')!.textContent!;

  const selecionar = async (id: string): Promise<void> => {
    // Move o cursor do Quill, não só o estado: sem linha atual, o foco inicial automático seleciona a ementa depois.
    editor.posicionarCursorNoDispositivo(dispositivo(id).uuid2);
    await editor.updateComplete;
    await component.updateComplete;
  };

  const preencherModal = async (texto: string): Promise<void> => {
    await aba().updateComplete;
    const textarea = aba().containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement;
    textarea.value = texto;
    textarea.dispatchEvent(new Event('input'));
    await aba().updateComplete;
  };

  // Comenta o dispositivo pelo botão da barra do editor.
  const comentarDispositivo = async (id: string, texto = 'Comentário no dispositivo'): Promise<string> => {
    await selecionar(id);
    editor.querySelector('.button-comentario-articulacao').click();
    await preencherModal(texto);
    clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
    await aguardar(20);
    await component.updateComplete;
    await editor.updateComplete;
    return sequencias()[sequencias().length - 1]?.id;
  };

  const comentarJustificacao = async (index: number, length: number, texto: string): Promise<string> => {
    justificacao().quill.setSelection(index, length, 'silent');
    justificacao().emitirAbrirModalComentario({ index, length });
    await preencherModal(texto);
    clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
    await aguardar(120);
    await component.updateComplete;
    return sequencias()[sequencias().length - 1]?.id;
  };

  const revisaoDeExclusao = (): any => rootStore.getState().elementoReducer.revisoes.find((r: any) => r.stateType === StateType.ElementoRemovido);

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    (component as any).TABLET_WIDTH = 0;
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    component.setUsuario(FULANO);
    justificacao().setContent(`<p>${TEXTO}</p>`);
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await component.updateComplete;
  });

  afterEach(() => {
    // O onchange do editor é agendado para 1 s depois da ação; sem cancelar, dispara com o Quill do teste já destruído.
    editor?.cancelarTimerOnChangePendente();
    rootStore.getState().elementoReducer.emRevisao && rootStore.dispatch(ativarDesativarRevisaoAction.execute());
  });

  describe('Adicionar', () => {
    it('o modal mostra a identificação; ao confirmar, cria a sequência, exibe o ícone e a aba com a sequência destacada', async () => {
      await selecionar('art1_par1u');
      editor.querySelector('.button-comentario-articulacao').click();
      await aba().updateComplete;
      expect(aba().containerModais.querySelector('.comentario-modal__trecho-texto').textContent).to.equal('parágrafo único do art. 1º');
      await preencherModal('Revisar.');
      clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
      await aguardar(20);
      await component.updateComplete;
      await editor.updateComplete;

      const seq = sequencias()[0];
      expect(seq.uuid2Dispositivo).to.equal(dispositivo('art1_par1u').uuid2);
      expect(seq.comentarios[0].usuario.nome).to.equal('Fulano de Tal');
      expect(icone(seq.uuid2Dispositivo)).to.equal(true);
      expect(abaAtiva('tabs-direita')).to.equal('comentarios');
      expect(selecionadas()).to.deep.equal([seq.id]);
      expect(card(seq.id)!.querySelector('.comentario-sequencia__origem')!.textContent).to.equal('No texto');
      expect(identificacao(seq.id)).to.equal('parágrafo único do art. 1º');
    });

    it('cancelar não cria sequência nem ícone', async () => {
      await selecionar('art1');
      editor.querySelector('.button-comentario-articulacao').click();
      await preencherModal('Desisti');
      clicar(aba().containerModais.querySelector('#btn-cancelar-comentario'));
      await aguardar(20);

      expect(sequencias()).to.have.length(0);
      expect(icone(dispositivo('art1').uuid2)).to.equal(false);
    });

    it('a ementa é identificada como "ementa"', async () => {
      const id = await comentarDispositivo('ementa');
      expect(identificacao(id)).to.equal('ementa');
    });

    it('responder e editar seguem o fluxo da justificação; excluir a sequência retira o ícone', async () => {
      const id = await comentarDispositivo('art1');
      const uuid2 = dispositivo('art1').uuid2;
      clicar(card(id)!.querySelector('.comentario-sequencia__responder'));
      await preencherModal('Resposta');
      clicar(aba().containerModais.querySelector('#btn-confirmar-comentario'));
      await component.updateComplete;
      expect(sequencias()[0].comentarios.map((c: any) => c.texto)).to.deep.equal(['Comentário no dispositivo', 'Resposta']);

      clicar(card(id)!.querySelector('.comentario-sequencia__acao--excluir'));
      await aba().updateComplete;
      clicar(aba().containerModais.querySelector('#btn-confirmar-exclusao'));
      await component.updateComplete;
      await editor.updateComplete;

      expect(sequencias()).to.have.length(0);
      expect(icone(uuid2)).to.equal(false);
    });

    it('um dispositivo já comentado não ganha uma segunda sequência', async () => {
      await comentarDispositivo('art1');
      (component as any).abrirModalAdicionarComentarioDispositivo(new CustomEvent('x', { detail: { uuid2Dispositivo: dispositivo('art1').uuid2 } }));
      await aguardar(20);
      expect(sequencias()).to.have.length(1);
    });
  });

  describe('Cursor e aba', () => {
    it('cursor no dispositivo comentado destaca a sequência; em outro, nenhuma', async () => {
      const id = await comentarDispositivo('art1_par1u');
      await selecionar('art1');
      expect(selecionadas()).to.deep.equal([]);

      await selecionar('art1_par1u');
      expect(selecionadas()).to.deep.equal([id]);
    });

    it('clicar na sequência exibe a aba "Texto", posiciona o cursor e mantém a seleção', async () => {
      const id = await comentarDispositivo('art1_par1u');
      (component as any)._tabsEsquerda.show('justificativa');
      await component.updateComplete;

      clicar(card(id)!.querySelector('.comentario-sequencia__trecho'));
      await aguardar(20);
      await component.updateComplete;

      expect(abaAtiva('tabs-esquerda')).to.equal('lexml-eta-proposicao');
      expect(editor.quill.linhaAtual.uuid2).to.equal(dispositivo('art1_par1u').uuid2);
      expect(selecionadas()).to.deep.equal([id]);
    });

    it('o ícone do dispositivo exibe a aba com a sequência destacada', async () => {
      const id = await comentarDispositivo('art1_par1u');
      (component as any)._tabsDireita.show('notas');
      await component.updateComplete;

      editor.quill.getLinhaByUuid2(dispositivo('art1_par1u').uuid2).domNode.querySelector('.blot__opcoes_comentario').click();
      await aguardar(20);
      await component.updateComplete;

      expect(abaAtiva('tabs-direita')).to.equal('comentarios');
      expect(selecionadas()).to.deep.equal([id]);
    });

    it('em tela pequena, o ícone do dispositivo abre o modal da lista', async () => {
      await comentarDispositivo('art1_par1u');
      aba().fecharModalLista();
      (component as any).TABLET_WIDTH = 100000;

      editor.quill.getLinhaByUuid2(dispositivo('art1_par1u').uuid2).domNode.querySelector('.blot__opcoes_comentario').click();
      await aguardar(20);
      await aba().updateComplete;

      expect(!!aba().containerModais.querySelector('#dlg-lista-comentarios')?.open).to.equal(true);
    });

    it('"Ordem no texto" põe a articulação antes da justificação', async () => {
      const daJustificacao = await comentarJustificacao(0, 8, 'Na justificação');
      const doDispositivo = await comentarDispositivo('art1');
      expect(cards().map(c => c.dataset.idSequenciaComentario)).to.deep.equal([doDispositivo, daJustificacao]);
    });
  });

  describe('Exclusão e transformação', () => {
    it('renumerar atualiza a identificação exibida na aba', async () => {
      const id = await comentarDispositivo('art1_par1u');
      rootStore.dispatch(adicionarArtigoAntes.execute(createElemento(dispositivo('art1')), ''));
      await aguardar(20);
      await aba().updateComplete;

      expect(identificacao(id)).to.equal('parágrafo único do art. 2º');
    });

    it('excluir o dispositivo remove a sequência; desfazer não a recria', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      await comentarDispositivo('art1_par1u');
      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1_par1u')), undefined));
      await component.updateComplete;
      expect(sequencias()).to.have.length(0);

      rootStore.dispatch(UndoAction());
      await waitUntil(() => !!editor.quill.getLinhaByUuid2(uuid2), 'o dispositivo não voltou');
      await aguardar(20);
      await component.updateComplete;

      expect(sequencias()).to.have.length(0);
      expect(icone(uuid2)).to.equal(false);
    });

    it('excluir o pai remove a sequência do filho, e o alerta some', async () => {
      rootStore.dispatch(adicionarArtigoDepois.execute(createElemento(dispositivo('art1')), ''));
      await aguardar(20);
      await comentarDispositivo('art1_par1u');
      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1')), undefined));
      await component.updateComplete;

      expect(sequencias()).to.have.length(0);
      expect(rootStore.getState().elementoReducer.ui?.alertas?.some((a: any) => a.id === 'alerta-global-comentarios')).to.equal(false);
    });

    it('excluir em revisão mantém a sequência e o ícone; aceitar remove', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      const id = await comentarDispositivo('art1_par1u');
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1_par1u')), undefined));
      await aguardar(20);
      await component.updateComplete;

      expect(sequencias().map(s => s.id)).to.deep.equal([id]);
      expect(icone(uuid2)).to.equal(true);
      expect(identificacao(id)).to.equal('parágrafo único do art. 1º');

      rootStore.dispatch({ type: ACEITAR_REVISAO, revisao: revisaoDeExclusao() });
      await aguardar(20);
      await component.updateComplete;
      expect(sequencias()).to.have.length(0);
    });

    it('rejeitar a exclusão em revisão mantém a sequência e o ícone no dispositivo restaurado', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      const id = await comentarDispositivo('art1_par1u');
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1_par1u')), undefined));
      await aguardar(20);

      rootStore.dispatch({ type: REJEITAR_REVISAO, revisao: revisaoDeExclusao() });
      await aguardar(50);
      await component.updateComplete;
      await editor.updateComplete;

      expect(sequencias().map(s => s.id)).to.deep.equal([id]);
      expect(!!dispositivo('art1_par1u')).to.equal(true);
      expect(icone(uuid2)).to.equal(true);
    });

    it('transformar o dispositivo mantém a sequência no novo dispositivo; desfazer a devolve ao original', async () => {
      const uuid2Original = dispositivo('art1_par1u').uuid2;
      const id = await comentarDispositivo('art1_par1u');
      rootStore.dispatch(shiftTabAction(createElemento(dispositivo('art1_par1u'))));
      await aguardar(20);
      await component.updateComplete;
      await editor.updateComplete;

      const novo = sequencias()[0].uuid2Dispositivo;
      expect(sequencias().map(s => s.id)).to.deep.equal([id]);
      expect(novo).to.not.equal(uuid2Original);
      expect(identificacao(id)).to.equal('art. 2º');
      expect(icone(novo)).to.equal(true);

      rootStore.dispatch(UndoAction());
      await aguardar(50);
      await component.updateComplete;
      await editor.updateComplete;

      expect(sequencias().map(s => s.id)).to.deep.equal([id]);
      expect(identificacao(id)).to.equal('parágrafo único do art. 1º');
      expect(icone(sequencias()[0].uuid2Dispositivo)).to.equal(true);
    });
  });

  describe('Salvar (c02, task 2.3)', () => {
    const refsSalvos = (): string[] =>
      component.getDocumentoArticulado().value.metadado.metadadoProprietario![0].any[0].value.comentarios!.sequenciaComentario.map((s: any) => s.refIdElementoComentado);

    it('grava as sequências da articulação antes das da justificação, na ordem da aba', async () => {
      const daJustificacao = await comentarJustificacao(0, 8, 'Na justificação');
      await comentarDispositivo('art1_par1u');
      await comentarDispositivo('art1');

      expect(refsSalvos()).to.deep.equal(['art1_cpt', 'art1_par1u', `_tc${daJustificacao}_1`]);
    });

    it('no anexo de parecer, grava as sequências da articulação', async () => {
      const documento = novoDocumentoArticulado();
      documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ anexoParecer: true })];
      await component.abrirDocumentoArticulado(documento);
      await editor.aguardarCarregamentoDasLinhas();
      await component.updateComplete;
      await comentarDispositivo('art1');

      expect(refsSalvos()).to.deep.equal(['art1_cpt']);
    });
  });

  describe('Abrir (c02, task 3.2)', () => {
    const lexeditDe = (documento: any): any => documento.value.metadado.metadadoProprietario[0].any[0].value;
    const reabrir = async (documento: any): Promise<void> => {
      await component.abrirDocumentoArticulado(documento);
      await editor.aguardarCarregamentoDasLinhas();
      await aguardar(50);
      await component.updateComplete;
      await editor.updateComplete;
    };
    // Cópia do arquivo salvo com os refs trocados, para os casos que a tela não produz.
    const comRefs = (documento: any, ...refs: string[]): any => {
      const copia = JSON.parse(JSON.stringify(documento));
      const modelo = lexeditDe(copia).comentarios.sequenciaComentario[0];
      lexeditDe(copia).comentarios.sequenciaComentario = refs.map((ref, i) => ({
        ...JSON.parse(JSON.stringify(modelo)),
        refIdElementoComentado: ref,
        comentario: [{ ...modelo.comentario[0], p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [`c${i}`] }] }],
      }));
      return copia;
    };
    const textos = (): string[] => sequencias().map(s => s.comentarios[0].texto);

    it('reabrir liga as sequências aos dispositivos, com ícone, identificação e alerta', async () => {
      await comentarDispositivo('art1_par1u', 'No parágrafo');
      await comentarDispositivo('art1', 'No artigo');
      await reabrir(component.getDocumentoArticulado());

      expect(sequencias().map(s => s.uuid2Dispositivo)).to.deep.equal([dispositivo('art1').uuid2, dispositivo('art1_par1u').uuid2]);
      expect(textos()).to.deep.equal(['No artigo', 'No parágrafo']);
      expect(icone(dispositivo('art1').uuid2)).to.equal(true);
      expect(icone(dispositivo('art1_par1u').uuid2)).to.equal(true);
      expect(cards().map(c => c.querySelector('.comentario-sequencia__trecho-texto')!.textContent)).to.deep.equal(['art. 1º', 'parágrafo único do art. 1º']);
      expect(rootStore.getState().elementoReducer.ui?.alertas?.some((a: any) => a.id === 'alerta-global-comentarios')).to.equal(true);
    });

    it('o ref do artigo (sem _cpt) e o da ementa também são ligados', async () => {
      await comentarDispositivo('art1');
      const salvo = component.getDocumentoArticulado();
      await reabrir(comRefs(salvo, 'art1', 'ementa'));

      expect(sequencias().map(s => s.uuid2Dispositivo)).to.deep.equal([dispositivo('art1').uuid2, articulacao().projetoNorma.ementa.uuid2]);
    });

    it('ref sem dispositivo é descartado, e de dois no mesmo dispositivo vale o primeiro', async () => {
      await comentarDispositivo('art1');
      await reabrir(comRefs(component.getDocumentoArticulado(), 'art99_cpt', 'art1_cpt', 'art1'));

      expect(textos()).to.deep.equal(['c1']);
    });

    it('depois de abrir, a identificação acompanha a renumeração', async () => {
      await comentarDispositivo('art1_par1u');
      await reabrir(component.getDocumentoArticulado());
      rootStore.dispatch(adicionarArtigoAntes.execute(createElemento(dispositivo('art1')), ''));
      await aguardar(20);
      await aba().updateComplete;

      expect(cards()[0].querySelector('.comentario-sequencia__trecho-texto')!.textContent).to.equal('parágrafo único do art. 2º');
    });

    it('dispositivo excluído em revisão volta com o ícone; rejeitar mantém e aceitar remove', async () => {
      await comentarDispositivo('art1_par1u');
      const uuid2 = dispositivo('art1_par1u').uuid2;
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1_par1u')), undefined));
      await aguardar(20);
      const salvo = component.getDocumentoArticulado();
      expect(lexeditDe(salvo).comentarios.sequenciaComentario[0].refIdElementoComentado).to.equal('_art1_par1u-exc1');

      await reabrir(salvo);
      // Reaberto, o dispositivo é outro objeto, com outro uuid2: o da revisão de exclusão reconstruída.
      const reaberto = revisaoDeExclusao().elementoAntesRevisao.uuid2;
      expect(reaberto).to.not.equal(uuid2);
      expect(sequencias().map(s => s.uuid2Dispositivo)).to.deep.equal([reaberto]);
      expect(icone(reaberto)).to.equal(true);

      rootStore.dispatch({ type: REJEITAR_REVISAO, revisao: revisaoDeExclusao() });
      await aguardar(50);
      await component.updateComplete;
      expect(sequencias()).to.have.length(1);
      expect(!!dispositivo('art1_par1u')).to.equal(true);

      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1_par1u')), undefined));
      await aguardar(20);
      rootStore.dispatch({ type: ACEITAR_REVISAO, revisao: revisaoDeExclusao() });
      await aguardar(20);
      await component.updateComplete;
      expect(sequencias()).to.have.length(0);
    });

    it('salvar, reabrir e salvar de novo grava os mesmos Comentarios e Usuarios', async () => {
      await comentarJustificacao(0, 8, 'Na justificação');
      await comentarDispositivo('art1_par1u', 'No parágrafo');
      const primeiro = component.getDocumentoArticulado();
      await reabrir(primeiro);
      const segundo = component.getDocumentoArticulado();

      expect(JSON.stringify(lexeditDe(segundo).comentarios).replace(/_tc[0-9a-f-]+_/g, '_tc*_')).to.equal(
        JSON.stringify(lexeditDe(primeiro).comentarios).replace(/_tc[0-9a-f-]+_/g, '_tc*_')
      );
      expect(lexeditDe(segundo).usuarios).to.deep.equal(lexeditDe(primeiro).usuarios);
    });
  });

  describe('Regressão da justificação com as duas listas', () => {
    let doDispositivo: string;
    let daJustificacao: string;

    beforeEach(async () => {
      daJustificacao = await comentarJustificacao(0, 8, 'Na justificação');
      doDispositivo = await comentarDispositivo('art1');
    });

    it('editar a justificação (comentarios-alterados) não descarta a sequência da articulação', async () => {
      justificacao().quill.insertText(TEXTO.length, ' Mais.', 'user');
      justificacao().dispatchEvent(new CustomEvent('comentarios-alterados', { detail: { ids: justificacao().getIdsComentarios() } }));
      await component.updateComplete;

      expect(sequencias().map(s => s.id)).to.deep.equal([daJustificacao, doDispositivo]);
    });

    it('apagar o trecho da justificação remove só a sequência dele', async () => {
      justificacao().quill.deleteText(0, 8, 'user');
      await aguardar(20);
      await component.updateComplete;

      expect(sequencias().map(s => s.id)).to.deep.equal([doDispositivo]);
    });

    it('excluir a sequência da articulação não mexe na marcação da justificação', async () => {
      clicar(card(doDispositivo)!.querySelector('.comentario-sequencia__acao--excluir'));
      await aba().updateComplete;
      clicar(aba().containerModais.querySelector('#btn-confirmar-exclusao'));
      await component.updateComplete;

      expect(sequencias().map(s => s.id)).to.deep.equal([daJustificacao]);
      expect(justificacao().possuiComentario(daJustificacao)).to.equal(true);
    });

    it('clicar na sequência da justificação continua exibindo a justificação', async () => {
      (component as any)._tabsEsquerda.show('lexml-eta-proposicao');
      clicar(card(daJustificacao)!.querySelector('.comentario-sequencia__trecho'));
      await component.updateComplete;

      expect(abaAtiva('tabs-esquerda')).to.equal('justificativa');
      expect(selecionadas()).to.deep.equal([daJustificacao]);
    });

    it('cursor num dispositivo sem comentário não desfaz a seleção da justificação', async () => {
      clicar(card(daJustificacao)!.querySelector('.comentario-sequencia__trecho'));
      await component.updateComplete;
      (component as any).onComentarioDispositivoSelecionado(new CustomEvent('x', { detail: { uuid2Dispositivo: dispositivo('art1_par1u').uuid2 } }));
      await component.updateComplete;

      expect(selecionadas()).to.deep.equal([daJustificacao]);
    });
  });
});
