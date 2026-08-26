/* eslint-disable @typescript-eslint/no-unused-expressions */
import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig } from '../../../src';
import { Proposicao } from '../../../src/model/proposicao/proposicao';

describe('LexmlEtaComponent - anexo de parecer', () => {
  it('deveria ter anexoParecer desativado por padrão', () => {
    expect(new LexmlEtaConfig().anexoParecer).to.be.false;
  });

  it('não deveria devolver dados que não se aplicam ao anexo de parecer', () => {
    const component = new LexmlEtaComponent() as any;
    const proposicao = new Proposicao();
    proposicao.justificativa = '<p>Justificativa</p>';
    proposicao.justificativaAntesRevisao = '<p>Justificativa anterior</p>';
    proposicao.local = 'Sala da comissão';
    proposicao.autoria.parlamentares = [{ identificacao: '1' } as any];
    proposicao.notasRodape = [{ id: '1', numero: 1, texto: 'Nota' }];

    component.removerDadosNaoAplicaveisAoAnexoParecer(proposicao);

    expect(proposicao).not.to.have.property('justificativa');
    expect(proposicao).not.to.have.property('justificativaAntesRevisao');
    expect(proposicao).not.to.have.property('local');
    expect(proposicao).not.to.have.property('autoria');
    expect(proposicao).not.to.have.property('notasRodape');
    expect(proposicao).to.have.property('dataUltimaModificacao');
  });

  it('deveria ocultar justificação, notas, data e autoria no modo anexo de parecer', async () => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).anexoParecer = true;
    await elementUpdated(component);

    expect(component.querySelector('sl-tab[panel="justificativa"]')).to.be.null;
    expect(component.querySelector('sl-tab[panel="notas"]')).to.be.null;
    expect((component.querySelector('sl-tab-panel[name="justificativa"]') as HTMLElement).style.display).to.equal('none');
    expect(component.querySelector('sl-tab-panel[name="notas"]')).to.be.null;
    expect(component.querySelector('sl-tab[panel="autoria"]')?.textContent?.trim()).to.equal('Destino e Impressão');
    expect((component.querySelector('lexml-eta-data')?.parentElement as HTMLElement).style.display).to.equal('none');
    expect((component.querySelector('lexml-eta-autoria')?.parentElement as HTMLElement).style.display).to.equal('none');
    expect(component.querySelector('lexml-eta-destino')).not.to.be.null;
    expect(component.querySelector('lexml-eta-opcoes-impressao')).not.to.be.null;
  });

  it('deveria manter somente o painel de texto visível ao desativar o modo anexo de parecer', async () => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).anexoParecer = true;
    await elementUpdated(component);

    (component as any).anexoParecer = false;
    await elementUpdated(component);
    (component as any).sincronizarESelecionarAba((component as any)._tabsEsquerda, 'lexml-eta-proposicao');

    const painelTexto = component.querySelector('sl-tab-panel[name="lexml-eta-proposicao"]') as any;
    const painelJustificativa = component.querySelector('sl-tab-panel[name="justificativa"]') as any;
    await Promise.all([painelTexto.updateComplete, painelJustificativa.updateComplete]);

    expect(painelTexto.active).to.be.true;
    expect(painelTexto.style.display).to.equal('block');
    expect(painelJustificativa.active).to.be.false;
    expect(painelJustificativa.style.display).to.equal('none');
  });

  it('não deveria validar a ausência de justificação no modo anexo de parecer', () => {
    const component = new LexmlEtaComponent() as any;
    component.anexoParecer = true;
    component.lexmlEmendaConfig.justificacaoObrigatoria = true;

    const pendencias = component.getPendenciasPreenchimentoEmenda({ justificativa: '' });

    expect(pendencias).not.to.include('Não foi informado um texto de justificação.');
  });

  it('deveria montar o JSON sem os dados de apresentação e preservar destino, impressão e metadado de modificação', () => {
    const component = new LexmlEtaComponent() as any;
    const colegiadoApreciador = { tipoColegiado: 'Plenário', siglaCasaLegislativa: 'CN' };
    const opcoesImpressao = { imprimirBrasao: true, textoCabecalho: 'Cabeçalho', tamanhoFonte: 14 };

    component.anexoParecer = true;
    component.urn = 'urn:lex:br:federal:lei:2026-08-19;1';
    component.montarProposicaoPorUrn = (): Proposicao => new Proposicao();
    component.getEmentaFromProjetoNorma = (): string => '';
    component.getEpigrafe = (): any => ({ texto: '', complemento: '' });
    component.getRevisoes = (): any[] => [];

    Object.defineProperties(component, {
      _lexmlEta: { value: { getProjetoAtualizado: (): any => ({}), getAnexos: (): any[] => [] } },
      _lexmlData: { value: { data: '2026-08-19' } },
      _lexmlJustificativa: {
        value: { texto: '<p>Justificativa</p>', notasRodape: [{ id: '1', numero: 1, texto: 'Nota' }], textoAntesRevisao: '<p>Anterior</p>' },
      },
      _lexmlAutoria: { value: { getAutoriaAtualizada: (): any => ({ parlamentares: [{ identificacao: '1' }] }) } },
      _lexmlOpcoesImpressao: { value: { opcoesImpressao } },
      _lexmlDestino: { value: { colegiadoApreciador } },
    });

    const proposicao = component.getProposicao();

    expect(proposicao).not.to.have.property('justificativa');
    expect(proposicao).not.to.have.property('justificativaAntesRevisao');
    expect(proposicao).not.to.have.property('notasRodape');
    expect(proposicao).not.to.have.property('local');
    expect(proposicao).not.to.have.property('autoria');
    expect(proposicao.dataUltimaModificacao).not.to.equal('2026-08-19');
    expect(proposicao.colegiadoApreciador).to.equal(colegiadoApreciador);
    expect(proposicao.opcoesImpressao).to.equal(opcoesImpressao);
  });

  it('deveria abrir uma proposição sem os campos omitidos no modo anexo de parecer', async () => {
    const component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    const proposicao = new Proposicao() as any;
    delete proposicao.justificativa;
    delete proposicao.justificativaAntesRevisao;
    delete proposicao.notasRodape;
    delete proposicao.local;
    delete proposicao.autoria;
    (component as any).anexoParecer = true;

    expect(() => (component as any).setProposicao(proposicao)).not.to.throw();
    expect((component as any)._lexmlJustificativa.texto).to.equal('');
    expect((component as any)._lexmlData.data).to.equal('');
  });
});
