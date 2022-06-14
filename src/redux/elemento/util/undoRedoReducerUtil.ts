import { Eventos } from './../evento/eventos';
import { isDispositivoAlteracao } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { Articulacao, Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../../model/dispositivo/situacao';
import { isArticulacao, isArtigo } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, getDispositivoFromElemento, isElementoDispositivoAlteracao, getElementos } from '../../../model/elemento/elementoUtil';
import { createArticulacao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { findDispositivoByUuid, getDispositivoAnterior, getUltimoFilho, isArticulacaoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
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

const getDispositivoPaiFromElemento = (articulacao: Articulacao, elemento: Partial<Elemento>): Dispositivo | null => {
  if (isElementoDispositivoAlteracao(elemento)) {
    const artigo = isArticulacaoAlteracao(articulacao) ? articulacao.pai! : findDispositivoByUuid(articulacao, elemento.hierarquia!.pai!.uuidAlteracao!);

    if (artigo) {
      if (!artigo.alteracoes) {
        artigo!.alteracoes = createArticulacao();
        artigo.alteracoes.pai = artigo;
      }
      if (elemento.hierarquia!.pai!.tipo! === TipoDispositivo.articulacao.tipo) {
        return artigo.alteracoes;
      }
      return findDispositivoByUuid(artigo.alteracoes, elemento.hierarquia!.pai!.uuid!);
    }
  }
  return findDispositivoByUuid(articulacao, elemento.hierarquia!.pai!.uuid!);
};

const isOmissisCaput = (elemento: Elemento): boolean => {
  const partesLexmlId = elemento.lexmlId?.split('_') ?? [];
  return elemento.tipo === TipoDispositivo.omissis.tipo && partesLexmlId.length > 1 && partesLexmlId[partesLexmlId.length - 2] === 'cpt';
};

const redodDispositivoExcluido = (elemento: Elemento, pai: Dispositivo): Dispositivo => {
  const novo = criaDispositivo(
    isArtigo(pai) && (elemento.tipo === TipoDispositivo.inciso.name || isOmissisCaput(elemento)) ? (pai as Artigo).caput! : pai,
    elemento.tipo!,
    undefined,
    elemento.hierarquia!.posicao
  );
  novo.uuid = elemento.uuid;
  novo.id = elemento.lexmlId;
  novo!.texto = elemento?.conteudo?.texto ?? '';
  novo!.numero = elemento?.hierarquia?.numero;
  novo.rotulo = elemento?.rotulo;
  novo.mensagens = elemento?.mensagens;
  novo.situacao = getTipoSituacaoByDescricao(elemento!.descricaoSituacao!);
  return novo;
};

const redoDispositivosExcluidos = (articulacao: any, elementos: Elemento[]): Dispositivo[] => {
  const primeiroElemento = elementos.shift();

  const pai = getDispositivoPaiFromElemento(articulacao, primeiroElemento!);
  const primeiro = redodDispositivoExcluido(primeiroElemento!, pai!);

  const novos: Dispositivo[] = [primeiro];
  elementos?.forEach(filho => {
    const parent = filho.hierarquia?.pai === primeiroElemento?.hierarquia?.pai ? primeiro.pai! : getDispositivoPaiFromElemento(articulacao, filho);
    const novo = redodDispositivoExcluido(filho, parent!);
    novos.push(novo);
  });

  return novos;
};

export const incluir = (state: State, evento: StateEvent, novosEvento: StateEvent): Elemento[] => {
  if (evento !== undefined && evento.elementos !== undefined && evento.elementos[0] !== undefined) {
    const elemento = evento.elementos[0];

    const pai = getDispositivoPaiFromElemento(state.articulacao!, elemento!);

    const novos = redoDispositivosExcluidos(state.articulacao, evento.elementos);
    pai?.renumeraFilhos();

    if (novosEvento) {
      const posicao = elemento!.hierarquia!.posicao;

      const referencia = posicao === 0 ? (isArticulacao(pai!) && isArticulacaoAlteracao(pai as Articulacao) ? pai!.pai! : pai) : getUltimoFilho(getDispositivoAnterior(novos[0])!);

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
          if (dispositivo.alteracoes) {
            dispositivo.alteracoes.base = e.norma;
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

export const getElementosAlteracaoASeremAtualizados = (articulacao: Articulacao, primeiroDispositivoASerRemovido: Dispositivo | undefined, eventos: Eventos): Elemento[] => {
  const elementos: Elemento[] = [];

  if (primeiroDispositivoASerRemovido) {
    const pai = primeiroDispositivoASerRemovido.pai?.tipo === 'Caput' ? primeiroDispositivoASerRemovido.pai.pai : primeiroDispositivoASerRemovido.pai;
    if (pai && isDispositivoAlteracao(pai)) {
      elementos.push(...getElementos(pai));
    }
  }

  const incluidos = eventos.get(StateType.ElementoIncluido);

  if (incluidos.elementos?.length) {
    const elemento1 = incluidos.elementos[0];
    const dispositivo = getDispositivoFromElemento(articulacao, elemento1);

    if (dispositivo) {
      const pai = dispositivo.pai && dispositivo.pai?.tipo === 'Caput' ? dispositivo.pai.pai : dispositivo.pai;
      if (pai && isDispositivoAlteracao(pai)) {
        return getElementos(pai);
      }
    }
  }

  return elementos;
};
