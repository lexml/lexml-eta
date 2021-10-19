import { Elemento } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { TransformarElemento } from './transformarElementoAction';

export const transformarAction = (elemento: Elemento, novoTipo: string): any => {
  const action = new TransformarElemento(
    TipoDispositivo[novoTipo.toLowerCase()],
    'Transformar ' + elemento.tipo + 'em ' + TipoDispositivo[novoTipo.toLowerCase()].name,
    'transformar' + elemento.tipo + 'Em' + TipoDispositivo[novoTipo.toLowerCase()].name
  );

  return action.execute(elemento);
};
