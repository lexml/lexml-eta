import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { NAMESPACE_LEXEDIT } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';

const DATA = '2026-05-11T15:51:00-03:00';

const revisao = (extra: any): any => ({ TYPE_NAME: 'br_gov_lexml_lexedit__1.RevisaoArticulacao', refIdUsuario: 'sf:fulano', data: DATA, ...extra });

const lexedit = (revisoes: any, usuarios?: any): any => ({
  revisoesArticulacao: { TYPE_NAME: 'x', revisaoArticulacao: revisoes },
  ...(usuarios && { usuarios: { TYPE_NAME: 'y', usuario: usuarios } }),
});

const documentoCom = (conteudo: any): any => ({
  value: { metadado: { metadadoProprietario: [{ any: [{ name: { namespaceURI: NAMESPACE_LEXEDIT, localPart: 'Metadado' }, value: conteudo }] }] } },
});

describe('lerRevisoesArticulacao — leitura tolerante das revisões da hierarquia', () => {
  describe('Operações', () => {
    it('lê as operações combinadas na ordem do arquivo', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'movido;3,alterado' })]));
      expect(r.refIdDispositivo).to.equal('art1');
      expect(r.operacoes).to.deep.equal([{ nome: 'movido', argumento: '3' }, { nome: 'alterado' }]);
    });

    it('lê uma lista de um só elemento entregue como objeto', () => {
      const lidas = lerRevisoesArticulacao(lexedit(revisao({ refIdDispositivo: 'art1', revisao: 'adicionado' })));
      expect(lidas).to.have.length(1);
    });

    it('ignora a operação desconhecida e mantém as demais', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alteracaoRotulo;art0,alterado' })]));
      expect(r.operacoes).to.deep.equal([{ nome: 'alterado' }]);
    });

    it('ignora a revisão que só tem operações desconhecidas', () => {
      expect(lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alteracaoRotulo;art0' })]))).to.deep.equal([]);
    });

    it('descarta movido sem posição válida e transformado sem tipo', () => {
      const [a, b] = lerRevisoesArticulacao(
        lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'movido;0,alterado' }), revisao({ refIdDispositivo: 'art2', revisao: 'transformado;,alterado' })])
      );
      expect(a.operacoes).to.deep.equal([{ nome: 'alterado' }]);
      expect(b.operacoes).to.deep.equal([{ nome: 'alterado' }]);
    });

    it('ignora revisão sem atributo revisao', () => {
      expect(lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1' })]))).to.deep.equal([]);
    });
  });

  describe('Dispositivo referenciado', () => {
    it('ignora revisão não excluída sem refIdDispositivo', () => {
      expect(lerRevisoesArticulacao(lexedit([revisao({ revisao: 'alterado' })]))).to.deep.equal([]);
    });

    it('ignora revisão de exclusão sem o dispositivo excluído', () => {
      expect(lerRevisoesArticulacao(lexedit([revisao({ revisao: 'excluido' })]))).to.deep.equal([]);
    });

    it('lê o dispositivo excluído com o nome do elemento LexML', () => {
      const no = { TYPE_NAME: 'br_gov_lexml__1.DispositivoType', id: '_art3-exc1', rotulo: 'Art. 3º' };
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ revisao: 'excluido', artigo: no })]));
      expect(r.refIdDispositivo).to.be.undefined;
      expect(r.excluido!.name.localPart).to.equal('Artigo');
      expect(r.excluido!.value).to.equal(no);
    });

    it('lê o nome composto do elemento (agrupamentoHierarquico)', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ revisao: 'excluido', agrupamentoHierarquico: { id: '_x-exc1' } })]));
      expect(r.excluido!.name.localPart).to.equal('AgrupamentoHierarquico');
    });

    it('lê o texto anterior de p, como objeto ou lista', () => {
      const p = { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['texto ', { name: { localPart: 'b' }, value: { content: ['original'] } }] };
      const [a, b] = lerRevisoesArticulacao(
        lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alterado', p }), revisao({ refIdDispositivo: 'art2', revisao: 'alterado', p: [p] })])
      );
      expect(a.textoAnterior).to.equal('texto <b>original</b>');
      expect(b.textoAnterior).to.equal(a.textoAnterior);
    });
  });

  describe('Usuário e data', () => {
    it('usa o registro de usuários', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alterado' })], [{ idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }]));
      expect(r.usuario).to.include({ id: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' });
    });

    it('refIdUsuario sem registro vira usuário com o próprio id como id e nome', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alterado' })]));
      expect(r.usuario).to.include({ id: 'sf:fulano', nome: 'sf:fulano' });
    });

    it('converte a data ISO 8601 para o formato interno', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alterado' })]));
      expect(r.dataHora).to.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('data inválida não impede a leitura', () => {
      const [r] = lerRevisoesArticulacao(lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alterado', data: 'ontem' })]));
      expect(r.dataHora).to.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('lerMetadadoLexEdit', () => {
    it('devolve as revisões lidas junto dos demais grupos e ignora grupo desconhecido', () => {
      const dados = lerMetadadoLexEdit(documentoCom({ ...lexedit([revisao({ refIdDispositivo: 'art1', revisao: 'alterado' })]), comentarios: { qualquer: 'coisa' } }));
      expect(dados.revisoesLidas).to.have.length(1);
    });

    it('sem o grupo não devolve a propriedade', () => {
      expect(lerMetadadoLexEdit(documentoCom({ local: 'Sala' }))).to.not.have.property('revisoesLidas');
    });
  });

  describe('Revisões salvas por montaRevisoesArticulacao', () => {
    let state: State;

    beforeEach(() => {
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
      state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
    });

    it('lê de volta as operações, o texto anterior, o excluído e o usuário', () => {
      const elemento = (id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(state.articulacao!, id)!);
      const original = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!.texto;
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elemento('art1_par1u_inc1') });
      const e = elemento('art1_par1u_inc2');
      e.conteudo!.texto = 'texto do movido alterado;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elemento('art2') });

      const grupo = montaRevisoesArticulacao(state)!;
      const [movida, excluida] = lerRevisoesArticulacao({ ...grupo });

      expect(movida.refIdDispositivo).to.equal('art1_par1u_inc2');
      expect(movida.operacoes.map(o => `${o.nome}${o.argumento ? ';' + o.argumento : ''}`)).to.deep.equal(['movido;1', 'alterado']);
      expect(movida.textoAnterior).to.equal(original);
      expect(movida.usuario).to.include({ id: 'sf:fulano', nome: 'Fulano de Tal' });
      expect(excluida.excluido!.name.localPart).to.equal('Artigo');
      expect(excluida.excluido!.value.id).to.equal('_art2-exc1');
    });
  });
});
