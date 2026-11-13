import { TipoMensagem } from '../lexml/util/mensagem';

export interface Alerta {
  id: string;
  tipo: TipoMensagem;
  mensagem: string;
  podeFechar: boolean;
}

// Alerta da importação de documento com anexos (lexml-eta), com o botão de fechar centralizado na aba Avisos.
export const ALERTA_ANEXOS_NAO_RECUPERADOS = 'alerta-global-anexos-nao-recuperados';
