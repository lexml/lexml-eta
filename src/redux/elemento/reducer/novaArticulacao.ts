import { createArticulacao, criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { State } from '../../state';
import { load } from './loadArticulacao';

export const novaArticulacao = (): State => {
  const articulacao = createArticulacao();
  criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  articulacao.renumeraArtigos();
  return load(articulacao);
};
