import { expect } from '@open-wc/testing';
import { atualizarTextoRemissao } from '../../../src/model/remissao/lexmlIdUtil';

describe('atualizarTextoRemissao', () => {
  it('artigo muda: retorna canonical do novo lexmlId', () => {
    expect(atualizarTextoRemissao('art. 6º', 'art6', 'art7')).to.equal('art. 7º');
  });

  it('parágrafo único → ordinal', () => {
    expect(atualizarTextoRemissao('parágrafo único do art. 1º', 'art1_par1u', 'art1_par2')).to.equal('§ 2º do art. 1º');
  });

  it('encadeado: artigo muda', () => {
    expect(atualizarTextoRemissao('inciso II do § 2º do art. 16', 'art16_par2_inc2', 'art17_par2_inc2')).to.equal('inciso II do § 2º do art. 17');
  });

  it('encadeado: parágrafo muda', () => {
    expect(atualizarTextoRemissao('inciso II do § 2º do art. 16', 'art16_par2_inc2', 'art16_par3_inc2')).to.equal('inciso II do § 3º do art. 16');
  });

  it('encadeado: inciso muda', () => {
    expect(atualizarTextoRemissao('inciso II do § 2º do art. 16', 'art16_par2_inc2', 'art16_par2_inc3')).to.equal('inciso III do § 2º do art. 16');
  });

  it('agrupador simples muda', () => {
    expect(atualizarTextoRemissao('Capítulo III', 'cap3', 'cap4')).to.equal('Capítulo IV');
  });

  it('agrupador encadeado muda', () => {
    expect(atualizarTextoRemissao('Seção II do Capítulo I', 'cap1_sec2', 'cap1_sec3')).to.equal('Seção III do Capítulo I');
  });

  it('artigo cruza limiar ordinal (9→10)', () => {
    expect(atualizarTextoRemissao('art. 9º', 'art9', 'art10')).to.equal('art. 10');
  });

  it('sem mudança: retorna textoAtual (early return)', () => {
    expect(atualizarTextoRemissao('art. 7º', 'art7', 'art7')).to.equal('art. 7º');
  });
});
