import { Artigo, Dispositivo } from './../../../model/dispositivo/dispositivo';
import { getDispositivoAnteriorMesmoTipo } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoEmendaAdicionado, DispositivosEmenda } from './../../../model/emenda/emenda';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { buildId } from '../../../model/lexml/util/idUtil';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia } from '../util/reducerUtil';

export const aplicaAlteracoesEmenda = (state: any, action: any): State => {
  const retorno: State = {
    articulacao: state.articulacao,
    modo: state.modo,
    past: [],
    present: [],
    future: [],
    ui: {
      events: [],
    },
  };

  const eventos = new Eventos();

  if (action.alteracoesEmenda.dispositivosSuprimidos) {
    eventos.add(StateType.ElementoSuprimido, []);

    action.alteracoesEmenda.dispositivosSuprimidos.forEach(dispositivo => {
      const d = buscaDispositivoById(state.articulacao, dispositivo.id);

      if (d) {
        d.situacao = new DispositivoSuprimido(createElemento(d));
        eventos.get(StateType.ElementoSuprimido).elementos?.push(createElemento(d));
      }
    });
  }

  if (action.alteracoesEmenda.dispositivosModificados) {
    eventos.add(StateType.ElementoModificado, []);

    action.alteracoesEmenda.dispositivosModificados.forEach(dispositivo => {
      const d = buscaDispositivoById(state.articulacao, dispositivo.id);

      if (d) {
        d.situacao = new DispositivoModificado(createElemento(d));
        d.texto = dispositivo.texto;
        eventos.get(StateType.ElementoModificado).elementos?.push(createElemento(d));
      }
    });
  }

  if (action.alteracoesEmenda.dispositivosAdicionados) {
    processaDispositivosAdicionados(state, action.alteracoesEmenda).forEach(e => eventos.eventos.push(e));
  }

  retorno.ui!.events = eventos.build();

  return retorno;
};

const processaDispositivosAdicionados = (state: any, alteracoesEmenda: DispositivosEmenda): StateEvent[] => {
  const eventos: StateEvent[] = [];

  const mapa = criaMapaElementosIncluidos(alteracoesEmenda);

  for (const value of mapa.values()) {
    eventos.push(criaEventoElementosIncluidos(state, value));
  }

  return eventos;
};

const criaEventoElementosIncluidos = (state: any, dispositivosAdicionados: DispositivoEmendaAdicionado[]): StateEvent => {
  const evento: StateEvent = {
    stateType: StateType.ElementoIncluido,
    referencia: undefined,
    pai: undefined,
    posicao: undefined,
    elementos: [],
  };

  dispositivosAdicionados.forEach(dispositivo => {
    let novo;

    if (dispositivo.idIrmaoAnterior) {
      const d = buscaDispositivoById(state.articulacao, dispositivo.idIrmaoAnterior);

      if (d) {
        if (d.tipo === dispositivo.tipo) {
          novo = criaDispositivo(d.pai!, dispositivo.tipo, d);
        } else {
          // Entra aqui quando dispositivo é do tipo "Paragrafo" e irmão anterior procurado é o "Caput" do artigo
          // Nesse caso, "d" já é o "Artigo" que será "pai" do novo dispositivo
          novo = criaDispositivo(d, dispositivo.tipo);
        }
      }
    } else if (dispositivo.idPai) {
      const d = buscaDispositivoById(state.articulacao, dispositivo.idPai);

      if (d) {
        if (dispositivo.tipo === 'Inciso' && d.tipo === 'Artigo') {
          novo = criaDispositivo((d as Artigo).caput!, dispositivo.tipo);
        } else {
          novo = criaDispositivo(d, dispositivo.tipo);
        }
      }
    } else {
      novo = criaDispositivo(state.articulacao, dispositivo.tipo, undefined, 0);
    }

    novo.id = dispositivo.id;
    if (!evento.referencia) {
      const dispositivoAnterior = getDispositivoAnteriorMesmoTipo(novo);
      const pai = novo.pai.tipo === 'Caput' ? novo.pai.pai : novo.pai;
      evento.referencia = createElemento(referenciaAjustada(dispositivoAnterior || pai, novo));
    }

    if (novo) {
      novo.situacao = new DispositivoAdicionado();
      novo.rotulo = dispositivo.rotulo;
      novo.texto = dispositivo.texto;
      if (novo.tipo !== 'Caput') {
        const novoEl = createElemento(novo);
        novoEl.lexmlId = buildId(novo);
        evento.elementos?.push(novoEl);
      }
    }
  });

  return evento;
};

const referenciaAjustada = (referencia: Dispositivo, dispositivo: Dispositivo): Dispositivo => {
  const ref = ajustaReferencia(referencia, dispositivo);
  return ref.id !== dispositivo.id ? ref : dispositivo.pai!.filhos[dispositivo.pai!.filhos.length - 2];
};

const IsFilhoUltimoProcessado = (idAtual: string, idAnterior: string): boolean => {
  return idAnterior === idAtual.substring(0, idAtual.lastIndexOf('_'));
};

const criaNovaEntradaNoMapa = (mapa: Map<string, DispositivoEmendaAdicionado[]>, dispositivo: DispositivoEmendaAdicionado): void => {
  mapa.set(dispositivo.id, [dispositivo]);
};

const criaMapaElementosIncluidos = (alteracoesEmenda: DispositivosEmenda): Map<string, []> => {
  const mapaElementosIncluidos = new Map();

  alteracoesEmenda.dispositivosAdicionados?.forEach((d, index) => {
    if (index === 0) {
      criaNovaEntradaNoMapa(mapaElementosIncluidos, d);
    } else {
      const tipoDispositivoAnterior = alteracoesEmenda.dispositivosAdicionados[index - 1].tipo;
      const deslocamentoIndex = tipoDispositivoAnterior !== 'Caput' ? 1 : 2;
      const ultimoProcessado = alteracoesEmenda.dispositivosAdicionados[index - deslocamentoIndex];

      if (d.tipo === 'Caput') {
        ultimoProcessado.texto = d.texto;
      }

      if (IsFilhoUltimoProcessado(d.id, ultimoProcessado.id)) {
        mapaElementosIncluidos.get(ultimoProcessado.id).push(d);
      } else {
        criaNovaEntradaNoMapa(mapaElementosIncluidos, d);
      }
    }
  });

  return mapaElementosIncluidos;
};
