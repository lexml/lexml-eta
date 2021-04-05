import { Dispositivo } from '../../dispositivo/dispositivo';
import { Mensagem, TipoMensagem } from '../util/mensagem';

const isRotuloConsistente = (dispositivo: Dispositivo): boolean => {
  const rotulo = dispositivo.rotulo;

  dispositivo.numero === undefined ? dispositivo.pai?.renumeraFilhos() : dispositivo.createRotulo(dispositivo);

  return rotulo === dispositivo.rotulo;
};

export const validaNumeracao = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (dispositivo === null) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não foi informado',
    });
  }
  if (dispositivo !== null && dispositivo.numero && dispositivo.numero.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém numeração',
    });
  }
  if (dispositivo !== null && dispositivo.rotulo && dispositivo.rotulo.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém rótulo',
    });
  }
  if (dispositivo !== null && dispositivo.rotulo && !isRotuloConsistente(dispositivo)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O rótulo informado não é consistente com a regra de formação de rótulo para este dispositivo',
    });
  }
  return mensagens;
};
