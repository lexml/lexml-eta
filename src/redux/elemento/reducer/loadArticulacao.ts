import { configurarPaginacao } from '../util/paginacaoUtil';
import { DispositivoBloqueado, LexmlEmendaParametrosEdicao } from '../../../components/lexml-emenda.component';
import { Articulacao } from '../../../model/dispositivo/dispositivo';
import { getElementos } from '../../../model/elemento/elementoUtil';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';

export const load = (articulacao: Articulacao, modo?: string, params?: LexmlEmendaParametrosEdicao): State => {
  articulacao = bloqueiaDispositivos(articulacao, params);
  const elementos = getElementos(articulacao);

  return {
    articulacao,
    modo,
    past: [],
    present: [],
    future: [],
    ui: {
      events: [
        {
          stateType: StateType.DocumentoCarregado,
          elementos: elementos,
        },
      ],
      alertas: [],
      paginacao: configurarPaginacao(articulacao, params?.configuracaoPaginacao),
    },
    revisoes: [],
    numEventosPassadosAntesDaRevisao: 0,
  };
};

const bloqueiaDispositivos = (articulacao: Articulacao, params?: LexmlEmendaParametrosEdicao): Articulacao => {
  const dispositivosBloqueados = getDispositivosBloqueados(params);

  dispositivosBloqueados?.forEach(db => {
    const dispositivo = buscaDispositivoById(articulacao, db.lexmlId);

    if (dispositivo) {
      if (db.bloquearFilhos) {
        getDispositivoAndFilhosAsLista(dispositivo).forEach(d => (d.bloqueado = true));
      } else {
        getDispositivoAndFilhosAsLista(dispositivo).forEach(d => (d.bloqueado = false));
        dispositivo.bloqueado = true;
      }
    }
  });

  return articulacao;
};

const getDispositivosBloqueados = (params?: LexmlEmendaParametrosEdicao): DispositivoBloqueado[] | undefined => {
  return params?.dispositivosBloqueados?.map(v => ({
    lexmlId: (v as DispositivoBloqueado).lexmlId ?? v,
    bloquearFilhos: (v as DispositivoBloqueado).bloquearFilhos ?? true,
  }));
};
