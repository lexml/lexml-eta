import { MPV_SIMPLES } from '../../../../demo/doc/mpv_simples';
import { TipoDocumento } from '../../../model/documento/tipoDocumento';
import { getDocumento } from '../../../parser/parserLexmlJsonix';
import { State } from '../../state';
import { load } from './loadArticulacao';

export const abreArticulacao = (state: any, action: any): State => {
  console.log(action);
  return load(getDocumento(MPV_SIMPLES, action.tipoDocumento === TipoDocumento.EMENDA)!.articulacao!);
  //return load(ArticulacaoParser.load(action.articulacao, action.tipoDocumento === TipoDocumento.EMENDA));
};
