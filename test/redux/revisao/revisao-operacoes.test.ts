import { expect } from '@open-wc/testing';
import {
  anexarOperacaoRevisao,
  formatarOperacoesRevisao,
  getOperacoesRevisao,
  removerOperacaoRevisao,
  derivarOperacoesRevisao,
  reconciliarOperacoesRevisao,
  buildDescricaoRevisaoElemento,
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

    it('deriva alteracaoRotulo, com o id anterior como argumento, quando só o rótulo mudou', () => {
      const antes = { tipo: 'Paragrafo', rotulo: '§ 4º-A.', lexmlId: 'par4-1', conteudo: { texto: 'a' } };
      const apos = { tipo: 'Paragrafo', rotulo: '§ 4º-B.', lexmlId: 'par4-2', conteudo: { texto: 'a' } };
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoModificado, antes, apos))).to.equal('alteracaoRotulo;par4-1');
    });

    it('deriva alteracaoRotulo e alterado quando o rótulo e o texto mudaram', () => {
      const antes = { tipo: 'Paragrafo', rotulo: '§ 4º-A.', lexmlId: 'par4-1', conteudo: { texto: 'a' } };
      const apos = { tipo: 'Paragrafo', rotulo: '§ 4º-B.', lexmlId: 'par4-2', conteudo: { texto: 'b' } };
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoModificado, antes, apos))).to.equal('alteracaoRotulo;par4-1,alterado');
    });

    it('deriva só alterado quando apenas o texto mudou', () => {
      const antes = { tipo: 'Paragrafo', rotulo: '§ 4º-A.', lexmlId: 'par4-1', conteudo: { texto: 'a' } };
      const apos = { tipo: 'Paragrafo', rotulo: '§ 4º-A.', lexmlId: 'par4-1', conteudo: { texto: 'b' } };
      expect(derivarOperacoesRevisao(state, novaRevisao(StateType.ElementoModificado, antes, apos))).to.equal('alterado');
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

    it('descarta alteracaoRotulo quando o id voltou ao original, mantendo alterado', () => {
      const r = revisao(
        'alteracaoRotulo;par4-1,alterado',
        { tipo: 'Paragrafo', lexmlId: 'par4-1', hierarquia: lugar('p', 0), conteudo: { texto: 'a' } },
        { tipo: 'Paragrafo', lexmlId: 'par4-1', hierarquia: lugar('p', 0), conteudo: { texto: 'b' } }
      );
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('alterado');
    });

    it('mantém alteracaoRotulo enquanto o id for diferente do original', () => {
      const r = revisao(
        'alteracaoRotulo;par4-1',
        { tipo: 'Paragrafo', lexmlId: 'par4-2', hierarquia: lugar('p', 0), conteudo: { texto: 'a' } },
        { tipo: 'Paragrafo', lexmlId: 'par4-3', hierarquia: lugar('p', 0), conteudo: { texto: 'a' } }
      );
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('alteracaoRotulo;par4-1');
    });

    it('mantém alteracaoRotulo em dispositivo movido, cujo rótulo difere por outra causa', () => {
      const r = revisao(
        'movido;2,alteracaoRotulo;par4-1',
        { tipo: 'Paragrafo', lexmlId: 'par4-1', hierarquia: lugar('p', 1), conteudo: { texto: 'a' } },
        { tipo: 'Paragrafo', lexmlId: 'par9-1', hierarquia: lugar('p', 8), conteudo: { texto: 'a' } }
      );
      reconciliarOperacoesRevisao(state, r);
      expect(r.revisao).to.equal('movido;2,alteracaoRotulo;par4-1');
    });
  });

  describe('descrição da marca de alteração de rótulo', () => {
    const modificada = (operacoes: string): RevisaoElemento => {
      const r = novaRevisao(StateType.ElementoModificado, { tipo: 'Paragrafo', rotulo: '§ 4º-A.' }, { tipo: 'Paragrafo', rotulo: '§ 4º-B.' });
      r.revisao = operacoes;
      return r;
    };

    it('descreve o rótulo isolado informando o rótulo anterior', () => {
      expect(buildDescricaoRevisaoElemento(modificada('alteracaoRotulo;par4-1'))).to.equal('Rótulo do dispositivo foi alterado (rótulo antes era "§ 4º-A.")');
    });

    it('descreve a revisão combinada com alterado', () => {
      expect(buildDescricaoRevisaoElemento(modificada('alteracaoRotulo;par4-1,alterado'))).to.equal('Rótulo e texto do dispositivo foram alterados (rótulo antes era "§ 4º-A.")');
    });

    it('mantém a descrição de texto quando não há alteração de rótulo', () => {
      expect(buildDescricaoRevisaoElemento(modificada('alterado'))).to.equal('Texto do dispositivo foi alterado');
    });
  });

  describe('descrição da marca por operações', () => {
    const comOperacoes = (operacoes: string | undefined, antes: any, apos: any, stateType = StateType.ElementoIncluido): RevisaoElemento => {
      const r = novaRevisao(stateType, antes, apos);
      r.revisao = operacoes;
      return r;
    };
    const emProposicao = (tipo: string): any => ({ tipo, uuid: 1 });
    const emAlteracao = (tipo: string): any => ({ tipo, uuid: 1, uuidAlteracao: 99 });

    it('descreve movido de artigo derivando o rótulo anterior pela posição', () => {
      const r = comOperacoes('movido;3', emProposicao('Artigo'), emProposicao('Artigo'));
      expect(buildDescricaoRevisaoElemento(r)).to.equal('Dispositivo movido (antes era "Artigo Art. 3º")');
    });

    it('usa o formato com ponto a partir da décima posição', () => {
      expect(buildDescricaoRevisaoElemento(comOperacoes('movido;10', emProposicao('Artigo'), emProposicao('Artigo')))).to.equal('Dispositivo movido (antes era "Artigo Art. 10.")');
      expect(buildDescricaoRevisaoElemento(comOperacoes('movido;10', emProposicao('Paragrafo'), emProposicao('Paragrafo')))).to.equal(
        'Dispositivo movido (antes era "Paragrafo § 10.")'
      );
    });

    it('deriva o rótulo anterior de parágrafo, inciso, alínea e item', () => {
      const descricao = (tipo: string): string => buildDescricaoRevisaoElemento(comOperacoes('movido;2', emProposicao(tipo), emProposicao(tipo)));
      expect(descricao('Paragrafo')).to.equal('Dispositivo movido (antes era "Paragrafo § 2º")');
      expect(descricao('Inciso')).to.equal('Dispositivo movido (antes era "Inciso II –")');
      expect(descricao('Alinea')).to.equal('Dispositivo movido (antes era "Alinea b)")');
      expect(descricao('Item')).to.equal('Dispositivo movido (antes era "Item 2.")');
    });

    it('em alteração de norma informa a posição original, sem rótulo anterior', () => {
      const r = comOperacoes('movido;3', emAlteracao('Paragrafo'), emAlteracao('Paragrafo'));
      expect(buildDescricaoRevisaoElemento(r)).to.equal('Dispositivo movido (posição original 3)');
    });

    it('usa a posição original quando o tipo não permite derivar o rótulo', () => {
      expect(buildDescricaoRevisaoElemento(comOperacoes('movido;2', emProposicao('Capitulo'), emProposicao('Capitulo')))).to.equal('Dispositivo movido (posição original 2)');
    });

    it('lista movido e texto alterado', () => {
      const r = comOperacoes('movido;3,alterado', emProposicao('Artigo'), emProposicao('Artigo'));
      expect(buildDescricaoRevisaoElemento(r)).to.equal('Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado');
    });

    it('descreve transformado pelo tipo anterior, com e sem texto alterado', () => {
      expect(buildDescricaoRevisaoElemento(comOperacoes('transformado;alinea', emProposicao('Inciso'), emProposicao('Inciso')))).to.equal(
        'Dispositivo transformado (antes era "alínea")'
      );
      expect(buildDescricaoRevisaoElemento(comOperacoes('transformado;inciso,alterado', emProposicao('Alinea'), emProposicao('Alinea')))).to.equal(
        'Dispositivo transformado (antes era "inciso") e texto alterado'
      );
    });

    it('lista movido com alteração de rótulo, informando o rótulo anterior', () => {
      const r = comOperacoes('movido;2,alteracaoRotulo;par4-1', { tipo: 'Paragrafo', rotulo: '§ 4º-A.' }, emAlteracao('Paragrafo'));
      expect(buildDescricaoRevisaoElemento(r)).to.equal('Dispositivo movido (posição original 2) e rótulo alterado (rótulo antes era "§ 4º-A.")');
    });

    it('omite o rótulo anterior desconhecido', () => {
      const r = comOperacoes('movido;2,alteracaoRotulo;par4-1', emProposicao('Paragrafo'), emProposicao('Paragrafo'));
      expect(buildDescricaoRevisaoElemento(r)).to.equal('Dispositivo movido (antes era "Paragrafo § 2º") e rótulo alterado');
    });

    it('mantém as descrições das operações isoladas', () => {
      expect(buildDescricaoRevisaoElemento(comOperacoes('adicionado', undefined, emProposicao('Inciso')))).to.equal('Dispositivo adicionado');
      expect(buildDescricaoRevisaoElemento(comOperacoes('excluido', emProposicao('Inciso'), emProposicao('Inciso'), StateType.ElementoRemovido))).to.equal('Dispositivo removido');
      expect(buildDescricaoRevisaoElemento(comOperacoes('alterado', emProposicao('Inciso'), emProposicao('Inciso'), StateType.ElementoModificado))).to.equal(
        'Texto do dispositivo foi alterado'
      );
    });

    it('sem o atributo revisao cai no mapeamento legado', () => {
      const r = comOperacoes(undefined, undefined, emProposicao('Inciso'));
      expect(buildDescricaoRevisaoElemento(r)).to.equal('Dispositivo adicionado');
    });
  });
});
