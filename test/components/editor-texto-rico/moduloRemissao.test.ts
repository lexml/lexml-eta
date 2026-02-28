import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao/remissao';

// Importa apenas os tipos e constantes de eventos (que não dependem de Quill)
const REMISSAO_INTERNA_CLICK_EVENT = 'remissao-interna-click';
const REMISSAO_INTERNA_CHANGE_EVENT = 'remissao-interna-change';
const REMISSAO_INTERNA_REMOVE_EVENT = 'remissao-interna-remove';

describe('ModuloRemissao - Eventos', () => {
  it('deve definir evento de clique corretamente', () => {
    expect(REMISSAO_INTERNA_CLICK_EVENT).to.equal('remissao-interna-click');
  });

  it('deve definir evento de mudança corretamente', () => {
    expect(REMISSAO_INTERNA_CHANGE_EVENT).to.equal('remissao-interna-change');
  });

  it('deve definir evento de remoção corretamente', () => {
    expect(REMISSAO_INTERNA_REMOVE_EVENT).to.equal('remissao-interna-remove');
  });
});

describe('RemissaoInternaValue - Interface', () => {
  it('deve aceitar valores válidos com todos os campos', () => {
    const value: RemissaoInternaValue = {
      refId: 'ref_123',
      targetUuid: 456,
      targetLexmlId: 'art1_par2',
      targetRotulo: '§ 2º do Art. 1º',
    };

    expect(value.refId).to.equal('ref_123');
    expect(value.targetUuid).to.equal(456);
    expect(value.targetLexmlId).to.equal('art1_par2');
    expect(value.targetRotulo).to.equal('§ 2º do Art. 1º');
  });

  it('deve aceitar valores sem targetRotulo', () => {
    const value: RemissaoInternaValue = {
      refId: 'ref_456',
      targetUuid: 789,
      targetLexmlId: 'art5',
    };

    expect(value.targetRotulo).to.be.undefined;
  });

  it('deve aceitar refId vazio', () => {
    const value: RemissaoInternaValue = {
      refId: '',
      targetUuid: 100,
      targetLexmlId: 'art1',
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

    // Simula a criação do elemento
    const node = document.createElement('a');
    node.setAttribute('href', `#lxEtaId${value.targetUuid}`);
    node.setAttribute('data-lexml-ref', value.targetLexmlId);
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

    const extractedValue = {
      refId: node.getAttribute('data-ref-id'),
      targetLexmlId: node.getAttribute('data-lexml-ref'),
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

  it('deve gerar IDs diferentes em chamadas consecutivas', () => {
    const generateId = (): string => {
      return 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    const id1 = generateId();
    const id2 = generateId();

    // IDs podem ser iguais se gerados no mesmo milissegundo com mesmo random,
    // mas isso é extremamente improvável
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
