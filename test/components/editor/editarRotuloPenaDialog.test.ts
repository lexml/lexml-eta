import { expect } from '@open-wc/testing';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/radio/radio';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group';
import { editarRotuloPenaDialog } from '../../../src/components/editor/editarRotuloPenaDialog';
import { Elemento } from '../../../src/model/elemento';
import { ADICIONAR_PENA, ALTERAR_ROTULO_PENA } from '../../../src/model/lexml/acao/penaAction';

describe('editarRotuloPenaDialog', () => {
  let acoes: any[];
  let foco: number;
  const store = { dispatch: (a: any): void => void acoes.push(a) };
  const quillEditor = { blur: (): void => undefined, focus: (): number => ++foco };

  const abre = (rotulo = 'Pena –', adicionando = false): void => {
    const elemento = { ...new Elemento(), uuid: 1, tipo: 'Pena', rotulo } as Elemento;
    editarRotuloPenaDialog(elemento, quillEditor, store, adicionando);
  };
  const dialog = (): any => document.body.querySelector('sl-dialog');
  const radios = (): any[] => Array.from(dialog().querySelectorAll('sl-radio'));
  const radio = (valor: string): any => radios().find(r => r.value === valor);
  const campo = (): any => dialog().querySelector('.rotulo-pena-outro');
  const botao = (i: number): any => dialog().querySelectorAll('sl-button')[i];
  const escolhe = (valor: string): void => radio(valor).dispatchEvent(new MouseEvent('click'));
  const digita = (texto: string): void => {
    campo().value = texto;
    campo().dispatchEvent(new CustomEvent('sl-input'));
  };
  const marcadas = (): string[] =>
    radios()
      .filter(r => r.checked)
      .map(r => r.value);

  beforeEach(() => {
    acoes = [];
    foco = 0;
  });
  afterEach(() => document.body.querySelectorAll('sl-dialog').forEach(d => d.remove()));

  it('oferece as quatro opções e Outro', () => {
    abre();
    expect(radios().map(r => r.value)).to.deep.equal(['Pena', 'Penalidade', 'Medida Administrativa', 'Infração', 'Outro']);
  });

  it('abre com a opção do rótulo atual, sem diferenciar maiúsculas', () => {
    abre('PENALIDADE –');
    expect(dialog().label).to.equal('Alterar rótulo');
    expect(marcadas()).to.deep.equal(['Penalidade']);
    expect(campo().disabled).to.be.true;
  });

  it('abre com Outro e o texto atual quando o rótulo não está na lista', () => {
    abre('Sanção –');
    expect(marcadas()).to.deep.equal(['Outro']);
    expect(campo().value).to.equal('Sanção');
    expect(campo().disabled).to.be.false;
    expect(botao(1).disabled).to.be.false;
  });

  it('ao adicionar, abre com Pena selecionada', () => {
    abre('', true);
    expect(dialog().label).to.equal('Adicionar pena, medida administrativa e outros');
    expect(marcadas()).to.deep.equal(['Pena']);
  });

  it('ok fica desabilitado com Outro vazio e não despacha', () => {
    abre();
    escolhe('Outro');
    expect(botao(1).disabled).to.be.true;
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    digita('   ');
    expect(botao(1).disabled).to.be.true;
    digita('Sanção');
    expect(botao(1).disabled).to.be.false;
    escolhe('Infração');
    expect(botao(1).disabled).to.be.false;
  });

  it('ok com outra opção despacha a alteração e fecha', () => {
    abre();
    escolhe('Medida Administrativa');
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(1);
    expect(acoes[0].type).to.equal(ALTERAR_ROTULO_PENA);
    expect(acoes[0].rotulo).to.equal('Medida Administrativa');
    expect(dialog()).to.be.null;
  });

  it('ok com Outro despacha o texto informado', () => {
    abre();
    escolhe('Outro');
    digita('  Sanção ');
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes[0].rotulo).to.equal('Sanção');
  });

  it('confirmar a opção que já é o rótulo atual não despacha nada', () => {
    abre('Infração –');
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    expect(dialog()).to.be.null;
  });

  it('ao adicionar, ok despacha a criação com o rótulo escolhido', () => {
    abre('', true);
    escolhe('Infração');
    botao(1).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(1);
    expect(acoes[0].type).to.equal(ADICIONAR_PENA);
    expect(acoes[0].rotulo).to.equal('Infração');
  });

  it('cancelar não despacha nada, devolve o foco e remove o diálogo', () => {
    abre();
    escolhe('Infração');
    botao(0).dispatchEvent(new MouseEvent('click'));
    expect(acoes).to.have.length(0);
    expect(foco).to.equal(1);
    expect(dialog()).to.be.null;
  });
});
