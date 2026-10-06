import { expect } from '@open-wc/testing';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { adicionarTituloDispositivoAction, editarTituloDispositivoAction, removerTituloDispositivoAction } from '../../../../src/model/lexml/acao/atualizarTituloDispositivoAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../../src/model/lexml/util/mensagem';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';
import { MPV_885_2019 } from '../../../doc/mpv_885_2019';

let state: State;

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const executa = (acao: any, id: string, titulo?: string): void => {
  state = elementoReducer(state, acao.execute(createElemento(dispositivo(id)), titulo));
};
const eventosDoTipo = (tipo: StateType): any[] => state.ui!.events.filter(e => e.stateType === tipo);

describe('atualizaTituloDispositivo', () => {
  beforeEach(() => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = { events: [] } as any;
  });

  describe('Adicionar, alterar e remover', () => {
    it('adiciona título a dispositivo sem título', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Objeto da medida');

      expect(dispositivo('art1').tituloDispositivo).to.equal('Objeto da medida');
      expect(state.past).to.have.length(1);
      expect(state.future).to.be.empty;
    });

    it('altera o título existente', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Primeiro');
      executa(editarTituloDispositivoAction, 'art1', 'Segundo');

      expect(dispositivo('art1').tituloDispositivo).to.equal('Segundo');
      expect(state.past).to.have.length(2);
    });

    it('remove o título', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Primeiro');
      executa(removerTituloDispositivoAction, 'art1');

      expect(dispositivo('art1').tituloDispositivo).to.be.undefined;
      expect(state.past).to.have.length(2);
    });

    it('emite ElementoModificado e ElementoSelecionado com o novo título', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Objeto');

      const modificado = eventosDoTipo(StateType.ElementoModificado);
      expect(modificado).to.have.length(1);
      expect(modificado[0].elementos[0].tituloDispositivo).to.equal('Objeto');
      const selecionado = eventosDoTipo(StateType.ElementoSelecionado);
      expect(selecionado).to.have.length(1);
      expect(selecionado[0].elementos[0].tituloDispositivo).to.equal('Objeto');
    });

    it('guarda no histórico o elemento antes e depois', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Primeiro');
      executa(editarTituloDispositivoAction, 'art1', 'Segundo');

      const passo = (state.past![1] as unknown as any[]).find(e => e.stateType === StateType.ElementoModificado);
      expect(passo.elementos[0].tituloDispositivo).to.equal('Primeiro');
      expect(passo.elementos[1].tituloDispositivo).to.equal('Segundo');
    });
  });

  describe('Sanitização', () => {
    it('mantém só i, u, sub e sup e converte em para i', () => {
      executa(adicionarTituloDispositivoAction, 'art1', '<strong>Plano</strong> <em>de</em> <u>Carreira</u> <a href="#">m</a><sup>2</sup>');

      expect(dispositivo('art1').tituloDispositivo).to.equal('Plano <i>de</i> <u>Carreira</u> m<sup>2</sup>');
    });
  });

  describe('Sem alteração', () => {
    it('ignora quando o título não muda', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Mesmo');
      const passos = state.past!.length;
      executa(editarTituloDispositivoAction, 'art1', 'Mesmo');

      expect(state.past).to.have.length(passos);
      expect(state.ui!.events).to.be.empty;
    });

    it('ignora quando o texto só difere por formatação não permitida', () => {
      executa(adicionarTituloDispositivoAction, 'art1', 'Plano');
      executa(editarTituloDispositivoAction, 'art1', '<b>Plano</b>');

      expect(state.past).to.have.length(1);
    });

    it('ignora remover quando não há título', () => {
      executa(removerTituloDispositivoAction, 'art1');

      expect(state.past ?? []).to.be.empty;
      expect(state.ui!.events).to.be.empty;
    });

    it('ignora adicionar/editar sem valor informado', () => {
      executa(adicionarTituloDispositivoAction, 'art1');

      expect(dispositivo('art1').tituloDispositivo).to.be.undefined;
      expect(state.past ?? []).to.be.empty;
    });
  });

  describe('Título vazio', () => {
    it('aceita título vazio e anexa o aviso ao elemento', () => {
      executa(adicionarTituloDispositivoAction, 'art1', '');

      expect(dispositivo('art1').tituloDispositivo).to.equal('');
      const elemento = eventosDoTipo(StateType.ElementoModificado)[0].elementos[0];
      const aviso = elemento.mensagens.find((m: any) => m.descricao === 'Não foi informado um texto para o título do artigo.');
      expect(aviso?.tipo).to.equal(TipoMensagem.WARNING);
    });

    it('remover leva de título vazio a sem título', () => {
      executa(adicionarTituloDispositivoAction, 'art1', '');
      executa(removerTituloDispositivoAction, 'art1');

      expect(dispositivo('art1').tituloDispositivo).to.be.undefined;
    });
  });

  describe('Dispositivo bloqueado', () => {
    it('não altera o título e informa o motivo', () => {
      dispositivo('art1').bloqueado = true;
      executa(adicionarTituloDispositivoAction, 'art1', 'Novo');

      expect(dispositivo('art1').tituloDispositivo).to.be.undefined;
      expect(state.ui!.message?.tipo).to.equal(TipoMensagem.INFO);
    });
  });

  describe('Dispositivo dentro de bloco de alteração', () => {
    it('adiciona, altera e remove o título', () => {
      const id = 'art1_cpt_alt1_art1';
      expect(dispositivo(id), 'dispositivo da fixture').to.not.be.undefined;

      executa(adicionarTituloDispositivoAction, id, 'Título na alteração');
      expect(dispositivo(id).tituloDispositivo).to.equal('Título na alteração');

      executa(editarTituloDispositivoAction, id, 'Outro');
      expect(dispositivo(id).tituloDispositivo).to.equal('Outro');

      executa(removerTituloDispositivoAction, id);
      expect(dispositivo(id).tituloDispositivo).to.be.undefined;
    });
  });
});
