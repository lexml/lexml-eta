import { isArticulacao } from './../../../src/model/dispositivo/tipo';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista, isAdicionado } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { State } from '../../../src/redux/state';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { EMENDA_005 } from '../../doc/emendas/emenda-005';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';

let state: State;

describe('Testando carregamento da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  it('Deveria possuir articulação com 7 capítulos', () => {
    expect(state.articulacao?.filhos.length).to.equal(7);
    expect(state.articulacao!.filhos.every(f => f.tipo === 'Capitulo')).to.be.true;
    expect(state.articulacao!.artigos.length).to.equal(53);
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_005.componentes[0].dispositivos });
    });

    it('Deveria possuir 7 dispositivos adicionados', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
      expect(dispositivos.length).to.equal(7);
    });

    describe('Testando número dos dispositivos adicionados', () => {
      it('Inciso "art1_par1u_inc1-1" deveria possuir número "1-1" e rótulo "I-1 –"', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        expect(dispositivo.numero).to.equal('1-1');
        expect(dispositivo.rotulo).to.equal('I-1 –');
      });

      it('Alínea "art1_par1u_inc1-1_ali1" deveria possuir número "1" e rotulo "a)"', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
        expect(dispositivo.numero).to.equal('1');
        expect(dispositivo.rotulo).to.equal('a)');
      });

      it('Item "art1_par1u_inc1-1_ali1_ite1" deveria possuir número "1" e rótulo "1."', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
        expect(dispositivo.numero).to.equal('1');
        expect(dispositivo.rotulo).to.equal('1.');
      });

      it('Item "art1_par1u_inc1-1_ali1_ite2" deveria possuir número "2" e rótulo "2."', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite2')!;
        expect(dispositivo.numero).to.equal('2');
        expect(dispositivo.rotulo).to.equal('2.');
      });

      it('Alínea "art1_par1u_inc1-1_ali2" deveria possuir número "2" e rótulo "b)"', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!;
        expect(dispositivo.numero).to.equal('2');
        expect(dispositivo.rotulo).to.equal('b)');
      });

      it('Alínea "art1_par1u_inc1-1_ali3" deveria possuir número "3" e rótulo "c)"', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali3')!;
        expect(dispositivo.numero).to.equal('3');
        expect(dispositivo.rotulo).to.equal('c)');
      });

      it('Inciso "art1_par1u_inc1-2" deveria possuir número "1-2" e rótulo "I-2 –"', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect(dispositivo.numero).to.equal('1-2');
        expect(dispositivo.rotulo).to.equal('I-2 –');
      });
    });
  });
});
