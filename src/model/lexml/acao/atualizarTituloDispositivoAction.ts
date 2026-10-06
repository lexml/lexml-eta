import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ATUALIZAR_TITULO_DISPOSITIVO = 'ATUALIZAR_TITULO_DISPOSITIVO';

export class AtualizarTituloDispositivo implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor(descricao: string, private remover = false) {
    this.descricao = descricao;
  }

  // Sem tituloDispositivo, "adicionar/editar" não altera nada; só a variante "remover" apaga o título.
  execute(atual: Referencia, tituloDispositivo?: string): any {
    this.tipo = atual.tipo;
    return {
      type: ATUALIZAR_TITULO_DISPOSITIVO,
      atual,
      tituloDispositivo: this.remover ? undefined : tituloDispositivo,
      remover: this.remover,
    };
  }
}

export const adicionarTituloDispositivoAction = new AtualizarTituloDispositivo('Adicionar título');
export const editarTituloDispositivoAction = new AtualizarTituloDispositivo('Editar título');
export const removerTituloDispositivoAction = new AtualizarTituloDispositivo('Remover título', true);
