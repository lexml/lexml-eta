import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../src/model/dispositivo/situacao';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { DispositivoOriginal } from '../../../src/model/lexml/situacao/dispositivoOriginal';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let artigo1: Dispositivo;

describe('Numeração de artigos de emenda', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    artigo1.situacao = new DispositivoOriginal();
  });
  it('Testando a inicialização ', () => {
    expect(artigo1.situacao.descricaoSituacao).to.equal(DescricaoSituacao.DISPOSITIVO_ORIGINAL);
  });
  describe('Testando a adição de um dispositivoAdicionado após um único artigo', () => {
    beforeEach(function () {
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    });
    it('o artigo deveria ser adicionado', () => {
      expect(articulacao.artigos[1].situacao.descricaoSituacao).equals(DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    });
  });
});
