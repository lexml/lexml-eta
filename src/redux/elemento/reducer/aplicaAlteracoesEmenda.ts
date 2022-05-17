import { createElemento } from '../../../model/elemento/elementoUtil';
import { createAlteracao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { buildId } from '../../../model/lexml/util/idUtil';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia } from '../util/reducerUtil';
import { Artigo, Dispositivo } from './../../../model/dispositivo/dispositivo';
import { DispositivoEmendaAdicionado, DispositivosEmenda } from './../../../model/emenda/emenda';
import { getDispositivoAnteriorMesmoTipo } from './../../../model/lexml/hierarquia/hierarquiaUtil';

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

  eventos.push(criaEventoElementosIncluidos(state, alteracoesEmenda.dispositivosAdicionados));
  return eventos;
};

const criaEventoElementosIncluidos = (state: any, dispositivosAdicionados: DispositivoEmendaAdicionado[]): StateEvent => {
  const evento: StateEvent = {
    stateType: StateType.ElementoIncluido,
    referencia: undefined,
    pai: undefined,
    elementos: [],
  };

  dispositivosAdicionados.forEach(dispositivo => {
    let novo;

    if (dispositivo.idIrmaoAnterior) {
      const d = buscaDispositivoById(
        state.articulacao,
        dispositivo.idIrmaoAnterior.endsWith('cpt') ? dispositivo.idIrmaoAnterior.replace(/(_cpt)$/g, '') : dispositivo.idIrmaoAnterior
      );

      if (d) {
        if (d.tipo === dispositivo.tipo || d.tipo === 'Omissis') {
          novo = criaDispositivo(d.pai!, dispositivo.tipo, d);
        } else {
          // Entra aqui quando dispositivo é do tipo "Paragrafo" e irmão anterior procurado é o "Caput" do artigo
          // Nesse caso, "d" já é o "Artigo" que será "pai" do novo dispositivo
          novo = criaDispositivo(d, dispositivo.tipo);
        }
      }
    } else if (dispositivo.idPai) {
      const d = buscaDispositivoById(state.articulacao, dispositivo.idPai.endsWith('cpt') ? dispositivo.idPai.replace(/(_cpt)$/g, '') : dispositivo.idPai);

      if (d) {
        if ((dispositivo.tipo === 'Inciso' || dispositivo.tipo === 'Omissis') && d.tipo === 'Artigo') {
          novo = criaDispositivo((d as Artigo).caput!, dispositivo.tipo);
        } else if (dispositivo.tipo === 'Caput') {
          d.texto = dispositivo.texto ?? '';
          evento.elementos![evento.elementos!.length - 1].conteudo!.texto = d.texto;
        } else if (dispositivo.tipo === 'Alteracao') {
          createAlteracao(d);
          d.alteracoes!.id = dispositivo.id;
          d.alteracoes!.base = dispositivo.urnNormaAlterada;
        } else {
          novo = criaDispositivo(d, dispositivo.tipo);
          novo.texto = dispositivo.texto ?? '';
        }
      }
    } else {
      novo = criaDispositivo(state.articulacao, dispositivo.tipo, undefined, 0);
    }

    if (!evento.referencia) {
      const dispositivoAnterior = getDispositivoAnteriorMesmoTipo(novo);
      const pai = novo.pai.tipo === 'Caput' ? novo.pai.pai : novo.pai;
      evento.referencia = createElemento(referenciaAjustada(dispositivoAnterior || pai, novo));
    }

    if (novo && dispositivo.tipo !== 'Alteracao') {
      novo.id = dispositivo.id;
      const situacao = new DispositivoAdicionado();
      situacao.existeNaNormaAlterada = dispositivo.existeNaNormaAlterada ? dispositivo.existeNaNormaAlterada : undefined;
      novo.situacao = situacao;

      if (dispositivo.abreAspas) {
        novo.rotulo = '\u201C' + dispositivo.rotulo;
        novo.cabecaAlteracao = true;
      } else {
        novo.rotulo = dispositivo.rotulo;
        novo.createNumeroFromRotulo(dispositivo.rotulo);
      }

      if (dispositivo.fechaAspas) {
        novo.notaAlteracao = dispositivo.notaAlteracao;
        novo.texto = dispositivo.texto + `” ${dispositivo.notaAlteracao}`;
      } else {
        novo.texto = dispositivo.texto;
      }

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
