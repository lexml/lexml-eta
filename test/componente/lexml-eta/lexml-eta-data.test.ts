import { expect, fixture } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaParametrosEdicao } from '../../../src';
import { Proposicao } from '../../../src/model/proposicao/proposicao';

describe('Campo "Data" do documento', () => {
  const campoData = (component: LexmlEtaComponent): any => component.querySelector('lexml-eta-data');

  const novoComponente = async (): Promise<LexmlEtaComponent> => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    return component;
  };

  it('exibe a opção "Não informar" antes da opção de data', async () => {
    const campo = await fixture<any>('<lexml-eta-data></lexml-eta-data>');
    await campo.updateComplete;

    const radios = Array.from(campo.shadowRoot.querySelectorAll('sl-radio')) as HTMLElement[];

    expect(radios.length).to.equal(2);
    expect(radios[0].id).to.equal('no-date');
    expect(radios[1].classList.contains('radio-data')).to.equal(true);
  });

  [false, true].forEach(anexoParecer => {
    it(`documento novo nasce com "Não informar" (anexoParecer=${anexoParecer})`, async () => {
      const component = await novoComponente();
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.anexoParecer = anexoParecer;

      await component.inicializarEdicao(params);
      await campoData(component).updateComplete;

      expect(campoData(component).data).to.equal('');
      expect(campoData(component).shadowRoot.querySelector('#no-date').checked).to.equal(true);
    });
  });

  [false, true].forEach(anexoParecer => {
    it(`a proposição de documento novo não traz data (anexoParecer=${anexoParecer})`, async () => {
      const component = await novoComponente();
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.anexoParecer = anexoParecer;

      await component.inicializarEdicao(params);

      expect(component.getProposicao().dataUltimaModificacao).to.equal(undefined);
    });
  });

  it('no modo anexo de parecer a proposição traz a data escolhida e mantém local e autoria', async () => {
    const component = await novoComponente();
    const params = new LexmlEtaParametrosEdicao();
    params.sigla = 'PL';
    params.anexoParecer = true;
    await component.inicializarEdicao(params);

    campoData(component).data = '2026-04-24';
    const proposicao = component.getProposicao();

    expect(proposicao.dataUltimaModificacao).to.equal('2026-04-24');
    expect(proposicao.local).to.equal('Sala das sessões');
    expect(!!proposicao.autoria).to.equal(true);
  });

  it('mantém a data de uma proposição recebida da aplicação consumidora', async () => {
    const component = await novoComponente();
    const proposicao = new Proposicao();
    proposicao.sigla = 'PL';
    proposicao.numero = '1';
    proposicao.ano = '2026';
    proposicao.dataUltimaModificacao = '2026-03-10';
    const params = new LexmlEtaParametrosEdicao();
    params.proposicao = proposicao;

    await component.inicializarEdicao(params);
    await campoData(component).updateComplete;

    expect(campoData(component).data).to.equal('2026-03-10');
    expect(campoData(component).shadowRoot.querySelector('#no-date').checked).to.equal(false);
  });
});
