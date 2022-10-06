import { validaOrdemDispositivo } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { criaDispositivo, createArticulacao } from './../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { expect } from '@open-wc/testing';

const articulacao = createArticulacao();
const anterior = criaDispositivo(articulacao, 'artigo');
const atual = criaDispositivo(articulacao, 'artigo');

describe('', () => {
  it('Deveria retornar true na validação da ordem dos números 1-1 e 1-2', () => {
    anterior.numero = '1-1';
    atual.numero = '1-2';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.true;
  });

  it('Deveria retornar false na validação da ordem dos números 1-2 e 1-1', () => {
    anterior.numero = '1-2';
    atual.numero = '1-1';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.false;
  });

  it('Deveria retornar false na validação da ordem dos números 1-1 e 1-3', () => {
    anterior.numero = '1-1';
    atual.numero = '1-3';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.false;
  });

  it('Deveria retornar true na validação da ordem dos números 1-9 e 1-9-1', () => {
    anterior.numero = '1-9';
    atual.numero = '1-9-1';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.true;
  });

  it('Deveria retornar false na validação da ordem dos números 1-9 e 1-9-2', () => {
    anterior.numero = '1-9';
    atual.numero = '1-9-2';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.false;
  });

  it('Deveria retornar true na validação da ordem dos números 1-9-1 e 1-9-2', () => {
    anterior.numero = '1-9-1';
    atual.numero = '1-9-2';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.true;
  });

  it('Deveria retornar false na validação da ordem dos números 1-9-1 e 1-9-3', () => {
    anterior.numero = '1-9-1';
    atual.numero = '1-9-3';
    expect(validaOrdemDispositivo(anterior, atual)).to.be.false;
  });
});
