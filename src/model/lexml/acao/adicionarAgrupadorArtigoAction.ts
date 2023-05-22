import { Referencia } from '../../elemento';
import { ElementoAction } from './index';

export const ADICIONAR_AGRUPADOR_ARTIGO = 'ADICIONAR_AGRUPADOR_ARTIGO';

export class AdicionarAgrupadorArtigo implements ElementoAction {
  descricao: string;
  posicao?: string;
  hotkey = '(Ctrl+Alt+G)';

  constructor(posicao?: string) {
    this.descricao = 'Adicionar Título, Capítulo, Seção e outros' + (posicao ? ' ' + posicao : '');
    this.posicao = posicao;
  }

  execute(atual: Referencia, tipo: string, refAux: any, posicao: string, manterNoMesmoGrupoDeAspas: boolean): any {
    return {
      type: ADICIONAR_AGRUPADOR_ARTIGO,
      atual,
      novo: {
        tipo,
        posicao,
        manterNoMesmoGrupoDeAspas,
      },
    };
  }
}

export const adicionarAgrupadorArtigoAction = new AdicionarAgrupadorArtigo();
export const adicionarAgrupadorArtigoAntesAction = new AdicionarAgrupadorArtigo('antes');
