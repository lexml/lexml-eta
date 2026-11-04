import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { congelarRelogio, DATA_ULTIMA_MODIFICACAO_CONGELADA, metadadoProprietarioLexEdit, novoDocumentoArticulado, restaurarRelogio } from '../../doc/documentoArticulado';

const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';
const novaProposicaoDados = (anexoParecer: boolean): any => ({ urn: URN_PL, epigrafe: 'PROJETO DE LEI', preambulo: '', anexoParecer });

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

      await component.novaProposicao(novaProposicaoDados(anexoParecer));
      await campoData(component).updateComplete;

      expect(campoData(component).data).to.equal('');
      expect(campoData(component).shadowRoot.querySelector('#no-date').checked).to.equal(true);
    });
  });

  [false, true].forEach(anexoParecer => {
    it(`a proposição de documento novo não traz data (anexoParecer=${anexoParecer})`, async () => {
      const component = await novoComponente();

      await component.novaProposicao(novaProposicaoDados(anexoParecer));

      expect(component.getProposicao().data).to.equal('');
    });
  });

  it('no modo anexo de parecer a proposição traz a data escolhida e mantém local e autoria', async () => {
    const component = await novoComponente();
    await component.novaProposicao(novaProposicaoDados(true));

    campoData(component).data = '2026-04-24';
    const proposicao = component.getProposicao();

    expect(proposicao.data).to.equal('2026-04-24');
    expect(proposicao.local).to.equal('Sala das Sessões');
    expect(!!proposicao.autoria).to.equal(true);
  });

  describe('datas da proposição obtida', () => {
    afterEach(restaurarRelogio);

    it('sem documento iniciado, traz data vazia e o instante da obtenção', async () => {
      const component = await novoComponente();
      congelarRelogio();

      const proposicao = component.getProposicao();

      expect(proposicao.data).to.equal('');
      expect(proposicao.dataUltimaModificacao).to.equal(DATA_ULTIMA_MODIFICACAO_CONGELADA);
    });

    it('com data informada, traz o instante da obtenção em dataUltimaModificacao e a data em data', async () => {
      const component = await novoComponente();
      await component.novaProposicao(novaProposicaoDados(false));
      campoData(component).data = '2026-04-24';
      congelarRelogio();

      const proposicao = component.getProposicao();

      expect(proposicao.data).to.equal('2026-04-24');
      expect(proposicao.dataUltimaModificacao).to.equal(DATA_ULTIMA_MODIFICACAO_CONGELADA);
    });

    it('com documento aberto, traz a data do fecho e o instante da obtenção, e não a data lida do arquivo', async () => {
      const component = await novoComponente();
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ data: '2026-04-24', dataUltimaModificacao: '2026-05-12T10:15:00-03:00' })];
      await component.abrirDocumentoArticulado(entrada);
      congelarRelogio();

      const proposicao = component.getProposicao();

      expect(proposicao.data).to.equal('2026-04-24');
      expect(proposicao.dataUltimaModificacao).to.equal(DATA_ULTIMA_MODIFICACAO_CONGELADA);
      // Remover o componente antes de o sl-tab-group renderizar lança no ResizeObserver do Shoelace.
      await (component.querySelector('sl-tab-group') as any).updateComplete;
    });
  });
});
