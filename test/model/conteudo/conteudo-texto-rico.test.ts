import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';

let paragrafo: Dispositivo;

describe('ConteudoTextoRico', () => {
  describe('Inicialização de ConteudoTextoRico', () => {
    beforeEach(function () {
      const articulacao = DispositivoLexmlFactory.createArticulacao();
      paragrafo = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.paragrafo.tipo);
    });
    it('O ConteudoTextoRico é inicializado corretamente o dispositivo é criado a partir da factory', () => {
      expect(paragrafo.name).to.equal(TipoDispositivo.paragrafo.tipo);
      expect(paragrafo.uuid).to.greaterThan(0);
    });
    describe('Como o ConteudoTextoRico trata o texto', () => {
      it('O ConteudoTextoRico é inicializado com uma string vazia', () => {
        expect(paragrafo.texto).to.equal('');
      });
      it('Conteudo aceita string com tags', () => {
        paragrafo.texto = '<p>Conteúdo do <b>texto</b><p>';
        expect(paragrafo.texto).to.be.equal('<p>Conteúdo do <b>texto</b><p>');
      });
      it('Conteudo retorna a string informada sem alteração', () => {
        paragrafo.texto = 'Texto qualquer';
        expect(paragrafo.texto).to.be.equal('Texto qualquer');
      });
    });
  });
});
