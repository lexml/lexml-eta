import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { sincronizarRemissoesComEstadoAtual } from '../../../src/model/remissao/sincronizarRemissoes';
import { textoCanonicoDoDispositivo } from '../../../src/model/remissao/lexmlIdUtil';

// Fase 6 do plano de simplificação: matriz de paridade herdada de
// test/components/editor/moduloRemissao.test.ts's "ModuloRemissao.atualizarReferencias()"
// (removido por ficar órfão desde a Fase 5 — o método operava direto sobre o DOM do Quill).
// Cobre referência ABSOLUTA em cadeia completa ("inciso III do § 2º do art. 5º") para cada tipo de
// dispositivo, renumerando cada nível da cadeia (o próprio nível, e cada ancestral).
//
// Estratégia: em vez de hardcodar o texto esperado, usa textoCanonicoDoDispositivo(destino) antes e
// depois da renumeração — o texto ANTES vira o textoRef gravado (o sistema "já sabia" essa forma);
// o texto DEPOIS é o que sincronizarRemissoesComEstadoAtual deve gerar.

const criaRegistro = (entries: Partial<RemissaoInternaValue> & { refId: string }): Record<number, RemissaoInternaValue[]> => ({
  [entries.sourceUuid!]: [entries as RemissaoInternaValue],
});

// origem é um dispositivo qualquer, sem relação estrutural com o destino — referência absoluta não
// depende de ancestral compartilhado (ao contrário da contextual, já coberta em sincronizarRemissoesComEstadoAtual.test.ts).
const verificaAtualizacaoAbsoluta = (articulacao: any, origem: Dispositivo, destino: Dispositivo, renumerar: () => void): void => {
  const textoOriginal = textoCanonicoDoDispositivo(destino);
  const texto = `Nos termos do ${textoOriginal}, fica estabelecido.`;
  const inicio = texto.indexOf(textoOriginal);
  origem.texto = texto;

  const registro = criaRegistro({
    refId: 'ref1',
    sourceUuid: origem.uuid,
    targetUuid: destino.uuid,
    targetLexmlId: destino.id,
    textoRef: textoOriginal,
    inicio,
  });

  renumerar();
  updateIdDispositivoAndFilhos(articulacao);

  const textoEsperado = textoCanonicoDoDispositivo(destino);
  const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
  const entrada = resultado[origem.uuid!][0];

  expect(entrada.targetLexmlId).to.equal(destino.id);
  expect(entrada.textoRef).to.equal(textoEsperado);
  expect(origem.texto).to.include(textoEsperado);
};

