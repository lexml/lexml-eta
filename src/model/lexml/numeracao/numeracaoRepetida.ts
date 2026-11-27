import { Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao, isArtigo, isCaput, isOmissis, isPena } from '../../dispositivo/tipo';
import { getArticulacao, isDispositivoAlteracao, percorreHierarquiaDispositivos, podeRenumerarFilhosAutomaticamente } from '../hierarquia/hierarquiaUtil';
import { buildHref } from '../util/idUtil';

export const MENSAGEM_NUMERACAO_IRREGULAR = 'Existem dispositivos com numeração irregular.';

export type NumeracaoIrregular = 'repetida' | 'complemento' | 'lacuna' | 'foraDeOrdem';

const participa = (d: Dispositivo): boolean => !isArticulacao(d) && !isCaput(d) && !isOmissis(d) && !isPena(d);

interface Grupo {
  membros: Dispositivo[];
  // Só nos grupos de numeração automática o número deve ser o sucessor do anterior; com omissis a sequência não é avaliada.
  automatico: boolean;
}

// O artigo se compara com todos os artigos da articulação (o id dele não inclui agrupadores); os demais, com os irmãos do mesmo tipo.
const getMembros = (d: Dispositivo): Dispositivo[] => (isArtigo(d) ? getArticulacao(d)?.artigos ?? [] : (d.pai?.filhos ?? []).filter(f => f.tipo === d.tipo));

const isGrupoAutomatico = (d: Dispositivo, membros: Dispositivo[]): boolean =>
  isArtigo(d) ? !isDispositivoAlteracao(d) && !membros.some(isOmissis) : !!d.pai && !d.pai.filhos.some(isOmissis) && podeRenumerarFilhosAutomaticamente(d.pai);

const getGrupo = (d: Dispositivo): Grupo => {
  const membros = getMembros(d);
  return { membros, automatico: isGrupoAutomatico(d, membros) };
};

// Sufixo do id que vem da numeração; ids iguais no grupo só são possíveis com o mesmo sufixo.
const sufixoNumeracao = (d: Dispositivo): string | undefined => (d.numero === '1' && (d as any).informouParagrafoUnico === true ? '1u' : d.numero);

// Prioridade: repetida, complemento, lacuna ou fora de ordem. Só a causa recebe o tipo, nunca os que continuam a sequência a partir dela.
const classificaGrupo = ({ membros, automatico }: Grupo): Map<Dispositivo, NumeracaoIrregular> => {
  const irregulares = new Map<Dispositivo, NumeracaoIrregular>();
  const anterioresPorSufixo = new Map<string, Dispositivo[]>();
  let maiorAnterior = 0;

  for (const d of membros) {
    if (!participa(d)) {
      continue;
    }
    const sufixo = sufixoNumeracao(d);
    const principal = parseInt(d.numero ?? '', 10);
    const temComplemento = !!d.numero?.includes('-');
    const candidatos = sufixo === undefined ? undefined : anterioresPorSufixo.get(sufixo);
    const href = candidatos ? buildHref(d) : undefined;

    if (href && candidatos!.some(c => buildHref(c) === href)) {
      irregulares.set(d, 'repetida');
    } else if (automatico && !isNaN(principal)) {
      if (temComplemento) {
        irregulares.set(d, 'complemento');
      } else if (principal > maiorAnterior + 1) {
        irregulares.set(d, 'lacuna');
      } else if (principal < maiorAnterior + 1) {
        irregulares.set(d, 'foraDeOrdem');
      }
    }

    if (sufixo !== undefined) {
      candidatos ? candidatos.push(d) : anterioresPorSufixo.set(sufixo, [d]);
    }
    if (!isNaN(principal) && !temComplemento) {
      maiorAnterior = Math.max(maiorAnterior, principal);
    }
  }
  return irregulares;
};

// Classificação reaproveitada enquanto o grupo não muda: sem isso, validar cada artigo reclassificaria todos os anteriores.
interface GrupoClassificado {
  membros: Dispositivo[];
  sufixos: (string | undefined)[];
  automatico: boolean;
  resultado: Map<Dispositivo, NumeracaoIrregular>;
}

const classificados = new WeakMap<Dispositivo, Map<string, GrupoClassificado>>();

// Mesmos membros, na mesma ordem e com a mesma numeração.
const mesmosMembros = (salvo: GrupoClassificado, membros: Dispositivo[]): boolean =>
  salvo.membros.length === membros.length && membros.every((d, i) => d === salvo.membros[i] && sufixoNumeracao(d) === salvo.sufixos[i]);

const classificaGrupoReaproveitando = (dispositivo: Dispositivo): Map<Dispositivo, NumeracaoIrregular> => {
  const membros = getMembros(dispositivo);
  const dono = isArtigo(dispositivo) ? getArticulacao(dispositivo) : dispositivo.pai;
  if (!dono) {
    return classificaGrupo({ membros, automatico: isGrupoAutomatico(dispositivo, membros) });
  }
  // No artigo, o grupo automático só depende dos membros (omissis entre eles) e do bloco de alteração, comum a todos; nos demais, também dos irmãos de outro tipo e do pai.
  const automaticoAtual = isArtigo(dispositivo) ? undefined : isGrupoAutomatico(dispositivo, membros);
  const porTipo = classificados.get(dono) ?? new Map<string, GrupoClassificado>();
  classificados.set(dono, porTipo);
  const salvo = porTipo.get(dispositivo.tipo);
  if (salvo && (automaticoAtual === undefined || automaticoAtual === salvo.automatico) && mesmosMembros(salvo, membros)) {
    return salvo.resultado;
  }
  const automatico = automaticoAtual ?? isGrupoAutomatico(dispositivo, membros);
  const resultado = classificaGrupo({ membros, automatico });
  porTipo.set(dispositivo.tipo, { membros: [...membros], sufixos: membros.map(sufixoNumeracao), automatico, resultado });
  return resultado;
};

/** Irregularidade de numeração do dispositivo (só a causa, nunca o descendente que a herda), ou undefined. */
export const getIrregularidadeNumeracao = (dispositivo: Dispositivo): NumeracaoIrregular | undefined =>
  participa(dispositivo) ? classificaGrupoReaproveitando(dispositivo).get(dispositivo) : undefined;

/** Uuid → irregularidade de todos os dispositivos da articulação, avaliando cada grupo uma única vez. */
export const getIrregularidadesNumeracao = (articulacao: Dispositivo): Map<number, NumeracaoIrregular> => {
  const irregulares = new Map<number, NumeracaoIrregular>();
  const avaliados = new Map<Dispositivo, Set<string>>();

  percorreHierarquiaDispositivos(articulacao, d => {
    const dono = isArtigo(d) ? getArticulacao(d) : d.pai;
    if (!participa(d) || !dono) {
      return;
    }
    const tipos = avaliados.get(dono) ?? new Set<string>();
    avaliados.set(dono, tipos);
    if (tipos.has(d.tipo)) {
      return;
    }
    tipos.add(d.tipo);
    classificaGrupo(getGrupo(d)).forEach((irregularidade, membro) => irregulares.set(membro.uuid!, irregularidade));
  });

  return irregulares;
};
