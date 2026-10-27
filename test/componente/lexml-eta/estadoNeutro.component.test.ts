import { expect, fixture, html } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { rootStore } from '../../../src/redux/store';

describe('LexmlEtaComponent — estado neutro', () => {
  let component: LexmlEtaComponent;

  const abas = (): any[] => Array.from(component.querySelectorAll('sl-tab'));
  const mensagem = (): boolean => !!component.querySelector('.aguardando-inicializacao');
  const divisorDesabilitado = (): boolean => component.querySelector('sl-split-panel')!.hasAttribute('disabled');
  const inicializar = async (): Promise<void> => {
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.novaProposicao({ urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1', epigrafe: 'PROJETO DE LEI', preambulo: '' });
    await component.updateComplete;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
  });

  it('recém-instanciado: todas as abas e o divisor desabilitados, com a mensagem de espera', () => {
    expect(abas().length).to.be.greaterThan(0);
    expect(abas().every(a => a.hasAttribute('inert'))).to.be.true;
    expect(mensagem()).to.be.true;
    expect(component.querySelector('.aguardando-inicializacao')!.textContent).to.contain('aguardando inicialização');
    expect(divisorDesabilitado()).to.be.true;
    expect(component.querySelector('lexml-eta-proposicao')!.classList.contains('oculto')).to.be.true;
  });

  it('sai do estado neutro ao inicializar um documento', async () => {
    await inicializar();

    expect(abas().some(a => a.hasAttribute('inert'))).to.be.false;
    expect(mensagem()).to.be.false;
    expect(component.querySelector('lexml-eta-proposicao')!.classList.contains('oculto')).to.be.false;
    expect(divisorDesabilitado()).to.be.false;
  });

  it('fecharDocumento volta ao estado neutro e descarta o documento', async () => {
    await inicializar();
    component.fecharDocumento();
    await component.updateComplete;

    expect(abas().every(a => a.hasAttribute('inert'))).to.be.true;
    expect(mensagem()).to.be.true;
    expect(divisorDesabilitado()).to.be.true;
    expect(rootStore.getState().elementoReducer.articulacao).to.be.undefined;
    expect(rootStore.getState().elementoReducer.ui?.alertas ?? []).to.deep.equal([]);
    expect(() => component.getDocumentoArticulado()).to.throw('Inicialize um documento');
    expect(component.getProposicao().projetoNorma).to.be.undefined;
  });

  it('inicializa de novo depois de fechar', async () => {
    await inicializar();
    component.fecharDocumento();
    await inicializar();

    expect(abas().some(a => a.hasAttribute('inert'))).to.be.false;
    expect(mensagem()).to.be.false;
    expect(rootStore.getState().elementoReducer.articulacao).to.exist;
  });
});
