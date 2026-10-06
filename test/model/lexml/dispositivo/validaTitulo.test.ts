import { expect } from '@open-wc/testing';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo, validaTitulo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { TipoMensagem } from '../../../../src/model/lexml/util/mensagem';

const criaComTitulo = (tipo: string, titulo?: string): any => {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  const d = tipo === TipoDispositivo.artigo.tipo ? artigo : criaDispositivo(artigo, tipo);
  d.tituloDispositivo = titulo;
  return d;
};

describe('validaTitulo', () => {
  it('não valida dispositivo sem título', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo))).to.be.empty;
  });

  it('não gera mensagem para título válido', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, 'Plano de Carreira'))).to.be.empty;
  });

  it('avisa título vazio no artigo', () => {
    const mensagens = validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, ''));
    expect(mensagens).to.have.length(1);
    expect(mensagens[0].tipo).to.equal(TipoMensagem.WARNING);
    expect(mensagens[0].descricao).to.equal('Não foi informado um texto para o título do artigo.');
  });

  it('considera vazio o título só com espaços, tags e nbsp', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, ' <i> </i>&nbsp;'))[0].descricao).to.equal('Não foi informado um texto para o título do artigo.');
  });

  it('concorda o artigo definido com o tipo do dispositivo', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.alinea.tipo, ''))[0].descricao).to.equal('Não foi informado um texto para o título da alínea.');
    expect(validaTitulo(criaComTitulo(TipoDispositivo.paragrafo.tipo, ''))[0].descricao).to.equal('Não foi informado um texto para o título do parágrafo.');
    expect(validaTitulo(criaComTitulo(TipoDispositivo.inciso.tipo, ''))[0].descricao).to.equal('Não foi informado um texto para o título do inciso.');
  });

  it('avisa título iniciado em minúscula', () => {
    const mensagens = validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, 'plano de carreira'));
    expect(mensagens).to.have.length(1);
    expect(mensagens[0].tipo).to.equal(TipoMensagem.WARNING);
    expect(mensagens[0].descricao).to.equal('O título do artigo deveria iniciar com letra maiúscula.');
  });

  it('ignora tags e espaços iniciais ao verificar a maiúscula', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, '  <i>Plano</i> de carreira'))).to.be.empty;
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, '<i>plano</i> de carreira'))).to.have.length(1);
  });

  it('aceita letra maiúscula acentuada e início numérico ou com aspas', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, 'Ética pública'))).to.be.empty;
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, '2023: plano'))).to.be.empty;
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, '“Plano” especial'))).to.be.empty;
  });

  it('avisa minúscula acentuada', () => {
    expect(validaTitulo(criaComTitulo(TipoDispositivo.artigo.tipo, 'área de atuação'))).to.have.length(1);
  });

  it('é incluída em validaDispositivo sem bloquear', () => {
    const d = criaComTitulo(TipoDispositivo.artigo.tipo, 'plano');
    const mensagens = validaDispositivo(d);
    expect(mensagens.some(m => m.descricao === 'O título do artigo deveria iniciar com letra maiúscula.' && m.tipo === TipoMensagem.WARNING)).to.be.true;
  });
});
