import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { RemissaoExternaValue } from '../../../src/model/remissao';
import { adicionaRemissaoExterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoExterna';
import { removeRemissaoExterna } from '../../../src/redux/elemento/reducer/removeRemissaoExterna';

const criaRemissaoExterna = (refId: string, urn = 'urn:lex:br:federal:lei:1990-07-13;8069'): RemissaoExternaValue => ({
  refId,
  targetUrn: urn,
  targetNomeNorma: 'Lei 8.069/1990',
  targetTextoDispositivo: 'art. 5º',
  targetFragmento: 'art5',
  textoRef: 'art. 5º da Lei 8.069/1990',
  sourceUuid: 1,
});

const criaState = (remissoesExternas?: Record<string, RemissaoExternaValue>): State => ({ remissoesExternas, ui: { events: [] } } as unknown as State);

describe('Remissão Externa — Reducers', () => {
  describe('adicionaRemissaoExterna', () => {
    it('adiciona entrada no state quando não havia nenhuma', () => {
      const state = criaState();
      const value = criaRemissaoExterna('ref_001');
      const result = adicionaRemissaoExterna(state, { value });

      expect(result.remissoesExternas).to.exist;
      expect(result.remissoesExternas!['ref_001']).to.deep.equal(value);
    });

    it('adiciona segunda entrada sem remover a existente', () => {
      const value1 = criaRemissaoExterna('ref_001');
      const state = criaState({ ref_001: value1 });
      const value2 = criaRemissaoExterna('ref_002', 'urn:lex:br:federal:lei:2021-04-01;14133');

      const result = adicionaRemissaoExterna(state, { value: value2 });

      expect(result.remissoesExternas!['ref_001']).to.deep.equal(value1);
      expect(result.remissoesExternas!['ref_002']).to.deep.equal(value2);
    });

    it('sobrescreve entrada existente com mesmo refId (modo edição)', () => {
      const valueOriginal = criaRemissaoExterna('ref_001');
      const state = criaState({ ref_001: valueOriginal });
      const valueEditado: RemissaoExternaValue = { ...valueOriginal, targetTextoDispositivo: 'art. 10' };

      const result = adicionaRemissaoExterna(state, { value: valueEditado });

      expect(result.remissoesExternas!['ref_001'].targetTextoDispositivo).to.equal('art. 10');
    });

    it('não modifica o state quando value não tem refId', () => {
      const state = criaState();
      const result = adicionaRemissaoExterna(state, { value: { targetUrn: 'urn:lex:...' } });

      expect(result).to.equal(state);
    });

    it('não modifica o state quando value é undefined', () => {
      const state = criaState();
      const result = adicionaRemissaoExterna(state, { value: undefined });

      expect(result).to.equal(state);
    });

    it('não modifica o state original (imutabilidade)', () => {
      const state = criaState();
      const value = criaRemissaoExterna('ref_001');
      adicionaRemissaoExterna(state, { value });

      expect(state.remissoesExternas).to.be.undefined;
    });
  });

  describe('removeRemissaoExterna', () => {
    it('remove entrada existente pelo refId', () => {
      const value = criaRemissaoExterna('ref_001');
      const state = criaState({ ref_001: value });

      const result = removeRemissaoExterna(state, { refId: 'ref_001' });

      expect(result.remissoesExternas!['ref_001']).to.be.undefined;
    });

    it('não afeta outras entradas ao remover uma', () => {
      const value1 = criaRemissaoExterna('ref_001');
      const value2 = criaRemissaoExterna('ref_002');
      const state = criaState({ ref_001: value1, ref_002: value2 });

      const result = removeRemissaoExterna(state, { refId: 'ref_001' });

      expect(result.remissoesExternas!['ref_002']).to.deep.equal(value2);
    });

    it('retorna o mesmo state quando refId não existe', () => {
      const state = criaState({ ref_001: criaRemissaoExterna('ref_001') });
      const result = removeRemissaoExterna(state, { refId: 'ref_nao_existe' });

      expect(result).to.equal(state);
    });

    it('retorna o mesmo state quando remissoesExternas está vazio', () => {
      const state = criaState();
      const result = removeRemissaoExterna(state, { refId: 'ref_001' });

      expect(result).to.equal(state);
    });

    it('não modifica o state original (imutabilidade)', () => {
      const value = criaRemissaoExterna('ref_001');
      const state = criaState({ ref_001: value });
      removeRemissaoExterna(state, { refId: 'ref_001' });

      expect(state.remissoesExternas!['ref_001']).to.exist;
    });
  });
});
