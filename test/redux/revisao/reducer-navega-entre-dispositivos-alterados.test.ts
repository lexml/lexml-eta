import { expect } from '@open-wc/testing';
import { State, StateType } from '../../../src/redux/state';
import { Elemento } from '../../../src/model/elemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { reconstroiRevisoes } from '../../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { navegarEntreElementosAlteradosAction, TDirecao } from '../../../src/model/lexml/acao/navegarEntreElementosAlteradosAction';
import { isRevisaoDeExclusao, isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';

// Ementa, preâmbulo e os Arts. 1º a 6º, só com caput: o excluído fica ancorado no próprio artigo de cima.
const documentoComSeisArtigos = (): any => {
  const documento = novoDocumentoArticulado();
  const articulacao = documento.value.projetoNorma.norma.articulacao;
  const modelo = JSON.stringify(articulacao.lXhier[0]);
  articulacao.lXhier = [1, 2, 3, 4, 5, 6].map(n => {
    const artigo = JSON.parse(modelo.split('art1').join(`art${n}`));
    artigo.value.rotulo = `Art. ${n}º`;
    artigo.value.lXcontainersOmissis = artigo.value.lXcontainersOmissis.slice(0, 1);
    artigo.value.lXcontainersOmissis[0].value.p[0].content = [`Texto do artigo ${n}.`];
    return artigo;
  });
  return documento;
};

const abreEmRevisao = (projetoNorma = buildProjetoNormaFromJsonix(documentoComSeisArtigos(), true)): State => {
  const s = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const comUsuario = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
  return elementoReducer(comUsuario, { type: ATIVAR_DESATIVAR_REVISAO });
};

// O documento salvo, aberto de novo com as revisões lidas do arquivo: excluídos seguidos voltam encadeados.
const reabre = (origem: State): State => {
  const documento = criarDocumentoArticulado(origem.articulacao!.projetoNorma!, URN, {}, {}, {});
  const projetoNorma = buildProjetoNormaFromJsonix(documento, true);
  const aberto = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const lidas = lerRevisoesArticulacao(montaRevisoesArticulacao(origem)!);
  return elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));
};

// Excluir em revisão renumera os artigos de baixo: cada artigo é achado pelo número original, que fica no texto.
const doArtigo =
  (n: number) =>
  (e: Partial<Elemento>): boolean =>
    !!e.conteudo?.texto?.includes(`do artigo ${n}`);

const artigo = (s: State, n: number): Elemento => s.articulacao!.artigos.map(a => createElemento(a)).find(doArtigo(n))!;

const altera = (s: State, n: number): State => {
  const e = artigo(s, n);
  e.conteudo!.texto = `Texto do artigo ${n}, alterado.`;
  return elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

const remove = (s: State, n: number): State => elementoReducer(s, { type: REMOVER_ELEMENTO, atual: artigo(s, n) });

const exclusoes = (s: State): RevisaoElemento[] => (s.revisoes as RevisaoElemento[]).filter(r => isRevisaoPrincipal(r) && isRevisaoDeExclusao(r));

// Elemento da linha de um excluído, como o editor o tem.
const excluido = (s: State, n: number): Elemento => exclusoes(s).find(r => doArtigo(n)(r.elementoAposRevisao))!.elementoAposRevisao as Elemento;

const ementa = (s: State): Elemento => createElemento(s.articulacao!.projetoNorma!.ementa!);

// "art<n>" pelo número original, com "(excluído)" quando a marca é uma exclusão.
const nome = (s: State, e: Elemento): string => {
  const n = /do artigo (\d)/.exec(e.conteudo?.texto ?? '')?.[1];
  return `${n ? `art${n}` : e.tipo}${exclusoes(s).some(r => r.elementoAposRevisao.uuid === e.uuid) ? ' (excluído)' : ''}`;
};

const navega = (s: State, atual: Elemento, direcao: TDirecao): Elemento | undefined =>
  elementoReducer(s, navegarEntreElementosAlteradosAction.execute(atual, direcao)).ui?.events?.find(ev => ev.stateType === StateType.ElementoMarcado)?.elementos?.[0];

const destino = (s: State, atual: Elemento, direcao: TDirecao): string | undefined => {
  const e = navega(s, atual, direcao);
  return e && nome(s, e);
};

// Marcas visitadas até não haver mais marca na direção.
const percorre = (s: State, inicio: Elemento, direcao: TDirecao): string[] => {
  const visitadas: string[] = [];
  for (let atual = navega(s, inicio, direcao); atual && visitadas.length < 20; atual = navega(s, atual, direcao)) visitadas.push(nome(s, atual));
  return visitadas;
};

describe('Navegação entre dispositivos alterados (#1096)', () => {
  let state: State;

  beforeEach(() => {
    state = abreEmRevisao();
  });

  it('subir a partir do último artigo, excluído, leva à marca acima', () => {
    state = remove(altera(state, 4), 6);
    expect(destino(state, excluido(state, 6), 'anterior')).to.equal('art4');
  });

  it('a partir de um excluído, descer leva a outro excluído não vizinho e subir volta', () => {
    state = remove(remove(state, 2), 5);
    expect(destino(state, excluido(state, 2), 'proximo')).to.equal('art5 (excluído)');
    expect(destino(state, excluido(state, 5), 'anterior')).to.equal('art2 (excluído)');
  });

  it('a exclusão logo depois de um artigo alterado não é pulada, nos dois sentidos', () => {
    state = remove(altera(state, 3), 4);
    expect(destino(state, artigo(state, 3), 'proximo')).to.equal('art4 (excluído)');
    expect(destino(state, artigo(state, 5), 'anterior')).to.equal('art4 (excluído)');
  });

  [
    [4, 5],
    [5, 4],
  ].forEach(([primeiro, segundo]) => {
    it(`dois artigos vizinhos excluídos (art${primeiro} e depois art${segundo}) são alcançados na ordem do texto`, () => {
      state = remove(remove(altera(state, 1), primeiro), segundo);
      expect(percorre(state, ementa(state), 'proximo')).to.deep.equal(['art1', 'art4 (excluído)', 'art5 (excluído)']);
      expect(percorre(state, artigo(state, 6), 'anterior')).to.deep.equal(['art5 (excluído)', 'art4 (excluído)', 'art1']);
    });
  });

  it('dois artigos vizinhos excluídos, no documento reaberto, são alcançados na ordem do texto', () => {
    state = reabre(remove(remove(altera(state, 1), 4), 5));
    expect(percorre(state, ementa(state), 'proximo')).to.deep.equal(['art1', 'art4 (excluído)', 'art5 (excluído)']);
    expect(percorre(state, artigo(state, 6), 'anterior')).to.deep.equal(['art5 (excluído)', 'art4 (excluído)', 'art1']);
  });

  it('descer da ementa e subir da última marca passa pelas mesmas marcas, em ordem inversa', () => {
    state = remove(altera(remove(altera(state, 2), 3), 5), 6);
    expect(percorre(state, ementa(state), 'proximo')).to.deep.equal(['art2', 'art3 (excluído)', 'art5', 'art6 (excluído)']);
    expect(percorre(state, excluido(state, 6), 'anterior')).to.deep.equal(['art5', 'art3 (excluído)', 'art2']);
  });

  it('sem marca na direção pedida, não marca nenhum elemento', () => {
    state = altera(state, 3);
    expect(navega(state, artigo(state, 3), 'proximo')).to.be.undefined;
    expect(navega(state, artigo(state, 3), 'anterior')).to.be.undefined;
  });
});
