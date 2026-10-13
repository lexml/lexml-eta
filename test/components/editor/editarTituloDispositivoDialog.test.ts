import { expect } from '@open-wc/testing';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import { editarTituloDispositivoDialog } from '../../../src/components/editor/editarTituloDispositivoDialog';
import PrivateQuill from '../../../src/internal/quill/private-quill';
import { Elemento } from '../../../src/model/elemento';
import { ATUALIZAR_TITULO_DISPOSITIVO } from '../../../src/model/lexml/acao/atualizarTituloDispositivoAction';

const NOME = 'o artigo';

describe('editarTituloDispositivoDialog', () => {
  let acoes: any[];
  let foco: number;
  const store = { dispatch: (a: any): void => void acoes.push(a) };
  const quillEditor = { blur: (): void => undefined, focus: (): number => ++foco };

  const abre = (tituloDispositivo?: string): any => {
    const elemento = { ...new Elemento(), uuid: 1, tipo: 'Artigo', tituloDispositivo } as Elemento;
    editarTituloDispositivoDialog(elemento, NOME, quillEditor, store);
    return elemento;
  };
  const dialog = (): any => document.body.querySelector('sl-dialog');
  const quillDoDialogo = (): any => (PrivateQuill as any).find(dialog().querySelector('.titulo-dispositivo-editor'));
  const botao = (i: number): any => dialog().querySelectorAll('sl-button')[i];
  const aviso = (): string => dialog().querySelector('.titulo-dispositivo-aviso').textContent;

  beforeEach(() => {
    acoes = [];
    foco = 0;
  });
  afterEach(() => document.body.querySelectorAll('sl-dialog').forEach(d => d.remove()));

  it('abre com o valor inicial e o rótulo de edição', () => {
    abre('Objeto');
    expect(dialog().label).to.equal('Editar título');
    expect(quillDoDialogo().root.textContent).to.equal('Objeto');
  });

  it('usa o rótulo de adição e não avisa antes de o usuário digitar', () => {
    abre(undefined);
    expect(dialog().label).to.equal('Adicionar título do dispositivo');
    expect(aviso()).to.equal('');
  });

  it('cancelar não despacha nada, devolve o foco e remove o diálogo', () => {
    abre('Objeto');
    quillDoDialogo().setText('Outro');
    botao(0).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    expect(foco).to.equal(1);
    expect(dialog()).to.be.null;
  });

  it('ok sem alteração não despacha nada', () => {
    abre('Objeto');
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    expect(dialog()).to.be.null;
  });

  it('ok com alteração despacha o título sanitizado (itálico como <i>)', () => {
    abre('Objeto');
    const q = quillDoDialogo();
    q.setText('');
    q.insertText(0, 'Novo', { italic: true });
    q.insertText(4, ' texto', { italic: false, script: 'sub' });
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(1);
    expect(acoes[0].type).to.equal(ATUALIZAR_TITULO_DISPOSITIVO);
    expect(acoes[0].remover).to.be.false;
    expect(acoes[0].tituloDispositivo).to.equal('<i>Novo</i><sub> texto</sub>');
  });

  it('ok fica desabilitado sem texto (adicionar e editar) e não despacha', () => {
    abre(undefined);
    expect(botao(1).disabled).to.be.true;
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    quillDoDialogo().setText('Novo');
    expect(botao(1).disabled).to.be.false;
    quillDoDialogo().setText('   ');
    expect(botao(1).disabled).to.be.true;
    dialog().remove();

    abre('Objeto');
    expect(botao(1).disabled).to.be.false;
    quillDoDialogo().setText('');
    expect(botao(1).disabled).to.be.true;
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    expect(dialog()).to.not.be.null;
  });

  it('remover só existe com título e despacha a remoção', () => {
    abre(undefined);
    expect(dialog().querySelector('.titulo-dispositivo-remover')).to.be.null;
    dialog().remove();
    abre('Objeto');
    const btn = dialog().querySelector('.titulo-dispositivo-remover');
    expect(btn.variant).to.equal('danger');
    btn.dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(1);
    expect(acoes[0].type).to.equal(ATUALIZAR_TITULO_DISPOSITIVO);
    expect(acoes[0].remover).to.be.true;
    expect(dialog()).to.be.null;
  });

  it('avisa título vazio e título iniciado em minúscula', () => {
    abre('Objeto');
    const q = quillDoDialogo();
    q.setText('');
    expect(aviso()).to.contain('Não foi informado um texto para o título do artigo');
    q.setText('objeto');
    expect(aviso()).to.contain('deveria iniciar com letra maiúscula');
    q.setText('Objeto');
    expect(aviso()).to.equal('');
  });
});
