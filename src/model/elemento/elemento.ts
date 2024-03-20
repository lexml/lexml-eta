import { Conteudo } from '../dispositivo/conteudo';
import { ElementoAction } from '../lexml/acao';
import { Mensagem } from '../lexml/util/mensagem';
import { Revisao } from '../revisao/revisao';

export class Referencia {
  tipo?: string;
  uuid?: number;
  uuid2?: string;
  lexmlId?: string;
  conteudo?: Partial<Conteudo>;
  descricaoSituacao?: string;
  uuidAlteracao?: number;
  uuid2Alteracao?: string;
  existeNaNormaAlterada?: boolean;
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
    posicao?: number;
    numero?: string;
  };
  sendoEditado = false;
  index = 0;
  acoesPossiveis?: ElementoAction[];
  norma?: string;
  existeNaNormaAlterada?: boolean;
  abreAspas?: boolean;
  fechaAspas?: boolean;
  notaAlteracao?: string;
  dispositivoAlteracao?: boolean;
  tipoOmissis?: string;
  podeEditarNotaAlteracao?: boolean;
  manterNoMesmoGrupoDeAspas?: boolean;
  tiposAgrupadoresQuePodemSerInseridosAntes?: string[];
  tiposAgrupadoresQuePodemSerInseridosDepois?: string[];
  artigoDefinido?: string;
  elementoAnteriorNaSequenciaDeLeitura?: Referencia;
  revisao?: Revisao;
  ultimoFilhoDireto?: Referencia;
}
