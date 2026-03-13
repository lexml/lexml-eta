import { expect } from '@open-wc/testing';
import { parseLexmlId, diffLexmlId, numeroParaExibicao, SegmentoLexmlId } from '../../../src/model/remissao/lexmlIdUtil';

describe('lexmlIdUtil', () => {
  // ─── parseLexmlId ───────────────────────────────────────────────────────────

  describe('parseLexmlId', () => {
    it('deve parsear artigo simples', () => {
      expect(parseLexmlId('art7')).to.deep.equal([{ tipo: 'art', numero: '7' }]);
    });

    it('deve parsear artigo + parágrafo + inciso', () => {
      const result = parseLexmlId('art16_par2_inc2');
      const expected: SegmentoLexmlId[] = [
        { tipo: 'art', numero: '16' },
        { tipo: 'par', numero: '2' },
        { tipo: 'inc', numero: '2' },
      ];
      expect(result).to.deep.equal(expected);
    });

    it('deve parsear parágrafo único (1u)', () => {
      expect(parseLexmlId('art5_par1u')).to.deep.equal([
        { tipo: 'art', numero: '5' },
        { tipo: 'par', numero: '1u' },
      ]);
    });

    it('deve parsear cadeia completa: art + par + inc + ali', () => {
      const result = parseLexmlId('art5_par2_inc1_ali1');
      expect(result).to.deep.equal([
        { tipo: 'art', numero: '5' },
        { tipo: 'par', numero: '2' },
        { tipo: 'inc', numero: '1' },
        { tipo: 'ali', numero: '1' },
      ]);
    });

    it('deve parsear agrupadores', () => {
      expect(parseLexmlId('cap1_sec2')).to.deep.equal([
        { tipo: 'cap', numero: '1' },
        { tipo: 'sec', numero: '2' },
      ]);
    });

    it('deve parsear números com múltiplos dígitos', () => {
      expect(parseLexmlId('art100')).to.deep.equal([{ tipo: 'art', numero: '100' }]);
    });

    it('deve retornar array vazio para string vazia', () => {
      expect(parseLexmlId('')).to.deep.equal([]);
    });

    // Nota: segmentos sem número (ex: 'cpt' em 'art3_cpt_inc2') são descartados
    // silenciosamente. Isso é aceitável para Feature 2 porque caput não é
    // renumerado — portanto nunca é o segmento alterado num diff.
    it('deve descartar segmentos sem número (ex: cpt)', () => {
      const result = parseLexmlId('art3_cpt_inc2');
      expect(result).to.deep.equal([
        { tipo: 'art', numero: '3' },
        { tipo: 'inc', numero: '2' },
      ]);
    });
  });

  // ─── numeroParaExibicao ──────────────────────────────────────────────────────

  describe('numeroParaExibicao', () => {
    it('deve retornar "único" para número 1u (qualquer tipo)', () => {
      expect(numeroParaExibicao('par', '1u')).to.equal('único');
      expect(numeroParaExibicao('art', '1u')).to.equal('único');
      expect(numeroParaExibicao('inc', '1u')).to.equal('único');
    });

    it('deve converter inciso para romano', () => {
      expect(numeroParaExibicao('inc', '1')).to.equal('I');
      expect(numeroParaExibicao('inc', '2')).to.equal('II');
      expect(numeroParaExibicao('inc', '4')).to.equal('IV');
      expect(numeroParaExibicao('inc', '9')).to.equal('IX');
      expect(numeroParaExibicao('inc', '10')).to.equal('X');
    });

    it('deve converter alínea para letra minúscula', () => {
      expect(numeroParaExibicao('ali', '1')).to.equal('a');
      expect(numeroParaExibicao('ali', '2')).to.equal('b');
      expect(numeroParaExibicao('ali', '26')).to.equal('z');
    });

    it('deve retornar número árabe para artigo', () => {
      expect(numeroParaExibicao('art', '7')).to.equal('7');
      expect(numeroParaExibicao('art', '10')).to.equal('10');
    });

    it('deve retornar número árabe para parágrafo', () => {
      expect(numeroParaExibicao('par', '3')).to.equal('3');
    });

    it('deve retornar número árabe para item', () => {
      expect(numeroParaExibicao('ite', '5')).to.equal('5');
    });

    it('deve converter agrupadores para romano', () => {
      expect(numeroParaExibicao('cap', '3')).to.equal('III');
      expect(numeroParaExibicao('sec', '2')).to.equal('II');
      expect(numeroParaExibicao('sub', '1')).to.equal('I');
      expect(numeroParaExibicao('tit', '4')).to.equal('IV');
      expect(numeroParaExibicao('liv', '2')).to.equal('II');
      expect(numeroParaExibicao('prt', '1')).to.equal('I');
    });

    it('deve converter romano para valores maiores (XIX, XX)', () => {
      expect(numeroParaExibicao('inc', '19')).to.equal('XIX');
      expect(numeroParaExibicao('inc', '20')).to.equal('XX');
      expect(numeroParaExibicao('inc', '40')).to.equal('XL');
    });
  });

  // ─── diffLexmlId ────────────────────────────────────────────────────────────

  describe('diffLexmlId', () => {
    it('deve retornar null para IDs idênticos', () => {
      expect(diffLexmlId('art16_par2_inc2', 'art16_par2_inc2')).to.be.null;
    });

    it('deve detectar mudança de artigo', () => {
      const result = diffLexmlId('art16_par2_inc2', 'art17_par2_inc2');
      expect(result).to.deep.equal({
        tipo: 'art',
        numeroAntigo: '16',
        numeroNovo: '17',
        exibicaoNova: '17',
      });
    });

    it('deve detectar mudança de parágrafo', () => {
      const result = diffLexmlId('art16_par2_inc2', 'art16_par3_inc2');
      expect(result).to.deep.equal({
        tipo: 'par',
        numeroAntigo: '2',
        numeroNovo: '3',
        exibicaoNova: '3',
      });
    });

    it('deve detectar mudança de inciso (com conversão para romano)', () => {
      const result = diffLexmlId('art3_par2_inc2', 'art3_par2_inc3');
      expect(result).to.deep.equal({
        tipo: 'inc',
        numeroAntigo: '2',
        numeroNovo: '3',
        exibicaoNova: 'III',
      });
    });

    it('deve detectar transição parágrafo único → ordinal', () => {
      const result = diffLexmlId('art5_par1u', 'art5_par2');
      expect(result).to.deep.equal({
        tipo: 'par',
        numeroAntigo: '1u',
        numeroNovo: '2',
        exibicaoNova: '2',
      });
    });

    it('deve detectar mudança em agrupador', () => {
      const result = diffLexmlId('cap3', 'cap4');
      expect(result).to.deep.equal({
        tipo: 'cap',
        numeroAntigo: '3',
        numeroNovo: '4',
        exibicaoNova: 'IV',
      });
    });

    it('deve detectar mudança em agrupador encadeado', () => {
      const result = diffLexmlId('cap1_sec2', 'cap1_sec3');
      expect(result).to.deep.equal({
        tipo: 'sec',
        numeroAntigo: '2',
        numeroNovo: '3',
        exibicaoNova: 'III',
      });
    });

    it('deve retornar null quando múltiplos segmentos mudam', () => {
      expect(diffLexmlId('art16_par2_inc2', 'art17_par3_inc2')).to.be.null;
    });

    it('deve retornar null quando estrutura difere (quantidades diferentes de segmentos)', () => {
      expect(diffLexmlId('art5', 'art5_par2')).to.be.null;
      expect(diffLexmlId('art5_par2_inc1', 'art5_par2')).to.be.null;
    });

    it('deve retornar null quando tipos de segmentos diferem (mudança estrutural)', () => {
      // Caso improvável, mas deve ser tratado de forma segura
      expect(diffLexmlId('art5_par2', 'art5_inc2')).to.be.null;
    });

    it('deve detectar mudança de inciso de IX para X (conversão romana de borda)', () => {
      const result = diffLexmlId('art1_cpt_inc9', 'art1_cpt_inc10');
      // cpt é descartado pelo parseLexmlId, restando [art, inc]
      expect(result).to.deep.equal({
        tipo: 'inc',
        numeroAntigo: '9',
        numeroNovo: '10',
        exibicaoNova: 'X',
      });
    });

    it('deve detectar transição artigo único → ordinal', () => {
      const result = diffLexmlId('art1', 'art2');
      expect(result).to.deep.equal({
        tipo: 'art',
        numeroAntigo: '1',
        numeroNovo: '2',
        exibicaoNova: '2',
      });
    });
  });
});
