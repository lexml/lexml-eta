import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { getPaiQuePodeReceberFilhoDoTipo } from './../evento/eventosUtil';
import { isAgrupador, isArtigo } from './../../../model/dispositivo/tipo';
import { Alteracoes } from '../../../model/dispositivo/blocoAlteracao';
import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArticulacao } from '../../../model/dispositivo/tipo';
import { buildListaElementosRenumerados, createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipo,
  irmaosMesmoTipo,
  isArticulacaoAlteracao,
  isDispositivoCabecaAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, copiaDispositivosParaOutroPai, isDesdobramentoAgrupadorAtual } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const agrupaElemento = (state: any, action: any): State => {
  let atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  if (isDispositivoCabecaAlteracao(atual)) {
    const pos = atual.pai!.indexOf(atual);
    const novo = criaDispositivoCabecaAlteracao(action.novo.tipo, atual.pai! as Alteracoes, undefined, pos);
    novo.addFilho(atual);
    atual.pai = novo;
    const eventos = new Eventos();
    eventos.setReferencia(createElemento(pos === 0 ? novo.pai!.pai! : novo.pai!.filhos[pos - 1]));
    eventos.add(StateType.ElementoIncluido, [createElemento(novo)]);
    eventos.add(StateType.ElementoRenumerado, [createElemento(atual)]);
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
  }

  // Novo agrupador, por default, é inserido acima do elemento selecionado
  // Porém, se o dispositivo atualmente selecionado for um agrupador e o novo agrupador a ser criado for de tipo que seja filho do atual,
  // então deve ser criado abaixo do dispositivo selecionado.
  // Para criar o novo agrupador abaixo do dispositivo selecionado a "referência atual" é alterada.
  if (isAgrupador(atual) && (atual.tipo === action.novo.tipo || atual.tiposPermitidosFilhos?.includes(action.novo.tipo))) {
    atual = atual.filhos[0]!;
  }

  const dispositivoAnterior = getDispositivoAnterior(atual);
  const pos = atual.pai!.indexOf(atual);

  let novo: Dispositivo;
  let ref: any = undefined;

  if (isDesdobramentoAgrupadorAtual(atual, action.novo.tipo)) {
    novo = criaDispositivo(atual.pai!.pai!, action.novo.tipo, undefined, atual.pai!.pai!.indexOf(atual.pai!) + 1);
    ref = getDispositivoAnteriorMesmoTipo(novo);
    // } else if ((!isDispositivoAlteracao(atual) && hasAgrupadoresAcimaByTipo(atual, action.novo.tipo)) || hasAgrupadoresAnterioresByTipo(atual, action.novo.tipo)) {
    //   ref = getAgrupadoresAcimaByTipo(atual, action.novo.tipo) ?? getAgrupadorAcimaByTipo(atual, action.novo.tipo);
    //   novo = criaDispositivo(ref!.pai!, action.novo.tipo, ref);
  } else {
    novo = criaDispositivo(getPaiQuePodeReceberFilhoDoTipo(atual.pai!, action.novo.tipo), action.novo.tipo, undefined, atual.pai!.indexOf(atual));
    ref = dispositivoAnterior ?? atual.pai!;
  }

  // Para quando o agrupador é criado por ação de undo ou redo
  if (action.novo.uuid) {
    novo.uuid = action.novo.uuid;
  }

  novo.situacao = new DispositivoAdicionado();
  (novo.situacao as DispositivoAdicionado).tipoEmenda = state.modo;

  novo.texto = action.novo.conteudo?.texto;
  const dispositivos = atual.pai!.filhos.filter((f: Dispositivo, index: number) => index >= pos && f.tiposPermitidosPai?.includes(action.novo.tipo));

  if (atual.pai!.tiposPermitidosPai?.includes(novo.tipo)) {
    const pos2 = atual.pai?.pai?.indexOf(atual.pai!);
    if (!isNaN(Number(pos2))) {
      dispositivos.push(...atual.pai!.pai!.filhos.filter((f: Dispositivo, index: number) => index > pos2! && f.tiposPermitidosPai?.includes(action.novo.tipo)));
    }
  }

  copiaDispositivosParaOutroPai(novo, dispositivos);
  novo.pai!.renumeraFilhos();
  novo.renumeraFilhos();

  // const renumerados = buildListaElementosRenumerados(novo);
  const renumerados = [...buildListaElementosRenumerados(novo)].concat(
    novo.filhos
      .filter((f: Dispositivo) => !isArtigo(f) && f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO)
      .map((d: Dispositivo) => createElemento(d))
      .flat()
  );

  const irmaoAnterior = getDispositivoAnteriorMesmoTipo(novo);

  if (irmaoAnterior && irmaosMesmoTipo(novo).length === 2) {
    renumerados.unshift(createElemento(irmaoAnterior));
  }

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(ref!.pai && isArticulacao(ref!) && isArticulacaoAlteracao(ref as Articulacao) ? ref!.pai : ref!, novo)));

  const transferidosParaOutroPai = novo.filhos.map((d: Dispositivo) => createElemento(d));
  eventos.add(StateType.ElementoIncluido, [createElemento(novo)]);
  eventos.add(StateType.SituacaoElementoModificada, [action.atual, ...transferidosParaOutroPai]);
  eventos.add(StateType.ElementoRenumerado, renumerados);
  eventos.add(StateType.ElementoMarcado, [createElemento(novo)]);
  eventos.add(StateType.ElementoReferenciado, [action.atual]);

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
