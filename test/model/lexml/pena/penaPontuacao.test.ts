import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../../../../src/model/lexml/conteudo/textoOmissis';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { antecedePena, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (tipo === TipoDispositivo.pena.tipo) d.rotulo = 'Pena –';
  return d;
};

const fecha = (articulacao: Articulacao): void => {
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
};

// Mensagens de pontuação (as que mencionam o fim do texto) de um dispositivo.
const pontuacao = (d: Dispositivo): string[] =>
  validaDispositivo(d)
    .map(m => m.descricao!)
    .filter(m => m.includes('deveria terminar') || m.includes('não deveria terminar'));

const DOIS_PONTOS = (nome: string): string => `${nome} deveria terminar com dois pontos.`;

describe('Pena: pontuação do dispositivo anterior', () => {
  describe('dono sem outros filhos', () => {
    it('o caput "Matar alguém:" que só tem a pena não recebe mensagem de pontuação', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Matar alguém:';
      novo(art, TipoDispositivo.pena.tipo, 'reclusão.');
      fecha(articulacao);
      expect(pontuacao(art)).to.deep.equal([]);
    });

    it('o caput "Matar alguém." que só tem a pena pede dois-pontos', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Matar alguém.';
      novo(art, TipoDispositivo.pena.tipo, 'reclusão.');
      fecha(articulacao);
      expect(pontuacao(art)).to.deep.equal([DOIS_PONTOS('Artigo')]);
    });

    it('o parágrafo que só tem a pena pede dois-pontos', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Texto.';
      const par = novo(art, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido.');
      novo(par, TipoDispositivo.pena.tipo, 'reclusão.');
      fecha(articulacao);
      expect(pontuacao(par)).to.deep.equal([DOIS_PONTOS('Parágrafo')]);
    });
  });

  describe('último descendente antes da pena do ancestral', () => {
    // § 1º com os incisos I a III e a pena; o inciso III tem as alíneas a e b, e a b tem o item 1.
    const monta = (
      textoUltimoInciso: string,
      textoUltimaAlinea = 'segunda alínea:',
      textoItem = 'único item:'
    ): { inc2: Dispositivo; inc3: Dispositivo; ali: Dispositivo; item: Dispositivo } => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Texto.';
      const par = novo(art, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
      novo(par, TipoDispositivo.inciso.tipo, 'primeiro;');
      const inc2 = novo(par, TipoDispositivo.inciso.tipo, 'segundo;');
      const inc3 = novo(par, TipoDispositivo.inciso.tipo, textoUltimoInciso);
      novo(inc3, TipoDispositivo.alinea.tipo, 'primeira alínea;');
      const ali = novo(inc3, TipoDispositivo.alinea.tipo, textoUltimaAlinea);
      const item = novo(ali, TipoDispositivo.item.tipo, textoItem);
      novo(par, TipoDispositivo.pena.tipo, 'reclusão.');
      fecha(articulacao);
      return { inc2, inc3, ali, item };
    };

    it('o último descendente que termina em dois-pontos não recebe mensagem de pontuação', () => {
      const { inc3, ali, item } = monta('terceiro:');
      expect(pontuacao(item)).to.deep.equal([]);
      expect(pontuacao(ali)).to.deep.equal([]);
      expect(pontuacao(inc3)).to.deep.equal([]);
    });

    it('o último item que termina em ponto pede dois-pontos, e não ponto', () => {
      const { item } = monta('terceiro:', 'segunda alínea:', 'único item.');
      expect(pontuacao(item)).to.deep.equal([DOIS_PONTOS('Item')]);
    });

    it('o último item terminado em ponto e vírgula pede dois-pontos, e não ponto', () => {
      const { item } = monta('terceiro:', 'segunda alínea:', 'único item;');
      expect(pontuacao(item)).to.deep.equal([DOIS_PONTOS('Item')]);
    });

    it('o último inciso (sem filhos) terminado em ponto pede dois-pontos', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Texto.';
      const par = novo(art, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
      novo(par, TipoDispositivo.inciso.tipo, 'primeiro;');
      const inc2 = novo(par, TipoDispositivo.inciso.tipo, 'segundo inciso.');
      novo(par, TipoDispositivo.pena.tipo, 'reclusão.');
      fecha(articulacao);
      expect(pontuacao(inc2)).to.deep.equal([DOIS_PONTOS('Inciso')]);
    });

    it('os demais incisos continuam pedindo ponto e vírgula', () => {
      const { inc2 } = monta('terceiro:');
      expect(pontuacao(inc2)).to.deep.equal([]);
      (inc2 as any).texto = 'segundo.';
      expect(pontuacao(inc2)).to.deep.equal(['Inciso deveria terminar com ponto e vírgula.']);
    });

    it('sem pena, o último inciso continua pedindo ponto', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Texto.';
      const par = novo(art, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
      novo(par, TipoDispositivo.inciso.tipo, 'primeiro;');
      const inc2 = novo(par, TipoDispositivo.inciso.tipo, 'segundo;');
      fecha(articulacao);
      expect(pontuacao(inc2)).to.deep.equal(['Último dispositivo de uma sequência deveria terminar com ponto.']);
      (inc2 as any).texto = 'segundo.';
      expect(pontuacao(inc2)).to.deep.equal([]);
    });
  });

  describe('pena do caput com incisos', () => {
    it('o último inciso do caput antes da pena do caput pede dois-pontos', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Matar alguém:';
      novo(art, TipoDispositivo.inciso.tipo, 'por motivo fútil;');
      const inc2 = novo(art, TipoDispositivo.inciso.tipo, 'contra criança:');
      novo(art, TipoDispositivo.pena.tipo, 'reclusão.');
      novo(art, TipoDispositivo.paragrafo.tipo, 'Outro texto.');
      fecha(articulacao);
      expect(pontuacao(inc2)).to.deep.equal([]);
      (inc2 as any).texto = 'contra criança.';
      expect(pontuacao(inc2)).to.deep.equal([DOIS_PONTOS('Inciso')]);
    });
  });

  describe('antecedePena', () => {
    it('só o dispositivo imediatamente anterior à pena na ordem de leitura', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'Matar alguém:';
      const inc1 = novo(art, TipoDispositivo.inciso.tipo, 'primeiro;');
      const inc2 = novo(art, TipoDispositivo.inciso.tipo, 'segundo:');
      const pena = novo(art, TipoDispositivo.pena.tipo, 'reclusão.');
      const par = novo(art, TipoDispositivo.paragrafo.tipo, 'Outro:');
      fecha(articulacao);
      expect([art, inc1, inc2, pena, par].map(antecedePena)).to.deep.equal([false, false, true, false, false]);
    });
  });

  describe('dentro de bloco de alteração', () => {
    const montaBloco = (textoInciso: string, textoCaput = 'Constranger alguém:'): { cabeca: Artigo; inciso: Dispositivo } => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'O Código Penal passa a vigorar com as seguintes alterações:';
      createAlteracao(art);
      const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, art.alteracoes!) as Artigo;
      cabeca.isDispositivoAlteracao = true;
      cabeca.numero = '213';
      cabeca.createRotulo(cabeca);
      (cabeca.caput as any).texto = textoCaput;
      const inciso = novo(cabeca, TipoDispositivo.inciso.tipo, textoInciso);
      inciso.isDispositivoAlteracao = true;
      novo(cabeca, TipoDispositivo.pena.tipo, 'reclusão, de seis a dez anos.');
      fecha(articulacao);
      return { cabeca, inciso };
    };

    it('o último inciso antes da pena do caput termina em dois-pontos', () => {
      const { inciso } = montaBloco('a não exercer arte:');
      expect(pontuacao(inciso)).to.deep.equal([]);
    });

    it('o último inciso terminado em ponto pede dois-pontos', () => {
      const { inciso } = montaBloco('a não exercer arte.');
      expect(pontuacao(inciso)).to.deep.equal([DOIS_PONTOS('Inciso')]);
    });

    it('o caput omissis seguido da pena não recebe a regra', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      (art.caput as any).texto = 'O Código Penal passa a vigorar com as seguintes alterações:';
      createAlteracao(art);
      const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, art.alteracoes!) as Artigo;
      cabeca.isDispositivoAlteracao = true;
      cabeca.numero = '213';
      cabeca.createRotulo(cabeca);
      (cabeca as any).texto = TEXTO_OMISSIS;
      novo(cabeca, TipoDispositivo.pena.tipo, 'reclusão, de seis a dez anos.');
      fecha(articulacao);
      expect(pontuacao(cabeca).filter(m => m.includes('dois pontos'))).to.deep.equal([]);
    });
  });
});
