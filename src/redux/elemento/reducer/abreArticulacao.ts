// import { MPV_ALTERACAO } from '../../../../demo/doc/mpv_alteracao';
import { ClassificacaoDocumento } from '../../../model/documento/classificacao';
import { buildProjetoNormaFromJsonix } from '../../../model/documento/conversor/buildProjetoNormaFromJsonix';
import { State } from '../../state';
import { load } from './loadArticulacao';

export const abreArticulacao = (state: any, action: any): State => {
  return load(buildProjetoNormaFromJsonix(action.documento, action.nomeAcao === ClassificacaoDocumento.EMENDA)!.articulacao!);
};
