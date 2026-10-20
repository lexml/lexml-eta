import { expect } from '@open-wc/testing';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';
import { State } from '../../../src/redux/state';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

let state: State;

const abre = (): void => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
};

const elementoDe = (id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(state.articulacao!, id)!);

const revisoes = (): any[] => montaRevisoesArticulacao(state)!.revisoesArticulacao.revisaoArticulacao;

const coletaIds = (valor: any, ids: string[] = []): string[] => {
  if (Array.isArray(valor)) valor.forEach(v => coletaIds(v, ids));
  else if (valor && typeof valor === 'object') {
    if (typeof valor.id === 'string') ids.push(valor.id);
    Object.values(valor).forEach(v => coletaIds(v, ids));
  }
  return ids;
};

// O bloco de alteração fica no nó do Caput do artigo.
const achaAlteracao = (valor: any): any => {
  if (!valor || typeof valor !== 'object') return undefined;
  if (valor.alteracao) return valor.alteracao;
  return Object.values(valor)
    .map(achaAlteracao)
    .find(a => a !== undefined);
};

describe('montaRevisoesArticulacao: dispositivo com bloco de alteração (MPV 1234/2024)', () => {
  beforeEach(abre);

  it('exclusão grava o bloco de alteração dentro do artigo excluído', () => {
    state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe('art1') });

    const excluidas = revisoes().filter(r => r.revisao === 'excluido');
    expect(excluidas).to.have.length(1);

    const artigo = excluidas[0].artigo;
    expect(artigo.id).to.equal('_art1-exc1');
    const alteracao = achaAlteracao(artigo);
    expect(alteracao).to.not.be.undefined;

    const ids = coletaIds(alteracao);
    expect(ids).to.include('_art1-exc1_cpt_alt1_art4');
    expect(ids.every(id => id.startsWith('_art1-exc1_cpt_alt1'))).to.be.true;
  });

  it('exclusão preserva os filhos do bloco de alteração na mesma hierarquia', () => {
    const idsOriginais = coletaIdsDoBloco();
    state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe('art1') });

    const artigo = revisoes().find(r => r.revisao === 'excluido').artigo;
    const idsSalvos = coletaIds(achaAlteracao(artigo)).map(id => id.replace('_art1-exc1', 'art1'));

    expect([...idsSalvos].sort()).to.deep.equal([...idsOriginais].sort());
  });

  it('movimentação mantém o bloco de alteração no artigo da articulação', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1') });

    const movidas = revisoes().filter(r => String(r.revisao).startsWith('movido'));
    expect(movidas).to.have.length(1);
    expect(revisoes().filter(r => r.revisao === 'excluido')).to.have.length(0);
  });
});

function coletaIdsDoBloco(): string[] {
  const artigo = buscaDispositivoById(state.articulacao!, 'art1')!;
  const ids: string[] = [(artigo as any).alteracoes.id];
  const percorre = (d: any): void => {
    ids.push(d.id);
    [...(d.caput ? [d.caput] : []), ...(d.alteracoes ? [d.alteracoes] : []), ...(d.filhos ?? [])].forEach(percorre);
  };
  (artigo as any).alteracoes.filhos.forEach(percorre);
  return ids;
}
