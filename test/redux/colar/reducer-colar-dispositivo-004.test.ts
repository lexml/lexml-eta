import { buscaDispositivoById, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { TEXTO_004 } from '../../doc/textos-colar/texto_004';
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

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = false;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_004,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });
    });

    it('Deveria possuir articulacao com 54 artigos', () => {
      expect(state.articulacao?.artigos.length).to.equal(54);
    });

    it('Deveria possuir artigo art1-1 com situação Dispositivo Adicionado', () => {
      expect(state.articulacao?.artigos.filter(a => a.id === 'art1-1').every(a => a.situacao.descricaoSituacao === 'Dispositivo Adicionado')).to.equal(true);
    });

    it('Deveria demais artigos com situação Dispositivo Original', () => {
      expect(state.articulacao?.artigos.filter(a => a.id !== 'art1-1').every(a => a.situacao.descricaoSituacao === 'Dispositivo Original')).to.equal(true);
    });
  });
});
