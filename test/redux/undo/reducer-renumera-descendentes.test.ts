import { expect } from '@open-wc/testing';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';
import { State, StateType } from '../../../src/redux/state';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

const ART4 = 'art1_cpt_alt1_art4';
const PAR = `${ART4}_par4-1`;

let state: State;

const renumera = (id: string, numero: string): void => {
  state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, id)!), novo: { numero } });
};

// Parágrafo "§ 4º-A" (criado antes da revisão) com um inciso filho, em alteração de norma.
const cenario = (): void => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const art4 = buscaDispositivoById(state.articulacao!, ART4)!;
  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(art4.filhos[1]), novo: { tipo: 'Paragrafo' } });
  const par = art4.filhos[2];
  const e = createElemento(par);
  state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: e, novo: { numero: '4-A' } });
  e.conteudo!.texto = 'Parágrafo A:';
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(par), novo: { tipo: 'Inciso' } });
  const inciso = createElemento(par.filhos[0]);
  inciso.conteudo!.texto = 'dispositivo novo.';
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: inciso });
};

const arvore = (): string[] =>
  getDispositivoAndFilhosAsLista(buscaDispositivoById(state.articulacao!, ART4)!)
    .filter(d => d.rotulo)
    .map(d => `${d.tipo}|${d.id}|${d.rotulo}`);

const incisoDoParagrafo = (id: string): string => buscaDispositivoById(state.articulacao!, id)!.filhos[0].id!;

