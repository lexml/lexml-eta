import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

// Preâmbulo do modelo e os Arts. 1º a 3º, só com caput.
const documentoComArtigos = (): any => {
  const documento = novoDocumentoArticulado();
  const articulacao = documento.value.projetoNorma.norma.articulacao;
  const modelo = JSON.stringify(articulacao.lXhier[0]);
  articulacao.lXhier = [1, 2, 3].map(n => {
    const artigo = JSON.parse(modelo.split('art1').join(`art${n}`));
    artigo.value.rotulo = `Art. ${n}º`;
    artigo.value.lXcontainersOmissis = artigo.value.lXcontainersOmissis.slice(0, 1);
    artigo.value.lXcontainersOmissis[0].value.p[0].content = [`Texto do artigo ${n}.`];
    return artigo;
  });
  return documento;
};

// #1074: excluir o Art. 1º deixava o cursor no preâmbulo, que não é editável.
describe('ETA — cursor depois de excluir um dispositivo', () => {
  let quill: any;
  const artigos: any[] = [];

  const inicio = (linha: any): number => quill.getIndex(linha.blotConteudo);
  const aguarda = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50));
  const remover = async (id: string): Promise<void> => {
    const dispositivo = buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, id);
    rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo!), undefined));
    await aguarda();
  };

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComArtigos());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await aguarda();
    quill = editor.quill;
    artigos.length = 0;
    for (let linha = quill.linhaAtual; linha; linha = linha.next) {
      if (linha.tipo === 'Artigo') artigos.push(linha);
    }
  });

  it('o documento tem preâmbulo logo antes do Art. 1º', () => {
    expect(artigos.length).to.equal(3);
    expect(artigos[0].prev.tipo).to.equal('Preambulo');
  });

  it('excluir o Art. 1º leva o cursor ao início do texto do novo Art. 1º', async () => {
    quill.setSelection(inicio(artigos[0]), 0, 'user');
    await aguarda();
    await remover('art1');

    expect(quill.linhaAtual === artigos[1], 'linha atual é o novo Art. 1º').to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(artigos[1]));
  });

  it('excluir o Art. 2º leva o cursor ao início do texto do Art. 1º', async () => {
    quill.setSelection(inicio(artigos[1]), 0, 'user');
    await aguarda();
    await remover('art2');

    expect(quill.linhaAtual === artigos[0], 'linha atual é o Art. 1º').to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(artigos[0]));
  });
});
