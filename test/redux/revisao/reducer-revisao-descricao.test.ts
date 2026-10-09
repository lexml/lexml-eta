import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { TAB } from '../../../src/model/lexml/acao/tabAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

let state: State;

const descricoesPrincipais = (): (string | undefined)[] => (state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[]).map(r => r.descricao);

const elementoDe = (id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(state.articulacao!, id)!);

const alteraTexto = (id: string, texto: string): void => {
  const e = elementoDe(id);
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

describe('Descrição da marca de revisão acompanha as operações (MPV 905/2019)', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  it('movido isolado informa o rótulo anterior derivado da posição', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art3') });
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo movido (antes era "Artigo Art. 3º")']);
  });

  it('movido e depois alterado lista as duas operações', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art3') });
    alteraTexto('art4', 'texto do artigo movido;');
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado']);
  });

  it('artigo movido e alterado duas vezes mantém a descrição combinada', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art3') });
    alteraTexto('art4', 'primeira alteração;');
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art4') });
    alteraTexto('art5', 'segunda alteração;');
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado']);
  });

  it('desfazer a alteração de texto do movido volta à descrição só de movido', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art3') });
    alteraTexto('art4', 'texto do artigo movido;');
    state = elementoReducer(state, { type: UNDO });
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo movido (antes era "Artigo Art. 3º")']);
  });

  it('desfazer e refazer a movimentação mantém a descrição', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
    state = elementoReducer(state, { type: UNDO });
    expect(descricoesPrincipais()).to.deep.equal([]);
    state = elementoReducer(state, { type: REDO });
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo movido (antes era "Inciso I –")']);
  });

  it('transformado e depois alterado lista as duas operações', () => {
    state = elementoReducer(state, { type: TAB, atual: elementoDe('art1_par1u_inc2') });
    alteraTexto('art1_par1u_inc1_ali1', 'texto da alínea;');
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo transformado (antes era "inciso") e texto alterado']);
  });

  it('alterado e depois movido começa pela movimentação, para a frase ler bem', () => {
    alteraTexto('art1_par1u_inc1', 'texto alterado antes de mover;');
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo movido (antes era "Inciso I –") e texto alterado']);
  });

  it('adicionado, removido e alterado mantêm as descrições de sempre', () => {
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: elementoDe('art1_par1u_inc1'), novo: { tipo: 'Inciso' } });
    expect(descricoesPrincipais()).to.deep.equal(['Dispositivo adicionado']);

    state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe('art1_par1u_inc3') });
    expect(descricoesPrincipais()).to.include('Dispositivo removido');

    alteraTexto('art1_par1u_inc1', 'texto alterado;');
    expect(descricoesPrincipais()).to.include('Texto do dispositivo foi alterado');
  });

  it('o dispositivo excluído continua descrito como "Dispositivo removido"', () => {
    state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe('art1_par1u') });
    state.revisoes!.forEach(r => expect(r.descricao).to.equal('Dispositivo removido'));
  });
});
