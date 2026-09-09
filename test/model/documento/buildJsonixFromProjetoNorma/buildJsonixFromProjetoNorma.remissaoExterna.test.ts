import { expect } from '@open-wc/testing';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';

// Cobertura de gap da Fase 5 (docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md §8.5): a serialização
// de remissão externa (data-urn → nó Remissao) nunca tinha teste dedicado — só a interna (data-lexml-ref,
// seção 15 deste diretório) e o caminho inverso, de carregamento (test/model/documento/fluxoAbertura.test.ts).

describe('Serialização de remissão externa', () => {
  describe('16.1. Detecção e tag Remissao a partir de data-urn', () => {
    it('deve serializar link com data-urn como Remissao', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto =
        'Nos termos do <a data-urn="urn:lex:br:federal:lei:1990-07-13;8069" data-fragmento="art5" class="lexml-remissao-externa" href="#" target="_self">art. 5º da Lei nº 8.069, de 13 de julho de 1990</a>.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[1];

      expect(remissao.name.localPart).to.equal('Remissao');
    });

    it('href deve ser a URN concatenada com o fragmento via "!"', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a data-urn="urn:lex:br:federal:lei:1990-07-13;8069" data-fragmento="art5" class="lexml-remissao-externa" href="#" target="_self">art. 5º</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.value.href).to.equal('urn:lex:br:federal:lei:1990-07-13;8069!art5');
    });

    it('sem data-fragmento, href deve ser só a URN (sem "!")', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a data-urn="urn:lex:br:federal:lei:1990-07-13;8069" class="lexml-remissao-externa" href="#" target="_self">Lei nº 8.069</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.value.href).to.equal('urn:lex:br:federal:lei:1990-07-13;8069');
    });

    it('deve preservar o texto visível do link (textoRef da detecção automática)', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      const textoRef = 'art. 5º da Lei nº 8.069, de 13 de julho de 1990';
      (caput as any).texto = `<a data-urn="urn:lex:br:federal:lei:1990-07-13;8069" data-fragmento="art5" class="lexml-remissao-externa" href="#" target="_self">${textoRef}</a>`;

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.value.content[0]).to.equal(textoRef);
    });
  });

  describe('16.2. Resíduo de span do Parchment sem <a> (RemissaoExternaBlot.format não limpava os atributos antes do unwrap)', () => {
    it('não deve vazar <span data-ref-id> literal no conteúdo salvo (bug real, docs/fixtures/erro-salvar-remissao-externa.json)', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto =
        'Na <span data-ref-id="ref_1787238281540_511n628bc"><span data-ref-id="ref_1787238292055_34nzbelww">lei 14.133 de 2021</span></span> já passou a valer.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const conteudo: string = caputNode.value.p[0].content[0];

      expect(conteudo).to.not.include('<span');
      expect(conteudo).to.not.include('data-ref-id');
      expect(conteudo).to.equal('Na lei 14.133 de 2021 já passou a valer.');
    });
  });
});
