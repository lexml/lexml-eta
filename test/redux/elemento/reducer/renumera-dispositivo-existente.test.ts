import { expect } from '@open-wc/testing';
import { MPV_1234_2024 } from '../../../doc/mpv_1234_2024';
import { State } from '../../../../src/redux/state';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { RENUMERAR_ELEMENTO, renumerarElementoAction } from '../../../../src/model/lexml/acao/renumerarElementoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../../../../src/model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { podeRenumerar } from '../../../../src/model/lexml/numeracao/numeracaoUtil';

const ART4 = 'art1_cpt_alt1_art4';
const PAR_EXISTENTE = `${ART4}_par4`;

let state: State;

const dispositivo = (id: string): ReturnType<typeof buscaDispositivoById> => buscaDispositivoById(state.articulacao!, id);

// O documento carregado de arquivo não traz o selo; o editor o define ao informar a norma ("Existente").
const marcaComoExistente = (id: string): void => {
  state = elementoReducer(state, considerarElementoExistenteNaNorma.execute(createElemento(dispositivo(id)!)));
};

describe('Renumeração de dispositivo existente na norma alterada (MPV 1234/2024)', () => {
  beforeEach(() => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('podeRenumerar', () => {
    it('permite renumerar o parágrafo existente na norma alterada', () => {
      marcaComoExistente(PAR_EXISTENTE);
      const par = dispositivo(PAR_EXISTENTE)!;
      expect(par.existeNaNormaAlterada).to.be.true;

      expect(podeRenumerar(state.articulacao!, createElemento(par))).to.be.true;
    });

    it('permite renumerar o artigo existente em alteração de norma', () => {
      marcaComoExistente(ART4);
      const artigo = dispositivo(ART4)!;
      expect(artigo.existeNaNormaAlterada).to.be.true;

      expect(podeRenumerar(state.articulacao!, createElemento(artigo))).to.be.true;
    });

    it('permite renumerar o parágrafo novo na norma alterada', () => {
      const artigo = dispositivo(ART4)!;
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(artigo.filhos[1]), novo: { tipo: 'Paragrafo' } });
      state = elementoReducer(state, { type: 'INFORMAR_EXISTENCIA_NA_NORMA', ...considerarElementoNovoNaNorma.execute(createElemento(artigo.filhos[2])) });

      expect(artigo.filhos[2].existeNaNormaAlterada).to.be.false;
      expect(podeRenumerar(state.articulacao!, createElemento(artigo.filhos[2]))).to.be.true;
    });

    it('nega a renumeração fora de alteração de norma', () => {
      const artigoPrincipal = state.articulacao!.artigos[0];

      expect(podeRenumerar(state.articulacao!, createElemento(artigoPrincipal))).to.be.false;
    });

    it('nega a renumeração de omissis', () => {
      const omissis = dispositivo(`${ART4}_omi1`)!;

      expect(podeRenumerar(state.articulacao!, createElemento(omissis))).to.be.false;
    });
  });

  describe('renumerar o parágrafo existente', () => {
    it('oferece a ação de renumerar no elemento do parágrafo existente', () => {
      const elemento = createElemento(dispositivo(PAR_EXISTENTE)!);

      expect(elemento.acoesPossiveis).to.include(renumerarElementoAction);
    });

    it('muda o rótulo e o id e mantém o dispositivo como existente', () => {
      marcaComoExistente(PAR_EXISTENTE);
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(dispositivo(PAR_EXISTENTE)!), novo: { numero: '4-A' } });

      const renumerado = dispositivo(`${PAR_EXISTENTE}-1`)!;
      expect(renumerado).to.not.be.undefined;
      expect(renumerado.rotulo).to.equal('§ 4º-A.');
      expect(renumerado.existeNaNormaAlterada).to.be.true;
      expect(dispositivo(PAR_EXISTENTE)).to.be.undefined;
    });

    it('não é bloqueada pelas mensagens de numeração do dispositivo renumerado', () => {
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(dispositivo(PAR_EXISTENTE)!), novo: { numero: '9' } });

      const renumerado = dispositivo(`${ART4}_par9`)!;
      expect(renumerado, 'dispositivo renumerado').to.not.be.undefined;
      expect(renumerado.rotulo).to.equal('§ 9º');
      expect(state.ui!.events.some(ev => ev.elementos?.some(e => e.lexmlId === `${ART4}_par9`))).to.be.true;
    });
  });

  describe('numeração automática só nos filhos de dispositivo novo', () => {
    const artigoComUmParagrafo = (): NonNullable<ReturnType<typeof buscaDispositivoById>> => {
      const artigo = dispositivo(ART4)!;
      artigo.filhos.filter(f => f.tipo === 'Paragrafo' && f.id !== PAR_EXISTENTE).forEach(f => artigo.removeFilho(f));
      expect(artigo.filhos.filter(f => f.tipo === 'Paragrafo')).to.have.length(1);
      return artigo;
    };

    it('mantém o número informado no único parágrafo novo de artigo existente', () => {
      const artigo = artigoComUmParagrafo();
      const par = artigo.filhos.find(f => f.tipo === 'Paragrafo')!;
      state = elementoReducer(state, { type: 'INFORMAR_EXISTENCIA_NA_NORMA', ...considerarElementoNovoNaNorma.execute(createElemento(par)) });
      expect(par.existeNaNormaAlterada).to.be.false;

      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(par), novo: { numero: '2' } });

      expect(par.rotulo).to.equal('§ 2º');
      expect(par.numero).to.equal('2');
    });

    it('mantém "Parágrafo único." quando o usuário informa único', () => {
      const artigo = artigoComUmParagrafo();
      const par = artigo.filhos.find(f => f.tipo === 'Paragrafo')!;
      state = elementoReducer(state, { type: 'INFORMAR_EXISTENCIA_NA_NORMA', ...considerarElementoNovoNaNorma.execute(createElemento(par)) });

      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(par), novo: { numero: 'único' } });

      expect(par.rotulo).to.equal('Parágrafo único.');
    });

    it('calcula automaticamente o "Parágrafo único." do filho de artigo novo', () => {
      const artigo = artigoComUmParagrafo();
      const par = artigo.filhos.find(f => f.tipo === 'Paragrafo')!;
      // O artigo de ART4 tem omissis, o que impede marcá-lo como novo pela ação; o estado é montado direto.
      artigo.existeNaNormaAlterada = false;
      par.existeNaNormaAlterada = false;

      par.createRotulo(par);

      expect(par.rotulo).to.equal('Parágrafo único.');
    });
  });

  describe('filho de pai novo na norma', () => {
    it('não oferece a renumeração manual ao inciso', () => {
      const par = dispositivo(PAR_EXISTENTE)!;
      state = elementoReducer(state, { type: 'INFORMAR_EXISTENCIA_NA_NORMA', ...considerarElementoNovoNaNorma.execute(createElemento(par)) });
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(par), novo: { tipo: 'Inciso' } });
      const inciso = par.filhos[0];

      expect(par.existeNaNormaAlterada).to.be.false;
      expect(createElemento(inciso).acoesPossiveis).to.not.include(renumerarElementoAction);
    });
  });
});
