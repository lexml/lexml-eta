import { Articulacao, Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isDispositivoDeArtigo, isDispositivoGenerico, isIncisoCaput } from '../../../model/dispositivo/tipo';
import { Elemento, Referencia } from '../../../model/elemento';
import { createElemento, criaElementoValidadoSeNecessario, getDispositivoFromElemento } from '../../../model/elemento/elemento-util';
import { acoesPossiveis } from '../../../model/lexml/acoes/acoes-possiveis';
import { hasIndicativoDesdobramento } from '../../../model/lexml/conteudo/conteudo-util';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivo-lexml-factory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivo-validator';
import {
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnteriorMesmoTipo,
  getUltimoFilho,
  hasFilhos,
  irmaosMesmoTipo,
  isArtigoUnico,
} from '../../../model/lexml/hierarquia/hierarquia-util';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipo-dispositivo';
import { getEvento } from '../../event';
import { StateType } from '../../state';
import { adicionarElementoAction } from '../action/elementoActions';

export const textoFoiModificado = (atual: Dispositivo, action: any, state?: any): boolean => {
  if (state && state.ui?.events) {
    const ev = getEvento(state.ui.events, StateType.ElementoModificado);
    if (ev && ev.elementos && ev.elementos[0]?.conteudo?.texto === atual.texto) {
      return true;
    }
  }
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

export const isDesdobramentoAgrupadorAtual = (dispositivo: Dispositivo, tipo: string): boolean => {
  return dispositivo.pai!.tipo === tipo;
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

export const copiaDispositivosParaAgrupadorPai = (pai: Dispositivo, dispositivos: Dispositivo[]): Dispositivo[] => {
  return dispositivos.map(d => {
    const anterior = isArtigo(d) ? getDispositivoAnteriorMesmoTipo(d) : undefined;
    const novo = DispositivoLexmlFactory.create(pai, d.tipo, anterior);
    novo.texto = d.texto;
    novo.numero = d.numero;
    novo.rotulo = d.rotulo;
    novo.mensagens = d.mensagens;
    DispositivoLexmlFactory.copiaFilhos(d, novo);

    d.pai!.removeFilho(d);
    return novo;
  });
};

export const validaFilhos = (validados: Elemento[], filhos: Dispositivo[]): void => {
  filhos.forEach(filho => {
    criaElementoValidadoSeNecessario(validados, filho);
    filhos ? validaFilhos(validados, filho.filhos) : undefined;
  });
};
