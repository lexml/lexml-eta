import { expect, fixture, waitUntil } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionarParagrafoDepois } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { elementoSelecionadoAction } from '../../../src/model/lexml/acao/elementoSelecionadoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { UndoAction } from '../../../src/model/lexml/acao/undoAction';
import { atualizarTextoElementoAction } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { shiftTabAction } from '../../../src/model/lexml/acao/shiftTabAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const aguarda = (ms = 50): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

describe('ETA — comentários no editor da articulação', () => {
  let component: LexmlEtaComponent;
  let editor: any;

  const dispositivo = (id: string): any => buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, id);
  const botao = (): HTMLButtonElement => editor.querySelector('#lx-eta-barra-ferramenta .button-comentario-articulacao');
  const linha = (uuid2: string): any => editor.quill.getLinhaByUuid2(uuid2);
  const icone = (uuid2: string): HTMLElement | null => linha(uuid2)?.domNode.querySelector('.blot__opcoes_comentario') ?? null;
  const ouvir = (evento: string): any[] => {
    const detalhes: any[] = [];
    component.addEventListener(evento, ev => detalhes.push((ev as CustomEvent).detail));
    return detalhes;
  };
  const selecionar = async (id: string): Promise<void> => {
    rootStore.dispatch(elementoSelecionadoAction.execute(createElemento(dispositivo(id))));
    await editor.updateComplete;
  };
  const comentar = async (...uuid2s: string[]): Promise<void> => {
    editor.uuid2DispositivosComentados = uuid2s;
    await editor.updateComplete;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
  });

  afterEach(() => {
    // O onchange do editor é agendado para 1 s depois da ação; sem cancelar, dispara com o Quill do teste já destruído.
    editor?.cancelarTimerOnChangePendente();
    rootStore.getState().elementoReducer.emRevisao && rootStore.dispatch(ativarDesativarRevisaoAction.execute());
  });

  describe('Botão "Adicionar comentário"', () => {
    it('fica na barra do texto articulado, com o ícone da justificação', () => {
      expect(!!botao()).to.equal(true);
      expect(botao().getAttribute('aria-label')).to.equal('Adicionar comentário');
      expect(!!botao().querySelector('svg.icon-comentario-plus')).to.equal(true);
    });

    it('com um dispositivo selecionado sem comentário, fica habilitado e emite o evento com o uuid2', async () => {
      await selecionar('art1');
      const eventos = ouvir('abrir-modal-comentario-dispositivo');

      expect(botao().disabled).to.equal(false);
      expect(botao().title).to.equal('Adicionar comentário');
      botao().click();

      expect(eventos).to.have.length(1);
      expect(eventos[0].uuid2Dispositivo).to.equal(dispositivo('art1').uuid2);
      expect(eventos[0].elemento.lexmlId).to.equal('art1');
    });

    it('a ementa pode ser comentada', async () => {
      await selecionar('ementa');
      expect(botao().disabled).to.equal(false);
    });

    it('dispositivo já comentado: desabilitado com o motivo no título', async () => {
      await selecionar('art1');
      await comentar(dispositivo('art1').uuid2);

      expect(botao().disabled).to.equal(true);
      expect(botao().title).to.equal('Este dispositivo já possui comentário');
    });

    it('omissis, articulação e dispositivo excluído em revisão: desabilitado', async () => {
      const casos = [
        { tipo: 'Omissis', lexmlId: 'art1_cpt_omi1', uuid2: 'u-omi' },
        { tipo: 'Articulacao', lexmlId: 'articulacao', uuid2: 'u-art' },
        { tipo: 'Inciso', lexmlId: 'art1_cpt_inc1', uuid2: 'u-exc', revisao: { stateType: 'ElementoRemovido' } },
        { tipo: 'Inciso', uuid2: 'u-sem-id' },
      ];
      for (const elemento of casos) {
        editor.elementoSelecionadoAtual = elemento;
        await editor.updateComplete;
        expect(botao().disabled, elemento.tipo).to.equal(true);
        expect(botao().title).to.equal('Selecione um dispositivo para adicionar comentário');
      }
    });
  });

  describe('Ícone na linha', () => {
    it('aparece no dispositivo comentado e some quando a sequência sai', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      await comentar(uuid2);
      expect(!!icone(uuid2)).to.equal(true);
      expect(icone(uuid2)!.title).to.equal('Exibir comentário');

      await comentar();
      expect(!!icone(uuid2)).to.equal(false);
      expect(!!linha(uuid2).domNode.querySelector('.container__opcoes')).to.equal(false);
    });

    it('fica por último no contêiner de revisão', async () => {
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(adicionarParagrafoDepois.execute(createElemento(dispositivo('art1_par1u')), ''));
      await aguarda();
      const novo = rootStore.getState().elementoReducer.articulacao!.filhos[0].filhos.slice(-1)[0];
      expect(!!linha(novo.uuid2).containerRevisao).to.equal(true);

      await comentar(novo.uuid2);

      const container = linha(novo.uuid2).domNode.querySelector('.container__revisao');
      expect(container.lastElementChild.classList.contains('blot__opcoes_comentario')).to.equal(true);
    });

    it('em dispositivo com texto alterado em revisão, vem depois do ícone de diferenças', async () => {
      const par = dispositivo('art1_par1u');
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(atualizarTextoElementoAction.execute({ ...createElemento(par), conteudo: { texto: 'Texto alterado em revisão.' } }));
      await aguarda();
      await comentar(par.uuid2);

      const botoes = Array.from(linha(par.uuid2).domNode.querySelectorAll('.blot__opcoes_diff, .blot__opcoes_comentario')).map((b: any) => b.className);
      expect(botoes).to.deep.equal(['blot__opcoes_diff', 'blot__opcoes_comentario']);
    });

    // Transformar recria o dispositivo com outro uuid2; o componente raiz passa a sequência para ele (task 4.3).
    it('comentado antes da revisão, continua por último depois de aceitar, rejeitar, informações e diferenças', async () => {
      const par = dispositivo('art1_par1u');
      await comentar(par.uuid2);
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(atualizarTextoElementoAction.execute({ ...createElemento(par), conteudo: { texto: 'Texto alterado em revisão.' } }));
      await aguarda();

      const botoes = Array.from(linha(par.uuid2).domNode.querySelectorAll('[class^="blot__"]')).map((b: any) => b.className.split(' ')[0]);
      expect(botoes).to.deep.equal(['blot__revisao_aceitar', 'blot__revisao_recusar', 'blot__revisao', 'blot__opcoes_diff', 'blot__opcoes_comentario']);
    });

    it('a ementa comentada mostra o ícone por último ao ser alterada em revisão', async () => {
      const ementa = rootStore.getState().elementoReducer.articulacao!.projetoNorma!.ementa!;
      await comentar(ementa.uuid2!);
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      rootStore.dispatch(atualizarTextoElementoAction.execute({ ...createElemento(ementa), conteudo: { texto: 'Ementa alterada.' } }));
      await aguarda();

      const botoes = Array.from(linha(ementa.uuid2!).domNode.querySelectorAll('[class^="blot__"]')).map((b: any) => b.className.split(' ')[0]);
      expect(botoes.slice(-2)).to.deep.equal(['blot__opcoes_diff', 'blot__opcoes_comentario']);
    });

    it('a linha recriada ao transformar recebe o ícone pelo uuid2 atual', async () => {
      const par = dispositivo('art1_par1u');
      await comentar(par.uuid2);
      rootStore.dispatch(shiftTabAction(createElemento(par)));
      await aguarda();
      const artigo = rootStore.getState().elementoReducer.articulacao!.filhos[1];
      await comentar(artigo.uuid2);

      expect(linha(artigo.uuid2).tipo).to.equal('Artigo');
      expect(!!icone(artigo.uuid2)).to.equal(true);
    });

    it('o clique posiciona o cursor no dispositivo e emite a seleção com a aba', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      await comentar(uuid2);
      await selecionar('art1');
      const eventos = ouvir('comentario-dispositivo-selecionado');

      icone(uuid2)!.click();
      await aguarda();

      expect(editor.quill.linhaAtual.uuid2).to.equal(uuid2);
      expect(eventos.some(e => e.uuid2Dispositivo === uuid2 && e.abrirAbaComentarios)).to.equal(true);
    });

    it('volta na linha recriada ao desfazer a exclusão do dispositivo', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      await comentar(uuid2);
      rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo('art1_par1u')), undefined));
      await aguarda();
      expect(!!linha(uuid2)).to.equal(false);

      rootStore.dispatch(UndoAction());
      await waitUntil(() => !!linha(uuid2), 'a linha não voltou');
      await aguarda();

      expect(!!icone(uuid2)).to.equal(true);
    });
  });

  describe('Seleção pelo cursor', () => {
    it('selecionar um dispositivo emite o uuid2 dele', async () => {
      const eventos = ouvir('comentario-dispositivo-selecionado');
      await selecionar('art1_par1u');
      expect(eventos.slice(-1)[0]).to.deep.equal({ uuid2Dispositivo: dispositivo('art1_par1u').uuid2 });
    });

    it('posicionarCursorNoDispositivo leva o cursor ao dispositivo pelo uuid2', async () => {
      const uuid2 = dispositivo('art1_par1u').uuid2;
      expect(editor.posicionarCursorNoDispositivo(uuid2)).to.equal(true);
      expect(editor.quill.linhaAtual.uuid2).to.equal(uuid2);
      expect(editor.posicionarCursorNoDispositivo('nao-existe')).to.equal(false);
    });
  });

  describe('Telas pequenas', () => {
    it('o botão "Comentários" fica nos botões de telas pequenas e emite abrir-modal-lista-comentarios', () => {
      const eventos = ouvir('abrir-modal-lista-comentarios');
      const botaoLista = editor.querySelector('.mobile-buttons .btn-comentarios') as HTMLButtonElement;

      expect(botaoLista.textContent).to.include('Comentários');
      botaoLista.click();
      expect(eventos).to.have.length(1);
    });
  });
});
