import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { findRevisaoByElementoUuid, isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { reconstroiRevisoes } from '../../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';

const TOTAL = 7;
const NUMEROS = Array.from({ length: TOTAL }, (_, i) => i);

const permutacoes = <T>(lista: T[]): T[][] =>
  lista.length <= 1 ? [lista] : lista.flatMap((item, i) => permutacoes([...lista.slice(0, i), ...lista.slice(i + 1)]).map(resto => [item, ...resto]));

// Os artigos ficam em ordem na articulação, mas são criados (e recebem uuid) na ordem informada.
const criaArtigos = (ordemCriacao: number[]): { state: State; uuids: number[]; artigos: any[] } => {
  const articulacao = createArticulacao();
  const criados: number[] = [];
  const porNumero: any[] = [];
  ordemCriacao.forEach(n => {
    const posicao = criados.filter(c => c < n).length;
    const artigo = criaDispositivo(articulacao, 'Artigo', undefined, posicao);
    artigo.texto = `Teste ${n + 1}.`;
    porNumero[n] = artigo;
    criados.push(n);
  });
  articulacao.renumeraFilhos();
  porNumero.forEach(a => a.createRotulo(a));
  updateIdDispositivoAndFilhos(articulacao);
  let state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao, classificacao: ClassificacaoDocumento.PROJETO });
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  return { state, uuids: porNumero.map(a => a.uuid), artigos: porNumero };
};

const excluiEmRevisao = (indices: number[], ordemCriacao = NUMEROS): { state: State; uuids: number[] } => {
  const { state: inicial, uuids, artigos } = criaArtigos(ordemCriacao);
  const state = indices.reduce((s, i) => elementoReducer(s, { type: REMOVER_ELEMENTO, atual: createElemento(artigos[i]) }), inicial);
  return { state, uuids };
};

const rejeita = (state: State, uuid: number): State => elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoUuid(state.revisoes, uuid) });

const resumo = (state: State): string[] => state.articulacao!.artigos.map(a => `${a.rotulo} ${a.texto}`);

const esperado = (numeros: number[]): string[] => numeros.map((n, i) => `Art. ${i + 1}º Teste ${n}.`);

const ORDENS_DE_CRIACAO: Array<[string, number[]]> = [
  ['uuids crescentes', NUMEROS],
  ['uuids decrescentes', [...NUMEROS].reverse()],
  ['uuids embaralhados', [3, 0, 6, 2, 4, 1, 5]],
];

describe('Rejeitar exclusões de artigos em revisão, em qualquer ordem', () => {
  it('excluir 5, 4 e 1 e rejeitar 5 e depois 4 mantém a ordem original e os rótulos', () => {
    const { state: excluido, uuids } = excluiEmRevisao([4, 3, 0]);

    const aposTeste5 = rejeita(excluido, uuids[4]);
    expect(resumo(aposTeste5)).to.deep.equal(esperado([2, 3, 5, 6, 7]));

    const aposTeste4 = rejeita(aposTeste5, uuids[3]);
    expect(resumo(aposTeste4)).to.deep.equal(esperado([2, 3, 4, 5, 6, 7]));
  });

  it('rejeitar também a exclusão do artigo 1 devolve os sete artigos na ordem', () => {
    const { state, uuids } = excluiEmRevisao([4, 3, 0]);

    const final = [4, 3, 0].reduce((s, i) => rejeita(s, uuids[i]), state);

    expect(resumo(final)).to.deep.equal(esperado([1, 2, 3, 4, 5, 6, 7]));
  });

  ORDENS_DE_CRIACAO.forEach(([nomeCriacao, ordemCriacao]) => {
    describe(`todas as ordens de exclusão e de rejeição de três artigos vizinhos (${nomeCriacao})`, () => {
      const vizinhos = [2, 3, 4];
      permutacoes(vizinhos).forEach(ordemExclusao => {
        permutacoes(vizinhos).forEach(ordemRejeicao => {
          it(`exclui ${ordemExclusao.map(i => i + 1)} e rejeita ${ordemRejeicao.map(i => i + 1)}`, () => {
            const { state: excluido, uuids } = excluiEmRevisao(ordemExclusao, ordemCriacao);
            let state = excluido;
            const presentes = new Set([0, 1, 5, 6]);

            ordemRejeicao.forEach(i => {
              state = rejeita(state, uuids[i]);
              presentes.add(i);
              const numeros = [...presentes].sort((a, b) => a - b).map(n => n + 1);
              expect(resumo(state), `após rejeitar o artigo ${i + 1}`).to.deep.equal(esperado(numeros));
            });
          });
        });
      });
    });
  });

  it('excluir artigos não vizinhos e rejeitar em ordem arbitrária mantém a ordem original', () => {
    const { state: excluido, uuids } = excluiEmRevisao([5, 1, 3, 0], [3, 0, 6, 2, 4, 1, 5]);

    const final = [3, 0, 5, 1].reduce((s, i) => rejeita(s, uuids[i]), excluido);

    expect(resumo(final)).to.deep.equal(esperado([1, 2, 3, 4, 5, 6, 7]));
  });
});

describe('Rejeitar exclusões vizinhas em documento reaberto (MPV 905/2019)', () => {
  const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';
  const json = (s: State): string => JSON.stringify(buildJsonixArticulacaoFromProjetoNorma(s.articulacao!));
  const principais = (s: State): RevisaoElemento[] => s.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];
  const porTexto = (s: State): RevisaoElemento[] =>
    principais(s).sort((a, b) => (a.elementoAposRevisao.conteudo?.texto ?? '').localeCompare(b.elementoAposRevisao.conteudo?.texto ?? ''));

  const sessao = (): State => {
    let s = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: buildProjetoNormaFromJsonix(MPV_905_2019).articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    s = elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
    // Dois artigos consecutivos excluídos no mesmo lugar: o art. 3 e depois o art. 2.
    [3, 2].forEach(n => {
      const artigo = s.articulacao!.artigos.find(a => a.rotulo?.startsWith(`Art. ${n}`))!;
      s = elementoReducer(s, { type: REMOVER_ELEMENTO, atual: createElemento(artigo) });
    });
    return s;
  };

  const reabre = (origem: State): State => {
    const documento = criarDocumentoArticulado(origem.articulacao!.projetoNorma!, URN, {}, {}, {});
    const aberto = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: buildProjetoNormaFromJsonix(documento, true).articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    const lidas = lerRevisoesArticulacao(montaRevisoesArticulacao(origem)!);
    return elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));
  };

  [
    [0, 1],
    [1, 0],
  ].forEach(ordem => {
    it(`rejeitar as duas exclusões na ordem ${ordem} dá o mesmo resultado na sessão e no documento reaberto`, () => {
      let a = sessao();
      let b = reabre(a);
      expect(porTexto(b)).to.have.length(2);

      ordem.forEach(i => {
        a = elementoReducer(a, { type: REJEITAR_REVISAO, revisao: porTexto(a)[i] });
        b = elementoReducer(b, { type: REJEITAR_REVISAO, revisao: porTexto(b)[i] });
        expect(json(b), `após rejeitar a revisão ${i}`).to.equal(json(a));
      });
    });
  });
});
