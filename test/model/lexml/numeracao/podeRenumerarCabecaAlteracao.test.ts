import { expect } from '@open-wc/testing';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { podeRenumerar } from '../../../../src/model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { AutoFix } from '../../../../src/model/lexml/util/mensagem';

// Cabeça criada como em adicionaElemento: rótulo genérico e marcada como existente na norma alterada.
const criaCabeca = (): { articulacao: any; cabeca: any } => {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  createAlteracao(artigo);
  const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!, undefined, 0);
  cabeca.existeNaNormaAlterada = true;
  return { articulacao, cabeca };
};

const alertaNumeracao = (d: any): any => validaDispositivo(d).find(m => m.descricao === AutoFix.RENUMERAR_DISPOSITIVO);
const pode = (articulacao: any, d: any): boolean => podeRenumerar(articulacao, createElemento(d, true));

describe('numeração da cabeça de alteração: alerta e renumeração usam a mesma regra', () => {
  it('cabeça com rótulo pendente: o alerta oferece a correção e a renumeração é permitida', () => {
    const { articulacao, cabeca } = criaCabeca();

    expect(alertaNumeracao(cabeca)?.fix).to.equal(true);
    expect(pode(articulacao, cabeca)).to.equal(true);
  });

  it('cabeça já numerada e existente na norma não é renumerável e não exibe o alerta', () => {
    const { articulacao, cabeca } = criaCabeca();
    cabeca.createNumeroFromRotulo('5');
    cabeca.createRotulo(cabeca);

    expect(alertaNumeracao(cabeca)).to.equal(undefined);
    expect(pode(articulacao, cabeca)).to.equal(false);
  });

  it('filho numerado e existente na norma não é renumerável', () => {
    const { articulacao, cabeca } = criaCabeca();
    cabeca.createNumeroFromRotulo('5');
    cabeca.createRotulo(cabeca);
    const inciso = criaDispositivo(cabeca.caput, TipoDispositivo.inciso.tipo, undefined, 0);
    inciso.isDispositivoAlteracao = true;
    inciso.existeNaNormaAlterada = true;
    inciso.createNumeroFromRotulo('I');
    inciso.createRotulo(inciso);

    expect(pode(articulacao, inciso)).to.equal(false);
  });

  it('omissis não é renumerável', () => {
    const { articulacao, cabeca } = criaCabeca();
    const omissis = criaDispositivo(cabeca.caput, TipoDispositivo.omissis.tipo, undefined, 0);
    omissis.isDispositivoAlteracao = true;

    expect(pode(articulacao, omissis)).to.equal(false);
  });

  it('dispositivo fora de alteração continua sem permissão de renumerar', () => {
    const articulacao = createArticulacao();
    const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

    expect(pode(articulacao, artigo)).to.equal(false);
  });
});
