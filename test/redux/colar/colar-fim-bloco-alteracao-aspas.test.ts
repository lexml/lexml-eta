import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buscaDispositivoById, getUltimoFilho } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { State, StateEvent, StateType } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { TEXTO_008 } from '../../doc/textos-colar/texto_008';

const ID_CABECA = 'art2_cpt_alt1_art60-1';
const ID_ULTIMO_ANTES_DA_COLAGEM = 'art2_cpt_alt1_art60-1_par4';

let state: State;

const elementosDoEvento = (stateType: StateType): any[] => (state.ui!.events as StateEvent[]).filter(ev => ev.stateType === stateType).flatMap(ev => ev.elementos ?? []);

describe('Testando a atualização das aspas ao colar no fim de um bloco de alteração de norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  it('Deveria iniciar com as aspas de fechamento no último parágrafo do bloco', () => {
    const ultimo = buscaDispositivoById(state.articulacao!, ID_ULTIMO_ANTES_DA_COLAGEM)!;
    expect(createElemento(ultimo).fechaAspas).to.be.true;
  });

  describe('Colando dois parágrafos após o último parágrafo do bloco', () => {
    beforeEach(function () {
      const atual = createElemento(buscaDispositivoById(state.articulacao!, ID_ULTIMO_ANTES_DA_COLAGEM)!);
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: { isDispositivoAlteracao: true, conteudo: { texto: TEXTO_008 } },
        isColarSubstituindo: false,
        posicao: 'depois',
      });
    });

    it('Deveria transferir as aspas de fechamento para o novo último parágrafo', () => {
      const cabeca = buscaDispositivoById(state.articulacao!, ID_CABECA)!;
      const anterior = buscaDispositivoById(state.articulacao!, ID_ULTIMO_ANTES_DA_COLAGEM)!;

      expect(createElemento(anterior).fechaAspas).to.be.false;
      expect(createElemento(getUltimoFilho(cabeca)).fechaAspas).to.be.true;
    });
    it('Deveria emitir SituacaoElementoModificada para o parágrafo que perdeu as aspas', () => {
      const anteriorUuid = buscaDispositivoById(state.articulacao!, ID_ULTIMO_ANTES_DA_COLAGEM)!.uuid;
      const atualizados = elementosDoEvento(StateType.SituacaoElementoModificada);

      const anterior = atualizados.find(e => e.uuid === anteriorUuid);
      expect(anterior, 'o parágrafo que deixou de ser o último precisa ser repintado').to.exist;
      expect(anterior.fechaAspas).to.be.false;
    });

    it('Deveria emitir o novo último parágrafo já com as aspas de fechamento', () => {
      const cabeca = buscaDispositivoById(state.articulacao!, ID_CABECA)!;
      const novoUltimoUuid = getUltimoFilho(cabeca).uuid;
      const atualizados = elementosDoEvento(StateType.SituacaoElementoModificada);

      const novoUltimo = atualizados.find(e => e.uuid === novoUltimoUuid);
      expect(novoUltimo, 'o novo último parágrafo precisa chegar à UI').to.exist;
      expect(novoUltimo.fechaAspas).to.be.true;
    });
  });
});
