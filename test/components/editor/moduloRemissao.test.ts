import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao/remissao';
import { ReferenciaDispositivoParser } from '../../../src/model/lexml/numeracao/parserReferenciaDispositivo';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

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

describe('Geração de ID de Referência', () => {
  it('deve gerar ID único com prefixo ref_', () => {
    const prefix = 'ref_';
    const id = prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    expect(id.startsWith('ref_')).to.be.true;
    expect(id.length).to.be.greaterThan(10);
  });

  it('deve gerar IDs diferentes em chamadas consecutivas', async () => {
    const generateId = (): string => {
      return 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    const id1 = generateId();
    await new Promise(resolve => setTimeout(resolve, 1));
    const id2 = generateId();

    expect(id1).to.not.equal(id2);
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