describe('sincronizarRemissoesComEstadoAtual — paridade de referência absoluta por tipo de dispositivo', () => {
  describe('Inciso (art + par + inc)', () => {
    const monta = (): { articulacao: any; origem: Dispositivo; art: Artigo; par: Dispositivo; inc: Dispositivo } => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par = criaDispositivo(art, 'Paragrafo');
      const inc = criaDispositivo(par, 'Inciso');
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, origem, art, par, inc };
    };

    it('inciso renumera', () => {
      const { articulacao, origem, par, inc } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, inc, () => {
        criaDispositivo(par, 'Inciso', undefined, 0);
        par.renumeraFilhos();
      });
    });

    it('parágrafo-pai renumera', () => {
      const { articulacao, origem, art, inc } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, inc, () => {
        criaDispositivo(art, 'Paragrafo', undefined, 0);
        art.renumeraFilhos();
      });
    });

    it('artigo-pai renumera', () => {
      const { articulacao, origem, inc } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, inc, () => {
        criaDispositivo(articulacao, 'Artigo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });
  });

  describe('Alínea (art + par + inc + ali)', () => {
    const monta = (): { articulacao: any; origem: Dispositivo; art: Artigo; par: Dispositivo; inc: Dispositivo; ali: Dispositivo } => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par = criaDispositivo(art, 'Paragrafo');
      const inc = criaDispositivo(par, 'Inciso');
      const ali = criaDispositivo(inc, 'Alinea');
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par.renumeraFilhos();
      inc.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, origem, art, par, inc, ali };
    };

    it('alínea renumera', () => {
      const { articulacao, origem, inc, ali } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, ali, () => {
        criaDispositivo(inc, 'Alinea', undefined, 0);
        inc.renumeraFilhos();
      });
    });

    it('inciso-pai renumera', () => {
      const { articulacao, origem, par, ali } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, ali, () => {
        criaDispositivo(par, 'Inciso', undefined, 0);
        par.renumeraFilhos();
      });
    });

    it('artigo-pai renumera', () => {
      const { articulacao, origem, ali } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, ali, () => {
        criaDispositivo(articulacao, 'Artigo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });
  });

  describe('Item (art + par + inc + ali + ite)', () => {
    const monta = (): { articulacao: any; origem: Dispositivo; art: Artigo; par: Dispositivo; inc: Dispositivo; ali: Dispositivo; ite: Dispositivo } => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par = criaDispositivo(art, 'Paragrafo');
      const inc = criaDispositivo(par, 'Inciso');
      const ali = criaDispositivo(inc, 'Alinea');
      const ite = criaDispositivo(ali, 'Item');
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par.renumeraFilhos();
      inc.renumeraFilhos();
      ali.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, origem, art, par, inc, ali, ite };
    };

    it('item renumera', () => {
      const { articulacao, origem, ali, ite } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, ite, () => {
        criaDispositivo(ali, 'Item', undefined, 0);
        ali.renumeraFilhos();
      });
    });

    it('artigo-pai renumera', () => {
      const { articulacao, origem, ite } = monta();
      verificaAtualizacaoAbsoluta(articulacao, origem, ite, () => {
        criaDispositivo(articulacao, 'Artigo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });
  });

  describe('Agrupadores (cap, sec, sub, tit, liv, prt)', () => {
    it('Capítulo renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const cap = criaDispositivo(articulacao, 'Capitulo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, cap, () => {
        criaDispositivo(articulacao, 'Capitulo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });

    it('Seção renumera (seção-pai é o Capítulo)', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const cap = criaDispositivo(articulacao, 'Capitulo');
      const sec = criaDispositivo(cap, 'Secao');
      articulacao.renumeraFilhos();
      cap.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, sec, () => {
        criaDispositivo(cap, 'Secao', undefined, 0);
        cap.renumeraFilhos();
      });
    });

    it('capítulo-pai renumera (seção mantém número)', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const cap = criaDispositivo(articulacao, 'Capitulo');
      const sec = criaDispositivo(cap, 'Secao');
      articulacao.renumeraFilhos();
      cap.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, sec, () => {
        criaDispositivo(articulacao, 'Capitulo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });

    it('Subseção renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const cap = criaDispositivo(articulacao, 'Capitulo');
      const sec = criaDispositivo(cap, 'Secao');
      const sub = criaDispositivo(sec, 'Subsecao');
      articulacao.renumeraFilhos();
      cap.renumeraFilhos();
      sec.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, sub, () => {
        criaDispositivo(sec, 'Subsecao', undefined, 0);
        sec.renumeraFilhos();
      });
    });

    it('Título renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const tit = criaDispositivo(articulacao, 'Titulo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, tit, () => {
        criaDispositivo(articulacao, 'Titulo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });

    it('tit + cap + sec: seção renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const tit = criaDispositivo(articulacao, 'Titulo');
      const cap = criaDispositivo(tit, 'Capitulo');
      const sec = criaDispositivo(cap, 'Secao');
      articulacao.renumeraFilhos();
      tit.renumeraFilhos();
      cap.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, sec, () => {
        criaDispositivo(cap, 'Secao', undefined, 0);
        cap.renumeraFilhos();
      });
    });

    it('tit + cap + sec: título-pai renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const tit = criaDispositivo(articulacao, 'Titulo');
      const cap = criaDispositivo(tit, 'Capitulo');
      const sec = criaDispositivo(cap, 'Secao');
      articulacao.renumeraFilhos();
      tit.renumeraFilhos();
      cap.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, sec, () => {
        criaDispositivo(articulacao, 'Titulo', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });

    it('Livro renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const liv = criaDispositivo(articulacao, 'Livro');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, liv, () => {
        criaDispositivo(articulacao, 'Livro', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });

    it('Parte renumera', () => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const prt = criaDispositivo(articulacao, 'Parte');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      verificaAtualizacaoAbsoluta(articulacao, origem, prt, () => {
        criaDispositivo(articulacao, 'Parte', undefined, 0);
        articulacao.renumeraFilhos();
      });
    });
  });

  // Herdado de "atualizarReferencias — preservados (textos não reconhecíveis)": no mecanismo antigo,
  // um array `preservados` listava os elementos DOM cujo texto não era reconhecível. No novo
  // mecanismo não há DOM nem lista de "preservados" — o equivalente é a entrada voltar com
  // `revisao: true` e `textoRef`/o texto na fonte intocados.
  describe('preservados (texto não reconhecível não é sobrescrito)', () => {
    const montaArtigoDestino = (): { articulacao: any; origem: Dispositivo; destino: Artigo } => {
      const articulacao = createArticulacao();
      const origem = criaDispositivo(articulacao, 'Artigo');
      const destino = criaDispositivo(articulacao, 'Artigo') as Artigo;
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, origem, destino };
    };

    it('texto canônico "art. 2º" → não marca revisão, atualiza normalmente', () => {
      const { articulacao, origem, destino } = montaArtigoDestino();
      const textoOriginal = textoCanonicoDoDispositivo(destino);
      origem.texto = textoOriginal;

      const registro = criaRegistro({ refId: 'ref1', sourceUuid: origem.uuid, targetUuid: destino.uuid, targetLexmlId: destino.id, textoRef: textoOriginal, inicio: 0 });

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const entrada = sincronizarRemissoesComEstadoAtual(articulacao, registro)[origem.uuid!][0];
      expect(entrada.revisao).to.be.undefined;
      expect(entrada.textoRef).to.equal(textoCanonicoDoDispositivo(destino));
    });

    it('texto arbitrário "o artigo" → marca revisão, preserva texto', () => {
      const { articulacao, origem, destino } = montaArtigoDestino();
      const textoOriginal = 'o artigo';
      origem.texto = textoOriginal;

      const registro = criaRegistro({ refId: 'ref1', sourceUuid: origem.uuid, targetUuid: destino.uuid, targetLexmlId: destino.id, textoRef: textoOriginal, inicio: 0 });

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const entrada = sincronizarRemissoesComEstadoAtual(articulacao, registro)[origem.uuid!][0];
      expect(entrada.revisao).to.be.true;
      expect(entrada.textoRef).to.equal(textoOriginal);
      expect(origem.texto).to.equal(textoOriginal);
    });

    it('2 entradas no mesmo dispositivo: 1 canônica + 1 arbitrária → só a arbitrária marca revisão', () => {
      const { articulacao, origem, destino } = montaArtigoDestino();
      const textoCanonico = textoCanonicoDoDispositivo(destino);
      const textoArbitrario = 'o artigo segundo';
      origem.texto = `${textoCanonico} ou ${textoArbitrario}`;

      const registro: Record<number, RemissaoInternaValue[]> = {
        [origem.uuid!]: [
          { refId: 'refA', sourceUuid: origem.uuid, targetUuid: destino.uuid, targetLexmlId: destino.id, textoRef: textoCanonico, inicio: 0 } as RemissaoInternaValue,
          {
            refId: 'refB',
            sourceUuid: origem.uuid,
            targetUuid: destino.uuid,
            targetLexmlId: destino.id,
            textoRef: textoArbitrario,
            inicio: `${textoCanonico} ou `.length,
          } as RemissaoInternaValue,
        ],
      };

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const [entradaA, entradaB] = sincronizarRemissoesComEstadoAtual(articulacao, registro)[origem.uuid!];
      expect(entradaA.revisao).to.be.undefined;
      expect(entradaB.revisao).to.be.true;
      expect(entradaB.textoRef).to.equal(textoArbitrario);
    });

    it('destino não encontrado (uuid inexistente) passa intocado, sem marcar revisão', () => {
      const { articulacao, origem } = montaArtigoDestino();
      const registro = criaRegistro({ refId: 'ref1', sourceUuid: origem.uuid, targetUuid: 999999, targetLexmlId: 'art99', textoRef: 'o artigo', inicio: 0 });

      const entrada = sincronizarRemissoesComEstadoAtual(articulacao, registro)[origem.uuid!][0];
      expect(entrada.revisao).to.be.undefined;
      expect(entrada).to.equal(registro[origem.uuid!][0]);
    });
  });
});
