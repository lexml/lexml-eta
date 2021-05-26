import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';

let artigo: Artigo;

describe('Bloco de Alteração', () => {
  describe('Inicialização', () => {
    beforeEach(function () {
      const articulacao = DispositivoLexmlFactory.createArticulacao();
      artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, articulacao) as Artigo;
    });
    it('O bloco de alteração é incializado vazio mas o artigo passa a ser artigo de alteração', () => {
      expect(artigo.blocoAlteracao!.hasAlteracao()).to.equal(false);
    });
    describe('Adicionando um artigo ao bloco de alteração', () => {
      beforeEach(function () {
        DispositivoLexmlFactory.createAlteracao(artigo);
        artigo.blocoAlteracao!.alteracoes![0].addFilho(DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, artigo));
      });
      it('O bloco de alteração tem um artigo', () => {
        expect(artigo.blocoAlteracao!.hasAlteracao()).to.equal(true);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos.length).to.equal(1);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[0].tipo).to.equal(TipoDispositivo.artigo.tipo);
      });
    });
    describe('Adicionando um artigo com uma estrutura mais ocmplexa', () => {
      beforeEach(function () {
        DispositivoLexmlFactory.createAlteracao(artigo);
        const artigoBloco = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, artigo) as Artigo;
        artigo.blocoAlteracao!.alteracoes![0].addFilho(artigoBloco);
        artigo.blocoAlteracao!.alteracoes![0].addFilho(DispositivoLexmlFactory.create(TipoDispositivo.omissis.tipo, artigoBloco!.caput!));
        artigo.blocoAlteracao!.alteracoes![0].addFilho(DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, artigoBloco!.caput!));
        artigo.blocoAlteracao!.alteracoes![0].addFilho(DispositivoLexmlFactory.create(TipoDispositivo.omissis.tipo, artigoBloco!.caput!));
        artigo.blocoAlteracao!.alteracoes![0].addFilho(DispositivoLexmlFactory.create(TipoDispositivo.paragrafo.tipo, artigoBloco!));
        artigo.blocoAlteracao!.alteracoes![0].addFilho(DispositivoLexmlFactory.create(TipoDispositivo.omissis.tipo, artigoBloco!));
      });
      it('O bloco de alteração tem um artigo e um omissis', () => {
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos.length).to.equal(6);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[0].tipo).to.equal(TipoDispositivo.artigo.name);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[1].tipo).to.equal(TipoDispositivo.omissis.name);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[2].tipo).to.equal(TipoDispositivo.inciso.name);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[3].tipo).to.equal(TipoDispositivo.omissis.name);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[4].tipo).to.equal(TipoDispositivo.paragrafo.name);
        expect(artigo.blocoAlteracao!.alteracoes![0].filhos[5].tipo).to.equal(TipoDispositivo.omissis.name);
      });
    });
  });
});
