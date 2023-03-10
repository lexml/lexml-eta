import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda adiciona de agrupador de artigo em norma alterada', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  it('Inclusão de agrupador capítulo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art3', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Medida Provisória, o seguinte Capítulo Único:');
  });

  it('Inclusão de agrupador título em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art3', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Medida Provisória, o seguinte Título Único:');
  });
});
