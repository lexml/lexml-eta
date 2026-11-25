import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { atualizarUsuarioAction } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { adicionarArtigoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { findRevisaoByElementoUuid } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

const ART2 = 'art2';
const ART3 = 'art3';

let state: State;

const dispositivo = (id: string): ReturnType<typeof buscaDispositivoById> => buscaDispositivoById(state.articulacao!, id);

const revisoes = (): RevisaoElemento[] => (state.revisoes ?? []) as RevisaoElemento[];

const revisaoDe = (id: string): RevisaoElemento | undefined => findRevisaoByElementoUuid(state.revisoes!, dispositivo(id)!.uuid!);

const abreDocumento = (): void => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
};

const ativaRevisao = (): void => {
  state = elementoReducer(state, atualizarUsuarioAction.execute({ nome: 'Fulano' }));
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
};

const alteraTexto = (id: string, texto: string): void => {
  const e = createElemento(dispositivo(id)!);
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

// Texto como o Quill o entrega depois de desenhar o link de uma remissão externa.
const comLinkDeRemissao = (texto: string): string =>
  `<a data-urn="urn:lex:br:federal:lei:1986-12-19;7560" data-ref-id="ref_1" class="lexml-remissao-externa" href="#" target="_self">${texto}</a>`;

const sincronizaSoMarcacao = (id: string): void => {
  alteraTexto(id, comLinkDeRemissao(dispositivo(id)!.texto));
};

const adicionaArtigoAntesDoArt1 = (): void => {
  state = elementoReducer(state, adicionarArtigoAntes.execute(createElemento(state.articulacao!.filhos[0])));
};

describe('Revisão coerente com o histórico de desfazer (MPV 905/2019)', () => {
  beforeEach(() => {
    abreDocumento();
  });

  describe('Sincronizar a marcação de remissão não gera revisão', () => {
    it('com o histórico vazio, não lança erro nem cria revisão', () => {
      ativaRevisao();
      expect(state.past?.length ?? 0).to.equal(0);

      expect(() => sincronizaSoMarcacao(ART2)).not.to.throw();

      expect(state.revisoes).to.have.length(0);
    });

    it('depois de adicionar um artigo, só o artigo adicionado tem revisão', () => {
      ativaRevisao();
      adicionaArtigoAntesDoArt1();
      expect(state.revisoes).to.have.length(1);

      sincronizaSoMarcacao(ART3);

      expect(state.revisoes).to.have.length(1);
      expect(revisoes()[0].stateType).to.equal('ElementoIncluido');
      expect(revisaoDe(ART3)).to.be.undefined;
    });

    it('dispositivo que já tem revisão de texto alterado mantém operações e descrição', () => {
      ativaRevisao();
      alteraTexto(ART2, 'Texto alterado pelo usuário.');
      const { revisao: operacoes, descricao, dataHora } = revisaoDe(ART2)!;

      sincronizaSoMarcacao(ART2);

      const depois = revisaoDe(ART2)!;
      expect(state.revisoes).to.have.length(1);
      expect(depois.revisao).to.equal(operacoes);
      expect(depois.descricao).to.equal(descricao);
      expect(depois.dataHora).to.equal(dataHora);
    });
  });

  describe('Revisão de modificação guarda o estado anterior', () => {
    it('alterar o texto e recusar devolve o texto anterior', () => {
      const textoOriginal = dispositivo(ART2)!.texto;
      ativaRevisao();
      alteraTexto(ART2, 'Texto alterado pelo usuário.');
      const revisao = revisaoDe(ART2)!;
      expect(revisao.elementoAntesRevisao).not.to.be.undefined;

      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });

      expect(dispositivo(ART2)!.texto).to.equal(textoOriginal);
      expect(state.revisoes).to.have.length(0);
    });

    it('alterar o texto depois de adicionar um artigo e recusar mantém a revisão do artigo adicionado', () => {
      ativaRevisao();
      adicionaArtigoAntesDoArt1();
      const textoOriginal = dispositivo(ART3)!.texto;
      alteraTexto(ART3, 'Texto alterado pelo usuário.');
      const revisao = revisaoDe(ART3)!;
      expect(revisao.elementoAntesRevisao).not.to.be.undefined;

      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });

      expect(dispositivo(ART3)!.texto).to.equal(textoOriginal);
      expect(state.revisoes).to.have.length(1);
      expect(revisoes()[0].stateType).to.equal('ElementoIncluido');
    });

    it('toda revisão de modificação tem estado anterior', () => {
      ativaRevisao();
      sincronizaSoMarcacao(ART2);
      alteraTexto(ART3, 'Texto alterado pelo usuário.');

      const semAntes = revisoes().filter(r => r.stateType === 'ElementoModificado' && !r.elementoAntesRevisao);
      expect(semAntes).to.have.length(0);
    });
  });

  describe('Desfazer a primeira ação feita em revisão', () => {
    it('desfazer a primeira edição de texto remove a marca sem erro', () => {
      const textoOriginal = dispositivo(ART2)!.texto;
      ativaRevisao();
      expect(state.past?.length ?? 0).to.equal(0);
      alteraTexto(ART2, 'Texto alterado pelo usuário.');
      expect(state.revisoes).to.have.length(1);

      expect(() => {
        state = elementoReducer(state, { type: UNDO });
      }).not.to.throw();

      expect(dispositivo(ART2)!.texto).to.equal(textoOriginal);
      expect(state.revisoes).to.have.length(0);
    });

    it('desfazer a primeira renumeração remove a marca sem erro', () => {
      const rotuloOriginal = dispositivo(ART2)!.rotulo;
      ativaRevisao();
      expect(state.past?.length ?? 0).to.equal(0);
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(dispositivo(ART2)!), novo: { numero: '2-A' } });
      expect(state.revisoes).to.have.length(1);

      expect(() => {
        state = elementoReducer(state, { type: UNDO });
      }).not.to.throw();

      expect(dispositivo(ART2)!.rotulo).to.equal(rotuloOriginal);
      expect(state.revisoes).to.have.length(0);
    });
  });
});
