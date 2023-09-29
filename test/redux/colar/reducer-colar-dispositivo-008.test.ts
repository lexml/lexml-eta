import { TEXTO_008 } from '../../doc/textos-colar/texto_008';
import { buscaDispositivoById, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

let state: State;
// let eventos: StateEvent[];

describe('Testando carregamento da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  it('Deveria possuir articulação com 7 capítulos', () => {
    expect(state.articulacao?.filhos.length).to.equal(7);
    expect(state.articulacao?.filhos.every(f => f.tipo === 'Capitulo')).to.be.true;
  });

  it('Deveria possuir articulação com 53 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(53);
  });

  describe('Testando colagem de parágrafos §§1º e 2º sobre parágrafo único do Art. 3º', () => {
    beforeEach(function () {
      const disp = buscaDispositivoById(state.articulacao!, 'art3_par1u')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = true;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_008,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });
    });

    it('Deveria apresentar Art. 3º com 2 parágrafos', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art3')!;
      expect(d.filhos.length).to.equal(2);
      expect(d.filhos.every(f => f.tipo === 'Paragrafo')).to.be.true;
    });

    it('Deveria apresentar ids art3_par1u e art3_par2 nos parágrafos', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art3')!;
      expect(d.filhos[0].id).to.equal('art3_par1u'); // assume que apenas o texto foi alterado
      expect(d.filhos[1].id).to.equal('art3_par2');
    });
  });
});
