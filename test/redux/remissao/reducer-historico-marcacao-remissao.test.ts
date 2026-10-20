import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { atualizarTextoElementoAction } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';

// Reproduz o "desfazer duas vezes" do teste manual: a marcação de links de remissão (criação,
// classe de inválido) muda o HTML da origem, e a sincronização de texto disparada pela perda de
// foco não pode virar um passo de desfazer.
const link = (classe: string, uuidDestino: number): string =>
  `<a class="${classe}" href="#lxEtaId${uuidDestino}" data-lexml-ref="art2" data-ref-id="ref_teste" target="_self">art. 2º</a>`;

const atualizarTexto = (s: State, d: Dispositivo, texto: string): State => {
  const elemento = createElemento(d, true);
  elemento.conteudo = { texto };
  return elementoReducer(s, atualizarTextoElementoAction.execute(elemento));
};

const remover = (s: State, d: Dispositivo): State => {
  const el = createElemento(d, true);
  return elementoReducer(s, removerElementoAction.execute(el, el));
};

const quantidadeDeArtigos = (s: State): number => s.articulacao!.artigos.length;

describe('Histórico de desfazer e marcação de links de remissão', () => {
  let state: State;
  let art1: Artigo;
  let art2: Artigo;
  let textoComLink: string;

  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
    [art1, art2] = state.articulacao!.artigos as Artigo[];
    textoComLink = `Conforme o ${link('lexml-remissao-interna', art2.uuid!)}, aplica-se.`;
    art1.texto = textoComLink;
    state.remissoes = {
      [art1.uuid!]: [{ refId: 'ref_teste', sourceUuid: art1.uuid, targetUuid: art2.uuid, targetLexmlId: 'art2', textoRef: 'art. 2º', inicio: 11 }],
    };
  });

  it('um único desfazer restaura o dispositivo removido depois de sincronizar a marcação de inválido', () => {
    let result = remover(state, art2);
    expect(quantidadeDeArtigos(result)).to.equal(2);

    result = atualizarTexto(result, art1, `Conforme o ${link('lexml-remissao-interna lexml-remissao-invalida', art2.uuid!)}, aplica-se.`);
    result = elementoReducer(result, { type: UNDO });

    expect(quantidadeDeArtigos(result)).to.equal(3);
  });

  it('a sincronização só de marcação mantém o histórico e o refazer disponível', () => {
    let result = remover(state, art2);
    result = elementoReducer(result, { type: UNDO });
    const past = result.past!.length;
    const future = result.future!.length;
    expect(future, 'o undo deixa a remoção disponível para refazer').to.be.greaterThan(0);

    const art1Atual = result.articulacao!.artigos[0];
    result = atualizarTexto(result, art1Atual, `Conforme o ${link('lexml-remissao-interna lexml-remissao-invalida', art2.uuid!)}, aplica-se.`);

    expect(art1Atual.texto, 'o texto do Redux acompanha o DOM').to.contain('lexml-remissao-invalida');
    expect(result.past!.length).to.equal(past);
    expect(result.future!.length).to.equal(future);

    result = elementoReducer(result, { type: REDO });
    expect(quantidadeDeArtigos(result), 'o refazer ainda remove o art. 2º').to.equal(2);
  });

  it('criar o link sobre texto já sincronizado não cria passo', () => {
    art1.texto = 'Conforme o art. 2º, aplica-se.';
    const past = state.past?.length ?? 0;

    const result = atualizarTexto(state, art1, textoComLink);

    expect(result.past?.length ?? 0).to.equal(past);
    expect(art1.texto).to.equal(textoComLink);
  });

  it('controle: mudança real de texto cria passo', () => {
    const past = state.past?.length ?? 0;

    const result = atualizarTexto(state, art1, `Conforme o ${link('lexml-remissao-interna', art2.uuid!)}, aplica-se no que couber.`);

    expect(result.past!.length).to.equal(past + 1);
  });

  it('controle: negrito aplicado pelo usuário cria passo', () => {
    const past = state.past?.length ?? 0;

    const result = atualizarTexto(state, art1, `<strong>Conforme</strong> o ${link('lexml-remissao-interna', art2.uuid!)}, aplica-se.`);

    expect(result.past!.length).to.equal(past + 1);
  });
});
