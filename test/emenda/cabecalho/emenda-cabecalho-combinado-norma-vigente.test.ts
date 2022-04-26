import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { SituacaoNormaVigente } from '../../../src/model/dispositivo/situacao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com diferentes operações sobre dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  it('alteracaoCaputESupressaoInciso', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art6_cpt_alt1_art1').situacaoNormaVigente = SituacaoNormaVigente.DISPOSITIVO_EXISTENTE;
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art6_cpt_alt1_art1_cpt_inc3');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Altere-se o art. 6º do Projeto para modificar o caput do art. 1º;' +
        ' e suprimir o inciso III do caput do art. 1º da Lei nº 11.340,' +
        ' de 7 de agosto de 2006, nos termos a seguir:'
    );
  });
});
