import { Dispositivo } from '../../dispositivo/dispositivo';
import { ElementoAction } from '../acao';

export interface Regras {
  getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[];
  getAcaoPossivelTab(dispositivo: Dispositivo): any;
  getAcaoPossivelShiftTab(dispositivo: Dispositivo): any;
}
