import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { ReferenciaDispositivoParser } from '../../../src/model/lexml/numeracao/parserReferenciaDispositivo';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { gerarRefId } from '../../../src/model/remissao/refId';
import { ModuloRemissao } from '../../../src/components/editor/moduloRemissao';

function criarMockQuill(rootElement: HTMLElement): any {
  return {
    root: rootElement,
    getModule: () => null,
    focus: (): void => {
      //empty
    },
    getSelection: () => null,
    getFormat: () => ({}),
    getLeaf: () => [null, 0],
    format: (): void => {
      //empty
    },
    formatText: (): void => {
      //empty
    },
    getIndex: () => 0,
    updateContents: (): void => {
      //empty
    },
    on: (): void => {
      //empty
    },
    clipboard: {
      addMatcher: (): void => {
        //empty
      },
    },
    scroll: { descendant: () => [null, 0] },
  };
}

describe('RemissaoInternaValue - Interface', () => {
  it('deve aceitar valores válidos com todos os campos', () => {
    const value: RemissaoInternaValue = {
      refId: 'ref_123',
      targetUuid: 456,
      targetLexmlId: 'art1_par2',
      targetRotulo: '§ 2º do Art. 1º',
      sourceUuid: 100,
      sourceLexmlId: 'art3',
      textoRef: 'art. 1º',
    };

    expect(value.refId).to.equal('ref_123');
    expect(value.targetUuid).to.equal(456);
    expect(value.targetLexmlId).to.equal('art1_par2');
    expect(value.targetRotulo).to.equal('§ 2º do Art. 1º');
    expect(value.sourceUuid).to.equal(100);
    expect(value.sourceLexmlId).to.equal('art3');
    expect(value.textoRef).to.equal('art. 1º');
  });

  it('deve aceitar valores apenas com campos obrigatórios', () => {
    const value: RemissaoInternaValue = {
      refId: 'ref_456',
    };

    expect(value.refId).to.equal('ref_456');
    expect(value.targetUuid).to.be.undefined;
    expect(value.targetLexmlId).to.be.undefined;
    expect(value.targetRotulo).to.be.undefined;
    expect(value.sourceUuid).to.be.undefined;
    expect(value.sourceLexmlId).to.be.undefined;
    expect(value.textoRef).to.be.undefined;
  });

  it('deve aceitar refId vazio', () => {
    const value: RemissaoInternaValue = {
      refId: '',
    };

    expect(value.refId).to.equal('');
  });
});

