import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { getElementos } from '../../../src/model/elemento/elementoUtil';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';

const novo = (pai: Dispositivo, tipo: string, texto: string, rotulo?: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (rotulo) d.rotulo = rotulo;
  return d;
};

const fecha = (articulacao: Articulacao): void => {
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
};

const linhas = (articulacao: Articulacao): string[] =>
  getElementos(articulacao)
    .filter(e => e.tipo !== 'Articulacao')
    .map(e => `${e.tipo}|${e.rotulo ?? ''}|${e.conteudo?.texto}`);

describe('Pena: ordem das linhas do editor', () => {
  it('art. 197 do CP: cada inciso do caput é seguido da sua pena', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art.caput as any).texto = 'Constranger alguém, mediante violência ou grave ameaça:';
    const inc1 = novo(art, TipoDispositivo.inciso.tipo, 'a não exercer arte, ofício, profissão ou indústria:');
    novo(inc1, TipoDispositivo.pena.tipo, 'detenção, de um mês a um ano, e multa.', 'Pena –');
    const inc2 = novo(art, TipoDispositivo.inciso.tipo, 'a abrir ou fechar o seu estabelecimento:');
    novo(inc2, TipoDispositivo.pena.tipo, 'detenção, de três meses a um ano, e multa.', 'Pena –');
    fecha(articulacao);

    expect(linhas(articulacao)).to.deep.equal([
      'Artigo|Artigo único.|Constranger alguém, mediante violência ou grave ameaça:',
      'Inciso|I –|a não exercer arte, ofício, profissão ou indústria:',
      'Pena|Pena –|detenção, de um mês a um ano, e multa.',
      'Inciso|II –|a abrir ou fechar o seu estabelecimento:',
      'Pena|Pena –|detenção, de três meses a um ano, e multa.',
    ]);
  });

  it('art. 121 do CP: pena do caput antes do § 1º, que tem a própria pena', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art.caput as any).texto = 'Matar alguém:';
    const par1 = novo(art, TipoDispositivo.paragrafo.tipo, 'Se o agente comete o crime impelido por motivo de relevante valor social:');
    novo(par1, TipoDispositivo.pena.tipo, 'reclusão, de um sexto a um terço.', 'Pena –');
    novo(art, TipoDispositivo.pena.tipo, 'reclusão, de seis a vinte anos.', 'Pena –');
    fecha(articulacao);

    expect(linhas(articulacao)).to.deep.equal([
      'Artigo|Artigo único.|Matar alguém:',
      'Pena|Pena –|reclusão, de seis a vinte anos.',
      'Paragrafo|Parágrafo único.|Se o agente comete o crime impelido por motivo de relevante valor social:',
      'Pena|Pena –|reclusão, de um sexto a um terço.',
    ]);
  });

  it('pena de parágrafo vem depois de todos os incisos e alíneas do parágrafo', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art.caput as any).texto = 'Texto.';
    const par1 = novo(art, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
    const inc1 = novo(par1, TipoDispositivo.inciso.tipo, 'por motivo fútil:');
    novo(inc1, TipoDispositivo.alinea.tipo, 'com arma;');
    novo(par1, TipoDispositivo.pena.tipo, 'reclusão.', 'Pena –');
    const par2 = novo(art, TipoDispositivo.paragrafo.tipo, 'Outro texto.');
    fecha(articulacao);

    const lista = linhas(articulacao).map(l => l.split('|')[0]);
    expect(lista).to.deep.equal(['Artigo', 'Paragrafo', 'Inciso', 'Alinea', 'Pena', 'Paragrafo']);
    expect(par2.rotulo).to.equal('§ 2º');
  });
});
