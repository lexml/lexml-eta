import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { State, StateEvent, StateType } from '../../../src/redux/state';
import { MPV_1160_2023 } from '../../doc/mpv_1160_2023';
import { TEXTO_002 } from '../../doc/textos-colar/texto_002';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';

let state: State;
let eventos: StateEvent[];

describe('Testando carregamento da MPV 885/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1160_2023, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  it('Deveria possuir articulação com 6 artigos', () => {
    expect(state.articulacao?.filhos.length).to.equal(6);
    expect(state.articulacao?.filhos.every(f => f.tipo === 'Artigo')).to.be.true;
    expect(state.articulacao?.artigos.length).to.equal(6);
  });

  it('Deveria possuir alterações do artigo 4º com 1 artigo', () => {
    expect(state.articulacao?.filhos[3].alteracoes?.filhos.length).to.equal(1);
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      const disp = buscaDispositivoById(state.articulacao!, 'art4_cpt_alt1_art27-2')!;
      const atual = createElemento(disp);
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        isColarSubstituindo: false,
        posicao: 'depois',
        novo: {
          conteudo: {
            texto: TEXTO_002,
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui!.events);
    });

    it('Deveria possuir articulacao com 6 artigos', () => {
      expect(state.articulacao?.artigos.length).to.equal(6);
    });

    it('Deveria possuir alterações do artigo 4º com 3 artigos', () => {
      expect(state.articulacao?.filhos[3].alteracoes?.filhos.length).to.equal(3);
    });

    it('Deveria possuir artigos 1º e 2º, dentro do artigo 4º, com situação Dispositivo Adicionado', () => {
      const disp1 = buscaDispositivoById(state.articulacao!, 'art4_cpt_alt1_art1')!;
      const disp2 = buscaDispositivoById(state.articulacao!, 'art4_cpt_alt1_art2')!;
      expect(disp1.situacao.descricaoSituacao).to.equal('Dispositivo Adicionado');
      expect(disp2.situacao.descricaoSituacao).to.equal('Dispositivo Adicionado');
    });

    it('Deveria possuir todos os artigos com situação Dispositivo Original', () => {
      expect(state.articulacao?.artigos.every(a => a.situacao.descricaoSituacao === 'Dispositivo Original')).to.be.true;
    });

    describe('Testando eventos', () => {
      it('Deveria possuir evento ElementoIncluido com 5 elementos', () => {
        const evIncluidos = eventos.filter(e => e.stateType === StateType.ElementoIncluido)[0];
        expect(evIncluidos.elementos?.length).to.equal(5);
        expect(evIncluidos.elementos?.every(e => e.descricaoSituacao === 'Dispositivo Adicionado')).to.be.true;
        expect(evIncluidos.elementos?.every(e => e.dispositivoAlteracao)).to.be.true;
        expect(evIncluidos.elementos?.filter(e => e.tipo !== 'Omissis').every(e => e.existeNaNormaAlterada)).to.be.true;
      });

      it('Deveria possuir nota de alteração (NR) no último dispositivo de cada alteração incluída', () => {
        const elementosIncluidos = eventos.filter(e => e.stateType === StateType.ElementoIncluido)[0]!.elementos!;
        expect(elementosIncluidos[2].notaAlteracao).to.equal('NR');
        expect(elementosIncluidos[4].notaAlteracao).to.equal('NR');
      });
    });
  });
});
