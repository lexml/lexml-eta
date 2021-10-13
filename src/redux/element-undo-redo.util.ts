import { Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { isArtigo, TipoDispositivo } from '../model/dispositivo/tipo';
import { Elemento } from '../model/elemento';
import { createElemento, getDispositivoFromElemento } from '../model/elemento/elemento-util';
import { validaDispositivo } from '../model/lexml/dispositivo/dispositivo-validator';
import { DispositivoLexmlFactory } from '../model/lexml/factory/dispositivo-lexml-factory';
import { getDispositivoAnterior } from '../model/lexml/hierarquia/hierarquia-util';
import { TipoMensagem } from '../model/lexml/util/mensagem';
import { retornaEstadoAtualComMensagem } from './elemento-reducer';
import { isElementoDispositivoAlteracao } from './elemento-reducer-util';
import { getEvento } from './eventos';
import { ElementoState, StateEvent, StateType } from './state';

const redodDispositivoExcluido = (elemento: Elemento, pai: Dispositivo): Dispositivo => {
  const novo = DispositivoLexmlFactory.create(
    isArtigo(pai) && elemento.tipo === TipoDispositivo.inciso.name ? (pai as Artigo).caput! : pai,
    elemento.tipo!,
    undefined,
    elemento.hierarquia!.posicao
  );
  novo.uuid = elemento.uuid;
  novo!.texto = elemento?.conteudo?.texto ?? '';
  novo!.numero = elemento?.hierarquia?.numero;
  novo.rotulo = elemento?.rotulo;
  return novo;
};

const redoDispositivosExcluidos = (articulacao: any, elementos: Elemento[]): Dispositivo[] => {
  const primeiroElemento = elementos.shift();

  const pai = getDispositivoFromElemento(articulacao, primeiroElemento!.hierarquia!.pai as Elemento);
  const primeiro = redodDispositivoExcluido(primeiroElemento!, pai!);

  const novos: Dispositivo[] = [primeiro];
  elementos.forEach(filho => {
    const parent = filho.hierarquia?.pai === primeiroElemento?.hierarquia?.pai ? primeiro.pai! : getDispositivoFromElemento(articulacao, filho.hierarquia!.pai! as Elemento);
    const novo = redodDispositivoExcluido(filho, parent!);
    novos.push(novo);
  });

  return novos;
};

export const incluir = (state: ElementoState, evento: StateEvent, novosEvento: StateEvent): Elemento[] => {
  let articulacao;

  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const elemento = evento.elementos[0];

    if (isElementoDispositivoAlteracao(elemento)) {
      articulacao = getDispositivoFromElemento(state.articulacao!, { uuid: elemento.hierarquia!.pai!.uuidAlteracao }, true)?.alteracoes;
    } else {
      articulacao = state.articulacao;
    }

    const pai = getDispositivoFromElemento(articulacao!, elemento!.hierarquia!.pai!);
    const novos = redoDispositivosExcluidos(articulacao, evento.elementos);
    pai?.renumeraFilhos();

    if (novosEvento) {
      const posicao = elemento!.hierarquia!.posicao;

      const referencia = posicao === 0 ? pai : getDispositivoAnterior(novos[0]);

      if (referencia) {
        const dispositivo = getDispositivoFromElemento(state.articulacao!, referencia);
        dispositivo ? (novosEvento.referencia = createElemento(dispositivo!)) : retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Erro inesperado' });
      }
    }

    if (evento.stateType === StateType.ElementoIncluido) {
      novosEvento.referencia = evento.referencia;
    }

    return novos.map(n => createElemento(n));
  }
  return [];
};

export const remover = (state: ElementoState, evento: StateEvent): Elemento[] => {
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

export const processarModificados = (state: ElementoState, evento: StateEvent, isRedo = false): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    let anterior = 0;
    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        if ((isRedo && anterior === dispositivo.uuid) || anterior !== dispositivo.uuid) {
          dispositivo.texto = e.conteudo?.texto ?? '';
          novosElementos.push(createElemento(dispositivo));
          anterior = dispositivo.uuid!;
        }
      }
    });

    return novosElementos;
  }
  return [];
};

export const processaRenumerados = (state: ElementoState, evento: StateEvent): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      novosElementos.push(createElemento(dispositivo!));
    });

    return novosElementos;
  }
  return [];
};

export const processaValidados = (state: ElementoState, eventos: StateEvent[]): Elemento[] => {
  const evento = getEvento(eventos, StateType.ElementoValidado);
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const validados: Elemento[] = [];

    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        dispositivo.mensagens = validaDispositivo(dispositivo);
        if (dispositivo.mensagens.length > 0) {
          validados.push(createElemento(dispositivo));
        }
      }
    });
    return validados;
  }
  return [];
};
