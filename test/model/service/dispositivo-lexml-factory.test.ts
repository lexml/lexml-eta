import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';

let articulacao: Articulacao;
let secao: Dispositivo;
let artigo: Artigo;

describe('DispositivoLexmlFactory', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    secao = DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, articulacao);
    artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, secao) as Artigo;
  });
  describe('Testando a inicialização dos dispositivos', () => {
    it('Quando informada uma tag válida, cria um dispositivo correspondente à tag', () => {
      expect(artigo.tipo).to.be.equal(TipoDispositivo.artigo.tipo);
    });
    it('Quando informada uma tag inválida, cria um dispositivo genérico', () => {
      const novo = DispositivoLexmlFactory.create('artigulo', secao) as Artigo;
      expect(novo.tipo).to.be.equal(TipoDispositivo.agrupadorGenerico.tipo);
    });
  });
  describe('Testando a hierarquia dos dispositivos', () => {
    it('cria um dispositivo com referência ao pai que também tem referência ao Filho quando informado um parent', () => {
      const paragrafo = DispositivoLexmlFactory.create(TipoDispositivo.paragrafo.tipo, artigo);
      expect(artigo.filhos?.includes(paragrafo)).to.be.true;
      expect(paragrafo.pai).to.be.equal(artigo);
    });
  });
});
