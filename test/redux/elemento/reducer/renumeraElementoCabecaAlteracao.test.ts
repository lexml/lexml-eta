import { expect } from '@open-wc/testing';
import { Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { renumerarElementoAction } from '../../../../src/model/lexml/acao/renumerarElementoAction';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../../src/redux/state';

let cabeca: Artigo;
let state: State;

const renumera = (numero: string): void => {
  state = elementoReducer(state, renumerarElementoAction.execute(createElemento(cabeca, true), numero));
};

describe('renumerar a cabeça de alteração com rótulo pendente', () => {
  beforeEach(() => {
    const articulacao = createArticulacao();
    const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    createAlteracao(artigo);
    cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!, undefined, 0) as Artigo;
    cabeca.existeNaNormaAlterada = true;
    state = { articulacao, past: [], present: [], future: [], ui: { events: [] } } as any;
  });

  it('o número informado compõe o rótulo e o id da cabeça e do caput', () => {
    renumera('5');

    expect(cabeca.rotulo).to.equal('Art. 5º');
    expect(cabeca.id).to.match(/_art5$/);
    expect(cabeca.caput!.id).to.match(/_art5_cpt$/);
    expect(state.ui!.events.some(e => e.stateType === 'ElementoModificado')).to.equal(true);
  });

  it('número iniciado em zero é recusado em alteração', () => {
    const rotuloAntes = cabeca.rotulo;

    renumera('0');

    expect(cabeca.rotulo).to.equal(rotuloAntes);
  });
});
