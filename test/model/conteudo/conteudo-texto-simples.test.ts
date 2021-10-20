import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let capitulo: Dispositivo;

describe('ConteudoTextoSimples', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
  });
  describe('Inicialização de ConteudoTextoSimples', () => {
    it('ConteudoTextoSimples é inicializado corretamente o dispositivo é criado a partir da factory', () => {
      expect(capitulo.name).to.equal('Capitulo');
      expect(capitulo.uuid).to.greaterThan(0);
    });
    describe('Como o ConteudoTextoSimples trata o texto', () => {
      it('ConteudoTextoSimples retorna a string informada sem alteração', () => {
        capitulo.texto = 'DAS PESSOAS';
        expect(capitulo.texto).to.be.equal('DAS PESSOAS');
      });
    });
  });
});
