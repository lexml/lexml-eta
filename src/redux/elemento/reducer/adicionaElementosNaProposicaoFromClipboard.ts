import { validaDispositivo } from './../../../model/lexml/dispositivo/dispositivoValidator';
import { InfoTextoColado } from './../util/colarUtil';
import { DispositivoSuprimido } from './../../../model/lexml/situacao/dispositivoSuprimido';
import { DispositivoModificado } from './../../../model/lexml/situacao/dispositivoModificado';
import { Artigo } from './../../../model/dispositivo/dispositivo';
import { ClassificacaoDocumento } from './../../../model/documento/classificacao';
import { isArtigo, isOmissis, isInciso, isParagrafo, isCaput } from './../../../model/dispositivo/tipo';
import {
  buscaDispositivoById,
  getArticulacao,
  isModificado,
  isAdicionado,
  isSuprimido,
  isDispositivoAlteracao,
  getDispositivoCabecaAlteracao,
  getUltimoFilho,
  getDispositivoAnteriorNaSequenciaDeLeitura,
  isArticulacaoAlteracao,
  isDispositivoCabecaAlteracao,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { createElemento, createElementoValidado, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateEvent, StateType } from '../../state';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { ajustaIdsNaArticulacaoColada } from '../util/colarUtil';
import { removeAllHtmlTags } from '../../../util/string-util';
import { Elemento } from '../../../model/elemento/elemento';

const REGEX_OMISSIS = /^\.{2,}/;

interface InfoOmissis {
  omissis: Dispositivo;
  anterior: Dispositivo;
  posterior: Dispositivo;
  omitidos: Dispositivo[];
}

export const adicionaElementosNaProposicaoFromClipboard = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  const infoTextoColado: InfoTextoColado =
    action.infoTextoColado ?? InfoTextoColado.newInstanceFromJsonix(action.novo?.conteudo?.texto, state.articulacao, action.atual, action.isColarSubstituindo, action.posicao);

  if (infoTextoColado.restricoes.length) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: infoTextoColado.restricoes[0].mensagens[0] });
  }

  const articulacaoColada = infoTextoColado.articulacaoColada;
  const ref = getDispositivoFromElemento(state.articulacao, infoTextoColado.infoElementos.referencia!)!;

  if (!isArtigo(articulacaoColada.filhos[0]) || isDispositivoAlteracao(atual)) {
    ajustaIdsNaArticulacaoColada(articulacaoColada.filhos, ref);
  }

  const eventos = colarDispositivos(
    state.articulacao,
    articulacaoColada,
    atual,
    ref,
    action.posicao,
    action.isColarSubstituindo,
    action.isUsarDispositivoDeMesmoRotuloComoReferenciaDuranteAdicao,
    state.modo
  );

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos),
    present: eventos,
    future: [],

    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
    },
  };
};

const colarDispositivos = (
  articulacao: Articulacao,
  articulacaoColada: Articulacao,
  atual: Dispositivo,
  referencia: Dispositivo,
  posicao: string,
  isColarSubstituindo: boolean,
  isUsarDispositivoDeMesmoRotuloComoReferenciaDuranteAdicao: boolean,
  modo: ClassificacaoDocumento
): StateEvent[] => {
  const isColandoEmAlteracaoDeNorma = isDispositivoAlteracao(atual);
  let refAux = referencia;

  const adicionados: Dispositivo[] = [];
  const modificados: Dispositivo[] = [];

  articulacaoColada.filhos.forEach(f => {
    if (isColandoEmAlteracaoDeNorma || !isOmissis(f)) {
      const d = buscarDispositivoByIdTratandoParagrafoUnico(articulacao, f.id!);
      if (d && isColarSubstituindo) {
        const d2 = colarDispositivoSubstituindo(d, f, modo, isColandoEmAlteracaoDeNorma);
        modificados.push(...getDispositivoAndFilhosAsLista(d2).filter(isModificado));
        adicionados.push(...getDispositivoAndFilhosAsLista(d2).filter(isAdicionado));
        refAux = d2;
        d2.renumeraFilhos();
      } else {
        refAux = d && isUsarDispositivoDeMesmoRotuloComoReferenciaDuranteAdicao ? d : refAux;
        const d2 = colarDispositivoAdicionando(refAux, f, isColandoEmAlteracaoDeNorma, false, modo, posicao === 'antes' && refAux === referencia ? posicao : undefined);
        adicionados.push(...getDispositivoAndFilhosAsLista(d2));
        refAux = d2;
        d2.pai?.renumeraFilhos(); // TODO: COLOCAR EM UM LUGAR MELHOR ?
      }
    }
  });

  const eventos: StateEvent[] = [];
  let eventoElementoRemovido: StateEvent | undefined;

  if (isAdicionarNaPosicaoAtual(articulacaoColada, atual, referencia)) {
    eventoElementoRemovido = buildEventoElementoRemovido(referencia);

    referencia.pai!.removeFilho(referencia);
    referencia.pai!.renumeraFilhos();
    adicionados.forEach(d => (d.id = buildId(d)));
  }

  eventos.push(buildEventoElementoIncluido(adicionados, referencia));
  eventoElementoRemovido && eventos.push(eventoElementoRemovido);
  eventos.push(...buildEventosElementoModificado(modificados));
  eventos.push(buildEventoElementoSuprimido(referencia));
  eventos.push(buildEventoSituacaoElementoModificada(adicionados, isColandoEmAlteracaoDeNorma));
  adicionados[0] && eventos.push(buildEventoElementoMarcado([adicionados[0], atual]));

  return eventos.filter(ev => ev.elementos?.length);
};

