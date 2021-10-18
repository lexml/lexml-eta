import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let artigo: Artigo;

describe('Bloco de Alteração', () => {
  describe('Inicialização', () => {
    beforeEach(function () {
      const articulacao = DispositivoLexmlFactory.createArticulacao();
      artigo = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    });
    it('O bloco de alteração é incializado vazio mas o artigo passa a ser artigo de alteração', () => {
      expect(artigo.hasAlteracao()).to.equal(false);
    });
    describe('Adicionando um artigo ao bloco de alteração', () => {
      beforeEach(function () {
        DispositivoLexmlFactory.createAlteracao(artigo);
        artigo.alteracoes!.addFilho(DispositivoLexmlFactory.create(artigo, TipoDispositivo.artigo.tipo));
      });
      it('O bloco de alteração tem um artigo', () => {
        expect(artigo.hasAlteracao()).to.equal(true);
        expect(artigo.alteracoes!.filhos.length).to.equal(1);
        expect(artigo.alteracoes!.filhos[0].tipo).to.equal(TipoDispositivo.artigo.tipo);
      });
    });
    describe('Adicionando um artigo com uma estrutura mais complexa', () => {
      beforeEach(function () {
        DispositivoLexmlFactory.createAlteracao(artigo);
        const artigoBloco = DispositivoLexmlFactory.create(artigo, TipoDispositivo.artigo.tipo) as Artigo;
        artigo.alteracoes!.addFilho(artigoBloco);
        artigo.alteracoes!.addFilho(DispositivoLexmlFactory.create(artigoBloco!.caput!, TipoDispositivo.omissis.tipo));
        artigo.alteracoes!.addFilho(DispositivoLexmlFactory.create(artigoBloco!.caput!, TipoDispositivo.inciso.tipo));
        artigo.alteracoes!.addFilho(DispositivoLexmlFactory.create(artigoBloco!.caput!, TipoDispositivo.omissis.tipo));
        artigo.alteracoes!.addFilho(DispositivoLexmlFactory.create(artigoBloco!, TipoDispositivo.paragrafo.tipo));
        artigo.alteracoes!.addFilho(DispositivoLexmlFactory.create(artigoBloco!, TipoDispositivo.omissis.tipo));
      });
      it('O bloco de alteração tem um artigo e um omissis', () => {
        expect(artigo.alteracoes!.filhos.length).to.equal(6);
        expect(artigo.alteracoes!.filhos[0].tipo).to.equal(TipoDispositivo.artigo.name);
        expect(artigo.alteracoes!.filhos[1].tipo).to.equal(TipoDispositivo.omissis.name);
        expect(artigo.alteracoes!.filhos[2].tipo).to.equal(TipoDispositivo.inciso.name);
        expect(artigo.alteracoes!.filhos[3].tipo).to.equal(TipoDispositivo.omissis.name);
        expect(artigo.alteracoes!.filhos[4].tipo).to.equal(TipoDispositivo.paragrafo.name);
        expect(artigo.alteracoes!.filhos[5].tipo).to.equal(TipoDispositivo.omissis.name);
      });
    });
  });
});
