import { Referencia } from '../../elemento';
export const TAB = 'TAB';

export const tabAction = (atual: Referencia): any => {
  return {
    type: TAB,
    atual,
  };
};
