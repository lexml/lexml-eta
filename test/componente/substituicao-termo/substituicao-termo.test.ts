import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { SubstituicaoTermoComponent } from '../../../src';
import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { SubstituicaoTermo } from '../../../src/model/emenda/emenda';

const urn = 'urn:lex:br:federal:medida.provisoria:2019-11-11;905';
let substituicaoTermoComponent: SubstituicaoTermoComponent;

describe('Testando lexml-substituicao-termo (EditorTextoRicoComponent)', () => {
  beforeEach(async function () {
    substituicaoTermoComponent = await fixture<SubstituicaoTermoComponent>(html`<lexml-substituicao-termo></lexml-substituicao-termo>`);
  });

  it('Deveria exibir o componente', () => {
    expect(substituicaoTermoComponent).to.not.be.null;
    expect(substituicaoTermoComponent).to.not.be.undefined;
    expect(substituicaoTermoComponent).to.be.an.instanceOf(SubstituicaoTermoComponent);
  });

  describe('Testando mudança no tipo de termo a ser substituído', () => {
    it('Selecionando tipo "Expressão"', async () => {
      const el = substituicaoTermoComponent.elTipoSubstituicaoTermo?.querySelector('sl-radio[value="Expressão"]') as any;
      el.click();
      const ev = await oneEvent(el, 'sl-change');
      expect(ev).to.be.exist;
      expect(el.checked).to.be.true;
      expect(substituicaoTermoComponent.elTipoSubstituicaoTermo.querySelectorAll('sl-radio:not([checked])').length).to.be.equal(2);

      const st = substituicaoTermoComponent.getSubstituicaoTermo();
      expect(st.tipo).to.be.equal('Expressão');

      const ce = substituicaoTermoComponent.getComandoEmenda(urn);
      expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se na Medida Provisória a expressão “(termo a ser substituído)” por “(novo termo)”.');
    });

    it('Selecionando tipo "Palavra"', async () => {
      const el = substituicaoTermoComponent.elTipoSubstituicaoTermo?.querySelector('sl-radio[value="Palavra"]') as any;
      el.click();
      const ev = await oneEvent(el, 'sl-change');
      expect(ev).to.be.exist;
      expect(el.checked).to.be.true;
      expect(substituicaoTermoComponent.elTipoSubstituicaoTermo.querySelectorAll('sl-radio:not([checked])').length).to.be.equal(2);

      const st = substituicaoTermoComponent.getSubstituicaoTermo();
      expect(st.tipo).to.be.equal('Palavra');

      const ce = substituicaoTermoComponent.getComandoEmenda(urn);
      expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se na Medida Provisória a palavra “(termo a ser substituído)” por “(novo termo)”.');
    });

    it('Selecionando tipo "Número"', async () => {
      const el = substituicaoTermoComponent.elTipoSubstituicaoTermo?.querySelector('sl-radio[value="Número"]') as any;
      el.click();
      const ev = await oneEvent(el, 'sl-change');
      expect(ev).to.be.exist;
      expect(el.checked).to.be.true;
      expect(substituicaoTermoComponent.elTipoSubstituicaoTermo.querySelectorAll('sl-radio:not([checked])').length).to.be.equal(2);

      const st = substituicaoTermoComponent.getSubstituicaoTermo();
      expect(st.tipo).to.be.equal('Número');

      const ce = substituicaoTermoComponent.getComandoEmenda(urn);
      expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se na Medida Provisória o número “(termo a ser substituído)” por “(novo termo)”.');
    });
  });

  describe('Testando inicialização do componente', () => {
    beforeEach(function () {
      substituicaoTermoComponent.setSubstituicaoTermo({
        tipo: 'Palavra',
        termo: 'teste',
        novoTermo: 'avaliação',
        flexaoGenero: true,
        flexaoNumero: true,
      });
    });

    it('Deveria retornar o comando de emenda atualizado', async () => {
      const ev = await oneEvent(substituicaoTermoComponent, 'onchange');
      expect(ev).to.be.exist;
      const ce = substituicaoTermoComponent.getComandoEmenda(urn);
      expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se na Medida Provisória a palavra “teste” por “avaliação”, fazendo-se as flexões de gênero e número necessárias.');
    });

    it('Deveria possuir os elementos com dados atualizados', async () => {
      const ev = await oneEvent(substituicaoTermoComponent, 'onchange');
      expect(ev).to.be.exist;

      const elTipoSubstituicaoTermoSelecionado = substituicaoTermoComponent.elTipoSubstituicaoTermo?.querySelector('sl-radio[checked]') as any;
      expect(elTipoSubstituicaoTermoSelecionado).to.be.exist;
      expect(elTipoSubstituicaoTermoSelecionado.value).to.be.equal('Palavra');

      expect(substituicaoTermoComponent.elTermoASerSubstituido.value).to.be.equal('teste');
      expect(substituicaoTermoComponent.elNovoTermo.value).to.be.equal('avaliação');
      expect(substituicaoTermoComponent.elFlexaoGenero.checked).to.be.true;
      expect(substituicaoTermoComponent.elFlexaoNumero.checked).to.be.true;
    });
  });

  describe('Testando eventos do componente', () => {
    it('Deveria emitir evento "onchange" ao alterar o tipo de termo a ser substituído', async () => {
      const el = substituicaoTermoComponent.elTipoSubstituicaoTermo?.querySelector('sl-radio[value="Palavra"]') as any;
      el.click();
      const ev = await oneEvent(substituicaoTermoComponent.elTipoSubstituicaoTermo, 'sl-change');
      expect(ev).to.be.exist;
    });

    it('Deveria emitir evento "input" ao alterar o termo a ser substituído', async () => {
      substituicaoTermoComponent.elTermoASerSubstituido.value = 'teste';
      substituicaoTermoComponent.elTermoASerSubstituido.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      const ev = await oneEvent(substituicaoTermoComponent, 'onchange');
      expect(ev).to.be.exist;
    });

    it('Deveria emitir evento "input" ao alterar o novo termo', async () => {
      substituicaoTermoComponent.elNovoTermo.value = 'avaliação';
      substituicaoTermoComponent.elNovoTermo.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      const ev = await oneEvent(substituicaoTermoComponent, 'onchange');
      expect(ev).to.be.exist;
    });

    it('Deveria emitir evento "input" ao alterar a flexão de gênero', async () => {
      substituicaoTermoComponent.elFlexaoGenero.checked = true;
      substituicaoTermoComponent.elFlexaoGenero.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      const ev = await oneEvent(substituicaoTermoComponent, 'onchange');
      expect(ev).to.be.exist;
    });

    it('Deveria emitir evento "input" ao alterar a flexão de número', async () => {
      substituicaoTermoComponent.elFlexaoNumero.checked = true;
      substituicaoTermoComponent.elFlexaoNumero.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      const ev = await oneEvent(substituicaoTermoComponent, 'onchange');
      expect(ev).to.be.exist;
    });
  });
});

