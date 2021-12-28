import { Dispositivo } from '../../dispositivo/dispositivo';
import { validaTexto } from '../conteudo/conteudoValidator';
import { isOriginal } from '../hierarquia/hierarquiaUtil';
import { validaHierarquia } from '../hierarquia/hierarquiaValidator';
import { validaNumeracao } from '../numeracao/numeracaoValidator';
import { Mensagem } from '../util/mensagem';

export const validaDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  if (isOriginal(dispositivo)) {
    return [];
  }
  return validaHierarquia(dispositivo).concat(validaTexto(dispositivo), validaNumeracao(dispositivo));
};
