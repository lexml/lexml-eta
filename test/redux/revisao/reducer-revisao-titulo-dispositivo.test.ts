import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import {
  ATUALIZAR_TITULO_DISPOSITIVO,
  adicionarTituloDispositivoAction,
  editarTituloDispositivoAction,
  removerTituloDispositivoAction,
} from '../../../src/model/lexml/acao/atualizarTituloDispositivoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';

const ID = 'art1_par1u_inc1';

let state: State;

const dispositivo = (): any => buscaDispositivoById(state.articulacao!, ID)!;
const titulo = (): string | undefined => dispositivo().tituloDispositivo;
const revisao = (): RevisaoElemento => state.revisoes![0] as RevisaoElemento;
const executa = (acao: any, valor?: string): void => {
  state = elementoReducer(state, acao.execute(createElemento(dispositivo()), valor));
};
const alteraTexto = (texto: string): void => {
  const e = createElemento(dispositivo());
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};
const rejeita = (): void => {
  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: revisao() });
};
const aceita = (): void => {
  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: revisao() });
};
const ativaRevisao = (): void => {
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
};
const ultimoElementoModificado = (): any =>
  state
    .ui!.events.filter(e => e.stateType === StateType.ElementoModificado)
    .flatMap(e => e.elementos ?? [])
    .filter((e: any) => e.lexmlId === ID)
    .pop();

