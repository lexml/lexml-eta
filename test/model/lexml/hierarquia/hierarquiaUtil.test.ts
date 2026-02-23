import { expect } from '@open-wc/testing';
import { Articulacao, Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { isUltimaAlteracao, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoNovo } from '../../../../src/model/lexml/situacao/dispositivoNovo';

describe('getDispositivoAndFilhosAsLista', () => {
  let articulacao: Articulacao;

  beforeEach(function () {
    articulacao = createArticulacao();
  });

  describe('Comportamento atual: entendendo como funciona getDispositivoAndFilhosAsLista', () => {
    it('deveria retornar lista sem caput quando há parágrafos (comportamento atual)', () => {
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);

      // Adiciona incisos ao caput
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      // Adiciona parágrafos ao artigo
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

      const lista = getDispositivoAndFilhosAsLista(artigo);

      // Comportamento atual: caput NÃO está na lista quando há parágrafos
      expect(lista).to.include(artigo);
      // O caput NÃO está na lista quando há parágrafos
      expect(lista).to.not.include(caput);
    });
  });
});

describe('isUltimaAlteracao', () => {
  let articulacaoPai: Articulacao;

  beforeEach(function () {
    // Criar uma articulacao pai para simular estrutura de alteração
    const articulacaoRaiz = createArticulacao();
    articulacaoPai = criaDispositivo(articulacaoRaiz, TipoDispositivo.articulacao.tipo) as Articulacao;
  });

  describe('Caso simples: dispositivo único na alteração', () => {
    it('deveria retornar true para um artigo único em uma alteração', () => {
      const artigo = criaDispositivo(articulacaoPai, TipoDispositivo.artigo.tipo) as Artigo;
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      artigo.situacao = new DispositivoNovo();
      artigo.cabecaAlteracao = true; // O artigo é a cabeça da alteração

      expect(isUltimaAlteracao(artigo)).to.be.true;
    });

    it('deveria retornar true para o caput de um artigo único', () => {
      const artigo = criaDispositivo(articulacaoPai, TipoDispositivo.artigo.tipo) as Artigo;
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      artigo.situacao = new DispositivoNovo();
      artigo.cabecaAlteracao = true; // O artigo é a cabeça da alteração

      expect(isUltimaAlteracao(caput)).to.be.true;
    });
  });

  describe('Caso complexo: incisos seguidos de parágrafos (como art628-1)', () => {
    it('deveria retornar false para o último inciso quando há parágrafos após', () => {
      const artigo = criaDispositivo(articulacaoPai, TipoDispositivo.artigo.tipo) as Artigo;
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);

      // Adiciona incisos ao caput
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      const inciso2 = criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      // Adiciona parágrafos ao artigo
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

      artigo.situacao = new DispositivoNovo();
      artigo.cabecaAlteracao = true; // O artigo é a cabeça da alteração

      // O último inciso NÃO deve ser considerado a última alteração
      // porque há parágrafos após ele
      expect(isUltimaAlteracao(inciso2)).to.be.false;
    });

    it('deveria retornar true para o último parágrafo quando é o último dispositivo', () => {
      const artigo = criaDispositivo(articulacaoPai, TipoDispositivo.artigo.tipo) as Artigo;
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);

      // Adiciona incisos ao caput
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      // Adiciona parágrafos ao artigo
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par3 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

      artigo.situacao = new DispositivoNovo();
      artigo.cabecaAlteracao = true; // O artigo é a cabeça da alteração

      // O último parágrafo deve ser considerado a última alteração
      expect(isUltimaAlteracao(par3)).to.be.true;
    });
  });

  describe('Caso com apenas parágrafos', () => {
    it('deveria retornar true para o último parágrafo de vários', () => {
      const artigo = criaDispositivo(articulacaoPai, TipoDispositivo.artigo.tipo) as Artigo;
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par3 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      artigo.situacao = new DispositivoNovo();
      artigo.cabecaAlteracao = true; // O artigo é a cabeça da alteração

      expect(isUltimaAlteracao(par3)).to.be.true;
    });
  });

  describe('Caso art628-1 (MPV 905/2019): incisos seguidos de parágrafos', () => {
    it('deveria retornar false para inciso 2 e true para parágrafo 7', () => {
      const artigo = criaDispositivo(articulacaoPai, TipoDispositivo.artigo.tipo) as Artigo;
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);

      // Adiciona incisos ao caput (como no art628-1 da MPV 905/2019)
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      const inciso2 = criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      // Adiciona 7 parágrafos ao artigo (como no art628-1 da MPV 905/2019)
      const par1 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par2 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par3 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par4 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par5 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par6 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      const par7 = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

      artigo.situacao = new DispositivoNovo();
      artigo.cabecaAlteracao = true; // O artigo é a cabeça da alteração

      expect(isUltimaAlteracao(inciso2)).to.be.false;
      expect(isUltimaAlteracao(par1)).to.be.false;
      expect(isUltimaAlteracao(par2)).to.be.false;
      expect(isUltimaAlteracao(par3)).to.be.false;
      expect(isUltimaAlteracao(par4)).to.be.false;
      expect(isUltimaAlteracao(par5)).to.be.false;
      expect(isUltimaAlteracao(par6)).to.be.false;
      expect(isUltimaAlteracao(par7)).to.be.true;
    });
  });
});
