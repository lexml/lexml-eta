import { expect } from '@open-wc/testing';
import { Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { atualizarReferenciaElementoAction } from '../../../../src/model/lexml/acao/atualizarReferenciaElementoAction';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../../src/redux/state';

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

const linkRemissao = (refId: string, urn: string, texto: string): string =>
  `<a class="lexml-remissao-externa" href="#" target="_self" data-ref-id="${refId}" data-urn="${urn}">${texto}</a>`;

let artigo: Artigo;
let state: State;

const criaEstado = (texto: string, remissoes: { refId: string; urn: string }[]): void => {
  const articulacao = createArticulacao();
  artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  createAlteracao(artigo);
  criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!);
  artigo.texto = texto;

  state = {
    articulacao,
    past: [],
    present: [],
    future: [],
    ui: { events: [] },
    remissoesExternas: Object.fromEntries(remissoes.map(r => [r.refId, { refId: r.refId, targetUrn: r.urn, targetNomeNorma: '', sourceUuid: artigo.uuid }])),
  } as any;
};

const informaNorma = (urn: string): void => {
  const elemento = createElemento(artigo, true);
  elemento.norma = urn;
  state = elementoReducer(state, atualizarReferenciaElementoAction.execute(elemento));
};

describe('atualizaReferenciaElemento ("Corrigir agora" do alerta de norma não informada)', () => {
  describe('artigo que já tem remissão externa', () => {
    beforeEach(() => {
      criaEstado(`A ${linkRemissao('r1', URN_LEI_14133, 'Lei nº 14.133, de 1º de abril de 2021')}, passa a vigorar com as seguintes alterações:`, [
        { refId: 'r1', urn: URN_LEI_14133 },
      ]);
    });

    it('define a norma alterada', () => {
      informaNorma(URN_LEI_14133);

      expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
    });

    it('mantém a remissão externa no texto, com seus atributos', () => {
      informaNorma(URN_LEI_14133);

      expect(artigo.texto).to.contain('class="lexml-remissao-externa"');
      expect(artigo.texto).to.contain('data-ref-id="r1"');
      expect(artigo.texto).to.contain(`data-urn="${URN_LEI_14133}"`);
    });

    it('não deixa o registro de remissões externas órfão do texto', () => {
      informaNorma(URN_LEI_14133);

      const refIdsNoTexto = [...artigo.texto.matchAll(/data-ref-id="([^"]+)"/g)].map(m => m[1]);
      expect(Object.keys(state.remissoesExternas!)).to.have.members(refIdsNoTexto);
    });
  });

  describe('artigo com duas remissões externas', () => {
    beforeEach(() => {
      criaEstado(`A ${linkRemissao('r1', URN_LEI_14133, 'Lei nº 14.133')} e a ${linkRemissao('r2', URN_LEI_8666, 'Lei nº 8.666')} passam a vigorar com as seguintes alterações:`, [
        { refId: 'r1', urn: URN_LEI_14133 },
        { refId: 'r2', urn: URN_LEI_8666 },
      ]);
    });

    it('define a norma escolhida e preserva as duas remissões', () => {
      informaNorma(URN_LEI_8666);

      expect(artigo.alteracoes!.base).to.equal(URN_LEI_8666);
      expect(artigo.texto).to.contain('data-ref-id="r1"');
      expect(artigo.texto).to.contain('data-ref-id="r2"');
    });
  });

  describe('comportamentos que não mudam', () => {
    it('gera a frase de alteração quando o artigo está sem texto', () => {
      criaEstado('', []);

      informaNorma(URN_LEI_14133);

      expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
      expect(artigo.texto).to.contain(`<a href="${URN_LEI_14133}">`);
      expect(artigo.texto).to.contain('passa a vigorar com as seguintes alterações:');
    });

    it('troca o link comum da norma anterior pelo da nova norma', () => {
      criaEstado(`A <a href="${URN_LEI_8666}">Lei nº 8.666, de 21 de junho de 1993</a>, passa a vigorar com as seguintes alterações:`, []);
      artigo.alteracoes!.base = URN_LEI_8666;

      informaNorma(URN_LEI_14133);

      expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
      expect(artigo.texto).to.contain(`href="${URN_LEI_14133}"`);
      expect(artigo.texto).not.to.contain(URN_LEI_8666);
    });
  });
});
