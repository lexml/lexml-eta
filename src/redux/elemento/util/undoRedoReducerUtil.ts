import { atualizaTextoElemento } from './../reducer/atualizaTextoElemento';
import { Articulacao, Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../../model/dispositivo/situacao';
import { isArticulacao, isArtigo } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, getDispositivoFromElemento, isElementoDispositivoAlteracao } from '../../../model/elemento/elementoUtil';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  buscaDispositivoById,
  findDispositivoByUuid,
  getDispositivoAnterior,
  getTiposAgrupadorArtigoOrdenados,
  getUltimoFilho,
  isArticulacaoAlteracao,
  isSuprimido,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoNovo } from '../../../model/lexml/situacao/dispositivoNovo';
import { DispositivoOriginal } from '../../../model/lexml/situacao/dispositivoOriginal';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { getEvento } from '../evento/eventosUtil';
import { getDispositivoCabecaAlteracao, isDispositivoAlteracao, isUltimaAlteracao, hasEmenta } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import {
  existeRevisaoCriadaPorExclusao,
  findRevisaoDeExclusaoComElementoAnteriorApontandoPara,
  findUltimaRevisaoDoGrupo,
  getElementosFromRevisoes,
  isRevisaoPrincipal,
  removeAtributosDoElementoAnteriorNaSequenciaDeLeitura,
} from './revisaoUtil';
import { retornaEstadoAtualComMensagem } from './stateReducerUtil';
import { removeElemento } from '../reducer/removeElemento';

const getTipoSituacaoByDescricao = (descricao: string): TipoSituacao => {
  switch (descricao) {
    case DescricaoSituacao.DISPOSITIVO_ADICIONADO:
      return new DispositivoAdicionado();
    case DescricaoSituacao.DISPOSITIVO_NOVO:
      return new DispositivoNovo();
    default:
      return new DispositivoOriginal();
  }
};

const getDispositivoPaiFromElemento = (articulacao: Articulacao, elemento: Partial<Elemento>): Dispositivo | null => {
  if (isElementoDispositivoAlteracao(elemento)) {
    const artigo = isArticulacaoAlteracao(articulacao)
      ? articulacao.pai!
      : findDispositivoByUuid(articulacao, elemento.hierarquia!.pai!.uuidAlteracao!) || buscaDispositivoById(articulacao, elemento.hierarquia!.pai!.lexmlId!);

    if (artigo) {
      if (!artigo.alteracoes) {
        artigo!.alteracoes = createArticulacao();
        artigo.alteracoes.pai = artigo;
      }
      if (elemento.hierarquia!.pai!.tipo! === TipoDispositivo.articulacao.tipo) {
        return artigo.alteracoes;
      }
      return findDispositivoByUuid(artigo.alteracoes, elemento.hierarquia!.pai!.uuid!) || buscaDispositivoById(artigo.alteracoes, elemento.hierarquia!.pai!.lexmlId!) || null;
    }
  }
  return findDispositivoByUuid(articulacao, elemento.hierarquia!.pai!.uuid!) || buscaDispositivoById(articulacao, elemento.hierarquia!.pai!.lexmlId!) || null;
};

const isOmissisCaput = (elemento: Elemento): boolean => {
  return elemento.tipo === TipoDispositivo.omissis.tipo && elemento.tipoOmissis === 'inciso-caput';
};

const redodDispositivoExcluido = (elemento: Elemento, pai: Dispositivo, modo: string | undefined): Dispositivo => {
  const novo = criaDispositivo(
    isArtigo(pai) && (elemento.tipo === TipoDispositivo.inciso.name || isOmissisCaput(elemento)) ? (pai as Artigo).caput! : pai,
    elemento.tipo!,
    undefined,
    elemento.hierarquia!.posicao
  );
  novo.uuid = elemento.uuid;
  novo.uuid2 = elemento.uuid2;
  novo.id = elemento.lexmlId;
  novo!.texto = elemento?.conteudo?.texto ?? '';
  novo!.numero = elemento?.hierarquia?.numero;
  novo.rotulo = elemento?.rotulo;
  novo.mensagens = elemento?.mensagens;
  novo.situacao = getTipoSituacaoByDescricao(elemento!.descricaoSituacao!);
  if (elemento.descricaoSituacao === 'Dispositivo Adicionado') {
    (novo.situacao as DispositivoAdicionado).existeNaNormaAlterada = elemento.existeNaNormaAlterada;
    if (modo) {
      (novo.situacao as DispositivoAdicionado).tipoEmenda = modo as any;
    }
  }
  if (isArtigo(novo)) {
    (novo as Artigo).caput!.situacao = getTipoSituacaoByDescricao(elemento!.descricaoSituacao!);
    if (elemento.norma) {
      createAlteracao(novo);
      (novo as Artigo).alteracoes!.base = elemento.norma;
      novo.alteracoes!.situacao = new DispositivoAdicionado();
      (novo.alteracoes!.situacao as DispositivoAdicionado).tipoEmenda = modo as any;
    }
  }
  return novo;
};

