import { retornaEstadoAtualComMensagem } from './../util/stateReducerUtil';
import {
  getUltimoFilho,
  isDispositivoAlteracao,
  // isUltimaAlteracao,
  getDispositivoAndFilhosAsLista,
  getDispositivoCabecaAlteracao,
  getArticulacao,
  podeRenumerarFilhosAutomaticamente,
  getTiposAgrupadoresQuePodemSerInseridosAntes,
  getTiposAgrupadoresQuePodemSerInseridosDepois,
  getPrimeiroAgrupadorNaArticulacao,
  hasEmenta,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { getElementos } from './../../../model/elemento/elementoUtil';
import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { getPaiQuePodeReceberFilhoDoTipo } from './../evento/eventosUtil';
import { isAgrupador, isArticulacao, isArtigo, isEmenta } from './../../../model/dispositivo/tipo';
import { Alteracoes } from '../../../model/dispositivo/blocoAlteracao';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { getDispositivoAnteriorMesmoTipo, irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { copiaDispositivosParaOutroPai, isDesdobramentoAgrupadorAtual } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';

export const agrupaElemento = (state: any, action: any): State => {
  let atual = getDispositivoFromElemento(state.articulacao, action.atual, true)!;

  if (atual === undefined) {
    return state;
  }

  if (!isArtigo(atual) && !isAgrupador(atual) && !isEmenta(atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  }

  if ((isArticulacao(atual) || isEmenta(atual)) && action.novo.posicao === 'antes') {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  }

  // if (isArtigo(atual) && action.novo.posicao !== 'antes') {
  //   return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  // }

  if (!action.isAbrindoEmenda && action.novo.posicao === 'antes' && !getTiposAgrupadoresQuePodemSerInseridosAntes(atual).includes(action.novo.tipo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  }

  if (!action.isAbrindoEmenda && action.novo.posicao === 'depois' && !getTiposAgrupadoresQuePodemSerInseridosDepois(atual).includes(action.novo.tipo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
  }

  if (isEmenta(atual)) {
    atual = state.articulacao;
  }

  const posicaoDoNovoAgrupador: string = action.novo.posicao;
  const manterNovoNoMesmoGrupoDeAspas: boolean = action.novo.manterNoMesmoGrupoDeAspas;

  const cabecaAlteracao = isDispositivoAlteracao(atual) ? getDispositivoCabecaAlteracao(atual) : undefined;
  const dispositivosAlteracao = cabecaAlteracao ? getDispositivoAndFilhosAsLista(cabecaAlteracao) : [];
  const dispositivosArticulacao = getDispositivoAndFilhosAsLista(state.articulacao);

  if (isDispositivoAlteracao(atual)) {
    if (isDispositivoCabecaAlteracao(atual) && manterNovoNoMesmoGrupoDeAspas && posicaoDoNovoAgrupador === 'antes' && !atual.tiposPermitidosPai?.includes(action.novo.tipo)) {
      return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
    }

    if (!isDispositivoCabecaAlteracao(atual) && manterNovoNoMesmoGrupoDeAspas && !dispositivosAlteracao.some(d => d.tiposPermitidosFilhos?.includes(action.novo.tipo))) {
      return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
    }

    if (isArtigo(atual) && !isDispositivoCabecaAlteracao(atual) && !manterNovoNoMesmoGrupoDeAspas) {
      return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
    }

    if (!manterNovoNoMesmoGrupoDeAspas) {
      return criarNovaCabecaDeAlteracao(state, atual, posicaoDoNovoAgrupador, action.novo.tipo, false, { rotulo: action.novo.rotulo, uuid: action.novo.uuid });
    }

    if (isDispositivoCabecaAlteracao(atual) && posicaoDoNovoAgrupador === 'antes') {
      return criarNovaCabecaDeAlteracao(state, atual, posicaoDoNovoAgrupador, action.novo.tipo, true, { rotulo: action.novo.rotulo, uuid: action.novo.uuid });
    }
  }

  let novo: Dispositivo;
  const ref = dispositivosArticulacao[dispositivosArticulacao.indexOf(atual) - (posicaoDoNovoAgrupador === 'antes' ? 1 : 0)];

  if (!isArticulacao(atual) && isDesdobramentoAgrupadorAtual(atual, action.novo.tipo)) {
    novo = criaDispositivo(atual.pai!.pai!, action.novo.tipo, undefined, atual.pai!.pai!.indexOf(atual.pai!) + 1);
  } else {
    const paiQuePodeReceberNovoAgrupador = getPaiQuePodeReceberFilhoDoTipo(ref, action.novo.tipo, dispositivosAlteracao)!;
    if (!paiQuePodeReceberNovoAgrupador) {
      return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida.' });
    }

    const posNovoAgrupador =
      atual.pai === paiQuePodeReceberNovoAgrupador
        ? atual.pai!.indexOf(atual) + (posicaoDoNovoAgrupador === 'antes' ? 0 : 1)
        : calculaPosNovoAgrupador(atual, paiQuePodeReceberNovoAgrupador, dispositivosArticulacao, dispositivosAlteracao);
    novo = criaDispositivo(paiQuePodeReceberNovoAgrupador, action.novo.tipo, undefined, posNovoAgrupador);
  }

  // Reutiliza "uuid" quando o agrupador é criado por ação de undo ou redo
  novo.uuid = action.novo.uuid ?? novo.uuid;

  novo.situacao = new DispositivoAdicionado();
  (novo.situacao as DispositivoAdicionado).tipoEmenda = state.modo;
  novo.texto = action.novo.texto ?? '';
  novo.createRotulo(novo);
  novo.rotulo = action.novo.rotulo ?? novo.rotulo;
  novo.id = buildId(novo);

  if (isDispositivoAlteracao(novo) && novo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    (novo.situacao as DispositivoAdicionado).existeNaNormaAlterada = isDispositivoCabecaAlteracao(novo) || !podeRenumerarFilhosAutomaticamente(novo.pai!);
  }

  const dispositivos = getDispositivosASeremCopiadosParaOutroPai(atual, novo, posicaoDoNovoAgrupador, dispositivosAlteracao);
  copiaDispositivosParaOutroPai(novo, dispositivos);

  novo.pai!.renumeraFilhos();
  novo.pai!.filhos.forEach(f => f.renumeraFilhos());
  // novo.renumeraFilhos();

  const dispositivosAux = getDispositivoAndFilhosAsLista(novo.pai!);

  dispositivosAux.filter(d => isAgrupador(d) && !(d.tipo === 'Articulacao' && d.pai === undefined)).forEach(d => (d.id = buildId(d)));

  const renumerados = dispositivosAux.filter(fnFilterAgrupadorAdicionado).map((d: Dispositivo) => createElemento(d));

  const irmaoAnterior = getDispositivoAnteriorMesmoTipo(novo);

  if (irmaoAnterior && irmaosMesmoTipo(novo).length === 2) {
    renumerados.unshift(createElemento(irmaoAnterior));
  }

  const eventos = new Eventos();
  if (isArticulacao(ref) && hasEmenta(ref)) {
    eventos.setReferencia(createElemento(state.articulacao.projetoNorma.ementa));
  } else if (isArtigo(atual) && posicaoDoNovoAgrupador === 'depois') {
    eventos.setReferencia(createElemento(getUltimoFilho(ref)));
  } else {
    eventos.setReferencia(createElemento(ref));
  }

  const transferidosParaOutroPai = novo.filhos.map((d: Dispositivo) => createElemento(d));

  // eventos.add(StateType.ElementoIncluido, [createElemento(novo)]);
  const elementoIncluido = createElemento(novo);
  elementoIncluido.manterNoMesmoGrupoDeAspas = manterNovoNoMesmoGrupoDeAspas;
  eventos.add(StateType.ElementoIncluido, [elementoIncluido]);

  eventos.add(StateType.SituacaoElementoModificada, [createElemento(atual), ...transferidosParaOutroPai]);
  eventos.add(StateType.ElementoRenumerado, renumerados);
  eventos.add(StateType.ElementoMarcado, [createElemento(novo)]);

  const dArticulacao = getDispositivoAndFilhosAsLista(state.articulacao);
  const dReferenciado = dArticulacao[dArticulacao.indexOf(novo) + 1];
  eventos.add(StateType.ElementoReferenciado, dReferenciado ? [createElemento(dReferenciado)] : []);

  if (novo === getPrimeiroAgrupadorNaArticulacao(novo) && hasEmenta(novo)) {
    eventos.get(StateType.SituacaoElementoModificada).elementos!.push(createElemento(state.articulacao.projetoNorma.ementa));
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

const calculaPosNovoAgrupador = (
  dispositivo: Dispositivo,
  paiQuePodeReceberFilho: Dispositivo,
  dispositivosArticulacao: Dispositivo[],
  dispositivosAlteracao: Dispositivo[]
): number | undefined => {
  const ds = dispositivosArticulacao.filter(d => isDispositivoValidoNoConjunto(d, dispositivosAlteracao) && (d === dispositivo || paiQuePodeReceberFilho.filhos.includes(d)));
  return ds.indexOf(dispositivo);
};

// const isUltimoArtigoOuAgrupadorDaAlteracao = (dispositivo: Dispositivo): boolean => {
//   return isUltimaAlteracao(dispositivo) || isUltimaAlteracao(getUltimoFilho(dispositivo));
// };

const fnFilterAgrupadorAdicionado = (d: Dispositivo): boolean => !isArtigo(d) && d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO;

const criarNovaCabecaDeAlteracao = (state: any, atual: Dispositivo, posicao: string, tipo: string, manterNovoNoMesmoGrupoDeAspas = false, dadosComplementares: any = {}): State => {
  const cabecaAlteracao = getDispositivoCabecaAlteracao(atual);
  const pos = cabecaAlteracao.pai!.indexOf(cabecaAlteracao) + (posicao === 'antes' ? 0 : 1);
  const novo = criaDispositivoCabecaAlteracao(tipo, cabecaAlteracao.pai! as Alteracoes, undefined, pos);
  novo.rotulo = dadosComplementares.rotulo ?? novo.rotulo;
  novo.uuid = dadosComplementares.uuid ?? novo.uuid;
  novo.texto = dadosComplementares.texto ?? novo.texto ?? '';
  novo.id = buildId(novo);
  if (isDispositivoAlteracao(novo) && novo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    (novo.situacao as DispositivoAdicionado).existeNaNormaAlterada = isDispositivoCabecaAlteracao(novo) || !podeRenumerarFilhosAutomaticamente(novo.pai!);
  }

  const ref = pos === 0 ? novo.pai!.pai! : getUltimoFilho(novo.pai!.filhos[pos - 1]);

  const eventos = new Eventos();

  if (manterNovoNoMesmoGrupoDeAspas) {
    atual.cabecaAlteracao = false;
    copiaDispositivosParaOutroPai(novo, [atual]);

    novo.pai!.renumeraFilhos();
    novo.renumeraFilhos();

    const renumerados = [
      ...novo.pai!.filhos.filter(fnFilterAgrupadorAdicionado).map(d => createElemento(d)),
      ...novo.filhos.filter(fnFilterAgrupadorAdicionado).map(d => createElemento(d)),
    ];

    eventos.add(StateType.ElementoRenumerado, renumerados);
  }

  eventos.setReferencia(createElemento(ref));

  // eventos.add(StateType.ElementoIncluido, [createElemento(novo)]);
  const elementoIncluido = createElemento(novo);
  elementoIncluido.manterNoMesmoGrupoDeAspas = manterNovoNoMesmoGrupoDeAspas;
  eventos.add(StateType.ElementoIncluido, [elementoIncluido]);

  eventos.add(StateType.SituacaoElementoModificada, getElementos(novo));
  eventos.add(StateType.ElementoMarcado, [createElemento(novo)]);

  const dArticulacao = getDispositivoAndFilhosAsLista(state.articulacao);
  const dReferenciado = dArticulacao[dArticulacao.indexOf(novo) + 1];
  eventos.add(StateType.ElementoReferenciado, dReferenciado ? [createElemento(dReferenciado)] : []);

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

const isDispositivoValidoNoConjunto = (d: Dispositivo, dispositivosAlteracao: Dispositivo[]): boolean => dispositivosAlteracao.length === 0 || dispositivosAlteracao.includes(d);

const getDispositivosASeremCopiadosParaOutroPai = (atual: Dispositivo, novo: Dispositivo, posicaoDoNovoAgrupador: string, dispositivosAlteracao: Dispositivo[]): Dispositivo[] => {
  const dArticulacao = getDispositivoAndFilhosAsLista(getArticulacao(atual));
  const pais = getPais(atual, novo.tipo);
  if (isAgrupador(atual) && posicaoDoNovoAgrupador === 'depois') {
    pais.push(atual);
  }
  const indexAtual = dArticulacao.indexOf(atual) + (posicaoDoNovoAgrupador === 'antes' ? 0 : 1);
  const podeCopiar = (d: Dispositivo, index: number): boolean =>
    index >= indexAtual && d !== novo && !!novo.tiposPermitidosFilhos?.includes(d.tipo) && pais.includes(d.pai!) && isDispositivoValidoNoConjunto(d, dispositivosAlteracao);
  return dArticulacao.filter(podeCopiar);
};

const getPais = (dispositivo: Dispositivo, tipo: string, result: Dispositivo[] = []): Dispositivo[] => {
  const tiposAgrupadorArtigo = ['Parte', 'Livro', 'Titulo', 'Capitulo', 'Secao', 'Subsecao', 'Artigo'];
  if (dispositivo && tiposAgrupadorArtigo.indexOf(dispositivo.tipo) >= tiposAgrupadorArtigo.indexOf(tipo)) {
    result.push(dispositivo.pai!);
    return getPais(dispositivo.pai!, tipo, result);
  }
  return result;
};
