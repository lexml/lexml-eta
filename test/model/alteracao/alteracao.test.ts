import { expect } from '@open-wc/testing';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';

let artigo: Artigo;

describe('Bloco de Alteração', () => {
  describe('Inicialização', () => {
    beforeEach(function () {
      const articulacao = DispositivoLexmlFactory.createArticulacao();
      artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, articulacao) as Artigo;
      DispositivoLexmlFactory.createAlteracaoArtigo(artigo);
    });
    it('O bloco de alteração é incializado vazio mas o artigo passa a ser artigo de alteração', () => {
      expect(artigo!.hasAlteracao()).to.equal(true);
      expect(artigo!.hasDispositivosAlterados()).to.equal(false);
      expect(artigo.dispositivosAlteracao!.length).to.equal(0);
    });
    describe('Adicionando um artigo ao bloco de alteração', () => {
      beforeEach(function () {
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, artigo.blocoAlteracao!);
      });
      it('O bloco de alteração tem um artigo', () => {
        expect(artigo.hasAlteracao()).to.equal(true);
        expect(artigo.dispositivosAlteracao!.length).to.equal(1);
        expect(artigo.dispositivosAlteracao![0].tipo).to.equal(TipoDispositivo.artigo.tipo);
      });
    });
    describe('Adicionando um artigo com um inciso e um omissis ao bloco de alteração', () => {
      let artigoBloco: Artigo;
      let incisoArtigoBloco: Dispositivo;
      let omissisAntesInciso: Dispositivo;
      let omissisAposInciso: Dispositivo;
      let paragrafoArtigoBloco: DispositivoLexmlFactory;
      let omissisAposParagrafo: Dispositivo;

      beforeEach(function () {
        artigoBloco = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, artigo.blocoAlteracao!) as Artigo;
        omissisAntesInciso = DispositivoLexmlFactory.create(TipoDispositivo.omissis.tipo, artigoBloco!.caput!);
        incisoArtigoBloco = DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, artigoBloco!.caput!);
        omissisAposInciso = DispositivoLexmlFactory.create(TipoDispositivo.omissis.tipo, artigoBloco!.caput!);
        paragrafoArtigoBloco = DispositivoLexmlFactory.create(TipoDispositivo.paragrafo.tipo, artigoBloco!);
        omissisAposParagrafo = DispositivoLexmlFactory.create(TipoDispositivo.omissis.tipo, artigoBloco!);
      });
      it('O bloco de alteração tem um artigo e um omissis', () => {
        expect(artigo.dispositivosAlteracao!.length).to.equal(6);
        expect(artigo.dispositivosAlteracao![0]).to.equal(artigoBloco);
        expect(artigo.dispositivosAlteracao![1]).to.equal(omissisAntesInciso);
        expect(artigo.dispositivosAlteracao![2]).to.equal(incisoArtigoBloco);
        expect(artigo.dispositivosAlteracao![3]).to.equal(omissisAposInciso);
        expect(artigo.dispositivosAlteracao![4]).to.equal(paragrafoArtigoBloco);
        expect(artigo.dispositivosAlteracao![5]).to.equal(omissisAposParagrafo);
      });
    });
  });
});