const isAdicionarNaPosicaoAtual = (articulacaoColada: Articulacao, atual: Dispositivo, referencia: Dispositivo): boolean => {
  const primeiroDispositivoColado = getDispositivoAndFilhosAsLista(articulacaoColada).filter(d => !['Articulacao', 'Omissis'].includes(d.tipo))[0];
  return atual === referencia && primeiroDispositivoColado.tipo === referencia.tipo && !referencia.texto && isAdicionado(referencia);
};

const buildEventoElementoRemovido = (dispositivo: Dispositivo): StateEvent => {
  return {
    stateType: StateType.ElementoRemovido,
    elementos: [createElementoValidado(dispositivo)],
  };
};

const buildEventoElementoIncluido = (adicionados: Dispositivo[], referencia: Dispositivo): StateEvent => {
  const elementoAdicionados: Elemento[] = [];
  const paiRef = referencia.pai!;
  let referenciaUI: Elemento | undefined;

  if (adicionados.length) {
    let dispositivos = getDispositivoAndFilhosAsLista(paiRef);
    let index = dispositivos.indexOf(adicionados[0]);
    if (index === -1) {
      dispositivos = getDispositivoAndFilhosAsLista(getArticulacao(paiRef));
      index = dispositivos.indexOf(adicionados[0]);
    }

    adicionados.forEach(d => {
      const elemento = createElemento(d, true, true);
      elemento.mensagens = validaDispositivo(d);
      elementoAdicionados.push(elemento);
    });

    referenciaUI = createElemento(dispositivos[index - 1]);
  }

  return {
    stateType: StateType.ElementoIncluido,
    elementos: elementoAdicionados,
    referencia: referenciaUI,
  };
};

const buildEventosElementoModificado = (modificados: Dispositivo[]): StateEvent[] => {
  const eventos: StateEvent[] = [];
  modificados.forEach(d => {
    eventos.push({
      stateType: StateType.ElementoModificado,
      elementos: [(d.situacao as DispositivoModificado).dispositivoOriginal, createElementoValidado(d)],
    });
  });
  return eventos;
};

const buildEventoElementoSuprimido = (referencia: Dispositivo): StateEvent => {
  const suprimidos = getDispositivoAndFilhosAsLista(referencia.pai!)
    .filter(isSuprimido)
    .map(d => getDispositivoAndFilhosAsLista(d))
    .flat();

  return {
    stateType: StateType.ElementoSuprimido,
    elementos: suprimidos.map(d => createElementoValidado(d)),
  };
};

const buildEventoSituacaoElementoModificada = (dispositivos: Dispositivo[], isColandoEmAlteracaoDeNorma: boolean): StateEvent => {
  const elementosComSituacaoModificada: Elemento[] = []; // elementos a serem atualizados na UI
  if (isColandoEmAlteracaoDeNorma) {
    elementosComSituacaoModificada.push(...getDispositivosEmAlteracaoDeNormaASeremAtualizados(dispositivos).map(d => createElementoValidado(d)));
  }
  elementosComSituacaoModificada.push(...getParagrafosDeNumero1(dispositivos).map(d => createElementoValidado(d)));
  elementosComSituacaoModificada.push(...getArtigosComAlteracaoDeNorma(dispositivos).map(d => createElementoValidado(d)));
  return {
    stateType: StateType.SituacaoElementoModificada,
    elementos: elementosComSituacaoModificada,
  };
};

