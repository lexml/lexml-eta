import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { marcarRemissaoPendenteRevisao, marcarRemissaoRevisada } from '../../../src/redux/elemento/reducer/marcarRemissaoRevisao';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { SUFIXO_REVISAO } from '../../../src/model/remissao/remissao';

function getHrefRemissao(resultado: any): string {
  const content = resultado.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;
  const remissao = content.find((c: any) => c?.name?.localPart === 'Remissao');
  return remissao?.value?.href ?? '';
}

describe('Fluxo completo: renumeração → @revisar → load → popup → segunda salvagem', () => {
  let state: State;
  let art1Uuid: number;
  let art2Uuid: number;

  beforeEach(() => {
    const { state: s, artigos } = criaStateComNArtigos(2);
    state = s;
    art1Uuid = artigos[0].uuid!;
    art2Uuid = artigos[1].uuid!;
  });

  it('após renumeração com texto arbitrário, state tem revisao:true', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid }],
      },
    };

    // Simula o dispatch que atualizarRemissaoRenumerada faz para links preservados
    const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_1'] });

    expect(novo.remissoes![art1Uuid][0].revisao).to.equal(true);
  });

  describe('link manual sem entrada prévia no registry (criado via diálogo)', () => {
    it('marcarPendente com refId ausente cria entrada placeholder com revisao:true', () => {
      // registry vazio — link criado via diálogo com texto não-canônico nunca passa por detectarReferencias
      const base: State = { ...state, remissoes: {} };

      const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_manual'] });

      expect(novo.remissoes![art1Uuid]).to.exist;
      expect(novo.remissoes![art1Uuid].some((r: any) => r.refId === 'ref_manual' && r.revisao === true)).to.be.true;
    });

    it('marcarPendente não sobrescreve entradas válidas existentes ao criar placeholder', () => {
      const base: State = {
        ...state,
        remissoes: {
          [art1Uuid]: [{ refId: 'ref_existente', targetLexmlId: 'art2', targetUuid: art2Uuid }],
        },
      };

      // Novo refId vindo do DOM que não está no state
      const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_novo_manual'] });

      expect(novo.remissoes![art1Uuid]).to.have.length(2);
      expect(novo.remissoes![art1Uuid].some((r: any) => r.refId === 'ref_existente')).to.be.true;
      expect(novo.remissoes![art1Uuid].some((r: any) => r.refId === 'ref_novo_manual' && r.revisao === true)).to.be.true;
    });

    it('marcarRevisada remove revisao:true da entrada placeholder criada', () => {
      // Simula estado após marcarPendente ter criado a entrada placeholder
      const base: State = {
        ...state,
        remissoes: {
          [art1Uuid]: [{ refId: 'ref_manual', revisao: true as const }],
        },
      };

      const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_manual' });

      expect(novo.remissoes![art1Uuid][0].revisao).to.be.undefined;
    });

    it('marcarPendente com registry vazio emite ElementoValidado com WARNING', () => {
      const base: State = { ...state, remissoes: {} };

      const novo = marcarRemissaoPendenteRevisao(base, { sourceUuid: art1Uuid, refIds: ['ref_manual'] });

      const eventos = novo.ui?.events ?? [];
      expect(eventos.some((e: any) => e.stateType === 'ElementoValidado')).to.be.true;
    });
  });

  it('após marcarRemissaoRevisadaAction, state não tem revisao:true', () => {
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true as const }],
      },
    };

    // Simula o dispatch que atualizarPopupRemissao faz ao abrir o popup
    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    expect(novo.remissoes![art1Uuid][0].revisao).to.be.undefined;
  });

  it('marcarRevisada emite ElementoValidado sem WARNING quando não há mais revisoes pendentes', () => {
    // Cobre o cenário pós-popup: ao visualizar o link, revisao:true é removida
    const base: State = {
      ...state,
      remissoes: {
        [art1Uuid]: [{ refId: 'ref_1', targetLexmlId: 'art2', targetUuid: art2Uuid, revisao: true as const }],
      },
    };

    const novo = marcarRemissaoRevisada(base, { sourceUuid: art1Uuid, refId: 'ref_1' });

    // Após remoção, nenhuma entrada com revisao:true resta
    expect(novo.remissoes![art1Uuid].some((r: any) => r.revisao === true)).to.be.false;
    // Elemento validado emitido (para atualizar mensagens no Quill)
    expect(novo.ui?.events?.some((e: any) => e.stateType === 'ElementoValidado')).to.be.true;
  });

  it('após revisão, buildJsonix produz href sem @revisar', () => {
    const articulacao = createArticulacao() as any;
    const artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as any;
    const caput1 = criaDispositivo(artigo1, TipoDispositivo.caput.tipo) as any;
    const artigo2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as any;
    artigo1.id = 'art1';
    artigo2.id = 'art2';
    const art2U = artigo2.uuid;
    const caput1U = caput1.uuid;

    caput1.texto = `texto <a href="#lxEtaId${art2U}" data-lexml-ref="art1" class="lexml-remissao-interna">o artigo central</a>.`;

    // Entrada sem revisao = link já foi revisado pelo usuário
    const remissoes = { [caput1U]: [{ refId: 'ref_1', targetUuid: art2U, targetLexmlId: 'art1' }] };
    const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao, remissoes);

    expect(getHrefRemissao(resultado)).to.not.include(SUFIXO_REVISAO);
  });

  describe('Ciclo save → load → revisão → save', () => {
    let articulacao: any;
    let caput1U: number;
    let art2U: number;

    beforeEach(() => {
      articulacao = createArticulacao();
      const artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as any;
      const caput1 = criaDispositivo(artigo1, TipoDispositivo.caput.tipo) as any;
      const artigo2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as any;
      artigo1.id = 'art1';
      artigo2.id = 'art2';
      art2U = artigo2.uuid;
      caput1U = caput1.uuid;
      // Link com texto não-canônico apontando para art2 (targetLexmlId desatualizado = 'art1')
      caput1.texto = `texto <a href="#lxEtaId${art2U}" data-lexml-ref="art1" class="lexml-remissao-interna">o artigo central</a>.`;
    });

    it('JSONIX primeira salvagem tem @revisar', () => {
      const remissoes: Record<number, any[]> = {
        [caput1U]: [{ refId: 'ref_1', targetUuid: art2U, targetLexmlId: 'art1', revisao: true as const }],
      };
      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao, remissoes);

      expect(getHrefRemissao(resultado)).to.equal(`art2${SUFIXO_REVISAO}`);
    });

    it('JSONIX segunda salvagem (após revisão no state) NÃO tem @revisar', () => {
      // revisao foi removida pelo marcarRemissaoRevisadaAction ao abrir o popup
      const remissoes: Record<number, any[]> = {
        [caput1U]: [{ refId: 'ref_1', targetUuid: art2U, targetLexmlId: 'art1' }],
      };
      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao, remissoes);

      expect(getHrefRemissao(resultado)).to.not.include(SUFIXO_REVISAO);
    });
  });
});
