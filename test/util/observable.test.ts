import { expect } from '@open-wc/testing';
import { Observable } from '../../src/util/observable';

const aguardarEntrega = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 20));

describe('Observable', () => {
  it('entrega o dado às inscrições ativas', async () => {
    const observable = new Observable<number>();
    const recebidos: number[] = [];
    observable.subscribe((dado: number) => recebidos.push(dado));

    observable.notify(1);
    await aguardarEntrega();

    expect(recebidos).to.deep.equal([1]);
  });

  it('não entrega a uma inscrição cancelada depois do notify', async () => {
    const observable = new Observable<number>();
    const recebidos: number[] = [];
    const inscricao = observable.subscribe((dado: number) => recebidos.push(dado));

    observable.notify(1);
    inscricao.cancel();
    await aguardarEntrega();

    expect(recebidos).to.deep.equal([]);
  });

  it('continua entregando às demais inscrições quando uma é cancelada', async () => {
    const observable = new Observable<number>();
    const canceladas: number[] = [];
    const ativas: number[] = [];
    const inscricao = observable.subscribe((dado: number) => canceladas.push(dado));
    observable.subscribe((dado: number) => ativas.push(dado));

    observable.notify(1);
    inscricao.cancel();
    await aguardarEntrega();

    expect(canceladas).to.deep.equal([]);
    expect(ativas).to.deep.equal([1]);
  });
});
