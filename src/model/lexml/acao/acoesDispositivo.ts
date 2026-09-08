import { Dispositivo } from '../../dispositivo/dispositivo';
import { ElementoAction } from '.';

export function AcoesDispositivo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base {
    getAcoesPermitidas(dispositivo: Dispositivo, acoes: ElementoAction[]): ElementoAction[] {
      return [...new Set(acoes)]
        .filter(Boolean)
        .filter(acao => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
        .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
    }
  };
}
