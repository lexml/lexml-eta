import { formatDateTime, formatDateTimeToIso, padTo2Digits } from '../../util/date-util';
import { generateUUID } from '../../util/uuid';
import { Usuario } from '../revisao/usuario';
import { Comentario, OrdenacaoComentarios, SequenciaComentario } from './comentario';

export const TAMANHO_MAXIMO_COMENTARIO = 500;

export const criarComentario = (usuario: Usuario, texto: string, data = new Date()): Comentario => ({
  usuario: new Usuario(usuario.nome, usuario.id, usuario.sigla),
  data: formatDateTimeToIso(formatDateTime(data)),
  texto,
});

export const criarSequenciaComentario = (usuario: Usuario, texto: string, data = new Date()): SequenciaComentario => ({
  id: generateUUID(),
  comentarios: [criarComentario(usuario, texto, data)],
});

const temId = (usuario: Usuario): boolean => usuario.id !== undefined && usuario.id !== null && usuario.id !== '';

// Com id no autor, compara os ids; sem id, compara os nomes.
export const isComentarioDoUsuario = (comentario: Comentario, usuario?: Usuario): boolean => {
  if (!usuario) {
    return false;
  }
  if (temId(comentario.usuario)) {
    return temId(usuario) && String(comentario.usuario.id) === String(usuario.id);
  }
  return comentario.usuario.nome === usuario.nome;
};

export const podeEditarComentario = (comentario: Comentario, usuario?: Usuario): boolean => isComentarioDoUsuario(comentario, usuario);

export const podeExcluirComentario = (sequencia: SequenciaComentario, comentario: Comentario, usuario?: Usuario): boolean =>
  sequencia.comentarios.length > 1 && isComentarioDoUsuario(comentario, usuario);

const instanteDoUltimoComentario = (sequencia: SequenciaComentario): number => {
  const instantes = sequencia.comentarios.map(c => Date.parse(c.data)).filter(t => !Number.isNaN(t));
  return instantes.length ? Math.max(...instantes) : -Infinity;
};

// Sem posição conhecida, a sequência vai para o fim; empates mantêm a ordem recebida (ordem de criação).
export const ordenarSequencias = (
  sequencias: SequenciaComentario[],
  ordenacao: OrdenacaoComentarios,
  getPosicao: (id: string) => number | undefined = (): undefined => undefined
): SequenciaComentario[] => {
  const indexadas = sequencias.map((sequencia, indice) => ({ sequencia, indice }));
  const chave =
    ordenacao === 'mais-recentes'
      ? (s: SequenciaComentario): number => -instanteDoUltimoComentario(s)
      : (s: SequenciaComentario): number => {
          const posicao = getPosicao(s.id);
          return posicao === undefined || posicao < 0 ? Infinity : posicao;
        };
  return indexadas
    .sort((a, b) => {
      const ka = chave(a.sequencia);
      const kb = chave(b.sequencia);
      return ka === kb ? a.indice - b.indice : ka < kb ? -1 : 1;
    })
    .map(i => i.sequencia);
};

// dd/mm/aaaa hh:mm no horário local; data inválida volta como recebida.
export const formatarDataComentario = (data: string): string => {
  const instante = Date.parse(data);
  if (Number.isNaN(instante)) {
    return data;
  }
  const d = new Date(instante);
  return `${padTo2Digits(d.getDate())}/${padTo2Digits(d.getMonth() + 1)}/${d.getFullYear()} ${padTo2Digits(d.getHours())}:${padTo2Digits(d.getMinutes())}`;
};
