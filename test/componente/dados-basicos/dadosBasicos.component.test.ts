import { expect, fixture, html } from '@open-wc/testing';
import { DadosBasicosComponent, EVENTO_ALTERAR_DADOS_BASICOS } from '../../../src/components/dados-basicos/dados-basicos.component';

const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;999999';

describe('DadosBasicosComponent', () => {
  const no = (el: DadosBasicosComponent, id: string): Element | null | undefined => el.shadowRoot?.querySelector(id);
  const texto = (el: DadosBasicosComponent, id: string): string => (no(el, id)?.textContent ?? '').replace(/\s+/g, ' ').trim();

  it('não exibe nada sem URN', async () => {
    const el = await fixture<DadosBasicosComponent>(html`<lexml-eta-dados-basicos></lexml-eta-dados-basicos>`);
    expect(!!no(el, '#dados-basicos')).to.be.false;
  });

  it('exibe o grupo com legenda, descrição recebida, ano, colegiado e forma de apresentação', async () => {
    const el = await fixture<DadosBasicosComponent>(
      html`<lexml-eta-dados-basicos .urn=${URN_PL} .descricao=${'Projeto de Lei (PL)'} .colegiadoApreciador=${{ tipoColegiado: 'Comissão' }}></lexml-eta-dados-basicos>`
    );
    expect(texto(el, 'legend')).to.equal('Dados básicos');
    expect(texto(el, '#dados-basicos-descricao')).to.equal('Projeto de Lei (PL)');
    expect(texto(el, '#dados-basicos-ano')).to.contain('2026');
    expect(texto(el, '#dados-basicos-colegiado')).to.contain('Comissão');
    expect(texto(el, '#dados-basicos-parecer')).to.contain('Não');
  });

  it('no anexo de parecer, o colegiado não se aplica', async () => {
    const el = await fixture<DadosBasicosComponent>(
      html`<lexml-eta-dados-basicos .urn=${URN_PL} .anexoParecer=${true} .colegiadoApreciador=${{ tipoColegiado: 'Plenário' }}></lexml-eta-dados-basicos>`
    );
    expect(texto(el, '#dados-basicos-colegiado')).to.contain('Não se aplica');
    expect(texto(el, '#dados-basicos-parecer')).to.contain('Sim');
  });

  it('o clique emite o evento interno, que não borbulha', async () => {
    const pai = await fixture<HTMLDivElement>(html`<div><lexml-eta-dados-basicos .urn=${URN_PL}></lexml-eta-dados-basicos></div>`);
    const el = pai.querySelector('lexml-eta-dados-basicos')!;
    let noElemento = 0;
    let noPai = 0;
    el.addEventListener(EVENTO_ALTERAR_DADOS_BASICOS, () => noElemento++);
    pai.addEventListener(EVENTO_ALTERAR_DADOS_BASICOS, () => noPai++);
    (no(el, '#botao-alterar-dados-basicos') as HTMLElement).dispatchEvent(new MouseEvent('click'));
    expect(noElemento).to.equal(1);
    expect(noPai).to.equal(0);
  });

  it('com motivo de bloqueio, desabilita o botão, exibe o aviso e não emite o evento', async () => {
    const el = await fixture<DadosBasicosComponent>(html`<lexml-eta-dados-basicos .urn=${URN_PL} .motivoBloqueio=${'Bloqueado.'}></lexml-eta-dados-basicos>`);
    let emitidos = 0;
    el.addEventListener(EVENTO_ALTERAR_DADOS_BASICOS, () => emitidos++);
    const botao = no(el, '#botao-alterar-dados-basicos') as any;
    expect(botao.disabled).to.be.true;
    expect(texto(el, '#dados-basicos-aviso')).to.equal('Bloqueado.');
    botao.dispatchEvent(new MouseEvent('click'));
    expect(emitidos).to.equal(0);
  });
});
