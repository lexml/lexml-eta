import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { ADD_ELEMENTO } from '../../../src/redux/elemento-actions';
import { adicionaElemento } from '../../../src/redux/elemento-reducer';
import { EXEMPLO_SEM_AGRUPADORES } from '../../doc/exemplo-sem-agrupadores';

let state: any;

describe('Testando a criação de um bloco de alteração num artigo já existente', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_SEM_AGRUPADORES);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando criação de novo bloco de alteração em artigo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADD_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'texto passa a vigorar com a seguinte alteração:' } },
        novo: {
          tipo: TipoDispositivo.artigo.name,
        },
      });
    });
    it('Deveria criar um bloco de alteração', () => {
      expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes.length).equals(1);
    });
    it('Deveria criar um dispositivo de alteração sem subTipo quando este for informado', () => {
      expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0].subTipo).equals(TipoDispositivo.artigo.name!);
    });
    it('Deveria criar um omissis com NR', () => {
      expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0].texto).equals('"..." (NR)');
    });
    it('Deveria ter como pai o artigo informado', () => {
      expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0].pai).equals(state.articulacao.artigos[0]);
    });
    describe('Testando criação de novo dispositivo de alteração', () => {
      beforeEach(function () {
        const atual = state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0];
        state = adicionaElemento(state, {
          type: ADD_ELEMENTO,
          atual: {
            tipo: atual.tipo,
            uuid: atual.uuid,
            hierarquia: { pai: { tipo: atual.pai.tipo, uuid: atual.pai.uuid } },
            conteudo: { texto: 'algo que não termine com indicativo de final de bloco' },
          },
        });
      });
      it('Deveria criar um dispositivo de alteração com subTipo quando este nao for informado', () => {
        expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[1].subTipo).to.be.undefined;
      });
      it('Deveria criar um omissis com NR', () => {
        expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[1].texto).equals('"..." (NR)');
      });
      it('Deveria ter como pai o artigo informado', () => {
        expect(state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[1].pai).equals(state.articulacao.artigos[0]);
      });
    });
    describe('Testando a criação de dispositivo após o fim do bloco de alteração', () => {
      beforeEach(function () {
        const atual = state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0];
        state = adicionaElemento(state, {
          type: ADD_ELEMENTO,
          atual: { tipo: atual.tipo, uuid: atual.uuid, hierarquia: { pai: { tipo: atual.pai.tipo, uuid: atual.pai.uuid } } },
        });
        state = adicionaElemento(state, {
          type: ADD_ELEMENTO,
          atual: {
            tipo: state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0].tipo,
            uuid: state.articulacao.artigos[0].blocoAlteracao.alteracoes[0].dispositivosAlteracao[0].uuid,
            conteudo: { texto: 'algo que termine com indicativo de final de bloco ..."' },
            hierarquia: { pai: { tipo: atual.pai.tipo, uuid: atual.pai.uuid } },
          },
        });
      });
      it('Deveria ter como irmao posterior um dispositivo do mesmo tipo do pai do dispositivo de alteração', () => {
        expect(state.articulacao.artigos[1].texto).equals('');
      });
    });
  });
});
