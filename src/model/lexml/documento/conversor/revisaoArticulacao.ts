import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isArticulacao, isArtigo, isCaput } from '../../../dispositivo/tipo';
import { Elemento, Referencia } from '../../../elemento';
import { getDispositivoFromElemento } from '../../../elemento/elementoUtil';
import { RevisaoElemento } from '../../../revisao/revisao';
import { Usuario } from '../../../revisao/usuario';
import { StateType, State } from '../../../../redux/state';
import { getDispositivoPaiFromElemento, redodDispositivoExcluido } from '../../../../redux/elemento/util/undoRedoReducerUtil';
import {
  getOperacoesDaRevisao,
  getOperacoesRevisao,
  getRevisoesElemento,
  getRevisoesElementoAssociadas,
  isRevisaoPrincipal,
  OPERACAO_ALTERADO,
} from '../../../../redux/elemento/util/revisaoUtil';
import { formatDateTimeToIso } from '../../../../util/date-util';
import { criaDispositivo, createAlteracao, createArticulacao } from '../../dispositivo/dispositivoLexmlFactory';
import { getArticulacao, getDispositivoAndFilhosAsLista, isArticulacaoAlteracao, isDispositivoAlteracao } from '../../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../tipo/tipoDispositivo';
import { buildId, updateIdDispositivoAndFilhos } from '../../util/idUtil';
import { RevisaoArticulacaoLexEdit, RevisoesLexEdit } from '../documentoArticulado';
import { buildJsonixContentFromHtml, buildJsonixDispositivo } from './buildJsonixFromProjetoNorma';

const TYPE_REVISAO = 'br_gov_lexml_lexedit__1.RevisaoArticulacao';
const TYPE_GEN_INLINE = 'br_gov_lexml__1.GenInline';

const lowerFirst = (texto: string): string => texto.charAt(0).toLowerCase() + texto.slice(1);

const getIdUsuario = (usuario: Usuario): string => String(usuario.id ?? usuario.nome);

const montaRevisaoBase = (revisao: RevisaoElemento, operacoes: string): RevisaoArticulacaoLexEdit => {
  const usuario = revisao.usuario ?? new Usuario();
  return { TYPE_NAME: TYPE_REVISAO, revisao: operacoes, refIdUsuario: getIdUsuario(usuario), data: formatDateTimeToIso(revisao.dataHora) };
};

const montaRevisaoDeDispositivo = (state: State, revisao: RevisaoElemento): RevisaoArticulacaoLexEdit | undefined => {
  const dispositivo = getDispositivoFromElemento(state.articulacao!, revisao.elementoAposRevisao);
  const operacoes = getOperacoesDaRevisao(state, revisao);
  if (!dispositivo?.id || !operacoes) {
    return undefined;
  }
  const resultado: RevisaoArticulacaoLexEdit = { ...montaRevisaoBase(revisao, operacoes), refIdDispositivo: dispositivo.id };
  const textoAnterior = revisao.elementoAntesRevisao?.conteudo?.texto;
  if (textoAnterior !== undefined && getOperacoesRevisao(operacoes).some(o => o.nome === OPERACAO_ALTERADO)) {
    resultado.p = { TYPE_NAME: TYPE_GEN_INLINE, content: buildJsonixContentFromHtml(textoAnterior) };
  }
  return resultado;
};

// Inciso de artigo mora no caput; as demais combinações usam o próprio pai.
const getDestinoDeCriacao = (pai: Dispositivo, elemento: Partial<Elemento>): Dispositivo =>
  isArtigo(pai) && (elemento.tipo === TipoDispositivo.inciso.tipo || elemento.tipoOmissis === 'inciso-caput') ? (pai as Artigo).caput! : pai;

// Reproduz, numa articulação temporária, a cadeia de ancestrais do pai real (até a articulação raiz ou de alteração).
const criaHospedeiro = (temporaria: Articulacao, pai: Dispositivo): Dispositivo => {
  if (isArticulacao(pai)) {
    if (!isArticulacaoAlteracao(pai)) {
      return temporaria;
    }
    const artigo = criaDispositivo(temporaria, TipoDispositivo.artigo.tipo) as Artigo;
    createAlteracao(artigo);
    return artigo.alteracoes!;
  }
  if (isCaput(pai)) {
    return criaHospedeiro(temporaria, pai.pai!);
  }
  return criaDispositivo(getDestinoDeCriacao(criaHospedeiro(temporaria, pai.pai!), { tipo: pai.tipo }), pai.tipo);
};

interface SubarvoreSolta {
  raiz: Dispositivo;
  idTemporario: string;
  // Só em bloco de alteração: id do artigo hospedeiro temporário, prefixo de todos os ids da subárvore.
  idHospedeiro?: string;
}

