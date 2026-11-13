import { Usuario } from '../revisao/usuario';

export interface Comentario {
  usuario: Usuario;
  // ISO 8601 com fuso.
  data: string;
  // Cada linha vira um parágrafo ao gravar.
  texto: string;
}

export interface SequenciaComentario {
  id: string;
  // Presente só nas sequências da articulação: o uuid2 não muda ao renumerar, mover ou desfazer.
  uuid2Dispositivo?: string;
  comentarios: Comentario[];
}

export type OrdenacaoComentarios = 'ordem-no-texto' | 'mais-recentes';
