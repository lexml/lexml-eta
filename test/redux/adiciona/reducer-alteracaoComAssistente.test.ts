import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { ASSISTENTE_ALTERACAO } from '../../../src/model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { isDispositivoCabecaAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';
import { adicionaAlteracaoComAssistente } from '../../../src/redux/elemento/reducer/adicionaAlteracaoComAssistente';
import { StateType } from '../../../src/redux/state';

let state: any;

describe('Testando o assistente de alteração', () => {
  let alteracoes: any;

  beforeEach(function () {
    const articulacao = createArticulacao();
    state = {
      articulacao,
    };
    criaDispositivo(state.articulacao, TipoDispositivo.artigo.tipo) as Artigo;

    state = adicionaAlteracaoComAssistente(state, {
      type: ASSISTENTE_ALTERACAO,
      atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[0].uuid },
      norma: {
        tipo: 'lei',
        numero: '7560',
        data: '19/12/1986',
      },
      dispositivos: 'inciso I do § 1º do Art. 2º',
    });
    alteracoes = state.articulacao.artigos[1].alteracoes;
  });
  it('Deveria apresentar o seguinte texto no artigo de alteração', () => {
    expect(state.articulacao.artigos[1].texto).to.equal('A Lei nº 7.560, de 19/12/1986, passa a vigorar com as seguintes alterações:');
  });
  it('Deveria criar um novo artigo cabeça de alteração', () => {
    expect(isDispositivoCabecaAlteracao(state.articulacao.artigos[1].alteracoes.artigos[0])).to.be.true;
  });
  it('Deveria criar o parágrafo 1 sob o novo artigo cabeça de alteração', () => {
    expect(alteracoes.artigos[0].filhos[0].rotulo).to.be.equal('§ 1º');
  });
  it('Deveria criar o inciso I sob o novo parágrafo', () => {
    expect(alteracoes.artigos[0].filhos[0].filhos[0].rotulo).to.be.equal('I –');
  });
  it('Deveria criar um novo artigo cabeça de alteração', () => {
    expect(isDispositivoCabecaAlteracao(state.articulacao.artigos[1].alteracoes.artigos[0])).to.be.true;
  });
  it('Deveria apresentar 1 evento', () => {
    expect(state.ui.events.length).to.equal(1);
  });
  it('Deveria apresentar 4 elemento incluído', () => {
    const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
    expect(incluido.elementos!.length).equal(4);
    expect(incluido.elementos![0].tipo).to.equal(TipoDispositivo.artigo.tipo);
    expect(incluido.elementos![1].tipo).to.equal(TipoDispositivo.artigo.tipo);
    expect(incluido.elementos![2].tipo).to.equal(TipoDispositivo.paragrafo.tipo);
    expect(incluido.elementos![3].tipo).to.equal(TipoDispositivo.inciso.tipo);
  });
});
