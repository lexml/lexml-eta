import { ElementoAction } from '.';
import { Referencia } from '../../elemento';
export const INFORMAR_DADOS_ASSISTENTE = 'INFORMAR_DADOS_ASSISTENTE';

export class InformarDadosAssistente implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Adicionar Artigo para alterar outra norma';
  }

  execute(atual: Referencia): any {
    return {
      type: INFORMAR_DADOS_ASSISTENTE,
      atual,
    };
  }
}
export const InformarDadosAssistenteAction = new InformarDadosAssistente();