const redoDispositivosExcluidos = (articulacao: any, elementos: Elemento[], modo: string | undefined): Dispositivo[] => {
  const primeiroElemento = elementos.shift();

  const pai = getDispositivoPaiFromElemento(articulacao, primeiroElemento!) || buscaDispositivoById(articulacao, primeiroElemento!.hierarquia!.pai!.lexmlId!);
  const primeiro = redodDispositivoExcluido(primeiroElemento!, pai!, modo);
  const idPrimeiroDispositivo = primeiro.id!;

  const novos: Dispositivo[] = [primeiro];
  elementos?.forEach(filho => {
    const parent =
      filho.hierarquia?.pai === primeiroElemento?.hierarquia?.pai
        ? primeiro.pai!
        : getDispositivoPaiFromElemento(articulacao, filho) || buscaDispositivoById(articulacao, idPrimeiroDispositivo);

    const novo = redodDispositivoExcluido(filho, parent!, modo);
    novos.push(novo);
  });

  return novos;
};

export const incluir = (state: State, evento: StateEvent, novosEvento: StateEvent): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const elemento = evento.elementos[0];
    const procurarElementoAnterior = evento.elementos.some(e => e.elementoAnteriorNaSequenciaDeLeitura);

    const pai = getDispositivoPaiFromElemento(state.articulacao!, elemento!);

    const novos = redoDispositivosExcluidos(state.articulacao, evento.elementos, state.modo);
    pai?.renumeraFilhos();

    if (novosEvento) {
      const posicao = elemento!.hierarquia!.posicao;

      let referencia = posicao === 0 ? (isArticulacao(pai!) && isArticulacaoAlteracao(pai as Articulacao) ? pai!.pai! : pai) : getUltimoFilho(getDispositivoAnterior(novos[0])!);

      if (referencia) {
        referencia = isArticulacao(referencia) && hasEmenta(referencia) ? (referencia as Articulacao).projetoNorma!.ementa! : referencia;
        const dispositivo = getDispositivoFromElemento(state.articulacao!, referencia);
        dispositivo ? (novosEvento.referencia = createElemento(dispositivo!)) : retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Erro inesperado' });
      }
    }

    if (evento.stateType === StateType.ElementoIncluido) {
      novosEvento.referencia = evento.referencia;
    }

    return novos.map(n => createElemento(n, true, procurarElementoAnterior));
  }
  return [];
};

export const remover = (state: State, evento: StateEvent): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    evento.elementos.forEach(el => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, el, true);
      if (dispositivo) {
        const pai = dispositivo.pai!;
        pai.removeFilho(dispositivo);
        pai.renumeraFilhos();
      }
    });
    return evento.elementos;
  }
  return [];
};

export const restaurarSituacao = (state: State, evento: StateEvent, eventoRestaurados: StateEvent, Situacao: any): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    evento.elementos.forEach(el => {
      const d = getDispositivoFromElemento(state.articulacao!, el, true);

      if (Situacao instanceof DispositivoOriginal) {
        d!.numero = d!.situacao.dispositivoOriginal?.numero ?? '';
        d!.rotulo = d!.situacao.dispositivoOriginal?.rotulo ?? '';
        d!.texto = d!.situacao.dispositivoOriginal?.conteudo?.texto ?? '';
        d!.situacao = new DispositivoOriginal();
      } else {
        d!.situacao = new Situacao(createElemento(d!));
      }
      eventoRestaurados.elementos!.push(createElemento(d!));
    });
    return eventoRestaurados.elementos!;
  }
  return [];
};

