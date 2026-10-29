import { expect } from '@open-wc/testing';
import 'quill/dist/quill';
import { configurePrivateQuill } from '../../../src/internal/quill/configure-private-quill';
import { Elemento } from '../../../src/model/elemento';
import { EtaContainerTable } from '../../../src/util/eta-quill/eta-container-table';
import { EtaQuill } from '../../../src/util/eta-quill/eta-quill';
import { EtaQuillUtil } from '../../../src/util/eta-quill/eta-quill-util';

const criaElemento = (fechaAspas: boolean): Elemento => ({
  ...new Elemento(),
  uuid: 1,
  tipo: 'Pena',
  rotulo: 'Pena –',
  conteudo: { texto: 'reclusão.' },
  dispositivoAlteracao: true,
  fechaAspas,
  notaAlteracao: fechaAspas ? 'NR' : undefined,
  podeEditarNotaAlteracao: fechaAspas,
});

describe('EtaContainerTable - aspas e nota de alteração', () => {
  let editorHtml: HTMLElement;
  let bufferHtml: HTMLElement;
  let quill: EtaQuill;
  let linha: EtaContainerTable;

  const criaLinha = (elemento: Elemento): void => {
    linha = EtaQuillUtil.criarContainerLinha(elemento);
    linha.insertInto(quill.scroll);
  };
  const aspasVisiveis = (): boolean => !!linha.domNode.querySelector('.fecha-aspas[exibir]');
  const notaVisivel = (): string | null | undefined => linha.domNode.querySelector('.nota-alteracao[exibir]')?.getAttribute('nota-alteracao');

  beforeEach(() => {
    configurePrivateQuill();
    editorHtml = document.createElement('div');
    bufferHtml = document.createElement('div');
    document.body.append(editorHtml, bufferHtml);
    quill = new EtaQuill(editorHtml, bufferHtml, {});
  });

  afterEach(() => {
    editorHtml.remove();
    bufferHtml.remove();
  });

  it('linha criada com aspas as exibe e as esconde quando deixa de ser a última', () => {
    criaLinha(criaElemento(true));
    expect(aspasVisiveis()).to.equal(true);
    expect(notaVisivel()).to.equal('NR');
    linha.atualizarElemento(criaElemento(false));
    expect(aspasVisiveis()).to.equal(false);
    expect(notaVisivel() ?? null).to.equal(null);
  });

  it('linha criada sem aspas passa a exibi-las quando se torna a última, sem duplicar os blots', () => {
    criaLinha(criaElemento(false));
    expect(aspasVisiveis()).to.equal(false);
    linha.atualizarElemento(criaElemento(true));
    expect(aspasVisiveis()).to.equal(true);
    expect(notaVisivel()).to.equal('NR');
    linha.atualizarElemento(criaElemento(true));
    expect(linha.domNode.querySelectorAll('.fecha-aspas').length).to.equal(1);
    expect(linha.domNode.querySelectorAll('.nota-alteracao').length).to.equal(1);
  });
});
