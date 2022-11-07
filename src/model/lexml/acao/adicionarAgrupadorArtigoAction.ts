import { Referencia } from '../../elemento';
import { ElementoAction } from './index';

export const ADICIONAR_AGRUPADOR_ARTIGO = 'ADICIONAR_AGRUPADOR_ARTIGO';

export class AdicionarAgrupadorArtigo implements ElementoAction {
  descricao: string;
  posicao?: string;
  hotkey = '(Ctrl+Alt+G)';

  constructor(posicao?: string) {
    this.descricao = 'Adicionar agrupador de artigo' + (posicao ? ' ' + posicao : '');
    this.posicao = posicao;
  }

  execute(atual: Referencia, tipo: string): any {
    return {
      type: ADICIONAR_AGRUPADOR_ARTIGO,
      atual,
      novo: {
        tipo,
      },
    };
  }
}

export const adicionarAgrupadorArtigoAction = new AdicionarAgrupadorArtigo();
export const adicionarAgrupadorArtigoAntesAction = new AdicionarAgrupadorArtigo('antes');
