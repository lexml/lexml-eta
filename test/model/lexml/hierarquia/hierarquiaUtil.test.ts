import { expect } from '@open-wc/testing';
import { Articulacao, Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import {
  isUltimaAlteracao,
  getDispositivoAndFilhosAsLista,
  getDispositivoPosteriorNaSequenciaDeLeitura,
  isDispositivoAlteracao,
} from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { isArtigo } from '../../../../src/model/dispositivo/tipo';
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

// ---------------------------------------------------------------------------
// Regressão: loop infinito em getDispositivoPosteriorNaSequenciaDeLeitura
// quando artigo possui alteracao com dispositivos de alteracao
// ---------------------------------------------------------------------------

describe('getDispositivoPosteriorNaSequenciaDeLeitura — regressão loop infinito', function () {
  this.timeout(5000);

  // Monta estrutura equivalente ao altera_norma_trava_editor.json:
  // articulacao → art1, art2, art3
  // art3.alteracoes → art5 (isDispositivoAlteracao=true)
  //   art5.caput → inciso, omissis
  const montarArticulacaoComAlteracao = (): Articulacao => {
    const articulacao = createArticulacao();
    criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    const art3 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;

    createAlteracao(art3);
    const art5 = criaDispositivo(art3.alteracoes!, TipoDispositivo.artigo.tipo) as Artigo;
    art5.isDispositivoAlteracao = true;
    criaDispositivo(art5.caput!, TipoDispositivo.inciso.tipo);
    criaDispositivo(art5.caput!, TipoDispositivo.omissis.tipo);

    return articulacao;
  };

  it('deve retornar undefined ao buscar artigo posterior ao último artigo com alteracao (sem travar)', () => {
    const articulacao = montarArticulacaoComAlteracao();
    const art3 = articulacao.filhos[2] as Artigo;

    const resultado = getDispositivoPosteriorNaSequenciaDeLeitura(art3, d => isArtigo(d) && !isDispositivoAlteracao(d));

    expect(resultado).to.be.undefined;
  });

  it('deve retornar o próximo artigo corretamente quando há artigo após o que tem alteracao', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;

    createAlteracao(art1);
    const art5 = criaDispositivo(art1.alteracoes!, TipoDispositivo.artigo.tipo) as Artigo;
    art5.isDispositivoAlteracao = true;
    criaDispositivo(art5.caput!, TipoDispositivo.inciso.tipo);
    criaDispositivo(art5.caput!, TipoDispositivo.omissis.tipo);

    const resultado = getDispositivoPosteriorNaSequenciaDeLeitura(art1, d => isArtigo(d) && !isDispositivoAlteracao(d));

    expect(resultado).to.equal(art2);
  });

  it('deve retornar undefined quando não há artigo posterior (artigo único sem alteracao)', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;

    const resultado = getDispositivoPosteriorNaSequenciaDeLeitura(art1, d => isArtigo(d) && !isDispositivoAlteracao(d));

    expect(resultado).to.be.undefined;
  });
});
