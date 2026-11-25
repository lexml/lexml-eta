import { expect } from '@open-wc/testing';
import {
  getValidacaoNumeracao,
  isValidacaoNumeracaoFlexivel,
  normalizaValidacaoNumeracao,
  registraValidacaoNumeracao,
} from '../../../src/model/lexml/numeracao/validacaoNumeracao';

describe('Modo de validação de numeração', () => {
  afterEach(() => registraValidacaoNumeracao(undefined));

  it('só "flexivel" ativa o modo flexível; ausente ou desconhecido vale rígido', () => {
    expect(normalizaValidacaoNumeracao('flexivel')).to.equal('flexivel');
    expect(normalizaValidacaoNumeracao('rigida')).to.equal('rigida');
    expect(normalizaValidacaoNumeracao(undefined)).to.equal('rigida');
    expect(normalizaValidacaoNumeracao('Flexivel')).to.equal('rigida');
    expect(normalizaValidacaoNumeracao(true)).to.equal('rigida');
  });

  it('registra o modo do documento e volta ao rígido ao registrar valor ausente', () => {
    expect(getValidacaoNumeracao()).to.equal('rigida');
    registraValidacaoNumeracao('flexivel');
    expect(isValidacaoNumeracaoFlexivel()).to.equal(true);
    registraValidacaoNumeracao(undefined);
    expect(isValidacaoNumeracaoFlexivel()).to.equal(false);
  });
});
