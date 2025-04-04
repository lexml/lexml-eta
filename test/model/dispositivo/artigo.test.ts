import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let secao: Dispositivo;
let artigo: Artigo;

describe('Artigo: inicialização', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    secao = criaDispositivo(articulacao, TipoDispositivo.secao.tipo);
    artigo = criaDispositivo(secao, TipoDispositivo.artigo.tipo) as Artigo;
  });
  it('quando criado a partir da factory, o dispositivo é inicializado corretamente mas sem informação de numeração', () => {
    expect(artigo.name).to.equal(TipoDispositivo.artigo.tipo);
    expect(artigo.uuid).to.greaterThan(0);
  });
  it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
    expect(artigo.filhos?.length).to.equal(0);
  });

  it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
    expect(validaHierarquia(artigo).length).to.be.equal(0);
  });

  it('quando criado a partir da factory e adicionado ao pai, o artigo é filho do mesmo', () => {
    expect(secao.filhos.length).to.be.equal(1);
  });

  it('o artigo pode ser numerado a partir do pai', () => {
    secao.renumeraFilhos();

    expect(artigo.numero).to.equal('1');
  });

  it('o artigo pode ser criado sem agrupamentos', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    criaDispositivo(novo, TipoDispositivo.caput.tipo);
    expect(articulacao.artigos!.length).to.equal(2);
  });

  it('o artigo pode ser criado após um artigo existente', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    criaDispositivo(novo, TipoDispositivo.caput.tipo);

    secao.addFilho(artigo as Artigo, novo as Artigo);
    secao.renumeraFilhos();
    expect(novo.numero).to.equal('2');
  });

  it('o artigo cria rótulo corretamente', () => {
    const a1 = criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    secao.renumeraFilhos();

    expect(a1.rotulo).to.equal('Art. 2º');

    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    criaDispositivo(secao, TipoDispositivo.artigo.tipo);
    const a2 = criaDispositivo(secao, TipoDispositivo.artigo.tipo);

    expect(secao.filhos.length).to.be.equal(10);
    secao.renumeraFilhos();

    expect(a2.rotulo).to.equal('Art. 10.');
  });

  it('o artigo trata incisos do caput como filhos', () => {
    criaDispositivo(artigo, TipoDispositivo.inciso.tipo);
    expect(artigo.caput!.filhos.length).to.be.equal(1);
    expect(artigo.filhos.length).to.be.equal(1);
  });

  it('o dispositivo pode possuir, como filhos, paragrafos e dispositivos genéricos', () => {
    criaDispositivo(artigo, TipoDispositivo.generico.tipo);
    criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
    expect(artigo.filhos?.length).to.equal(2);
  });

  it('quando solicitada a exclusão ao pai, o artigo é excluído também da articulação', () => {
    secao.removeFilho(artigo);
    expect(secao.filhos.length).to.be.equal(0);
  });

  it('quando solicitada a exclusão ao pai, o artigo é excluído', () => {
    criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
    secao.removeFilho(artigo);
    expect(secao.filhos.length).to.be.equal(0);
    expect(articulacao.artigos.length).to.be.equal(0);
  });
});
