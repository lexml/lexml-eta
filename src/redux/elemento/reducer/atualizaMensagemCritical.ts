import { State } from '../../state';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { getDispositivoAndFilhosAsLista, isAdicionado, isModificado, isSuprimido } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { createElementoValidado } from '../../../model/elemento/elementoUtil';

export const atualizaMensagemCritical = (state: State): State => {
  state.mensagensCritical = processaMensagensCritialElementos(state);
  return state;
};

const processaMensagensCritialElementos = (state: any): string[] | undefined => {
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

  //const mensagensCriticalUnificadas = unificaMensagemCritical(mensagensCritical);
  mensagensCritical = [...new Set(mensagensCritical)];

  return mensagensCritical;
};

// const unificaMensagemCritical = (mensagensCritical: any): any[] => {
//   let mensagensDuplicadas = getMensagensDuplicadas(mensagensCritical, 'Não foi informado um texto', 'Existem dispositivos sem texto informado.');
//   mensagensDuplicadas = getMensagensDuplicadas(mensagensCritical, 'Numere o dispositivo', 'Existem dispositivos de norma alterada sem numeração informada.');
//   return mensagensDuplicadas;
// };

// const getMensagensDuplicadas = (mensagensCritical: any, valor: string, replace: string): any => {
//   const novaLista = mensagensCritical.map(item => {
//     if (item.includes(valor)) {
//       return replace;
//     }
//     return item;
//   });

//   return novaLista;
// };
