import { State } from '../../../src/redux/state';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { ASSISTENTE_ALTERACAO } from '../../../src/model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { adicionaAlteracaoComAssistente } from '../../../src/redux/elemento/reducer/adicionaAlteracaoComAssistente';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { abreArticulacao } from '../../../src/redux/elemento/reducer/abreArticulacao';

let state: State;

describe('Testando a "sincronização" de ids em alteração de norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);

    const artigo = projetoNorma.articulacao!.artigos[0]!;
    artigo.rotulo = 'Art.';
    artigo.numero = '1';
    artigo.id = 'art1';
    artigo.texto = 'Teste 1.';
    artigo.caput!.texto = 'Teste 1.';
    const situacao = new DispositivoAdicionado();
    situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
    artigo.situacao = situacao;

    // state = openArticulacaoAction(projetoNorma.articulacao!, ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER);
    state = abreArticulacao(state, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER });
    // state.ui = {} as any;
  });

  describe('Adiciona artigo com alteração de norma e adiciona artigo no início da articulação', () => {
    beforeEach(function () {
      const atual = createElemento(state.articulacao!.artigos[0])!;

      state = adicionaAlteracaoComAssistente(state, {
        type: ASSISTENTE_ALTERACAO,
        atual,
        norma: 'urn:lex:br:federal:lei:1986-12-19;7560',
        dispositivos: 'inciso I do § 1º do Art. 9º',
      });

      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual,
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
        posicao: 'depois',
      });
    });

    it('Articulação deveria possuir 3 artigos', () => {
      expect(state.articulacao!.artigos.length).to.equal(3);
    });

    it('Terceiro artigo deveria possuir a alteração de norma', () => {
      const art3 = state.articulacao!.artigos[2];
      expect(art3.alteracoes).to.not.be.undefined;
      expect(art3.alteracoes?.filhos.length).to.equal(1);
    });

    it('Dispositivo "alteracoes" e seus respectivos filhos deveriam possuir id iniciando com "art3"', () => {
      const art = state.articulacao!.artigos[2];
      const dispositivos = getDispositivoAndFilhosAsLista(art.alteracoes!);
      const inicioId = 'art3_cpt_';
      expect(dispositivos.every(d => d.id?.startsWith(inicioId))).to.be.true;
    });

    describe('Remove o primeiro artigo', () => {
      beforeEach(function () {
        const artigo = state.articulacao!.artigos[0];
        state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
      });

      it('Articulação deveria possuir 2 artigos', () => {
        expect(state.articulacao!.artigos.length).to.equal(2);
      });

      it('Segundo artigo deveria possuir a alteração de norma', () => {
        const art = state.articulacao!.artigos[1];
        expect(art.alteracoes).to.not.be.undefined;
        expect(art.alteracoes?.filhos.length).to.equal(1);
      });

      it('Dispositivo "alteracoes" e seus respectivos filhos deveriam possuir id iniciando com "art2"', () => {
        const art = state.articulacao!.artigos[1];
        const dispositivos = getDispositivoAndFilhosAsLista(art);
        const inicioId = 'art2';
        expect(dispositivos.every(d => d.id === inicioId || d.id?.startsWith(inicioId + '_cpt_'))).to.be.true;
      });

      describe('Remove novamente o primeiro artigo', () => {
        beforeEach(function () {
          const artigo = state.articulacao!.artigos[0];
          state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
        });

        it('Articulação deveria possuir 1 artigo', () => {
          expect(state.articulacao!.artigos.length).to.equal(1);
        });

        it('Artigo deveria possuir a alteração de norma', () => {
          const art = state.articulacao!.artigos[0];
          expect(art.alteracoes).to.not.be.undefined;
          expect(art.alteracoes?.filhos.length).to.equal(1);
        });

        it('Dispositivo "alteracoes" e seus respectivos filhos deveriam possuir id iniciando com "art1"', () => {
          const art = state.articulacao!.artigos[0];
          const dispositivos = getDispositivoAndFilhosAsLista(art);
          const inicioId = 'art1';
          expect(art.id).to.equal(inicioId);
          expect(dispositivos.every(d => d.id === inicioId || d.id?.startsWith(inicioId + '_cpt_'))).to.be.true;
        });
      });
    });
  });
});
