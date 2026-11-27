import { expect } from '@open-wc/testing';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';
import { State, StateType } from '../../../src/redux/state';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REMOVER_ELEMENTO, removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { ELEMENTO_SELECIONADO } from '../../../src/model/lexml/acao/elementoSelecionadoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { getRevisoesElementoAssociadas, getUuidPaiEfetivoDoElemento, isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';

const ART_COM_BLOCO = 'art1';
const ART_DO_BLOCO = 'art1_cpt_alt1_art4';

let state: State;

const principais = (): RevisaoElemento[] => state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

const quantidadeNoModelo = (): number => getDispositivoAndFilhosAsLista(state.articulacao!).length;

const abre = (): void => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
};

describe('Revisão de dispositivo com bloco de alteração (MPV 1234/2024)', () => {
  beforeEach(abre);

  describe('getUuidPaiEfetivoDoElemento', () => {
    it('devolve o artigo hospedeiro para o primeiro nível do bloco de alteração', () => {
      const elemento = createElemento(buscaDispositivoById(state.articulacao!, ART_DO_BLOCO)!);

      expect(elemento.hierarquia!.pai!.tipo).to.equal('Articulacao');
      expect(getUuidPaiEfetivoDoElemento(elemento)).to.equal(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!.uuid);
    });

    it('devolve o próprio pai fora do bloco de alteração', () => {
      const elemento = createElemento(buscaDispositivoById(state.articulacao!, 'art2')!);

      expect(getUuidPaiEfetivoDoElemento(elemento)).to.equal(elemento.hierarquia!.pai!.uuid);
    });
  });

  describe('exclusão', () => {
    it('gera uma única revisão principal, com os dispositivos do bloco associados', () => {
      const antes = quantidadeNoModelo();
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!) });

      expect(quantidadeNoModelo()).to.be.lessThan(antes);
      expect(principais()).to.have.length(1);
      const associadas = getRevisoesElementoAssociadas(state.revisoes, principais()[0]);
      expect(associadas.some(r => r.elementoAntesRevisao?.lexmlId === ART_DO_BLOCO)).to.be.true;
      expect(associadas).to.have.length(state.revisoes!.length);
    });

    it('desfazer e refazer mantêm uma única revisão principal', () => {
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!) });
      state = elementoReducer(state, { type: UNDO });
      expect(state.revisoes).to.have.length(0);

      state = elementoReducer(state, { type: REDO });
      expect(principais()).to.have.length(1);
    });

    it('rejeitar a revisão restaura o artigo com o bloco de alteração', () => {
      const antes = quantidadeNoModelo();
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!) });
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: principais()[0] });

      expect(state.revisoes).to.have.length(0);
      expect(quantidadeNoModelo()).to.equal(antes);
      expect(buscaDispositivoById(state.articulacao!, ART_DO_BLOCO)).to.not.be.undefined;
    });
  });

  describe('remoção do artigo hospedeiro com dispositivo do bloco já removido em revisão', () => {
    const MENSAGEM = 'Não é possível remover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão.';

    const hospedeiro = (): Dispositivo => buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!;

    // Depois de remover o 1º artigo, o seguinte é renumerado e herda o id: compara-se por uuid.
    const hospedeiroNaArticulacao = (uuid: number | undefined): boolean => state.articulacao!.artigos.some(a => a.uuid === uuid);

    const removeDoBloco = (): void => {
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_DO_BLOCO)!) });
    };

    const tentaRemoverHospedeiro = (): void => {
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(hospedeiro()) });
    };

    const acoesDoMenu = (id: string): unknown[] => {
      state = elementoReducer(state, { type: ELEMENTO_SELECIONADO, atual: createElemento(buscaDispositivoById(state.articulacao!, id)!) });
      const evento = state.ui!.events.find(ev => ev.stateType === StateType.ElementoSelecionado)!;
      return evento.elementos![0].acoesPossiveis ?? [];
    };

    it('recusa a remoção do hospedeiro e mantém a única revisão', () => {
      const uuid = hospedeiro().uuid;
      removeDoBloco();
      expect(principais()).to.have.length(1);

      tentaRemoverHospedeiro();

      expect(state.ui!.message?.descricao).to.equal(MENSAGEM);
      expect(hospedeiroNaArticulacao(uuid)).to.be.true;
      expect(principais()).to.have.length(1);
    });

    it('o menu do hospedeiro não oferece "Remover"', () => {
      expect(acoesDoMenu(ART_COM_BLOCO)).to.include(removerElementoAction);
      removeDoBloco();

      expect(acoesDoMenu(ART_COM_BLOCO)).not.to.include(removerElementoAction);
    });

    it('rejeitar a revisão do dispositivo do bloco libera a remoção', () => {
      const uuid = hospedeiro().uuid;
      removeDoBloco();
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: principais()[0] });

      expect(acoesDoMenu(ART_COM_BLOCO)).to.include(removerElementoAction);
      tentaRemoverHospedeiro();

      expect(hospedeiroNaArticulacao(uuid)).to.be.false;
    });

    it('aceitar a revisão do dispositivo do bloco libera a remoção', () => {
      const uuid = hospedeiro().uuid;
      removeDoBloco();
      state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: principais()[0] });

      expect(acoesDoMenu(ART_COM_BLOCO)).to.include(removerElementoAction);
      tentaRemoverHospedeiro();

      expect(hospedeiroNaArticulacao(uuid)).to.be.false;
    });
  });

  describe('movimentação', () => {
    it('gera uma única revisão principal para o artigo com bloco de alteração', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!) });

      expect(principais()).to.have.length(1);
      expect(principais()[0].revisao).to.contain('movido');
    });

    it('desfazer remove a revisão e mantém o bloco de alteração', () => {
      const quantidade = quantidadeNoModelo();
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!) });
      state = elementoReducer(state, { type: UNDO });

      expect(state.revisoes).to.have.length(0);
      expect(quantidadeNoModelo()).to.equal(quantidade);
      expect(buscaDispositivoById(state.articulacao!, ART_DO_BLOCO)).to.not.be.undefined;
    });

    it('rejeitar a revisão devolve o artigo e o bloco à posição original', () => {
      const quantidade = quantidadeNoModelo();
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, ART_COM_BLOCO)!) });
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: principais()[0] });

      expect(state.revisoes).to.have.length(0);
      expect(quantidadeNoModelo()).to.equal(quantidade);
      expect(buscaDispositivoById(state.articulacao!, ART_DO_BLOCO)).to.not.be.undefined;
    });
  });
});
