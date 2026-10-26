import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';

const penaComTexto = (texto: string): Dispositivo => {
  const articulacao: Articulacao = createArticulacao();
  const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art.caput as any).texto = 'Matar alguém:';
  const par = criaDispositivo(art, TipoDispositivo.paragrafo.tipo);
  (par as any).texto = 'Se o crime é culposo:';
  const pena = criaDispositivo(par, TipoDispositivo.pena.tipo);
  pena.rotulo = 'Pena –';
  (pena as any).texto = texto;
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  updateIdDispositivoAndFilhos(articulacao);
  return pena;
};

const mensagens = (texto: string): string[] => validaDispositivo(penaComTexto(texto)).map(m => m.descricao!);

describe('Pena: validação do texto', () => {
  it('avisa quando o texto está vazio', () => {
    expect(mensagens('')).to.deep.equal(['Não foi informado um texto para a pena.']);
    expect(mensagens('   ')).to.deep.equal(['Não foi informado um texto para a pena.']);
  });

  it('avisa quando o texto começa com maiúscula', () => {
    expect(mensagens('Reclusão, de seis a vinte anos.')).to.deep.equal([
      'Pena deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio.',
    ]);
  });

  it('a verificação da inicial ignora formatação e espaços iniciais', () => {
    expect(mensagens('<b>Reclusão</b>, de um a dois anos.').length).to.equal(1);
    expect(mensagens('  Reclusão, de um a dois anos.').length).to.equal(1);
    expect(mensagens('  <i>reclusão</i>, de um a dois anos.')).to.deep.equal([]);
  });

  it('texto válido não gera nenhuma mensagem, com ou sem pontuação final', () => {
    expect(mensagens('detenção, de um mês a um ano, e multa;')).to.deep.equal([]);
    expect(mensagens('detenção, de um mês a um ano, e multa.')).to.deep.equal([]);
    expect(mensagens('detenção, de um mês a um ano, e multa')).to.deep.equal([]);
  });

  it('não exige letra maiúscula nem aceita a regra de artigo e parágrafo', () => {
    expect(mensagens('multa.').some(m => m.includes('maiúscula'))).to.be.false;
  });
});
