import { expect } from '@open-wc/testing';
import { Articulacao, Artigo } from '../../../src/model/dispositivo/dispositivo';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, findDispositivoByUuid2, getDispositivoAnteriorNaSequenciaDeLeitura } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';

// Caracterização da lacuna de findDispositivoByUuid2 (não desce no caput) — ver se há efeito observável em aplicaRevisoes.
describe('findDispositivoByUuid2 e o caput', () => {
  describe('hierarquia', () => {
    let articulacao: Articulacao;
    let artigo: Artigo;

    beforeEach(() => {
      articulacao = createArticulacao();
      artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
    });

    it('não encontra o caput pelo uuid2 (lacuna)', () => {
      expect(findDispositivoByUuid2(articulacao, artigo.caput!.uuid2!)).to.be.null;
    });

    it('encontra o artigo pelo uuid2', () => {
      expect(findDispositivoByUuid2(articulacao, artigo.uuid2!)).to.equal(artigo);
    });

    it('o dispositivo anterior do 1º parágrafo é o caput, mas createElemento o troca pelo artigo', () => {
      const par = artigo.filhos[0];
      expect(getDispositivoAnteriorNaSequenciaDeLeitura(par)).to.equal(artigo.caput);

      const anterior = createElemento(par, false, true).elementoAnteriorNaSequenciaDeLeitura!;
      expect(anterior.uuid2).to.equal(artigo.uuid2);
      expect(anterior.uuid2).not.to.equal(artigo.caput!.uuid2);
    });
  });

  describe('aplicaRevisoes com exclusão do dispositivo logo após o caput', () => {
    let state: State;

    beforeEach(() => {
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
      state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('referência gravada na revisão nunca é o uuid2 de um caput, e reaplicar a revisão resolve o anterior', () => {
      const par = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
      const artigo = par.pai as Artigo;
      expect(getDispositivoAnteriorNaSequenciaDeLeitura(par)).to.equal(artigo.caput);

      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(par) });
      const revisoes = JSON.parse(JSON.stringify(state.revisoes));
      const anterior = revisoes[0].elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura;

      expect(anterior.uuid2).to.equal(artigo.uuid2);
      expect(findDispositivoByUuid2(state.articulacao!, anterior.uuid2)).to.equal(artigo);

      // Reaplica em um documento limpo (abertura de arquivo com revisões)
      const limpo = buildProjetoNormaFromJsonix(MPV_905_2019);
      let novo = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: limpo.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
      novo = elementoReducer(novo, aplicarRevisoesAction.execute(revisoes));
      const anteriorReaplicado = novo.revisoes![0] as any;
      expect(anteriorReaplicado.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura.lexmlId).to.equal('art1');
    });
  });
});
