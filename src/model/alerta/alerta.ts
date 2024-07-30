import { TipoMensagem } from '../lexml/util/mensagem';

export interface Alerta {
  id: string;
  tipo: TipoMensagem;
  mensagem: string;
  podeFechar: boolean;
  exibirComandoEmenda?: boolean;
}
