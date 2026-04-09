import { RemissaoTextoFixo } from '../../remissao';

export const RESTAURAR_TEXTO_FIXO_REMISSOES = 'RESTAURAR_TEXTO_FIXO_REMISSOES';

export const restaurarTextoFixoRemissoesAction = (remissoesTextoFixo: RemissaoTextoFixo[]) => ({
  type: RESTAURAR_TEXTO_FIXO_REMISSOES,
  remissoesTextoFixo,
});
