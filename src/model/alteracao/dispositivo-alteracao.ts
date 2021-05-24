import { Dispositivo } from '../dispositivo/dispositivo';

export interface DispositivoAlteracao {
  tipo?: string;
  subTipo?: string;
  uuid?: number;
  pai?: Dispositivo;
  texto?: string;
}
