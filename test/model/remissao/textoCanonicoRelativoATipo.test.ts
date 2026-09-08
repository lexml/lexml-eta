import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { textoCanonicoRelativoATipo } from '../../../src/model/remissao/lexmlIdUtil';

// Fase 4 do plano de simplificação: gera o texto canônico de um dispositivo parando (excluindo) o
// ancestral do tipo indicado — usado para reconstruir a parte relativa de uma referência contextual
// (ex.: "inciso II do § 1º" sem "do art. 5º", pra reanexar depois o sufixo "deste artigo" literal).
// Análogo ao antigo extrairParteRelativa (que operava em strings de id), mas caminha a árvore de
// objetos diretamente.
describe('textoCanonicoRelativoATipo', () => {
  it('parágrafo direto do artigo, parando no artigo → só "§ 2º"', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    criaDispositivo(art, 'Paragrafo');
    const par2 = criaDispositivo(art, 'Paragrafo');

    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoRelativoATipo(par2, 'art')).to.equal('§ 2º');
  });

  it('inciso do parágrafo do artigo, parando no artigo → "inciso II do § 1º"', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    criaDispositivo(par, 'Inciso');
    const inc2 = criaDispositivo(par, 'Inciso');

    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    par.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoRelativoATipo(inc2, 'art')).to.equal('inciso II do § 1º');
  });

  it('caput, parando no artigo → literalmente "caput" (sem conector nem número)', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoRelativoATipo(art.caput!, 'art')).to.equal('caput');
  });

  // D4 do plano de simplificação: bug encontrado ao raciocinar sobre um caso levantado pelo usuário
  // (inciso filho DIRETO do caput, sem parágrafo no meio, referenciado com "deste artigo") — sem este
  // fix, a função gerava "inciso I do caput" em vez de simplesmente "inciso I" (caput é transparente
  // para fins de parada: um filho direto do caput já está "no artigo").
  it('inciso filho direto do caput (sem parágrafo no meio), parando no artigo → só "inciso I" (sem "do caput")', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
    const inc1 = criaDispositivo(art.caput!, 'Inciso');
    articulacao.renumeraFilhos();
    art.caput!.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoRelativoATipo(inc1, 'art')).to.equal('inciso I');
  });

  it('artigo dentro de capítulo, parando no título → "art. 5º do Capítulo I" (não inclui o título)', () => {
    const articulacao = createArticulacao();
    const tit = criaDispositivo(articulacao, 'Titulo');
    const cap = criaDispositivo(tit, 'Capitulo');
    for (let i = 0; i < 4; i++) criaDispositivo(cap, 'Artigo');
    const art5 = criaDispositivo(cap, 'Artigo');

    articulacao.renumeraFilhos();
    tit.renumeraFilhos();
    cap.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoRelativoATipo(art5, 'tit')).to.equal('art. 5º do Capítulo I');
  });

  it('quando o tipo pedido não é ancestral de ninguém (raiz alcançada), gera o caminho completo', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    // Pede para parar em 'sec' (Seção), que não existe na árvore — sobe até a raiz.
    expect(textoCanonicoRelativoATipo(par, 'sec')).to.equal('§ 1º do art. 1º');
  });

  it('reflete mudança estrutural imediatamente: inciso renumerado ao inserir um novo antes', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    par.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
    expect(textoCanonicoRelativoATipo(inc1, 'art')).to.equal('inciso I do § 1º');

    criaDispositivo(par, 'Inciso', undefined, 0); // novo inciso antes de inc1
    par.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoRelativoATipo(inc1, 'art')).to.equal('inciso II do § 1º');
  });
});
