import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';
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

describe('LexmlEtaComponent - documento de outra casa', () => {
  afterEach(() => inicializarVocabulario('SF'));

  const criar = async (casa: string): Promise<LexmlEtaComponent> => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    component.lexmlEtaConfig = configDaCasa(casa);
    (component as any).getParlamentares = async (): Promise<[]> => [];
    return component;
  };

  const dadosNova = (urn: string): any => ({ urn, epigrafe: 'PROJETO DE LEI', preambulo: '' });

  it('SF: recusa a URN da Câmara sem alterar o documento em edição', async () => {
    const component = await criar('SF');
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    const projetoNorma = (component as any).projetoNorma;
    const antes = component.getDocumentoArticulado();
    const erroOriginal = console.error;
    console.error = (): void => undefined;
    let mensagem = '';
    try {
      await component.novaProposicao(dadosNova('urn:lex:br:camara.deputados:projeto.lei;pl:2026;1'));
    } catch (e) {
      mensagem = (e as Error).message;
    } finally {
      console.error = erroOriginal;
    }
    expect(mensagem).to.equal("Documento de outra casa legislativa não é suportado neste editor (autoridade 'camara.deputados').");
    expect((component as any).projetoNorma).to.equal(projetoNorma);
    expect(component.getDocumentoArticulado()).to.deep.equal(antes);
  });

  it('CD: recusa a abertura de arquivo do Senado', async () => {
    const component = await criar('CD');
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.identificacao.urn = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';
    let mensagem = '';
    try {
      await component.abrirDocumentoArticulado(entrada);
    } catch (e) {
      mensagem = (e as Error).message;
    }
    expect(mensagem).to.match(/Documento de outra casa legislativa não é suportado/);
  });

  ['urn:lex:br:federal:medida.provisoria;mpv:2026;1', 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;1'].forEach(urn => {
    it(`CD: abre normalmente o arquivo com ${urn}`, async () => {
      const component = await criar('CD');
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.identificacao.urn = urn;
      await component.abrirDocumentoArticulado(entrada);
      expect((component as any).urn).to.equal(urn);
    });
  });

  it('CD: nova proposição com URN da Câmara', async () => {
    const component = await criar('CD');
    await component.novaProposicao(dadosNova('urn:lex:br:camara.deputados:projeto.lei;pl:2026;1'));
    expect((component as any).urn).to.match(/^urn:lex:br:camara\.deputados:projeto\.lei;pl:/);
  });
});
