import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig } from '../../../src';
import { getTipoPorSigla } from '../../../src/model/lexml/documento/vocabulario/consultasVocabulario';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const configDaCasa = (casaLegislativaEditor: string): LexmlEtaConfig => Object.assign(new LexmlEtaConfig(), { casaLegislativaEditor });

describe('LexmlEtaComponent - casa legislativa do editor', () => {
  afterEach(() => inicializarVocabulario('SF'));

  it('usa o vocabulário de SF por padrão', async () => {
    await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    expect(getTipoPorSigla('PRS')?.urnAutoridade).to.equal('senado.federal');
    expect(getTipoPorSigla('SBT')).to.equal(undefined);
  });

  it('muda as consultas ao receber a configuração com CD', async () => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    component.lexmlEtaConfig = configDaCasa('CD');
    expect(getTipoPorSigla('SBT')?.urnAutoridade).to.equal('camara.deputados');
    expect(getTipoPorSigla('PRS')).to.equal(undefined);
  });

  it('remonta o vocabulário quando a configuração é atribuída de novo', async () => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    component.lexmlEtaConfig = configDaCasa('CD');
    component.lexmlEtaConfig = configDaCasa('SF');
    expect(getTipoPorSigla('PRS')?.urnAutoridade).to.equal('senado.federal');
    expect(getTipoPorSigla('SBT')).to.equal(undefined);
  });

  it('um componente novo volta para SF mesmo depois de uma configuração CD', async () => {
    const primeiro = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    primeiro.lexmlEtaConfig = configDaCasa('CD');
    await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    expect(getTipoPorSigla('SBT')).to.equal(undefined);
  });

  it('casa inválida assume SF', async () => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    const original = console.warn;
    console.warn = () => undefined;
    try {
      component.lexmlEtaConfig = configDaCasa('XX');
    } finally {
      console.warn = original;
    }
    expect(getTipoPorSigla('PRS')?.urnAutoridade).to.equal('senado.federal');
  });

  it('não altera a casa do documento (casaLegislativa)', async () => {
    const component = (await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`)) as any;
    component.casaLegislativa = 'CN';
    component.lexmlEtaConfig = configDaCasa('SF');
    expect(component.casaLegislativa).to.equal('CN');
  });
});
