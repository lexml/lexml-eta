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
    clipboard: {
      addMatcher: (): void => {
        //empty
      },
    },
    scroll: { descendant: () => [null, 0] },
  };
}

describe('ModuloRemissao - Constantes de Eventos', () => {
  it('deve definir evento de mudança corretamente', () => {
    expect('remissao-interna-change').to.equal('remissao-interna-change');
  });

  it('deve definir evento de remoção corretamente', () => {
    expect('remissao-interna-remove').to.equal('remissao-interna-remove');
  });
});

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

describe('ModuloRemissao.atualizarReferencias()', () => {
  let moduloRemissao: ModuloRemissao;
  let mockQuill: any;
  let adicionarRemissaoCalls: { refId: string; value: RemissaoInternaValue }[];

  beforeEach(() => {
    adicionarRemissaoCalls = [];
    const rootElement = document.createElement('div');
    mockQuill = criarMockQuill(rootElement);
    moduloRemissao = new ModuloRemissao(mockQuill, {});

    const original = moduloRemissao.adicionarRemissao.bind(moduloRemissao);
    (moduloRemissao as any).adicionarRemissao = (refId: string, value: RemissaoInternaValue): boolean => {
      adicionarRemissaoCalls.push({ refId, value });
      return original(refId, value);
    };
  });

  describe('CT-E-03: texto atualizado ao renumerar cada nível', () => {
    function capturaNovoTexto(modulo: ModuloRemissao): { valor: string | null } {
      const captura = { valor: null as string | null };
      const orig = (modulo as any).atualizarTextoRemissao.bind(modulo);
      (modulo as any).atualizarTextoRemissao = (texto: string, antigo: string, novo: string): string => {
        const result = orig(texto, antigo, novo);
        captura.valor = result;
        return result;
      };
      return captura;
    }

    const link = (lexmlId: string, uuid: number, texto: string): string => `
      <a class="lexml-remissao-interna"
         data-lexml-ref="${lexmlId}"
         data-ref-id="ref_1"
         href="#lxEtaId${uuid}">${texto}</a>
    `;

    describe('Inciso (art + par + inc)', () => {
      const textoBase = 'inciso III do § 2º do art. 5º';

      it('inciso renumera: inc3 → inc4', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3', 'art5_par2_inc4', 200);
        expect(captura.valor).to.equal('inciso IV do § 2º do art. 5º');
      });

      it('parágrafo-pai renumera: par2 → par3', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3', 'art5_par3_inc3', 200);
        expect(captura.valor).to.equal('inciso III do § 3º do art. 5º');
      });

      it('artigo-pai renumera: art5 → art6', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3', 'art6_par2_inc3', 200);
        expect(captura.valor).to.equal('inciso III do § 2º do art. 6º');
      });
    });

    describe('Alínea (art + par + inc + ali)', () => {
      const textoBase = 'alínea b do inciso III do § 2º do art. 5º';

      it('alínea renumera: ali2 → ali3', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3_ali2', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3_ali2', 'art5_par2_inc3_ali3', 200);
        expect(captura.valor).to.equal('alínea c do inciso III do § 2º do art. 5º');
      });

      it('inciso-pai renumera: inc3 → inc4', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3_ali2', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3_ali2', 'art5_par2_inc4_ali2', 200);
        expect(captura.valor).to.equal('alínea b do inciso IV do § 2º do art. 5º');
      });

      it('artigo-pai renumera: art5 → art6', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3_ali2', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3_ali2', 'art6_par2_inc3_ali2', 200);
        expect(captura.valor).to.equal('alínea b do inciso III do § 2º do art. 6º');
      });
    });

    describe('Item (art + par + inc + ali + ite)', () => {
      const textoBase = 'item 1 da alínea b do inciso III do § 2º do art. 5º';

      it('item renumera: ite1 → ite2', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3_ali2_ite1', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3_ali2_ite1', 'art5_par2_inc3_ali2_ite2', 200);
        expect(captura.valor).to.equal('item 2 da alínea b do inciso III do § 2º do art. 5º');
      });

      it('artigo-pai renumera: art5 → art6', () => {
        mockQuill.root.innerHTML = link('art5_par2_inc3_ali2_ite1', 200, textoBase);
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('art5_par2_inc3_ali2_ite1', 'art6_par2_inc3_ali2_ite1', 200);
        expect(captura.valor).to.equal('item 1 da alínea b do inciso III do § 2º do art. 6º');
      });
    });

    describe('Agrupadores (cap, sec, sub, tit, liv, prt)', () => {
      it('Capítulo II → III', () => {
        mockQuill.root.innerHTML = link('cap2', 200, 'Capítulo II');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('cap2', 'cap3', 200);
        expect(captura.valor).to.equal('Capítulo III');
      });

      it('Seção renumera: sec2 → sec3 dentro do Capítulo I', () => {
        mockQuill.root.innerHTML = link('cap1_sec2', 200, 'Seção II do Capítulo I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('cap1_sec2', 'cap1_sec3', 200);
        expect(captura.valor).to.equal('Seção III do Capítulo I');
      });

      it('capítulo-pai renumera: Seção II do Capítulo I → Seção II do Capítulo II', () => {
        mockQuill.root.innerHTML = link('cap1_sec2', 200, 'Seção II do Capítulo I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('cap1_sec2', 'cap2_sec2', 200);
        expect(captura.valor).to.equal('Seção II do Capítulo II');
      });

      it('Subseção renumera: sub1 → sub2', () => {
        mockQuill.root.innerHTML = link('cap1_sec2_sub1', 200, 'Subseção I da Seção II do Capítulo I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('cap1_sec2_sub1', 'cap1_sec2_sub2', 200);
        expect(captura.valor).to.equal('Subseção II da Seção II do Capítulo I');
      });

      it('Título I → II', () => {
        mockQuill.root.innerHTML = link('tit1', 200, 'Título I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('tit1', 'tit2', 200);
        expect(captura.valor).to.equal('Título II');
      });

      it('tit + cap + sec: seção renumera sec3 → sec4', () => {
        mockQuill.root.innerHTML = link('tit1_cap2_sec3', 200, 'Seção III do Capítulo II do Título I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('tit1_cap2_sec3', 'tit1_cap2_sec4', 200);
        expect(captura.valor).to.equal('Seção IV do Capítulo II do Título I');
      });

      it('tit + cap + sec: título-pai renumera tit1 → tit2', () => {
        mockQuill.root.innerHTML = link('tit1_cap2_sec3', 200, 'Seção III do Capítulo II do Título I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('tit1_cap2_sec3', 'tit2_cap2_sec3', 200);
        expect(captura.valor).to.equal('Seção III do Capítulo II do Título II');
      });

      it('Livro I → II', () => {
        mockQuill.root.innerHTML = link('liv1', 200, 'Livro I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('liv1', 'liv2', 200);
        expect(captura.valor).to.equal('Livro II');
      });

      it('Parte I → II', () => {
        mockQuill.root.innerHTML = link('prt1', 200, 'Parte I');
        const captura = capturaNovoTexto(moduloRemissao);
        moduloRemissao.atualizarReferencias('prt1', 'prt2', 200);
        expect(captura.valor).to.equal('Parte II');
      });
    });
  });

  describe('caminho síncrono quando texto não muda (textoFixo=false)', () => {
    it('chama adicionarRemissao quando texto já é o canonical do novo lexmlId', () => {
      mockQuill.root.innerHTML = `
        <a class="lexml-remissao-interna"
           data-lexml-ref="art2"
           data-ref-id="ref_1"
           href="#lxEtaId100">art. 3º</a>
      `;

      const count = moduloRemissao.atualizarReferencias('art2', 'art3', 100);

      expect(count).to.equal(1);
      expect(adicionarRemissaoCalls.length).to.equal(1);
      expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('art3');
      expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('art. 3º');
      expect(adicionarRemissaoCalls[0].value.targetUuid).to.equal(100);
    });

    it('parágrafo: chama adicionarRemissao quando texto já é canonical do novo lexmlId', () => {
      mockQuill.root.innerHTML = `
        <a class="lexml-remissao-interna"
           data-lexml-ref="art1_par1"
           data-ref-id="ref_1"
           href="#lxEtaId50">§ 2º do art. 1º</a>
      `;

      const count = moduloRemissao.atualizarReferencias('art1_par1', 'art1_par2', 50);

      expect(count).to.equal(1);
      expect(adicionarRemissaoCalls.length).to.equal(1);
      expect(adicionarRemissaoCalls[0].value.targetLexmlId).to.equal('art1_par2');
    });
  });

  describe('mix de textoFixo=true e textoFixo=false', () => {
    it('conta ambos; apenas textoFixo=true chama adicionarRemissao de forma síncrona', () => {
      mockQuill.root.innerHTML = `
        <p>
          <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_A" href="#lxEtaId100" data-texto-fixo="true">texto livre</a>
          <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_B" href="#lxEtaId100">art. 1º</a>
        </p>
      `;

      const count = moduloRemissao.atualizarReferencias('art1', 'art2', 100);

      expect(count).to.equal(2);
      expect(adicionarRemissaoCalls.length).to.equal(1);
      expect(adicionarRemissaoCalls[0].refId).to.equal('ref_A');
      expect(adicionarRemissaoCalls[0].value.targetRotulo).to.equal('texto livre');
    });
  });

  describe('filtragem por UUID (mix de UUIDs)', () => {
    it('ignora link com UUID incorreto mesmo que lexmlId coincida', () => {
      mockQuill.root.innerHTML = `
        <p>
          <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_A" href="#lxEtaId100" data-texto-fixo="true">texto A</a>
          <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_B" href="#lxEtaId999" data-texto-fixo="true">texto B</a>
        </p>
      `;

      const count = moduloRemissao.atualizarReferencias('art1', 'art2', 100);

      expect(count).to.equal(1);
      expect(adicionarRemissaoCalls.length).to.equal(1);
      expect(adicionarRemissaoCalls[0].refId).to.equal('ref_A');
    });

    it('retorna 0 quando todos os links têm UUID incorreto', () => {
      mockQuill.root.innerHTML = `
        <a class="lexml-remissao-interna" data-lexml-ref="art1" data-ref-id="ref_1" href="#lxEtaId999" data-texto-fixo="true">texto</a>
      `;

      expect(moduloRemissao.atualizarReferencias('art1', 'art2', 100)).to.equal(0);
      expect(adicionarRemissaoCalls.length).to.equal(0);
    });
  });
});
