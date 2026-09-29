import { expect } from '@open-wc/testing';
import { adicionarElementoAction, adicionarIncisoFilho, adicionarParagrafoFilho } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ElementoAction } from '../../../src/model/lexml/acao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';

// Change 2026-09-29-c01: artigo de alteração só tem o bloco de alteração, nunca inciso ou parágrafo próprio.
// Na MPV 905/2019, art25 tem bloco de alteração e art6 é um artigo comum com incisos.

let state: State;

const menuOferece = (dispositivo: Dispositivo, descricao: string): boolean => dispositivo.getAcoesPossiveis(dispositivo).some((a: ElementoAction) => a.descricao === descricao);

const artigo = (id: string): Artigo => buscaDispositivoById(state.articulacao!, id) as Artigo;

const filhosProprios = (art: Artigo): number => art.caput!.filhos.length + art.filhos.filter(f => f.tipo === 'Paragrafo').length;

describe('Artigo de alteração não tem incisos nem parágrafos próprios', () => {
  beforeEach(() => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
    expect(artigo('art25').hasAlteracao(), 'art25 deve ter bloco de alteração').to.be.true;
    expect(artigo('art6').hasAlteracao(), 'art6 não deve ter bloco de alteração').to.be.false;
  });

  describe('Menu', () => {
    it('artigo com bloco de alteração não oferece "Adicionar inciso" nem "Adicionar parágrafo"', () => {
      expect(menuOferece(artigo('art25'), adicionarIncisoFilho.descricao!)).to.be.false;
      expect(menuOferece(artigo('art25'), adicionarParagrafoFilho.descricao!)).to.be.false;
    });

    it('artigo sem bloco de alteração continua oferecendo as duas ações', () => {
      expect(menuOferece(artigo('art6'), adicionarIncisoFilho.descricao!)).to.be.true;
      expect(menuOferece(artigo('art6'), adicionarParagrafoFilho.descricao!)).to.be.true;
    });
  });

  describe('Reducer, sem passar pelo menu', () => {
    it('adicionar inciso no artigo com bloco não cria inciso próprio', () => {
      const art = artigo('art25');
      const blocoAntes = art.alteracoes!.filhos.length;

      state = elementoReducer(state, adicionarIncisoFilho.execute(createElemento(art)));

      expect(filhosProprios(art)).to.equal(0);
      expect(art.alteracoes!.filhos.length).to.equal(blocoAntes);
    });

    it('adicionar parágrafo no artigo com bloco não cria parágrafo próprio', () => {
      const art = artigo('art25');

      state = elementoReducer(state, adicionarParagrafoFilho.execute(createElemento(art)));

      expect(filhosProprios(art)).to.equal(0);
    });

    it('adicionar inciso no artigo sem bloco continua criando o inciso', () => {
      const art = artigo('art6');
      const incisosAntes = art.caput!.filhos.length;

      state = elementoReducer(state, adicionarIncisoFilho.execute(createElemento(art)));

      expect(art.caput!.filhos.length).to.equal(incisosAntes + 1);
    });
  });

  describe('Enter no fim do texto do artigo de alteração', () => {
    it('cria um artigo dentro do bloco, sem filho próprio', () => {
      const art = artigo('art25');
      const blocoAntes = art.alteracoes!.filhos.length;

      state = elementoReducer(state, adicionarElementoAction.execute(createElemento(art)));

      expect(filhosProprios(art)).to.equal(0);
      expect(art.alteracoes!.filhos.length).to.equal(blocoAntes + 1);
    });
  });
});