describe('Formato HTML de Remissão', () => {
  it('deve gerar href correto a partir do uuid', () => {
    const uuid = 12345;
    const href = `#lxEtaId${uuid}`;
    expect(href).to.equal('#lxEtaId12345');
  });

  it('deve extrair uuid do href corretamente', () => {
    const href = '#lxEtaId12345';
    const match = href.match(/#lxEtaId(\d+)/);
    const uuid = match ? parseInt(match[1], 10) : 0;
    expect(uuid).to.equal(12345);
  });

  it('deve retornar 0 para href inválido', () => {
    const href = '#invalido';
    const match = href.match(/#lxEtaId(\d+)/);
    const uuid = match ? parseInt(match[1], 10) : 0;
    expect(uuid).to.equal(0);
  });
});

describe('Atributos de Remissão', () => {
  it('deve criar elemento com atributos corretos', () => {
    const value: RemissaoInternaValue = {
      refId: 'ref_abc',
      targetLexmlId: 'art3_inc1',
      targetUuid: 789,
    };

    const node = document.createElement('a');
    node.setAttribute('href', `#lxEtaId${value.targetUuid}`);
    node.setAttribute('data-lexml-ref', value.targetLexmlId!);
    node.setAttribute('data-ref-id', value.refId);
    node.setAttribute('class', 'lexml-remissao-interna');

    expect(node.getAttribute('href')).to.equal('#lxEtaId789');
    expect(node.getAttribute('data-lexml-ref')).to.equal('art3_inc1');
    expect(node.getAttribute('data-ref-id')).to.equal('ref_abc');
    expect(node.classList.contains('lexml-remissao-interna')).to.be.true;
  });

  it('deve extrair valor do elemento corretamente', () => {
    const node = document.createElement('a');
    node.setAttribute('href', '#lxEtaId456');
    node.setAttribute('data-lexml-ref', 'art2_par1');
    node.setAttribute('data-ref-id', 'ref_xyz');
    node.textContent = '§ 1º';

    const href = node.getAttribute('href') || '';
    const match = href.match(/#lxEtaId(\d+)/);
    const targetUuid = match ? parseInt(match[1], 10) : 0;

    const extractedValue: RemissaoInternaValue = {
      refId: node.getAttribute('data-ref-id') || '',
      targetLexmlId: node.getAttribute('data-lexml-ref') || undefined,
      targetUuid,
      targetRotulo: node.textContent || undefined,
    };

    expect(extractedValue.refId).to.equal('ref_xyz');
    expect(extractedValue.targetLexmlId).to.equal('art2_par1');
    expect(extractedValue.targetUuid).to.equal(456);
    expect(extractedValue.targetRotulo).to.equal('§ 1º');
  });
});

describe('gerarRefId() - utilitario centralizado (substitui ModuloRemissao.gerarId)', () => {
  describe('Formato do ID gerado', () => {
    it('deve iniciar com o prefixo "ref_"', () => {
      expect(gerarRefId().startsWith('ref_')).to.be.true;
    });

    it('deve conter exatamente um underscore apos o prefixo', () => {
      const semPrefixo = gerarRefId().slice(4);
      expect((semPrefixo.match(/_/g) || []).length).to.equal(1);
    });

    it('deve ter o formato: ref_<timestamp>_<random>', () => {
      expect(/^ref_\d+_[a-z0-9]+$/.test(gerarRefId())).to.be.true;
    });

    it('deve conter um timestamp valido apos o prefixo', () => {
      const partes = gerarRefId().slice(4).split('_');
      expect(partes.length).to.equal(2);
      const timestamp = parseInt(partes[0], 10);
      expect(isNaN(timestamp)).to.be.false;
      expect(timestamp).to.be.greaterThan(1577836800000); // apos 2020
    });
  });

  describe('Parte aleatoria do ID', () => {
    it('deve ter a parte aleatoria com comprimento esperado (ate 9 caracteres)', () => {
      const parteAleatoria = gerarRefId().slice(4).split('_')[1];
      expect(parteAleatoria.length).to.be.greaterThan(0);
      expect(parteAleatoria.length).to.be.at.most(9);
    });

    it('deve conter apenas caracteres alfanumericos minusculos na parte aleatoria', () => {
      const parteAleatoria = gerarRefId().slice(4).split('_')[1];
      expect(/^[a-z0-9]+$/.test(parteAleatoria)).to.be.true;
    });
  });

  describe('Unicidade dos IDs', () => {
    it('deve gerar IDs unicos em chamadas consecutivas', () => {
      const ids = new Set(Array.from({ length: 100 }, () => gerarRefId()));
      expect(ids.size).to.equal(100);
    });

    it('deve gerar IDs diferentes mesmo em chamadas muito rapidas', () => {
      const [id1, id2, id3] = [gerarRefId(), gerarRefId(), gerarRefId()];
      expect(id1).to.not.equal(id2);
      expect(id2).to.not.equal(id3);
    });
  });

  describe('Estrutura completa do ID', () => {
    it('deve ter comprimento total esperado', () => {
      const id = gerarRefId();
      expect(id.length).to.be.greaterThan(20);
      expect(id.length).to.be.lessThan(35);
    });

    it('deve ser uma string valida', () => {
      const id = gerarRefId();
      expect(typeof id).to.equal('string');
      expect(id.length).to.be.greaterThan(0);
    });
  });
});

describe('Navegação de Remissão', () => {
  it('deve construir seletor CSS para elemento destino', () => {
    const uuid = 123;
    const targetId = `lxEtaId${uuid}`;
    const selector = `#${targetId}`;

    expect(selector).to.equal('#lxEtaId123');
  });

  it('deve validar formato de href para navegação interna', () => {
    const validHrefs = ['#lxEtaId1', '#lxEtaId123', '#lxEtaId999999'];
    const invalidHrefs = ['#invalido', 'https://externo.com', '#lxEtaId', '#lxEtaIdabc'];

    const isValidHref = (href: string): boolean => {
      return /^#lxEtaId\d+$/.test(href);
    };

    validHrefs.forEach(href => {
      expect(isValidHref(href), `${href} deveria ser válido`).to.be.true;
    });

    invalidHrefs.forEach(href => {
      expect(isValidHref(href), `${href} deveria ser inválido`).to.be.false;
    });
  });
});

describe('Classe CSS de Remissão', () => {
  it('deve aplicar classe de remissão válida', () => {
    const node = document.createElement('a');
    node.classList.add('lexml-remissao-interna');

    expect(node.classList.contains('lexml-remissao-interna')).to.be.true;
  });

  it('deve aplicar classe de remissão inválida', () => {
    const node = document.createElement('a');
    node.classList.add('lexml-remissao-interna');
    node.classList.add('lexml-remissao-invalida');

    expect(node.classList.contains('lexml-remissao-invalida')).to.be.true;
  });

  it('deve remover classe de remissão inválida', () => {
    const node = document.createElement('a');
    node.classList.add('lexml-remissao-interna');
    node.classList.add('lexml-remissao-invalida');
    node.classList.remove('lexml-remissao-invalida');

    expect(node.classList.contains('lexml-remissao-invalida')).to.be.false;
    expect(node.classList.contains('lexml-remissao-interna')).to.be.true;
  });

  it('deve aplicar classe de destaque temporário', () => {
    const node = document.createElement('div');
    node.id = 'lxEtaId123';
    node.classList.add('lexml-remissao-destaque');

    expect(node.classList.contains('lexml-remissao-destaque')).to.be.true;
  });
});

describe('Detecção Automática de Referências', () => {
  describe('Parser de Referências', () => {
    it('deve detectar referência a artigo "art. 1º"', () => {
      const parser = new ReferenciaDispositivoParser('art. 1º');
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.equal(1);
      expect(parser.referencias[0].tipo).to.equal(TipoDispositivo.artigo);
      expect(parser.referencias[0].numero).to.equal('1');
    });

    it('deve detectar referência a parágrafo "§ 2º"', () => {
      const parser = new ReferenciaDispositivoParser('§ 2º do art. 1º');
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.equal(2);
      expect(parser.referencias[0].tipo).to.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[0].numero).to.equal('2');
    });

    it('deve detectar referência a inciso "inciso III"', () => {
      const parser = new ReferenciaDispositivoParser('inciso III do art. 2º');
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.greaterThan(0);
      expect(parser.referencias[0]!.tipo).to.equal(TipoDispositivo.inciso);
      expect(parser.referencias[0]!.numero!.toLowerCase()).to.equal('iii');
    });

    it('deve detectar referência complexa "inciso II do § 1º do art. 3º"', () => {
      const parser = new ReferenciaDispositivoParser('inciso II do § 1º do art. 3º');
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.equal(3);
      expect(parser.referencias[0].tipo).to.equal(TipoDispositivo.inciso);
      expect(parser.referencias[1].tipo).to.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[2].tipo).to.equal(TipoDispositivo.artigo);
    });

    it('não deve detectar referências inválidas', () => {
      const parser = new ReferenciaDispositivoParser('texto sem referência');
      expect(parser.valido).to.be.false;
    });

    it('deve detectar artigo único', () => {
      const parser = new ReferenciaDispositivoParser('artigo único');
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.greaterThan(0);
      expect(parser.referencias[0]!.tipo).to.equal(TipoDispositivo.artigo);
      expect(parser.referencias[0]!.numero!.toLowerCase()).to.equal('único');
    });

    it('deve detectar parágrafo único', () => {
      const parser = new ReferenciaDispositivoParser('parágrafo único do art. 1º');
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.greaterThan(0);
      expect(parser.referencias[0]!.tipo).to.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[0]!.numero!.toLowerCase()).to.equal('único');
    });
  });

  describe('Regex de Detecção', () => {
    it('deve detectar padrão de artigo no texto', () => {
      const regex = /(art\.?\s*|artigo\s+)([uú]nico|\d+(?:-[a-z]+)?)(?:º)?/gi;
      const texto = 'Conforme o art. 1º da lei...';
      const match = regex.exec(texto);
      expect(match).to.not.be.null;
      expect(match![0].toLowerCase()).to.include('art');
    });

    it('deve detectar padrão de parágrafo no texto', () => {
      const regex = /(§\s*|par[aá]grafo\s+|par\.?\s*)([uú]nico|\d+(?:-[a-z]+)?)(?:º)?/gi;
      const texto = 'Ver § 2º do regulamento...';
      const match = regex.exec(texto);
      expect(match).to.not.be.null;
      expect(match![0]).to.include('§');
    });

    it('deve detectar padrão de inciso no texto', () => {
      const regex = /(inc\.?\s*|inciso\s+)([uú]nico|[MDCLXVI]+(?:-[a-z]+)?)/gi;
      const texto = 'Conforme inciso III...';
      const match = regex.exec(texto);
      expect(match).to.not.be.null;
      expect(match![0].toLowerCase()).to.include('inc');
    });

    it('deve detectar padrão de alínea no texto', () => {
      const regex = /(al[ií]\.?\s*|al[ií]nea\s+)([a-z]+(?:-[a-z]+)?)/gi;
      const texto = 'Na alínea a)...';
      const match = regex.exec(texto);
      expect(match).to.not.be.null;
      expect(match![0].toLowerCase()).to.include('al');
    });

    it('deve detectar padrão de item no texto', () => {
      const regex = /(item\s+)([uú]nico|\d+(?:-[a-z]+)?)/gi;
      const texto = 'No item 1...';
      const match = regex.exec(texto);
      expect(match).to.not.be.null;
      expect(match![0].toLowerCase()).to.include('item');
    });
  });

  describe('Normalização de Números', () => {
    const normalizarNumero = (numero: string | undefined): string => {
      if (!numero) return '';
      return numero.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    it('deve normalizar número "1º" para "1"', () => {
      expect(normalizarNumero('1º')).to.equal('1');
    });

    it('deve normalizar número "1-A" para "1a"', () => {
      expect(normalizarNumero('1-A')).to.equal('1a');
    });

    it('deve normalizar "único" removendo caracteres especiais', () => {
      // Nota: caracteres acentuados são removidos completamente
      expect(normalizarNumero('único')).to.equal('nico');
    });

    it('deve normalizar número sem caracteres especiais mantendo o valor', () => {
      expect(normalizarNumero('1')).to.equal('1');
    });

    it('deve retornar string vazia para undefined', () => {
      expect(normalizarNumero(undefined)).to.equal('');
    });
  });
});

describe('Verificação de Rótulo vs Conteúdo', () => {
  it('deve identificar elemento LABEL como rótulo', () => {
    const label = document.createElement('label');
    label.classList.add('texto__rotulo');
    label.setAttribute('contenteditable', 'false');

    const isRotulo = label.tagName === 'LABEL' || label.closest('label.texto__rotulo') !== null;
    expect(isRotulo).to.be.true;
  });

  it('deve identificar elemento P como conteúdo (não rótulo)', () => {
    const p = document.createElement('p');
    p.classList.add('ql-editor');

    const isRotulo = p.tagName === 'LABEL' || p.closest('label.texto__rotulo') !== null;
    expect(isRotulo).to.be.false;
  });

  it('deve identificar elemento dentro de LABEL como rótulo', () => {
    const label = document.createElement('label');
    label.classList.add('texto__rotulo');
    const span = document.createElement('span');
    label.appendChild(span);

    const isRotulo = span.closest('label.texto__rotulo') !== null;
    expect(isRotulo).to.be.true;
  });

  it('deve identificar elemento fora de LABEL como conteúdo', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.appendChild(span);

    const isRotulo = span.closest('label.texto__rotulo') !== null;
    expect(isRotulo).to.be.false;
  });

  it('rótulo deve ter contenteditable=false', () => {
    const label = document.createElement('label');
    label.classList.add('texto__rotulo');
    label.setAttribute('contenteditable', 'false');

    const isRotuloNaoEditavel = label.getAttribute('contenteditable') === 'false';
    expect(isRotuloNaoEditavel).to.be.true;
  });
});

