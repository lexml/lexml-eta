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
  getDispositivoAndFilhosAsLista,
  getDispositivoAnterior,
  getTiposAgrupadorArtigoOrdenados,
  getUltimoFilho,
  isAdicionado,
  isArticulacaoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoNovo } from '../../../model/lexml/situacao/dispositivoNovo';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { getEvento } from '../evento/eventosUtil';
import { getDispositivoCabecaAlteracao, isDispositivoAlteracao, isUltimaAlteracao, hasEmenta } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import {
  associarRevisoesAosElementos,
  existeRevisaoCriadaPorExclusao,
  findRevisaoDeExclusaoComElementoAnteriorApontandoPara,
  findUltimaRevisaoDoGrupo,
  getElementosFromRevisoes,
  isRevisaoPrincipal,
  removeAtributosDoElementoAnteriorNaSequenciaDeLeitura,
} from './revisaoUtil';
import { retornaEstadoAtualComMensagem } from './stateReducerUtil';
import { removeElemento } from '../reducer/removeElemento';
import { buildId } from '../../../model/lexml/util/idUtil';

const getTipoSituacaoByDescricao = (descricao: string): TipoSituacao => {
  switch (descricao) {
    case DescricaoSituacao.DISPOSITIVO_ADICIONADO:
      return new DispositivoAdicionado();
    default:
      return new DispositivoNovo();
  }
};

const getDispositivoPaiFromElemento = (articulacao: Articulacao, elemento: Partial<Elemento>): Dispositivo | null => {
  if (isElementoDispositivoAlteracao(elemento)) {
    const artigo = isArticulacaoAlteracao(articulacao)
      ? articulacao.pai!
      : findDispositivoByUuid(articulacao, elemento.hierarquia!.pai!.uuidAlteracao!) || buscaDispositivoById(articulacao, elemento.hierarquia!.pai!.lexmlId!);

    if (artigo) {
      if (isDispositivoAlteracao(artigo)) {
        return artigo;
      }

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
    novo.existeNaNormaAlterada = elemento.existeNaNormaAlterada;
    if (modo) {
      novo.classificacaoDocumento = modo as any;
    }
  }
  if (isArtigo(novo)) {
    (novo as Artigo).caput!.situacao = getTipoSituacaoByDescricao(elemento!.descricaoSituacao!);
    if (elemento.norma) {
      createAlteracao(novo);
      (novo as Artigo).alteracoes!.base = elemento.norma;
      novo.alteracoes!.situacao = new DispositivoAdicionado();
      novo.alteracoes!.classificacaoDocumento = modo as any;
      novo.alteracoes!.id = buildId(novo.alteracoes!);
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

export const processarModificados = (state: State, evento: StateEvent, operacao: 'UNDO' | 'REDO'): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    let anterior = 0;
    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        const permiteAtualizar = anterior !== dispositivo.uuid || (operacao === 'REDO' && anterior === dispositivo.uuid);
        if (permiteAtualizar) {
          dispositivo.texto = e.conteudo?.texto ?? '';

          if (dispositivo.alteracoes) {
            dispositivo.alteracoes.base = e.norma;
          }

          if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
            dispositivo.existeNaNormaAlterada = e.existeNaNormaAlterada;
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

export const ajustarHierarquivoAgrupadorIncluidoPorUndoRedo = (articulacao: Articulacao, eventosFonte: StateEvent[], eventosResultantes: StateEvent[]): void => {
  const elAgrupador = eventosFonte[0].elementos![0];

  if (!elAgrupador.dispositivoAlteracao || !elAgrupador.ultimoFilhoDireto) {
    return;
  }

  const agrupador = getDispositivoFromElemento(articulacao, elAgrupador)!;
  const pai = agrupador.pai!;
  const ultimoFilhoDireto = getDispositivoFromElemento(articulacao, elAgrupador.ultimoFilhoDireto)!;

  let index = pai.filhos.indexOf(agrupador) + 1;

  while (index < pai.filhos.length) {
    const d = pai.filhos[index];
    if (isAdicionado(d)) {
      pai.removeFilho(d);
      d.pai = agrupador;
      agrupador.addFilho(d);

      if (d.uuid === ultimoFilhoDireto.uuid) {
        break;
      }
    } else {
      index++;
    }
  }

  eventosResultantes.push({ stateType: StateType.SituacaoElementoModificada, elementos: getDispositivoAndFilhosAsLista(agrupador).map(d => createElemento(d)) });
};

export const processarRevisoesAceitasOuRejeitadas = (state: State, eventos: StateEvent[], stateType: StateType): StateEvent[] => {
  const atualizaReferenciaElementoAnteriorSeNecessario = (revisoesRetornadasParaState: RevisaoElemento[]): void => {
    revisoesRetornadasParaState.filter(isRevisaoPrincipal).forEach(r => {
      const e = r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;
      const revisaoASerAtualizada = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(state.revisoes!, e);
      if (revisaoASerAtualizada && revisaoASerAtualizada.id !== r.id) {
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

      if (existeRevisaoCriadaPorExclusao(revisoesRetornadasParaState)) {
        const elementos = revisoesRetornadasParaState.map(r => r.elementoAntesRevisao as Elemento);
        if (stateType === StateType.RevisaoAdicionalRejeitada) {
          elementos.forEach(e => removeElemento({ ...state, emRevisao: false }, { atual: e }));
        }

        // Reapresenta, no editor, os dispositivos removidos em modo de revisão
        if (stateType === StateType.RevisaoAceita) {
          result.push({ stateType: StateType.ElementoIncluido, elementos: elementos });
          result.push({ stateType: StateType.ElementoMarcado, elementos: [elementos[0]] });
        }

        atualizaReferenciaElementoAnteriorSeNecessario(revisoesRetornadasParaState);
      } else {
        const elementos = getElementosFromRevisoes(revisoesRetornadasParaState, state).map(e => JSON.parse(JSON.stringify(e)));
        associarRevisoesAosElementos(state.revisoes, elementos);
        result.push({ stateType: StateType.SituacaoElementoModificada, elementos: elementos });

        if (stateType === StateType.RevisaoAceita) {
          result.push({ stateType: StateType.ElementoMarcado, elementos: [elementos[0]] });
        }
      }
    });
  }
  return result;
};

export const isUndoRedoColarSubstituindo = (eventos: StateEvent[]): boolean => {
  const eventosExclusao = eventos.filter(ev => ev.stateType === StateType.ElementoRemovido);
  const elementosExcluidos = eventosExclusao.flatMap(ev => ev.elementos ?? []);
  if (elementosExcluidos.length === 0) {
    return false;
  }

  const lexmlIdsExcluidos = obterElementosRaiz(elementosExcluidos).map(el => el.lexmlId!);

  const eventosInclusao = eventos.filter(ev => ev.stateType === StateType.ElementoIncluido);
  const elementosIncluidos = eventosInclusao.flatMap(ev => ev.elementos ?? []);
  const lexmlIdsIncluidos = obterElementosRaiz(elementosIncluidos).map(el => el.lexmlId!);

  // Verifica se há interseção entre os IDs dos elementos excluídos e incluídos
  return lexmlIdsExcluidos.some(id => lexmlIdsIncluidos.includes(id));
};

const obterElementosRaiz = (elementos: Elemento[]): Elemento[] => {
  const lexmlIds = elementos.map(el => el.lexmlId!);
  return elementos.filter(el => !lexmlIds.includes(el.hierarquia!.pai!.lexmlId!));
};
