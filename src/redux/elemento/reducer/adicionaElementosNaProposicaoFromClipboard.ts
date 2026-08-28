import { validaDispositivo } from './../../../model/lexml/dispositivo/dispositivoValidator';
import { InfoTextoColado } from './../util/colarUtil';
import { ClassificacaoDocumento } from './../../../model/documento/classificacao';
import { isArtigo, isOmissis, isInciso, isParagrafo } from './../../../model/dispositivo/tipo';
import {
  buscaDispositivoById,
  getArticulacao,
  isAdicionado,
  isDispositivoAlteracao,
  getDispositivoCabecaAlteracao,
  getUltimoFilho,
  getDispositivoAnteriorNaSequenciaDeLeitura,
  isArticulacaoAlteracao,
  isDispositivoCabecaAlteracao,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { createElemento, createElementoValidado, getDispositivoFromElemento, getElementos } from '../../../model/elemento/elementoUtil';
import { getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Articulacao, Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { buildId, buildIdCaputEAlteracao } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateEvent, StateType } from '../../state';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { ajustaIdsNaArticulacaoColada } from '../util/colarUtil';
import { Elemento } from '../../../model/elemento/elemento';
import { TEXTO_OMISSIS } from '../../../model/lexml/conteudo/textoOmissis';
import { isBloqueado } from '../../../model/lexml/regras/regrasUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';

const REGEX_OMISSIS = /^\.{2,}/;

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

  if (existeDispositivoBloqueadoSendoColado(articulacaoColada, state.articulacao)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível colagem de texto em dispositivo bloqueado.' });
  }

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
    state.modo,
    infoTextoColado.infoElementos.tiposColados[0]
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

const existeDispositivoBloqueadoSendoColado = (articulacaoColada: Articulacao, articulacao: Articulacao): boolean => {
  const idsColados = getDispositivoAndFilhosAsLista(articulacaoColada)
    .filter(d => d.texto !== TEXTO_OMISSIS)
    .map(d => d.id)
    .filter((id): id is string => id !== undefined);

  const idsBloqueados = getDispositivoAndFilhosAsLista(articulacao)
    .filter(isBloqueado)
    .map(d => d.id)
    .filter((id): id is string => id !== undefined);

  return idsColados.some(id => idsBloqueados.includes(id));
};

const colarDispositivos = (
  articulacao: Articulacao,
  articulacaoColada: Articulacao,
  atual: Dispositivo,
  referencia: Dispositivo,
  posicao: string,
  isColarSubstituindo: boolean,
  isUsarDispositivoDeMesmoRotuloComoReferenciaDuranteAdicao: boolean,
  modo: ClassificacaoDocumento,
  tipoColado: string
): StateEvent[] => {
  const isColandoEmAlteracaoDeNorma = isDispositivoAlteracao(atual);
  let refAux = referencia;

  const novos: Dispositivo[] = [];
  const substitutos: Dispositivo[] = [];
  const substituidos: Dispositivo[] = []; // dispositivos que serão removidos para dar lugar aos substitutos

  const eventos: StateEvent[] = [];
  const elementosRemovidos: Elemento[] = [];
  const elementosRenumerados: Elemento[] = [];

  articulacaoColada.filhos.forEach(f => {
    if (isColandoEmAlteracaoDeNorma || !isOmissis(f)) {
      const d = buscarDispositivoByIdTratandoParagrafoUnico(articulacao, f.id!);

      // Colagem parcial (com omíssis): reconcilia filho a filho para preservar os trechos não mencionados, em vez de substituir a subárvore inteira.
      if (d && isColarSubstituindo && !isColandoEmAlteracaoDeNorma && representaEdicaoParcialDeContainer(d, f)) {
        const resultadoReconciliacao = { modificados: [] as Dispositivo[], suprimidos: [] as Dispositivo[], adicionados: [] as Dispositivo[] };
        reconciliarContainerColado(d, f, resultadoReconciliacao);
        eventos.push(...buildEventosDaReconciliacao(d, resultadoReconciliacao));
        refAux = d;
        return;
      }

      refAux = d && isColarSubstituindo ? d : refAux;
      const auxPosicao = d && isColarSubstituindo ? 'antes' : posicao === 'antes' && refAux === referencia ? posicao : undefined;
      const d2 = colarDispositivoAdicionando(refAux, f, isColandoEmAlteracaoDeNorma, false, modo, auxPosicao);
      refAux = d2;

      if (d && isColarSubstituindo) {
        substitutos.push(d2);
        substituidos.push(d);

        // Se o dispositivo a ser substituído for o mesmo que a referência, a referência passa a ser o dispositivo substituto
        if (d.uuid === referencia.uuid) {
          referencia = d2;
        }

        // Se o dispositivo a ser substituído for o mesmo que o atual, o atual passa a ser o dispositivo substituto
        if (d.uuid === atual.uuid) {
          atual = d2;
        }
      } else {
        // Marca dispositivos colados e seus descendentes como 'Adicionados' para forçar a renumeração (evitando colisão de IDs) e manter a consistência no agrupamento de revisões.
        // Exceção: Em blocos de alteração de norma, o texto colado é o texto final e permanece como 'Original'.
        if (!isColandoEmAlteracaoDeNorma) {
          getDispositivoAndFilhosAsLista(d2).forEach(descendente => (descendente.situacao = new DispositivoAdicionado()));
          if (isArtigo(d2)) {
            (d2 as Artigo).caput!.situacao = new DispositivoAdicionado();
          }
        }
        novos.push(d2);
      }
    }
  });

  const substituidosESeusFilhos = substituidos
    .map(d => getDispositivoAndFilhosAsLista(d))
    .flat()
    .map(d => createElemento(d));
  elementosRemovidos.push(...substituidosESeusFilhos);

  substituidos.forEach(d => d.pai!.removeFilho(d));

  novos[0]?.pai!.renumeraFilhos();

  novos.forEach(d => {
    getDispositivoAndFilhosAsLista(d).forEach(d => {
      d.id = buildId(d);
      if (isArtigo(d)) {
        buildIdCaputEAlteracao(d);
      }
    });
  });

  const substitutosESeusFilhos = substitutos.map(d => getDispositivoAndFilhosAsLista(d)).flat();
  const novosESeusFilhos = novos.map(d => getDispositivoAndFilhosAsLista(d)).flat();
  eventos.push(buildEventoElementoIncluido([...substitutosESeusFilhos, ...novosESeusFilhos], referencia));
  eventos.push({ stateType: StateType.ElementoRemovido, elementos: elementosRemovidos });
  eventos.push({ stateType: StateType.ElementoRenumerado, elementos: elementosRenumerados });
  eventos.push(buildEventoElementosRenumerados(novos, referencia, tipoColado));
  eventos.push(buildEventoSituacaoElementoModificada(novos, isColandoEmAlteracaoDeNorma));
  if (novos[0]) {
    eventos.push(buildEventoElementoMarcado([novos[0], atual]));
  }

  return eventos.filter(ev => ev.elementos?.length);
};

const buildEventoElementosRenumerados = (adicionados: Dispositivo[], referencia: Dispositivo, tipoColado: string): StateEvent => {
  const refAux = referencia.tipo === tipoColado ? referencia.pai! : referencia;
  const filhosASeremRenumerados = refAux.filhos.filter(f => isAdicionado(f) && !adicionados.includes(f));

  return {
    stateType: StateType.ElementoRenumerado,
    elementos: filhosASeremRenumerados.map(f => createElemento(f)),
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

const buscarDispositivoByIdTratandoParagrafoUnico = (articulacao: Articulacao, id: string): Dispositivo | undefined => {
  const d = buscaDispositivoById(articulacao, id);
  if (d) {
    return d;
  } else {
    if (id.endsWith('par1') || id.split('_').includes('par1')) {
      return buscaDispositivoById(articulacao, id.replace('_par1_', '_par1u_').replace(/par1$/, 'par1u'));
    } else {
      return;
    }
  }
};

// Um dispositivo colado sinaliza edição parcial quando seu caput está omitido e/ou existe algum nó Omissis
// entre seus filhos — ou seja, ele representa "parte do conteúdo mudou, o resto continua igual".
const representaEdicaoParcialDeContainer = (dExistente: Dispositivo, fColado: Dispositivo): boolean => {
  if (!dExistente.filhos?.length) {
    return false;
  }
  const caputColado = isArtigo(fColado) ? (fColado as Artigo).caput : undefined;
  const caputOmitido = !!caputColado && REGEX_OMISSIS.test(caputColado.texto ?? '');
  const temOmissisEntreFilhos = fColado.filhos.some(isOmissis);
  return caputOmitido || temOmissisEntreFilhos;
};

// Reconcilia recursivamente os filhos de "dExistente" com o que foi colado em "fColado", preservando (por id) tudo
// o que não foi mencionado explicitamente e está coberto por um nó Omissis adjacente; o que não está coberto é
// marcado como suprimido (exclusão lógica, não física) em vez de simplesmente desaparecer da árvore.
const reconciliarContainerColado = (
  dExistente: Dispositivo,
  fColado: Dispositivo,
  resultado: { modificados: Dispositivo[]; suprimidos: Dispositivo[]; adicionados: Dispositivo[] }
): void => {
  if (isArtigo(dExistente) && isArtigo(fColado)) {
    const caputExistente = (dExistente as Artigo).caput!;
    const caputColado = (fColado as Artigo).caput;
    if (caputColado && !REGEX_OMISSIS.test(caputColado.texto ?? '') && aplicarTextoColadoEmDispositivoExistente(caputExistente, caputColado)) {
      resultado.modificados.push(caputExistente);
    }
  }

  const filhosOriginais = [...dExistente.filhos];
  const filhosFinais: Dispositivo[] = [];
  let cursor = 0;
  let precedidoPorOmissis = false;

  const suprimirGap = (gap: Dispositivo[]): void => {
    if (!gap.length || precedidoPorOmissis) {
      return;
    }
    gap.forEach(g => {
      marcarComoSuprimido(g);
      resultado.suprimidos.push(g);
    });
  };

  fColado.filhos.forEach(fc => {
    if (isOmissis(fc)) {
      precedidoPorOmissis = true;
      return;
    }

    const idxMatch = filhosOriginais.findIndex((d, idx) => idx >= cursor && d.id === fc.id);

    if (idxMatch === -1) {
      fc.pai = dExistente;
      fc.situacao = new DispositivoAdicionado();
      filhosFinais.push(fc);
      resultado.adicionados.push(fc);
      precedidoPorOmissis = false;
      return;
    }

    const gap = filhosOriginais.slice(cursor, idxMatch);
    suprimirGap(gap);
    filhosFinais.push(...gap);

    const existente = filhosOriginais[idxMatch];
    if (fc.filhos.length) {
      reconciliarContainerColado(existente, fc, resultado);
    } else if (aplicarTextoColadoEmDispositivoExistente(existente, fc)) {
      resultado.modificados.push(existente);
    }
    filhosFinais.push(existente);

    cursor = idxMatch + 1;
    precedidoPorOmissis = false;
  });

  const cauda = filhosOriginais.slice(cursor);
  suprimirGap(cauda);
  filhosFinais.push(...cauda);

  dExistente.filhos.splice(0, dExistente.filhos.length, ...filhosFinais);
  dExistente.renumeraFilhos();
};

const aplicarTextoColadoEmDispositivoExistente = (existente: Dispositivo, colado: Dispositivo): boolean => {
  if (existente.texto === colado.texto) {
    return false;
  }
  const original = createElemento(existente);
  existente.texto = colado.texto;
  if (existente.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    existente.situacao = new DispositivoModificado(original);
  }
  return true;
};

const marcarComoSuprimido = (dispositivo: Dispositivo): void => {
  getDispositivoAndFilhosAsLista(dispositivo).forEach(d => (d.situacao = new DispositivoSuprimido(createElemento(d))));
};

const buildEventosDaReconciliacao = (
  dExistente: Dispositivo,
  { modificados, suprimidos, adicionados }: { modificados: Dispositivo[]; suprimidos: Dispositivo[]; adicionados: Dispositivo[] }
): StateEvent[] => {
  const eventos: StateEvent[] = [];

  if (modificados.length) {
    eventos.push({ stateType: StateType.ElementoModificado, elementos: modificados.map(d => createElementoValidado(d)) });
  }

  if (suprimidos.length) {
    eventos.push({ stateType: StateType.ElementoSuprimido, elementos: suprimidos.flatMap(d => getElementos(d, true)) });
  }

  if (adicionados.length) {
    const listaCompleta = getDispositivoAndFilhosAsLista(dExistente);
    const idxPrimeiro = listaCompleta.indexOf(adicionados[0]);
    const referenciaUI = idxPrimeiro > 0 ? createElemento(listaCompleta[idxPrimeiro - 1]) : createElemento(dExistente);
    eventos.push({ stateType: StateType.ElementoIncluido, elementos: adicionados.map(d => createElemento(d, true, true)), referencia: referenciaUI });
  }

  return eventos;
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

const removeOmissis = (atual: Dispositivo): void => {
  const omissis = atual.filhos.filter(isOmissis);
  omissis.forEach(o => o.pai!.removeFilho(o));
  atual.filhos.forEach(removeOmissis);
  atual.id = buildId(atual);
  atual.renumeraFilhos();
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
