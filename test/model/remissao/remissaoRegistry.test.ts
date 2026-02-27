import { expect } from '@open-wc/testing';
import { RemissaoRegistry } from '../../../src/model/remissao/remissaoRegistry';
import { RemissaoInterna } from '../../../src/model/remissao/remissao';

describe('RemissaoRegistry', () => {
  let registry: RemissaoRegistry;

  beforeEach(() => {
    registry = new RemissaoRegistry();
  });

  describe('adicionar', () => {
    it('deve adicionar referência corretamente', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      expect(registry.tamanho).to.equal(1);
      expect(registry.vazio).to.be.false;
    });

    it('deve indexar referência por origem', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      const porOrigem = registry.getReferenciasPorOrigem(1);
      expect(porOrigem.length).to.equal(1);
      expect(porOrigem[0].id).to.equal('ref-1');
    });

    it('deve indexar referência por destino', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      const porDestino = registry.getReferenciasPorDestino('art1');
      expect(porDestino.length).to.equal(1);
      expect(porDestino[0].id).to.equal('ref-1');
    });

    it('deve adicionar múltiplas referências do mesmo elemento', () => {
      const remissao1: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      const remissao2: RemissaoInterna = {
        id: 'ref-2',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art2',
        dispositivoDestinoUuid: 20,
        indexInicio: 20,
        indexFim: 27,
        textoOriginal: 'art. 2º',
        tipo: 'manual',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao1);
      registry.adicionar(remissao2);

      expect(registry.tamanho).to.equal(2);
      const porOrigem = registry.getReferenciasPorOrigem(1);
      expect(porOrigem.length).to.equal(2);
    });
  });

  describe('remover', () => {
    it('deve remover referência corretamente', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);
      const resultado = registry.remover('ref-1');

      expect(resultado).to.be.true;
      expect(registry.tamanho).to.equal(0);
      expect(registry.vazio).to.be.true;
    });

    it('deve retornar false ao tentar remover referência inexistente', () => {
      const resultado = registry.remover('ref-inexistente');
      expect(resultado).to.be.false;
    });

    it('deve remover referência dos índices de origem e destino', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);
      registry.remover('ref-1');

      expect(registry.getReferenciasPorOrigem(1).length).to.equal(0);
      expect(registry.getReferenciasPorDestino('art1').length).to.equal(0);
    });
  });

  describe('getReferenciasPorOrigem', () => {
    it('deve buscar por origem corretamente', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 5,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      const resultado = registry.getReferenciasPorOrigem(5);
      expect(resultado.length).to.equal(1);
      expect(resultado[0].elementoOrigemUuid).to.equal(5);
    });

    it('deve retornar array vazio para origem sem referências', () => {
      const resultado = registry.getReferenciasPorOrigem(999);
      expect(resultado).to.be.an('array').that.is.empty;
    });
  });

  describe('getReferenciasPorDestino', () => {
    it('deve buscar por destino corretamente', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art5_par2',
        dispositivoDestinoUuid: 50,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: '§ 2º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      const resultado = registry.getReferenciasPorDestino('art5_par2');
      expect(resultado.length).to.equal(1);
      expect(resultado[0].dispositivoDestinoId).to.equal('art5_par2');
    });

    it('deve retornar array vazio para destino sem referências', () => {
      const resultado = registry.getReferenciasPorDestino('art_inexistente');
      expect(resultado).to.be.an('array').that.is.empty;
    });
  });

  describe('getReferenciaPorId', () => {
    it('deve buscar referência por ID corretamente', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-especial',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'manual',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      const resultado = registry.getReferenciaPorId('ref-especial');
      expect(resultado).to.not.be.undefined;
      expect(resultado?.id).to.equal('ref-especial');
    });

    it('deve retornar undefined para ID inexistente', () => {
      const resultado = registry.getReferenciaPorId('id-inexistente');
      expect(resultado).to.be.undefined;
    });
  });

  describe('getTodasReferencias', () => {
    it('deve retornar todas as referências', () => {
      const remissao1: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      const remissao2: RemissaoInterna = {
        id: 'ref-2',
        elementoOrigemUuid: 2,
        dispositivoDestinoId: 'art2',
        dispositivoDestinoUuid: 20,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 2º',
        tipo: 'manual',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao1);
      registry.adicionar(remissao2);

      const todas = registry.getTodasReferencias();
      expect(todas.length).to.equal(2);
    });

    it('deve retornar uma cópia das referências', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);
      const todas1 = registry.getTodasReferencias();
      const todas2 = registry.getTodasReferencias();

      expect(todas1).to.not.equal(todas2);
    });
  });

  describe('atualizarDestino', () => {
    it('deve atualizar ID de destino na renumeração', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);
      const atualizadas = registry.atualizarDestino('art1', 'art2', 20);

      expect(atualizadas.length).to.equal(1);
      expect(atualizadas[0].dispositivoDestinoId).to.equal('art2');
      expect(atualizadas[0].dispositivoDestinoUuid).to.equal(20);
    });

    it('deve atualizar índice de destino após renumeração', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);
      registry.atualizarDestino('art1', 'art2', 20);

      const porDestinoAntigo = registry.getReferenciasPorDestino('art1');
      const porDestinoNovo = registry.getReferenciasPorDestino('art2');

      expect(porDestinoAntigo.length).to.equal(0);
      expect(porDestinoNovo.length).to.equal(1);
    });

    it('deve retornar array vazio para destino inexistente', () => {
      const resultado = registry.atualizarDestino('art_inexistente', 'art_novo', 30);
      expect(resultado).to.be.an('array').that.is.empty;
    });
  });

  describe('marcarComoInvalidas', () => {
    it('deve marcar referências como inválidas', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
        valida: true,
      };

      registry.adicionar(remissao);
      const invalidadas = registry.marcarComoInvalidas('art1');

      expect(invalidadas.length).to.equal(1);
      expect(invalidadas[0].valida).to.be.false;
    });

    it('deve retornar array vazio para destino inexistente', () => {
      const resultado = registry.marcarComoInvalidas('art_inexistente');
      expect(resultado).to.be.an('array').that.is.empty;
    });
  });

  describe('restaurarReferencias', () => {
    it('deve restaurar referências marcadas como inválidas', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
        valida: false,
      };

      registry.adicionar(remissao);
      const restauradas = registry.restaurarReferencias('art1', 15);

      expect(restauradas.length).to.equal(1);
      expect(restauradas[0].valida).to.be.true;
      expect(restauradas[0].dispositivoDestinoUuid).to.equal(15);
    });
  });

  describe('removerReferenciasPorOrigem', () => {
    it('deve remover todas as referências de um elemento', () => {
      const remissao1: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      const remissao2: RemissaoInterna = {
        id: 'ref-2',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art2',
        dispositivoDestinoUuid: 20,
        indexInicio: 20,
        indexFim: 27,
        textoOriginal: 'art. 2º',
        tipo: 'manual',
        dataCriacao: new Date(),
      };

      const remissao3: RemissaoInterna = {
        id: 'ref-3',
        elementoOrigemUuid: 2,
        dispositivoDestinoId: 'art3',
        dispositivoDestinoUuid: 30,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 3º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao1);
      registry.adicionar(remissao2);
      registry.adicionar(remissao3);

      const removidas = registry.removerReferenciasPorOrigem(1);

      expect(removidas).to.equal(2);
      expect(registry.tamanho).to.equal(1);
      expect(registry.getReferenciasPorOrigem(1).length).to.equal(0);
    });

    it('deve retornar 0 para elemento sem referências', () => {
      const resultado = registry.removerReferenciasPorOrigem(999);
      expect(resultado).to.equal(0);
    });
  });

  describe('processarAtualizacao', () => {
    it('deve processar atualização de renumeração', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);

      const atualizadas = registry.processarAtualizacao({
        tipo: 'renumeracao',
        oldId: 'art1',
        newId: 'art2',
        newUuid: 20,
      });

      expect(atualizadas.length).to.equal(1);
      expect(atualizadas[0].dispositivoDestinoId).to.equal('art2');
    });

    it('deve processar atualização de remoção', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
        valida: true,
      };

      registry.adicionar(remissao);

      const atualizadas = registry.processarAtualizacao({
        tipo: 'remocao',
        oldId: 'art1',
      });

      expect(atualizadas.length).to.equal(1);
      expect(atualizadas[0].valida).to.be.false;
    });
  });

  describe('limpar', () => {
    it('deve limpar todas as referências', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date(),
      };

      registry.adicionar(remissao);
      registry.limpar();

      expect(registry.tamanho).to.equal(0);
      expect(registry.vazio).to.be.true;
    });
  });

  describe('toJSON / fromJSON', () => {
    it('deve serializar e deserializar corretamente', () => {
      const remissao: RemissaoInterna = {
        id: 'ref-1',
        elementoOrigemUuid: 1,
        dispositivoDestinoId: 'art1',
        dispositivoDestinoUuid: 10,
        indexInicio: 0,
        indexFim: 7,
        textoOriginal: 'art. 1º',
        tipo: 'automatica',
        dataCriacao: new Date('2024-01-15T10:30:00Z'),
      };

      registry.adicionar(remissao);

      const json = registry.toJSON();
      const restaurado = RemissaoRegistry.fromJSON(json);

      expect(restaurado.tamanho).to.equal(1);
      expect(restaurado.getReferenciaPorId('ref-1')).to.not.be.undefined;
      expect(restaurado.getReferenciaPorId('ref-1')?.elementoOrigemUuid).to.equal(1);
      expect(restaurado.getReferenciaPorId('ref-1')?.dispositivoDestinoId).to.equal('art1');
    });
  });
});
