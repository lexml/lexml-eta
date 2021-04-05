import { Dispositivo } from '../../dispositivo/dispositivo';
import { validaTexto } from '../conteudo/conteudo-validator';
import { validaHierarquia } from '../hierarquia/hierarquia-validator';
import { validaNumeracao } from '../numeracao/numeracao-validator';
import { Mensagem } from '../util/mensagem';

export const validaDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  return validaHierarquia(dispositivo).concat(validaTexto(dispositivo), validaNumeracao(dispositivo));
};