export const processarModificados = (state: State, evento: StateEvent, isRedo = false): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    let anterior = 0;
    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        if ((isRedo && anterior === dispositivo.uuid) || anterior !== dispositivo.uuid) {
          if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
            if (dispositivo.situacao.dispositivoOriginal!.conteudo!.texto === e.conteudo?.texto) {
              dispositivo.texto = dispositivo.situacao.dispositivoOriginal!.conteudo?.texto ?? '';
              dispositivo.situacao = new DispositivoOriginal();
            } else {
              dispositivo.texto = e.conteudo?.texto ?? '';
            }
          } else {
            if (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
              dispositivo.situacao = new DispositivoModificado(createElemento(dispositivo));
            }
            dispositivo.texto = e.conteudo?.texto ?? '';
          }
          if (dispositivo.alteracoes) {
            dispositivo.alteracoes.base = e.norma;
          }

          if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
            (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada = e.existeNaNormaAlterada;
            if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
              const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivo);
              cabecaAlteracao.notaAlteracao = e.notaAlteracao;
            }
          }

          dispositivo.mensagens = validaDispositivo(dispositivo);
          novosElementos.push(createElemento(dispositivo));
          anterior = dispositivo.uuid!;
        }
      }
    });

    return novosElementos;
  }
  return [];
};

export const processaRenumerados = (state: State, evento: StateEvent): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        novosElementos.push(createElemento(dispositivo!));
      }
    });

    return novosElementos;
  }
  return [];
};

export const processaValidados = (state: State, eventos: StateEvent[]): Elemento[] => {
  const evento = getEvento(eventos, StateType.ElementoValidado);
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const validados: Elemento[] = [];

    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        dispositivo.mensagens = validaDispositivo(dispositivo);
        validados.push(createElemento(dispositivo));
      }
    });
    return validados;
  }
  return [];
};

export const processaSituacoesAlteradas = (state: State, eventos: StateEvent[]): Elemento[] => {
  const elementos: Elemento[] = [];
  eventos
    .filter(ev => ev.stateType === StateType.SituacaoElementoModificada)
    .forEach(ev => {
      ev.elementos?.forEach((el: Elemento) => {
        const dispositivo = getDispositivoFromElemento(state.articulacao!, el, true);
        if (dispositivo) {
          elementos.push(createElemento(dispositivo));
        }
      });
    });
  return elementos;
};

export const isUndoRedoInclusaoExclusaoAgrupador = (eventos: StateEvent[]): boolean => {
  const tiposAgrupadorArtigo = getTiposAgrupadorArtigoOrdenados();
  const eventosFiltrados = eventos.filter(ev => ![StateType.RevisaoAceita, StateType.RevisaoRejeitada, StateType.RevisaoAdicionalRejeitada].includes(ev.stateType));
  return (
    eventosFiltrados.length > 0 &&
    [StateType.ElementoIncluido, StateType.ElementoRemovido].includes(eventosFiltrados[0].stateType) &&
    eventosFiltrados[0].elementos!.length > 0 &&
    tiposAgrupadorArtigo.includes(eventosFiltrados[0].elementos![0].tipo!)
  );
};

export const ajustarAtributosAgrupadorIncluidoPorUndoRedo = (articulacao: Articulacao, eventosFonte: StateEvent[], eventosResultantes: StateEvent[]): void => {
  const refFonteAgrupadorIncluido = eventosFonte[0].elementos![0];
  const agrupadorIncluido = eventosResultantes[0].elementos![0];
  const dispositivo = getDispositivoFromElemento(articulacao, agrupadorIncluido)!;
  dispositivo.texto = refFonteAgrupadorIncluido.conteudo!.texto ?? '';
  dispositivo.numero = refFonteAgrupadorIncluido.numero;
  dispositivo.id = refFonteAgrupadorIncluido.lexmlId;
  dispositivo.rotulo = refFonteAgrupadorIncluido.rotulo;
  eventosResultantes[0].elementos!.length = 0;
  eventosResultantes[0].elementos!.push(createElemento(dispositivo));
};

export const processarRestaurados = (state: State, evento: StateEvent, acao: string): StateEvent => {
  const elementoDeReferencia = evento.elementos![acao === 'UNDO' ? 0 : 1];
  const d = getDispositivoFromElemento(state.articulacao!, elementoDeReferencia, true)!;

  const elementoAntesDeRestaurarSituacao = createElemento(d);
  let stateType: StateType;

  // if (elementoDeReferencia.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
  //   d.situacao = new DispositivoModificado(createElemento(d));
  //   stateType = StateType.ElementoModificado;
  // } else if (elementoDeReferencia.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
  //   d.situacao = new DispositivoSuprimido(createElemento(d));
  //   stateType = StateType.ElementoSuprimido;
  // } else {
  //   d.situacao = new DispositivoOriginal();
  //   stateType = StateType.ElementoRestaurado;
  // }
  if (elementoDeReferencia.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
    d.situacao = new DispositivoModificado(createElemento(d));
    stateType = StateType.ElementoRestaurado;
  } else if (elementoDeReferencia.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
    d.situacao = new DispositivoSuprimido(createElemento(d));
    stateType = StateType.ElementoRestaurado;
  } else {
    d.situacao = new DispositivoOriginal();
    stateType = StateType.ElementoRestaurado;
  }

  d.numero = elementoDeReferencia.numero ?? '';
  d.rotulo = elementoDeReferencia.rotulo ?? '';
  d.texto = elementoDeReferencia.conteudo?.texto ?? '';

  // const elementos = stateType === StateType.ElementoSuprimido ? [createElemento(d)] : [elementoAntesDeRestaurarSituacao, createElemento(d)];
  const elementos = isSuprimido(d) ? [createElemento(d)] : [elementoAntesDeRestaurarSituacao, createElemento(d)];

  return { stateType, elementos };
};