describe('Revisão da alteração de título de dispositivo', () => {
  beforeEach(() => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
    state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Anônimo' } });
  });

  describe('Gerar revisão', () => {
    beforeEach(() => {
      ativaRevisao();
      executa(adicionarTituloDispositivoAction, 'Título novo');
    });

    it('cria uma revisão de modificação com descrição própria', () => {
      expect(state.revisoes).to.have.length(1);
      expect(revisao().stateType).to.equal(StateType.ElementoModificado);
      expect(revisao().actionType).to.equal(ATUALIZAR_TITULO_DISPOSITIVO);
      expect(revisao().descricao).to.equal('Título do dispositivo foi alterado');
    });

    it('guarda o título antes e depois', () => {
      expect(revisao().elementoAntesRevisao?.tituloDispositivo).to.be.undefined;
      expect(revisao().elementoAposRevisao.tituloDispositivo).to.equal('Título novo');
    });

    it('associa a revisão ao elemento do evento', () => {
      expect((ultimoElementoModificado().revisao as RevisaoElemento).id).to.equal(revisao().id);
    });

    it('mantém uma única revisão a cada nova alteração do título', () => {
      executa(editarTituloDispositivoAction, 'Outro título');
      executa(removerTituloDispositivoAction);
      executa(adicionarTituloDispositivoAction, 'Terceiro');

      expect(state.revisoes).to.have.length(1);
      expect(revisao().elementoAntesRevisao?.tituloDispositivo).to.be.undefined;
      expect(revisao().elementoAposRevisao.tituloDispositivo).to.equal('Terceiro');
    });

    it('descarta a revisão quando o título volta ao valor original', () => {
      executa(removerTituloDispositivoAction);

      expect(state.revisoes ?? []).to.be.empty;
    });

    it('descarta a revisão quando o título original é restaurado após uma alteração', () => {
      executa(editarTituloDispositivoAction, 'Outro');
      executa(removerTituloDispositivoAction);

      expect(state.revisoes ?? []).to.be.empty;
    });
  });

  describe('Título e texto na mesma revisão', () => {
    it('descreve que texto e título foram alterados', () => {
      ativaRevisao();
      alteraTexto('texto modificado;');
      expect(revisao().descricao).to.equal('Texto do dispositivo foi alterado');

      executa(adicionarTituloDispositivoAction, 'Título novo');

      expect(state.revisoes).to.have.length(1);
      expect(revisao().descricao).to.equal('Texto e título do dispositivo foram alterados');
    });

    it('volta à descrição de texto ao restaurar só o título', () => {
      ativaRevisao();
      alteraTexto('texto modificado;');
      executa(adicionarTituloDispositivoAction, 'Título novo');
      executa(removerTituloDispositivoAction);

      expect(state.revisoes).to.have.length(1);
      expect(revisao().descricao).to.equal('Texto do dispositivo foi alterado');
    });

    it('não descarta a revisão ao restaurar o texto se o título continua alterado', () => {
      ativaRevisao();
      const textoOriginal = dispositivo().texto;
      alteraTexto('texto modificado;');
      executa(adicionarTituloDispositivoAction, 'Título novo');
      alteraTexto(textoOriginal);

      expect(state.revisoes).to.have.length(1);
      expect(revisao().descricao).to.equal('Título do dispositivo foi alterado');
    });
  });

  describe('Rejeitar revisão', () => {
    it('restaura a ausência de título quando ele havia sido adicionado', () => {
      ativaRevisao();
      executa(adicionarTituloDispositivoAction, 'Título novo');

      rejeita();

      expect(titulo()).to.be.undefined;
      expect(state.revisoes ?? []).to.be.empty;
    });

    it('restaura o título anterior quando ele havia sido alterado', () => {
      executa(adicionarTituloDispositivoAction, 'Original');
      ativaRevisao();
      executa(editarTituloDispositivoAction, 'Alterado');

      rejeita();

      expect(titulo()).to.equal('Original');
      expect(state.revisoes ?? []).to.be.empty;
    });

    it('restaura o título removido', () => {
      executa(adicionarTituloDispositivoAction, 'Original');
      ativaRevisao();
      executa(removerTituloDispositivoAction);

      rejeita();

      expect(titulo()).to.equal('Original');
    });

    it('restaura texto e título juntos', () => {
      const textoOriginal = dispositivo().texto;
      ativaRevisao();
      alteraTexto('texto modificado;');
      executa(adicionarTituloDispositivoAction, 'Título novo');

      rejeita();

      expect(dispositivo().texto).to.equal(textoOriginal);
      expect(titulo()).to.be.undefined;
    });

    it('informa o título restaurado no evento para a linha ser atualizada', () => {
      executa(adicionarTituloDispositivoAction, 'Original');
      ativaRevisao();
      executa(editarTituloDispositivoAction, 'Alterado');

      rejeita();

      expect(ultimoElementoModificado()?.tituloDispositivo).to.equal('Original');
    });

    it('desfaz e refaz a rejeição', () => {
      ativaRevisao();
      executa(adicionarTituloDispositivoAction, 'Título novo');
      rejeita();
      expect(titulo()).to.be.undefined;

      state = elementoReducer(state, { type: UNDO });
      expect(titulo()).to.equal('Título novo');
      expect(state.revisoes).to.have.length(1);

      state = elementoReducer(state, { type: REDO });
      expect(titulo()).to.be.undefined;
      expect(state.revisoes ?? []).to.be.empty;
    });
  });

  describe('Aceitar revisão', () => {
    it('mantém o novo título e remove a revisão', () => {
      ativaRevisao();
      executa(adicionarTituloDispositivoAction, 'Título novo');

      aceita();

      expect(titulo()).to.equal('Título novo');
      expect(state.revisoes ?? []).to.be.empty;
    });
  });

  describe('Desfazer e refazer com revisão ativa', () => {
    it('desfazer a alteração remove a revisão e refazer a recria', () => {
      ativaRevisao();
      executa(adicionarTituloDispositivoAction, 'Título novo');

      state = elementoReducer(state, { type: UNDO });
      expect(titulo()).to.be.undefined;
      expect(state.revisoes ?? []).to.be.empty;

      state = elementoReducer(state, { type: REDO });
      expect(titulo()).to.equal('Título novo');
      expect(state.revisoes).to.have.length(1);
      expect(revisao().descricao).to.equal('Título do dispositivo foi alterado');
    });
  });
});
