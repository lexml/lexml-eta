import { expect } from '@open-wc/testing';
import { getTipoRevisaoElemento } from '../../../src/redux/elemento/util/revisaoUtil';
import { StateType } from '../../../src/redux/state';

// #1095: a cor da letra do dispositivo revisado segue a mesma precedência da descrição da marca.
const revisao = (operacoes: string | undefined, stateType = StateType.ElementoModificado): any => ({ revisao: operacoes, stateType });

describe('getTipoRevisaoElemento (#1095)', () => {
  it('inclusão vale sobre a alteração', () => {
    expect(getTipoRevisaoElemento(revisao('adicionado'))).to.equal('inclusao');
    expect(getTipoRevisaoElemento(revisao('adicionado,alterado'))).to.equal('inclusao');
  });

  it('alteração de texto, movimentação, transformação e rótulo são alteração', () => {
    ['alterado', 'movido;3', 'movido;3,alterado', 'transformado;inciso', 'transformado;inciso,alterado', 'alteracaoRotulo;art2'].forEach(operacoes =>
      expect(getTipoRevisaoElemento(revisao(operacoes)), operacoes).to.equal('alteracao')
    );
  });

  it('exclusão vale sobre as demais operações', () => {
    expect(getTipoRevisaoElemento(revisao('excluido'))).to.equal('exclusao');
    expect(getTipoRevisaoElemento(revisao('movido;2,excluido'))).to.equal('exclusao');
  });

  it('sem operações, segue o tipo do evento', () => {
    expect(getTipoRevisaoElemento(revisao(undefined, StateType.ElementoRemovido))).to.equal('exclusao');
    expect(getTipoRevisaoElemento(revisao(undefined, StateType.ElementoIncluido))).to.equal('inclusao');
    expect(getTipoRevisaoElemento(revisao(undefined, StateType.ElementoModificado))).to.equal('alteracao');
  });
});
