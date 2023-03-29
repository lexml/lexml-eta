import { buscaDispositivoById, isDispositivoAlteracao } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { adicionaElementosNaProposicaoFromClipboard } from './../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { TEXTO_001 } from '../../doc/textos-colar/texto_001';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

let state: State;
// let eventos: StateEvent[];

describe('Testando carregamento da MPV 885/2019', () => {
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
      const isColarSubstituindo = true;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_001,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });

    it('Deveria possuir articulacao com 53 artigos', () => {
      expect(state.articulacao?.artigos.length).to.equal(53);
    });

    it('Deveria possuir artigos 1 e 2 com situação DispositivoModificado', () => {
      const disp1 = buscaDispositivoById(state.articulacao!, 'art1')!;
      const disp2 = buscaDispositivoById(state.articulacao!, 'art2')!;
      expect(disp1.situacao.descricaoSituacao).to.equal('Dispositivo Modificado');
      expect(disp2.situacao.descricaoSituacao).to.equal('Dispositivo Modificado');
    });

    it('Deveria possuir demais artigos com situação Dispositivo Original', () => {
      expect(state.articulacao?.artigos.filter(a => a.id !== 'art1' && a.id !== 'art2').every(a => a.situacao.descricaoSituacao === 'Dispositivo Original')).to.equal(
        'Dispositivo Modificado'
      );
    });
  });

  // describe('Testando aplicação de dispositivos emendados', () => {
  //   beforeEach(function () {
  //     state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_001.componentes[0].dispositivos });
  //     eventos = getEventosQuePossuemElementos(state.ui!.events);
  //   });

  //   it('Testando se articulação possui apenas 1 filho (Capítulo I) ', () => {
  //     const d = state.articulacao!.filhos[0];
  //     expect(d.tipo).equal('Capitulo');
  //     expect(d.id).equal('cap1');
  //     expect(d.texto).equal('CAP 1');
  //     expect(d.rotulo).equal('CAPÍTULO ÚNICO');
  //     expect(d.pai).equal(state.articulacao);
  //     expect(d.filhos.length).equal(1);
  //     expect(d.filhos[0].id).equal('cap1_sec1');
  //     expect(state.articulacao?.filhos.length).equal(1);

  //     const incluidos = getEvento(eventos, StateType.ElementoIncluido);
  //     expect(incluidos.elementos?.length).equal(1);
  //     expect(incluidos.referencia?.tipo).equal('Ementa');
  //     expect(incluidos.referencia?.lexmlId ?? '').equal('');
  //   });
  // });
});
