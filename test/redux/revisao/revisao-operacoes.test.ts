import { expect } from '@open-wc/testing';
import {
  anexarOperacaoRevisao,
  formatarOperacoesRevisao,
  getOperacoesRevisao,
  removerOperacaoRevisao,
  derivarOperacoesRevisao,
  reconciliarOperacoesRevisao,
} from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { State, StateType } from '../../../src/redux/state';
import { Usuario } from '../../../src/model/revisao/usuario';

const novaRevisao = (stateType: StateType, antes: any, apos: any): RevisaoElemento =>
  new RevisaoElemento('X', stateType, '', new Usuario('Teste', 'u1'), '2026-10-06 10:00:00', antes, apos);

const lugar = (uuid2: string, posicao: number): any => ({ pai: { uuid2 }, posicao });

describe('Operações de revisão da hierarquia (atributo "revisao")', () => {
  describe('anexarOperacaoRevisao', () => {
    it('anexa a operação a uma revisão vazia', () => {
      expect(anexarOperacaoRevisao(undefined, 'alterado')).to.equal('alterado');
      expect(anexarOperacaoRevisao('', 'adicionado')).to.equal('adicionado');
    });

    it('anexa operação nova ao final, preservando a ordem', () => {
      expect(anexarOperacaoRevisao('movido;3', 'alterado')).to.equal('movido;3,alterado');
      expect(anexarOperacaoRevisao('alterado', 'movido', '3')).to.equal('alterado,movido;3');
    });

    it('não repete operação já presente e mantém o argumento da primeira ocorrência', () => {
      expect(anexarOperacaoRevisao('movido;3', 'movido', '7')).to.equal('movido;3');
      expect(anexarOperacaoRevisao('transformado;inciso,alterado', 'alterado')).to.equal('transformado;inciso,alterado');
    });
  });

  describe('getOperacoesRevisao / formatarOperacoesRevisao', () => {
    it('lê operações com e sem argumento', () => {
      expect(getOperacoesRevisao('movido;3,alterado')).to.deep.equal([{ nome: 'movido', argumento: '3' }, { nome: 'alterado' }]);
      expect(getOperacoesRevisao('transformado;inciso')).to.deep.equal([{ nome: 'transformado', argumento: 'inciso' }]);
    });

    it('lê revisão ausente ou vazia como lista vazia', () => {
      expect(getOperacoesRevisao(undefined)).to.deep.equal([]);
      expect(getOperacoesRevisao('')).to.deep.equal([]);
    });

    it('formata de volta o texto lido', () => {
      expect(formatarOperacoesRevisao(getOperacoesRevisao('movido;1,transformado;inciso'))).to.equal('movido;1,transformado;inciso');
    });
  });

  describe('removerOperacaoRevisao', () => {
    it('remove só a operação indicada, mantendo a ordem das demais', () => {
      expect(removerOperacaoRevisao('movido;3,alterado,transformado;inciso', 'alterado')).to.equal('movido;3,transformado;inciso');
    });

    it('devolve vazio ao remover a única operação', () => {
      expect(removerOperacaoRevisao('alterado', 'alterado')).to.equal('');
    });
  });

  describe('derivarOperacoesRevisao (revisões sem o atributo)', () => {
    const state = {} as State;

    it('deriva adicionado, excluido e alterado pelo tipo do evento', () => {
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoIncluido, undefined, { tipo: 'Inciso', hierarquia: lugar('p', 0) }))).to.equal('adicionado');
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoRemovido, { tipo: 'Inciso' }, { tipo: 'Inciso' }))).to.equal('excluido');
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoModificado, { tipo: 'Inciso' }, { tipo: 'Inciso' }))).to.equal('alterado');
    });

    it('deriva movido, transformado e alterado pela diferença entre antes e depois', () => {
      const antes = { tipo: 'Inciso', hierarquia: lugar('p', 2), conteudo: { texto: 'a' } };
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoIncluido, antes, { tipo: 'Inciso', hierarquia: lugar('p', 4), conteudo: { texto: 'a' } }))).to.equal(
        'movido;3'
      );
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoIncluido, antes, { tipo: 'Alinea', hierarquia: lugar('q', 0), conteudo: { texto: 'a' } }))).to.equal(
        'transformado;inciso'
      );
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoIncluido, antes, { tipo: 'Inciso', hierarquia: lugar('p', 4), conteudo: { texto: 'b' } }))).to.equal(
        'movido;3,alterado'
      );
    });
  });

  describe('reconciliarOperacoesRevisao', () => {
    const state = {} as State;

    const revisao = (operacoes: string, antes: any, apos: any): RevisaoElemento => {
      const r = novaRevisao(StateType.ElementoIncluido, antes, apos);
      r.revisao = operacoes;
      return r;
    };

    it('descarta alterado quando o texto voltou ao original, mantendo movido', () => {
      const r = revisao(
        'movido;3,alterado',
        { tipo: 'Inciso', hierarquia: lugar('p', 2), conteudo: { texto: 'a' } },
        { tipo: 'Inciso', hierarquia: lugar('p', 4), conteudo: { texto: 'a' } }
      );
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('movido;3');
    });

    it('descarta transformado quando o tipo voltou ao original', () => {
      const r = revisao(
        'transformado;inciso,alterado',
        { tipo: 'Inciso', hierarquia: lugar('p', 2), conteudo: { texto: 'a' } },
        { tipo: 'Inciso', hierarquia: lugar('q', 0), conteudo: { texto: 'b' } }
      );
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('alterado');
    });

    it('descarta movido quando o dispositivo voltou ao lugar de origem', () => {
      const r = revisao(
        'movido;3,alterado',
        { tipo: 'Inciso', hierarquia: lugar('p', 2), conteudo: { texto: 'a' } },
        { tipo: 'Inciso', hierarquia: lugar('p', 2), conteudo: { texto: 'b' } }
      );
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('alterado');
    });

    it('não altera revisões sem antes (adicionado) nem de exclusão', () => {
      const adicionado = novaRevisao(StateType.ElementoIncluido, undefined, { tipo: 'Inciso' });
      adicionado.revisao = 'adicionado';
      reconciliarOperacoesRevisao(state, adicionado);
      expect(adicionado.revisao).to.equal('adicionado');

      const removido = novaRevisao(StateType.ElementoRemovido, { tipo: 'Inciso', conteudo: { texto: 'a' } }, { tipo: 'Inciso', conteudo: { texto: 'a' } });
      removido.revisao = 'excluido';
      reconciliarOperacoesRevisao(state, removido);
      expect(removido.revisao).to.equal('excluido');
    });

    it('não reconcilia revisões de descendentes, que acompanham a revisão principal', () => {
      const r = revisao(
        'movido;1',
        { tipo: 'Alinea', hierarquia: lugar('p', 0), conteudo: { texto: 'a' } },
        { tipo: 'Alinea', hierarquia: lugar('p', 0), conteudo: { texto: 'a' } }
      );
      r.idRevisaoElementoPrincipal = 'principal';
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('movido;1');
    });

    it('não toca em revisões sem o atributo', () => {
      const r = novaRevisao(StateType.ElementoIncluido, { tipo: 'Inciso', conteudo: { texto: 'a' } }, { tipo: 'Inciso', conteudo: { texto: 'b' } });
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.be.undefined;
    });
  });
});
