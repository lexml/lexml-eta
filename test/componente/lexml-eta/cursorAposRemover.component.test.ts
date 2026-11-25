import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionarArtigoDepois } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ativarDesativarRevisaoAction } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { removerElementoSemTextoAction } from '../../../src/model/lexml/acao/removerElementoSemTextoAction';
import { UndoAction } from '../../../src/model/lexml/acao/undoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { Usuario } from '../../../src/model/revisao/usuario';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

type Opcoes = { art2SemTexto?: boolean; art2ComParagrafo?: boolean };

// Preâmbulo do modelo e os Arts. 1º a 3º, só com caput (o Art. 2º pode ficar sem texto ou com parágrafo).
const documentoComArtigos = ({ art2SemTexto = false, art2ComParagrafo = false }: Opcoes = {}): any => {
  const documento = novoDocumentoArticulado();
  const articulacao = documento.value.projetoNorma.norma.articulacao;
  const modelo = JSON.stringify(articulacao.lXhier[0]);
  articulacao.lXhier = [1, 2, 3].map(n => {
    const artigo = JSON.parse(modelo.split('art1').join(`art${n}`));
    artigo.value.rotulo = `Art. ${n}º`;
    if (n !== 2 || !art2ComParagrafo) artigo.value.lXcontainersOmissis = artigo.value.lXcontainersOmissis.slice(0, 1);
    artigo.value.lXcontainersOmissis[0].value.p[0].content = n === 2 && art2SemTexto ? [] : [`Texto do artigo ${n}.`];
    return artigo;
  });
  return documento;
};

