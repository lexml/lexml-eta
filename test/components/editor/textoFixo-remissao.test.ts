import { expect } from '@open-wc/testing';
import { RemissaoInternaBlot } from '../../../src/util/eta-quill/eta-blot-remissao-interna';
import { RemissaoInternaValue } from '../../../src/model/remissao/remissao';
import { ModuloRemissao } from '../../../src/components/editor/moduloRemissao';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function criarMockQuill(rootElement: HTMLElement): any {
  return {
    root: rootElement,
    getModule: () => null,
    focus: (): void => {
      /* empty */
    },
    getSelection: () => null,
    getFormat: () => ({}),
    getLeaf: () => [null, 0],
    format: (): void => {
      /* empty */
    },
    formatText: (): void => {
      /* empty */
    },
    getIndex: () => 0,
    updateContents: (): void => {
      /* empty */
    },
    clipboard: {
      addMatcher: (): void => {
        /* empty */
      },
    },
    scroll: {
      descendant: () => [null, 0],
    },
  };
}

// ---------------------------------------------------------------------------
// RemissaoInternaValue — interface
// ---------------------------------------------------------------------------

describe('textoFixo — RemissaoInternaValue interface', () => {
  it('aceita textoFixo: true', () => {
    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 100,
      targetLexmlId: 'art1',
      textoFixo: true,
    };
    expect(value.textoFixo).to.be.true;
  });

  it('textoFixo é opcional (undefined por padrão)', () => {
    const value: RemissaoInternaValue = { refId: 'ref_1' };
    expect(value.textoFixo).to.be.undefined;
  });
});

// ---------------------------------------------------------------------------
// RemissaoInternaBlot.valueToAttributes()
// ---------------------------------------------------------------------------

describe('textoFixo — RemissaoInternaBlot.valueToAttributes()', () => {
  it('escreve data-texto-fixo="true" quando textoFixo=true', () => {
    const node = document.createElement('a');
    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 100,
      targetLexmlId: 'art1',
      textoFixo: true,
    };

    RemissaoInternaBlot.valueToAttributes(value, node);

    expect(node.getAttribute('data-texto-fixo')).to.equal('true');
  });

  it('NÃO escreve data-texto-fixo quando textoFixo=false', () => {
    const node = document.createElement('a');
    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 100,
      targetLexmlId: 'art1',
      textoFixo: false,
    };

    RemissaoInternaBlot.valueToAttributes(value, node);

    expect(node.hasAttribute('data-texto-fixo')).to.be.false;
  });

  it('NÃO escreve data-texto-fixo quando textoFixo está ausente', () => {
    const node = document.createElement('a');
    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 100,
      targetLexmlId: 'art1',
    };

    RemissaoInternaBlot.valueToAttributes(value, node);

    expect(node.hasAttribute('data-texto-fixo')).to.be.false;
  });

  it('grava href com uuid correto', () => {
    const node = document.createElement('a');
    RemissaoInternaBlot.valueToAttributes({ refId: 'ref_1', targetUuid: 42, targetLexmlId: 'art1' }, node);
    expect(node.getAttribute('href')).to.equal('#lxEtaId42');
  });
});

// ---------------------------------------------------------------------------
// RemissaoInternaBlot.formats()
// ---------------------------------------------------------------------------

describe('textoFixo — RemissaoInternaBlot.formats()', () => {
  it('retorna textoFixo: true quando data-texto-fixo="true" está presente', () => {
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art1');
    node.setAttribute('data-ref-id', 'ref_1');
    node.setAttribute('href', '#lxEtaId100');
    node.setAttribute('data-texto-fixo', 'true');
    node.textContent = 'texto aleatório';

    const value = RemissaoInternaBlot.formats(node) as RemissaoInternaValue;

    expect(value).to.be.an('object');
    expect(value.textoFixo).to.be.true;
  });

  it('NÃO inclui textoFixo quando data-texto-fixo está ausente', () => {
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art1');
    node.setAttribute('data-ref-id', 'ref_1');
    node.setAttribute('href', '#lxEtaId100');
    node.textContent = 'art. 1º';

    const value = RemissaoInternaBlot.formats(node) as RemissaoInternaValue;

    expect(value).to.be.an('object');
    expect(value.textoFixo).to.be.undefined;
  });

  it('preserva os demais campos (refId, targetLexmlId, targetUuid) independente de textoFixo', () => {
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art5');
    node.setAttribute('data-ref-id', 'ref_xyz');
    node.setAttribute('href', '#lxEtaId200');
    node.setAttribute('data-texto-fixo', 'true');
    node.textContent = 'meu texto';

    const value = RemissaoInternaBlot.formats(node) as RemissaoInternaValue;

    expect(value.refId).to.equal('ref_xyz');
    expect(value.targetLexmlId).to.equal('art5');
    expect(value.targetUuid).to.equal(200);
    expect(value.textoFixo).to.be.true;
  });

  it('retorna href como string quando data-lexml-ref e data-ref-id estão ausentes', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'https://exemplo.com');
    node.setAttribute('data-texto-fixo', 'true');

    const value = RemissaoInternaBlot.formats(node);

    // Sem data-lexml-ref + data-ref-id o blot retorna o href direto
    expect(typeof value).to.equal('string');
  });
});

// ---------------------------------------------------------------------------
// ModuloRemissao.atualizarReferencias() — textoFixo
// ---------------------------------------------------------------------------

