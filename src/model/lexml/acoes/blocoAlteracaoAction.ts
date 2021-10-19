import { Referencia } from '../../elemento';
import { ElementoAction } from './acoes';
import { ADICIONAR_ELEMENTO } from './adicionarElementoAction';

export const INICIAR_BLOCO = 'INICIAR_BLOCO';
export const FINALIZAR_BLOCO = 'FINALIZAR_BLOCO';

class BlocoAlteracao implements ElementoAction {
  descricao: string;
  tipo?: string;

  isDispositivoAlteracao = true;
  constructor(private tipoAcao: string) {
    this.descricao = tipoAcao === INICIAR_BLOCO ? `Inserir bloco de alteração` : `Finalizar bloco de alteração`;
  }

  execute(atual: Referencia, conteudo?: string, tipo?: Referencia, hasDesmembramento = false): any {
    return {
      type: ADICIONAR_ELEMENTO,
      subType: this.tipoAcao,
      atual,
      novo: {
        tipo,
        isDispositivoAlteracao: this.isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
      hasDesmembramento,
    };
  }
}
export const iniciarBlocoAlteracao = new BlocoAlteracao(INICIAR_BLOCO);
export const finalizarBlocoAlteracao = new BlocoAlteracao(FINALIZAR_BLOCO);
