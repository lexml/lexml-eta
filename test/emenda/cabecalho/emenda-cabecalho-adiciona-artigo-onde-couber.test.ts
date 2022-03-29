import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { DefaultState, State } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com inclusão de artigos onde couber', () => {
  beforeEach(function () {
    const urn = 'urn:lex:br:senado.federal:projeto.lei;plc:2010;00007';
    documento = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);
    documento.urn = urn;
    const artigo = documento.articulacao!.artigos[0]!;
    artigo.rotulo = 'Art.';
    artigo.numero = '1';
    artigo.id = 'art1';
    let situacao = new DispositivoAdicionado();
    situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
    artigo.situacao = situacao;
    const caput = artigo.caput!;
    situacao = new DispositivoAdicionado();
    situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
    caput.situacao = situacao;
    state.articulacao = documento.articulacao;
    state.modo = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
  });

  it('acrescimoArtigoOndeCouber', () => {
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, onde couber, no Projeto o seguinte artigo:');
  });

  it('acrescimoMaisDeUmArtigoOndeCouber', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, onde couber, no Projeto os seguintes artigos:');
  });
});
