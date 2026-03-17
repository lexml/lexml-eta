import { expect } from '@open-wc/testing';
import { gerarRefId } from '../../../src/model/remissao/refId';

// m1 — Utilitário centralizado para geração de refId
// BUG: a mesma lógica existe em 3 locais distintos, dois deles usando substr() (deprecado):
//   - src/components/editor/remissaoInternaDialog.ts:337 (substr)
//   - src/redux/elemento/reducer/adicionaRemissaoInterna.ts:408 (substr)
//   - src/components/editor/moduloRemissao.ts:325 (substring — correto)
// CORREÇÃO: extrair para src/model/remissao/refId.ts usando substring().

describe('m1 — gerarRefId: utilitário centralizado', () => {
  it('retorna string no formato ref_<timestamp>_<aleatório>', () => {
    const id = gerarRefId();
    expect(id).to.match(/^ref_\d+_[a-z0-9]+$/, 'formato esperado: ref_<timestamp>_<alfanumérico>');
  });

  it('prefixo é "ref_"', () => {
    expect(gerarRefId()).to.match(/^ref_/);
  });

  it('parte aleatória tem pelo menos 6 caracteres', () => {
    const id = gerarRefId();
    const parteAleatoria = id.split('_').slice(2).join('_');
    expect(parteAleatoria.length).to.be.at.least(6);
  });

  it('duas chamadas produzem ids diferentes (unicidade)', () => {
    const ids = new Set(Array.from({ length: 20 }, () => gerarRefId()));
    expect(ids.size).to.equal(20, 'cada chamada deve gerar um id único');
  });
});
