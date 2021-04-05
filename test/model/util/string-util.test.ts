import { expect } from '@open-wc/testing';
import {
  containsTags,
  endsWithPunctuation,
  isValidHTML,
  isValidHtmlParagraph,
} from '../../../src/util/string-util';

describe('StringUtil', () => {
  describe('containsTags => testes de reconhecimento de tags no texto', () => {
    it('Retorna false quando é informada uma string vazia', () => {
      expect(containsTags('')).to.false;
      expect(containsTags(' ')).to.false;
    });
    it('Retorna false quando é informada uma string com texto sem tags mas com caracteres especiais', () => {
      expect(containsTags('3º $ @ # "texto com aspas" § ')).to.false;
    });
    it('Retorna true quando é informada uma string com tags simples', () => {
      expect(containsTags('<b>texto</b>')).to.true;
    });
    it('Retorna true quando é informada uma string com tags incompletas', () => {
      expect(containsTags('<b>texto')).to.true;
    });
    it('Retorna true quando é informada uma string com tags mais complexas', () => {
      expect(containsTags('<img src=bogus onerror=alert(1337) />')).to.true;
    });
  });
  describe('checkHTML => testes de reconhecimento de html válido no texto', () => {
    it('Retorna true quando é informada uma string vazia', () => {
      expect(isValidHTML('')).to.true;
    });
    it('Retorna true quando é informada uma tag simples', () => {
      expect(isValidHTML('<b>teste</b>')).to.true;
    });
    it('Retorna true quando é informada uma tag qualquer', () => {
      expect(isValidHTML('<bas>teste</bas>')).to.true;
    });
    it('Retorna true quando é informada uma tag válida mas em formato diferente', () => {
      expect(
        isValidHTML(
          '<img src="https://developer.mozilla.org/static/img/favicon144.png" alt="MDN logo">'
        )
      ).to.true;
    });
    it('Retorna true quando é informada um link', () => {
      expect(isValidHTML('<a href="link">text</a>')).to.true;
    });
    it('Retorna false quando é informada uma tag inválida', () => {
      expect(isValidHTML('<b>teste')).to.false;
    });
  });
  describe('isValidHtmlParagraph => testes de reconhecimento de html válido no texto', () => {
    it('Retorna false quando é informada uma string vazia', () => {
      expect(isValidHtmlParagraph('')).to.false;
    });
    it('Retorna false quando é informada uma tag mal formada', () => {
      expect(isValidHtmlParagraph('<p>teste</P>')).to.false;
    });
    it('Retorna true quando é informada uma tag válida', () => {
      expect(isValidHtmlParagraph('<p>teste</p>')).to.true;
    });
  });
  describe('endsWithPunctuation => testes de reconhecimento de pontuação ao final do texto', () => {
    it('Retorna false quando é informada uma string vazia', () => {
      expect(endsWithPunctuation('')).to.false;
    });
    it('Retorna false quando é informado um texto terminado sem pontuação', () => {
      expect(endsWithPunctuation('teste')).to.false;
    });
    it('Retorna true quando é informado um texto terminado com pontuação', () => {
      expect(endsWithPunctuation('teste.')).to.true;
    });
  });
});
