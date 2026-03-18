import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { ModuloRemissao } from '../../../src/components/editor/moduloRemissao';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function criarMockQuill(rootElement: HTMLElement): any {
  return {
    root: rootElement,
    getModule: (): any => null,
    focus: (): void => {
      /* empty */
    },
    getSelection: (): void | null => null,
    getFormat: (): any => ({}),
    getLeaf: (): any => [null, 0],
    format: (): void => {
      /* empty */
    },
    formatText: (): void => {
      /* empty */
    },
    getIndex: (): number => 0,
    updateContents: (): void => {
      /* empty */
    },
    clipboard: {
      addMatcher: (): void => {
        /* empty */
      },
    },
    scroll: {
      descendant: (): any => [null, 0],
    },
  };
}

function criarLinkContextual(opts: { refId: string; lexmlRef: string; uuid: number; texto: string }): string {
  return `<a class="lexml-remissao-interna"
     data-lexml-ref="${opts.lexmlRef}"
     data-ref-id="${opts.refId}"
     href="#lxEtaId${opts.uuid}">${opts.texto}</a>`;
}

// ---------------------------------------------------------------------------
// CT-CTX — preservação de texto contextual em atualizarReferencias()
//
// Lógica relevante em moduloRemissao.ts:
//   - novoTexto = atualizarTextoRemissao(textoAtual, lexmlIdAntigo, lexmlIdNovo)
//   - Se novoTexto === textoAtual → adicionarRemissao() SÍNCRONO (só atualiza metadata)
//   - Se novoTexto !== textoAtual → setTimeout (atualiza texto no DOM)
//
// Para referências contextuais com ancestral renumerado, atualizarTextoRemissao()
// devolve o mesmo texto → caminho síncrono, metadata atualizada.
// ---------------------------------------------------------------------------

describe('textoContextual — ModuloRemissao.atualizarReferencias()', () => {
  let moduloRemissao: ModuloRemissao;
  let mockQuill: any;
  let adicionarRemissaoCalls: { refId: string; value: RemissaoInternaValue }[];

  beforeEach(() => {
    adicionarRemissaoCalls = [];

    const rootElement = document.createElement('div');
    mockQuill = criarMockQuill(rootElement);
    moduloRemissao = new ModuloRemissao(mockQuill, {});

    // Espia adicionarRemissao para verificar chamadas síncronas
    const original = moduloRemissao.adicionarRemissao.bind(moduloRemissao);
    (moduloRemissao as any).adicionarRemissao = (refId: string, value: RemissaoInternaValue): boolean => {
      adicionarRemissaoCalls.push({ refId, value });
      return original(refId, value);
    };
  });

  // -------------------------------------------------------------------------
  // CT-CTX-01: Cenário A — ancestral renumerado, texto contextual preservado
  // -------------------------------------------------------------------------

  it('CT-CTX-01: "inciso I deste parágrafo" preservado quando artigo renumera (art1→art6)', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_1',
      lexmlRef: 'art1_par1_inc1',
      uuid: 100,
      texto: 'inciso I deste parágrafo',
    });

    const count = moduloRemissao.atualizarReferencias('art1_par1_inc1', 'art6_par1_inc1', 100);

    expect(count).to.equal(1);
    // Texto preservado → caminho síncrono (adicionarRemissao chamado imediatamente)
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('inciso I deste parágrafo');
    // Metadata atualizada para o novo lexmlId
    expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('art6_par1_inc1');
    expect(adicionarRemissaoCalls[0].value.targetUuid).to.equal(100);
  });

  it('CT-CTX-02: "§ 2º deste artigo" preservado quando artigo renumera (art1→art6)', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_2',
      lexmlRef: 'art1_par2',
      uuid: 200,
      texto: '§ 2º deste artigo',
    });

    const count = moduloRemissao.atualizarReferencias('art1_par2', 'art6_par2', 200);

    expect(count).to.equal(1);
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('§ 2º deste artigo');
    expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('art6_par2');
  });

  it('CT-CTX-03: "caput deste artigo" preservado quando artigo renumera', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_3',
      lexmlRef: 'art1_cpt1',
      uuid: 300,
      texto: 'caput deste artigo',
    });

    const count = moduloRemissao.atualizarReferencias('art1_cpt1', 'art6_cpt1', 300);

    expect(count).to.equal(1);
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('caput deste artigo');
    expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('art6_cpt1');
  });

  it('CT-CTX-04: "§ 2º do presente artigo" (forma alternativa) preservado', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_4',
      lexmlRef: 'art1_par2',
      uuid: 400,
      texto: '§ 2º do presente artigo',
    });

    const count = moduloRemissao.atualizarReferencias('art1_par2', 'art6_par2', 400);

    expect(count).to.equal(1);
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('§ 2º do presente artigo');
  });

  it('CT-CTX-05: "Seção I deste Capítulo" preservado quando capítulo renumera', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_5',
      lexmlRef: 'cap1_sec1',
      uuid: 500,
      texto: 'Seção I deste Capítulo',
    });

    const count = moduloRemissao.atualizarReferencias('cap1_sec1', 'cap3_sec1', 500);

    expect(count).to.equal(1);
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('Seção I deste Capítulo');
    expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('cap3_sec1');
  });

  // -------------------------------------------------------------------------
  // CT-CTX-06: Cenário B — alvo direto renumerado → caminho setTimeout
  // -------------------------------------------------------------------------

  it('CT-CTX-06: "inciso I deste parágrafo" → inciso II: vai para caminho setTimeout', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_6',
      lexmlRef: 'art1_par1_inc1',
      uuid: 100,
      texto: 'inciso I deste parágrafo',
    });

    const count = moduloRemissao.atualizarReferencias('art1_par1_inc1', 'art1_par1_inc2', 100);

    expect(count).to.equal(1);
    // Texto muda ("inciso II deste parágrafo") → setTimeout; adicionarRemissao NÃO chamado de forma síncrona
    expect(adicionarRemissaoCalls.length).to.equal(0);
  });

  // -------------------------------------------------------------------------
  // CT-CTX-07: Regressão — referência absoluta continua indo para setTimeout
  // -------------------------------------------------------------------------

  it('CT-CTX-07 (regressão): referência absoluta "art. 1º" continua usando setTimeout', () => {
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_7',
      lexmlRef: 'art1',
      uuid: 100,
      texto: 'art. 1º',
    });

    const count = moduloRemissao.atualizarReferencias('art1', 'art6', 100);

    expect(count).to.equal(1);
    // Texto muda (art. 1º → art. 6º) → setTimeout; adicionarRemissao NÃO chamado de forma síncrona
    expect(adicionarRemissaoCalls.length).to.equal(0);
  });

  // -------------------------------------------------------------------------
  // CT-CTX-08: Cenário C — contexto renumerado, texto preservado
  // -------------------------------------------------------------------------

  it('CT-CTX-08: "inciso I deste parágrafo" preservado quando parágrafo renumera (§1→§2)', () => {
    // O parágrafo mudou de número absoluto, mas "deste parágrafo" é relativo: ainda correto
    mockQuill.root.innerHTML = criarLinkContextual({
      refId: 'ref_8',
      lexmlRef: 'art1_par1_inc1',
      uuid: 100,
      texto: 'inciso I deste parágrafo',
    });

    const count = moduloRemissao.atualizarReferencias('art1_par1_inc1', 'art1_par2_inc1', 100);

    expect(count).to.equal(1);
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('inciso I deste parágrafo');
  });
});
