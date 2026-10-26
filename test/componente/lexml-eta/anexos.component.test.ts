/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { AnexosComponent, LexmlEtaComponent, LexmlEtaConfig, LexmlEtaParametrosEdicao } from '../../../src';
import { Anexo, MimeType } from '../../../src/model/proposicao/proposicao';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TYPE_NAME_GRUPO = 'br_gov_lexml_lexedit__1.Anexos';
const TYPE_NAME_ITEM = 'br_gov_lexml_lexedit__1.Anexo';

const anexo = (idArquivo: string, nomeArquivo: string, tipo = 'nao.informado'): Anexo => ({
  idArquivo,
  nomeArquivo,
  nomeDocumento: nomeArquivo.replace(/\.[^.]*$/, ''),
  tipo,
  mimeType: nomeArquivo.endsWith('.docx') ? MimeType.DOCX : MimeType.PDF,
});

const comAnexos = (anexos: Anexo[]): any => {
  const documento = novoDocumentoArticulado();
  documento.value.metadado.metadadoProprietario = [
    metadadoProprietarioLexEdit({ anexos: { TYPE_NAME: TYPE_NAME_GRUPO, anexo: anexos.map(a => ({ TYPE_NAME: TYPE_NAME_ITEM, ...a })) } }),
  ];
  return documento;
};

const ANEXOS = [anexo('id-1', 'Parecer.pdf', 'substitutivo'), anexo('id-2', 'Emenda.docx')];

describe('ETA — aba e documento articulado com anexos', () => {
  let component: LexmlEtaComponent;
  let aba: AnexosComponent;

  const rotuloDaAba = (): string => component.querySelector('sl-tab[panel="anexos"]')!.textContent!.replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    aba = component.querySelector('lexml-eta-anexos')!;
  });

  describe('aba', () => {
    it('aparece imediatamente antes de "Avisos"', () => {
      const paineis = Array.from(component.querySelectorAll('#tabs-esquerda > sl-tab')).map(tab => tab.getAttribute('panel'));

      expect(paineis).to.deep.equal(['lexml-eta-proposicao', 'justificativa', 'autoria', 'anexos', 'avisos']);
      expect(component.querySelector('sl-tab-panel[name="anexos"] lexml-eta-anexos')).to.exist;
    });

    it('recebe a configuração do host', async () => {
      const config = Object.assign(new LexmlEtaConfig(), { tiposAnexos: [{ codigo: 'emenda', nome: 'Emenda' }] });

      component.lexmlEtaConfig = config;
      await component.updateComplete;

      expect(aba.lexmlEtaConfig).to.equal(config);
    });

    it('o rótulo não traz número sem anexos', () => {
      expect(rotuloDaAba()).to.equal('Anexos');
    });

    it('o rótulo traz o número de anexos do arquivo aberto', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));
      await component.updateComplete;

      expect(rotuloDaAba()).to.equal('Anexos (2)');
    });

    it('o rótulo acompanha as alterações feitas na aba', async () => {
      aba.anexos = ANEXOS;
      aba.dispatchEvent(new CustomEvent('onchange', { bubbles: true, composed: true, detail: { origemEvento: 'anexo' } }));
      await component.updateComplete;
      expect(rotuloDaAba()).to.equal('Anexos (2)');

      aba.anexos = [];
      aba.dispatchEvent(new CustomEvent('onchange', { bubbles: true, composed: true, detail: { origemEvento: 'anexo' } }));
      await component.updateComplete;
      expect(rotuloDaAba()).to.equal('Anexos');
    });

    it('também aparece no modo anexo de parecer', async () => {
      component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), { anexoParecer: true });
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());
      await component.updateComplete;

      expect(component.querySelector('sl-tab[panel="anexos"]')).to.exist;
      expect(component.querySelector('sl-tab[panel="justificativa"]')).to.be.null;
    });
  });

  describe('salvar', () => {
    it('grava os anexos da aba, na ordem', async () => {
      component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), { tiposAnexos: [{ codigo: 'substitutivo', nome: 'Substitutivo' }] });
      await component.updateComplete;
      aba.anexos = ANEXOS;

      const lexedit = lexeditSalvo(component.getDocumentoArticulado());

      expect(lexedit.anexos.anexo.map((a: any) => [a.idArquivo, a.nomeArquivo, a.tipo, a.mimeType])).to.deep.equal([
        ['id-1', 'Parecer.pdf', 'substitutivo', MimeType.PDF],
        ['id-2', 'Emenda.docx', 'nao.informado', MimeType.DOCX],
      ]);
    });

    it('sem anexos o grupo não é gravado', () => {
      expect(lexeditSalvo(component.getDocumentoArticulado())).not.to.have.property('anexos');
    });

    it('grava os anexos também no modo anexo de parecer', async () => {
      component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), { anexoParecer: true });
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());
      component.querySelector<AnexosComponent>('lexml-eta-anexos')!.anexos = [anexo('id-1', 'Parecer.pdf')];

      expect(lexeditSalvo(component.getDocumentoArticulado()).anexos.anexo).to.have.length(1);
    });

    it('grava o tipo desconhecido do host como "nao.informado"', () => {
      aba.anexos = [anexo('id-1', 'Parecer.pdf', 'tipo-que-o-host-nao-informou')];

      expect(lexeditSalvo(component.getDocumentoArticulado()).anexos.anexo[0].tipo).to.equal('nao.informado');
    });
  });

  describe('abrir', () => {
    it('exibe os anexos do arquivo, na ordem, com o tipo informado pelo host', async () => {
      component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), { tiposAnexos: [{ codigo: 'substitutivo', nome: 'Substitutivo' }] });
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));

      expect(aba.anexos).to.deep.equal(ANEXOS);
    });

    it('tipo que o host não informou é exibido como "nao.informado"', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));

      expect(aba.anexos.map(a => a.idArquivo)).to.deep.equal(['id-1', 'id-2']);
      expect(aba.anexos[0].tipo).to.equal('nao.informado');
    });

    it('arquivo sem o grupo abre sem anexos', async () => {
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(aba.anexos).to.deep.equal([]);
    });

    it('abrir um arquivo depois do outro substitui os anexos', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));
      expect(aba.anexos).to.have.length(2);

      await component.abrirDocumentoArticulado(comAnexos([anexo('id-3', 'Outro.pdf')]));
      expect(aba.anexos.map(a => a.idArquivo)).to.deep.equal(['id-3']);

      await component.abrirDocumentoArticulado(novoDocumentoArticulado());
      expect(aba.anexos).to.deep.equal([]);
      expect(rotuloDaAba()).to.equal('Anexos');
    });

    it('um documento novo começa sem anexos', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';

      await component.inicializarEdicao(params);

      expect(aba.anexos).to.deep.equal([]);
    });

    it('salvar o documento aberto gera os mesmos anexos', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));

      const salvo = component.getDocumentoArticulado();
      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
    });
  });

  describe('proposição', () => {
    it('getProposicao entrega os anexos da aba', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));

      expect(component.getProposicao().anexos.map(a => a.idArquivo)).to.deep.equal(['id-1', 'id-2']);
    });

    it('inicializar com uma proposição restaura os anexos na aba', async () => {
      await component.abrirDocumentoArticulado(comAnexos(ANEXOS));
      const proposicao = component.getProposicao();
      const params = new LexmlEtaParametrosEdicao();
      params.proposicao = proposicao;
      params.projetoNorma = proposicao.projetoNorma;

      await component.inicializarEdicao(params);

      expect(aba.anexos.map(a => a.idArquivo)).to.deep.equal(['id-1', 'id-2']);
    });
  });
});
