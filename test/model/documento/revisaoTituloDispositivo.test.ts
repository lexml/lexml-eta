import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { reconstroiRevisoes } from '../../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { criarDocumentoArticulado, RevisoesLexEdit } from '../../../src/model/lexml/documento/documentoArticulado';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { adicionarTituloDispositivoAction, editarTituloDispositivoAction, removerTituloDispositivoAction } from '../../../src/model/lexml/acao/atualizarTituloDispositivoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';
const INCISO = 'art1_par1u_inc1';
const ARTIGO = 'art4';
const TEXTO_ORIGINAL = 'texto original;';
const TEXTO_REVISADO = 'texto revisado;';

const abreSemRevisao = (): State => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
  const s = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  return elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
};

const ativaRevisao = (s: State): State => elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });

const elemento = (s: State, id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(s.articulacao!, id)!);

const titulo = (s: State, id: string): string | undefined => buscaDispositivoById(s.articulacao!, id)!.tituloDispositivo;

const texto = (s: State, id: string): string | undefined => buscaDispositivoById(s.articulacao!, id)!.texto;

const defineTitulo = (s: State, id: string, valor: string): State => {
  const acao = titulo(s, id) === undefined ? adicionarTituloDispositivoAction : editarTituloDispositivoAction;
  return elementoReducer(s, acao.execute(elemento(s, id), valor));
};

const removeTitulo = (s: State, id: string): State => elementoReducer(s, removerTituloDispositivoAction.execute(elemento(s, id)));

const alteraTexto = (s: State, id: string, novoTexto: string): State => {
  const e = elemento(s, id);
  e.conteudo!.texto = novoTexto;
  return elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

const principais = (s: State): RevisaoElemento[] => s.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

const rejeita = (s: State): State => elementoReducer(s, { type: REJEITAR_REVISAO, revisao: principais(s)[0] });

// Salva a articulação de `origem`, abre de novo e reaplica as revisões gravadas; `adapta` simula um arquivo com outra forma de conteúdo anterior.
const abreComRevisoes = (origem: State, adapta?: (revisoes: RevisoesLexEdit) => void): State => {
  const documento = criarDocumentoArticulado(origem.articulacao!.projetoNorma!, URN, {}, {}, {});
  const projetoNorma = buildProjetoNormaFromJsonix(documento, true);
  const aberto = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const gravadas = JSON.parse(JSON.stringify(montaRevisoesArticulacao(origem)!)) as RevisoesLexEdit;
  adapta?.(gravadas);
  return elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lerRevisoesArticulacao(gravadas))));
};

// Forma abreviada: o texto anterior como `p` filho direto da revisão, sem informação de título.
const comParagrafoSolto = (revisoes: RevisoesLexEdit): void => {
  revisoes.revisoesArticulacao.revisaoArticulacao.forEach(rev => {
    const chave = Object.keys(rev).find(k => rev[k] && typeof rev[k] === 'object' && (rev[k] as any).p);
    if (chave) {
      rev.p = (rev[chave] as any).p[0];
      delete rev[chave];
    }
  });
};

