import { expect } from '@open-wc/testing';
import { ativarDesativarRevisaoAction } from '../../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { atualizarUsuarioAction } from '../../../../src/model/lexml/acao/atualizarUsuarioAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { resetarDocumentoAction } from '../../../../src/model/lexml/acao/resetarDocumentoAction';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { lerDocumentoArticulado } from '../../../../src/model/lexml/documento/documentoArticulado';
import { Usuario } from '../../../../src/model/revisao/usuario';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { StateType } from '../../../../src/redux/state';
import { novoDocumentoArticulado } from '../../../doc/documentoArticulado';

const articulacao = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true).articulacao;

describe('Reset do documento (RESETAR_DOCUMENTO)', () => {
  const usuario = Object.assign(new Usuario(), { nome: 'Fulano' });

  // Estado de um documento "sujo": modo de revisão, remissões, histórico e alerta.
  const estadoSujo = (): any => {
    let state: any = elementoReducer(undefined, openArticulacaoAction(articulacao(), 'edicao', { maxItensPorPagina: 2 }));
    state = elementoReducer(state, atualizarUsuarioAction.execute(usuario));
    state = elementoReducer(state, ativarDesativarRevisaoAction.execute(0));
    state.past = [{ stateType: StateType.ElementoModificado }];
    state.future = [{ stateType: StateType.ElementoModificado }];
    state.remissoes = { 1: [{ refId: 'x' }] };
    state.remissoesExternas = { y: {} };
    state.ui.alertas = [{ id: 'a', tipo: 'critical', mensagem: 'm' }];
    return state;
  };

  it('devolve o estado ao inicial, preservando o usuário', () => {
    const state: any = elementoReducer(estadoSujo(), resetarDocumentoAction.execute());

    expect(state.articulacao).to.be.undefined;
    expect(state.past).to.deep.equal([]);
    expect(state.future).to.deep.equal([]);
    expect(state.revisoes).to.deep.equal([]);
    expect(state.emRevisao).to.be.false;
    expect(state.remissoes).to.deep.equal({});
    expect(state.remissoesExternas).to.deep.equal({});
    expect(state.ui.alertas).to.deep.equal([]);
    expect(state.ui.paginacao).to.be.undefined;
    expect(state.usuario?.nome).to.equal('Fulano');
  });

  it('avisa a tela quando o modo de revisão estava ligado', () => {
    const state: any = elementoReducer(estadoSujo(), resetarDocumentoAction.execute());

    expect(state.ui.events.map((e: any) => e.stateType)).to.deep.equal([StateType.RevisaoDesativada]);
  });

  it('não emite evento de revisão quando o modo estava desligado', () => {
    const state: any = elementoReducer(elementoReducer(undefined, openArticulacaoAction(articulacao())), resetarDocumentoAction.execute());

    expect(state.ui.events).to.deep.equal([]);
  });

  it('o documento seguinte não herda nada do anterior', () => {
    let state: any = elementoReducer(estadoSujo(), resetarDocumentoAction.execute());
    state = elementoReducer(state, openArticulacaoAction(articulacao(), 'edicao'));

    expect(state.past).to.deep.equal([]);
    expect(state.future).to.deep.equal([]);
    expect(state.revisoes).to.deep.equal([]);
    expect(state.emRevisao).to.be.false;
    expect(Object.keys(state.remissoesExternas)).to.deep.equal([]);
    expect(state.ui.alertas).to.deep.equal([]);
    expect(state.ui.paginacao.paginasArticulacao?.length).to.be.greaterThan(0);
    expect(state.usuario?.nome).to.equal('Fulano');
  });
});
