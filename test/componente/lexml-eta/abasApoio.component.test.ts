import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';

const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';
const novaProposicaoDados = (anexoParecer: boolean): any => ({ urn: URN_PL, epigrafe: 'PROJETO DE LEI', preambulo: '', anexoParecer });

describe('ETA — abas de apoio e botões de telas estreitas', () => {
  let component: LexmlEtaComponent;

  const abasDaDireita = (): (string | null)[] => Array.from(component.querySelectorAll('#tabs-direita sl-tab')).map(aba => aba.getAttribute('panel'));
  const paineisDaDireita = (): (string | null)[] => Array.from(component.querySelectorAll('#tabs-direita sl-tab-panel')).map(painel => painel.getAttribute('name'));

  const abrir = async (anexoParecer: boolean): Promise<void> => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.novaProposicao(novaProposicaoDados(anexoParecer));
    await component.updateComplete;
  };

  afterEach(async () => {
    // Remover o componente antes de o sl-tab-group renderizar lança no ResizeObserver do Shoelace.
    await Promise.all(Array.from(component.querySelectorAll('sl-tab-group')).map((grupo: any) => grupo.updateComplete));
  });

  it('fora do anexo de parecer, o painel da direita tem só as abas Notas e Atalhos', async () => {
    await abrir(false);

    expect(abasDaDireita()).to.deep.equal(['notas', 'atalhos']);
    expect(paineisDaDireita()).to.deep.equal(['notas', 'atalhos']);
  });

  it('no anexo de parecer, o painel da direita tem só a aba Atalhos', async () => {
    await abrir(true);

    expect(abasDaDireita()).to.deep.equal(['atalhos']);
    expect(paineisDaDireita()).to.deep.equal(['atalhos']);
  });

  it('não há conteúdo de Comando nem de Dicas, e a barra de telas estreitas tem só o botão Atalhos', async () => {
    await abrir(false);

    expect(!!component.querySelector('lexml-eta-ajuda')).to.be.false;
    expect(!!component.querySelector('lexml-eta-ajuda-modal')).to.be.false;
    expect(!!component.querySelector('[panel="comando"], [panel="dicas"], [name="dicas"]')).to.be.false;
    expect(Array.from(component.querySelectorAll('.mobile-buttons .mobile-button')).map(botao => botao.getAttribute('title'))).to.deep.equal(['Atalhos']);
    expect('exibirAjuda' in component).to.be.false;
  });
});
