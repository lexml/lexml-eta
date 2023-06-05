import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;

describe('Testando criação do número a partir do rótulo do dispositivo', () => {
  beforeEach(() => {
    articulacao = createArticulacao();
  });

  it('Artigo com rótulo "Art. 1º-1." deveria ter número 1-1', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, undefined, 0);
    novo.texto = 'Teste.';
    novo.id = 'art1-1';
    novo.rotulo = 'Art. 1º-1.';
    novo.createNumeroFromRotulo(novo.rotulo);
    expect(novo.numero).to.be.equal('1-1');
  });

  it('Inciso com rótulo "I-1 –" deveria ter número 1-1', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.inciso.tipo, undefined, 0);
    novo.texto = 'teste;';
    novo.id = 'art1_par1u_inc1-1';
    novo.rotulo = 'I-1 –';
    novo.createNumeroFromRotulo(novo.rotulo);
    expect(novo.numero).to.be.equal('1-1');
  });

  it('Parágrafo com rótulo "§ 1º-1." deveria ter número 1-1', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.paragrafo.tipo, undefined, 0);
    novo.texto = 'Teste.';
    novo.id = 'art2_par1-1';
    novo.rotulo = '§ 1º-1.';
    novo.createNumeroFromRotulo(novo.rotulo);
    expect(novo.numero).to.be.equal('1-1');
  });

  it('Alínea com rótulo "a-1)" deveria ter número 1-1', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.alinea.tipo, undefined, 0);
    novo.texto = 'teste;';
    novo.id = 'art9_cpt_inc3_ali1-1';
    novo.rotulo = 'a-1)';
    novo.createNumeroFromRotulo(novo.rotulo);
    expect(novo.numero).to.be.equal('1-1');
  });

  it('Item com rótulo "1-1." deveria ter número 1-1', () => {
    const novo = criaDispositivo(articulacao, TipoDispositivo.item.tipo, undefined, 0);
    novo.texto = 'teste;';
    novo.id = 'art9_cpt_inc3_ali1_ite1-1';
    novo.rotulo = '1-1.';
    novo.createNumeroFromRotulo(novo.rotulo);
    expect(novo.numero).to.be.equal('1-1');
  });
});