// #1074: excluir o Art. 1º deixava o cursor no preâmbulo, que não é editável.
// #1075: o cursor vai para o dispositivo que toma o lugar do excluído; só sobe sem linha editável abaixo.
describe('ETA — cursor depois de excluir um dispositivo', () => {
  let component: LexmlEtaComponent;
  let quill: any;
  const artigos: any[] = [];

  const inicio = (linha: any): number => quill.getIndex(linha.blotConteudo);
  const aguarda = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50));
  const dispositivo = (id: string): any => buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, id);
  const remover = async (id: string): Promise<void> => {
    rootStore.dispatch(removerElementoAction.execute(createElemento(dispositivo(id)), undefined));
    await aguarda();
  };
  const removerSemTexto = async (id: string, key: string): Promise<void> => {
    rootStore.dispatch(removerElementoSemTextoAction.execute(createElemento(dispositivo(id)), key));
    await aguarda();
  };
  const posicionar = async (linha: any): Promise<void> => {
    quill.setSelection(inicio(linha), 0, 'user');
    await aguarda();
  };
  const cursorNoInicioDe = (linha: any, descricao: string): void => {
    expect(quill.linhaAtual === linha, `linha atual é ${descricao}`).to.be.true;
    expect(quill.getSelection().index).to.equal(inicio(linha));
  };

  const abrir = async (opcoes?: Opcoes): Promise<void> => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(documentoComArtigos(opcoes));
    component.setUsuario(new Usuario('Fulano de Tal', 'sf:fulano', 'FT'));
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await aguarda();
    quill = editor.quill;
    artigos.length = 0;
    for (let linha = quill.linhaAtual; linha; linha = linha.next) {
      if (linha.tipo === 'Artigo') artigos.push(linha);
    }
  };

  afterEach(() => {
    (component?.querySelector('lexml-eta-proposicao-editor') as any)?.cancelarTimerOnChangePendente?.();
    rootStore.getState().elementoReducer.emRevisao && rootStore.dispatch(ativarDesativarRevisaoAction.execute());
  });

  describe('com os Arts. 1º a 3º', () => {
    beforeEach(() => abrir());

    it('o documento tem preâmbulo logo antes do Art. 1º', () => {
      expect(artigos.length).to.equal(3);
      expect(artigos[0].prev.tipo).to.equal('Preambulo');
    });

    it('excluir o Art. 1º leva o cursor ao início do texto do novo Art. 1º', async () => {
      await posicionar(artigos[0]);
      await remover('art1');
      cursorNoInicioDe(artigos[1], 'o novo Art. 1º');
    });

    it('excluir o Art. 2º leva o cursor ao início do texto do novo Art. 2º', async () => {
      await posicionar(artigos[1]);
      await remover('art2');
      cursorNoInicioDe(artigos[2], 'o novo Art. 2º');
    });

    it('excluir o Art. 3º, o último, leva o cursor ao início do texto do Art. 2º', async () => {
      await posicionar(artigos[2]);
      await remover('art3');
      cursorNoInicioDe(artigos[1], 'o Art. 2º');
    });

    describe('em modo de revisão', () => {
      const menuDaLinha = (linha: any): string[] => Array.from(linha.domNode.querySelectorAll('sl-menu-item')).map((item: any) => item.textContent.trim());
      const linhasAtivas = (): Element[] => Array.from(component.querySelectorAll('.container__elemento--ativo'));

      beforeEach(async () => {
        rootStore.dispatch(ativarDesativarRevisaoAction.execute());
        await aguarda();
      });

      it('excluir o Art. 2º mantém a linha e deixa o cursor nela', async () => {
        await posicionar(artigos[1]);
        await remover('art2');
        expect(artigos[1].domNode.isConnected, 'a linha do Art. 2º continua na tela').to.be.true;
        cursorNoInicioDe(artigos[1], 'o Art. 2º excluído');
      });

      it('a linha excluída é a única marcada como linha atual', async () => {
        await posicionar(artigos[1]);
        await remover('art2');
        expect(linhasAtivas()).to.deep.equal([artigos[1].domNode]);
      });

      it('excluir o Art. 3º, o último, mantém a linha e deixa o cursor nela', async () => {
        await posicionar(artigos[2]);
        await remover('art3');
        expect(artigos[2].domNode.isConnected, 'a linha do Art. 3º continua na tela').to.be.true;
        cursorNoInicioDe(artigos[2], 'o Art. 3º excluído');
        expect(linhasAtivas()).to.deep.equal([artigos[2].domNode]);
      });

      it('o menu da linha excluída oferece aceitar e recusar a revisão', async () => {
        await posicionar(artigos[1]);
        await remover('art2');
        const itens = menuDaLinha(artigos[1]);
        expect(itens).to.include('Aceitar revisão');
        expect(itens).to.include('Rejeitar revisão');
      });

      it('excluir um artigo adicionado na própria revisão tira a linha e leva o cursor ao seguinte', async () => {
        await posicionar(artigos[1]);
        rootStore.dispatch(adicionarArtigoDepois.execute(createElemento(dispositivo('art2')), ''));
        await aguarda();
        const linhaNova = quill.linhaAtual;
        expect(linhaNova === artigos[1], 'cursor no artigo incluído').to.be.false;

        await remover('art3');

        expect(linhaNova.domNode.isConnected, 'a linha do artigo adicionado saiu da tela').to.be.false;
        cursorNoInicioDe(artigos[2], 'o Art. 3º original');
      });
    });

    it('desfazer a inclusão de um artigo leva o cursor ao artigo anterior, como antes', async () => {
      await posicionar(artigos[0]);
      rootStore.dispatch(adicionarArtigoDepois.execute(createElemento(dispositivo('art1')), ''));
      await aguarda();
      expect(quill.linhaAtual === artigos[0], 'cursor no artigo incluído').to.be.false;
      rootStore.dispatch(UndoAction());
      await aguarda();
      cursorNoInicioDe(artigos[0], 'o Art. 1º');
    });
  });

  describe('com o Art. 2º sem texto', () => {
    beforeEach(() => abrir({ art2SemTexto: true }));

    it('Delete no Art. 2º vazio leva o cursor ao início do texto do novo Art. 2º', async () => {
      await posicionar(artigos[1]);
      await removerSemTexto('art2', 'Delete');
      cursorNoInicioDe(artigos[2], 'o novo Art. 2º');
    });

    it('Backspace no Art. 2º vazio leva o cursor ao fim do texto do Art. 1º', async () => {
      await posicionar(artigos[1]);
      await removerSemTexto('art2', 'Backspace');
      expect(quill.linhaAtual === artigos[0], 'linha atual é o Art. 1º').to.be.true;
      expect(quill.getSelection().index).to.equal(inicio(artigos[0]) + artigos[0].blotConteudo.length() - 1);
    });

    it('em revisão, Delete no Art. 2º vazio mantém a linha excluída e deixa o cursor nela', async () => {
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      await aguarda();
      await posicionar(artigos[1]);
      await removerSemTexto('art2', 'Delete');
      expect(artigos[1].domNode.isConnected, 'a linha do Art. 2º continua na tela').to.be.true;
      cursorNoInicioDe(artigos[1], 'o Art. 2º excluído');
    });
  });

  describe('com parágrafo no Art. 2º', () => {
    beforeEach(() => abrir({ art2ComParagrafo: true }));

    it('excluir o Art. 2º leva o cursor ao início do texto do novo Art. 2º', async () => {
      expect(artigos[1].next.tipo).to.equal('Paragrafo');
      await posicionar(artigos[1]);
      await remover('art2');
      cursorNoInicioDe(artigos[2], 'o novo Art. 2º');
    });

    it('em revisão, excluir o Art. 2º mantém as linhas do artigo e do parágrafo e deixa o cursor no artigo', async () => {
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
      await aguarda();
      const paragrafo = artigos[1].next;
      await posicionar(artigos[1]);
      await remover('art2');
      expect(artigos[1].domNode.isConnected, 'a linha do Art. 2º continua na tela').to.be.true;
      expect(paragrafo.domNode.isConnected, 'a linha do parágrafo continua na tela').to.be.true;
      cursorNoInicioDe(artigos[1], 'o Art. 2º excluído');
    });
  });
});
