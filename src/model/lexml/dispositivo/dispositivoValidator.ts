import { Dispositivo } from '../../dispositivo/dispositivo';
import { validaTexto } from '../conteudo/conteudoValidator';
import { validaHierarquia } from '../hierarquia/hierarquiaValidator';
import { validaNumeracao } from '../numeracao/numeracaoValidator';
import { Mensagem } from '../util/mensagem';

export const validaDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  return validaHierarquia(dispositivo).concat(validaTexto(dispositivo), validaNumeracao(dispositivo));
};
