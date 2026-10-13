import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { buildProjetoNormaFromJsonix, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { reconstroiRevisoes } from '../../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { State } from '../../../src/redux/state';
import { PRS_92_2023 } from '../../assets/prs_92_2023';

const TOTAL = 7;
const USUARIO = { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' };

const resumo = (state: State): string[] => state.articulacao!.artigos.map(a => `${a.rotulo} ${a.texto}`);

const principais = (state: State): RevisaoElemento[] => state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

const operacoes = (state: State): string[] =>
  principais(state)
    .map(r => r.revisao!.split(';')[0])
    .sort();

const rejeitaPorOperacao = (state: State, operacao: 'adicionado' | 'movido'): State => {
  const revisao = principais(state).find(r => r.revisao?.startsWith(operacao));
  expect(revisao, `revisão "${operacao}" não encontrada`).to.exist;
  return elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
};

// Relato: 7 artigos, um novo na posição 4 e o "Teste 4." movido para cima, em modo de revisão.
// Usa o projetoNorma da PRS 92/2023 só para poder salvar e reabrir o documento.
const cenario = (): { state: State; inicial: string[]; antesDeMover: string[] } => {
  const articulacao = buildProjetoNormaFromJsonix(PRS_92_2023 as any).articulacao!;
  [...articulacao.filhos].forEach(f => articulacao.removeFilho(f));
  const artigos = Array.from({ length: TOTAL }, (_, i) => {
    const artigo = criaDispositivo(articulacao, 'Artigo', undefined, i);
    artigo.texto = `Teste ${i + 1}.`;
    return artigo;
  });
  articulacao.renumeraFilhos();
  artigos.forEach(a => a.createRotulo(a));
  updateIdDispositivoAndFilhos(articulacao);
  let state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao, classificacao: ClassificacaoDocumento.PROJETO });
  state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: USUARIO });
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  const inicial = resumo(state);
  const uuidMovido = artigos[3].uuid!;
  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(artigos[2]), novo: { tipo: 'Artigo' } });
  const antesDeMover = resumo(state);
  state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(state.articulacao!.artigos.find(a => a.uuid === uuidMovido)!) });
  return { state, inicial, antesDeMover };
};

// Salva a proposição com as revisões e a abre de novo.
const reabre = (origem: State): State => {
  const documento = criarDocumentoArticulado(origem.articulacao!.projetoNorma!, 'urn:lex:br:senado.federal:projeto.lei:2026;1', {}, {}, {});
  const projetoNorma = buildProjetoNormaFromJsonix(documento, true);
  let aberto = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  aberto = elementoReducer(aberto, { type: ATUALIZAR_USUARIO, usuario: USUARIO });
  const lidas = lerRevisoesArticulacao(montaRevisoesArticulacao(origem)!);
  aberto = elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));
  return elementoReducer(aberto, { type: ATIVAR_DESATIVAR_REVISAO });
};

const origens: Array<[string, (s: State) => State]> = [
  ['na sessão', s => s],
  ['com o documento salvo e reaberto', reabre],
];

describe('Desfazer a rejeição de revisões de inclusão e de movimentação de artigos', () => {
  origens.forEach(([origem, prepara]) => {
    describe(origem, () => {
      let comAsDuasRevisoes: string[];
      let inicial: string[];
      let antesDeMover: string[];
      let state: State;

      beforeEach(() => {
        const criado = cenario();
        inicial = criado.inicial;
        antesDeMover = criado.antesDeMover;
        state = prepara(criado.state);
        comAsDuasRevisoes = operacoes(state);
        state = rejeitaPorOperacao(state, 'adicionado');
        state = rejeitaPorOperacao(state, 'movido');
      });

      it('desfazer duas vezes devolve as duas revisões', () => {
        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: UNDO });
        expect(operacoes(state)).to.deep.equal(comAsDuasRevisoes);
      });

      it('o primeiro desfazer já devolve a revisão de movimentação', () => {
        state = elementoReducer(state, { type: UNDO });
        expect(operacoes(state)).to.deep.equal(['movido']);
      });

      it('rejeitar a movimentação depois de desfazer duas vezes devolve o artigo para depois do artigo novo', () => {
        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: UNDO });
        state = rejeitaPorOperacao(state, 'movido');
        expect(resumo(state)).to.deep.equal(antesDeMover);
      });

      it('refazer depois de desfazer repete as rejeições', () => {
        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: REDO });
        state = elementoReducer(state, { type: REDO });
        expect(operacoes(state)).to.deep.equal([]);
        expect(resumo(state)).to.deep.equal(inicial);
      });
    });
  });
});
