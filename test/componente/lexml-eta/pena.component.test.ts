import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionarPenaAction, alterarRotuloPenaAction } from '../../../src/model/lexml/acao/penaAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { redoAction } from '../../../src/model/lexml/acao/redoAction';
import { UndoAction } from '../../../src/model/lexml/acao/undoAction';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const pena = (id: string, rotulo: string, texto: string): any => ({
  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
  id,
  rotulo,
  p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] }],
});

// Art. 1º com pena no caput e parágrafo único sem pena.
const documentoComPena = (): any => {
  const documento = novoDocumentoArticulado();
  const artigo = documento.value.projetoNorma.norma.articulacao.lXhier[0];
  artigo.value.lXcontainersOmissis[0].value.pena = pena('art1_cpt_pena', 'Pena -', 'reclusão, de seis a vinte anos.');
  return documento;
};

const tiposDasLinhas = (component: LexmlEtaComponent): (string | undefined)[] =>
  Array.from(component.querySelectorAll('[class*="elemento-tipo-"]')).map(linha => /elemento-tipo-(\w+)/.exec(linha.className)?.[1]);

const rotulosDasPenas = (component: LexmlEtaComponent): string[] => Array.from(component.querySelectorAll('.texto__rotulo--pena')).map(r => (r.textContent ?? '').trim());

const aguarda = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50));

describe('ETA — pena no editor', () => {
  let component: LexmlEtaComponent;
  let editor: any;

  const dispositivo = (id: string): any => buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, id);

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComPena());
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
  });

  afterEach(() => document.body.querySelectorAll('sl-dialog').forEach(d => d.remove()));

  it('exibe a pena do caput em linha própria, depois do artigo e antes do parágrafo', () => {
    const tipos = tiposDasLinhas(component);
    const indice = tipos.indexOf('artigo');
    expect(tipos.slice(indice, indice + 3)).to.deep.equal(['artigo', 'pena', 'paragrafo']);
  });

  it('exibe o rótulo com o separador normalizado e o texto da pena', () => {
    expect(rotulosDasPenas(component)).to.deep.equal(['Pena –']);
    expect((component.querySelector('.elemento-tipo-pena')?.textContent ?? '').includes('reclusão, de seis a vinte anos.')).to.be.true;
  });

  it('adicionar pena ao parágrafo cria a linha depois dele e usa o rótulo da primeira pena', async () => {
    rootStore.dispatch(adicionarPenaAction.execute(createElemento(dispositivo('art1_par1u'))));
    await aguarda();
    const tipos = tiposDasLinhas(component);
    const indice = tipos.indexOf('paragrafo');
    expect(tipos.slice(indice, indice + 2)).to.deep.equal(['paragrafo', 'pena']);
    expect(rotulosDasPenas(component)).to.deep.equal(['Pena –', 'Pena –']);
  });

  it('depois de adicionar, a linha corrente passa a ser a da nova pena', async () => {
    rootStore.dispatch(adicionarPenaAction.execute(createElemento(dispositivo('art1_par1u'))));
    await aguarda();
    expect(editor.quill.linhaAtual?.tipo).to.equal('Pena');
    expect(editor.quill.linhaAtual?.lexmlId).to.equal('art1_par1u_pena');
  });

  it('alterar o rótulo atualiza a linha', async () => {
    rootStore.dispatch(alterarRotuloPenaAction.execute(createElemento(dispositivo('art1_cpt_pena')), 'Infração'));
    await aguarda();
    expect(rotulosDasPenas(component)).to.deep.equal(['Infração –']);
  });

  it('clicar no rótulo da pena abre o modal de rótulo; no de outro dispositivo, não', async () => {
    (component.querySelector('.texto__rotulo--pena') as HTMLElement).click();
    await aguarda();
    const dialog = document.body.querySelector('sl-dialog') as any;
    expect(!!dialog && dialog.label === 'Alterar rótulo').to.be.true;
    dialog.remove();

    (component.querySelector('.texto__rotulo--paragrafo') as HTMLElement).click();
    await aguarda();
    expect(!!document.body.querySelector('sl-dialog')).to.be.false;
  });

  it('o menu da linha da pena não oferece mover, transformar nem renumerar', () => {
    const acoes = dispositivo('art1_cpt_pena')
      .getAcoesPossiveis(dispositivo('art1_cpt_pena'))
      .map((a: any) => a.descricao);
    expect(acoes).to.deep.equal(['Alterar rótulo', 'Remover']);
  });
});

const dispositivoJson = (tipo: string, id: string, rotulo: string, texto: string): any => ({
  name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: tipo },
  value: { TYPE_NAME: 'br_gov_lexml__1.DispositivoType', id, rotulo, p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] }] },
});

// Art. 1º com dois incisos no caput e dois parágrafos, sem pena.
const documentoComIncisosEParagrafos = (): any => {
  const documento = novoDocumentoArticulado();
  const artigo = documento.value.projetoNorma.norma.articulacao.lXhier[0];
  const caput = artigo.value.lXcontainersOmissis[0];
  caput.value.p[0].content = ['Matar alguém:'];
  caput.value.lXcontainersOmissis = [dispositivoJson('Inciso', 'art1_cpt_inc1', 'I –', 'aqui é um inciso;'), dispositivoJson('Inciso', 'art1_cpt_inc2', 'II –', 'outro inciso:')];
  artigo.value.lXcontainersOmissis = [caput, dispositivoJson('Paragrafo', 'art1_par1', '§ 1º', 'Teste.'), dispositivoJson('Paragrafo', 'art1_par2', '§ 2º', 'Mais um teste.')];
  return documento;
};

describe('ETA — pena do caput em artigo com incisos e parágrafos', () => {
  let component: LexmlEtaComponent;
  let editor: any;
  const esperado = ['artigo', 'inciso', 'inciso', 'pena', 'paragrafo', 'paragrafo'];
  const linhasDoArtigo = (): (string | undefined)[] => {
    const tipos = tiposDasLinhas(component);
    return tipos.slice(tipos.indexOf('artigo'), tipos.indexOf('artigo') + esperado.length);
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComIncisosEParagrafos());
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
  });

  it('adicionar pela linha do artigo põe a pena depois do inciso II e antes do § 1º, também ao desfazer e refazer', async () => {
    const artigo = buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, 'art1')!;
    rootStore.dispatch(adicionarPenaAction.execute(createElemento(artigo)));
    await aguarda();
    expect(linhasDoArtigo()).to.deep.equal(esperado);
    expect(buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, 'art1_cpt_pena')?.pai?.tipo).to.equal('Caput');

    rootStore.dispatch(UndoAction());
    await aguarda();
    expect(linhasDoArtigo().filter(t => t === 'pena').length).to.equal(0);

    rootStore.dispatch(redoAction());
    await aguarda();
    expect(linhasDoArtigo()).to.deep.equal(esperado);
  });
});
