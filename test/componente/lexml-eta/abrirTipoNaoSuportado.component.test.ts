import { expect, fixture, html } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { PENDENCIA_DOCUMENTO_NAO_SUPORTADO } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { rootStore } from '../../../src/redux/store';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN_MPV = 'urn:lex:br:federal:medida.provisoria:2026-01-01;1';
const URN_PLS = 'urn:lex:br:senado.federal:projeto.lei;pls:2020;1';
const URN_REFERENCIADA = 'urn:lex:br:senado.federal:projeto.lei;pl:2025;7';

const parlamentar = { identificacao: '1', nome: 'Fulano', sexo: 'M', siglaPartido: 'XX', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: '' };
const autoria = {
  TYPE_NAME: 'br_gov_lexml_lexedit__1.Autoria',
  tipo: 'Parlamentar',
  imprimirPartidoUF: true,
  parlamentares: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentares', parlamentar: [parlamentar] },
};
const colegiado = { TYPE_NAME: 'br_gov_lexml_lexedit__1.ColegiadoApreciador', siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CAE' };

const entrada = (urn: string, grupos: Record<string, unknown> = {}): any => {
  const doc = novoDocumentoArticulado();
  doc.value.metadado.identificacao.urn = urn;
  doc.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ autoria, colegiadoApreciador: colegiado, ...grupos })];
  return doc;
};

describe('LexmlEtaComponent — abrir documento: modo, referência e tipo não suportado', () => {
  let component: LexmlEtaComponent;
  const campo = (seletor: string): any => component.querySelector(seletor);
  const oculto = (seletor: string): boolean => campo(seletor).hasAttribute('hidden');
  const alertas = (): any[] => rootStore.getState().elementoReducer.ui?.alertas ?? [];

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
  });

  it('aplica o anexo de parecer e a URN referenciada do arquivo', async () => {
    await component.abrirDocumentoArticulado(entrada(URN_PLS, { anexoParecer: true, urnDocumentoReferenciado: URN_REFERENCIADA }));

    const salvo = lexeditSalvo(component.getDocumentoArticulado());
    expect(salvo.anexoParecer).to.equal(true);
    expect(salvo.urnDocumentoReferenciado).to.equal(URN_REFERENCIADA);
  });

  it('valores ausentes assumem o modo normal e nenhum documento referenciado', async () => {
    await component.abrirDocumentoArticulado(entrada(URN_PLS, { anexoParecer: true, urnDocumentoReferenciado: URN_REFERENCIADA }));
    await component.abrirDocumentoArticulado(entrada(URN_PLS));

    const salvo = lexeditSalvo(component.getDocumentoArticulado());
    expect(salvo.anexoParecer).to.equal(false);
    expect(salvo).not.to.have.property('urnDocumentoReferenciado');
  });

  it('proposição inativa (PLS) abre com destino e autoria', async () => {
    await component.abrirDocumentoArticulado(entrada(URN_PLS));

    expect(oculto('lexml-eta-destino')).to.be.false;
    expect(oculto('lexml-eta-autoria')).to.be.false;
    expect(alertas().some(a => a.mensagem === PENDENCIA_DOCUMENTO_NAO_SUPORTADO)).to.be.false;
    expect(campo('lexml-eta-destino').colegiadoApreciador.siglaComissao).to.equal('CAE');
  });

  describe('tipo não suportado', () => {
    [
      ['medida provisória', URN_MPV],
      ['norma de autoridade com casa', 'urn:lex:br:senado.federal:resolucao:2026;1'],
    ].forEach(([nome, urn]) => {
      it(`${nome}: oculta destino e autoria e exibe o erro na aba de avisos`, async () => {
        await component.abrirDocumentoArticulado(entrada(urn));

        expect(oculto('lexml-eta-destino')).to.be.true;
        expect(oculto('lexml-eta-autoria')).to.be.true;
        const erro = alertas().find(a => a.mensagem === PENDENCIA_DOCUMENTO_NAO_SUPORTADO);
        expect(erro?.tipo).to.equal('ERROR');
      });
    });

    it('ignora destino e autoria do arquivo e salva ambos vazios, com a pendência', async () => {
      await component.abrirDocumentoArticulado(entrada(URN_MPV));

      const salvo = lexeditSalvo(component.getDocumentoArticulado());
      expect(salvo).not.to.have.property('colegiadoApreciador');
      expect(salvo).not.to.have.property('autoria');
      expect(salvo.pendencias.pendencia).to.include(PENDENCIA_DOCUMENTO_NAO_SUPORTADO);
    });

    it('o erro não impede a edição do texto nem o salvamento', async () => {
      await component.abrirDocumentoArticulado(entrada(URN_MPV));

      expect(() => component.getDocumentoArticulado()).not.to.throw();
      expect(rootStore.getState().elementoReducer.articulacao).to.exist;
    });

    it('abrir depois uma proposição suportada restaura os formulários e remove o erro', async () => {
      await component.abrirDocumentoArticulado(entrada(URN_MPV));
      await component.abrirDocumentoArticulado(entrada(URN_PLS));

      expect(oculto('lexml-eta-destino')).to.be.false;
      expect(alertas().some(a => a.mensagem === PENDENCIA_DOCUMENTO_NAO_SUPORTADO)).to.be.false;
      expect(lexeditSalvo(component.getDocumentoArticulado())).to.have.property('colegiadoApreciador');
    });
  });

  it('documento da casa oposta continua recusado, com o erro fatal, sem alterar o documento', async () => {
    await component.abrirDocumentoArticulado(entrada(URN_PLS));
    let fatal = false;
    component.addEventListener('fatalError', () => (fatal = true));

    let erro: Error | undefined;
    await component.abrirDocumentoArticulado(entrada('urn:lex:br:camara.deputados:projeto.lei;pl:2026;1')).catch(e => (erro = e));

    expect(!!erro).to.be.true;
    expect(fatal).to.be.true;
    expect(component.getDocumentoArticulado().value.metadado.identificacao.urn).to.equal(URN_PLS);
  });
});
