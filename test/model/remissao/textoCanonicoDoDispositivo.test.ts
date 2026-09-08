import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { textoCanonicoDoDispositivo } from '../../../src/model/remissao/lexmlIdUtil';

// Fase 1 do plano de simplificação: `textoCanonicoDoDispositivo` recalcula o texto canônico
// direto do grafo de objetos (via buildId, que lê .pai/.numero/.tipo ao vivo), em vez de depender
// de um id "antigo"/"novo" pré-computado passado por evento.
describe('textoCanonicoDoDispositivo — recálculo a partir do objeto', () => {
  it('artigo simples, número < 10 → ordinal', () => {
    const articulacao = createArticulacao();
    for (let i = 0; i < 7; i++) criaDispositivo(articulacao, 'Artigo');
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(articulacao.filhos[6])).to.equal('art. 7º');
  });

  it('artigo simples, número >= 10 → sem ordinal', () => {
    const articulacao = createArticulacao();
    for (let i = 0; i < 25; i++) criaDispositivo(articulacao, 'Artigo');
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(articulacao.filhos[24])).to.equal('art. 25');
  });

  it('cadeia completa: item da alínea do inciso do parágrafo do artigo', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    const inc = criaDispositivo(par, 'Inciso');
    const ali = criaDispositivo(inc, 'Alinea');
    const ite = criaDispositivo(ali, 'Item');

    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    par.renumeraFilhos();
    inc.renumeraFilhos();
    ali.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(ite)).to.equal('item 1 da alínea a) do inciso I do § 1º do art. 1º');
  });

  // buildHierarquia (idUtil.ts) para de subir a árvore ao alcançar um Artigo — por design, o id de um
  // artigo (e de tudo dentro dele) NUNCA inclui agrupadores ancestrais (Capítulo/Seção/Título/...).
  // Faz sentido: no texto legislativo brasileiro, artigos são numerados sequencialmente por todo o
  // documento (Art. 1º, Art. 2º, Art. 3º...), únicos sem precisar de qualificador de agrupador — ao
  // contrário de agrupadores, cuja numeração (Seção I, II...) reinicia a cada capítulo.
  it('artigo dentro de agrupador: id do artigo NÃO inclui o agrupador ancestral', () => {
    const articulacao = createArticulacao();
    const cap = criaDispositivo(articulacao, 'Capitulo');
    criaDispositivo(cap, 'Artigo');
    criaDispositivo(cap, 'Artigo');
    const art3 = criaDispositivo(cap, 'Artigo');

    articulacao.renumeraFilhos();
    cap.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(art3)).to.equal('art. 3º');
  });

  it('agrupador dentro de agrupador: o id do PRÓPRIO agrupador encadeia corretamente (Seção III do Capítulo II do Título I)', () => {
    const articulacao = createArticulacao();
    const tit = criaDispositivo(articulacao, 'Titulo');
    criaDispositivo(tit, 'Capitulo');
    const cap2 = criaDispositivo(tit, 'Capitulo');
    criaDispositivo(cap2, 'Secao');
    criaDispositivo(cap2, 'Secao');
    const sec3 = criaDispositivo(cap2, 'Secao');

    articulacao.renumeraFilhos();
    tit.renumeraFilhos();
    cap2.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(sec3)).to.equal('Seção III do Capítulo II do Título I');
  });

  // buildId(caput) gera um segmento "cpt" sem dígito (ex.: "art1_cpt"), que parseLexmlId descarta
  // silenciosamente (a regex de segmento exige ao menos um dígito) — sem tratamento especial, o
  // texto gerado perderia a palavra "caput" e diria só "art. 1º".
  it('caput: gera "caput do art. Nº", não perde a palavra "caput"', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(art.caput!)).to.equal('caput do art. 1º');
  });

  it('reflete mudança estrutural imediatamente (sem precisar de id antigo/novo pré-computado)', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art1, 'Paragrafo');
    articulacao.renumeraFilhos();
    art1.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
    expect(textoCanonicoDoDispositivo(par)).to.equal('§ 1º do art. 1º');

    // Insere um artigo antes de art1 — art1 vira art2, sem nenhum evento/diff sendo passado.
    criaDispositivo(articulacao, 'Artigo', undefined, 0);
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(textoCanonicoDoDispositivo(par)).to.equal('§ 1º do art. 2º');
  });
});
