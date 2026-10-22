import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { buildListaDispositivos as listaDoDialogoInterno } from '../../../src/components/editor/remissaoInternaDialog';
import { buildListaDispositivos as listaDoDialogoGeral } from '../../../src/components/editor/remissaoDialog';
import { podeSerDestinoDeRemissaoInterna } from '../../../src/model/remissao/destinoRemissao';
import { criaStateComNArtigos, detectaRemissoes } from '../../helpers/dispositivo-helper';
import { adicionarIncisoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';

describe('remissão interna e a pena', () => {
  let state: any;
  let artigos: any[];
  let pena: any;

  beforeEach(() => {
    ({ state, artigos } = criaStateComNArtigos(3));
    pena = criaDispositivo(artigos[0] as Artigo, TipoDispositivo.pena.tipo);
    pena.rotulo = 'Pena –';
    pena.texto = 'reclusão, de seis a vinte anos.';
    artigos[0].renumeraFilhos();
    updateIdDispositivoAndFilhos(state.articulacao);
  });

  describe('destinos do diálogo', () => {
    it('a pena não é destino, e os demais tipos continuam sendo', () => {
      expect(podeSerDestinoDeRemissaoInterna({ tipo: 'Pena' })).to.equal(false);
      expect(['Artigo', 'Paragrafo', 'Inciso', 'Alinea', 'Item', 'Capitulo', 'Caput'].every(tipo => podeSerDestinoDeRemissaoInterna({ tipo }))).to.equal(true);
    });

    it('as listas dos dois diálogos não trazem a pena', () => {
      [listaDoDialogoInterno, listaDoDialogoGeral].forEach(monta => {
        const lista = monta(state.articulacao);
        expect(lista.some(d => d.tipo === 'Pena')).to.equal(false);
        expect(lista.some(d => d.tipo === 'Artigo')).to.equal(true);
      });
    });
  });

  describe('detecção automática', () => {
    it('"art. 1º" resolve para o artigo e nunca para a pena dele', () => {
      const r = detectaRemissoes(state, artigos[2], 'Conforme o art. 1º, aplica-se.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal(artigos[0].uuid);
      expect(r[0].targetUuid).to.not.equal(pena.uuid);
    });

    it('"caput do art. 1º" resolve para o caput, e não para a pena', () => {
      const r = detectaRemissoes(state, artigos[2], 'Conforme o caput do art. 1º, aplica-se.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal((artigos[0] as Artigo).caput!.uuid);
    });

    it('texto sem número de artigo não cria remissão para a pena', () => {
      const r = detectaRemissoes(state, artigos[2], 'Aplica-se a pena do art. 1º.');
      expect(r.some(x => x.targetUuid === pena.uuid)).to.equal(false);
    });
  });

  describe('remissão no texto da pena', () => {
    it('cria a remissão interna a partir do texto da própria pena', () => {
      const r = detectaRemissoes(state, pena, 'reclusão, nos termos do art. 2º.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal(artigos[1].uuid);
      expect(r[0].sourceUuid).to.equal(pena.uuid);
    });

    it('resolve a referência contextual "deste artigo" a partir da pena', () => {
      const r = detectaRemissoes(state, pena, 'reclusão, aumentada na forma do caput deste artigo.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal((artigos[0] as Artigo).caput!.uuid);
    });
  });

  describe('atualização da remissão que está no texto da pena', () => {
    it('um inciso incluído antes do destino muda a remissão de "inciso II" para "inciso III" e o texto da pena', () => {
      ({ state, artigos } = criaStateComNArtigos(1));
      const art1 = artigos[0] as Artigo;
      const inciso1 = criaDispositivo(art1, TipoDispositivo.inciso.tipo) as any;
      inciso1.texto = 'primeiro inciso;';
      const inciso2 = criaDispositivo(art1, TipoDispositivo.inciso.tipo) as any;
      inciso2.texto = 'segundo inciso.';
      const penaDoCaput = criaDispositivo(art1, TipoDispositivo.pena.tipo) as any;
      penaDoCaput.rotulo = 'Pena –';
      const prefixo = 'reclusão, nos termos do ';
      penaDoCaput.texto = `${prefixo}inciso II do art. 1º.`;
      art1.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
      state.remissoes = {
        [penaDoCaput.uuid]: [
          { refId: 'ref_pena', sourceUuid: penaDoCaput.uuid, targetUuid: inciso2.uuid, targetLexmlId: inciso2.id, textoRef: 'inciso II do art. 1º', inicio: prefixo.length },
        ],
      };

      const resultado = elementoReducer(state, adicionarIncisoAntes.execute(createElemento(inciso2, true)));

      const entrada = resultado.remissoes![penaDoCaput.uuid][0];
      expect(entrada.textoRef).to.equal('inciso III do art. 1º');
      expect(entrada.targetLexmlId).to.equal(inciso2.id);
      expect(penaDoCaput.texto).to.contain('inciso III do art. 1º');
      expect(penaDoCaput.texto).to.not.contain('inciso II do');
    });
  });
});
