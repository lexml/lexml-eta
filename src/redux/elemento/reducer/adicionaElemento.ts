import { isOmissis } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElementos, getDispositivoFromElemento } from '../../../model/elemento/elemento-util';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivo-lexml-factory';
import { hasFilhos, isArtigoUnico, isParagrafoUnico } from '../../../model/lexml/hierarquia/hierarquia-util';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { normalizaSeForOmissis } from '../util/conteudoReducerUtil';
import { buildEventoAdicionarElemento } from '../util/eventosReducerUtil';
import { createElementoValidado, isDispositivoAlteracao, isNovoDispositivoDesmembrandoAtual, isOrWasUnico, naoPodeCriarFilho, textoFoiModificado } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const adicionaElemento = (state: any, action: any): State => {
  let textoModificado = false;

  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const originalmenteUnico = isArtigoUnico(atual) || isParagrafoUnico(atual);

  const elementoAtualOriginal = createElementoValidado(atual);

  const elementosRemovidos: Elemento[] = [];

  createElementos(elementosRemovidos, atual);

  if (textoFoiModificado(atual, action, state)) {
    atual.texto = !isDispositivoAlteracao(atual) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');
    textoModificado = true;
  }

  if (naoPodeCriarFilho(atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível criar dispositivos nessa situação' });
  }

  const novo = DispositivoLexmlFactory.createByInferencia(atual, action);

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && hasFilhos(atual)) {
    DispositivoLexmlFactory.copiaFilhos(atual, novo);
  }

  if (isDispositivoAlteracao(novo)) {
    novo.mensagens?.push({ tipo: TipoMensagem.WARNING, descricao: `É necessário informar o rótulo do dispositivo` });
  }

  novo.pai!.renumeraFilhos();

  const eventos = buildEventoAdicionarElemento(atual, novo);

  const elementoAtualAtualizado = createElementoValidado(atual);

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && elementosRemovidos && elementosRemovidos.length > 0) {
    eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto)) {
    eventos.add(StateType.ElementoModificado, [elementoAtualOriginal, elementoAtualAtualizado]);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) || isOmissis(atual)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
  }

  if (isOrWasUnico(atual, originalmenteUnico)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
    eventos.add(StateType.ElementoRenumerado, [elementoAtualAtualizado]);
  }

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,

    ui: {
      events: eventos.build(),
    },
  };
};
