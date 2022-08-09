import { isDispositivoAlteracao, getDispositivoCabecaAlteracao, getUltimoFilho, isDispositivoNovoNaNormaAlterada } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isCaput } from '../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoTransformacaoPermitida, normalizaNomeAcaoTransformacao } from '../../../model/lexml/acao/acaoUtil';
import { converteDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior, isParagrafoUnico } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';
import { buildEventoTransformacaooElemento } from '../evento/eventosUtil';
import { getElementosDoDispositivo } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';

export const transformaTipoElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);
  const cabecaAlteracao = atual && isDispositivoAlteracao(atual) && getDispositivoCabecaAlteracao(atual);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoTransformacaoPermitida(atual, action)) {
    return state;
  }

  const dispositivoAnteriorAtual = getDispositivoAnterior(atual);

  if (dispositivoAnteriorAtual && isDispositivoNovoNaNormaAlterada(dispositivoAnteriorAtual) && !isDispositivoNovoNaNormaAlterada(atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Dispositivo existente não pode ser transformado em filho de dispositivo novo' });
  }

  const ultimoFilhoDispositivoAnteriorAtual = cabecaAlteracao && dispositivoAnteriorAtual && getUltimoFilho(dispositivoAnteriorAtual);

  action.subType = normalizaNomeAcaoTransformacao(atual, action.subType);

  const removidos = [...getElementos(atual)];

  const atualRenumerados = listaDispositivosRenumerados(atual);

  const novo = converteDispositivo(atual, action);

  const novoRenumerados = listaDispositivosRenumerados(novo);

  const renumerados = novoRenumerados.concat(atualRenumerados);

  const validados = getElementosDoDispositivo(novo, true);

  const paiNovo = isCaput(novo.pai!) ? novo.pai!.pai! : novo.pai!;

  if (dispositivoAnteriorAtual && isParagrafoUnico(dispositivoAnteriorAtual)) {
    dispositivoAnteriorAtual.pai!.renumeraFilhos();
    renumerados.unshift(dispositivoAnteriorAtual);
  }

  const dispositivoAnterior = getDispositivoAnterior(novo);

  if (dispositivoAnterior) {
    const mensagens = validaDispositivo(dispositivoAnterior);
    if (dispositivoAnterior.mensagens !== mensagens) {
      validados.unshift(createElemento(dispositivoAnterior));
    }
  }

  const parent = validados.filter(v => v.uuid === paiNovo.uuid).length > 0 ? atual.pai : paiNovo;

  parent!.mensagens = validaDispositivo(parent!);

  validados.unshift(createElemento(parent!));

  const referencia = dispositivoAnterior ?? novo.pai!;
  const eventos = buildEventoTransformacaooElemento(
    isCaput(referencia) ? referencia.pai! : referencia,
    novo,
    removidos,
    renumerados.map(d => {
      d.mensagens = validaDispositivo(d);
      const el = createElemento(d);
      return el;
    }),
    validados
  );

  if (novo.tipo === 'Artigo' && cabecaAlteracao) {
    eventos.add(StateType.SituacaoElementoModificada, [createElemento(getUltimoFilho(cabecaAlteracao))]);
  } else if (novo.tipo === 'Paragrafo' && ultimoFilhoDispositivoAnteriorAtual) {
    eventos.add(StateType.SituacaoElementoModificada, [createElemento(ultimoFilhoDispositivoAnteriorAtual)]);
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: [],
    ui: {
      events: eventos.build(),
      alertas: state.ui?.alertas,
    },
  };
};
