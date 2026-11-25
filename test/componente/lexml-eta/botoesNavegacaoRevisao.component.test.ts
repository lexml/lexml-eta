import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { rootStore } from '../../../src/redux/store';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

// #1097: os botões ficavam habilitados com o modo de revisão desligado, quando o clique não faz nada.
describe('ETA — botões de navegação entre dispositivos revisados', () => {
  let component: LexmlEtaComponent;

  const editor = (): any => component.querySelector('lexml-eta-proposicao-editor');
  const botoes = (): HTMLButtonElement[] => Array.from(editor().querySelectorAll('#lx-eta-barra-ferramenta .button-navegacao-marca'));
  const alternarRevisao = async (): Promise<void> => {
    rootStore.dispatch(ativarDesativarRevisaoAction.execute(0));
    await editor().updateComplete;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    await editor().aguardarCarregamentoDasLinhas();
    await editor().updateComplete;
  });

  afterEach(async () => {
    if (rootStore.getState().elementoReducer.emRevisao) await alternarRevisao();
    editor()?.cancelarTimerOnChangePendente?.();
  });

  it('ficam num agrupador com a chave "Marcas de revisão", logo antes dela', () => {
    const barra = editor().querySelector('#lx-eta-barra-ferramenta');
    const chave = editor().querySelector('lexml-eta-switch-revisao.revisao-container');
    const [proximo, anterior] = botoes();

    expect(chave.parentElement === barra, 'chave dentro de um agrupador').to.be.false;
    expect(proximo.parentElement === chave.parentElement, 'botões no agrupador da chave').to.be.true;
    expect(proximo.nextElementSibling === anterior && anterior.nextElementSibling === chave, 'ordem: próximo, anterior, chave').to.be.true;
  });

  it('os tooltips falam em dispositivo revisado', () => {
    expect(botoes().map(b => b.title)).to.deep.equal(['Ir para o próximo dispositivo revisado', 'Ir para o dispositivo revisado anterior']);
  });

  it('com o modo de revisão desligado, ficam desabilitados, em cinza e com a seta', () => {
    expect(rootStore.getState().elementoReducer.emRevisao, 'modo desligado').to.not.be.ok;
    botoes().forEach(b => {
      expect(b.disabled, `${b.title} desabilitado`).to.be.true;
      expect(getComputedStyle(b).cursor, `${b.title} cursor`).to.equal('default');
      expect(getComputedStyle(b).color, `${b.title} cor`).to.equal('rgb(185, 185, 185)');
    });
  });

  it('ligar o modo de revisão os habilita, e desligar volta a desabilitar', async () => {
    await alternarRevisao();
    expect(botoes().map(b => b.disabled)).to.deep.equal([false, false]);
    expect(botoes().map(b => getComputedStyle(b).cursor)).to.deep.equal(['pointer', 'pointer']);

    await alternarRevisao();
    expect(botoes().map(b => b.disabled)).to.deep.equal([true, true]);
  });
});
