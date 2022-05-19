import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador, isIncisoCaput, isOmissis } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, createElementos, getDispositivoFromElemento, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { normalizaSeForOmissis } from '../../../model/lexml/conteudo/conteudoUtil';
import { createByInferencia, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { copiaFilhos } from '../../../model/lexml/dispositivo/dispositivoLexmlUtil';
import { hasFilhos, irmaosMesmoTipo, isArtigoUnico, isDispositivoAlteracao, isParagrafoUnico } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { buildEventoAdicionarElemento } from '../evento/eventosUtil';
import { createElementoValidado, isNovoDispositivoDesmembrandoAtual, naoPodeCriarFilho, textoFoiModificado } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { isArticulacaoAlteracao } from './../../../model/lexml/hierarquia/hierarquiaUtil';

const calculaPosicao = (atual: Dispositivo, posicao: string): number | undefined => {
  const posicaoAtual = atual.pai!.indexOf(atual);
  if (posicao === 'antes') {
    return posicaoAtual;
  }
  return posicaoAtual === atual.pai!.filhos.length - 1 ? undefined : posicaoAtual + 1;
};

export const adicionaElemento = (state: any, action: any): State => {
  let textoModificado = false;

  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined || atual.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
    return state;
  }

  const ref = atual.pai!.indexOf(atual) === 0 ? (isIncisoCaput(atual!) ? atual.pai!.pai! : atual.pai) : atual.pai!.filhos[atual.pai!.indexOf(atual) - 1];

  if (atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto)) {
    action.atual.conteudo.texto = atual.texto;
    action.novo.conteudo.texto = undefined;
  }

  const originalmenteUnico = isArtigoUnico(atual) || isParagrafoUnico(atual);

  const elementoAtualOriginal = createElementoValidado(atual);

  const elementosRemovidos: Elemento[] = [];

  createElementos(elementosRemovidos, atual);

  if (textoFoiModificado(atual, action, state)) {
    atual.texto = !isDispositivoAlteracao(atual) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');
    textoModificado = true;
  }

  if (naoPodeCriarFilho(atual, action)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível criar dispositivos nessa situação' });
  }

  const novo = action.posicao ? criaDispositivo(atual.pai!, atual.tipo, undefined, calculaPosicao(atual, action.posicao)) : createByInferencia(atual, action);

  if (
    atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL ||
    atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO ||
    atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO ||
    atual.situacao instanceof DispositivoAdicionado
  ) {
    novo.situacao = new DispositivoAdicionado();
    (novo.situacao as DispositivoAdicionado).tipoEmenda = state.modo;
    const pai = novo.pai!;
    if (isArticulacaoAlteracao(pai) && pai.filhos.length === 1) {
      pai.situacao = new DispositivoAdicionado();
    }
  }

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && hasFilhos(atual)) {
    copiaFilhos(atual, novo);
  }

  if (isDispositivoAlteracao(novo)) {
    novo.mensagens?.push({ tipo: TipoMensagem.WARNING, descricao: `É necessário informar o rótulo do dispositivo` });
  }

  novo.pai!.renumeraFilhos();

  const eventos = action.posicao && action.posicao === 'antes' ? buildEventoAdicionarElemento(ref!, novo) : buildEventoAdicionarElemento(atual, novo);

  const elementoAtualAtualizado = createElementoValidado(atual);

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && elementosRemovidos && elementosRemovidos.length > 0) {
    eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  }

  if (isAgrupador(novo) && irmaosMesmoTipo(novo).length === 2) {
    const irmao = irmaosMesmoTipo(novo).filter(a => a !== novo);
    eventos.add(StateType.ElementoModificado, [createElemento(irmao[0]!)]);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto)) {
    eventos.add(StateType.ElementoModificado, [elementoAtualOriginal, elementoAtualAtualizado]);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) || isOmissis(atual)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
  }

  if (isArtigoUnico(atual) || originalmenteUnico) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
    eventos.add(StateType.ElementoRenumerado, [elementoAtualAtualizado]);
  }

  if (action.posicao && action.posicao === 'antes') {
    eventos.add(
      StateType.ElementoRenumerado,
      listaDispositivosRenumerados(novo).map(d => createElemento(d))
    );
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: [],

    ui: {
      events: eventos.build(),
    },
  };
};
