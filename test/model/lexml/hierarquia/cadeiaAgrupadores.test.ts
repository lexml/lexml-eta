import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { getCadeiaAgrupadores } from '../../../../src/model/lexml/hierarquia/cadeiaAgrupadores';

const agrupador = (pai: Dispositivo, tipo: string, rotulo: string, texto = ''): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  d.rotulo = rotulo;
  d.texto = texto;
  return d;
};

const rotulos = (cadeia: Dispositivo[]): string[] => cadeia.map(d => d.rotulo!);

describe('getCadeiaAgrupadores', () => {
  let articulacao: Articulacao;
  let artAntes: Artigo;
  let titulo1: Dispositivo;
  let cap2: Dispositivo;
  let secao1: Dispositivo;
  let artSecao: Artigo;

  beforeEach(() => {
    articulacao = createArticulacao();
    artAntes = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    titulo1 = agrupador(articulacao, TipoDispositivo.titulo.tipo, 'TÍTULO I', 'Das Disposições Preliminares');
    const cap1 = agrupador(titulo1, TipoDispositivo.capitulo.tipo, 'CAPÍTULO I', 'Do Objeto');
    criaDispositivo(cap1, TipoDispositivo.artigo.tipo);
    cap2 = agrupador(titulo1, TipoDispositivo.capitulo.tipo, 'CAPÍTULO II', 'Das Definições');
    secao1 = agrupador(cap2, TipoDispositivo.secao.tipo, 'Seção I', 'Dos Documentos');
    artSecao = criaDispositivo(secao1, TipoDispositivo.artigo.tipo) as Artigo;
  });

  it('artigo de seção recebe a cadeia do mais externo ao mais interno', () => {
    expect(rotulos(getCadeiaAgrupadores(artSecao))).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
  });

  it('agrupador termina a cadeia nele mesmo', () => {
    expect(rotulos(getCadeiaAgrupadores(cap2))).to.deep.equal(['TÍTULO I', 'CAPÍTULO II']);
  });

  it('inciso e parágrafo recebem a cadeia do artigo', () => {
    const inciso = criaDispositivo(artSecao.caput!, TipoDispositivo.inciso.tipo);
    const paragrafo = criaDispositivo(artSecao, TipoDispositivo.paragrafo.tipo);
    expect(rotulos(getCadeiaAgrupadores(inciso))).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
    expect(rotulos(getCadeiaAgrupadores(paragrafo))).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
  });

  it('artigo antes do primeiro agrupador tem cadeia vazia', () => {
    expect(getCadeiaAgrupadores(artAntes)).to.be.empty;
  });

  it('documento sem agrupadores tem cadeia vazia', () => {
    const semAgrupador = createArticulacao();
    const art = criaDispositivo(semAgrupador, TipoDispositivo.artigo.tipo) as Artigo;
    expect(getCadeiaAgrupadores(art)).to.be.empty;
    expect(getCadeiaAgrupadores(semAgrupador)).to.be.empty;
  });

  it('dispositivo indefinido tem cadeia vazia', () => {
    expect(getCadeiaAgrupadores(undefined)).to.be.empty;
    expect(getCadeiaAgrupadores(null)).to.be.empty;
  });

  it('bloco de alteração ignora os agrupadores da norma alterada e usa a cadeia do artigo hospedeiro', () => {
    createAlteracao(artSecao);
    const capCitado = agrupador(artSecao.alteracoes!, TipoDispositivo.capitulo.tipo, 'CAPÍTULO V-A', 'Da Norma Alterada');
    capCitado.isDispositivoAlteracao = true;
    const artCitado = criaDispositivo(capCitado, TipoDispositivo.artigo.tipo) as Artigo;
    artCitado.isDispositivoAlteracao = true;

    expect(rotulos(getCadeiaAgrupadores(artCitado))).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
    expect(rotulos(getCadeiaAgrupadores(capCitado))).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
  });
});