// Rótulo e numeração vêm dos snapshots (redodDispositivoExcluido); sem renumerar, para não perdê-los.
const criaSubarvoreSolta = (pai: Dispositivo, snapshots: Elemento[]): SubarvoreSolta => {
  const temporaria = createArticulacao();
  const copias = snapshots.map((s, i) => {
    const copia = JSON.parse(JSON.stringify(s)) as Elemento;
    if (i === 0 && copia.hierarquia) {
      copia.hierarquia.posicao = 0;
    }
    return copia;
  });
  const hospedeiro = criaHospedeiro(temporaria, pai);
  const raiz = redodDispositivoExcluido(temporaria, copias[0], getDestinoDeCriacao(hospedeiro, copias[0]));
  const criados = new Map<number | undefined, Dispositivo>([[copias[0].uuid, raiz]]);
  copias.slice(1).forEach(copia => {
    const paiDoFilho = criados.get(copia.hierarquia?.pai?.uuid) ?? raiz;
    criados.set(copia.uuid, redodDispositivoExcluido(temporaria, copia, paiDoFilho));
  });
  updateIdDispositivoAndFilhos(temporaria);
  const hospedeiroAlteracao = isDispositivoAlteracao(raiz) ? getArticulacao(raiz).pai : undefined;
  return { raiz, idTemporario: buildId(raiz), idHospedeiro: hospedeiroAlteracao && buildId(hospedeiroAlteracao) };
};

const reescreveIds = (valor: any, idTemporario: string, idNovo: string): void => {
  if (!valor || typeof valor !== 'object') {
    return;
  }
  if (Array.isArray(valor)) {
    valor.forEach(v => reescreveIds(v, idTemporario, idNovo));
    return;
  }
  if (typeof valor.id === 'string' && valor.id.startsWith(idTemporario)) {
    valor.id = idNovo + valor.id.substring(idTemporario.length);
  }
  Object.values(valor).forEach(v => reescreveIds(v, idTemporario, idNovo));
};

// Id que o dispositivo teria se fosse reincluído agora no seu lugar (mesmo cálculo do undo): sonda temporária no pai real.
const calculaIdBase = (pai: Dispositivo, snapshot: Elemento): string => {
  const destino = getDestinoDeCriacao(pai, snapshot);
  const sonda = criaDispositivo(destino, snapshot.tipo!, undefined, snapshot.hierarquia?.posicao);
  pai.renumeraFilhos();
  try {
    return buildId(sonda);
  } finally {
    destino.removeFilho(sonda);
    pai.renumeraFilhos();
  }
};

// Em bloco de alteração o id sai do rótulo, não da posição: troca-se só o prefixo do artigo hospedeiro temporário pelo real.
const calculaIdBaseEmAlteracao = (pai: Dispositivo, subarvore: SubarvoreSolta): string =>
  `${getArticulacao(pai).pai!.id}${subarvore.idTemporario.substring(subarvore.idHospedeiro!.length)}`;

interface Exclusao {
  revisao: RevisaoElemento;
  snapshots: Elemento[];
  pai: Dispositivo;
  posicao: number;
}

interface ExclusaoComSubarvore extends Exclusao {
  subarvore: SubarvoreSolta;
  base: string;
}

// b vem depois de a quando o elemento anterior de b é a (ou um descendente de a); a posição sozinha empata.
const ordenaPelaCadeia = (state: State, grupo: ExclusaoComSubarvore[]): ExclusaoComSubarvore[] => {
  const uuidsDoGrupo = (e: Exclusao): Array<number | undefined> => getRevisoesElementoAssociadas(state.revisoes, e.revisao).map(r => r.elementoAposRevisao.uuid);
  const ordenado: ExclusaoComSubarvore[] = [];
  let restantes = [...grupo];
  while (restantes.length) {
    const proximo =
      restantes.find(
        b => !restantes.some(a => a !== b && uuidsDoGrupo(a).includes((b.revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura as Referencia | undefined)?.uuid))
      ) ?? restantes[0];
    ordenado.push(proximo);
    restantes = restantes.filter(e => e !== proximo);
  }
  return ordenado;
};

