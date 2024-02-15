import { getParagrafosEOmissis, hasEmenta, isArticulacaoAlteracao } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { Articulacao, Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isArticulacao, isArtigo, isCaput, isDispositivoGenerico } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, getDispositivoFromElemento, getElementos } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { AdicionarElemento } from '../../../model/lexml/acao/adicionarElementoAction';
import { hasIndicativoDesdobramento } from '../../../model/lexml/conteudo/conteudoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnteriorMesmoTipo,
  getDispositivoCabecaAlteracao,
  getUltimoFilho,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Counter } from '../../../util/counter';
import { StateType } from '../../state';
import { getEvento } from '../evento/eventosUtil';

export const textoFoiModificado = (atual: Dispositivo, action: any, state?: any): boolean => {
  if (state && state.ui?.events) {
    const ev = getEvento(state.ui.events, StateType.ElementoModificado);
    if (ev && ev.elementos && ev.elementos[0]?.conteudo?.texto === atual.texto) {
      return true;
    }
  }
  return (atual.texto !== '' && action.atual?.conteudo?.texto === '') || (action.atual?.conteudo?.texto && atual.texto.localeCompare(action.atual?.conteudo?.texto) !== 0);
};

export const resetUuidTodaArvore = (dispositivo: Dispositivo): void => {
  dispositivo.uuid = Counter.next();
  dispositivo.filhos?.forEach(f => resetUuidTodaArvore(f));
  dispositivo.alteracoes?.filhos?.forEach(f => resetUuidTodaArvore(f));
};

export const copiaDispositivosParaOutroPai = (pai: Dispositivo, dispositivos: Dispositivo[]): Dispositivo[] => {
  return dispositivos.map(d => {
    const posicaoAtualArtigo = isArtigo(d) ? getArticulacao(d).indexOfArtigo(d) : -1;
    const paiAtual = d.pai;
    const anterior = isArtigo(d) ? getDispositivoAnteriorMesmoTipo(d) : undefined;
    paiAtual?.removeFilho(d);
    d.pai = pai;

    pai.addFilho(d, anterior);

    if (isArtigo(d) && !anterior) {
      const articulacao = getArticulacao(d);
      articulacao.removeArtigo(d);
      articulacao.addArtigoOnPosition(d, posicaoAtualArtigo);
    }

    return d;
  });
};

const isPrimeiroArtigo = (dispositivo: Dispositivo): boolean => {
  return isArtigo(dispositivo) && getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo) === 0;
};

export const isDesdobramentoAgrupadorAtual = (dispositivo: Dispositivo, tipo: string): boolean => {
  return dispositivo.pai!.tipo === tipo;
};

export const ajustaReferencia = (referencia: Dispositivo, dispositivo: Dispositivo): Dispositivo => {
  if (isArticulacao(referencia) && !isArticulacaoAlteracao(referencia) && hasEmenta(referencia)) {
    return (referencia as Articulacao).projetoNorma!.ementa!;
  }

  return isArticulacao(referencia) || (isPrimeiroArtigo(dispositivo) && !isDispositivoAlteracao(dispositivo)) || dispositivo.pai!.indexOf(dispositivo) === 0
    ? referencia
    : isPrimeiroParagrafo(dispositivo)
    ? getUltimoFilho((dispositivo.pai! as Artigo).caput!)
    : getUltimoFilho(referencia);
};

function isPrimeiroParagrafo(dispositivo: Dispositivo): boolean {
  return isArtigo(dispositivo.pai!) && getParagrafosEOmissis(dispositivo.pai! as Artigo).indexOf(dispositivo) === 0;
}

export const naoPodeCriarFilho = (pDispositivo: Dispositivo, action: any): boolean => {
  const dispositivo = isCaput(pDispositivo) ? pDispositivo.pai! : pDispositivo;

  return (
    isDispositivoGenerico(dispositivo) ||
    (hasIndicativoDesdobramento(dispositivo) && !isAcaoPermitida(dispositivo, AdicionarElemento)) ||
    (dispositivo.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto))
  );
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
        lista.push(createElemento(d, true, true));
      }
    } else {
      lista.push(createElemento(d, true, true));
    }
  });
  return lista;
};

export const getElementosAlteracaoASeremAtualizados = (articulacao: Articulacao, elementos: Elemento[]): Elemento[] => {
  const result: Elemento[] = [];
  getDispositivosCabecaAlteracaoFromElementos(articulacao, elementos).forEach(d => result.push(...getElementos(d, true)));
  return result;
};

const getDispositivosCabecaAlteracaoFromElementos = (articulacao: Articulacao, elementos: Elemento[]): Dispositivo[] => {
  const map = new Map();
  elementos.forEach(elemento => {
    const d = getDispositivoFromElemento(articulacao, elemento) || (elemento.hierarquia?.pai && getDispositivoFromElemento(articulacao, elemento.hierarquia.pai));
    if (d && isDispositivoAlteracao(d)) {
      const ca = getDispositivoCabecaAlteracao(d);
      map.set(ca.id, ca);
    }
  });
  return Array.from(map.values());
};
