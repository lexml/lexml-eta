import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../../model/dispositivo/situacao';
import { isArtigo } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, getDispositivoFromElemento, isElementoDispositivoAlteracao } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior, getUltimoFilho } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoModificado } from '../../../model/lexml/situacao/dispositivoModificado';
import { DispositivoNovo } from '../../../model/lexml/situacao/dispositivoNovo';
import { DispositivoOriginal } from '../../../model/lexml/situacao/dispositivoOriginal';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateEvent, StateType } from '../../state';
import { getEvento } from '../evento/eventosUtil';
import { retornaEstadoAtualComMensagem } from './stateReducerUtil';

const getTipoSituacaoByDescricao = (descricao: string): TipoSituacao => {
  switch (descricao) {
    case DescricaoSituacao.DISPOSITIVO_ADICIONADO:
      return new DispositivoAdicionado();
    case DescricaoSituacao.DISPOSITIVO_NOVO:
      return new DispositivoNovo();
    default:
      return new DispositivoOriginal();
  }
};

const redodDispositivoExcluido = (elemento: Elemento, pai: Dispositivo): Dispositivo => {
  const novo = criaDispositivo(
    isArtigo(pai) && elemento.tipo === TipoDispositivo.inciso.name ? (pai as Artigo).caput! : pai,
    elemento.tipo!,
    undefined,
    elemento.hierarquia!.posicao
  );
  novo.uuid = elemento.uuid;
  novo!.texto = elemento?.conteudo?.texto ?? '';
  novo!.numero = elemento?.hierarquia?.numero;
  novo.rotulo = elemento?.rotulo;
  novo.mensagens = elemento?.mensagens;
  novo.situacao = getTipoSituacaoByDescricao(elemento!.descricaoSituacao!);
  return novo;
};

const redoDispositivosExcluidos = (articulacao: any, elementos: Elemento[]): Dispositivo[] => {
  const primeiroElemento = elementos.shift();

  const pai = getDispositivoFromElemento(articulacao, primeiroElemento!.hierarquia!.pai as Elemento);
  const primeiro = redodDispositivoExcluido(primeiroElemento!, pai!);

  const novos: Dispositivo[] = [primeiro];
  elementos?.forEach(filho => {
    const parent = filho.hierarquia?.pai === primeiroElemento?.hierarquia?.pai ? primeiro.pai! : getDispositivoFromElemento(articulacao, filho.hierarquia!.pai! as Elemento);
    const novo = redodDispositivoExcluido(filho, parent!);
    novos.push(novo);
  });

  return novos;
};

export const incluir = (state: State, evento: StateEvent, novosEvento: StateEvent): Elemento[] => {
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

      const referencia = posicao === 0 ? pai : getUltimoFilho(getDispositivoAnterior(novos[0])!);

      if (referencia) {
        const dispositivo = getDispositivoFromElemento(articulacao!, referencia);
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

export const remover = (state: State, evento: StateEvent): Elemento[] => {
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

export const restaurarSituacao = (state: State, evento: StateEvent, eventoRestaurados: StateEvent, Situacao: any): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    evento.elementos.forEach(el => {
      const d = getDispositivoFromElemento(state.articulacao!, el, true);

      if (Situacao instanceof DispositivoOriginal) {
        d!.numero = d!.situacao.dispositivoOriginal?.numero ?? '';
        d!.rotulo = d!.situacao.dispositivoOriginal?.rotulo ?? '';
        d!.texto = d!.situacao.dispositivoOriginal?.conteudo?.texto ?? '';
        d!.situacao = new DispositivoOriginal();
      } else {
        d!.situacao = new Situacao(createElemento(d!));
      }
      eventoRestaurados.elementos!.push(createElemento(d!));
    });
    return eventoRestaurados.elementos!;
  }
  return [];
};

export const processarModificados = (state: State, evento: StateEvent, isRedo = false): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    let anterior = 0;
    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        if ((isRedo && anterior === dispositivo.uuid) || anterior !== dispositivo.uuid) {
          if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
            dispositivo.texto = dispositivo.situacao.dispositivoOriginal!.conteudo?.texto ?? '';
            dispositivo.situacao = new DispositivoOriginal();
          } else {
            if (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
              dispositivo.situacao = new DispositivoModificado(createElemento(dispositivo));
            }
            dispositivo.texto = e.conteudo?.texto ?? '';
          }
          dispositivo.mensagens = validaDispositivo(dispositivo);
          novosElementos.push(createElemento(dispositivo));
          anterior = dispositivo.uuid!;
        }
      }
    });

    return novosElementos;
  }
  return [];
};

export const processaRenumerados = (state: State, evento: StateEvent): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const novosElementos: Elemento[] = [];

    evento.elementos.forEach(e => {
      const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
      if (dispositivo) {
        novosElementos.push(createElemento(dispositivo!));
      }
    });

    return novosElementos;
  }
  return [];
};

export const processaValidados = (state: State, eventos: StateEvent[]): Elemento[] => {
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
