import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { DispositivoAdicionado } from './../../../src/model/lexml/situacao/dispositivoAdicionado';
import { TesteCmdEmdUtil } from './../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com adição de dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  it('acrescimoArtigoComCaput', () => {
    const d = TesteCmdEmdUtil.incluiArtigo(state, 'art1_cpt_alt1_art1', false);
    d.numero = '1-1';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescente-se art. 1º-A à Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('acrescimoParagrafo', () => {
    const d = TesteCmdEmdUtil.incluiParagrafoAlteracao(state, 'art1_cpt_alt1_art5_par4', false);
    d.numero = '5';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescente-se § 5º ao art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('acrescimoParagrafo', () => {
    // TODO - Incluir parágrafo único mesmo (depende de alteração no TesteCmdEmdUtil)
    const d = TesteCmdEmdUtil.incluiParagrafoAlteracao(state, 'art1_cpt_alt1_art5_par4', false);
    d.rotulo = 'Parágrafo único';
    d.createNumeroFromRotulo(d.rotulo);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescente-se parágrafo único ao art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('acrescimoIncisoDoCaput', () => {
    const d = TesteCmdEmdUtil.incluiIncisoAlteracao(state, 'art1_cpt_alt1_art2_cpt_inc7', false);
    d.numero = '8';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescente-se inciso VIII ao <i>caput</i> do art. 2º da Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('acrescimoAlinea', () => {
    const d = TesteCmdEmdUtil.incluiAlineaAlteracao(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali1', false);
    d.numero = '1-1';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescente-se alínea “a-A” ao inciso I do <i>caput</i> do art. 63-C da Lei nº 11.343, de 23 de agosto de 2006, na forma proposta pelo art. 2º da Medida Provisória, nos termos a seguir:'
    );
  });
});