describe('Redirecionamento via Redux', () => {
  it('deve criar action com uuid correto', () => {
    const uuid = 123;
    const action = {
      type: 'REDIRECIONAR_REMISSAO',
      uuid,
    };

    expect(action.type).to.equal('REDIRECIONAR_REMISSAO');
    expect(action.uuid).to.equal(123);
  });

  it('deve extrair uuid do elemento para action', () => {
    const elemento = { uuid: 456 };
    const action = {
      type: 'REDIRECIONAR_REMISSAO',
      uuid: elemento.uuid,
    };

    expect(action.uuid).to.equal(456);
  });
});

describe('RemissaoRegistry', () => {
  it('deve armazenar remissões por uuid do dispositivo', () => {
    const registry: Record<number, RemissaoInternaValue[]> = {};

    const uuid = 123;
    const remissao: RemissaoInternaValue = {
      refId: 'ref_1',
      targetUuid: 456,
      targetLexmlId: 'art1',
      textoRef: 'art. 1º',
    };

    registry[uuid] = [remissao];

    expect(registry[uuid]).to.have.length(1);
    expect(registry[uuid][0].refId).to.equal('ref_1');
  });

  it('deve adicionar novas remissões ao dispositivo existente', () => {
    const registry: Record<number, RemissaoInternaValue[]> = {
      123: [{ refId: 'ref_1', textoRef: 'art. 1º' }],
    };

    const novaRemissao: RemissaoInternaValue = {
      refId: 'ref_2',
      textoRef: 'art. 2º',
    };

    registry[123] = [...registry[123], novaRemissao];

    expect(registry[123]).to.have.length(2);
  });

  it('deve retornar array vazio para dispositivo sem remissões', () => {
    const registry: Record<number, RemissaoInternaValue[]> = {};
    const remissoes = registry[999] || [];

    expect(remissoes).to.have.length(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// marcarRemissoesComoInvalidas / restaurarRemissoesPorLexmlId
//
// Verifica o mecanismo de marcação CSS de remissões inválidas.
// Estes testes documentam o comportamento ATUAL (apenas CSS) e servem de base
// para a futura integração com o campo `valida` de RemissaoInternaValue
// ─────────────────────────────────────────────────────────────────────────────
describe('marcarRemissoesComoInvalidas / restaurarRemissoesPorLexmlId', () => {
  let moduloRemissao: ModuloRemissao;
  let rootElement: HTMLElement;

  beforeEach(() => {
    rootElement = document.createElement('div');
    const mockQuill = {
      root: rootElement,
      getModule: () => null,
      focus: (): void => {
        /* vazio */
      },
      getSelection: () => null,
      getFormat: () => ({}),
      getLeaf: () => [null, 0],
      format: (): void => {
        /* vazio */
      },
      formatText: (): void => {
        /* vazio */
      },
      getIndex: () => 0,
      updateContents: (): void => {
        /* vazio */
      },
      on: (): void => {
        /* vazio */
      },
      clipboard: {
        addMatcher: (): void => {
          /* vazio */
        },
      },
      scroll: { descendant: () => [null, 0] },
    };
    moduloRemissao = new ModuloRemissao(mockQuill, {});
  });

  // ── marcarComoInvalida via findBlotByRefId mockado ────────────────────────

  it('marcarComoInvalida: adiciona classe lexml-remissao-invalida ao link com refId correto', () => {
    const link = document.createElement('a');
    link.setAttribute('class', 'lexml-remissao-interna');
    link.setAttribute('data-ref-id', 'ref_X');

    // Mock de findBlotByRefId para simular Quill.find() sem instância real do Quill
    (moduloRemissao as any).findBlotByRefId = () => ({ blot: { domNode: link }, index: 0 });

    const resultado = moduloRemissao.marcarComoInvalida('ref_X');

    expect(resultado).to.be.true;
    expect(link.classList.contains('lexml-remissao-invalida')).to.be.true;
    // Classe original deve ser preservada
    expect(link.classList.contains('lexml-remissao-interna')).to.be.true;
  });

  it('marcarComoInvalida: retorna false quando refId não existe no DOM', () => {
    (moduloRemissao as any).findBlotByRefId = () => null;

    const resultado = moduloRemissao.marcarComoInvalida('ref_inexistente');

    expect(resultado).to.be.false;
  });

  it('restaurarRemissao: remove classe lexml-remissao-invalida mantendo lexml-remissao-interna', () => {
    const link = document.createElement('a');
    link.setAttribute('class', 'lexml-remissao-interna lexml-remissao-invalida');
    link.setAttribute('data-ref-id', 'ref_Y');

    (moduloRemissao as any).findBlotByRefId = () => ({ blot: { domNode: link }, index: 0 });

    const resultado = moduloRemissao.restaurarRemissao('ref_Y');

    expect(resultado).to.be.true;
    expect(link.classList.contains('lexml-remissao-invalida')).to.be.false;
    expect(link.classList.contains('lexml-remissao-interna')).to.be.true;
  });

  // ── marcarRemissoesComoInvalidas (múltiplos links por lexmlId) ────────────

  it('marcarRemissoesComoInvalidas: marca todos os links com data-lexml-ref igual ao lexmlId', () => {
    rootElement.innerHTML = `
      <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_A" href="#lxEtaId10">art. 1º</a>
      <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_B" href="#lxEtaId20">art. 1º</a>
      <a class="lexml-remissao-interna" data-lexml-ref="art2" data-ref-id="ref_C" href="#lxEtaId30">art. 2º</a>
    `;

    // marcarRemissoesComoInvalidas usa querySelectorAll direto — não precisa do blot real
    // Redefine marcarComoInvalida para operar no nó DOM sem precisar de Quill.find()
    (moduloRemissao as any).marcarComoInvalida = (refId: string): boolean => {
      const link = rootElement.querySelector(`[data-ref-id="${refId}"]`) as HTMLElement | null;
      if (!link) return false;
      link.classList.add('lexml-remissao-invalida');
      return true;
    };

    const count = moduloRemissao.marcarRemissoesComoInvalidas('art1');

    expect(count).to.equal(2);
    expect((rootElement.querySelector('[data-ref-id="ref_A"]') as HTMLElement).classList.contains('lexml-remissao-invalida')).to.be.true;
    expect((rootElement.querySelector('[data-ref-id="ref_B"]') as HTMLElement).classList.contains('lexml-remissao-invalida')).to.be.true;
    // Link de outro dispositivo não deve ser afetado
    expect((rootElement.querySelector('[data-ref-id="ref_C"]') as HTMLElement).classList.contains('lexml-remissao-invalida')).to.be.false;
  });

  it('marcarRemissoesComoInvalidas: retorna 0 quando não há links com o lexmlId indicado', () => {
    rootElement.innerHTML = `
      <a class="lexml-remissao-interna" data-lexml-ref="art2" data-ref-id="ref_A" href="#lxEtaId10">art. 2º</a>
    `;

    const count = moduloRemissao.marcarRemissoesComoInvalidas('art1');

    expect(count).to.equal(0);
  });

  it('restaurarRemissoesPorLexmlId: restaura todos os links inválidos com data-lexml-ref igual ao lexmlId', () => {
    rootElement.innerHTML = `
      <a class="lexml-remissao-interna lexml-remissao-invalida" data-lexml-ref="art1" data-ref-id="ref_A" href="#lxEtaId10">art. 1º</a>
      <a class="lexml-remissao-interna lexml-remissao-invalida" data-lexml-ref="art1" data-ref-id="ref_B" href="#lxEtaId20">art. 1º</a>
    `;

    (moduloRemissao as any).restaurarRemissao = (refId: string): boolean => {
      const link = rootElement.querySelector(`[data-ref-id="${refId}"]`) as HTMLElement | null;
      if (!link) return false;
      link.classList.remove('lexml-remissao-invalida');
      return true;
    };

    const count = moduloRemissao.restaurarRemissoesPorLexmlId('art1');

    expect(count).to.equal(2);
    expect((rootElement.querySelector('[data-ref-id="ref_A"]') as HTMLElement).classList.contains('lexml-remissao-invalida')).to.be.false;
    expect((rootElement.querySelector('[data-ref-id="ref_B"]') as HTMLElement).classList.contains('lexml-remissao-invalida')).to.be.false;
  });
});

describe('ModuloRemissao.getRemissaoNoCursor()', () => {
  let moduloRemissao: ModuloRemissao;
  let rootElement: HTMLElement;
  let mockQuill: any;

  beforeEach(() => {
    rootElement = document.createElement('div');
    mockQuill = criarMockQuill(rootElement);
    moduloRemissao = new ModuloRemissao(mockQuill, {});
  });

  it('retorna null quando getSelection retorna null', () => {
    mockQuill.getSelection = () => null;

    expect(moduloRemissao.getRemissaoNoCursor()).to.be.null;
  });

  it('retorna null quando cursor nao esta sobre remissao (getFormat vazio)', () => {
    mockQuill.getSelection = () => ({ index: 5, length: 0 });
    mockQuill.getFormat = () => ({});
    mockQuill.getLeaf = () => [{ parent: { statics: { blotName: 'text' } } }, 0];

    expect(moduloRemissao.getRemissaoNoCursor()).to.be.null;
  });

  it('retorna null quando getFormat tem remissao-interna mas link nao existe no DOM', () => {
    const value: RemissaoInternaValue = { refId: 'ref_abc', targetLexmlId: 'art1', targetUuid: 10 };
    mockQuill.getSelection = () => ({ index: 5, length: 0 });
    mockQuill.getFormat = () => ({ 'remissao-interna': value });
    // rootElement sem nenhum link

    expect(moduloRemissao.getRemissaoNoCursor()).to.be.null;
  });

  it('retorna value e linkEl via caminho principal (getFormat + link no DOM)', () => {
    const value: RemissaoInternaValue = { refId: 'ref_xyz', targetLexmlId: 'art2', targetUuid: 20 };
    const linkEl = document.createElement('a');
    linkEl.className = 'lexml-remissao-interna';
    linkEl.setAttribute('data-ref-id', 'ref_xyz');
    rootElement.appendChild(linkEl);

    mockQuill.getSelection = () => ({ index: 3, length: 0 });
    mockQuill.getFormat = () => ({ 'remissao-interna': value });

    const resultado = moduloRemissao.getRemissaoNoCursor();

    expect(resultado).to.not.be.null;
    expect(resultado!.value).to.equal(value);
    expect(resultado!.linkEl).to.equal(linkEl);
  });

  it('retorna null via fallback quando leaf nao e blot de remissao', () => {
    mockQuill.getSelection = () => ({ index: 5, length: 0 });
    mockQuill.getFormat = () => ({});
    mockQuill.getLeaf = () => [{ parent: { statics: { blotName: 'outro-blot' } } }, 0];

    expect(moduloRemissao.getRemissaoNoCursor()).to.be.null;
  });

  it('retorna value e linkEl via fallback leaf quando getFormat nao detecta o blot', () => {
    const value: RemissaoInternaValue = { refId: 'ref_fallback', targetLexmlId: 'art3', targetUuid: 30 };
    const linkEl = document.createElement('a');
    linkEl.className = 'lexml-remissao-interna';
    linkEl.setAttribute('data-ref-id', 'ref_fallback');

    const mockLeaf = {
      parent: {
        statics: { blotName: 'remissao-interna' },
        formats: () => ({ 'remissao-interna': value }),
        domNode: linkEl,
      },
    };

    mockQuill.getSelection = () => ({ index: 5, length: 0 });
    mockQuill.getFormat = () => ({});
    mockQuill.getLeaf = () => [mockLeaf, 0];

    const resultado = moduloRemissao.getRemissaoNoCursor();

    expect(resultado).to.not.be.null;
    expect(resultado!.value).to.equal(value);
    expect(resultado!.linkEl).to.equal(linkEl);
  });

  it('retorna null via fallback quando blotValue nao tem refId', () => {
    const mockLeaf = {
      parent: {
        statics: { blotName: 'remissao-interna' },
        formats: () => ({ 'remissao-interna': { targetLexmlId: 'art4' } }), // sem refId
        domNode: document.createElement('a'),
      },
    };

    mockQuill.getSelection = () => ({ index: 5, length: 0 });
    mockQuill.getFormat = () => ({});
    mockQuill.getLeaf = () => [mockLeaf, 0];

    expect(moduloRemissao.getRemissaoNoCursor()).to.be.null;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderizarRemissoesDoState — reconciliação de metadata
//
// Verifica o cenário: usuário edita texto do link para forma customizada, ocorre
// renumeração (atualiza data-lexml-ref no DOM), usuário reverte para texto canônico.
// A detecção passa a apontar para o novo alvo, mas o DOM ainda tem o antigo.
// renderizarRemissoesDoState deve reconciliar o metadata chamando adicionarRemissao.
// ─────────────────────────────────────────────────────────────────────────────
describe('renderizarRemissoesDoState — reconciliação de metadata', () => {
  let moduloRemissao: ModuloRemissao;
  let rootElement: HTMLElement;
  let adicionarRemissaoCalls: { refId: string; value: RemissaoInternaValue }[];

  beforeEach(() => {
    rootElement = document.createElement('div');
    adicionarRemissaoCalls = [];
    const mockQuill = criarMockQuill(rootElement);
    moduloRemissao = new ModuloRemissao(mockQuill, {});
    // Substitui adicionarRemissao para capturar chamadas sem precisar de Quill real.
    (moduloRemissao as any).adicionarRemissao = (refId: string, value: RemissaoInternaValue): boolean => {
      adicionarRemissaoCalls.push({ refId, value });
      return true;
    };
  });

  it('skip sem mudança: link com data-lexml-ref já igual ao registry — não chama adicionarRemissao', () => {
    rootElement.innerHTML = `
      <a class="lexml-remissao-interna" data-lexml-ref="art2_par1_inc1" data-ref-id="ref_X" href="#lxEtaId200">inciso I deste parágrafo</a>
    `;
    const linkEl = rootElement.querySelector('a.lexml-remissao-interna[data-ref-id="ref_X"]') as any;
    linkEl['__blot'] = { blot: { statics: { blotName: 'remissao-interna' } } };

    const remissoes: Record<number, RemissaoInternaValue[]> = {
      42: [{ refId: 'ref_X', targetLexmlId: 'art2_par1_inc1', targetUuid: 200, textoRef: 'inciso I deste parágrafo' }],
    };

    moduloRemissao.renderizarRemissoesDoState(remissoes, 42);

    expect(adicionarRemissaoCalls.length).to.equal(0);
  });

  it('link sem targetLexmlId no registry — não chama adicionarRemissao (guarda contra entrada incompleta)', () => {
    rootElement.innerHTML = `
      <a class="lexml-remissao-interna" data-lexml-ref="art2_par1_inc2" data-ref-id="ref_X" href="#lxEtaId200">inciso I deste parágrafo</a>
    `;
    const linkEl = rootElement.querySelector('a.lexml-remissao-interna[data-ref-id="ref_X"]') as any;
    linkEl['__blot'] = { blot: { statics: { blotName: 'remissao-interna' } } };

    const remissoes: Record<number, RemissaoInternaValue[]> = {
      42: [{ refId: 'ref_X', targetUuid: 300, textoRef: 'inciso I deste parágrafo' }],
    };

    moduloRemissao.renderizarRemissoesDoState(remissoes, 42);

    expect(adicionarRemissaoCalls.length).to.equal(0);
  });
});

describe('ModuloRemissao — exclusão em tempo real ao editar texto dentro de um link', () => {
  let mockQuill: any;
  let moduloRemissao: ModuloRemissao;
  let rootElement: HTMLElement;
  let formatTextCalls: any[];

  beforeEach(() => {
    formatTextCalls = [];
    rootElement = document.createElement('div');
    // Anexado ao document: o método real checa el.isConnected antes de remover o formato
    // (guarda contra o link ter sido removido do DOM entre a detecção e o setTimeout).
    document.body.appendChild(rootElement);
    mockQuill = criarMockQuill(rootElement);
    mockQuill.formatText = (...args: any[]): void => {
      formatTextCalls.push(args);
    };
    moduloRemissao = new ModuloRemissao(mockQuill, {});
  });

  afterEach(() => {
    rootElement.remove();
  });

  // Cria um <a class="lexml-remissao-interna"> real no DOM, com __blot para que
  // Quill.find() (mockado em web-test-runner.config.mjs) resolva o blot fake.
  function criarLink(refId: string, texto: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.className = 'lexml-remissao-interna';
    link.setAttribute('data-ref-id', refId);
    link.textContent = texto;
    (link as any)['__blot'] = {
      blot: {
        statics: { blotName: 'remissao-interna' },
        offset: () => 0,
        length: () => link.textContent?.length ?? 0,
      },
    };
    rootElement.appendChild(link);
    return link;
  }

  // Delta padrão no formato de uma digitação simples (passa no filtro pareceEdicaoPontual).
  const DELTA_EDICAO_SIMPLES = { ops: [{ retain: 5 }, { insert: 'x' }] };

  function disparar(source: string, delta: any = DELTA_EDICAO_SIMPLES): Promise<void> {
    (moduloRemissao as any)._removerRemissaoEditadaEmTempoReal(delta, {}, source);
    return new Promise(resolve => setTimeout(resolve, 10));
  }

  it('primeira observação de um link apenas alimenta o cache — não remove nada', async () => {
    criarLink('ref1', 'art. 1º');
    await disparar('user');
    expect(formatTextCalls).to.have.length(0);
  });

  it('texto inalterado entre duas observações não remove o formato', async () => {
    criarLink('ref1', 'art. 1º');
    await disparar('user');
    await disparar('user');
    expect(formatTextCalls).to.have.length(0);
  });

  it('texto do link mudou desde a última observação (source "user") remove o formato', async () => {
    const link = criarLink('ref1', 'art. 1º');
    await disparar('user'); // alimenta o cache com o texto original

    link.textContent = 'art. 21º'; // simula edição interna do usuário
    await disparar('user');

    expect(formatTextCalls).to.have.length(1);
    expect(formatTextCalls[0][2]).to.equal('remissao-interna');
    expect(formatTextCalls[0][3]).to.equal(false);
    expect(formatTextCalls[0][4]).to.equal('silent');
  });

  it('[BUG] apagar o último caractere do link (backspace no boundary) remove o formato imediatamente', async () => {
    // Reprodução da lógica pura: cache guarda "art. 1", backspace apaga o "1" e o
    // textContent do <a> passa a ser "art. " — a divergência deve disparar a remoção
    // na mesma passada, sem esperar o usuário apagar também o espaço seguinte.
    const link = criarLink('ref1', 'art. 1');
    await disparar('user'); // alimenta o cache com o texto original ("art. 1")

    link.textContent = 'art. '; // simula backspace apagando o "1" (último caractere do link)
    await disparar('user', { ops: [{ retain: 5 }, { delete: 1 }] });

    expect(formatTextCalls).to.have.length(1);
    expect(formatTextCalls[0][2]).to.equal('remissao-interna');
    expect(formatTextCalls[0][3]).to.equal(false);
    expect(formatTextCalls[0][4]).to.equal('silent');
  });

  it('mudança de texto com source "silent" (ex: renumeração) não remove — só atualiza o cache', async () => {
    const link = criarLink('ref1', 'art. 1º');
    await disparar('user');

    link.textContent = 'art. 2º'; // ex: atualização programática após renumeração
    await disparar('silent');
    expect(formatTextCalls).to.have.length(0);

    // O cache já reflete o novo texto — uma checagem subsequente sem mudança não remove.
    await disparar('user');
    expect(formatTextCalls).to.have.length(0);
  });

  it('link removido do DOM some do cache sem chamar formatText', async () => {
    const link = criarLink('ref1', 'art. 1º');
    await disparar('user');

    link.remove();
    await disparar('user');

    expect(formatTextCalls).to.have.length(0);
  });

  it('dois links distintos: editar só um deles remove apenas o formato daquele', async () => {
    const link1 = criarLink('ref1', 'art. 1º');
    criarLink('ref2', 'art. 2º');
    await disparar('user');

    link1.textContent = 'art. 11º';
    await disparar('user');

    expect(formatTextCalls).to.have.length(1);
  });

  it('sem nenhum link no DOM, não chama formatText', async () => {
    await disparar('user');
    expect(formatTextCalls).to.have.length(0);
  });

  // Reprodução de um bug real: reconstruções estruturais do documento (adicionar/renumerar
  // dispositivo) disparam um delta gigante marcado como source 'user', que pode alterar o
  // texto de um link já existente (renumeração) sem que o usuário tenha digitado nada.
  it('delta de reconstrução em massa (muitos ops, source "user") não remove mesmo com texto divergente', async () => {
    const link = criarLink('ref1', 'art. 1º');
    await disparar('user'); // alimenta o cache

    link.textContent = 'art. 2º'; // renumeração reconstruiu o texto do link

    const deltaEmMassa = { ops: Array.from({ length: 10 }, () => ({ retain: 1 })) };
    await disparar('user', deltaEmMassa);

    expect(formatTextCalls).to.have.length(0);
    // O cache deve ter sido atualizado para o novo texto (não sinaliza divergência de novo).
    await disparar('user');
    expect(formatTextCalls).to.have.length(0);
  });

  it('delta que insere quebra de linha não é tratado como edição pontual', async () => {
    const link = criarLink('ref1', 'art. 1º');
    await disparar('user');

    link.textContent = 'art. 2º';
    await disparar('user', { ops: [{ retain: 5 }, { insert: '\n' }] });

    expect(formatTextCalls).to.have.length(0);
  });

  it('delta que insere um trecho grande não é tratado como edição pontual', async () => {
    const link = criarLink('ref1', 'art. 1º');
    await disparar('user');

    link.textContent = 'art. 2º';
    await disparar('user', { ops: [{ retain: 5 }, { insert: 'um texto bem mais longo que uma digitação normal' }] });

    expect(formatTextCalls).to.have.length(0);
  });
});
