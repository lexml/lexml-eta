import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { inicializaRemissoesExternasAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesExternasAoAbrir';
import { criaDispositivo, createArticulacao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { configurarNumero, configurarRotulo } from './buildJsonixFromProjetoNorma/buildJsonixHelpers';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { RemissaoExternaValue } from '../../../src/model/remissao';

// Fase 5 (docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md §8.5): confirma que uma remissão externa
// no formato exato produzido pela detecção automática (targetNomeNorma vazio, inicio/fim presentes)
// sobrevive a um ciclo completo save→load sem diferença do fluxo manual — usando as mesmas funções
// de topo que getProjetoAtualizado()/abertura de documento usam em produção, não helpers de teste.

describe('Round-trip save→load de remissão externa auto-detectada', () => {
  it('URN, fragmento e texto do link sobrevivem ao ciclo completo', () => {
    const articulacao = createArticulacao();
    const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    configurarNumero(artigo, 1);
    configurarRotulo(artigo, 'Art. 1º');
    const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
    const textoRef = 'art. 5º da Lei nº 8.069, de 13 de julho de 1990';
    (caput as any).texto = `Nos termos do ${textoRef}, aplica-se a norma.`;

    // Formato exato de coordenarDeteccaoExterna (editor.component.ts): targetNomeNorma vazio,
    // inicio/fim presentes (não usados pela injeção, que é baseada em textoRef — ver achado do plano).
    const remissaoAutoDetectada: RemissaoExternaValue = {
      refId: 'ref_original_da_deteccao',
      targetUrn: 'urn:lex:br:federal:lei:1990-07-13;8069',
      targetNomeNorma: '',
      targetFragmento: 'art5',
      textoRef,
      sourceUuid: caput.uuid,
      inicio: (caput as any).texto.indexOf(textoRef),
      fim: (caput as any).texto.indexOf(textoRef) + textoRef.length,
    };

    const projetoNormaBasico = {
      classificacao: 'projeto',
      epigrafe: { texto: '' },
      ementa: { texto: '' },
      preambulo: { texto: '' } as any,
      articulacao,
    };

    // SAVE — mesma função usada por getProjetoAtualizado().
    const salvo = buildJsonixFromProjetoNorma(projetoNormaBasico as any, 'urn:lex:br:federal:projeto.lei:2026;1', undefined, {
      [remissaoAutoDetectada.refId]: remissaoAutoDetectada,
    });

    // LOAD — mesmas funções usadas na abertura de um documento.
    const projetoCarregado = buildProjetoNormaFromJsonix(salvo);
    const remissoesExternasCarregadas = inicializaRemissoesExternasAoAbrir(projetoCarregado.articulacao!);

    expect(Object.keys(remissoesExternasCarregadas)).to.have.length(1);
    const entradaCarregada = Object.values(remissoesExternasCarregadas)[0] as RemissaoExternaValue;

    expect(entradaCarregada.targetUrn).to.equal(remissaoAutoDetectada.targetUrn);
    expect(entradaCarregada.targetFragmento).to.equal(remissaoAutoDetectada.targetFragmento);
    expect(entradaCarregada.textoRef).to.equal(textoRef);

    // targetNomeNorma continua vazio após o reload — não é regressão, é o comportamento
    // pré-existente também do fluxo manual (achado #3 do plano original); a Fase 4 resolve
    // isso sob demanda quando o usuário abre "Editar" (lookup por urnInicial), não no reload.
    expect(entradaCarregada.targetNomeNorma).to.equal('');

    // refId é regenerado no reload (não persistido no HTML salvo) — mesmo comportamento do fluxo manual.
    expect(entradaCarregada.refId).to.not.equal(remissaoAutoDetectada.refId);

    // O link recarregado deve satisfazer os requisitos do RemissaoExternaBlot para ativar no Quill.
    const dispositivos = getDispositivoAndFilhosAsLista(projetoCarregado.articulacao!);
    const caputCarregado = dispositivos.find((d: any) => d.uuid === entradaCarregada.sourceUuid);
    expect(caputCarregado?.texto).to.include('data-urn="urn:lex:br:federal:lei:1990-07-13;8069"');
    expect(caputCarregado?.texto).to.include(`data-ref-id="${entradaCarregada.refId}"`);
    expect(caputCarregado?.texto).to.include('class="lexml-remissao-externa"');
  });

  // #1085: a ementa fica fora da árvore da articulação, e o link dela não chegava ao arquivo.
  it('o link da ementa sobrevive ao ciclo completo', () => {
    const articulacao = createArticulacao();
    const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    configurarNumero(artigo, 1);
    configurarRotulo(artigo, 'Art. 1º');
    (criaDispositivo(artigo, TipoDispositivo.caput.tipo) as any).texto = 'Texto do artigo.';

    // Como buildDispositivoEmenta, na abertura do documento.
    const ementa = criaDispositivo(createArticulacao(), 'Ementa');
    ementa.pai = undefined;
    ementa.id = 'ementa';
    const textoRef = 'Lei nº 12.965, de 23 de abril de 2014';
    ementa.texto = `Altera a ${textoRef}, para blá blá blá.`;

    const remissao: RemissaoExternaValue = {
      refId: 'ref_da_ementa',
      targetUrn: 'urn:lex:br:federal:lei:2014-04-23;12965',
      targetNomeNorma: '',
      textoRef,
      sourceUuid: ementa.uuid,
      inicio: ementa.texto.indexOf(textoRef),
      fim: ementa.texto.indexOf(textoRef) + textoRef.length,
    };

    const projetoNorma = { classificacao: 'projeto', epigrafe: { texto: '' }, ementa, preambulo: { texto: '' } as any, articulacao };
    const salvo = buildJsonixFromProjetoNorma(projetoNorma as any, 'urn:lex:br:federal:projeto.lei:2026;1', undefined, { [remissao.refId]: remissao });

    const projetoCarregado = buildProjetoNormaFromJsonix(salvo);
    const remissoesCarregadas = Object.values(inicializaRemissoesExternasAoAbrir(projetoCarregado.articulacao!)) as RemissaoExternaValue[];
    const ementaCarregada = projetoCarregado.articulacao!.projetoNorma!.ementa!;

    expect(remissoesCarregadas).to.have.length(1);
    expect(remissoesCarregadas[0]).to.include({ targetUrn: remissao.targetUrn, textoRef, sourceUuid: ementaCarregada.uuid });
    expect(ementaCarregada.texto).to.include('data-urn="urn:lex:br:federal:lei:2014-04-23;12965"');
    expect(ementaCarregada.texto).to.include('class="lexml-remissao-externa"');
  });
});
