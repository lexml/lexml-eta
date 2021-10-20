import { Referencia } from '../../elemento';
export const SHIFT_TAB = 'SHIFT_TAB';

export const shiftTabAction = (atual: Referencia): any => {
  return {
    type: SHIFT_TAB,
    atual,
  };
};
