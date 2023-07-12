import { expect } from '@open-wc/testing';
import { APLICAR_ALTERACOES_EMENDA } from '../../../src/model/lexml/acao/aplicarAlteracoesEmenda';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';
import { EMENDA_006 } from '../../doc/emendas/emenda-006';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista, isAdicionado, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { isAlinea, isArticulacao, isInciso } from '../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { TEXTO_006 } from '../../doc/textos-colar/texto_006';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { DescricaoSituacao } from '../../../src/model/dispositivo/situacao';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { REDO } from '../../../src/model/lexml/acao/redoAction';

let state: State;

describe('Testando operações sobre a MPV 905/2019, EMENDA 006', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
    state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_006.componentes[0].dispositivos });
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  it('Deveria possuir 6 incisos adicionados (de I-1 a I-6), cada um com 2 alíneas', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(f => !isArticulacao(f) && isAdicionado(f));
    expect(dispositivos.length).to.equal(18);
    expect(dispositivos.filter(isInciso).length).to.equal(6);
    expect(dispositivos.filter(isAlinea).length).to.equal(12);
  });

  it('Deveria estar em revisão', () => {
    expect(state.emRevisao).to.be.true;
  });

  describe('Adicionando novo inciso após inciso "art1_par1u_inc1-2" e rejeitando a inclusão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
      state = elementoReducer(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual: createElemento(d),
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(d),
          conteudo: {
            texto: TEXTO_006,
          },
        },
        isColarSubstituindo: false,
        posicao: 'depois',
      });

      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
    });

    it('Deveria não possuir revisão', () => {
      expect(state.revisoes?.length).to.be.equal(0);
    });

    it('Deveria possuir inciso "art1_par1u_inc1-3" com texto "teste G:"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
      expect(d.texto).to.be.equal('teste G:');
    });

    it('Deveria apresentar os incisos subsequentes com os textos "teste J:", "teste M:" e "teste P:", nessa ordem', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
      expect(d.filhos[4].texto).to.be.equal('teste J:');
      expect(d.filhos[5].texto).to.be.equal('teste M:');
      expect(d.filhos[6].texto).to.be.equal('teste P:');
    });

    it('Deveria possuir "State.ui.events" com eventos: RevisaoRejeitada, ElementoRemovido, ElementoRenumerado', () => {
      expect(state.ui?.events[0].stateType).to.be.equal(StateType.RevisaoRejeitada);
      expect(state.ui?.events[1].stateType).to.be.equal(StateType.ElementoRemovido);
      expect(state.ui?.events[2].stateType).to.be.equal(StateType.ElementoRenumerado);
    });

    describe('Testando evento RevisaoRejeitada', () => {
      it('Deveria possuir 3 elementos', () => {
        expect(state.ui?.events[0].elementos?.length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "texto novo inciso:", "texto nova alínea a;" e "texto nova alínea b;", nessa ordem', () => {
        expect(state.ui?.events[0].elementos![0].conteudo!.texto).to.be.equal('texto novo inciso:');
        expect(state.ui?.events[0].elementos![1].conteudo!.texto).to.be.equal('texto nova alínea a;');
        expect(state.ui?.events[0].elementos![2].conteudo!.texto).to.be.equal('texto nova alínea b;');
      });

      it('Cada elemento deveria possuir uma revisão de inclusão', () => {
        expect(state.ui?.events[0].elementos?.every(e => (e.revisao as RevisaoElemento).stateType === StateType.ElementoIncluido)).to.be.true;
      });
    });

    describe('Testando evento ElementoRemovido', () => {
      it('Deveria possuir 3 elementos', () => {
        expect(state.ui?.events[1].elementos?.length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "texto novo inciso:", "texto nova alínea a;" e "texto nova alínea b;", nessa ordem', () => {
        expect(state.ui?.events[1].elementos![0].conteudo!.texto).to.be.equal('texto novo inciso:');
        expect(state.ui?.events[1].elementos![1].conteudo!.texto).to.be.equal('texto nova alínea a;');
        expect(state.ui?.events[1].elementos![2].conteudo!.texto).to.be.equal('texto nova alínea b;');
      });

      it('Os elementos não devem possuir revisão', () => {
        expect(state.ui?.events[1].elementos?.every(e => !e.revisao)).to.be.true;
      });
    });

    describe('Testando evento ElementoRenumerado (*)', () => {
      it('Deveria possuir 7 elementos (4 adicionados e 3 originais)', () => {
        expect(state.ui?.events[2].elementos?.length).to.be.equal(7);
        expect(state.ui?.events[2].elementos?.filter(e => e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO).length).to.be.equal(4);
        expect(state.ui?.events[2].elementos?.filter(e => e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL).length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "teste G:", "teste J:", "teste M:" e "teste P:", nessa ordem', () => {
        expect(state.ui?.events[2].elementos![0].conteudo!.texto).to.be.equal('teste G:');
        expect(state.ui?.events[2].elementos![1].conteudo!.texto).to.be.equal('teste J:');
        expect(state.ui?.events[2].elementos![2].conteudo!.texto).to.be.equal('teste M:');
        expect(state.ui?.events[2].elementos![3].conteudo!.texto).to.be.equal('teste P:');
      });

      it('Os elementos não devem possuir revisão', () => {
        expect(state.ui?.events[2].elementos?.every(e => !e.revisao)).to.be.true;
      });
    });
  });

  describe('Adicionando novo inciso após inciso "art1_par1u_inc1-2", rejeitando a inclusão e fazendo UNDO da rejeição', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
      state = elementoReducer(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual: createElemento(d),
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(d),
          conteudo: {
            texto: TEXTO_006,
          },
        },
        isColarSubstituindo: false,
        posicao: 'depois',
      });

      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria possuir 3 revisões sendo 1 principal', () => {
      expect(state.revisoes?.length).to.be.equal(3);
      expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
    });

    it('Deveria possuir inciso "art1_par1u_inc1-3" com texto "texto novo inciso:"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
      expect(d.texto).to.be.equal('texto novo inciso:');
    });

    it('Deveria apresentar os incisos subsequentes com os textos  "teste G:", "teste J:", "teste M:" e "teste P:", nessa ordem', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
      expect(d.filhos[4].texto).to.be.equal('teste G:');
      expect(d.filhos[5].texto).to.be.equal('teste J:');
      expect(d.filhos[6].texto).to.be.equal('teste M:');
      expect(d.filhos[7].texto).to.be.equal('teste P:');
    });

    it('Deveria possuir "State.ui.events" com eventos: RevisaoRejeitada, ElementoIncluido, ElementoRenumerado', () => {
      expect(state.ui?.events[0].stateType).to.be.equal(StateType.RevisaoRejeitada);
      expect(state.ui?.events[1].stateType).to.be.equal(StateType.SituacaoElementoModificada);
      expect(state.ui?.events[2].stateType).to.be.equal(StateType.ElementoMarcado);
      expect(state.ui?.events[3].stateType).to.be.equal(StateType.ElementoIncluido);
      expect(state.ui?.events[4].stateType).to.be.equal(StateType.ElementoRenumerado);
      expect(state.ui?.events[5].stateType).to.be.equal(StateType.SituacaoElementoModificada);
    });

    describe('Testando evento RevisaoRejeitada', () => {
      it('Deveria possuir 3 elementos', () => {
        expect(state.ui?.events[0].elementos?.length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "texto novo inciso:", "texto nova alínea a;" e "texto nova alínea b;", nessa ordem', () => {
        expect(state.ui?.events[0].elementos![0].conteudo!.texto).to.be.equal('texto novo inciso:');
        expect(state.ui?.events[0].elementos![1].conteudo!.texto).to.be.equal('texto nova alínea a;');
        expect(state.ui?.events[0].elementos![2].conteudo!.texto).to.be.equal('texto nova alínea b;');
      });

      it('Cada elemento deveria possuir uma revisão de inclusão', () => {
        expect(state.ui?.events[0].elementos?.every(e => (e.revisao as RevisaoElemento).stateType === StateType.ElementoIncluido)).to.be.true;
      });
    });

    describe('Testando evento ElementoIncluido', () => {
      it('Deveria possuir 3 elementos', () => {
        expect(state.ui?.events[1].elementos?.length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "texto novo inciso:", "texto nova alínea a;" e "texto nova alínea b;", nessa ordem', () => {
        expect(state.ui?.events[1].elementos![0].conteudo!.texto).to.be.equal('texto novo inciso:');
        expect(state.ui?.events[1].elementos![1].conteudo!.texto).to.be.equal('texto nova alínea a;');
        expect(state.ui?.events[1].elementos![2].conteudo!.texto).to.be.equal('texto nova alínea b;');
      });

      it('Os elementos devem possuir revisão de inclusão', () => {
        expect(state.ui?.events[1].elementos?.every(e => e.revisao && (e.revisao as RevisaoElemento).stateType === StateType.ElementoIncluido)).to.be.true;
      });
    });

    describe('Testando evento ElementoRenumerado (**)', () => {
      it('Deveria possuir 7 elementos (4 adicionados e 3 originais)', () => {
        expect(state.ui?.events[4].elementos?.length).to.be.equal(7);
        expect(state.ui?.events[4].elementos?.filter(e => e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO).length).to.be.equal(4);
        expect(state.ui?.events[4].elementos?.filter(e => e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL).length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "teste G:", "teste J:", "teste M:" e "teste P:", nessa ordem', () => {
        expect(state.ui?.events[4].elementos![0].conteudo!.texto).to.be.equal('teste G:');
        expect(state.ui?.events[4].elementos![1].conteudo!.texto).to.be.equal('teste J:');
        expect(state.ui?.events[4].elementos![2].conteudo!.texto).to.be.equal('teste M:');
        expect(state.ui?.events[4].elementos![3].conteudo!.texto).to.be.equal('teste P:');
      });

      it('Os elementos não devem possuir revisão', () => {
        expect(state.ui?.events[4].elementos?.every(e => !e.revisao)).to.be.true;
      });
    });
  });

  describe('Adicionando novo inciso após inciso "art1_par1u_inc1-2", rejeitando a inclusão, fazendo UNDO e fazendo REDO', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
      state = elementoReducer(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual: createElemento(d),
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(d),
          conteudo: {
            texto: TEXTO_006,
          },
        },
        isColarSubstituindo: false,
        posicao: 'depois',
      });

      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
      state = elementoReducer(state, { type: REDO });
    });

    it('Deveria não possuir revisão', () => {
      expect(state.revisoes?.length).to.be.equal(0);
    });

    it('Deveria possuir inciso "art1_par1u_inc1-3" com texto "teste G:"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
      expect(d.texto).to.be.equal('teste G:');
    });

    it('Deveria apresentar os incisos subsequentes com os textos "teste J:", "teste M:" e "teste P:", nessa ordem', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
      expect(d.filhos[4].texto).to.be.equal('teste J:');
      expect(d.filhos[5].texto).to.be.equal('teste M:');
      expect(d.filhos[6].texto).to.be.equal('teste P:');
    });

    it('Deveria possuir "State.ui.events" com eventos: RevisaoRejeitada, ElementoRemovido, ElementoRenumerado', () => {
      expect(state.ui?.events[0].stateType).to.be.equal(StateType.RevisaoRejeitada);
      expect(state.ui?.events[1].stateType).to.be.equal(StateType.ElementoRemovido);
      expect(state.ui?.events[2].stateType).to.be.equal(StateType.ElementoRenumerado);
    });

    describe('Testando evento RevisaoRejeitada', () => {
      it('Deveria possuir 3 elementos', () => {
        expect(state.ui?.events[0].elementos?.length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "texto novo inciso:", "texto nova alínea a;" e "texto nova alínea b;", nessa ordem', () => {
        expect(state.ui?.events[0].elementos![0].conteudo!.texto).to.be.equal('texto novo inciso:');
        expect(state.ui?.events[0].elementos![1].conteudo!.texto).to.be.equal('texto nova alínea a;');
        expect(state.ui?.events[0].elementos![2].conteudo!.texto).to.be.equal('texto nova alínea b;');
      });

      it('Cada elemento deveria possuir uma revisão de inclusão', () => {
        expect(state.ui?.events[0].elementos?.every(e => (e.revisao as RevisaoElemento).stateType === StateType.ElementoIncluido)).to.be.true;
      });
    });

    describe('Testando evento ElementoRemovido', () => {
      it('Deveria possuir 3 elementos', () => {
        expect(state.ui?.events[1].elementos?.length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "texto novo inciso:", "texto nova alínea a;" e "texto nova alínea b;", nessa ordem', () => {
        expect(state.ui?.events[1].elementos![0].conteudo!.texto).to.be.equal('texto novo inciso:');
        expect(state.ui?.events[1].elementos![1].conteudo!.texto).to.be.equal('texto nova alínea a;');
        expect(state.ui?.events[1].elementos![2].conteudo!.texto).to.be.equal('texto nova alínea b;');
      });

      it('Os elementos não devem possuir revisão', () => {
        expect(state.ui?.events[1].elementos?.every(e => !e.revisao)).to.be.true;
      });
    });

    describe('Testando evento ElementoRenumerado (***)', () => {
      it('Deveria possuir 7 elementos (4 adicionados e 3 originais)', () => {
        expect(state.ui?.events[2].elementos?.length).to.be.equal(7);
        expect(state.ui?.events[2].elementos?.filter(e => e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO).length).to.be.equal(4);
        expect(state.ui?.events[2].elementos?.filter(e => e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL).length).to.be.equal(3);
      });

      it('O texto de cada elemento deveria ser "teste G:", "teste J:", "teste M:" e "teste P:", nessa ordem', () => {
        expect(state.ui?.events[2].elementos![0].conteudo!.texto).to.be.equal('teste G:');
        expect(state.ui?.events[2].elementos![1].conteudo!.texto).to.be.equal('teste J:');
        expect(state.ui?.events[2].elementos![2].conteudo!.texto).to.be.equal('teste M:');
        expect(state.ui?.events[2].elementos![3].conteudo!.texto).to.be.equal('teste P:');
      });

      it('Os elementos não devem possuir revisão', () => {
        expect(state.ui?.events[2].elementos?.every(e => !e.revisao)).to.be.true;
      });
    });
  });
});
