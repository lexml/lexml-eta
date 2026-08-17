import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna, completarRegistroRemissoes } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { RemissaoExternaValue } from '../../../src/model/remissao';

// Cobre a coordenação com a detecção externa (lexml-linker/WASM, Fase 3 do plano de integração):
// achado #4 — REGEX_ABSOLUTA não tem guarda contra ser seguida de citação de norma externa
// (ex.: "art. 1º da Lei nº 12.527..."), então sem a exclusão de spans a detecção interna cria
// um falso positivo apontando para o artigo local. A reconciliação via redespacho depende de
// state.remissoesExternas já conter o span antes da segunda chamada — testado aqui diretamente
// no reducer, sem depender do Worker/WASM (que é testado à parte em test/util/lexml-linker/).

let state: State;

describe('adicionaRemissaoInterna — exclusão de spans reivindicados pela remissão externa', () => {
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
    state.remissoesExternas = {};
  });

  it('sem remissão externa reivindicada, cria o falso positivo interno (achado #4 reproduzido)', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
    const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
    expect(artigo1).to.not.be.undefined;
    expect(artigo2).to.not.be.undefined;

    artigo2!.texto = 'Nos termos do art. 1º da Lei nº 12.527, de 18 de novembro de 2011.';

    const elemento = createElemento(artigo2!, true);
    const result = adicionaRemissaoInterna(state, { atual: elemento });

    const registry = result.remissoes![artigo2!.uuid!];
    expect(registry).to.not.be.undefined;
    expect(registry).to.have.length(1);
    expect(registry[0].targetUuid).to.equal(artigo1!.uuid);
  });

  it('com o span já reivindicado em state.remissoesExternas, não cria a remissão interna', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
    const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
    expect(artigo1).to.not.be.undefined;
    expect(artigo2).to.not.be.undefined;

    const texto = 'Nos termos do art. 1º da Lei nº 12.527, de 18 de novembro de 2011.';
    artigo2!.texto = texto;

    const inicio = texto.indexOf('art. 1º');
    const textoRef = 'art. 1º da Lei nº 12.527, de 18 de novembro de 2011';
    const remissaoExterna: RemissaoExternaValue = {
      refId: 'ref_teste_externa',
      targetUrn: 'urn:lex:br:federal:lei:2011-11-18;12527',
      targetNomeNorma: '',
      textoRef,
      sourceUuid: artigo2!.uuid,
      inicio,
      fim: inicio + textoRef.length,
    };
    state.remissoesExternas = { [remissaoExterna.refId]: remissaoExterna };

    const elemento = createElemento(artigo2!, true);
    const result = adicionaRemissaoInterna(state, { atual: elemento });

    const registry = result.remissoes![artigo2!.uuid!] ?? [];
    expect(registry).to.have.length(0);
  });

  it('remissão externa em outro dispositivo não afeta a detecção interna deste', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
    const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
    expect(artigo1).to.not.be.undefined;
    expect(artigo2).to.not.be.undefined;

    artigo2!.texto = 'Nos termos do art. 1º da Lei nº 12.527, de 18 de novembro de 2011.';

    // Span externo pertence a outro dispositivo (sourceUuid diferente) — não deve excluir nada aqui.
    state.remissoesExternas = {
      ref_outro: {
        refId: 'ref_outro',
        targetUrn: 'urn:lex:br:federal:lei:2011-11-18;12527',
        targetNomeNorma: '',
        textoRef: 'art. 1º da Lei nº 12.527, de 18 de novembro de 2011',
        sourceUuid: artigo1!.uuid, // não é artigo2
        inicio: 0,
        fim: 10,
      },
    };

    const elemento = createElemento(artigo2!, true);
    const result = adicionaRemissaoInterna(state, { atual: elemento });

    const registry = result.remissoes![artigo2!.uuid!] ?? [];
    expect(registry).to.have.length(1);
  });

  it('completarRegistroRemissoes também respeita os spans externos ao completar dispositivos não editados na sessão', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
    const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
    expect(artigo1).to.not.be.undefined;
    expect(artigo2).to.not.be.undefined;

    const texto = 'Nos termos do art. 1º da Lei nº 12.527, de 18 de novembro de 2011.';
    artigo2!.texto = texto;

    const inicio = texto.indexOf('art. 1º');
    const textoRef = 'art. 1º da Lei nº 12.527, de 18 de novembro de 2011';
    const remissoesExternas: Record<string, RemissaoExternaValue> = {
      ref_teste_externa: {
        refId: 'ref_teste_externa',
        targetUrn: 'urn:lex:br:federal:lei:2011-11-18;12527',
        targetNomeNorma: '',
        textoRef,
        sourceUuid: artigo2!.uuid,
        inicio,
        fim: inicio + textoRef.length,
      },
    };

    // Registry vazio simula "artigo2 não foi editado nesta sessão" — completarRegistroRemissoes precisa detectar do zero.
    const registroCompleto = completarRegistroRemissoes(state.articulacao!, {}, remissoesExternas);

    expect(registroCompleto[artigo2!.uuid!] ?? []).to.have.length(0);
  });

  it('reconciliação: redespacho após a externa ser reivindicada remove o falso positivo criado no primeiro despacho', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
    const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
    expect(artigo1).to.not.be.undefined;
    expect(artigo2).to.not.be.undefined;

    const texto = 'Nos termos do art. 1º da Lei nº 12.527, de 18 de novembro de 2011.';
    artigo2!.texto = texto;
    const elemento = createElemento(artigo2!, true);

    // 1º despacho (síncrono, como no editor): sem remissão externa ainda — cria o falso positivo.
    const stateAposInterna = adicionaRemissaoInterna(state, { atual: elemento });
    expect(stateAposInterna.remissoes![artigo2!.uuid!]).to.have.length(1);

    // O Worker resolve depois: grava o span em remissoesExternas (simulando coordenarDeteccaoExterna).
    const inicio = texto.indexOf('art. 1º');
    const textoRef = 'art. 1º da Lei nº 12.527, de 18 de novembro de 2011';
    const stateComExterna: State = {
      ...stateAposInterna,
      remissoesExternas: {
        ref_teste_externa: {
          refId: 'ref_teste_externa',
          targetUrn: 'urn:lex:br:federal:lei:2011-11-18;12527',
          targetNomeNorma: '',
          textoRef,
          sourceUuid: artigo2!.uuid,
          inicio,
          fim: inicio + textoRef.length,
        },
      },
    };

    // 2º despacho (reconciliação): mesmo elemento, agora com o span reivindicado no state.
    const stateReconciliado = adicionaRemissaoInterna(stateComExterna, { atual: elemento });

    expect(stateReconciliado.remissoes![artigo2!.uuid!] ?? []).to.have.length(0);
  });
});
