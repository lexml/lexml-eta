import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { exibirDiferencaAction } from '../../../src/model/lexml/acao/exibirDiferencaAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { State, StateType } from '../../../src/redux/state';

const TOTAL = 7;

const resumo = (state: State): string[] => state.articulacao!.artigos.map(a => `${a.rotulo} ${a.texto}`);

const principais = (state: State): RevisaoElemento[] => state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

// Relato: 7 artigos, um novo na posição 4 e o "Teste 4." (com o texto alterado ou não) movido para cima, em modo de revisão.
const cenario = (alteraTexto: boolean): { state: State; artigoNovoUuid: number; antesDeMover: string[] } => {
  const articulacao = createArticulacao();
  const artigos = Array.from({ length: TOTAL }, (_, i) => {
    const artigo = criaDispositivo(articulacao, 'Artigo', undefined, i);
    artigo.texto = `Teste ${i + 1}.`;
    return artigo;
  });
  articulacao.renumeraFilhos();
  artigos.forEach(a => a.createRotulo(a));
  updateIdDispositivoAndFilhos(articulacao);
  let state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao, classificacao: ClassificacaoDocumento.PROJETO });
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  const uuidMovido = artigos[3].uuid!;
  const porUuid = (uuid: number): ReturnType<typeof createElemento> => createElemento(state.articulacao!.artigos.find(a => a.uuid === uuid)!);

  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(artigos[2]), novo: { tipo: 'Artigo' } });
  const artigoNovoUuid = principais(state).find(r => r.revisao === 'adicionado')!.elementoAposRevisao.uuid!;
  const antesDeMover = resumo(state);
  if (alteraTexto) {
    const e = porUuid(uuidMovido);
    e.conteudo!.texto = 'Teste 4 alterado.';
    state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
  }
  state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: porUuid(uuidMovido) });
  return { state, artigoNovoUuid, antesDeMover };
};

const elementoMovidoNoEvento = (state: State): any => state.ui!.events.find(ev => ev.stateType === StateType.ElementoIncluido)!.elementos![0];

describe('Movimentação de dispositivo com texto alterado, em modo de revisão', () => {
  it('a revisão guarda a movimentação e a alteração de texto', () => {
    const { state } = cenario(true);
    expect(principais(state).map(r => r.revisao)).to.deep.equal(['adicionado', 'alterado,movido;5']);
  });

  it('continua oferecendo a exibição das diferenças depois de mover um dispositivo com texto alterado', () => {
    const { state } = cenario(true);
    expect(elementoMovidoNoEvento(state).acoesPossiveis).to.include(exibirDiferencaAction);
  });

  it('não oferece a exibição das diferenças quando só houve movimentação', () => {
    const { state } = cenario(false);
    expect(elementoMovidoNoEvento(state).acoesPossiveis ?? []).to.not.include(exibirDiferencaAction);
  });

  it('rejeitar a movimentação devolve o texto original depois do artigo novo e informa onde desenhar a linha', () => {
    const { state: criado, artigoNovoUuid, antesDeMover } = cenario(true);
    const movido = principais(criado).find(r => r.revisao?.includes('movido'))!;
    const elementoDaLinha = createElemento(criado.articulacao!.artigos.find(a => a.uuid === movido.elementoAposRevisao.uuid)!);

    const state = elementoReducer(criado, { type: REJEITAR_REVISAO, elemento: elementoDaLinha });

    expect(resumo(state)).to.deep.equal(antesDeMover);
    const inclusao = state.ui!.events.find(ev => ev.stateType === StateType.ElementoIncluido)!;
    expect((inclusao.referencia as any)?.uuid).to.equal(artigoNovoUuid);
  });
});