const montaRevisoesDeExclusao = (state: State, exclusoes: Exclusao[]): Array<{ chave: [number, number, number]; revisao: RevisaoArticulacaoLexEdit }> => {
  const lista = getDispositivoAndFilhosAsLista(state.articulacao!);
  const grupos = new Map<string, ExclusaoComSubarvore[]>();
  exclusoes.forEach(e => {
    const subarvore = criaSubarvoreSolta(e.pai, e.snapshots);
    const base = subarvore.idHospedeiro ? calculaIdBaseEmAlteracao(e.pai, subarvore) : calculaIdBase(e.pai, e.snapshots[0]);
    grupos.set(base, [...(grupos.get(base) ?? []), { ...e, subarvore, base }]);
  });

  const resultado: Array<{ chave: [number, number, number]; revisao: RevisaoArticulacaoLexEdit }> = [];
  grupos.forEach((grupo, base) => {
    // Mesmo pai e posição empatam: a cadeia de leitura desempata.
    const porLugar = new Map<string, ExclusaoComSubarvore[]>();
    grupo.forEach(e => porLugar.set(`${e.pai.uuid2}|${e.posicao}`, [...(porLugar.get(`${e.pai.uuid2}|${e.posicao}`) ?? []), e]));
    const ordenado = Array.from(porLugar.values())
      .sort((a, b) => lista.indexOf(a[0].pai) - lista.indexOf(b[0].pai) || a[0].posicao - b[0].posicao)
      .flatMap(g => ordenaPelaCadeia(state, g));
    ordenado.forEach((exclusao, i) => {
      const no = buildJsonixDispositivo(exclusao.subarvore.raiz);
      reescreveIds(no.value, exclusao.subarvore.idTemporario, `_${base}-exc${i + 1}`);
      const revisao = montaRevisaoBase(exclusao.revisao, getOperacoesDaRevisao(state, exclusao.revisao));
      revisao[lowerFirst(no.name.localPart)] = no.value;
      resultado.push({ chave: [lista.indexOf(exclusao.pai), exclusao.posicao, i], revisao });
    });
  });
  return resultado;
};

const montaUsuarios = (revisoes: RevisaoElemento[]): RevisoesLexEdit['usuarios'] => {
  const usuarios = new Map<string, Usuario>();
  revisoes.forEach(r => {
    const usuario = r.usuario ?? new Usuario();
    const id = getIdUsuario(usuario);
    if (!usuarios.has(id)) {
      usuarios.set(id, usuario);
    }
  });
  return {
    TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuarios',
    usuario: Array.from(usuarios.entries()).map(([idUsuario, u]) => ({
      TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario',
      idUsuario,
      nome: u.nome,
      ...(u.sigla && { sigla: u.sigla }),
    })),
  };
};

/**
 * Monta os grupos `RevisoesArticulacao` e `Usuarios` a partir das revisões principais do estado.
 * Revisões não excluídas seguem a ordem de leitura da articulação; as de exclusão vêm depois, por posição.
 */
export const montaRevisoesArticulacao = (state: State): RevisoesLexEdit | undefined => {
  const principais = getRevisoesElemento(state.revisoes).filter(isRevisaoPrincipal);
  if (!state.articulacao || !principais.length) {
    return undefined;
  }

  const lista = getDispositivoAndFilhosAsLista(state.articulacao);
  const naoExcluidas = principais
    .filter(r => r.stateType !== StateType.ElementoRemovido)
    .map(r => ({ r, dispositivo: getDispositivoFromElemento(state.articulacao!, r.elementoAposRevisao) }))
    .filter(x => !!x.dispositivo)
    .sort((a, b) => lista.indexOf(a.dispositivo!) - lista.indexOf(b.dispositivo!))
    .map(x => montaRevisaoDeDispositivo(state, x.r))
    .filter((r): r is RevisaoArticulacaoLexEdit => !!r);

  const exclusoes: Exclusao[] = [];
  principais
    .filter(r => r.stateType === StateType.ElementoRemovido)
    .forEach(revisao => {
      const snapshots = getRevisoesElementoAssociadas(state.revisoes, revisao).map(r => r.elementoAntesRevisao as Elemento);
      const pai = getDispositivoPaiFromElemento(state.articulacao!, snapshots[0]);
      if (pai) {
        exclusoes.push({ revisao, snapshots, pai, posicao: snapshots[0].hierarquia?.posicao ?? 0 });
      }
    });
  const excluidas = montaRevisoesDeExclusao(state, exclusoes)
    .sort((a, b) => a.chave[0] - b.chave[0] || a.chave[1] - b.chave[1] || a.chave[2] - b.chave[2])
    .map(x => x.revisao);

  const revisaoArticulacao = [...naoExcluidas, ...excluidas];
  if (!revisaoArticulacao.length) {
    return undefined;
  }
  return {
    revisoesArticulacao: { TYPE_NAME: 'br_gov_lexml_lexedit__1.RevisoesArticulacao', revisaoArticulacao },
    usuarios: montaUsuarios(principais),
  };
};