describe('Testando variações do comando da emenda para emenda de substituição de termo', () => {
  it('Deveria gerar comando da emenda para um PL *', () => {
    const st: SubstituicaoTermo = {
      tipo: 'Palavra',
      termo: 'teste',
      novoTermo: 'avaliação',
      flexaoGenero: true,
      flexaoNumero: true,
    };
    const ce = new ComandoEmendaBuilder('urn:lex:br:senado.federal:projeto.lei;pl:2018;142', st).getComandoEmenda();
    expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se no Projeto a palavra “teste” por “avaliação”, fazendo-se as flexões de gênero e número necessárias.');
  });

  it('Deveria gerar comando da emenda para um PL **', () => {
    const st: SubstituicaoTermo = {
      tipo: 'Palavra',
      termo: 'teste',
      novoTermo: 'avaliação',
      flexaoGenero: true,
      flexaoNumero: false,
    };
    const ce = new ComandoEmendaBuilder('urn:lex:br:senado.federal:projeto.lei;pl:2018;142', st).getComandoEmenda();
    expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se no Projeto a palavra “teste” por “avaliação”, fazendo-se as flexões de gênero necessárias.');
  });

  it('Deveria gerar comando da emenda para um PL ***', () => {
    const st: SubstituicaoTermo = {
      tipo: 'Palavra',
      termo: 'teste',
      novoTermo: 'avaliação',
      flexaoGenero: false,
      flexaoNumero: false,
    };
    const ce = new ComandoEmendaBuilder('urn:lex:br:senado.federal:projeto.lei;pl:2018;142', st).getComandoEmenda();
    expect(ce.comandos[0].cabecalho).to.be.equal('Substitua-se no Projeto a palavra “teste” por “avaliação”.');
  });
});
