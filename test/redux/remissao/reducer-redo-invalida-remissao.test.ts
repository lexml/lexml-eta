import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../src/model/remissao/remissao';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { inicializaRemissoesAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir';
import { completarRegistroRemissoes } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';

const MENSAGEM_INVALIDA = 'referência para dispositivo que foi excluído';

const criaEntrada = (origem: Dispositivo, alvo: Dispositivo, textoRef: string, inicio: number): RemissaoInternaValue => ({
  refId: `ref_${alvo.uuid}`,
  sourceUuid: origem.uuid,
  targetUuid: alvo.uuid,
  targetLexmlId: alvo.id,
  textoRef,
  inicio,
});

const remover = (s: State, d: Dispositivo): State => {
  const el = createElemento(d, true);
  return elementoReducer(s, removerElementoAction.execute(el, el));
};

const encontrarNos = (no: any, localPart: string, achados: any[] = []): any[] => {
  if (!no || typeof no !== 'object') return achados;
  if (no.name?.localPart === localPart) achados.push(no);
  (Array.isArray(no) ? no : Object.values(no)).forEach(filho => encontrarNos(filho, localPart, achados));
  return achados;
};

describe('Redo de remoção invalida de novo as remissões', () => {
  let state: State;
  let art1: Artigo;
  let art2: Artigo;
  let art3: Artigo;

  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
    [art1, art2, art3] = state.articulacao!.artigos as Artigo[];
  });

  describe('Remissões para o artigo removido, seu inciso e seu caput', () => {
    beforeEach(() => {
      const inciso = criaDispositivo(art2, 'Inciso');
      inciso.texto = 'inciso um;';
      art2.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);

      art1.texto = 'Ver art. 2º, inciso I do art. 2º e caput do art. 2º.';
      state.remissoes = {
        [art1.uuid!]: [criaEntrada(art1, art2, 'art. 2º', 4), criaEntrada(art1, inciso, 'inciso I do art. 2º', 13), criaEntrada(art1, art2.caput!, 'caput do art. 2º', 35)],
      };
    });

    it('remover, desfazer e refazer: as três voltam a ser inválidas, com eventos, mensagem e alerta', () => {
      let result = remover(state, art2);
      result = elementoReducer(result, { type: UNDO });
      expect(
        result.remissoes![art1.uuid!].map(e => e.valida),
        'o undo restaura'
      ).to.deep.equal([undefined, undefined, undefined]);

      result = elementoReducer(result, { type: REDO });

      expect(result.remissoes![art1.uuid!].map(e => e.valida)).to.deep.equal([false, false, false]);
      const eventos = result.ui?.events ?? [];
      expect(eventos.filter(e => e.stateType === StateType.RemissaoInvalidada).map(e => e.remissaoInvalidacao?.lexmlId)).to.include.members(['art2', 'art2_cpt', 'art2_cpt_inc1']);
      const mensagensOrigem = eventos
        .filter(e => e.stateType === StateType.ElementoValidado)
        .flatMap(e => e.elementos ?? [])
        .filter(e => e.uuid === art1.uuid)
        .flatMap(e => e.mensagens ?? []);
      expect(
        mensagensOrigem.some(m => m.descricao?.includes(MENSAGEM_INVALIDA)),
        'mensagem na origem'
      ).to.be.true;
      expect((result.ui?.alertas ?? []).map(a => a.id)).to.include(`alerta-remissao-invalida-${art1.uuid}`);
    });

    it('desfazer de novo depois do redo restaura as três', () => {
      let result = remover(state, art2);
      result = elementoReducer(result, { type: UNDO });
      result = elementoReducer(result, { type: REDO });
      result = elementoReducer(result, { type: UNDO });

      expect(result.remissoes![art1.uuid!].map(e => e.valida)).to.deep.equal([undefined, undefined, undefined]);
      expect((result.ui?.alertas ?? []).map(a => a.id)).to.not.include(`alerta-remissao-invalida-${art1.uuid}`);
    });
  });

  it('salvar depois do redo grava a remissão como inválida, e não como válida para o artigo que herdou o número', () => {
    art1.texto = `Ver o <a href="art2_cpt" data-lexml-ref="art2_cpt" class="lexml-remissao-interna" target="_self">caput do art. 2º</a> desta lei.`;
    state.remissoes = inicializaRemissoesAoAbrir(state.articulacao!);

    let result = remover(state, art2);
    result = elementoReducer(result, { type: UNDO });
    result = elementoReducer(result, { type: REDO });

    const registroCompleto = completarRegistroRemissoes(result.articulacao!, result.remissoes ?? {});
    const projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'TESTE' },
      ementa: { texto: 'Ementa' } as any,
      preambulo: { texto: '' },
      articulacao: result.articulacao!,
    };
    const jsonix = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', registroCompleto);

    const [remissao] = encontrarNos(jsonix.value.projetoNorma.norma.articulacao.lXhier[0], 'Remissao');
    expect(remissao, 'a serialização deve conter um nó Remissao').to.exist;
    // String(...): o chai-dom quebra o .match quando o valor é undefined.
    expect(String(remissao.value.id), 'remissão salva como inválida').to.match(/^_ri\d+$/);
  });

  it('regressão: refazer a rejeição de uma movimentação continua sem invalidar a remissão', () => {
    art1.texto = 'Conforme o art. 3º, aplica-se.';
    state.remissoes = { [art1.uuid!]: [criaEntrada(art1, art3, 'art. 3º', 11)] };

    let result = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    result = elementoReducer(result, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(art3) });
    const principal = (result.revisoes ?? []).filter(isRevisaoPrincipal)[0];
    expect(principal, 'mover em revisão deveria gerar revisão principal').to.exist;
    result = elementoReducer(result, { type: REJEITAR_REVISAO, revisao: principal });
    result = elementoReducer(result, { type: UNDO });
    result = elementoReducer(result, { type: REDO });

    expect(result.remissoes![art1.uuid!][0].valida).to.not.equal(false);
    expect((result.ui?.events ?? []).filter(e => e.stateType === StateType.RemissaoInvalidada)).to.be.empty;
  });
});