export const processarSuprimidos = (state: State, evento: StateEvent): StateEvent[] => {
  const result: StateEvent[] = [];

  evento.elementos?.forEach(e => {
    const d = getDispositivoFromElemento(state.articulacao!, e, true)!;
    const elementoAntesRestauracao = createElemento(d);
    d.situacao = new DispositivoOriginal();
    result.push({ stateType: StateType.ElementoRestaurado, elementos: [elementoAntesRestauracao, createElemento(d!)] });
  });

  return result;
};

export const processarRevisoesAceitasOuRejeitadas = (state: State, eventos: StateEvent[], stateType: StateType): StateEvent[] => {
  const atualizaReferenciaElementoAnteriorSeNecessario = (revisoesRetornadasParaState: RevisaoElemento[]): void => {
    revisoesRetornadasParaState.filter(isRevisaoPrincipal).forEach(r => {
      const e = r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;
      const revisaoASerAtualizada = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(state.revisoes!, e);
      if (revisaoASerAtualizada) {
        const revisaoRetornada = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(revisoesRetornadasParaState, e);
        const ultimaRevisaoDoGrupo = findUltimaRevisaoDoGrupo(revisoesRetornadasParaState, revisaoRetornada!);

        const elementoAnterior = JSON.parse(JSON.stringify(ultimaRevisaoDoGrupo.elementoAposRevisao));
        removeAtributosDoElementoAnteriorNaSequenciaDeLeitura(elementoAnterior);
        revisaoASerAtualizada.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = elementoAnterior;
        revisaoASerAtualizada.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = elementoAnterior;
      }
    });
  };

  const result: StateEvent[] = [];
  const eventosFiltrados = eventos.filter((se: StateEvent) => se.stateType === stateType);
  if (eventosFiltrados.length) {
    eventosFiltrados.forEach((ev: StateEvent) => {
      const revisoesRetornadasParaState = ev.elementos!.map(e => e.revisao! as RevisaoElemento);
      state.revisoes!.push(...revisoesRetornadasParaState);

      result.push({ stateType: ev.stateType, elementos: ev.elementos });

      if (stateType === StateType.RevisaoRejeitada) {
        atualizaDispositivosComTextoModificado(state, revisoesRetornadasParaState);
      }

      if (existeRevisaoCriadaPorExclusao(revisoesRetornadasParaState)) {
        const elementos = revisoesRetornadasParaState.map(r => r.elementoAntesRevisao as Elemento);
        if (stateType === StateType.RevisaoAdicionalRejeitada) {
          elementos.forEach(e => removeElemento({ ...state, emRevisao: false }, { atual: e }));
        }

        if (stateType === StateType.RevisaoAceita) {
          result.push({ stateType: StateType.ElementoIncluido, elementos: elementos });
          result.push({ stateType: StateType.ElementoMarcado, elementos: [elementos[0]] });
        }

        atualizaReferenciaElementoAnteriorSeNecessario(revisoesRetornadasParaState);
      } else {
        const elementos = getElementosFromRevisoes(revisoesRetornadasParaState, state);
        result.push({ stateType: StateType.SituacaoElementoModificada, elementos: elementos });
      }
    });
  }
  return result;
};

export const isUndoRevisaoRejeitada = (eventos: StateEvent[]): boolean => eventos.some(ev => ev.stateType === StateType.RevisaoRejeitada);

const atualizaDispositivosComTextoModificado = (state: State, revisoes: RevisaoElemento[]): void => {
  revisoes
    .filter(r => r.stateType === StateType.ElementoModificado)
    .forEach(r => {
      const tempState = { ...state, past: [], future: [], present: [] };
      atualizaTextoElemento(tempState, { atual: r.elementoAposRevisao });
    });
};
