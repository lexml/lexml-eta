import { Articulacao, Dispositivo } from '../../../dispositivo/dispositivo';
import { isCaput } from '../../../dispositivo/tipo';
import { isDispositivoAlteracao, percorreHierarquiaDispositivos } from '../../hierarquia/hierarquiaUtil';

/** Ids dos dispositivos de bloco de alteração, separados pela situação na norma vigente (especificação 13). */
export interface SituacaoNaNormaVigente {
  existentes: string[];
  novos: string[];
}

// O caput não tem id próprio no arquivo (o do artigo o representa) e a articulação da alteração não tem id.
export const temSituacaoSalvavel = (d: Dispositivo): boolean => !!d.id && !isCaput(d) && d.existeNaNormaAlterada !== undefined && isDispositivoAlteracao(d);

export const mesclarSituacaoNaNormaVigente = (a: SituacaoNaNormaVigente, b?: SituacaoNaNormaVigente): SituacaoNaNormaVigente => ({
  existentes: [...a.existentes, ...(b?.existentes ?? [])],
  novos: [...a.novos, ...(b?.novos ?? [])],
});

/** Percorre na ordem da articulação, para a saída ser determinística. */
export const coletarSituacaoNaNormaVigente = (articulacao: Articulacao | undefined): SituacaoNaNormaVigente => {
  const situacao: SituacaoNaNormaVigente = { existentes: [], novos: [] };
  if (!articulacao) return situacao;
  percorreHierarquiaDispositivos(articulacao, d => {
    if (!temSituacaoSalvavel(d)) return;
    (d.existeNaNormaAlterada ? situacao.existentes : situacao.novos).push(d.id!);
  });
  return situacao;
};

/** Id sem dispositivo correspondente é ignorado; dispositivo fora de bloco de alteração não é alterado. */
export const aplicarSituacaoNaNormaVigente = (articulacao: Articulacao | undefined, situacao: SituacaoNaNormaVigente): void => {
  if (!articulacao || (!situacao.existentes.length && !situacao.novos.length)) return;
  const porId = new Map<string, boolean>([...situacao.existentes.map((id): [string, boolean] => [id, true]), ...situacao.novos.map((id): [string, boolean] => [id, false])]);
  percorreHierarquiaDispositivos(articulacao, d => {
    if (!d.id || isCaput(d) || !porId.has(d.id) || !isDispositivoAlteracao(d)) return;
    d.existeNaNormaAlterada = porId.get(d.id);
  });
};
