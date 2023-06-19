import { isAgrupador, isArticulacao, isCaput, isOmissis } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { createAlteracao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import {
  buscaDispositivoById,
  findDispositivoByUuid2,
  getDispositivoCabecaAlteracao,
  getTiposAgrupadorArtigoOrdenados,
  hasEmenta,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { buildId } from '../../../model/lexml/util/idUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { Counter } from '../../../util/counter';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { isRevisaoDeExclusao, isRevisaoElemento, isRevisaoPrincipal } from '../util/revisaoUtil';
import { Articulacao, Artigo, Dispositivo } from './../../../model/dispositivo/dispositivo';
import { ClassificacaoDocumento } from './../../../model/documento/classificacao';
import { getDispositivoFromElemento } from './../../../model/elemento/elementoUtil';
import { DispositivoEmendaAdicionado, DispositivosEmenda } from './../../../model/emenda/emenda';
import { isArticulacaoAlteracao, percorreHierarquiaDispositivos, getIrmaoAnteriorIndependenteDeTipo } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { agrupaElemento } from './agrupaElemento';

export const aplicaAlteracoesEmenda = (state: any, action: any): State => {
  const retorno: State = {
    articulacao: state.articulacao,
    modo: state.modo,
    past: [],
    present: [],
    future: [],
    ui: {
      events: [],
      alertas: [],
    },
    revisoes: [],
    emRevisao: state.emRevisao,
  };

  const eventos = new Eventos();

  if (action.alteracoesEmenda.dispositivosSuprimidos) {
    eventos.add(StateType.ElementoSuprimido, []);

    action.alteracoesEmenda.dispositivosSuprimidos.forEach(dispositivo => {
      const d = buscaDispositivoById(state.articulacao, dispositivo.id);

      if (d) {
        percorreHierarquiaDispositivos(d, d => {
          d.situacao = new DispositivoSuprimido(createElemento(d));
          eventos.get(StateType.ElementoSuprimido).elementos?.push(createElemento(d));
        });
      }
    });
  }

  if (action.alteracoesEmenda.dispositivosModificados) {
    eventos.add(StateType.ElementoModificado, []);

    action.alteracoesEmenda.dispositivosModificados.forEach(dispositivo => {
      const d = buscaDispositivoById(state.articulacao, dispositivo.tipo === 'Caput' ? idSemCpt(dispositivo.id) : dispositivo.id);

      if (d) {
        d.situacao = new DispositivoModificado(createElemento(d));
        d.texto = dispositivo.texto;
        eventos.get(StateType.ElementoModificado).elementos?.push(createElemento(d));
      }
    });
  }

  if (action.alteracoesEmenda.dispositivosAdicionados) {
    eventos.eventos.push(...processaDispositivosAdicionados(state, action.alteracoesEmenda));
  }

  if (action.revisoes?.length) {
    eventos.eventos.push(...processaRevisoes(retorno, action.revisoes));
    retorno.emRevisao = true;
  }

  retorno.ui!.events = eventos.build();

  const elementosInseridos: Elemento[] = [];
  retorno.ui!.events.filter(stateEvent => stateEvent.stateType === StateType.ElementoIncluido).forEach(se => elementosInseridos.push(...se.elementos!));

  retorno.ui!.events.push({
    stateType: StateType.SituacaoElementoModificada,
    elementos: getElementosAlteracaoASeremAtualizados(state.articulacao, elementosInseridos),
  });

  return retorno;
};

const processaDispositivosAdicionados = (state: any, alteracoesEmenda: DispositivosEmenda): StateEvent[] => {
  const tiposAgrupadorArtigo = getTiposAgrupadorArtigoOrdenados();
  const eventos: StateEvent[] = [];

  for (const da of alteracoesEmenda.dispositivosAdicionados) {
    if (tiposAgrupadorArtigo.includes(da.tipo)) {
      eventos.push(...criaEventosParaDispositivoAgrupador(state, da));
    } else {
      eventos.push(criaEventoElementosIncluidos(state, da));
    }
  }

  return eventos;
};

const isPrimeiroDispositivoEmAlteracaoDeNorma = (ref: Dispositivo, dea: DispositivoEmendaAdicionado): boolean => {
  return !isDispositivoAlteracao(ref) && isEmendaEmAlteracaoDeNorma(dea);
};

const isEmendaEmAlteracaoDeNorma = (dea: DispositivoEmendaAdicionado): boolean => {
  return dea.id.split('_').some(p => p.startsWith('alt'));
};

const criaEventosParaDispositivoAgrupador = (state: any, dea: DispositivoEmendaAdicionado): StateEvent[] => {
  const articulacao = state.articulacao;
  let ref = buscaDispositivoById(state.articulacao, dea.idPosicaoAgrupador!)!;
  let posicao = 'depois';

  // Solução de contorno para emendas com adição de artigo que altera norma vigente e com agrupadores adicionados na alteração.
  if (buscaDispositivoById(state.articulacao, dea.id)) {
    return [];
  }
  // ---------------------------------------------------------------------------

  if (ref) {
    if (isArticulacao(ref) && !isArticulacaoAlteracao(ref) && hasEmenta(ref)) {
      ref = (ref as Articulacao).projetoNorma!.ementa!;
    } else if (isPrimeiroDispositivoEmAlteracaoDeNorma(ref, dea)) {
      ref = ref.alteracoes!.filhos[0];
      posicao = 'antes';
    }

    const atual = createElemento(ref);

    const manterNoMesmoGrupoDeAspas = !dea.abreAspas || !dea.fechaAspas;
    const tempState = agrupaElemento(state, { atual, novo: { tipo: dea.tipo, posicao, manterNoMesmoGrupoDeAspas, rotulo: dea.rotulo }, isAbrindoEmenda: true });
    const events = tempState.ui!.events.filter(ev => ev.stateType !== StateType.ElementoMarcado);

    const elementosIncluidos = events.find(e => e.stateType === StateType.ElementoIncluido)!.elementos!;
    const novoAgrupador = elementosIncluidos[0];

    const novo = getDispositivoFromElemento(articulacao, novoAgrupador)!;

    ajustaAtributosDispositivoAdicionado(novo, dea, ClassificacaoDocumento.EMENDA);

    elementosIncluidos.length = 0;
    elementosIncluidos.push(createElemento(novo));

    return events;
  }

  return [];
};

const criaEventoElementosIncluidos = (state: any, dispositivo: DispositivoEmendaAdicionado): StateEvent => {
  const evento: StateEvent = {
    stateType: StateType.ElementoIncluido,
    referencia: undefined,
    pai: undefined,
    elementos: [],
  };

  const novo = criaArvoreDispositivos(state.articulacao, dispositivo, state.modo);

  if (novo) {
    if (novo.rotulo) {
      novo.createNumeroFromRotulo(novo.rotulo);
    }

    if (!evento.referencia) {
      const dispositivoAnterior = getIrmaoAnteriorIndependenteDeTipo(novo);
      let pai = isCaput(novo!.pai!) ? novo!.pai!.pai : novo.pai;
      pai = isArticulacaoAlteracao(pai!) ? buscaDispositivoById(state.articulacao, pai!.pai!.id!) : pai;
      if (dispositivo.idPai && isAgrupador(pai!)) {
        evento.referencia = createElemento(pai!);
      } else {
        evento.referencia = createElemento(referenciaAjustada(dispositivoAnterior || pai!, novo));
      }
    }

    percorreHierarquiaDispositivos(novo, d => {
      if (!isCaput(d) && !isArticulacaoAlteracao(d)) {
        const novoEl = createElemento(d);
        novoEl.lexmlId = buildId(d);
        evento.elementos?.push(novoEl);
      }
    });
  }

  return evento;
};

const referenciaAjustada = (referencia: Dispositivo, dispositivo: Dispositivo): Dispositivo => {
  const ref = ajustaReferencia(referencia, dispositivo);
  return ref.id !== dispositivo.id ? ref : dispositivo.pai!.filhos[dispositivo.pai!.filhos.length - 2];
};

const criaArvoreDispositivos = (articulacao: Articulacao, da: DispositivoEmendaAdicionado, modo: ClassificacaoDocumento): Dispositivo | undefined => {
  let novo: Dispositivo | undefined;

  const ehCaput = da.tipo === 'Caput';

  if (da.idIrmaoAnterior) {
    const d = buscaDispositivoById(articulacao, idSemCpt(da.idIrmaoAnterior));

    if (d) {
      if (d.id === da.idIrmaoAnterior) {
        novo = criaDispositivo(d.pai!, da.tipo, d);
      } else {
        // Entra aqui quando dispositivo é do tipo "Paragrafo" e irmão anterior procurado é o "Caput" do artigo
        // Nesse caso, "d" já é o "Artigo" que será "pai" do novo dispositivo
        // Em outras palavras: quando o idIrmaoAnterior é de "caput" a função "buscaDispositivoById" traz o artigo
        novo = criaDispositivo(d, da.tipo, undefined, 0);
      }
    }
  } else if (da.idPai) {
    const d = buscaDispositivoById(articulacao, idSemCpt(da.idPai));

    if (d) {
      if ((da.tipo === 'Inciso' || da.tipo === 'Omissis') && d.tipo === 'Artigo') {
        novo = criaDispositivo((d as Artigo).caput!, da.tipo, undefined, 0);
      } else if (ehCaput) {
        d.texto = da.texto ?? '';
        novo = (d as Artigo).caput!;
      } else if (da.tipo === 'Alteracao') {
        createAlteracao(d);
        novo = d.alteracoes!;
        d.alteracoes!.id = da.id;
        d.alteracoes!.base = da.urnNormaAlterada;
      } else {
        novo = criaDispositivo(d, da.tipo, undefined, 0);
        novo.texto = da.texto ?? '';
      }
    }
  } else {
    novo = criaDispositivo(articulacao, da.tipo, undefined, 0);
  }

  if (novo) {
    ajustaAtributosDispositivoAdicionado(novo, da, modo);
  }

  if (novo && da.filhos) {
    da.filhos.forEach((f, i) => {
      if (i === 0) {
        f.idPai = da.id;
        f.id = corrigeIdDispositivoSeNecessario(f.id, da.id);
      } else {
        f.idIrmaoAnterior = da.filhos![i - 1].id;
      }
      criaArvoreDispositivos(articulacao, f, modo);
    });
  }

  return novo;
};

// O código abaixo é necessário para permitir abertura de emendas que foram salvas com o id incorreto (no caput de artigos em alteração de norma).
// Novas emendas não terão esse problema.
const corrigeIdDispositivoSeNecessario = (id: string, idPai: string): string => {
  return id.startsWith(idPai) ? id : idPai.split('_').slice(0, -1).join('_') + '_' + id;
};

const ajustaAtributosDispositivoAdicionado = (dispositivo: Dispositivo, da: DispositivoEmendaAdicionado, modo: ClassificacaoDocumento): void => {
  dispositivo.texto = da.texto ?? '';
  dispositivo.id = da.id;
  if (da.uuid2) {
    dispositivo.uuid2 = da.uuid2;
  }
  const situacao = new DispositivoAdicionado();
  situacao.tipoEmenda = modo;
  dispositivo.situacao = situacao;
  if (dispositivo.isDispositivoAlteracao) {
    situacao.existeNaNormaAlterada = !!da.existeNaNormaAlterada;
  }

  if (!isCaput(dispositivo) && !isOmissis(dispositivo) && !isArticulacao(dispositivo)) {
    dispositivo.createNumeroFromRotulo(da.rotulo!);
    dispositivo.rotulo = da.rotulo;
    if (da.abreAspas) {
      dispositivo.cabecaAlteracao = true;
    }
  }

  if (!isArticulacao(dispositivo)) {
    dispositivo.texto = da.texto ?? '';
    if (da.fechaAspas) {
      const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivo);
      cabecaAlteracao.notaAlteracao = da.notaAlteracao;
    }
  }
};

const idSemCpt = (id: string): string => id.replace(/(_cpt)$/, '');

const processaRevisoes = (state: State, revisoes: Revisao[]): StateEvent[] => {
  const result: StateEvent[] = [];
  const elementosExcluidosEmModoDeRevisao: Elemento[] = [];
  let elementoAnterior: Elemento;

  revisoes.forEach(r => {
    if (isRevisaoElemento(r)) {
      const rAux = r as RevisaoElemento;
      if (isRevisaoDeExclusao(rAux)) {
        let e: Elemento | undefined;
        if (isRevisaoPrincipal(rAux)) {
          let d = findDispositivoByUuid2(state.articulacao!, rAux.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!.uuid2!);
          d = d || buscaDispositivoById(state.articulacao!, idSemCpt(rAux.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!.lexmlId!)) || null;
          // TODO: O código abaixo não trata exclusões intercaladas. Alterar para tratar.
          e = d ? createElemento(d) : elementoAnterior;
        } else {
          e = elementoAnterior;
        }

        rAux.elementoAposRevisao.uuid = Counter.next();
        rAux.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(e));
        // atualizarDadosPai(state.articulacao!, rAux.elementoAposRevisao);

        rAux.elementoAntesRevisao!.uuid = rAux.elementoAposRevisao.uuid;
        rAux.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(e));
        // atualizarDadosPai(state.articulacao!, rAux.elementoAntesRevisao!);

        elementosExcluidosEmModoDeRevisao.push(rAux.elementoAposRevisao as Elemento);
        elementoAnterior = rAux.elementoAposRevisao as Elemento;
      } else {
        const d = buscaDispositivoById(state.articulacao!, rAux.elementoAposRevisao.lexmlId!)!;
        rAux.elementoAposRevisao.uuid = d.uuid;
        if ([MOVER_ELEMENTO_ABAIXO, MOVER_ELEMENTO_ACIMA].includes(rAux.actionType)) {
          rAux.elementoAntesRevisao!.uuid = Counter.next();
        } else if (rAux.stateType !== StateType.ElementoIncluido) {
          rAux.elementoAntesRevisao!.uuid = d.uuid;
        }
      }
    }
    state.revisoes?.push(r);
  });

  result.push({ stateType: StateType.ElementoIncluido, elementos: elementosExcluidosEmModoDeRevisao });
  return result;
};

// const getElementoPai = (articulacao: Articulacao, elemento: Elemento): Elemento => {
//   const partesId = elemento.lexmlId!.split('_');
//   partesId.pop();
//   if (!partesId.length) {
//     // articulacao
//   } else {
//     const idPai = idSemCpt(partesId.join('_'));
//     const d = buscaDispositivoById(articulacao, idPai);
//     elemento.hierarquia!.pai!.uuid = d!.uuid;
//     elemento.hierarquia!.pai!.uuid2 = d!.uuid2;
//     elemento.hierarquia!.pai!.
//   }

//   return elemento;
// };
