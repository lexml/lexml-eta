import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { MPV_1089_2021 } from '../../doc/mpv_1089_2021';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda modifica texto de agrupador de artigo em norma alterada', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_1089_2021, true);
    state.articulacao = documento.articulacao;
  });

  it('Suprime agrupador capítulo em norma alterada', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_cap5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se o agrupador Capítulo V da Lei nº 7.565, de 19 de dezembro de 1986, como proposto pelo art. 2º da Medida Provisória.aaaaa'
    );
  });
});
