import { Parlamentar } from './../../src/model/emenda/emenda';
import { expect } from '@open-wc/testing';
import { incluirParlamentar, excluirParlamentar, moverParlamentar } from '../../src/model/autoria/parlamentarUtil';

let parlamentares: Parlamentar[] = [];

const parlamentarVazio = new Parlamentar();

describe('Testando operações em lista de parlamentares', () => {
  beforeEach(() => {
    parlamentares = [
      {
        identificacao: '1',
        nome: 'Erivânio Vasconcelos',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasaLegislativa: 'CD',
        cargo: '',
        sexo: 'M',
      },
      {
        identificacao: '2',
        nome: 'João Holanda',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasaLegislativa: 'SF',
        cargo: '',
        sexo: 'M',
      },
      {
        identificacao: '3',
        nome: 'Marcos Fragomeni',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasaLegislativa: 'SF',
        cargo: '',
        sexo: 'M',
      },
      {
        identificacao: '4',
        nome: 'Robson Barros',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasaLegislativa: 'CD',
        cargo: '',
        sexo: 'M',
      },
    ];
  });

  it('Deveria possuir autoria com 4 parlamentares', () => {
    expect(parlamentares?.length).to.equal(4);
  });

  describe('Testando inclusão de novo parlamentar', () => {
    beforeEach(() => {
      parlamentares = incluirParlamentar(parlamentares, { ...parlamentarVazio });
    });

    it('Deveria possuir autoria com 5 parlamentares', () => {
      expect(parlamentares.length).to.equal(5);
    });

    it('Novo parlamentar deveria possuir dados vazios', () => {
      const novoParlamentar = parlamentares[parlamentares.length - 1];
      expect(novoParlamentar.identificacao).to.equal('');
      expect(novoParlamentar.nome).to.equal('');
      expect(novoParlamentar.cargo).to.equal('');
    });
  });

  describe('Testando exclusão', () => {
    let parlamentar: Parlamentar;
    beforeEach(() => {
      parlamentar = parlamentares[2];
      parlamentares = excluirParlamentar(parlamentares, 2);
    });

    it('Deveria possuir autoria com 3 parlamentares', () => {
      expect(parlamentares.length).to.equal(3);
    });

    it('Parlamentar excluído não deveria ser encontrado na lista', () => {
      const indexParlamentarExcluido = parlamentares.findIndex(p => p.identificacao === parlamentar.identificacao);
      expect(indexParlamentarExcluido).to.equal(-1);
    });
  });

  describe('Testando movimentação para baixo', () => {
    it('Deveria não mover último parlamentar', () => {
      const lastIndex = parlamentares.length - 1;
      const ultimoParlamentar = parlamentares[lastIndex];
      parlamentares = moverParlamentar(parlamentares, lastIndex, 1);
      expect(ultimoParlamentar.identificacao).to.equal(parlamentares[lastIndex].identificacao);
    });

    describe('Testando movimentação para baixo de parlamentar no meio da lista', () => {
      let parlamentarA: Parlamentar;
      let parlamentarB: Parlamentar;
      beforeEach(() => {
        parlamentarA = parlamentares[2];
        parlamentarB = parlamentares[3];
        parlamentares = moverParlamentar(parlamentares, 2, 1);
      });

      it('Parlamentar "A" deveria ter se movimentado para baixo', () => {
        expect(parlamentares[3].identificacao).to.equal(parlamentarA.identificacao);
      });

      it('Parlamentar "B" deveria ter se movimentado para cima', () => {
        expect(parlamentares[2].identificacao).to.equal(parlamentarB.identificacao);
      });
    });
  });

  describe('Testando movimentação para cima', () => {
    it('Deveria não mover primeiro parlamentar', () => {
      const primeiro = parlamentares[0];
      parlamentares = moverParlamentar(parlamentares, 0, -1);
      expect(primeiro.identificacao).to.equal(parlamentares[0].identificacao);
    });

    describe('Testando movimentação para cima de parlamentar no meio da lista', () => {
      let parlamentarA: Parlamentar;
      let parlamentarB: Parlamentar;
      beforeEach(() => {
        parlamentarA = parlamentares[3];
        parlamentarB = parlamentares[2];
        parlamentares = moverParlamentar(parlamentares, 3, -1);
      });

      it('Parlamentar "A" deveria ter se movimentado para cima', () => {
        expect(parlamentares[2].identificacao).to.equal(parlamentarA.identificacao);
      });

      it('Parlamentar "B" deveria ter se movimentado para baixo', () => {
        expect(parlamentares[3].identificacao).to.equal(parlamentarB.identificacao);
      });
    });
  });
});
