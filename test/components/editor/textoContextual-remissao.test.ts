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
    on: (): void => {
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
// CT-CTX — comportamento assíncrono de atualizarReferencias()
//
// Após a unificação dos caminhos (c5184d59), toda atualização passa por
// setTimeout(0) + updateContents(delta, 'silent'). Os testes verificam:
//   1. count retornado imediatamente (candidatos encontrados)
//   2. updateContents chamado após await setTimeout(0)
//   3. delta contém o texto correto (preservado ou atualizado)
//   4. delta contém o novo targetLexmlId no RemissaoInternaValue
//
// findBlotByRefId é mockado por test para evitar dependência de Quill.find()
// estático, que requer instância real do Quill ligada ao DOM.
// ---------------------------------------------------------------------------

describe('textoContextual — ModuloRemissao.atualizarReferencias()', () => {
  let moduloRemissao: ModuloRemissao;
  let mockQuill: any;
  let updateContentsCalls: { delta: any; source: string }[];

  // Mocka findBlotByRefId para operar no DOM sem precisar de Quill.find() real.
  function mockFindBlotByRefId(): void {
    (moduloRemissao as any).findBlotByRefId = (refId: string) => {
      const link = mockQuill.root.querySelector(`a[data-ref-id="${CSS.escape(refId)}"]`) as HTMLElement | null;
      if (!link) return null;
      return {
        blot: { length: () => link.textContent!.length },
        index: 0,
      };
    };
  }

  function insertOpDe(delta: any): any {
    return delta.ops.find((op: any) => op.insert !== undefined);
  }

  beforeEach(() => {
    updateContentsCalls = [];
    const rootElement = document.createElement('div');
    mockQuill = criarMockQuill(rootElement);
    mockQuill.updateContents = (delta: any, source: string): void => {
      updateContentsCalls.push({ delta, source });
    };
    moduloRemissao = new ModuloRemissao(mockQuill, {});
  });

  // -------------------------------------------------------------------------
  // CT-CTX-01: Cenário A — ancestral renumerado, texto contextual preservado
  // -------------------------------------------------------------------------

  it('CT-CTX-01: "inciso I deste parágrafo" preservado quando artigo renumera (art1→art6)', async () => {
    const textoOriginal = 'inciso I deste parágrafo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_1', lexmlRef: 'art1_par1_inc1', uuid: 100, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1_par1_inc1', 'art6_par1_inc1', 100);
    expect(count).to.equal(1);
    expect(updateContentsCalls.length).to.equal(0); // ainda não executou

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoOriginal); // texto contextual preservado
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art6_par1_inc1'); // metadata atualizada
    expect(remissao.targetUuid).to.equal(100);
    expect(updateContentsCalls[0].source).to.equal('silent');
  });

  it('CT-CTX-02: "§ 2º deste artigo" preservado quando artigo renumera (art1→art6)', async () => {
    const textoOriginal = '§ 2º deste artigo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_2', lexmlRef: 'art1_par2', uuid: 200, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1_par2', 'art6_par2', 200);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoOriginal);
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art6_par2');
  });

  it('CT-CTX-03: "caput deste artigo" preservado quando artigo renumera', async () => {
    const textoOriginal = 'caput deste artigo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_3', lexmlRef: 'art1_cpt1', uuid: 300, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1_cpt1', 'art6_cpt1', 300);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoOriginal);
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art6_cpt1');
  });

  it('CT-CTX-04: "§ 2º do presente artigo" (forma alternativa) preservado', async () => {
    const textoOriginal = '§ 2º do presente artigo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_4', lexmlRef: 'art1_par2', uuid: 400, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1_par2', 'art6_par2', 400);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoOriginal);
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art6_par2');
  });

  it('CT-CTX-05: "Seção I deste Capítulo" preservado quando capítulo renumera', async () => {
    const textoOriginal = 'Seção I deste Capítulo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_5', lexmlRef: 'cap1_sec1', uuid: 500, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('cap1_sec1', 'cap3_sec1', 500);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoOriginal);
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('cap3_sec1');
  });

  // -------------------------------------------------------------------------
  // CT-CTX-06: Cenário B — alvo direto renumerado → texto atualizado
  // -------------------------------------------------------------------------

  it('CT-CTX-06: "inciso I deste parágrafo" → "inciso II deste parágrafo" quando inciso renumera', async () => {
    const textoOriginal = 'inciso I deste parágrafo';
    const textoEsperado = 'inciso II deste parágrafo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_6', lexmlRef: 'art1_par1_inc1', uuid: 100, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1_par1_inc1', 'art1_par1_inc2', 100);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoEsperado); // texto atualizado para novo número
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art1_par1_inc2');
  });

  // -------------------------------------------------------------------------
  // CT-CTX-07: Regressão — referência absoluta atualiza texto e metadata
  // -------------------------------------------------------------------------

  it('CT-CTX-07 (regressão): referência absoluta "art. 1º" atualiza para "art. 6º"', async () => {
    const textoOriginal = 'art. 1º';
    const textoEsperado = 'art. 6º';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_7', lexmlRef: 'art1', uuid: 100, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1', 'art6', 100);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoEsperado);
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art6');
  });

  // -------------------------------------------------------------------------
  // CT-CTX-08: Contexto renumerado (parágrafo pai), texto relativo preservado
  // -------------------------------------------------------------------------

  it('CT-CTX-08: "inciso I deste parágrafo" preservado quando parágrafo renumera (§1→§2)', async () => {
    const textoOriginal = 'inciso I deste parágrafo';
    mockQuill.root.innerHTML = criarLinkContextual({ refId: 'ref_8', lexmlRef: 'art1_par1_inc1', uuid: 100, texto: textoOriginal });
    mockFindBlotByRefId();

    const { count } = moduloRemissao.atualizarReferencias('art1_par1_inc1', 'art1_par2_inc1', 100);
    expect(count).to.equal(1);

    await new Promise(r => setTimeout(r, 0));

    expect(updateContentsCalls.length).to.equal(1);
    const insertOp = insertOpDe(updateContentsCalls[0].delta);
    expect(insertOp.insert).to.equal(textoOriginal); // "deste parágrafo" é relativo — preservado
    const remissao = insertOp.attributes['remissao-interna'] as RemissaoInternaValue;
    expect(remissao.targetLexmlId).to.equal('art1_par2_inc1');
  });
});
