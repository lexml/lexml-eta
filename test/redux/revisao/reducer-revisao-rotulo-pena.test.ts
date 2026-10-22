import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { adicionarPenaAction, alterarRotuloPenaAction } from '../../../src/model/lexml/acao/penaAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';

const ID_PENA = 'art1_cpt_pena';

let state: State;

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (isPena(d)) d.rotulo = 'Pena –';
  return d;
};

const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  novo(art1, TipoDispositivo.pena.tipo, 'reclusão, de seis a vinte anos.');
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const pena = (): any => buscaDispositivoById(state.articulacao!, ID_PENA);
const revisoes = (): RevisaoElemento[] => (state.revisoes ?? []) as RevisaoElemento[];
const revisao = (): RevisaoElemento => revisoes()[0];
const executa = (acao: any, valor?: string): void => {
  state = elementoReducer(state, acao.execute(createElemento(pena()), valor));
};
const alteraRotulo = (rotulo: string): void => executa(alterarRotuloPenaAction, rotulo);
const alteraTexto = (texto: string): void => {
  const e = createElemento(pena());
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};
const ativaRevisao = (): void => {
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
};
const rejeita = (r: RevisaoElemento = revisao()): void => {
  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: r });
};
const aceita = (): void => {
  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: revisao() });
};
const ultimoElementoDaPena = (): any =>
  state
    .ui!.events.filter(e => e.stateType === StateType.ElementoModificado)
    .flatMap(e => e.elementos ?? [])
    .filter((e: any) => e.lexmlId === ID_PENA)
    .pop();

describe('Revisão da alteração do rótulo da pena', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Anônimo' } });
  });

  describe('Gerar revisão', () => {
    beforeEach(() => {
      ativaRevisao();
      alteraRotulo('Infração –');
    });

    it('cria uma revisão de modificação com a descrição do rótulo', () => {
      expect(revisoes()).to.have.length(1);
      expect(revisao().stateType).to.equal(StateType.ElementoModificado);
      expect(revisao().descricao).to.equal('Rótulo do dispositivo foi alterado');
    });

    it('guarda o rótulo antes e depois', () => {
      expect(revisao().elementoAntesRevisao?.rotulo).to.equal('Pena –');
      expect(revisao().elementoAposRevisao.rotulo).to.equal('Infração –');
    });

    it('associa a revisão ao elemento do evento', () => {
      expect((ultimoElementoDaPena().revisao as RevisaoElemento)?.id).to.equal(revisao().id);
    });

    it('mantém uma única revisão a cada nova troca, com o rótulo original no antes', () => {
      alteraRotulo('Medida administrativa –');
      alteraRotulo('Penalidade –');
      expect(revisoes()).to.have.length(1);
      expect(revisao().elementoAntesRevisao?.rotulo).to.equal('Pena –');
      expect(revisao().elementoAposRevisao.rotulo).to.equal('Penalidade –');
    });

    it('descarta a revisão quando o rótulo volta ao original', () => {
      alteraRotulo('Pena –');
      expect(revisoes()).to.be.empty;
    });

    it('descarta a revisão quando o rótulo original é restaurado depois de outras trocas', () => {
      alteraRotulo('Penalidade –');
      alteraRotulo('Pena –');
      expect(revisoes()).to.be.empty;
    });

    it('descreve texto e rótulo juntos e volta à descrição do texto ao restaurar o rótulo', () => {
      alteraTexto('reclusão, de dois a quatro anos.');
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Texto e rótulo do dispositivo foram alterados');
      alteraRotulo('Pena –');
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Texto do dispositivo foi alterado');
    });

    it('descarta a revisão só quando texto e rótulo voltam ao original', () => {
      const textoOriginal = pena().texto;
      alteraTexto('reclusão, de dois a quatro anos.');
      alteraTexto(textoOriginal);
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Rótulo do dispositivo foi alterado');
      alteraRotulo('Pena –');
      expect(revisoes()).to.be.empty;
    });

    it('desfazer remove a revisão e refazer a recria', () => {
      state = elementoReducer(state, { type: UNDO });
      expect(pena().rotulo).to.equal('Pena –');
      expect(revisoes()).to.be.empty;
      state = elementoReducer(state, { type: REDO });
      expect(pena().rotulo).to.equal('Infração –');
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Rótulo do dispositivo foi alterado');
    });
  });

  describe('Rejeitar e aceitar', () => {
    it('rejeitar restaura o rótulo e remove a revisão', () => {
      ativaRevisao();
      alteraRotulo('Infração –');
      rejeita();
      expect(pena().rotulo).to.equal('Pena –');
      expect(revisoes()).to.be.empty;
    });

    it('rejeitar informa o rótulo restaurado no evento para a linha ser atualizada', () => {
      ativaRevisao();
      alteraRotulo('Infração –');
      rejeita();
      expect(ultimoElementoDaPena()?.rotulo).to.equal('Pena –');
    });

    it('rejeitar restaura texto e rótulo juntos', () => {
      const textoOriginal = pena().texto;
      ativaRevisao();
      alteraTexto('reclusão, de dois a quatro anos.');
      alteraRotulo('Infração –');
      rejeita();
      expect(pena().texto).to.equal(textoOriginal);
      expect(pena().rotulo).to.equal('Pena –');
    });

    it('rejeitar restaura o rótulo anterior quando ele já havia sido alterado fora da revisão', () => {
      alteraRotulo('Penalidade –');
      ativaRevisao();
      alteraRotulo('Infração –');
      rejeita();
      expect(pena().rotulo).to.equal('Penalidade –');
    });

    it('desfazer e refazer a rejeição', () => {
      ativaRevisao();
      alteraRotulo('Infração –');
      rejeita();
      state = elementoReducer(state, { type: UNDO });
      expect(pena().rotulo).to.equal('Infração –');
      expect(revisoes()).to.have.length(1);
      state = elementoReducer(state, { type: REDO });
      expect(pena().rotulo).to.equal('Pena –');
      expect(revisoes()).to.be.empty;
    });

    it('aceitar mantém o novo rótulo e remove a revisão', () => {
      ativaRevisao();
      alteraRotulo('Infração –');
      aceita();
      expect(pena().rotulo).to.equal('Infração –');
      expect(revisoes()).to.be.empty;
    });
  });

  describe('Pena adicionada e removida em revisão', () => {
    it('pena adicionada em revisão: trocar o rótulo não cria nova revisão e rejeitar remove a pena', () => {
      state = elementoReducer(state, removerElementoAction.execute(createElemento(pena()), undefined));
      ativaRevisao();
      state = elementoReducer(state, adicionarPenaAction.execute(createElemento(buscaDispositivoById(state.articulacao!, 'art1_cpt')!), 'Pena'));
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Dispositivo adicionado');
      alteraRotulo('Infração –');
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Dispositivo adicionado');
      rejeita();
      expect(pena()).to.equal(undefined);
    });

    it('pena removida em revisão: rejeitar a exclusão devolve a pena com o rótulo que tinha', () => {
      alteraRotulo('Infração –');
      ativaRevisao();
      state = elementoReducer(state, removerElementoAction.execute(createElemento(pena()), undefined));
      expect(revisoes()).to.have.length(1);
      expect(revisao().descricao).to.equal('Dispositivo removido');
      rejeita();
      expect(pena()?.rotulo).to.equal('Infração –');
    });
  });
});
