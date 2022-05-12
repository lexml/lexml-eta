import { expect } from '@open-wc/testing';
import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';

import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com manipulação de omissis em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // OK
  // it('acrescimoOmissisAposIrmao', () => {
  //   TesteCmdEmdUtil.incluiOmissis(state, 'art6_cpt_alt1_art1_cpt_inc3', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 6º do Projeto' +
  //       ' para acrescentar linha pontilhada (omissis)' +
  //       ' após o inciso III do caput do art. 1º' +
  //       ' da Lei nº 11.340, de 7 de agosto de 2006.'
  //   );
  // });

  // Não foi possível testar por não haver interface para adicionar antes do primeiro.
  // it('acrescimoOmissisEntrePaiEFilho', () => {
  //   TesteCmdEmdUtil.incluiOmissis(state, 'art2_cpt_inc7_alt1_art1_cpt_inc1', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o inciso VII do caput do art. 2º do Projeto' +
  //       ' para acrescentar linha pontilhada (omissis)' +
  //       ' antes do inciso I do caput do art. 1º' +
  //       ' da Lei nº 11.340, de 7 de agosto de 2006.'
  //   );
  // });

  it('supressaoOmissisAposIrmao', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art6_cpt_alt1_art1_cpt_omi2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se do art. 6º do Projeto a linha pontilhada (omissis) após o inciso III do caput do art. 1º da Lei nº 11.340, de 7 de agosto de 2006.'
    );
  });

  it('supressaoOmissisEntrePaiEFilho', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art6_cpt_alt1_art1_cpt_omi1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se do art. 6º do Projeto a linha pontilhada (omissis) antes do inciso III do caput do art. 1º da Lei nº 11.340, de 7 de agosto de 2006.'
    );
  });
});
