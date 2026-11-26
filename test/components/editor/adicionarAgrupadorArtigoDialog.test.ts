import { aTimeout, expect } from '@open-wc/testing';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/radio/radio';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group';
import { adicionarAgrupadorArtigoDialog } from '../../../src/components/editor/adicionarAgrupadorArtigoDialog';
import { Elemento } from '../../../src/model/elemento';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';

describe('adicionarAgrupadorArtigoDialog', () => {
  let acoes: any[];
  const store = { dispatch: (a: any): void => void acoes.push(a) };
  const quillEditor = { blur: (): void => undefined, focus: (): void => undefined };

  const artigo = (): Elemento =>
    ({
      ...new Elemento(),
      uuid: 1,
      tipo: 'Artigo',
      agrupador: false,
      hierarquia: { pai: { tipo: 'Capitulo' } },
      tiposAgrupadoresQuePodemSerInseridosAntes: ['Capitulo', 'Secao'],
      tiposAgrupadoresQuePodemSerInseridosDepois: ['Capitulo', 'Secao'],
    } as any);

  const capitulo = (): Elemento =>
    ({
      ...new Elemento(),
      uuid: 2,
      tipo: 'Capitulo',
      agrupador: true,
      hierarquia: { pai: { tipo: 'Articulacao' } },
      tiposAgrupadoresQuePodemSerInseridosAntes: ['Capitulo', 'Titulo'],
      tiposAgrupadoresQuePodemSerInseridosDepois: ['Capitulo', 'Secao'],
    } as any);

  const dialog = (): any => document.body.querySelector('#slDialogAdicionarAgrupadorArtigo');
  const radios = (): any[] => Array.from(dialog().querySelectorAll('sl-radio'));
  const posicao = (valor: string): any => dialog().querySelector(`#posicao-${valor}`);
  const ok = (): any => dialog().querySelectorAll('sl-button')[1];

  // O tipo padrão é marcado por um clique agendado, e o aria-checked é atualizado na renderização dos rádios.
  const abre = async (elemento: Elemento): Promise<void> => {
    adicionarAgrupadorArtigoDialog(elemento, quillEditor, store);
    await aTimeout(0);
    await Promise.all(radios().map(r => r.updateComplete));
  };

  const escolhe = async (radio: any): Promise<void> => {
    radio.click();
    await Promise.all(radios().map(r => r.updateComplete));
  };

  beforeEach(() => {
    acoes = [];
  });
  afterEach(() => document.body.querySelectorAll('sl-dialog').forEach(d => d.remove()));

  describe('aberto a partir de artigo', () => {
    it('exibe o posicionamento com Antes e Depois habilitados e Antes marcado', async () => {
      await abre(artigo());
      expect(dialog().querySelector('#rdgPosicao').parentElement.style.display).to.not.equal('none');
      expect(posicao('antes').disabled).to.be.false;
      expect(posicao('depois').disabled).to.be.false;
      expect(posicao('antes').checked).to.be.true;
      expect(posicao('depois').checked).to.be.false;
    });

    it('ok sem mudar a posição despacha a inclusão antes do artigo', async () => {
      await abre(artigo());
      ok().dispatchEvent(new MouseEvent('click'));
      expect(acoes).to.have.length(1);
      expect(acoes[0].type).to.equal(ADICIONAR_AGRUPADOR_ARTIGO);
      expect(acoes[0].novo.tipo).to.equal('Capitulo');
      expect(acoes[0].novo.posicao).to.equal('antes');
    });

    it('ok com Depois marcado despacha a inclusão depois do artigo', async () => {
      await abre(artigo());
      await escolhe(posicao('depois'));
      expect(posicao('antes').checked).to.be.false;
      ok().dispatchEvent(new MouseEvent('click'));
      expect(acoes).to.have.length(1);
      expect(acoes[0].novo.posicao).to.equal('depois');
    });
  });

  describe('aberto a partir de agrupador', () => {
    it('mantém Depois marcado quando o tipo pode ser inserido nas duas posições', async () => {
      await abre(capitulo());
      expect(posicao('antes').disabled).to.be.false;
      expect(posicao('depois').disabled).to.be.false;
      expect(posicao('depois').checked).to.be.true;
      expect(posicao('antes').checked).to.be.false;
    });
  });
});
