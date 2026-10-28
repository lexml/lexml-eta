import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ADICIONAR_PENA = 'ADICIONAR_PENA';
export const ALTERAR_ROTULO_PENA = 'ALTERAR_ROTULO_PENA';

export class AdicionarPena implements ElementoAction {
  descricao = 'Adicionar pena, medida administrativa e outros';
  tipo?: string;

  // Sem rótulo, o reducer usa o da primeira pena do documento.
  execute(atual: Referencia, rotulo?: string): any {
    this.tipo = atual.tipo;
    return { type: ADICIONAR_PENA, atual, rotulo };
  }
}

export class AlterarRotuloPena implements ElementoAction {
  descricao = 'Alterar rótulo';
  tipo?: string;

  execute(atual: Referencia, rotulo?: string): any {
    this.tipo = atual.tipo;
    return { type: ALTERAR_ROTULO_PENA, atual, rotulo };
  }
}

export const adicionarPenaAction = new AdicionarPena();
export const alterarRotuloPenaAction = new AlterarRotuloPena();
