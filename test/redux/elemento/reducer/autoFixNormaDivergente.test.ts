import { expect } from '@open-wc/testing';
import { Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { adicionarRemissaoExternaAction } from '../../../../src/model/lexml/acao/adicionarRemissaoExternaAction';
import { autofixAction } from '../../../../src/model/lexml/acao/autoFixAction';
import { removerRemissaoExternaAction } from '../../../../src/model/lexml/acao/removerRemissaoExternaAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { avaliarNormaAlteradaDivergente } from '../../../../src/model/lexml/conteudo/normaAlteradaDivergente';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { atualizaMensagemCritical } from '../../../../src/redux/elemento/reducer/atualizaMensagemCritical';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../../src/redux/state';

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

let artigo: Artigo;
let state: State;

const criaEstado = (texto: string, base?: string, comAlteracao = true): void => {
  const articulacao = createArticulacao();
  artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  if (comAlteracao) {
    createAlteracao(artigo);
    criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!);
    artigo.alteracoes!.base = base;
  }
  artigo.texto = texto;
  state = { articulacao, past: [], present: [], future: [], ui: { events: [] }, remissoesExternas: {} } as any;
};

const adiciona = (refId: string, urn: string): void => {
  state = elementoReducer(state, adicionarRemissaoExternaAction({ refId, targetUrn: urn, targetNomeNorma: '', textoRef: 'Lei', sourceUuid: artigo.uuid }));
};

const eventosValidadoDoArtigo = (): number => state.ui!.events.filter(e => e.stateType === 'ElementoValidado' && e.elementos?.some(el => el.uuid === artigo.uuid)).length;

describe('revalidação do artigo quando o registro de remissões externas muda', () => {
  it('criar a remissão ao vivo (texto sem link) emite a validação do artigo com bloco e base', () => {
    criaEstado('A Lei nº 8.666, de 21 de junho de 1993, passa a vigorar:', URN_LEI_14133);

    adiciona('r2', URN_LEI_8666);

    expect(eventosValidadoDoArtigo()).to.equal(1);
  });

  it('remover a remissão emite a validação do artigo', () => {
    criaEstado('A Lei, passa a vigorar:', URN_LEI_14133);
    adiciona('r1', URN_LEI_8666);

    state = elementoReducer(state, removerRemissaoExternaAction('r1'));

    expect(eventosValidadoDoArtigo()).to.equal(1);
  });

  it('não emite validação para artigo sem bloco de alteração', () => {
    criaEstado('Texto comum', undefined, false);

    adiciona('r1', URN_LEI_14133);

    expect(state.ui!.events).to.deep.equal([]);
  });

  it('o elemento do evento carrega a norma alterada para a tela comparar', () => {
    criaEstado('A Lei, passa a vigorar:', URN_LEI_14133);

    adiciona('r1', URN_LEI_8666);

    const elemento = state.ui!.events.find(e => e.stateType === 'ElementoValidado')!.elementos![0];
    expect(elemento.norma).to.equal(URN_LEI_14133);
  });
});

describe('autofix do aviso de norma alterada divergente', () => {
  const mensagem = (): any => avaliarNormaAlteradaDivergente(artigo.alteracoes!.base, [URN_LEI_14133]);

  const corrigir = (msg: any = mensagem()): void => {
    state = elementoReducer(state, autofixAction.execute(createElemento(artigo, true), msg));
  };

  beforeEach(() => {
    criaEstado('A Lei nº 14.133, passa a vigorar:', URN_LEI_8666);
    state.remissoesExternas = { r1: { refId: 'r1', targetUrn: URN_LEI_14133, targetNomeNorma: '', textoRef: 'Lei nº 14.133', sourceUuid: artigo.uuid } };
  });

  it('alinha o base à norma da remissão mesmo sem a mensagem constar no modelo', () => {
    expect(validaDispositivo(artigo).some(m => m.fix && m.detalhe)).to.equal(false);

    corrigir();

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
  });

  it('corrige o artigo da mensagem (detalhe.uuid) mesmo que a ação venha de outra linha', () => {
    const outra = criaDispositivo(state.articulacao!, TipoDispositivo.artigo.tipo, artigo) as Artigo;
    const msg = { ...mensagem(), detalhe: { ...mensagem().detalhe, uuid: artigo.uuid } };

    state = elementoReducer(state, autofixAction.execute(createElemento(outra, true), msg));

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
  });

  it('não altera o texto', () => {
    const texto = artigo.texto;

    corrigir();

    expect(artigo.texto).to.equal(texto);
  });

  it('pode ser desfeito', () => {
    corrigir();
    state = elementoReducer(state, UndoAction());

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_8666);
  });

  it('revalida o artigo com a norma nova (a tela deixa de ver divergência)', () => {
    corrigir();

    const elemento = state.ui!.events.find(e => e.stateType === 'ElementoValidado')!.elementos![0];
    expect(avaliarNormaAlteradaDivergente(elemento.norma, [URN_LEI_14133])).to.equal(undefined);
  });

  it('não faz nada se a URN da mensagem não consta no registro do artigo', () => {
    corrigir(avaliarNormaAlteradaDivergente(URN_LEI_8666, ['urn:lex:br:federal:lei:2000-01-01;1']));

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_8666);
    expect(state.ui!.events).to.deep.equal([]);
  });

  it('não faz nada se a remissão do registro é de outro artigo', () => {
    state.remissoesExternas = { r1: { refId: 'r1', targetUrn: URN_LEI_14133, targetNomeNorma: '', textoRef: 'Lei', sourceUuid: artigo.uuid! + 1000 } };

    corrigir();

    expect(artigo.alteracoes!.base).to.equal(URN_LEI_8666);
  });
});

describe('aviso de norma alterada divergente e o salvamento', () => {
  it('não vira pendência de preenchimento nem entra em dispositivo.mensagens', () => {
    criaEstado('A Lei, passa a vigorar:', URN_LEI_14133);
    const semAviso = [...(atualizaMensagemCritical(state).mensagensCritical ?? [])];

    criaEstado('A Lei, passa a vigorar:', URN_LEI_8666);
    adiciona('r1', URN_LEI_14133);
    const comAviso = atualizaMensagemCritical(state).mensagensCritical ?? [];

    expect(comAviso).to.deep.equal(semAviso);
    expect(validaDispositivo(artigo).some(m => m.detalhe?.autoFix)).to.equal(false);
  });
});
