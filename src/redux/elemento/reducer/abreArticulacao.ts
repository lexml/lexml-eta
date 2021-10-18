import { ArticulacaoParser } from '../../../model/lexml/parser/articulacaoParser';
import { State } from '../../state';
import { load } from './loadArticulacao';

export const abreArticulacao = (state: any, action: any): State => {
  return load(ArticulacaoParser.load(action.articulacao));
};
