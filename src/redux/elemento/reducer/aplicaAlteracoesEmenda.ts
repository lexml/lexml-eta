import { createElemento } from '../../../model/elemento/elementoUtil';
import { AlteracoesEmenda, DispositivoAdicionadoPelaEmenda } from '../../../model/emenda/alteracoesEmenda';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { buildId } from '../../../model/lexml/util/idUtil';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';

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

const processaDispositivosAdicionados = (state: any, alteracoesEmenda: AlteracoesEmenda): StateEvent[] => {
  const eventos: StateEvent[] = [];

  const mapa = criaMapaElementosIncluidos(alteracoesEmenda);

  for (const value of mapa.values()) {
    eventos.push(criaEventoElementosIncluidos(state, value));
  }

  return eventos;
};

const criaEventoElementosIncluidos = (state: any, dispositivosAdicionados: DispositivoAdicionadoPelaEmenda[]): StateEvent => {
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
        novo = criaDispositivo(d.pai!, d.tipo, d);
        evento.referencia = createElemento(d);
      }
    }
    if (dispositivo.idPai) {
      const d = buscaDispositivoById(state.articulacao, dispositivo.idPai);

      if (d) {
        novo = criaDispositivo(d!, dispositivo.tipo!, undefined, 0);
        evento.referencia = createElemento(novo.pai);
      }
    }

    if (novo) {
      novo.situacao = new DispositivoAdicionado();
      novo.rotulo = dispositivo.rotulo;
      novo.texto = dispositivo.texto;
      novo.lexmlId = buildId(novo);
      evento.elementos?.push(createElemento(novo));
    }
  });

  return evento;
};

const IsFilhoUltimoProcessado = (idAtual: string, idAnterior: string): boolean => {
  return idAnterior === idAtual.substring(0, idAtual.lastIndexOf('_'));
};

const IsIrmaoUltimoProcessado = (idAtual: string, idAnterior: string): boolean => {
  return idAnterior.substring(0, idAnterior.lastIndexOf('_')) === idAtual.substring(0, idAtual.lastIndexOf('_'));
};

const criaNovaEntradaNoMapa = (mapa: Map<string, DispositivoAdicionadoPelaEmenda[]>, dispositivo: DispositivoAdicionadoPelaEmenda): void => {
  mapa.set(dispositivo.id, [dispositivo]);
};

const criaMapaElementosIncluidos = (alteracoesEmenda: AlteracoesEmenda): Map<string, []> => {
  const mapaElementosIncluidos = new Map();

  alteracoesEmenda.dispositivosAdicionados?.forEach((d, index) => {
    if (index === 0) {
      criaNovaEntradaNoMapa(mapaElementosIncluidos, d);
    } else {
      const ultimoProcessado = alteracoesEmenda.dispositivosAdicionados![index - 1];

      if (IsFilhoUltimoProcessado(d.id, ultimoProcessado.id) || IsIrmaoUltimoProcessado(d.id, ultimoProcessado.id)) {
        mapaElementosIncluidos.get(ultimoProcessado).push(d);
      } else {
        criaNovaEntradaNoMapa(mapaElementosIncluidos, d);
      }
    }
  });

  return mapaElementosIncluidos;
};
