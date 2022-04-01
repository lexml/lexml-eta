import { Parlamentar } from './../../src/model/autoria/parlamentar';
import { expect } from '@open-wc/testing';
import { incluirNovoParlamentar, excluirParlamentar, moverParlamentar } from '../../src/model/autoria/parlamentarUtil';

let parlamentares: Parlamentar[] = [];

describe('Testando operações em lista de parlamentares', () => {
  beforeEach(() => {
    parlamentares = [
      {
        id: '1',
        nome: 'Erivânio Vasconcelos',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasa: 'CD',
        cargo: '',
        indSexo: 'M',
      },
      {
        id: '2',
        nome: 'João Holanda',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasa: 'SF',
        cargo: '',
        indSexo: 'M',
      },
      {
        id: '3',
        nome: 'Marcos Fragomeni',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasa: 'SF',
        cargo: '',
        indSexo: 'M',
      },
      {
        id: '4',
        nome: 'Robson Barros',
        siglaPartido: 'PX',
        siglaUF: 'DF',
        siglaCasa: 'CD',
        cargo: '',
        indSexo: 'M',
      },
    ];
  });

  it('Deveria possuir autoria com 4 parlamentares', () => {
    expect(parlamentares?.length).to.equal(4);
  });

  describe('Testando inclusão de novo parlamentar', () => {
    beforeEach(() => {
      parlamentares = incluirNovoParlamentar(parlamentares);
    });

    it('Deveria possuir autoria com 5 parlamentares', () => {
      expect(parlamentares.length).to.equal(5);
    });

    it('Novo parlamentar deveria possuir dados vazios', () => {
      const novoParlamentar = parlamentares[parlamentares.length - 1];
      expect(novoParlamentar.id).to.equal('');
      expect(novoParlamentar.nome).to.equal('');
      expect(novoParlamentar.cargo).to.equal('');
    });
  });

  describe('Testando exclusão', () => {
    let parlamentar: Parlamentar;
    beforeEach(() => {
      parlamentar = parlamentares[2];
      parlamentares = excluirParlamentar(parlamentares, parlamentares[2]);
    });

    it('Deveria possuir autoria com 3 parlamentares', () => {
      expect(parlamentares.length).to.equal(3);
    });

    it('Parlamentar excluído não deveria ser encontrado na lista', () => {
      const indexParlamentarExcluido = parlamentares.findIndex(p => p.id === parlamentar.id);
      expect(indexParlamentarExcluido).to.equal(-1);
    });
  });

  describe('Testando movimentação para baixo', () => {
    it('Deveria não mover último parlamentar', () => {
      const ultimoParlamentar = parlamentares[parlamentares.length - 1];
      parlamentares = moverParlamentar(parlamentares, ultimoParlamentar, 1);
      expect(ultimoParlamentar.id).to.equal(parlamentares[parlamentares.length - 1].id);
    });

    describe('Testando movimentação para baixo de parlamentar no meio da lista', () => {
      let parlamentarA: Parlamentar;
      let parlamentarB: Parlamentar;
      beforeEach(() => {
        parlamentarA = parlamentares[2];
        parlamentarB = parlamentares[3];
        parlamentares = moverParlamentar(parlamentares, parlamentarA, 1);
      });

      it('Parlamentar "A" deveria ter se movimentado para baixo', () => {
        expect(parlamentares[3].id).to.equal(parlamentarA.id);
      });

      it('Parlamentar "B" deveria ter se movimentado para cima', () => {
        expect(parlamentares[2].id).to.equal(parlamentarB.id);
      });
    });
  });

  describe('Testando movimentação para cima', () => {
    it('Deveria não mover primeiro parlamentar', () => {
      const primeiro = parlamentares[0];
      parlamentares = moverParlamentar(parlamentares, primeiro, -1);
      expect(primeiro.id).to.equal(parlamentares[0].id);
    });

    describe('Testando movimentação para cima de parlamentar no meio da lista', () => {
      let parlamentarA: Parlamentar;
      let parlamentarB: Parlamentar;
      beforeEach(() => {
        parlamentarA = parlamentares[3];
        parlamentarB = parlamentares[2];
        parlamentares = moverParlamentar(parlamentares, parlamentarA, -1);
      });

      it('Parlamentar "A" deveria ter se movimentado para cima', () => {
        expect(parlamentares[2].id).to.equal(parlamentarA.id);
      });

      it('Parlamentar "B" deveria ter se movimentado para baixo', () => {
        expect(parlamentares[3].id).to.equal(parlamentarB.id);
      });
    });
  });
});