const buildEventoElementoMarcado = (dispositivos: Dispositivo[]): StateEvent => {
  return {
    stateType: StateType.ElementoMarcado,
    elementos: dispositivos.map(d => createElementoValidado(d)),
  };
};

const getParagrafosDeNumero1 = (dispositivos: Dispositivo[]): Dispositivo[] => {
  return [...new Set(dispositivos.filter(isParagrafo).map(d => d.pai!))].map(art => art.filhos.filter(f => isParagrafo(f) && f.numero === '1')).flat();
};

const getArtigosComAlteracaoDeNorma = (dispositivos: Dispositivo[]): Dispositivo[] => {
  return dispositivos.filter(d => isArtigo(d) && !isArticulacaoAlteracao(d) && d.alteracoes?.filhos.length);
};

const colarDispositivoSubstituindo = (
  dOriginal: Dispositivo,
  dColado: Dispositivo,
  modo: ClassificacaoDocumento,
  isColandoEmAlteracaoDeNorma: boolean,
  colecaoInfoOmissis: InfoOmissis[] = []
): Dispositivo => {
  let refAux = dOriginal;

  if (removeAllHtmlTags(dOriginal.texto) !== removeAllHtmlTags(dColado.texto) && !dColado.texto.match(REGEX_OMISSIS) && dColado.texto.trim()) {
    dOriginal.situacao = new DispositivoModificado(createElementoValidado(dOriginal));
    // dOriginal.isDispositivoAlteracao = false;
    dOriginal.texto = dColado.texto;
  }

  let omissisImediatamenteAnterior: Dispositivo | undefined;

  const filhosColados = dColado.alteracoes?.filhos || dColado.filhos;

  filhosColados.forEach(fColado => {
    if (isOmissis(fColado)) {
      colecaoInfoOmissis.push(montarInfoOmissis(dOriginal, fColado));
    }

    if (!isOmissis(fColado) || isColandoEmAlteracaoDeNorma) {
      const fOriginal = buscarDispositivoByIdTratandoParagrafoUnico(getArticulacao(dOriginal), fColado.id!);
      if (fOriginal) {
        refAux = fOriginal;
        colarDispositivoSubstituindo(fOriginal, fColado, modo, isColandoEmAlteracaoDeNorma || isDispositivoAlteracao(fColado), colecaoInfoOmissis);
      } else {
        refAux = (omissisImediatamenteAnterior && getUltimoDispositivoDoIntervaloOmitido(omissisImediatamenteAnterior, colecaoInfoOmissis, fColado)) || refAux;
        colarDispositivoAdicionando(refAux, fColado, isColandoEmAlteracaoDeNorma || isDispositivoAlteracao(fColado), !!omissisImediatamenteAnterior, modo, 'depois');
        refAux = fColado;
      }
    }
    omissisImediatamenteAnterior = isOmissis(fColado) ? fColado : undefined;
  });

  if (!isColandoEmAlteracaoDeNorma) {
    suprimirDispositivosForaDosIntervalosOmitidos(dOriginal, dColado, colecaoInfoOmissis);
  }

  return dOriginal;
};

const getUltimoDispositivoDoIntervaloOmitido = (omissis: Dispositivo, colecaoInfoOmissis: InfoOmissis[], dColado: Dispositivo): Dispositivo | undefined => {
  return colecaoInfoOmissis
    .find(i => i.omissis === omissis)
    ?.omitidos.filter(o => o.tipo === dColado.tipo)
    .slice(-1)[0];
};

const suprimirDispositivosForaDosIntervalosOmitidos = (dOriginal: Dispositivo, dColado: Dispositivo, colecaoInfoOmissis: InfoOmissis[]): void => {
  const articulacaoColada = getArticulacao(dColado);
  const dispositivosOriginaisOmitidosNaArticulacaoColada = colecaoInfoOmissis.map(i => i.omitidos).flat();

  dOriginal.filhos.forEach(fOriginal => {
    const fColado =
      buscarDispositivoByIdTratandoParagrafoUnico(articulacaoColada, fOriginal.id!) || buscaDispositivoById(articulacaoColada, fOriginal.id!.replace('par1u', 'par1'));

    if (!fColado && !dispositivosOriginaisOmitidosNaArticulacaoColada.find(d => d.id === fOriginal.id)) {
      getDispositivoAndFilhosAsLista(fOriginal).forEach(d => (d.situacao = new DispositivoSuprimido(createElementoValidado(d))));
    }
  });
};

