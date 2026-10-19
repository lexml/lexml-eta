import { expect } from '@open-wc/testing';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { podeRenumerar } from '../../../../src/model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { AutoFix } from '../../../../src/model/lexml/util/mensagem';

// Cabeça criada como em adicionaElemento: rótulo genérico e marcada como existente na norma alterada.
const criaCabecaRecemCriada = (): { articulacao: any; cabeca: any } => {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  createAlteracao(artigo);
  const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!, undefined, 0);
  cabeca.existeNaNormaAlterada = true;
  return { articulacao, cabeca };
};

describe('cabeça de alteração com rótulo pendente: alerta x renumeração', () => {
  it('reproduz o conflito: o alerta oferece a correção e a renumeração é negada', () => {
    const { articulacao, cabeca } = criaCabecaRecemCriada();

    const alerta = validaDispositivo(cabeca).find(m => m.descricao === AutoFix.RENUMERAR_DISPOSITIVO);

    expect(alerta?.fix).to.equal(true);
    expect(podeRenumerar(articulacao, createElemento(cabeca, true))).to.equal(false);
  });
});
