import { expect } from '@open-wc/testing';
import { Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { adicionarRemissaoExternaAction } from '../../../../src/model/lexml/acao/adicionarRemissaoExternaAction';
import { removerRemissaoExternaAction } from '../../../../src/model/lexml/acao/removerRemissaoExternaAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { AutoFix } from '../../../../src/model/lexml/util/mensagem';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { RemissaoExternaValue } from '../../../../src/model/remissao';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../../src/redux/state';

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

const link = (refId: string, urn: string): string => `<a class="lexml-remissao-externa" href="#" data-ref-id="${refId}" data-urn="${urn}">Lei</a>`;

let artigo: Artigo;
let state: State;

const criaEstado = (texto: string, comAlteracao = true): void => {
  const articulacao = createArticulacao();
  artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  if (comAlteracao) {
    createAlteracao(artigo);
    criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!);
  }
  artigo.texto = texto;
  state = { articulacao, past: [], present: [], future: [], ui: { events: [] }, remissoesExternas: {} } as any;
};

const adiciona = (refId: string, urn: string, totalNoLote = 1): void => {
  const value: RemissaoExternaValue = { refId, targetUrn: urn, targetNomeNorma: '', sourceUuid: artigo.uuid };
  state = elementoReducer(state, adicionarRemissaoExternaAction(value, totalNoLote));
};

const temAlertaInformarNorma = (): boolean => {
  const evento = state.ui?.events.find(e => e.stateType === 'ElementoValidado');
  return !!evento?.elementos?.some(e => e.mensagens?.some(m => m.descricao === AutoFix.INFORMAR_NORMA));
};

describe('adicionaRemissaoExterna (preenchimento do base pela remissão única)', () => {
  it('preenche o base com a primeira remissão do artigo de alteração', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');

    adiciona('r1', URN_LEI_14133);

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
    expect(state.remissoesExternas!['r1']).to.not.equal(undefined);
  });

  it('o alerta de norma não informada deixa de ser exibido', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');

    adiciona('r1', URN_LEI_14133);

    const eventos = state.ui!.events.filter(e => e.stateType === 'ElementoValidado');
    expect(eventos.length).to.equal(1);
    expect(temAlertaInformarNorma()).to.equal(false);
  });

  it('não altera um base já preenchido', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');
    artigo.alteracoes!.base = URN_LEI_8666;

    adiciona('r1', URN_LEI_14133);

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_8666);
  });

  it('não preenche com duas remissões no artigo', () => {
    criaEstado(`A ${link('r1', URN_LEI_14133)}, alterada pela Lei, passa a vigorar:`);
    state.remissoesExternas = { r1: { refId: 'r1', targetUrn: URN_LEI_14133, targetNomeNorma: '', sourceUuid: artigo.uuid } };

    adiciona('r2', URN_LEI_8666);

    expect(artigo.alteracoes!.base ?? '').to.equal('');
  });

  it('não preenche com duas citações da mesma norma', () => {
    criaEstado(`A ${link('r1', URN_LEI_14133)}, passa a vigorar:`);
    state.remissoesExternas = { r1: { refId: 'r1', targetUrn: URN_LEI_14133, targetNomeNorma: '', sourceUuid: artigo.uuid } };

    adiciona('r2', URN_LEI_14133);

    expect(artigo.alteracoes!.base ?? '').to.equal('');
  });

  it('não preenche quando a mesma detecção cria duas remissões, em qualquer ordem de despacho', () => {
    criaEstado('A Lei 14.133 e a Lei 8.666, passam a vigorar com as seguintes alterações:');

    adiciona('r1', URN_LEI_14133, 2);
    adiciona('r2', URN_LEI_8666, 2);

    expect(artigo.alteracoes!.base ?? '').to.equal('');
  });

  it('ignora entrada órfã do registro (sem link no texto)', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');
    state.remissoesExternas = { velha: { refId: 'velha', targetUrn: URN_LEI_8666, targetNomeNorma: '', sourceUuid: artigo.uuid } };

    adiciona('r1', URN_LEI_14133);

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
  });

  it('ignora remissões de outros artigos', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');
    state.remissoesExternas = { outra: { refId: 'outra', targetUrn: URN_LEI_8666, targetNomeNorma: '', sourceUuid: artigo.uuid! + 1000 } };

    adiciona('r1', URN_LEI_14133);

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
  });

  it('não preenche em artigo sem bloco de alteração', () => {
    criaEstado('Texto qualquer', false);

    adiciona('r1', URN_LEI_14133);

    expect(artigo.alteracoes).to.equal(undefined);
    expect(state.remissoesExternas!['r1']).to.not.equal(undefined);
  });

  it('desfazer volta o base a vazio', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');

    adiciona('r1', URN_LEI_14133);
    state = elementoReducer(state, UndoAction());

    expect(artigo.alteracoes!.base ?? '').to.equal('');
  });

  it('remover a remissão depois não altera o base', () => {
    criaEstado('A Lei, passa a vigorar com as seguintes alterações:');

    adiciona('r1', URN_LEI_14133);
    state = elementoReducer(state, removerRemissaoExternaAction('r1'));

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
  });
});
