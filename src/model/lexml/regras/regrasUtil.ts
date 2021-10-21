import { Dispositivo } from '../../dispositivo/dispositivo';
import { getDispositivoAnterior, getDispositivoPosterior, isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const podeConverterEmOmissis = (dispositivo: Dispositivo): boolean => {
  return (
    isDispositivoAlteracao(dispositivo.pai!) &&
    dispositivo.filhos.length === 0 &&
    dispositivo.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoAnterior(dispositivo)?.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoPosterior(dispositivo)?.tipo !== TipoDispositivo.omissis.name
  );
};
