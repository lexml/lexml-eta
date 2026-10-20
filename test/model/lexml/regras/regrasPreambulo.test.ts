import { expect } from '@open-wc/testing';
import { isEmenta, isPreambulo } from '../../../../src/model/dispositivo/tipo';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';

describe('Preâmbulo — tipo e regras', () => {
  const novoPreambulo = (): any => {
    const dispositivo = criaDispositivo(createArticulacao(), 'Preambulo');
    dispositivo.pai = undefined;
    return dispositivo;
  };

  it('é criado com o tipo Preambulo', () => {
    const preambulo = novoPreambulo();
    expect(preambulo.tipo).to.equal('Preambulo');
    expect(isPreambulo(preambulo)).to.be.true;
    expect(isEmenta(preambulo)).to.be.false;
  });

  it('não oferece nenhuma ação, nem TAB e SHIFT+TAB', () => {
    const preambulo = novoPreambulo();
    expect(preambulo.getAcoesPossiveis(preambulo)).to.deep.equal([]);
    expect(preambulo.getAcaoPossivelTab(preambulo)).to.be.undefined;
    expect(preambulo.getAcaoPossivelShiftTab(preambulo)).to.be.undefined;
  });
});
