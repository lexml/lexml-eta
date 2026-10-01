import { expect } from '@open-wc/testing';
import { ASSISTENTE_ALTERACAO } from '../../../src/model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionaAlteracaoComAssistente } from '../../../src/redux/elemento/reducer/adicionaAlteracaoComAssistente';
import { State, StateEvent, StateType } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

let state: State;

const elementosDoEvento = (stateType: StateType): any[] => (state.ui!.events as StateEvent[]).filter(ev => ev.stateType === stateType).flatMap(ev => ev.elementos ?? []);

describe('Testando a renumeração ao adicionar artigo para alterar outra norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;

    const atual = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);
    state = adicionaAlteracaoComAssistente(state, {
      type: ASSISTENTE_ALTERACAO,
      atual,
      norma: 'urn:lex:br:federal:lei:1986-12-19;7560',
      dispositivos: 'Art. 9º',
    });
  });

  it('Deveria renumerar os artigos posteriores na articulação', () => {
    expect(state.articulacao!.artigos[1].rotulo).to.equal('Art. 2º');
    expect(state.articulacao!.artigos[2].rotulo).to.equal('Art. 3º');
  });

  it('Deveria emitir ElementoRenumerado para os artigos deslocados', () => {
    const renumerados = elementosDoEvento(StateType.ElementoRenumerado);

    expect(renumerados.length, 'os artigos empurrados para baixo precisam ser repintados').to.be.greaterThan(0);
    renumerados.forEach(e => expect(e.rotulo).to.exist);
  });

  it('Deveria emitir os rótulos já atualizados', () => {
    const renumerados = elementosDoEvento(StateType.ElementoRenumerado);
    const artigosPosteriores = state.articulacao!.artigos.slice(2);

    artigosPosteriores.forEach(artigo => {
      const emitido = renumerados.find(e => e.uuid === artigo.uuid);
      expect(emitido, `artigo ${artigo.rotulo} precisa ser repintado`).to.exist;
      expect(emitido.rotulo).to.equal(artigo.rotulo);
    });
  });
});
