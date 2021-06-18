import { ElementoAction } from '../../redux/elemento-actions';
import { Conteudo } from '../dispositivo/conteudo';
import { Mensagem } from '../lexml/util/mensagem';

export class Referencia {
  tipo?: string;
  uuid?: number;
  conteudo?: Partial<Conteudo>;
}
export class Elemento extends Referencia {
  nivel = 0;
  numero?: string;
  rotulo = '';
  agrupador = false;
  editavel = true;
  mensagens?: Mensagem[];
  hierarquia?: {
    pai?: Referencia;
    uuidDispositivoAlteracao?: number;
    posicao?: number;
    numero?: string;
  };
  sendoEditado = false;
  index = 0;
  acoesPossiveis?: ElementoAction[];
}
