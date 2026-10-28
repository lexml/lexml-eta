import { ElementoAction } from '.';

export const RESETAR_DOCUMENTO = 'RESETAR_DOCUMENTO';

export class ResetarDocumento implements ElementoAction {
  tipo?: string;

  execute(): any {
    return { type: RESETAR_DOCUMENTO };
  }
}

export const resetarDocumentoAction = new ResetarDocumento();