const buscarDispositivoByIdTratandoParagrafoUnico = (articulacao: Articulacao, id: string): Dispositivo | undefined => {
  const d = buscaDispositivoById(articulacao, id);
  if (d) {
    return d;
  } else {
    const idSemConsiderarAlteracaoEmNorma = id.split('alt')[0];
    if (idSemConsiderarAlteracaoEmNorma.split('_').includes('par1')) {
      return buscaDispositivoById(articulacao, id.replace('_par1_', '_par1u_').replace(/par1$/, 'par1u'));
    } else {
      return;
    }
  }
};

const colarDispositivoAdicionando = (
  referencia: Dispositivo,
  dColado: Dispositivo,
  isColandoEmAlteracaoDeNorma: boolean,
  isPrecedidoPorOmissis: boolean,
  modo: ClassificacaoDocumento,
  posicao?: string
): Dispositivo => {
  if (!isOmissis(referencia) && referencia.tiposPermitidosFilhos?.includes(dColado.tipo)) {
    if (isArtigo(referencia) && isInciso(dColado)) {
      dColado.pai = (referencia as Artigo).caput;
      if (isPrecedidoPorOmissis) {
        (referencia as Artigo).caput!.addFilho(dColado);
      } else {
        (referencia as Artigo).caput!.addFilhoOnPosition(dColado, 0);
      }
    } else {
      dColado.pai = referencia;
      if (isPrecedidoPorOmissis) {
        referencia.addFilho(dColado);
      } else {
        referencia.addFilhoOnPosition(dColado, 0);
      }
    }
  } else if (!isDispositivoAlteracao(referencia) && isDispositivoAlteracao(dColado)) {
    dColado.pai = referencia.alteracoes;
    referencia.alteracoes!.addFilhoOnPosition(dColado, 0);
  } else {
    dColado.pai = referencia.pai;
    referencia.pai?.addFilhoOnPosition(dColado, referencia.pai!.indexOf(referencia) + (posicao === 'antes' ? 0 : 1));
  }

  if (dColado.texto.match(REGEX_OMISSIS) && !isColandoEmAlteracaoDeNorma) {
    dColado.texto = '';
  }

  ajustaSituacaoDispositivoAdicionado(dColado, modo);

  if (isColandoEmAlteracaoDeNorma) {
    dColado.notaAlteracao = isDispositivoCabecaAlteracao(dColado) ? 'NR' : undefined;
  } else {
    removeOmissis(dColado);
  }

  if (!dColado.pai?.tiposPermitidosFilhos?.includes(dColado.tipo) && !isOmissis(dColado)) {
    throw new Error('Erro ao colar dispositivo adicionado');
  }

  return dColado;
};

const criaAtributosComunsAdicionado = (filho: Dispositivo, modo: ClassificacaoDocumento): void => {
  filho.situacao = new DispositivoAdicionado();
  filho.isDispositivoAlteracao = isDispositivoAlteracao(filho);
  (filho.situacao as DispositivoAdicionado).tipoEmenda = modo;
  if (filho.isDispositivoAlteracao && !isOmissis(filho)) {
    (filho.situacao as DispositivoAdicionado).existeNaNormaAlterada = true;
  }
};

const removeOmissis = (atual: Dispositivo): void => {
  const omissis = atual.filhos.filter(isOmissis);
  omissis.forEach(o => o.pai!.removeFilho(o));
  atual.filhos.forEach(removeOmissis);
  atual.id = buildId(atual);
  atual.renumeraFilhos();
};

const ajustaSituacaoDispositivoAdicionado = (atual: Dispositivo, modo: ClassificacaoDocumento): void => {
  criaAtributosComunsAdicionado(atual, modo);
  atual.filhos.forEach(filho => {
    criaAtributosComunsAdicionado(filho, modo);
    filho.filhos && ajustaSituacaoDispositivoAdicionado(filho, modo);
  });

  if (atual.alteracoes) {
    criaAtributosComunsAdicionado(atual.alteracoes, modo);
    atual.alteracoes.filhos.forEach(filho => {
      criaAtributosComunsAdicionado(filho, modo);
      filho.filhos && ajustaSituacaoDispositivoAdicionado(filho, modo);
    });
  }
};

