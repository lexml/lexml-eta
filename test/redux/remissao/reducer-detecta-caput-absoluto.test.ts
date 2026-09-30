// Caracteriza a detecção da forma absoluta "caput do art. N" (lacuna: hoje a referência é descartada).
import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { ReferenciaDispositivoParser } from '../../../src/model/lexml/numeracao/parserReferenciaDispositivo';
import { criaStateComNArtigos, detectaRemissoes } from '../../helpers/dispositivo-helper';

describe('detecção de remissão absoluta para o caput ("caput do art. N")', () => {
  let state: any;
  let artigos: any[];

  beforeEach(() => {
    ({ state, artigos } = criaStateComNArtigos(3));
  });

  describe('parser', () => {
    it('reconhece "caput do art. 2º" como referência válida', () => {
      const parser = new ReferenciaDispositivoParser('caput do art. 2º');
      expect(parser.valido).to.be.true;
    });

    it('reconhece "inciso I do caput do art. 2º" como referência válida (controle)', () => {
      const parser = new ReferenciaDispositivoParser('inciso I do caput do art. 2º');
      expect(parser.valido).to.be.true;
    });
  });

  describe('detecção', () => {
    it('controle: "art. 2º" vira remissão para o artigo', () => {
      const r = detectaRemissoes(state, artigos[0], 'Conforme o art. 2º, aplica-se o seguinte.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal(artigos[1].uuid);
    });

    it('"caput do art. 2º" vira remissão para o CAPUT do art. 2º', () => {
      const r = detectaRemissoes(state, artigos[0], 'Conforme o caput do art. 2º, aplica-se o seguinte.');
      expect(r).to.have.length(1);
      expect(r[0].textoRef).to.equal('caput do art. 2º');
      expect(r[0].targetUuid).to.equal((artigos[1] as Artigo).caput!.uuid);
      expect(r[0].targetUuid).to.not.equal(artigos[1].uuid);
    });

    it('"caput do art. 2" (sem º) vira remissão para o caput', () => {
      const r = detectaRemissoes(state, artigos[0], 'Conforme o caput do art. 2, aplica-se.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal((artigos[1] as Artigo).caput!.uuid);
    });

    it('texto misto "caput do art. 2º e art. 3º" gera duas remissões distintas', () => {
      const r = detectaRemissoes(state, artigos[0], 'Conforme o caput do art. 2º e o art. 3º.');
      expect(r).to.have.length(2);
      const alvos = r.map(x => x.targetUuid);
      expect(alvos).to.include((artigos[1] as Artigo).caput!.uuid);
      expect(alvos).to.include(artigos[2].uuid);
    });

    it('"inciso I do caput do art. 2º" vira remissão para o inciso (controle da forma composta)', () => {
      const inciso = criaDispositivo(artigos[1].caput, 'Inciso');
      inciso.texto = 'inciso';
      artigos[1].renumeraFilhos();
      inciso.createRotulo(inciso);
      updateIdDispositivoAndFilhos(state.articulacao);

      const r = detectaRemissoes(state, artigos[0], 'Conforme o inciso I do caput do art. 2º, aplica-se.');
      expect(r).to.have.length(1);
      expect(r[0].targetUuid).to.equal(inciso.uuid);
    });
  });
});
