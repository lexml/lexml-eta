import { buildListaDispositivos, createElemento, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { MoverElementoAcima } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { copiaFilhos } from '../../../model/lexml/dispositivo/dispositivoLexmlUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior, getDispositivoAnteriorMesmoTipoInclusiveOmissis } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ajustaReferencia } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const moveElementoAcima = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  if (!isAcaoPermitida(atual, MoverElementoAcima)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir um dispositivo original mas apenas suprimi-lo.' });
  }

  const anterior = getDispositivoAnteriorMesmoTipoInclusiveOmissis(atual);

  if (anterior === undefined) {
    return state;
  }

  const removidos = [...getElementos(anterior), ...getElementos(atual)];
  const renumerados = listaDispositivosRenumerados(atual);

  const pai = atual.pai!;
  const pos = pai.indexOf(anterior);
  pai.removeFilho(atual);
  pai.removeFilho(anterior);

  const um = criaDispositivo(pai, atual.tipo, undefined, pos);
  um.situacao = atual.situacao;
  um.texto = action.atual.conteudo.texto;
  copiaFilhos(atual, um);

  const outro = criaDispositivo(pai, anterior.tipo, undefined, pos + 1);
  outro.situacao = anterior.situacao;
  outro.texto = anterior.texto;
  copiaFilhos(anterior, outro);
  pai.renumeraFilhos();

  const referencia = pos === 0 ? (um.pai?.tipo === TipoDispositivo.caput.tipo ? pai.pai! : pai) : getDispositivoAnterior(um);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, um)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(um, [])
      .concat(buildListaDispositivos(outro, []))
      .map(v => {
        v.mensagens = validaDispositivo(v);
        return createElemento(v);
      })
  );
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.add(
    StateType.ElementoRenumerado,
    renumerados.map(r => createElemento(r))
  );

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};
