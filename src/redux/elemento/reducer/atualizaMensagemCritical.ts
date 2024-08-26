import { State } from '../../state';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { getDispositivoAndFilhosAsLista, isAdicionado, isModificado, isSuprimido } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { createElementoValidado } from '../../../model/elemento/elementoUtil';

export const atualizaMensagemCritical = (state: State): State => {
  state.mensagensCritical = processaMensagensCriticalElementos(state);
  return state;
};

const processaMensagensCriticalElementos = (state: any): string[] | undefined => {
  if (!state.mensagensCritical) {
    state.mensagensCritical = [];
  }

  let mensagensCritical: Array<string> = state.mensagensCritical;

  let elementos;
  if (state.articulacao) {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao).filter(d => isAdicionado(d) || isSuprimido(d) || isModificado(d));
    elementos = dispositivos.map(d => createElementoValidado(d)).filter(e => e.mensagens?.length); // getElementos(state.articulacao).filter(e => e.mensagens.length > 0);
  }

  if (elementos) {
    for (let index = 0; index < elementos.length; index++) {
      const element = elementos[index];

      for (let index = 0; index < element!.mensagens!.length; index++) {
        const mensagem = element!.mensagens![index];
        if (mensagem.tipo === TipoMensagem.CRITICAL) {
          if (mensagem!.descricao!.includes('Não foi informado um texto para')) {
            mensagensCritical.push('Existem dispositivos sem texto informado.');
          } else if (mensagem!.descricao!.includes('Numere o dispositivo')) {
            mensagensCritical.push('Existem dispositivos de norma alterada sem numeração informada.');
          } else {
            mensagensCritical.push(mensagem!.descricao!);
          }
        }
      }
    }
  }

  mensagensCritical = [...new Set(mensagensCritical)];

  return mensagensCritical;
};