describe('textoFixo — ModuloRemissao.atualizarReferencias()', () => {
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

  it('preserva o texto e chama adicionarRemissao de forma síncrona quando textoFixo=true', () => {
    mockQuill.root.innerHTML = `
      <a class="lexml-remissao-interna"
         data-lexml-ref="art1"
         data-ref-id="ref_1"
         href="#lxEtaId100"
         data-texto-fixo="true">texto aleatório</a>
    `;

    const count = moduloRemissao.atualizarReferencias('art1', 'art2', 100);

    expect(count).to.equal(1);
    expect(adicionarRemissaoCalls.length).to.equal(1);
    expect(adicionarRemissaoCalls[0].refId).to.equal('ref_1');
    // Texto deve ser preservado (não substituído pela forma canônica)
    expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('texto aleatório');
    // Metadados devem ser atualizados para o novo lexmlId
    expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('art2');
    expect(adicionarRemissaoCalls[0].value.targetUuid).to.equal(100);
  });

  it('não processa link quando UUID do href não coincide com novoUuid (proteção contra eventos defasados)', () => {
    mockQuill.root.innerHTML = `
      <a class="lexml-remissao-interna"
         data-lexml-ref="art1"
         data-ref-id="ref_1"
         href="#lxEtaId100"
         data-texto-fixo="true">texto aleatório</a>
    `;

    const count = moduloRemissao.atualizarReferencias('art1', 'art2', 999);

    expect(count).to.equal(0);
    expect(adicionarRemissaoCalls.length).to.equal(0);
  });

  it('usa setTimeout para atualizar texto em remissão automática (não chama adicionarRemissao de forma síncrona)', () => {
    // Link sem data-texto-fixo, texto canônico que vai mudar (art. 1º → art. 2º)
    mockQuill.root.innerHTML = `
      <a class="lexml-remissao-interna"
         data-lexml-ref="art1"
         data-ref-id="ref_1"
         href="#lxEtaId100">art. 1º</a>
    `;

    const count = moduloRemissao.atualizarReferencias('art1', 'art2', 100);

    expect(count).to.equal(1);
    // Texto muda → vai para o caminho setTimeout; adicionarRemissao NÃO deve ser chamado de forma síncrona
    expect(adicionarRemissaoCalls.length).to.equal(0);
  });

  it('retorna 0 quando não há links correspondentes ao lexmlIdAntigo', () => {
    mockQuill.root.innerHTML = `
      <a class="lexml-remissao-interna"
         data-lexml-ref="art5"
         data-ref-id="ref_1"
         href="#lxEtaId100">art. 5º</a>
    `;

    const count = moduloRemissao.atualizarReferencias('art1', 'art2', 100);

    expect(count).to.equal(0);
    expect(adicionarRemissaoCalls.length).to.equal(0);
  });

  it('processa múltiplos links com textoFixo=true de forma independente', () => {
    mockQuill.root.innerHTML = `
      <p>
        <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_A" href="#lxEtaId100" data-texto-fixo="true">primeiro texto fixo</a>
        e
        <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_B" href="#lxEtaId100" data-texto-fixo="true">segundo texto fixo</a>
      </p>
    `;

    const count = moduloRemissao.atualizarReferencias('art1', 'art2', 100);

    expect(count).to.equal(2);
    expect(adicionarRemissaoCalls.length).to.equal(2);

    const refIds = adicionarRemissaoCalls.map(c => c.refId);
    expect(refIds).to.include('ref_A');
    expect(refIds).to.include('ref_B');

    // Cada link deve preservar seu próprio texto
    const chamadaA = adicionarRemissaoCalls.find(c => c.refId === 'ref_A')!;
    const chamadaB = adicionarRemissaoCalls.find(c => c.refId === 'ref_B')!;
    expect(chamadaA.value.targetRotulo).to.equal('primeiro texto fixo');
    expect(chamadaB.value.targetRotulo).to.equal('segundo texto fixo');
  });
});

// ---------------------------------------------------------------------------
// m4 — data-texto-fixo não é removido quando textoFixo muda para false
// BUG: valueToAttributes só seta o atributo; sem ramo else para remover.
// ---------------------------------------------------------------------------

describe('m4 — valueToAttributes: data-texto-fixo removido quando textoFixo é false', () => {
  it('remove data-texto-fixo quando textoFixo é false (BUG: atualmente não remove)', () => {
    const domNode = document.createElement('a');
    domNode.setAttribute('data-texto-fixo', 'true');

    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 123,
      targetLexmlId: 'art1',
      textoRef: 'art. 1\u00ba',
      textoFixo: false,
    };

    RemissaoInternaBlot.valueToAttributes(value, domNode);

    // BUG ATUAL: atributo permanece porque o ramo else nao existe.
    expect(domNode.getAttribute('data-texto-fixo')).to.be.null;
  });

  it('remove data-texto-fixo quando textoFixo e undefined', () => {
    const domNode = document.createElement('a');
    domNode.setAttribute('data-texto-fixo', 'true');

    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 123,
      targetLexmlId: 'art1',
      textoRef: 'art. 1\u00ba',
    };

    RemissaoInternaBlot.valueToAttributes(value, domNode);

    expect(domNode.getAttribute('data-texto-fixo')).to.be.null;
  });

  it('mantem data-texto-fixo="true" quando textoFixo e true', () => {
    const domNode = document.createElement('a');

    const value: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 123,
      targetLexmlId: 'art1',
      textoRef: 'art. 1\u00ba',
      textoFixo: true,
    };

    RemissaoInternaBlot.valueToAttributes(value, domNode);

    expect(domNode.getAttribute('data-texto-fixo')).to.equal('true');
  });
});