const montarInfoOmissis = (dOriginal: Dispositivo, omissisColado: Dispositivo): InfoOmissis => {
  const dispositivosDaArvoreDoOmisses = getDispositivoAndFilhosAsLista(isCaput(omissisColado.pai!) ? omissisColado.pai!.pai! : omissisColado.pai!);
  const dispositivosDaArvoreDoOriginal = getDispositivoAndFilhosAsLista(isArtigo(dOriginal) ? dOriginal : dOriginal.pai!);

  const indexOmissis = dispositivosDaArvoreDoOmisses.indexOf(omissisColado);
  const anteriorOmissis = dispositivosDaArvoreDoOmisses[indexOmissis - 1];
  const posteriorOmissis = dispositivosDaArvoreDoOmisses[indexOmissis + 1];

  const anteriorOmissisNaArvoreDoOriginal = dispositivosDaArvoreDoOriginal.find(d => d.id === anteriorOmissis.id)!;
  const posteriorOmissisNaArvoreDoOriginal = posteriorOmissis && dispositivosDaArvoreDoOriginal.find(d => d.id === posteriorOmissis.id);

  const omitidos = getDispositivosOriginais(dispositivosDaArvoreDoOriginal, anteriorOmissisNaArvoreDoOriginal, posteriorOmissisNaArvoreDoOriginal, posteriorOmissis);

  const prefixos = [...new Set(omitidos.map(d => d.id!.split('_')[0]))];
  if (prefixos.length > 1) {
    throw new Error('Erro ao montar lista de dispositivos omitidos');
  }

  return {
    omissis: omissisColado,
    anterior: anteriorOmissis,
    posterior: posteriorOmissis,
    omitidos,
  };
};

const getDispositivosOriginais = (
  dispositivosDaArvoreDoOriginal: Dispositivo[],
  anteriorOmissisNaArvoreDoOriginal: Dispositivo,
  posteriorOmissisNaArvoreDoOriginal: Dispositivo | undefined,
  posteriorOmissisNaArvoreDoOmissis: Dispositivo | undefined
): Dispositivo[] => {
  const result: Dispositivo[] = [];

  if (posteriorOmissisNaArvoreDoOriginal) {
    const indexAnteriorNaListaOriginal = dispositivosDaArvoreDoOriginal.findIndex(d => d.id === anteriorOmissisNaArvoreDoOriginal.id);
    const indexPosteriorNaListaOriginal = dispositivosDaArvoreDoOriginal.findIndex(d => d.id === posteriorOmissisNaArvoreDoOriginal.id);
    result.push(...dispositivosDaArvoreDoOriginal.filter((_, index) => index > indexAnteriorNaListaOriginal && index < indexPosteriorNaListaOriginal));
  } else {
    const indexAnteriorNaListaOriginal = dispositivosDaArvoreDoOriginal.findIndex(d => d.id === anteriorOmissisNaArvoreDoOriginal.id);
    result.push(
      ...dispositivosDaArvoreDoOriginal.filter(
        (d, index) => index > indexAnteriorNaListaOriginal && (!posteriorOmissisNaArvoreDoOmissis || d.id!.startsWith(posteriorOmissisNaArvoreDoOmissis.pai!.id!))
      )
    );
  }

  return result;
};

const getDispositivosEmAlteracaoDeNormaASeremAtualizados = (dispositivos: Dispositivo[]): Dispositivo[] => {
  const mapa = new Map();
  dispositivos.forEach(d => {
    const cabeca = getDispositivoCabecaAlteracao(d);
    mapa.set(cabeca.id, cabeca);
  });
  const cabecas = [...mapa.values()];
  return cabecas
    .map(d => {
      const ultimoFilho = getUltimoFilho(d);
      const irmaoAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(ultimoFilho, d1 => !!(d1.pai && d1.pai === ultimoFilho.pai));
      return irmaoAnterior ? [irmaoAnterior, ultimoFilho] : [ultimoFilho];
    })
    .flat()
    .filter(d => d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO);
};
