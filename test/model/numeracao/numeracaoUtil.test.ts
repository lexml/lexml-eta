import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let alinea: Dispositivo;
let item: Dispositivo;

describe('Item', () => {
  beforeEach(function () {
    const articulacao = createArticulacao();
    alinea = criaDispositivo(articulacao, TipoDispositivo.alinea.tipo);
    item = criaDispositivo(alinea, TipoDispositivo.item.tipo);
  });
  describe('Testando a numeração de alínea', () => {
    it('deveria ser inicializada sem informação de numeração e rótulo', () => {
      expect(item.name).to.equal(TipoDispositivo.item.tipo);
      expect(item.uuid).to.greaterThan(0);

      expect(item.numero).to.be.undefined;
      expect(item.rotulo).to.be.undefined;
    });
  });
});
