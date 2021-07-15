import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../model/dispositivo/omissis';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isDispositivoDeArtigo, isDispositivoGenerico, isIncisoCaput, TipoDispositivo } from '../model/dispositivo/tipo';
import { Elemento as Elemento, Referencia } from '../model/elemento';
import { buildListaElementosRenumerados, createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../model/elemento/elemento-util';
import { acoesPossiveis } from '../model/lexml/acoes/acoes.possiveis';
import { hasIndicativoDesdobramento, TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO } from '../model/lexml/conteudo/conteudo-util';
import { validaDispositivo } from '../model/lexml/dispositivo/dispositivo-validator';
import { DispositivoLexmlFactory } from '../model/lexml/factory/dispositivo-lexml-factory';
import {
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnterior,
  getUltimoFilho,
  hasFilhos,
  irmaosMesmoTipo,
  isArtigoUnico,
  isParagrafoUnico,
} from '../model/lexml/hierarquia/hierarquia-util';
import { addSpaceRegex, escapeRegex } from '../util/string-util';
import { adicionarElementoAction } from './elemento-actions';
import { Eventos } from './eventos';
import { StateEvent, StateType } from './state';

const count = 0;

export const buildPast = (state: any, events: any): StateEvent[] => {
  const past = state.past ? state.past : [];
  past.push(JSON.parse(JSON.stringify(events)));

  return count > 50 ? past.shift() : past;
};

export const buildFuture = (state: any, events: any): StateEvent[] => {
  const future = state.future ? state.future : [];
  future.push(JSON.parse(JSON.stringify(events)));

  return count > 50 ? future.shift() : future;
};

export const textoFoiModificado = (atual: Dispositivo, action: any): boolean => {
  return (atual.texto !== '' && action.atual?.conteudo?.texto === '') || (action.atual?.conteudo?.texto && atual.texto.localeCompare(action.atual?.conteudo?.texto) !== 0);
};

export const isOrWasUnico = (atual: Dispositivo, originalmenteUnico: boolean): boolean => {
  return isArtigoUnico(atual) || originalmenteUnico;
};

export const isArticulacaoAlteracao = (articulacao: Articulacao): boolean => {
  return articulacao.pai !== undefined;
};

export const getArticulacaoFromElemento = (articulacao: Articulacao, elemento: Elemento | Referencia): Articulacao => {
  return !isElementoDispositivoAlteracao(elemento) || isArticulacaoAlteracao(articulacao)
    ? articulacao
    : getDispositivoFromElemento(articulacao!, { uuid: (elemento as Elemento).hierarquia!.pai!.uuidAlteracao })?.alteracoes ?? articulacao;
};

export const createElementoValidado = (dispositivo: Dispositivo): Elemento => {
  const el = createElemento(dispositivo);
  el.mensagens = validaDispositivo(dispositivo);

  return el;
};

export const criaElementoValidado = (validados: Elemento[], dispositivo: Dispositivo, incluiAcoes?: boolean): void => {
  const mensagens = validaDispositivo(dispositivo);

  if (mensagens.length > 0 || (dispositivo.mensagens && dispositivo.mensagens?.length > 0)) {
    dispositivo.mensagens = mensagens;
    const elemento = createElemento(dispositivo, incluiAcoes);
    elemento.mensagens = validaDispositivo(dispositivo);
    validados.push(elemento);
  }
};

export const hasIndicativoInicioAlteracao = (texto: string): boolean => {
  return (
    new RegExp(addSpaceRegex(escapeRegex('passa a vigorar com a seguinte alteração:')) + '\\s*$').test(texto) ||
    new RegExp(addSpaceRegex(escapeRegex('passa a vigorar com as seguintes alterações:')) + '\\s*$').test(texto)
  );
};

export const normalizaSeForOmissis = (texto: string): string => {
  if (/^[.]*(?:\s*)["”“]?(\s*)?\(NR\)\s*$/.test(texto)) {
    return TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO;
  }

  if (texto === TEXTO_OMISSIS || texto === TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO || !new RegExp('^[.]+$').test(texto)) {
    return texto;
  }

  return TEXTO_OMISSIS;
};

export const hasIndicativoFimAlteracao = (texto: string): boolean => {
  return /["”](?:\s*\(NR\))\s*$/.test(texto);
};

export const isDispositivoAlteracao = (dispositivo: Dispositivo): boolean => {
  const r = !!dispositivo.isDispositivoAlteracao;

  if (r) {
    return true;
  }

  try {
    return getArticulacao(dispositivo).pai !== undefined;
  } catch (error) {
    return false;
  }
};

export const isElementoDispositivoAlteracao = (elemento: Partial<Elemento>): boolean => {
  return elemento.hierarquia?.pai?.uuidAlteracao !== undefined;
};

export const validaDispositivosAfins = (dispositivo: Dispositivo | undefined, incluiDispositivo = true): Elemento[] => {
  const validados: Elemento[] = [];

  if (!dispositivo) {
    return [];
  }
  if (isDispositivoAlteracao(dispositivo) && hasFilhos(dispositivo) && dispositivo.filhos.filter(d => d.tipo === TipoDispositivo.omissis.tipo).length > 0) {
    criaElementoValidado(validados, dispositivo);
    dispositivo.filhos.filter(d => d.tipo === TipoDispositivo.omissis.tipo).forEach(o => criaElementoValidado(validados, o));
  }

  if (isDispositivoDeArtigo(dispositivo) || isDispositivoGenerico(dispositivo)) {
    const parent = isIncisoCaput(dispositivo) ? dispositivo.pai!.pai! : dispositivo.pai!;
    criaElementoValidado(validados, parent);
    if (isAgrupador(parent)) {
      criaElementoValidado(validados, isIncisoCaput(dispositivo) ? dispositivo.pai!.pai! : dispositivo.pai!);
    }
    irmaosMesmoTipo(dispositivo).forEach(filho => {
      !incluiDispositivo && filho === dispositivo ? undefined : criaElementoValidado(validados, filho, true);
    });
  } else if (incluiDispositivo && !isArticulacao(dispositivo) && !isAgrupador(dispositivo)) {
    criaElementoValidado(validados, dispositivo, true);
  }

  return validados;
};

const isPrimeiroArtigo = (dispositivo: Dispositivo): boolean => {
  return isArtigo(dispositivo) && getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo) === 0;
};

export const ajustaReferencia = (referencia: Dispositivo, dispositivo: Dispositivo): Dispositivo => {
  return isArticulacao(referencia) || isPrimeiroArtigo(dispositivo) || dispositivo.pai!.indexOf(dispositivo) === 0 ? referencia : getUltimoFilho(referencia);
};

export const naoPodeCriarFilho = (dispositivo: Dispositivo): boolean => {
  return hasIndicativoDesdobramento(dispositivo) && !acoesPossiveis(dispositivo).includes(adicionarElementoAction);
};

export const isNovoDispositivoDesmembrandoAtual = (texto: string): boolean => {
  return texto !== undefined && texto !== '';
};

export const getElementosDoDispositivo = (dispositivo: Dispositivo, valida = false): Elemento[] => {
  const lista: Elemento[] = [];

  getDispositivoAndFilhosAsLista(dispositivo).forEach(d => {
    if (valida) {
      const mensagens = validaDispositivo(d);
      if (mensagens) {
        d.mensagens = mensagens;
        lista.push(createElemento(d));
      }
    } else {
      lista.push(createElemento(d));
    }
  });
  return lista;
};

export const redodDispositivoExcluido = (elemento: Elemento, pai: Dispositivo): Dispositivo => {
  const novo = DispositivoLexmlFactory.create(
    isArtigo(pai) && elemento.tipo === TipoDispositivo.inciso.name ? (pai as Artigo).caput! : pai,
    elemento.tipo!,
    undefined,
    elemento.hierarquia!.posicao
  );
  novo.uuid = elemento.uuid;
  novo!.texto = elemento?.conteudo?.texto ?? '';
  novo!.numero = elemento?.hierarquia?.numero;
  novo.rotulo = elemento?.rotulo;
  return novo;
};

export const redoDispositivosExcluidos = (articulacao: any, elementos: Elemento[]): Dispositivo => {
  const primeiroElemento = elementos.shift();

  const pai = getDispositivoFromElemento(articulacao, primeiroElemento!.hierarquia!.pai as Elemento);
  const primeiro = redodDispositivoExcluido(primeiroElemento!, pai!);

  elementos.forEach(filho => {
    const parent = filho.hierarquia?.pai === primeiroElemento?.hierarquia?.pai ? primeiro.pai! : getDispositivoFromElemento(articulacao, filho.hierarquia!.pai! as Elemento);
    redodDispositivoExcluido(filho, parent!);
  });

  return primeiro;
};

export const buildEventoAdicionarElemento = (atual: Dispositivo, novo: Dispositivo): Eventos => {
  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementosDoDispositivo(novo));
  eventos.add(StateType.ElementoRenumerado, buildListaElementosRenumerados(novo));
  eventos.add(StateType.ElementoValidado, validaDispositivosAfins(novo, false));

  return eventos;
};

export const buildEventoAtualizacaoElemento = (dispositivo: Dispositivo): Eventos => {
  const eventos = new Eventos();

  const elemento = createElemento(dispositivo);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventos.add(StateType.ElementoModificado, [elemento]);
  eventos.add(StateType.ElementoValidado, validaDispositivosAfins(dispositivo));

  return eventos;
};

export const buildUpdateEvent = (dispositivo: Dispositivo): StateEvent[] => {
  dispositivo.mensagens = validaDispositivo(dispositivo);
  const elemento = createElemento(dispositivo);

  return [
    {
      stateType: StateType.ElementoModificado,
      elementos: [elemento],
    },
    {
      stateType: StateType.ElementoValidado,
      elementos: validaDispositivosAfins(dispositivo, true),
    },
  ];
};

export const buildEventoExclusaoElemento = (elementosRemovidos: Elemento[], elementosRenumerados: Elemento[], elementosValidados: Elemento[]): Eventos => {
  const eventos = new Eventos();

  eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  eventos.add(StateType.ElementoRenumerado, elementosRenumerados);
  eventos.add(StateType.ElementoValidado, elementosValidados);

  return eventos;
};

export const buildEventoTransformacaooElemento = (
  atual: Dispositivo,
  novo: Dispositivo,
  elementosRemovidos: Elemento[],
  elementosRenumerados: Elemento[],
  elementosValidados: Elemento[]
): Eventos => {
  const eventos = new Eventos();

  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementos(novo));
  eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  eventos.add(StateType.ElementoRenumerado, elementosRenumerados);
  eventos.add(
    StateType.ElementoValidado,
    elementosValidados.filter(e => e.mensagens!.length > 0)
  );

  return eventos;
};

export const removeAndBuildEvents = (articulacao: Articulacao, dispositivo: Dispositivo): StateEvent[] => {
  const removidos = getElementos(dispositivo);
  const dispositivosRenumerados = listaDispositivosRenumerados(dispositivo);
  const dispositivoAnterior = getDispositivoAnterior(dispositivo);

  const pai = dispositivo.pai!;
  pai.removeFilho(dispositivo);
  pai.renumeraFilhos();

  const modificados = dispositivosRenumerados.map(d => createElemento(d));

  const dispositivoValidado =
    dispositivoAnterior && (isArtigoUnico(dispositivoAnterior) || isParagrafoUnico(dispositivoAnterior)) ? dispositivoAnterior : isCaput(pai!) ? pai!.pai! : pai!;

  if (articulacao.artigos.length === 1) {
    modificados.push(createElemento(articulacao.artigos[0]));
  }

  const eventos = buildEventoExclusaoElemento(removidos, modificados, validaDispositivosAfins(dispositivoValidado, false));
  return eventos.build();
};
