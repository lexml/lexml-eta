import { expect } from '@open-wc/testing';
import { parseLexmlId, diffLexmlId, numeroParaExibicao, lexmlIdParaTextoCanonico, atualizarTextoRemissao, SegmentoLexmlId } from '../../../src/model/remissao/lexmlIdUtil';

describe('lexmlIdUtil', () => {
  describe('parseLexmlId', () => {
    describe('ID simples — dispositivos', () => {
      it('deve parsear artigo simples', () => {
        expect(parseLexmlId('art7')).to.deep.equal([{ tipo: 'art', numero: '7' }]);
      });

      it('deve parsear parágrafo isolado', () => {
        expect(parseLexmlId('par2')).to.deep.equal([{ tipo: 'par', numero: '2' }]);
      });

      it('deve parsear números com múltiplos dígitos', () => {
        expect(parseLexmlId('art100')).to.deep.equal([{ tipo: 'art', numero: '100' }]);
      });
    });

    describe('ID simples — agrupadores', () => {
      it('deve parsear capítulo', () => {
        expect(parseLexmlId('cap3')).to.deep.equal([{ tipo: 'cap', numero: '3' }]);
      });

      it('deve parsear seção', () => {
        expect(parseLexmlId('sec2')).to.deep.equal([{ tipo: 'sec', numero: '2' }]);
      });

      it('deve parsear todos os tipos de agrupador isolado: sub, tit, liv, prt', () => {
        expect(parseLexmlId('sub1')[0].tipo).to.equal('sub');
        expect(parseLexmlId('tit4')[0].tipo).to.equal('tit');
        expect(parseLexmlId('liv1')[0].tipo).to.equal('liv');
        expect(parseLexmlId('prt2')[0].tipo).to.equal('prt');
      });
    });

    describe('IDs compostos — dispositivos', () => {
      it('deve parsear artigo + parágrafo + inciso', () => {
        const result = parseLexmlId('art16_par2_inc2');
        const expected: SegmentoLexmlId[] = [
          { tipo: 'art', numero: '16' },
          { tipo: 'par', numero: '2' },
          { tipo: 'inc', numero: '2' },
        ];
        expect(result).to.deep.equal(expected);
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

      it('deve parsear cinco níveis: art + par + inc + ali + ite', () => {
        const result = parseLexmlId('art1_par1_inc1_ali1_ite5');
        expect(result).to.have.length(5);
        expect(result[4]).to.deep.equal({ tipo: 'ite', numero: '5' });
      });
    });

    describe('IDs compostos — agrupadores', () => {
      it('deve parsear agrupadores: cap + sec', () => {
        expect(parseLexmlId('cap1_sec2')).to.deep.equal([
          { tipo: 'cap', numero: '1' },
          { tipo: 'sec', numero: '2' },
        ]);
      });

      it('deve parsear agrupador com artigo: cap + art', () => {
        expect(parseLexmlId('cap2_art3')).to.deep.equal([
          { tipo: 'cap', numero: '2' },
          { tipo: 'art', numero: '3' },
        ]);
      });

      it('deve parsear cadeia de agrupadores: prt + tit + cap + sec', () => {
        const result = parseLexmlId('prt1_tit2_cap3_sec1');
        expect(result).to.have.length(4);
        expect(result.map(s => s.tipo)).to.deep.equal(['prt', 'tit', 'cap', 'sec']);
      });
    });

    describe('Número único (1u)', () => {
      it('deve parsear parágrafo único (1u)', () => {
        expect(parseLexmlId('art5_par1u')).to.deep.equal([
          { tipo: 'art', numero: '5' },
          { tipo: 'par', numero: '1u' },
        ]);
      });

      it('deve parsear artigo único', () => {
        expect(parseLexmlId('art1u')).to.deep.equal([{ tipo: 'art', numero: '1u' }]);
      });
    });

    describe('Casos-limite', () => {
      it('deve retornar array vazio para string vazia', () => {
        expect(parseLexmlId('')).to.deep.equal([]);
      });

      it('deve descartar segmentos sem número (ex: cpt)', () => {
        const result = parseLexmlId('art3_cpt_inc2');
        expect(result).to.deep.equal([
          { tipo: 'art', numero: '3' },
          { tipo: 'inc', numero: '2' },
        ]);
      });

      it('cpt isolado é descartado', () => {
        expect(parseLexmlId('cpt')).to.deep.equal([]);
      });
    });
  });
  describe('numeroParaExibicao', () => {
    describe('Tipos arábicos (art, par, ite)', () => {
      it('deve retornar número árabe para artigo', () => {
        expect(numeroParaExibicao('art', '7')).to.equal('7');
        expect(numeroParaExibicao('art', '10')).to.equal('10');
      });

      it('deve retornar número árabe para parágrafo', () => {
        expect(numeroParaExibicao('par', '3')).to.equal('3');
        expect(numeroParaExibicao('par', '15')).to.equal('15');
      });

      it('deve retornar número árabe para item', () => {
        expect(numeroParaExibicao('ite', '5')).to.equal('5');
      });
    });

    describe('Tipos romanos (inc, cap, sec, sub, tit, liv, prt)', () => {
      it('deve converter inciso para romano', () => {
        expect(numeroParaExibicao('inc', '1')).to.equal('I');
        expect(numeroParaExibicao('inc', '2')).to.equal('II');
        expect(numeroParaExibicao('inc', '4')).to.equal('IV');
        expect(numeroParaExibicao('inc', '9')).to.equal('IX');
        expect(numeroParaExibicao('inc', '10')).to.equal('X');
      });

      it('deve converter agrupadores para romano', () => {
        expect(numeroParaExibicao('cap', '3')).to.equal('III');
        expect(numeroParaExibicao('sec', '2')).to.equal('II');
        expect(numeroParaExibicao('sub', '1')).to.equal('I');
        expect(numeroParaExibicao('tit', '4')).to.equal('IV');
        expect(numeroParaExibicao('liv', '2')).to.equal('II');
        expect(numeroParaExibicao('prt', '1')).to.equal('I');
      });

      it('deve converter romano para valores maiores (XIX, XX, XL)', () => {
        expect(numeroParaExibicao('inc', '19')).to.equal('XIX');
        expect(numeroParaExibicao('inc', '20')).to.equal('XX');
        expect(numeroParaExibicao('inc', '40')).to.equal('XL');
      });
    });

    describe('Tipo letra (ali)', () => {
      it('deve converter alínea para letra minúscula', () => {
        expect(numeroParaExibicao('ali', '1')).to.equal('a');
        expect(numeroParaExibicao('ali', '2')).to.equal('b');
        expect(numeroParaExibicao('ali', '26')).to.equal('z');
      });

      it('deve converter alínea n>26 corretamente (bug fix)', () => {
        expect(numeroParaExibicao('ali', '27')).to.equal('aa');
      });
    });

    describe('Número único (1u)', () => {
      it('deve retornar "único" para número 1u em qualquer tipo', () => {
        expect(numeroParaExibicao('par', '1u')).to.equal('único');
        expect(numeroParaExibicao('art', '1u')).to.equal('único');
        expect(numeroParaExibicao('inc', '1u')).to.equal('único');
        expect(numeroParaExibicao('cap', '1u')).to.equal('único');
        expect(numeroParaExibicao('ali', '1u')).to.equal('único');
      });
    });
  });
  describe('diffLexmlId', () => {
    describe('Casos sem diff (retorna null)', () => {
      it('deve retornar null para IDs idênticos', () => {
        expect(diffLexmlId('art16_par2_inc2', 'art16_par2_inc2')).to.be.null;
        expect(diffLexmlId('art1', 'art1')).to.be.null;
      });

      it('deve retornar null quando múltiplos segmentos mudam', () => {
        expect(diffLexmlId('art16_par2_inc2', 'art17_par3_inc2')).to.be.null;
        expect(diffLexmlId('art1_par1', 'art2_par2')).to.be.null;
      });

      it('deve retornar null quando estrutura difere (quantidades diferentes de segmentos)', () => {
        expect(diffLexmlId('art5', 'art5_par2')).to.be.null;
        expect(diffLexmlId('art5_par2_inc1', 'art5_par2')).to.be.null;
        expect(diffLexmlId('art1', 'art1_par1')).to.be.null;
      });

      it('deve retornar null quando tipos de segmentos diferem (mudança estrutural)', () => {
        expect(diffLexmlId('art5_par2', 'art5_inc2')).to.be.null;
        expect(diffLexmlId('art1', 'cap1')).to.be.null;
      });
    });

    describe('Artigo renumerado', () => {
      it('deve detectar mudança de artigo simples (art1 → art2)', () => {
        const result = diffLexmlId('art1', 'art2');
        expect(result).to.deep.equal({
          tipo: 'art',
          numeroAntigo: '1',
          numeroNovo: '2',
          exibicaoNova: '2',
        });
      });

      it('deve detectar mudança de artigo em ID composto', () => {
        const result = diffLexmlId('art16_par2_inc2', 'art17_par2_inc2');
        expect(result).to.deep.equal({
          tipo: 'art',
          numeroAntigo: '16',
          numeroNovo: '17',
          exibicaoNova: '17',
        });
      });
    });

    describe('Parágrafo renumerado', () => {
      it('deve detectar mudança de parágrafo', () => {
        const result = diffLexmlId('art16_par2_inc2', 'art16_par3_inc2');
        expect(result).to.deep.equal({
          tipo: 'par',
          numeroAntigo: '2',
          numeroNovo: '3',
          exibicaoNova: '3',
        });
      });

      it('deve detectar mudança de parágrafo em ID de dois níveis', () => {
        const result = diffLexmlId('art1_par1', 'art1_par3');
        expect(result!.tipo).to.equal('par');
        expect(result!.numeroNovo).to.equal('3');
      });
    });

    describe('Inciso renumerado → exibição romana', () => {
      it('deve detectar mudança de inciso (com conversão para romano)', () => {
        const result = diffLexmlId('art3_par2_inc2', 'art3_par2_inc3');
        expect(result).to.deep.equal({
          tipo: 'inc',
          numeroAntigo: '2',
          numeroNovo: '3', //Aqui não converte para romano
          exibicaoNova: 'III',
        });
      });

      it('deve detectar mudança de inciso de IX para X (borda romana)', () => {
        const result = diffLexmlId('art1_cpt_inc9', 'art1_cpt_inc10');
        expect(result).to.deep.equal({
          tipo: 'inc',
          numeroAntigo: '9',
          numeroNovo: '10',
          exibicaoNova: 'X',
        });
      });

      it('inc2 → inc5 exibe "V" em ID composto', () => {
        const result = diffLexmlId('art1_cpt_inc2', 'art1_cpt_inc5');
        expect(result!.exibicaoNova).to.equal('V');
      });
    });

    describe('Alínea e item renumerados', () => {
      it('deve detectar mudança de alínea → exibição letra', () => {
        const result = diffLexmlId('art1_par1_inc1_ali1', 'art1_par1_inc1_ali3');
        expect(result!.tipo).to.equal('ali');
        expect(result!.exibicaoNova).to.equal('c');
      });

      it('deve detectar mudança de item', () => {
        const result = diffLexmlId('art1_par1_inc1_ali1_ite1', 'art1_par1_inc1_ali1_ite5');
        expect(result!.tipo).to.equal('ite');
        expect(result!.exibicaoNova).to.equal('5');
      });
    });

    describe('Agrupadores renumerados', () => {
      it('deve detectar mudança em agrupador simples', () => {
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

      it('cap1_art1 → cap3_art1 exibe "III"', () => {
        const result = diffLexmlId('cap1_art1', 'cap3_art1');
        expect(result!.tipo).to.equal('cap');
        expect(result!.exibicaoNova).to.equal('III');
      });
    });

    describe('Transições com número único', () => {
      it('deve detectar transição parágrafo único → ordinal', () => {
        const result = diffLexmlId('art5_par1u', 'art5_par2');
        expect(result).to.deep.equal({
          tipo: 'par',
          numeroAntigo: '1u',
          numeroNovo: '2',
          exibicaoNova: '2',
        });
      });

      it('art2 → art1u exibe "único"', () => {
        expect(diffLexmlId('art2', 'art1u')!.exibicaoNova).to.equal('único');
      });

      it('par1u → par3 exibe "3"', () => {
        expect(diffLexmlId('par1u', 'par3')!.exibicaoNova).to.equal('3');
      });
    });
  });
  describe('lexmlIdParaTextoCanonico', () => {
    describe('Um nível — dispositivos', () => {
      it('artigo n<10 → ordinal', () => {
        expect(lexmlIdParaTextoCanonico('art7')).to.equal('art. 7º');
        expect(lexmlIdParaTextoCanonico('art9')).to.equal('art. 9º');
      });

      it('artigo n>=10 → sem ordinal', () => {
        expect(lexmlIdParaTextoCanonico('art10')).to.equal('art. 10');
        expect(lexmlIdParaTextoCanonico('art25')).to.equal('art. 25');
      });

      it('§ 1–9 recebem ordinal', () => {
        expect(lexmlIdParaTextoCanonico('par1')).to.equal('§ 1º');
        expect(lexmlIdParaTextoCanonico('par9')).to.equal('§ 9º');
      });

      it('§ 10+ sem ordinal', () => {
        expect(lexmlIdParaTextoCanonico('par10')).to.equal('§ 10');
      });

      it('inciso com algarismo romano', () => {
        expect(lexmlIdParaTextoCanonico('inc3')).to.equal('inciso III');
        expect(lexmlIdParaTextoCanonico('inc14')).to.equal('inciso XIV');
      });

      it('alínea com letra minúscula', () => {
        expect(lexmlIdParaTextoCanonico('ali1')).to.equal('alínea a');
        expect(lexmlIdParaTextoCanonico('ali26')).to.equal('alínea z');
      });

      it('item', () => {
        expect(lexmlIdParaTextoCanonico('ite5')).to.equal('item 5');
      });
    });

    describe('Um nível — agrupadores', () => {
      it('agrupador simples', () => {
        expect(lexmlIdParaTextoCanonico('cap3')).to.equal('Capítulo III');
      });

      it('todos os agrupadores isolados', () => {
        expect(lexmlIdParaTextoCanonico('cap2')).to.equal('Capítulo II');
        expect(lexmlIdParaTextoCanonico('sec3')).to.equal('Seção III');
        expect(lexmlIdParaTextoCanonico('sub1')).to.equal('Subseção I');
        expect(lexmlIdParaTextoCanonico('tit4')).to.equal('Título IV');
        expect(lexmlIdParaTextoCanonico('liv1')).to.equal('Livro I');
        expect(lexmlIdParaTextoCanonico('prt2')).to.equal('Parte II');
      });
    });

    describe('Únicos — dispositivos', () => {
      it('artigo único / parágrafo único / inciso único / alínea única / item único', () => {
        expect(lexmlIdParaTextoCanonico('art1u')).to.equal('artigo único');
        expect(lexmlIdParaTextoCanonico('par1u')).to.equal('parágrafo único');
        expect(lexmlIdParaTextoCanonico('inc1u')).to.equal('inciso único');
        expect(lexmlIdParaTextoCanonico('ali1u')).to.equal('alínea única');
        expect(lexmlIdParaTextoCanonico('ite1u')).to.equal('item único');
      });
    });

    describe('Únicos — agrupadores', () => {
      it('Capítulo único / Seção única / Subseção única / Título único / Livro único / Parte única', () => {
        expect(lexmlIdParaTextoCanonico('cap1u')).to.equal('Capítulo único');
        expect(lexmlIdParaTextoCanonico('sec1u')).to.equal('Seção única');
        expect(lexmlIdParaTextoCanonico('sub1u')).to.equal('Subseção única');
        expect(lexmlIdParaTextoCanonico('tit1u')).to.equal('Título único');
        expect(lexmlIdParaTextoCanonico('liv1u')).to.equal('Livro único');
        expect(lexmlIdParaTextoCanonico('prt1u')).to.equal('Parte única');
      });
    });

    describe('Dois níveis', () => {
      it('art + par', () => {
        expect(lexmlIdParaTextoCanonico('art1_par2')).to.equal('§ 2º do art. 1º');
      });

      it('parágrafo único do art.', () => {
        expect(lexmlIdParaTextoCanonico('art1_par1u')).to.equal('parágrafo único do art. 1º');
        expect(lexmlIdParaTextoCanonico('art2_par1u')).to.equal('parágrafo único do art. 2º');
      });

      it('art + inc (cpt omitido)', () => {
        expect(lexmlIdParaTextoCanonico('art3_inc2')).to.equal('inciso II do art. 3º');
      });

      it('cpt é filtrado — caput omitido do canônico', () => {
        expect(lexmlIdParaTextoCanonico('art3_cpt_inc4')).to.equal('inciso IV do art. 3º');
      });

      it('cap + art', () => {
        expect(lexmlIdParaTextoCanonico('cap2_art3')).to.equal('art. 3º do Capítulo II');
      });

      it('agrupador encadeado: cap + sec', () => {
        expect(lexmlIdParaTextoCanonico('cap1_sec2')).to.equal('Seção II do Capítulo I');
      });

      it('tit + cap', () => {
        expect(lexmlIdParaTextoCanonico('tit2_cap1')).to.equal('Capítulo I do Título II');
      });
    });

    describe('Três níveis', () => {
      it('art + par + inc encadeados', () => {
        expect(lexmlIdParaTextoCanonico('art16_par2_inc2')).to.equal('inciso II do § 2º do art. 16');
        expect(lexmlIdParaTextoCanonico('art1_par2_inc3')).to.equal('inciso III do § 2º do art. 1º');
      });

      it('sec + art + par', () => {
        expect(lexmlIdParaTextoCanonico('sec2_art5_par1')).to.equal('§ 1º do art. 5º da Seção II');
      });

      it('cap + sec + art', () => {
        expect(lexmlIdParaTextoCanonico('cap1_sec2_art3')).to.equal('art. 3º da Seção II do Capítulo I');
      });
    });

    describe('Quatro e cinco níveis', () => {
      it('cadeia completa: art + par + inc + ali', () => {
        expect(lexmlIdParaTextoCanonico('art1_par2_inc1_ali1')).to.equal('alínea a do inciso I do § 2º do art. 1º');
        expect(lexmlIdParaTextoCanonico('art5_par2_inc3_ali1')).to.equal('alínea a do inciso III do § 2º do art. 5º');
      });

      it('tit + cap + sec + art', () => {
        expect(lexmlIdParaTextoCanonico('tit1_cap2_sec3_art4')).to.equal('art. 4º da Seção III do Capítulo II do Título I');
      });

      it('art + par + inc + ali + ite (cinco níveis)', () => {
        expect(lexmlIdParaTextoCanonico('art1_par1_inc2_ali3_ite5')).to.equal('item 5 da alínea c do inciso II do § 1º do art. 1º');
      });
    });

    describe('Conectores femininos (da)', () => {
      it('conector "da" antes de alínea: item dentro de alínea', () => {
        expect(lexmlIdParaTextoCanonico('art1_par1_inc1_ali1_ite2')).to.include(' da alínea');
      });

      it('conector "da" antes de seção: artigo dentro de seção', () => {
        expect(lexmlIdParaTextoCanonico('cap1_sec2_art3')).to.include('da Seção');
      });

      it('conector "da" antes de parte: livro dentro de parte', () => {
        expect(lexmlIdParaTextoCanonico('prt2_liv1')).to.include('da Parte');
      });

      it('conector "da" antes de subseção: artigo dentro de subseção', () => {
        expect(lexmlIdParaTextoCanonico('sub2_art1')).to.include('da Subseção');
      });
    });

    describe('Limiar ordinal (9 ↔ 10)', () => {
      it('art10 com par10 — sem ordinal em nenhum', () => {
        expect(lexmlIdParaTextoCanonico('art10_par10')).to.equal('§ 10 do art. 10');
      });
    });

    describe('Casos-limite', () => {
      it('ID vazio retorna string vazia', () => {
        expect(lexmlIdParaTextoCanonico('')).to.equal('');
      });

      it('ID sem segmentos reconhecíveis retorna o próprio ID', () => {
        expect(lexmlIdParaTextoCanonico('xyz')).to.equal('xyz');
      });

      it('cadeia máxima: prt + tit + cap + sec + sub + art + par + inc + ali + ite', () => {
        const texto = lexmlIdParaTextoCanonico('prt1_tit2_cap3_sec1_sub2_art5_par1_inc2_ali3_ite4');
        expect(texto).to.include('item 4');
        expect(texto).to.include('art. 5º');
        expect(texto).to.include('Capítulo III');
        expect(texto).to.include('Título II');
        expect(texto).to.include('Parte I');
      });
    });
  });
  describe('atualizarTextoRemissao', () => {
    describe('Grupo A — Artigo renumerado', () => {
      it('IDs idênticos: retorna textoAtual sem modificação', () => {
        expect(atualizarTextoRemissao('art. 2º', 'art2', 'art2')).to.equal('art. 2º');
      });

      it('art1 → art2', () => {
        expect(atualizarTextoRemissao('art. 1º', 'art1', 'art2')).to.equal('art. 2º');
      });

      it('art9 → art10: ordinal desaparece', () => {
        expect(atualizarTextoRemissao('art. 9º', 'art9', 'art10')).to.equal('art. 10');
      });

      it('art10 → art9: ordinal reaparece', () => {
        expect(atualizarTextoRemissao('art. 10', 'art10', 'art9')).to.equal('art. 9º');
      });

      it('art2 → artigo único', () => {
        expect(atualizarTextoRemissao('art. 2º', 'art2', 'art1u')).to.equal('artigo único');
      });

      it('artigo único → art1', () => {
        expect(atualizarTextoRemissao('artigo único', 'art1u', 'art1')).to.equal('art. 1º');
      });

      it('art25 → art26 (número alto)', () => {
        expect(atualizarTextoRemissao('art. 25', 'art25', 'art26')).to.equal('art. 26');
      });

      it('textoAtual com variante tipográfica: gera canônico do novo ID', () => {
        expect(atualizarTextoRemissao('artigo 5º', 'art5', 'art6')).to.equal('art. 6º');
      });

      it('textoAtual abreviado diferente: sobreposto pelo canônico', () => {
        expect(atualizarTextoRemissao('Art. 3', 'art3', 'art4')).to.equal('art. 4º');
      });

      it('IDs iguais com texto diferente: retorna textoAtual inalterado', () => {
        expect(atualizarTextoRemissao('artigo primeiro', 'art1', 'art1')).to.equal('artigo primeiro');
      });
    });

    describe('Grupo B — Parágrafo renumerado', () => {
      it('par1 → par2 dentro do mesmo artigo', () => {
        expect(atualizarTextoRemissao('§ 1º', 'art1_par1', 'art1_par2')).to.equal('§ 2º do art. 1º');
      });

      it('parágrafo único → § 1', () => {
        expect(atualizarTextoRemissao('parágrafo único', 'art3_par1u', 'art3_par1')).to.equal('§ 1º do art. 3º');
      });

      it('§ 1 → parágrafo único', () => {
        expect(atualizarTextoRemissao('§ 1º', 'art2_par1', 'art2_par1u')).to.equal('parágrafo único do art. 2º');
      });

      it('CT-E-03: parágrafo mantém número, artigo-pai renumerou (art2 → art3)', () => {
        expect(atualizarTextoRemissao('§ 2º do art. 2º', 'art2_par2', 'art3_par2')).to.equal('§ 2º do art. 3º');
      });

      it('§ 9 → § 10: ordinal desaparece', () => {
        expect(atualizarTextoRemissao('§ 9º', 'art1_par9', 'art1_par10')).to.equal('§ 10 do art. 1º');
      });

      it('ID sem artigo-pai: par1 → par2', () => {
        expect(atualizarTextoRemissao('§ 1º', 'par1', 'par2')).to.equal('§ 2º');
      });
    });

    describe('Grupo C — Inciso, Alínea e Item renumerados', () => {
      it('inciso II → III', () => {
        expect(atualizarTextoRemissao('inciso II', 'art1_cpt_inc2', 'art1_cpt_inc3')).to.equal('inciso III do art. 1º');
      });

      it('inciso único → inciso I', () => {
        expect(atualizarTextoRemissao('inciso único', 'art5_cpt_inc1u', 'art5_cpt_inc1')).to.equal('inciso I do art. 5º');
      });

      it('alínea a → b', () => {
        expect(atualizarTextoRemissao('alínea a', 'art1_cpt_inc1_ali1', 'art1_cpt_inc1_ali2')).to.equal('alínea b do inciso I do art. 1º');
      });

      it('item 3 → 5 (resultado contém novo item e artigo correto)', () => {
        const resultado = atualizarTextoRemissao('item 3', 'art2_par1_inc1_ali1_ite3', 'art2_par1_inc1_ali1_ite5');
        expect(resultado).to.include('item 5');
        expect(resultado).to.include('art. 2º');
      });

      it('inciso quando artigo-pai renumera (art3 → art4)', () => {
        const resultado = atualizarTextoRemissao('inciso II do art. 3º', 'art3_par1_inc2', 'art4_par1_inc2');
        expect(resultado).to.include('inciso II');
        expect(resultado).to.include('art. 4º');
      });

      it('item quando artigo-pai renumera (art3 → art4)', () => {
        const resultado = atualizarTextoRemissao('item 1', 'art3_par1_inc1_ali1_ite1', 'art4_par1_inc1_ali1_ite1');
        expect(resultado).to.include('art. 4º');
      });
    });

    describe('Grupo D — Agrupadores renumerados', () => {
      it('Capítulo I → II', () => {
        expect(atualizarTextoRemissao('Capítulo I', 'cap1', 'cap2')).to.equal('Capítulo II');
      });

      it('Seção II → III dentro do mesmo capítulo', () => {
        expect(atualizarTextoRemissao('Seção II', 'cap1_sec2', 'cap1_sec3')).to.equal('Seção III do Capítulo I');
      });

      it('Seção quando capítulo-pai renumerou (cap2 → cap3)', () => {
        expect(atualizarTextoRemissao('Seção I do Capítulo II', 'cap2_sec1', 'cap3_sec1')).to.equal('Seção I do Capítulo III');
      });

      it('cadeia tit + cap + sec: apenas seção renumera', () => {
        expect(atualizarTextoRemissao('Seção II', 'tit1_cap2_sec2', 'tit1_cap2_sec3')).to.equal('Seção III do Capítulo II do Título I');
      });

      it('Capítulo único → Capítulo I', () => {
        expect(atualizarTextoRemissao('Capítulo único', 'cap1u', 'cap1')).to.equal('Capítulo I');
      });

      it('Seção única quando capítulo-pai renumera', () => {
        expect(atualizarTextoRemissao('Seção única do Capítulo I', 'cap1_sec1u', 'cap2_sec1u')).to.equal('Seção única do Capítulo II');
      });
    });

    describe('Grupo E — Casos-limite e robustez', () => {
      it('lexmlIdAntigo === lexmlIdNovo: retorna textoAtual intacto', () => {
        const textoAtual = 'qualquer texto que o usuário digitou';
        expect(atualizarTextoRemissao(textoAtual, 'art1', 'art1')).to.equal(textoAtual);
      });

      it('lexmlIdNovo vazio: retorna string vazia sem lançar exceção', () => {
        expect(() => atualizarTextoRemissao('art. 1º', 'art1', '')).to.not.throw();
        expect(atualizarTextoRemissao('art. 1º', 'art1', '')).to.equal('');
      });

      it('textoAtual vazio: retorna o canônico do novo ID', () => {
        expect(atualizarTextoRemissao('', 'art1', 'art2')).to.equal('art. 2º');
      });

      it('textoAtual com espaço em branco: retorna canônico normalizado', () => {
        expect(atualizarTextoRemissao('  art. 1º  ', 'art1', 'art2')).to.equal('art. 2º');
      });
    });
  });
  describe('parseLexmlId: suporte a números compostos (ex: art1-a)', () => {
    it('parseia segmento simples sem composição (comportamento existente)', () => {
      const segs = parseLexmlId('art1_par2');
      expect(segs).to.have.length(2);
      expect(segs[0]).to.deep.equal({ tipo: 'art', numero: '1' });
      expect(segs[1]).to.deep.equal({ tipo: 'par', numero: '2' });
    });

    it('parseia segmento com número único (comportamento existente)', () => {
      const segs = parseLexmlId('art1u');
      expect(segs).to.have.length(1);
      expect(segs[0]).to.deep.equal({ tipo: 'art', numero: '1u' });
    });

    it('parseia art1-a (artigo 1-A) — BUG: retorna array vazio com regex atual', () => {
      const segs = parseLexmlId('art1-a');
      expect(segs).to.have.length(1);
      expect(segs[0].tipo).to.equal('art');
      expect(segs[0].numero).to.equal('1-a');
    });

    it('parseia par2-b dentro de id composto (ex: art1_par2-b)', () => {
      const segs = parseLexmlId('art1_par2-b');
      expect(segs).to.have.length(2);
      expect(segs[1].numero).to.equal('2-b');
    });

    it('parseia id com múltiplos segmentos compostos', () => {
      const segs = parseLexmlId('art1-a_par1');
      expect(segs).to.have.length(2);
      expect(segs[0].numero).to.equal('1-a');
      expect(segs[1].numero).to.equal('1');
    });
  });
});