describe('revisão do título do dispositivo: salvar, reabrir e rejeitar (MPV 905/2019)', () => {
  describe('título adicionado', () => {
    let a: State;
    let b: State;

    beforeEach(() => {
      a = defineTitulo(ativaRevisao(abreSemRevisao()), INCISO, 'Do objeto');
      b = abreComRevisoes(a);
    });

    it('a sessão rejeita e volta a não ter título', () => {
      expect(titulo(rejeita(a), INCISO)).to.equal(undefined);
    });

    it('reaberto, rejeitar a revisão volta a não ter título', () => {
      expect(titulo(rejeita(b), INCISO)).to.equal(undefined);
    });

    it('reaberto, a marca descreve a alteração do título', () => {
      expect(principais(b)[0].descricao).to.equal('Título do dispositivo foi alterado');
    });
  });

  describe('título alterado', () => {
    let a: State;
    let b: State;

    beforeEach(() => {
      a = defineTitulo(abreSemRevisao(), INCISO, 'Original');
      a = defineTitulo(ativaRevisao(a), INCISO, 'Alterado');
      b = abreComRevisoes(a);
    });

    it('reaberto, o título atual é o alterado', () => {
      expect(titulo(b, INCISO)).to.equal('Alterado');
    });

    it('reaberto, rejeitar a revisão restaura o título original', () => {
      expect(titulo(rejeita(b), INCISO)).to.equal('Original');
    });

    it('reaberto, a marca descreve a alteração do título', () => {
      expect(principais(b)[0].descricao).to.equal('Título do dispositivo foi alterado');
    });
  });

  describe('título removido', () => {
    let a: State;
    let b: State;

    beforeEach(() => {
      a = removeTitulo(ativaRevisao(defineTitulo(abreSemRevisao(), INCISO, 'Original')), INCISO);
      b = abreComRevisoes(a);
    });

    it('reaberto, o dispositivo não tem título', () => {
      expect(titulo(b, INCISO)).to.equal(undefined);
    });

    it('reaberto, rejeitar a revisão devolve o título', () => {
      expect(titulo(rejeita(b), INCISO)).to.equal('Original');
    });

    it('reaberto, a marca descreve a alteração do título', () => {
      expect(principais(b)[0].descricao).to.equal('Título do dispositivo foi alterado');
    });
  });

  describe('título com itálico e subscrito', () => {
    const FORMATADO = 'Do <i>objeto</i> H<sub>2</sub>O';

    it('reaberto, rejeitar a revisão restaura o título com a formatação', () => {
      const base = defineTitulo(abreSemRevisao(), INCISO, FORMATADO);
      const original = titulo(base, INCISO);
      const a = defineTitulo(ativaRevisao(base), INCISO, 'Alterado');

      const restaurado = titulo(rejeita(abreComRevisoes(a)), INCISO);

      expect(restaurado).to.equal(original);
      expect(restaurado).to.contain('<i>objeto</i>').and.to.contain('<sub>2</sub>');
    });
  });
});

describe('revisão de título e texto: salvar, reabrir e rejeitar (MPV 905/2019)', () => {
  it('título e texto alterados: a marca descreve os dois e rejeitar restaura os dois', () => {
    let a = abreSemRevisao();
    a = alteraTexto(defineTitulo(a, INCISO, 'Original'), INCISO, TEXTO_ORIGINAL);
    a = alteraTexto(defineTitulo(ativaRevisao(a), INCISO, 'Alterado'), INCISO, TEXTO_REVISADO);

    const b = abreComRevisoes(a);

    expect(principais(b)[0].descricao).to.equal('Texto e título do dispositivo foram alterados');
    const rejeitada = rejeita(b);
    expect(titulo(rejeitada, INCISO)).to.equal('Original');
    expect(texto(rejeitada, INCISO)).to.equal(TEXTO_ORIGINAL);
  });

  it('só o texto alterado em dispositivo com título: rejeitar restaura o texto e mantém o título', () => {
    let a = abreSemRevisao();
    a = alteraTexto(defineTitulo(a, INCISO, 'Do objeto'), INCISO, TEXTO_ORIGINAL);
    a = alteraTexto(ativaRevisao(a), INCISO, TEXTO_REVISADO);

    const b = abreComRevisoes(a);

    expect(principais(b)[0].descricao).to.equal('Texto do dispositivo foi alterado');
    const rejeitada = rejeita(b);
    expect(texto(rejeitada, INCISO)).to.equal(TEXTO_ORIGINAL);
    expect(titulo(rejeitada, INCISO)).to.equal('Do objeto');
  });

  it('texto de artigo alterado: rejeitar restaura o texto do caput', () => {
    const original = texto(abreSemRevisao(), ARTIGO);
    const a = alteraTexto(ativaRevisao(abreSemRevisao()), ARTIGO, TEXTO_REVISADO);

    const rejeitada = rejeita(abreComRevisoes(a));

    expect(texto(rejeitada, ARTIGO)).to.equal(original);
  });

  it('parágrafo solto (forma abreviada) é tolerado: rejeitar restaura o texto e mantém o título atual', () => {
    let a = abreSemRevisao();
    a = alteraTexto(defineTitulo(a, INCISO, 'Do objeto'), INCISO, TEXTO_ORIGINAL);
    a = alteraTexto(ativaRevisao(a), INCISO, TEXTO_REVISADO);

    const rejeitada = rejeita(abreComRevisoes(a, comParagrafoSolto));

    expect(texto(rejeitada, INCISO)).to.equal(TEXTO_ORIGINAL);
    expect(titulo(rejeitada, INCISO)).to.equal('Do objeto');
  });
});
