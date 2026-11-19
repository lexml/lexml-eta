import { expect } from '@open-wc/testing';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';

let state: any;

const rotulos = (dispositivos: any[]): string[] => dispositivos.map((d: any) => d.rotulo);
const adicionarAgrupador = (atual: any, tipo: string, posicao: string): void => {
  state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: createElemento(atual), novo: { tipo, posicao } });
};

// #1076: um agrupador sem artigos interrompia a busca do artigo anterior, e a numeração recomeçava em "Art. 1º".
describe('Numeração de artigo depois de agrupador vazio', () => {
  beforeEach(() => {
    const articulacao = ArticulacaoParser.load(EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES);
    articulacao.renumeraArtigos();
    state = { articulacao };
    adicionarAgrupador(state.articulacao.artigos[1], TipoDispositivo.capitulo.tipo, 'antes');
  });

  for (const posicao of ['antes', 'depois']) {
    it(`capítulo adicionado ${posicao} de outro capítulo mantém a numeração seguida dos artigos`, () => {
      adicionarAgrupador(state.articulacao.filhos[1], TipoDispositivo.capitulo.tipo, posicao);

      const [, capituloVazio, capituloComArtigos] = state.articulacao.filhos;
      expect(rotulos([capituloVazio, capituloComArtigos])).to.deep.equal(['CAPÍTULO I', 'CAPÍTULO II']);
      expect(capituloVazio.filhos.length).to.equal(0);
      expect(rotulos(capituloComArtigos.filhos)).to.deep.equal(['Art. 2º', 'Art. 3º', 'Art. 4º', 'Art. 5º']);
      expect(rotulos(state.articulacao.artigos)).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º', 'Art. 4º', 'Art. 5º']);
    });
  }

  it('artigo novo depois de capítulo que termina em seção vazia continua a numeração', () => {
    adicionarAgrupador(state.articulacao.artigos[1], TipoDispositivo.secao.tipo, 'antes');
    const capitulo = state.articulacao.filhos[1];
    criaDispositivo(capitulo, TipoDispositivo.secao.tipo, undefined, 1);
    const capituloFinal = criaDispositivo(state.articulacao, TipoDispositivo.capitulo.tipo, undefined, 2);

    const artigoNovo = criaDispositivo(capituloFinal, TipoDispositivo.artigo.tipo, undefined, 0);
    state.articulacao.renumeraArtigos();

    expect(state.articulacao.artigos.indexOf(artigoNovo)).to.equal(5);
    expect(artigoNovo.rotulo).to.equal('Art. 6º');
  });
});
