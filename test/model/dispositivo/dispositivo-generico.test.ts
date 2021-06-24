import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';

let articulacao: Articulacao;
let dispositivoGenerico: Dispositivo;

describe('DispositivoGenerico: inicialização', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    dispositivoGenerico = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.generico.tipo);
  });

  it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
    expect(dispositivoGenerico.filhos?.length).to.equal(0);
  });

  it('quando criado a partir da factory e adicionado a um dispositivo, a dispositivoGenerico é filho do inciso', () => {
    const inciso = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.inciso.tipo);
    DispositivoLexmlFactory.create(inciso, TipoDispositivo.generico.tipo);

    expect(inciso.filhos.length).to.be.equal(1);
  });

  it('quando inicializado corretamente, o dispositivoGenerico NÃO pode ser numerado a partir do pai', () => {
    const inciso = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.inciso.tipo);
    DispositivoLexmlFactory.create(dispositivoGenerico, TipoDispositivo.generico.tipo);
    inciso.renumeraFilhos();
    expect(dispositivoGenerico.numero).to.be.undefined;
  });

  it('quando inicializado corretamente, o dispositivoGenerico NÃO pode ser numerado a partir do pai e tampouco gerará um novo rótulo', () => {
    const inciso = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.inciso.tipo);
    DispositivoLexmlFactory.create(dispositivoGenerico, TipoDispositivo.generico.tipo);
    inciso.renumeraFilhos();
    expect(dispositivoGenerico.rotulo).to.be.undefined;
  });

  it('quando inicializado corretamente, o dispositivoGenerico NÃO poderá gerar um novo rótulo', () => {
    dispositivoGenerico.createRotulo(dispositivoGenerico);
    expect(dispositivoGenerico.rotulo).equals('DispositivoAgrupadorGenerico');
  });

  it('quando inicializado corretamente, o dispositivoGenerico NÃO pode renumerar ou gerar rótulos para seus filhos', () => {
    const inciso = DispositivoLexmlFactory.create(dispositivoGenerico, TipoDispositivo.inciso.tipo);
    inciso.renumeraFilhos();
    expect(inciso.numero).to.be.undefined;
    expect(inciso.rotulo).to.be.undefined;
  });

  it('quando inicializado corretamente, o dispositivoGenerico NÃO pode renumerar ou gerar rótulos para seus filhos mas respeita numeração e rótulo informados', () => {
    const inciso = DispositivoLexmlFactory.create(dispositivoGenerico, TipoDispositivo.inciso.tipo);
    inciso.numero = '1';
    inciso.rotulo = 'qq 1';
    inciso.renumeraFilhos();
    expect(inciso.numero).to.be.equal('1');
    expect(inciso.rotulo).to.be.equal('qq 1');
  });

  it('o dispositivoGenerico respeita numeração e rótulo informados e ignora comando de gerar rótulo', () => {
    dispositivoGenerico.numero = '1';
    dispositivoGenerico.rotulo = 'dgn 1';
    expect(dispositivoGenerico.numero).to.be.equal('1');
    expect(dispositivoGenerico.rotulo).to.be.equal('dgn 1');
  });

  it('o dispositivo pode possuir, como filhos, itens e dispositivos genéricos', () => {
    DispositivoLexmlFactory.create(dispositivoGenerico, TipoDispositivo.generico.tipo);
    DispositivoLexmlFactory.create(dispositivoGenerico, TipoDispositivo.item.tipo);
    expect(dispositivoGenerico.filhos?.length).to.equal(2);
  });
});