describe('Renumeração manual - ids dos descendentes (MPV 1234/2024)', () => {
  beforeEach(cenario);

  it('parte de um parágrafo com inciso cujo id acompanha o pai', () => {
    expect(buscaDispositivoById(state.articulacao!, PAR)!.rotulo).to.equal('§ 4º-A.');
    expect(incisoDoParagrafo(PAR)).to.match(/^art1_cpt_alt1_art4_par4-1_inc/);
  });

  it('recalcula o id do inciso filho ao renumerar o parágrafo, fora do modo de revisão', () => {
    renumera(PAR, '4-B');

    const par = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art4_par4-2')!;
    expect(par.rotulo).to.equal('§ 4º-B.');
    expect(par.filhos[0].id).to.match(/^art1_cpt_alt1_art4_par4-2_inc/);
    expect(buscaDispositivoById(state.articulacao!, PAR)).to.be.undefined;
  });

  it('emite o inciso em Situação e não em Modificado, para não gerar revisão de texto', () => {
    renumera(PAR, '4-B');

    const eventos = state.ui!.events;
    const modificados = eventos.filter(ev => ev.stateType === StateType.ElementoModificado).flatMap(ev => ev.elementos ?? []);
    const situacao = eventos.filter(ev => ev.stateType === StateType.SituacaoElementoModificada).flatMap(ev => ev.elementos ?? []);

    expect(modificados.map(e => e.lexmlId)).to.deep.equal(['art1_cpt_alt1_art4_par4-2']);
    expect(situacao).to.have.length(1);
    expect(situacao[0].lexmlId).to.match(/^art1_cpt_alt1_art4_par4-2_inc/);
  });

  it('atualiza o lexmlId do snapshot de uma revisão própria do inciso filho', () => {
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    const par = buscaDispositivoById(state.articulacao!, PAR)!;
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(par.filhos[0]), novo: { tipo: 'Inciso' } });
    const adicionados = (state.revisoes as RevisaoElemento[]).filter(r => r.revisao === 'adicionado');
    expect(adicionados).to.have.length(1);
    expect(adicionados[0].elementoAposRevisao.lexmlId).to.match(/^art1_cpt_alt1_art4_par4-1_inc/);

    renumera(PAR, '4-B');

    const depois = (state.revisoes as RevisaoElemento[]).find(r => r.revisao === 'adicionado')!;
    expect(depois.elementoAposRevisao.lexmlId).to.match(/^art1_cpt_alt1_art4_par4-2_inc/);
    expect(depois.elementoAposRevisao.hierarquia!.pai!.lexmlId).to.equal('art1_cpt_alt1_art4_par4-2');
  });

  [false, true].forEach(emRevisao => {
    describe(`desfazer e refazer (em revisão: ${emRevisao})`, () => {
      beforeEach(() => {
        emRevisao && (state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO }));
      });

      it('desfazer devolve rótulo, número e ids do parágrafo e do inciso', () => {
        const antes = arvore();
        renumera(PAR, '4-B');
        expect(arvore()).to.not.deep.equal(antes);

        state = elementoReducer(state, { type: UNDO });

        expect(arvore()).to.deep.equal(antes);
        expect(buscaDispositivoById(state.articulacao!, PAR)!.numero).to.equal('4-1');
      });

      it('refazer reaplica rótulo, número e ids', () => {
        renumera(PAR, '4-B');
        const renumerado = arvore();

        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: REDO });

        expect(arvore()).to.deep.equal(renumerado);
      });

      it('os eventos de desfazer atualizam as linhas do parágrafo e do inciso', () => {
        renumera(PAR, '4-B');

        state = elementoReducer(state, { type: UNDO });

        const eventos = state.ui!.events;
        const modificados = eventos.filter(ev => ev.stateType === StateType.ElementoModificado).flatMap(ev => ev.elementos ?? []);
        const situacao = eventos.filter(ev => ev.stateType === StateType.SituacaoElementoModificada).flatMap(ev => ev.elementos ?? []);
        expect(modificados.map(e => e.lexmlId)).to.include(PAR);
        expect(situacao.map(e => e.lexmlId).filter(Boolean)).to.satisfy((ids: string[]) => ids.some(id => id.startsWith(`${PAR}_inc`)));
      });
    });
  });

  it('renumerar um artigo recalcula o id do caput, do parágrafo e do inciso do caput', () => {
    const art4 = buscaDispositivoById(state.articulacao!, ART4)!;
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(art4), novo: { tipo: 'Artigo' }, posicao: 'depois' });
    const novoArtigo = art4.pai!.filhos[art4.pai!.filhos.indexOf(art4) + 1];
    expect(novoArtigo?.tipo, 'artigo adicionado em alteração').to.equal('Artigo');
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(novoArtigo), novo: { tipo: 'Paragrafo' } });
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(novoArtigo), novo: { tipo: 'Inciso' } });

    state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(novoArtigo), novo: { numero: '4-A' } });

    expect(novoArtigo.id).to.equal('art1_cpt_alt1_art4-1');
    const ids = getDispositivoAndFilhosAsLista(novoArtigo).map(d => d.id!);
    expect(ids.length).to.be.greaterThan(2);
    ids.forEach(id => expect(id, id).to.match(/^art1_cpt_alt1_art4-1(_|$)/));
  });

  it('remissões ao parágrafo e ao inciso filho acompanham renumerar, desfazer e refazer', () => {
    const [origemPar, origemInciso] = state.articulacao!.artigos;
    const par = buscaDispositivoById(state.articulacao!, PAR)!;
    const inciso = par.filhos[0];
    origemPar.texto = 'Conforme o § 4º-A, aplica-se o disposto.';
    origemInciso.texto = 'Conforme o inciso, aplica-se o disposto.';
    state.remissoes = {
      [origemPar.uuid!]: [{ refId: 'ref_par', sourceUuid: origemPar.uuid, targetUuid: par.uuid, targetLexmlId: par.id!, textoRef: '§ 4º-A', inicio: 11 }],
      [origemInciso.uuid!]: [{ refId: 'ref_inc', sourceUuid: origemInciso.uuid, targetUuid: inciso.uuid, targetLexmlId: inciso.id!, textoRef: 'inciso', inicio: 11 }],
    };
    const alvos = (): Array<string | undefined> => [state.remissoes![origemPar.uuid!][0].targetLexmlId, state.remissoes![origemInciso.uuid!][0].targetLexmlId];
    const antes = alvos();

    renumera(PAR, '4-B');
    expect(alvos()[0]).to.equal('art1_cpt_alt1_art4_par4-2');
    expect(alvos()[1]).to.match(/^art1_cpt_alt1_art4_par4-2_inc/);

    state = elementoReducer(state, { type: UNDO });
    expect(alvos()).to.deep.equal(antes);

    state = elementoReducer(state, { type: REDO });
    expect(alvos()[0]).to.equal('art1_cpt_alt1_art4_par4-2');
    expect(alvos()[1]).to.match(/^art1_cpt_alt1_art4_par4-2_inc/);
  });

  it('o texto digitado depois da renumeração também é desfeito sem tocar no rótulo', () => {
    renumera(PAR, '4-B');
    const par = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art4_par4-2')!;
    const e = createElemento(par);
    e.conteudo!.texto = 'Parágrafo B:';
    state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

    state = elementoReducer(state, { type: UNDO });

    const depois = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art4_par4-2')!;
    expect(depois.texto).to.equal('Parágrafo A:');
    expect(depois.rotulo).to.equal('§ 4º-B.');
  });
});
