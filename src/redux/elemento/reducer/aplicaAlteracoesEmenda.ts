import { ClassificacaoDocumento } from './../../../model/documento/classificacao';
import { isCaput } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { createAlteracao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoCabecaAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { buildId } from '../../../model/lexml/util/idUtil';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia, getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { Articulacao, Artigo, Dispositivo } from './../../../model/dispositivo/dispositivo';
import { isArticulacao, isOmissis } from './../../../model/dispositivo/tipo';
import { DispositivoEmendaAdicionado, DispositivosEmenda } from './../../../model/emenda/emenda';
import { getDispositivoAnteriorMesmoTipo, isArticulacaoAlteracao, percorreHierarquiaDispositivos } from './../../../model/lexml/hierarquia/hierarquiaUtil';

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
  return alteracoesEmenda.dispositivosAdicionados.map(da => criaEventoElementosIncluidos(state, da));
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
      const dispositivoAnterior = getDispositivoAnteriorMesmoTipo(novo);
      let pai = isCaput(novo!.pai!) ? novo!.pai!.pai : novo.pai;
      pai = isArticulacaoAlteracao(pai!) ? buscaDispositivoById(state.articulacao, pai!.pai!.id!) : pai;
      evento.referencia = createElemento(referenciaAjustada(dispositivoAnterior || pai!, novo));
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
        novo = criaDispositivo(d, da.tipo);
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
    novo.id = da.id;
    const situacao = new DispositivoAdicionado();
    situacao.tipoEmenda = modo;
    novo.situacao = situacao;
    if (da.existeNaNormaAlterada !== undefined) {
      situacao.existeNaNormaAlterada = !!da.existeNaNormaAlterada;
    }

    if (!isCaput(novo) && !isOmissis(novo) && !isArticulacao(novo)) {
      novo.createNumeroFromRotulo(da.rotulo!);
      if (da.abreAspas) {
        novo.rotulo = da.rotulo;
        novo.cabecaAlteracao = true;
      } else {
        novo.rotulo = da.rotulo;
      }
    }

    if (!isArticulacao(novo)) {
      if (da.fechaAspas) {
        novo.texto = da.texto + '';
        const cabecaAlteracao = getDispositivoCabecaAlteracao(novo);
        cabecaAlteracao.notaAlteracao = da.notaAlteracao;
      } else {
        novo.texto = da.texto!;
      }
    }
  }

  if (novo && da.filhos) {
    da.filhos.forEach((f, i) => {
      if (i === 0) {
        f.idPai = da.id;
      } else {
        f.idIrmaoAnterior = da.filhos![i - 1].id;
      }
      criaArvoreDispositivos(articulacao, f, modo);
    });
  }

  return novo;
};

const idSemCpt = (id: string): string => id.replace(/(_cpt)$/, '');
