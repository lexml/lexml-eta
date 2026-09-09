import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { compartilhamAncestralDoTipo, extrairSufixoContextual } from '../../../src/model/remissao/lexmlIdUtil';

// Fase 2 do plano de simplificação: decide, subindo .pai (sem regex sobre id), se uma frase
// contextual ("deste artigo") ainda se sustenta — origem e destino precisam compartilhar o mesmo
// ancestral do tipo indicado. Ao contrário do mecanismo antigo (que só olha o id do DESTINO), esta
// função compara a posição estrutural ATUAL de origem e destino.
describe('compartilhamAncestralDoTipo', () => {
  it('true quando origem e destino estão no mesmo artigo (irmãos dentro do parágrafo)', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    const incOrigem = criaDispositivo(par, 'Inciso');
    const incDestino = criaDispositivo(par, 'Inciso');

    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    par.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(compartilhamAncestralDoTipo(incOrigem, incDestino, 'art')).to.be.true;
  });

  it('false quando origem e destino estão em artigos diferentes', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, 'Artigo');
    const art2 = criaDispositivo(articulacao, 'Artigo');
    const incOrigem = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
    const incDestino = criaDispositivo((art2 as Artigo).caput!, 'Inciso');

    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(compartilhamAncestralDoTipo(incOrigem, incDestino, 'art')).to.be.false;
  });

  it('true quando origem e destino compartilham a mesma seção, mesmo em artigos diferentes', () => {
    const articulacao = createArticulacao();
    const sec = criaDispositivo(articulacao, 'Secao');
    const artOrigem = criaDispositivo(sec, 'Artigo');
    const artDestino = criaDispositivo(sec, 'Artigo');

    articulacao.renumeraFilhos();
    sec.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(compartilhamAncestralDoTipo(artOrigem, artDestino, 'sec')).to.be.true;
    // Mas não compartilham o mesmo artigo — a relação "deste artigo" não se sustentaria.
    expect(compartilhamAncestralDoTipo(artOrigem, artDestino, 'art')).to.be.false;
  });

  it('false quando destino não tem ancestral do tipo pedido', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo'); // sem Seção nenhuma na árvore
    const par = criaDispositivo(art, 'Paragrafo');

    articulacao.renumeraFilhos();
    art.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(compartilhamAncestralDoTipo(par, art, 'sec')).to.be.false;
  });

  it('false quando o prefixo não corresponde a nenhum tipo conhecido', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    updateIdDispositivoAndFilhos(articulacao);

    expect(compartilhamAncestralDoTipo(par, art, 'xyz')).to.be.false;
  });

  // Comprova a capacidade nova (D4): a MESMA função, aplicada a duas árvores estruturalmente
  // equivalentes exceto pela posição da origem, dá resultados diferentes — reflete a relação
  // ATUAL, não um estilo travado desde a criação da remissão.
  it('reflete a posição estrutural atual, não um estilo fixado na criação', () => {
    const montaArvore = (origemNoMesmoArtigo: boolean): { origem: any; destino: any } => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      const destino = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
      const origem = criaDispositivo(((origemNoMesmoArtigo ? art1 : art2) as Artigo).caput!, 'Inciso');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { origem, destino };
    };

    const { origem: origemMesmoArtigo, destino: destino1 } = montaArvore(true);
    expect(compartilhamAncestralDoTipo(origemMesmoArtigo, destino1, 'art')).to.be.true;

    const { origem: origemOutroArtigo, destino: destino2 } = montaArvore(false);
    expect(compartilhamAncestralDoTipo(origemOutroArtigo, destino2, 'art')).to.be.false;
  });

  it('integra com extrairSufixoContextual: tipo extraído do texto localiza o ancestral certo', () => {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo');
    const par = criaDispositivo(art, 'Paragrafo');
    const incOrigem = criaDispositivo(par, 'Inciso');
    const incDestino = criaDispositivo(par, 'Inciso');
    updateIdDispositivoAndFilhos(articulacao);

    const sufixo = extrairSufixoContextual('inciso I deste artigo');
    expect(sufixo).to.not.be.null;
    expect(compartilhamAncestralDoTipo(incOrigem, incDestino, sufixo!.tipo)).to.be.true;
  });
});
