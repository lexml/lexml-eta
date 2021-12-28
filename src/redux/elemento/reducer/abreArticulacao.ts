// import { MPV_ALTERACAO } from '../../../../demo/doc/mpv_alteracao';
import { ClassificacaoDocumento } from '../../../model/documento/classificacao';
import { buildDocumento } from '../../../parser/parserLexmlJsonix';
import { State } from '../../state';
import { load } from './loadArticulacao';

export const abreArticulacao = (state: any, action: any): State => {
  return load(buildDocumento(action.documento, action.nomeAcao === ClassificacaoDocumento.EMENDA)!.articulacao!);
};
