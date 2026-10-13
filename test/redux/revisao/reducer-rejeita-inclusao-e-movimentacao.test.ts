import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { State } from '../../../src/redux/state';

const TOTAL = 7;

const criaArtigos = (): { state: State; artigos: any[] } => {
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
  return { state, artigos };
};

const resumo = (state: State): string[] => state.articulacao!.artigos.map(a => `${a.rotulo} ${a.texto}`);

// O dispositivo movido ganha novo uuid; sem revisão, a ação rejeitaria todas em lote e mascararia o resultado.
const rejeitaPorOperacao = (state: State, operacao: 'adicionado' | 'movido'): State => {
  const revisao = (state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[]).find(r => r.revisao?.startsWith(operacao));
  expect(revisao, `revisão "${operacao}" não encontrada`).to.exist;
  return elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
};

const elementoPorUuid = (state: State, uuid: number): ReturnType<typeof createElemento> => createElemento(state.articulacao!.artigos.find(a => a.uuid === uuid)!);

type Sentido = 'acima' | 'abaixo';

interface Cenario {
  adicionarDepoisDe: number;
  mover: number;
  sentido: Sentido;
  movimentarAntes: boolean;
  rejeitarInclusaoPrimeiro: boolean;
}

const executa = (c: Cenario): { inicial: string[]; final: string[] } => {
  const { state: aberto, artigos } = criaArtigos();
  const inicial = resumo(aberto);
  const uuidMovido: number = artigos[c.mover].uuid;
  let state = aberto;

  const movimenta = (): void => {
    state = elementoReducer(state, { type: c.sentido === 'acima' ? MOVER_ELEMENTO_ACIMA : MOVER_ELEMENTO_ABAIXO, atual: elementoPorUuid(state, uuidMovido) });
  };
  const adiciona = (): void => {
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: elementoPorUuid(state, artigos[c.adicionarDepoisDe].uuid), novo: { tipo: 'Artigo' } });
  };

  c.movimentarAntes ? (movimenta(), adiciona()) : (adiciona(), movimenta());

  if (c.rejeitarInclusaoPrimeiro) {
    state = rejeitaPorOperacao(state, 'adicionado');
    state = rejeitaPorOperacao(state, 'movido');
  } else {
    state = rejeitaPorOperacao(state, 'movido');
    state = rejeitaPorOperacao(state, 'adicionado');
  }
  return { inicial, final: resumo(state) };
};

describe('Rejeição de inclusão e de movimentação de artigos em modo de revisão', () => {
  it('relato: artigo novo na posição 4, "Teste 4." movido para cima; rejeitar a inclusão e depois a movimentação', () => {
    const { inicial, final } = executa({ adicionarDepoisDe: 2, mover: 3, sentido: 'acima', movimentarAntes: false, rejeitarInclusaoPrimeiro: true });
    expect(final).to.deep.equal(inicial);
  });

  const indices = Array.from({ length: TOTAL }, (_, i) => i);
  const sentidos: Sentido[] = ['acima', 'abaixo'];

  indices.forEach(adicionarDepoisDe => {
    indices.forEach(mover => {
      sentidos.forEach(sentido => {
        if ((sentido === 'acima' && mover === 0) || (sentido === 'abaixo' && mover === TOTAL - 1)) {
          return;
        }
        [true, false].forEach(movimentarAntes => {
          [true, false].forEach(rejeitarInclusaoPrimeiro => {
            const nome = `adiciona após o ${adicionarDepoisDe + 1}º, move o ${mover + 1}º para ${sentido}, ${
              movimentarAntes ? 'movimenta antes de adicionar' : 'adiciona antes de movimentar'
            }, rejeita ${rejeitarInclusaoPrimeiro ? 'a inclusão primeiro' : 'a movimentação primeiro'}`;
            it(nome, () => {
              const { inicial, final } = executa({ adicionarDepoisDe, mover, sentido, movimentarAntes, rejeitarInclusaoPrimeiro });
              expect(final).to.deep.equal(inicial);
            });
          });
        });
      });
    });
  });
});
