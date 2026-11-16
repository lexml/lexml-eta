import { expect } from '@open-wc/testing';
import { SequenciaComentario } from '../../../src/model/comentario/comentario';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { criarDocumentoArticulado, DadosLexEdit } from '../../../src/model/lexml/documento/documentoArticulado';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { Usuario } from '../../../src/model/revisao/usuario';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { lexeditSalvo } from '../../doc/documentoArticulado';

const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';
const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const JUSTIFICACAO_ID = 'a1b2c3d4000040008000000000000001';

let state: State;
const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id);
const uuid2 = (id: string): string => dispositivo(id).uuid2;
const sequencia = (id: string, uuid2Dispositivo?: string, texto = 'Comentário'): SequenciaComentario => ({
  id,
  ...(uuid2Dispositivo && { uuid2Dispositivo }),
  comentarios: [{ usuario: FULANO, data: '2026-11-16T10:00:00-03:00', texto }],
});
const salvar = (dados: DadosLexEdit): any => {
  const revisoes = montaRevisoesArticulacao(state);
  return criarDocumentoArticulado(state.articulacao!.projetoNorma!, URN, {}, {}, revisoes ? { ...dados, revisoes } : dados);
};
const refs = (documento: any): string[] => lexeditSalvo(documento).comentarios.sequenciaComentario.map((s: any) => s.refIdElementoComentado);

describe('Salvar comentários da articulação (c02, task 2.2)', () => {
  beforeEach(() => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  it('comentário num inciso grava o id do inciso, o autor e a pendência', () => {
    const documento = salvar({ comentarios: [sequencia('s1', uuid2('art6_cpt_inc1'))] });

    expect(refs(documento)).to.deep.equal(['art6_cpt_inc1']);
    expect(lexeditSalvo(documento).usuarios.usuario.map((u: any) => u.idUsuario)).to.include('sf:fulano');
    expect(lexeditSalvo(documento).pendencias.pendencia).to.include('Remover comentários.');
  });

  it('comentário num artigo grava o id do caput', () => {
    expect(refs(salvar({ comentarios: [sequencia('s1', uuid2('art2'))] }))).to.deep.equal(['art2_cpt']);
  });

  it('depois de incluir um artigo antes, o ref acompanha a renumeração', () => {
    const art3 = uuid2('art3');
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(dispositivo('art2')), novo: { tipo: TipoDispositivo.artigo.tipo }, posicao: 'depois' });

    expect(refs(salvar({ comentarios: [sequencia('s1', art3)] }))).to.deep.equal(['art4_cpt']);
  });

  it('comentário na ementa grava o ref "ementa"', () => {
    const ementa = state.articulacao!.projetoNorma!.ementa!.uuid2!;
    expect(refs(salvar({ comentarios: [sequencia('s1', ementa)] }))).to.deep.equal(['ementa']);
  });

  it('dispositivo excluído em revisão grava o id gravado na revisão de exclusão', () => {
    const par = uuid2('art6_par1');
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(dispositivo('art6')) });
    const documento = salvar({ comentarios: [sequencia('s1', par)] });

    expect(refs(documento)).to.deep.equal(['_art6-exc1_par1']);
    expect(JSON.stringify(lexeditSalvo(documento).revisoesArticulacao)).to.include('"id":"_art6-exc1_par1"');
  });

  it('dispositivo que não existe mais não é gravado', () => {
    const documento = salvar({ comentarios: [sequencia('s1', 'uuid2-inexistente'), sequencia('s2', uuid2('art1'))] });
    expect(refs(documento)).to.deep.equal(['art1_cpt']);
  });

  it('articulação e justificação: as da articulação primeiro, na ordem recebida', () => {
    const documento = salvar({
      justificacao: `<p><comentario id-sequencia-comentario="${JUSTIFICACAO_ID}">trecho</comentario></p>`,
      comentarios: [sequencia('art5', uuid2('art5')), sequencia(JUSTIFICACAO_ID), sequencia('art2', uuid2('art2'))],
    });

    expect(refs(documento)).to.deep.equal(['art5_cpt', 'art2_cpt', `_tc${JUSTIFICACAO_ID}_1`]);
  });

  it('anexo de parecer: grava as da articulação e nenhum trecho da justificação', () => {
    const documento = salvar({ anexoParecer: true, comentarios: [sequencia('s1', uuid2('art1'))] });

    expect(refs(documento)).to.deep.equal(['art1_cpt']);
    expect(lexeditSalvo(documento).pendencias.pendencia).to.include('Remover comentários.');
    expect(JSON.stringify(documento.value.projetoNorma.justificacao ?? null)).to.not.include('_tc');
  });
});
