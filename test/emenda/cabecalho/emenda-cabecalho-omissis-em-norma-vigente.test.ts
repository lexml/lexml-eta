import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { DefaultState, State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { transformarEmOmissisIncisoParagrafo } from './../../../src/model/lexml/acao/transformarElementoAction';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com manipulação de linha pontilhada em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  // OK
  // it('acrescimoOmissisAposIrmao', () => {
  //   TesteCmdEmdUtil.incluiOmissis(state, 'art6_cpt_alt1_art1_cpt_inc3', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 6º do Projeto' +
  //       ' para acrescentar linha pontilhada (omissis)' +
  //       ' após o inciso III do <i>caput</i> do art. 1º' +
  //       ' da Lei nº 11.340, de 7 de agosto de 2006.'
  //   );
  // });

  it('acrescimoOmissisAposIrmao', () => {
    const d = TesteCmdEmdUtil.incluiIncisoAlteracao(state, 'art1_cpt_alt1_art5_par1_inc1', false);
    transformaTipoElemento(state, transformarEmOmissisIncisoParagrafo.execute(d));
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescente-se linha pontilhada (omissis) após o inciso I do § 1º do art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória.'
    );
  });

  it('supressaoOmissisAposIrmao', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_omi1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se a linha pontilhada (omissis) após o inciso VII do <i>caput</i> do art. 2º da Lei nº 7.560, de 19 de dezembro de 1986, como proposta pelo art. 1º da Medida Provisória.'
    );
  });

  it('supressaoOmissisEntrePaiEFilho', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_omi1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se a linha pontilhada (omissis) antes do inciso VII do <i>caput</i> do art. 2º da Lei nº 7.560, de 19 de dezembro de 1986, como proposta pelo art. 1º da Medida Provisória.'
    );
  });
});
