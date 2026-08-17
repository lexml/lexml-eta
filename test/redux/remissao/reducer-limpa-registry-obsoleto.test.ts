import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

// Bug pré-existente, independente da Fase 3 (achado ao testar a reconciliação de remissão externa —
// docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md §8.3): o early-return do reducer só considerava
// "nada a fazer" quando a nova detecção vinha vazia e não havia inválidas/excluídas a preservar, sem
// checar se havia entradas VÁLIDAS antigas que precisavam ser descartadas — deixava uma entrada obsoleta
// no registry (com risco real de corromper o save, já que injetarLinksRemissaoNoTexto injeta pela
// posição salva sem revalidar o texto atual naquele ponto).

let state: State;

describe('adicionaRemissaoInterna — editar texto para remover a única referência', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    state.emRevisao = false;
    state.revisoes = [];
    state.remissoes = {};
  });

  it('registry deve ficar vazio depois que o texto deixa de ter qualquer referência', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
    expect(artigo2).to.not.be.undefined;

    artigo2!.texto = 'Nos termos do art. 1º.';
    const elemento1 = createElemento(artigo2!, true);
    const stateComReferencia = adicionaRemissaoInterna(state, { atual: elemento1 });
    expect(stateComReferencia.remissoes![artigo2!.uuid!]).to.have.length(1);

    artigo2!.texto = 'Texto sem nenhuma referência agora.';
    const elemento2 = createElemento(artigo2!, true);
    const stateSemReferencia = adicionaRemissaoInterna(stateComReferencia, { atual: elemento2 });

    expect(stateSemReferencia.remissoes![artigo2!.uuid!] ?? []).to.have.length(0);
  });
});
