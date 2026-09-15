import { expect, fixture } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaParametrosEdicao } from '../../../src';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral, TEXTO_LITERAL } from '../../doc/documentoArticulado';

describe('ETA — salvar e abrir documento articulado', () => {
  let component: LexmlEtaComponent;
  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
  });

  it('abre e exporta a identificação e o conteúdo do arquivo', () => {
    const documento = component.getDocumentoArticulado();
    expect(documento.name.localPart).to.equal('LexML');
    expect(documento.value.metadado.identificacao.urn).to.include(':9999;999999');
    expect(documento.value.projetoNorma.norma.parteInicial.preambulo.p.length).to.equal(2);
  });

  it('preserva aspas e caracteres literais sem interpretá-los como HTML', async () => {
    await component.abrirDocumentoArticulado(novoDocumentoComTextoLiteral());
    const salvo = component.getDocumentoArticulado();
    const norma = salvo.value.projetoNorma.norma;
    expect(norma.parteInicial.epigrafe.content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.parteInicial.ementa.content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.parteInicial.preambulo.p[0].content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content).to.deep.equal([TEXTO_LITERAL]);
    await component.abrirDocumentoArticulado(salvo);
    expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
  });
  it('uma entrada inválida não substitui o documento aberto', async () => {
    const antes = component.getDocumentoArticulado();
    let rejeitou = false;
    try {
      await component.abrirDocumentoArticulado('{');
    } catch {
      rejeitou = true;
    }
    expect(rejeitou).to.equal(true);
    expect(component.getDocumentoArticulado()).to.deep.equal(antes);
  });

  it('sincroniza a edição pendente antes de obter os dados do arquivo', () => {
    const editor = component.querySelector('lexml-eta-proposicao-editor') as any;
    const flush = editor.flushEdicaoPendente;
    editor.flushEdicaoPendente = (): void => {
      rootStore.getState().elementoReducer.articulacao.filhos[0].texto = 'Última edição ainda na linha.';
    };
    try {
      const salvo = component.getDocumentoArticulado();
      expect(salvo.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content).to.deep.equal(['Última edição ainda na linha.']);
    } finally {
      editor.flushEdicaoPendente = flush;
    }
  });

  it('iniciar um novo documento não reutiliza o anterior nem altera o modelo padrão', async () => {
    const antes = JSON.stringify(DOCUMENTO_PADRAO);
    const params = new LexmlEtaParametrosEdicao();
    params.sigla = 'PL';
    await component.inicializarEdicao(params);
    const novo = component.getDocumentoArticulado();
    expect(novo.value.metadado.identificacao.urn).to.include(':9999;999999');
    expect(novo.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis).to.have.length(1);
    expect(JSON.stringify(DOCUMENTO_PADRAO)).to.equal(antes);
  });

  it('preserva a autoridade e o evento da URN recebida', async () => {
    const entrada = novoDocumentoArticulado();
    const urn = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;123@data.evento;leitura;2026-03-19t14.00';
    entrada.value.metadado.identificacao.urn = urn;
    await component.abrirDocumentoArticulado(entrada);
    expect(component.getDocumentoArticulado().value.metadado.identificacao.urn).to.equal(urn);
  });
});
