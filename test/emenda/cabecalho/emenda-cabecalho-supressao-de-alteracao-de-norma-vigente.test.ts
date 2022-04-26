import { expect } from '@open-wc/testing';

import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com supressão de alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // it('supressaoAlteracaoNormaVigente', () => {
  //   TesteCmdEmdUtil.suprimeAlteracaoNormaVigente(state, 'art6_cpt');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao art. 6º do Projeto a seguinte redação:');
  // });
});
