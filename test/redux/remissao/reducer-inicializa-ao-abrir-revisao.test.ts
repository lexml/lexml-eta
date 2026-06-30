import { expect } from '@open-wc/testing';
import { inicializaRemissoesAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { Articulacao, Artigo } from '../../../src/model/dispositivo/dispositivo';
import { SUFIXO_REVISAO } from '../../../src/model/remissao/remissao';

function criarArticulacaoComLinkRevisao(): { articulacao: Articulacao; art1: Artigo; art2: Artigo } {
  const articulacao = createArticulacao();

  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.id = 'art1';
  art1.caput!.id = 'art1_cpt';
  art1.texto = 'Dispositivo de destino.';

  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art2.id = 'art2';
  art2.caput!.id = 'art2_cpt';
  // Link com sufixo @revisar — formato salvo quando texto não foi reconhecido
  art2.texto = `Conforme o <a href="art1_cpt${SUFIXO_REVISAO}" data-lexml-ref="art1_cpt${SUFIXO_REVISAO}" class="lexml-remissao-interna" target="_self">o artigo primeiro</a> desta lei.`;

  return { articulacao, art1, art2 };
}

describe('inicializaRemissoesAoAbrir — @revisar', () => {
  it('link com @revisar → entry com revisao:true e targetLexmlId sem sufixo', () => {
    const { articulacao, art2 } = criarArticulacaoComLinkRevisao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);
    const entry = remissoes[art2.uuid!]?.[0];

    expect(entry).to.exist;
    expect(entry.revisao).to.equal(true);
    expect(entry.targetLexmlId).to.equal('art1_cpt');
  });

  it('link sem @revisar → entry SEM revisao', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.id = 'art1';
    art1.caput!.id = 'art1_cpt';
    art1.texto = 'Destino.';
    const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art2.id = 'art2';
    art2.caput!.id = 'art2_cpt';
    art2.texto = `Ver <a href="art1_cpt" data-lexml-ref="art1_cpt" class="lexml-remissao-interna">art. 1º</a>.`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);
    const entry = remissoes[art2.uuid!]?.[0];

    expect(entry).to.exist;
    expect(entry.revisao).to.be.undefined;
  });

  it('texto do dispositivo não deve conter @revisar após inicializar', () => {
    const { articulacao, art2 } = criarArticulacaoComLinkRevisao();
    inicializaRemissoesAoAbrir(articulacao);

    expect(art2.texto).to.not.include(SUFIXO_REVISAO);
  });

  it('href do link no texto deve ser "#lxEtaId{uuid}" após inicializar', () => {
    const { articulacao, art2 } = criarArticulacaoComLinkRevisao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);
    const entry = remissoes[art2.uuid!]?.[0];

    expect(art2.texto).to.include(`href="#lxEtaId${entry.targetUuid}"`);
  });

  it('data-lexml-ref no texto deve ser "art1_cpt" (sem @revisar) após inicializar', () => {
    const { articulacao, art2 } = criarArticulacaoComLinkRevisao();
    inicializaRemissoesAoAbrir(articulacao);

    expect(art2.texto).to.include('data-lexml-ref="art1_cpt"');
    expect(art2.texto).to.not.include(`data-lexml-ref="art1_cpt${SUFIXO_REVISAO}"`);
  });

  it('data-ref-id é atribuído ao link no texto após inicializar', () => {
    const { articulacao, art2 } = criarArticulacaoComLinkRevisao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);
    const entry = remissoes[art2.uuid!]?.[0];

    expect(art2.texto).to.include(`data-ref-id="${entry.refId}"`);
  });

  it('dispositivo destino é encontrado corretamente mesmo com @revisar no rawLexmlId', () => {
    const { articulacao, art2 } = criarArticulacaoComLinkRevisao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);
    const entry = remissoes[art2.uuid!]?.[0];

    expect(entry).to.exist;
    expect(entry.targetUuid).to.not.be.undefined;
    expect(entry.targetLexmlId).to.equal('art1_cpt');
  });

  it('targetLexmlId não encontrado → entry não é criado (dispositivo excluído)', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.id = 'art1';
    art1.caput!.id = 'art1_cpt';
    // Aponta para ID que não existe na articulação
    art1.texto = `Ver <a href="art99_cpt${SUFIXO_REVISAO}" data-lexml-ref="art99_cpt${SUFIXO_REVISAO}" class="lexml-remissao-interna">o artigo que sumiu</a>.`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    expect(Object.keys(remissoes)).to.have.length(0);
  });
});
