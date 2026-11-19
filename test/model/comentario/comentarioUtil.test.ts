import { expect } from '@open-wc/testing';
import { Comentario, SequenciaComentario } from '../../../src/model/comentario/comentario';
import {
  criarComentario,
  criarSequenciaComentario,
  criarSequenciaComentarioDispositivo,
  formatarDataComentario,
  isSequenciaDaArticulacao,
  isComentarioDoUsuario,
  ordenarSequencias,
  podeEditarComentario,
  podeExcluirComentario,
} from '../../../src/model/comentario/comentarioUtil';
import { Usuario } from '../../../src/model/revisao/usuario';

const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const BELTRANO = new Usuario('Beltrano', 'sf:beltrano', 'BE');

const comentario = (usuario: Usuario, data: string, texto = 'texto'): Comentario => ({ usuario, data, texto });
const sequencia = (id: string, ...comentarios: Comentario[]): SequenciaComentario => ({ id, comentarios });

describe('comentarioUtil', () => {
  describe('criação', () => {
    it('cria a sequência com um comentário do usuário, id único e data ISO com fuso', () => {
      const data = new Date(2026, 10, 4, 9, 5, 7);
      const a = criarSequenciaComentario(FULANO, 'primeiro', data);
      const b = criarSequenciaComentario(FULANO, 'segundo', data);

      expect(a.id).to.match(/^[0-9a-f-]{36}$/);
      expect(a.id).not.to.equal(b.id);
      expect(a.comentarios).to.have.length(1);
      expect(a.comentarios[0].texto).to.equal('primeiro');
      expect(a.comentarios[0].usuario).to.deep.include({ nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' });
      expect(a.comentarios[0].data).to.match(/^2026-11-04T09:05:07[+-]\d{2}:\d{2}$/);
      expect(Date.parse(a.comentarios[0].data)).to.equal(data.getTime());
    });

    it('cria a sequência de dispositivo com o uuid2 do dispositivo como âncora', () => {
      const s = criarSequenciaComentarioDispositivo(FULANO, 'no inciso', 'uuid2-inciso');

      expect(s.uuid2Dispositivo).to.equal('uuid2-inciso');
      expect(s.id).to.match(/^[0-9a-f-]{36}$/);
      expect(s.comentarios[0]).to.deep.include({ texto: 'no inciso' });
      expect(isSequenciaDaArticulacao(s)).to.equal(true);
      expect(isSequenciaDaArticulacao(criarSequenciaComentario(FULANO, 'na justificação'))).to.equal(false);
    });

    it('copia o usuário, para que mudanças no usuário atual não alterem o autor', () => {
      const usuario = new Usuario('Fulano', 'x');
      const c = criarComentario(usuario, 'texto');
      usuario.nome = 'Outro';
      expect(c.usuario.nome).to.equal('Fulano');
    });
  });

  describe('autoria e permissões', () => {
    it('compara pelo id quando o autor tem id', () => {
      expect(isComentarioDoUsuario(comentario(FULANO, ''), new Usuario('Outro nome', 'sf:fulano'))).to.equal(true);
      expect(isComentarioDoUsuario(comentario(FULANO, ''), new Usuario('Fulano de Tal', 'sf:outro'))).to.equal(false);
      expect(isComentarioDoUsuario(comentario(FULANO, ''), new Usuario('Fulano de Tal'))).to.equal(false);
    });

    it('compara pelo nome quando o autor não tem id', () => {
      expect(isComentarioDoUsuario(comentario(new Usuario('Ana'), ''), new Usuario('Ana'))).to.equal(true);
      expect(isComentarioDoUsuario(comentario(new Usuario('Ana'), ''), new Usuario('Bia'))).to.equal(false);
    });

    it('sem usuário atual, nenhum comentário é dele', () => {
      expect(isComentarioDoUsuario(comentario(FULANO, ''), undefined)).to.equal(false);
    });

    it('edita só o autor; exclui só o autor e com mais de um comentário', () => {
      const unico = comentario(FULANO, '');
      const s1 = sequencia('1', unico);
      expect(podeEditarComentario(unico, FULANO)).to.equal(true);
      expect(podeEditarComentario(unico, BELTRANO)).to.equal(false);
      expect(podeExcluirComentario(s1, unico, FULANO)).to.equal(false);

      const resposta = comentario(BELTRANO, '');
      const s2 = sequencia('2', unico, resposta);
      expect(podeExcluirComentario(s2, resposta, BELTRANO)).to.equal(true);
      expect(podeExcluirComentario(s2, resposta, FULANO)).to.equal(false);
    });
  });

  describe('ordenação', () => {
    const antiga = sequencia('antiga', comentario(FULANO, '2026-11-01T10:00:00-03:00'));
    const nova = sequencia('nova', comentario(FULANO, '2026-11-02T10:00:00-03:00'));

    it('ordem no texto pela posição recebida, sem posição no fim', () => {
      const posicoes: Record<string, number> = { antiga: 50, nova: 10 };
      const semPosicao = sequencia('sem', comentario(FULANO, '2026-11-03T10:00:00-03:00'));
      const ordenadas = ordenarSequencias([semPosicao, antiga, nova], 'ordem-no-texto', id => posicoes[id]);
      expect(ordenadas.map(s => s.id)).to.deep.equal(['nova', 'antiga', 'sem']);
    });

    it('mais recentes pela data do último comentário, considerando respostas', () => {
      expect(ordenarSequencias([antiga, nova], 'mais-recentes').map(s => s.id)).to.deep.equal(['nova', 'antiga']);

      const respondida = sequencia('antiga', ...antiga.comentarios, comentario(BELTRANO, '2026-11-03T10:00:00-03:00'));
      expect(ordenarSequencias([respondida, nova], 'mais-recentes').map(s => s.id)).to.deep.equal(['antiga', 'nova']);
    });

    it('mais recentes desempata pela ordem de criação e compara datas com fusos diferentes', () => {
      const a = sequencia('a', comentario(FULANO, '2026-11-01T13:00:00Z'));
      const b = sequencia('b', comentario(FULANO, '2026-11-01T10:00:00-03:00'));
      expect(ordenarSequencias([a, b], 'mais-recentes').map(s => s.id)).to.deep.equal(['a', 'b']);
      expect(ordenarSequencias([b, a], 'mais-recentes').map(s => s.id)).to.deep.equal(['b', 'a']);
    });

    it('ordem no texto põe a articulação antes da justificação, cada local pela sua posição', () => {
      const justificacao = sequencia('just', comentario(FULANO, '2026-11-01T10:00:00-03:00'));
      const art5 = { ...sequencia('art5', comentario(FULANO, '2026-11-02T10:00:00-03:00')), uuid2Dispositivo: 'u5' };
      const art2 = { ...sequencia('art2', comentario(FULANO, '2026-11-03T10:00:00-03:00')), uuid2Dispositivo: 'u2' };
      const posicoes: Record<string, number> = { just: 0, art5: 40, art2: 7 };

      expect(ordenarSequencias([justificacao, art5, art2], 'ordem-no-texto', id => posicoes[id]).map(s => s.id)).to.deep.equal(['art2', 'art5', 'just']);
    });

    it('mais recentes ordena os dois locais juntos', () => {
      const justificacao = sequencia('just', comentario(FULANO, '2026-11-03T10:00:00-03:00'));
      const dispositivo = { ...sequencia('disp', comentario(FULANO, '2026-11-01T10:00:00-03:00')), uuid2Dispositivo: 'u' };

      expect(ordenarSequencias([dispositivo, justificacao], 'mais-recentes').map(s => s.id)).to.deep.equal(['just', 'disp']);
    });

    it('não altera a lista recebida', () => {
      const lista = [antiga, nova];
      ordenarSequencias(lista, 'mais-recentes');
      expect(lista.map(s => s.id)).to.deep.equal(['antiga', 'nova']);
    });
  });

  describe('formatação da data', () => {
    it('exibe dd/mm/aaaa hh:mm no horário local', () => {
      const iso = criarComentario(FULANO, '', new Date(2026, 0, 2, 3, 4, 5)).data;
      expect(formatarDataComentario(iso)).to.equal('02/01/2026 03:04');
    });

    it('devolve a data inválida como recebida', () => {
      expect(formatarDataComentario('ontem')).to.equal('ontem');
    });
  });
});
