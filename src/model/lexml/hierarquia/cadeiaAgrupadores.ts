import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupadorNaoArticulacao } from '../../dispositivo/tipo';
import { isDispositivoAlteracao } from './hierarquiaUtil';

/** Agrupadores da proposição acima do dispositivo (ele incluído, se for agrupador), do mais externo ao mais interno. */
export const getCadeiaAgrupadores = (dispositivo: Dispositivo | null | undefined): Dispositivo[] => {
  const cadeia: Dispositivo[] = [];
  // Subir por pai atravessa a articulação do bloco de alteração até o artigo hospedeiro.
  for (let d = dispositivo ?? undefined; d; d = d.pai) {
    if (isAgrupadorNaoArticulacao(d) && !isDispositivoAlteracao(d)) {
      cadeia.unshift(d);
    }
  }
  return cadeia;
};
