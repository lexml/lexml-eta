import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const INFORMAR_EXISTENCIA_NA_NORMA = 'INFORMAR_EXISTENCIA_NA_NORMA';

export class InformarExistenciaDoElementoNaNorma implements ElementoAction {
  descricao: string;
  tipo?: string;
  nomeAcao?: string;
  hotkey?: string;
  existeNaNormaAlterada: boolean;

  constructor(descricao: string, nomeAcao: string, hotkey: string, existeNaNormaAlterada: boolean) {
    this.descricao = descricao;
    this.nomeAcao = nomeAcao;
    this.hotkey = hotkey;
    this.existeNaNormaAlterada = existeNaNormaAlterada;
  }

  execute(atual: Referencia): any {
    return {
      type: INFORMAR_EXISTENCIA_NA_NORMA,
      subType: this.nomeAcao,
      atual,
      existeNaNormaAlterada: this.existeNaNormaAlterada,
    };
  }
}

export const considerarElementoExistenteNaNorma = new InformarExistenciaDoElementoNaNorma('Considerar existente na norma', 'considerarExistenteNaNorma', '(Ctrl+Alt+E)', true);
export const considerarElementoNovoNaNorma = new InformarExistenciaDoElementoNaNorma('Considerar novo na norma', 'considerarNovoNaNorma', '(Ctrl+Alt+E)', false);
