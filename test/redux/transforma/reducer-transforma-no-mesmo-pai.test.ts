import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { abreArticulacao } from '../../../src/redux/elemento/reducer/abreArticulacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { transformarEmOmissisIncisoCaput, transformarEmOmissisParagrafo, transformarOmissisEmIncisoCaput } from '../../../src/model/lexml/acao/transformarElementoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { StateType } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';

// #1087: o dispositivo novo nascia com o uuid do antigo e a remoção do antigo, por uuid, levava os dois.
let state: any;

const todos = (): Dispositivo[] => getDispositivoAndFilhosAsLista(state.articulacao);
const naArvore = (uuid: number): Dispositivo | undefined => todos().find(d => d.uuid === uuid);
// Art. 627 da alteração do mpv_905_2019: incisos I a IV no caput e §§ 1º a 4º.
const artigo627 = (): any => todos().find(d => d.tipo === 'Artigo' && d.rotulo === 'Art. 627.');
const tipos = (ds: Dispositivo[]): string[] => ds.map(d => d.tipo);
const transformar = (acao: any, dispositivo: Dispositivo): void => {
  state = transformaTipoElemento(state, acao.execute(createElemento(dispositivo)));
};

describe('Transformação no mesmo pai mantém o dispositivo no lugar (#1087)', () => {
  beforeEach(() => {
    const articulacao = buildProjetoNormaFromJsonix(MPV_905_2019 as any).articulacao!;
    state = abreArticulacao({} as any, { type: ABRIR_ARTICULACAO, articulacao, classificacao: ClassificacaoDocumento.PROJETO });
  });

  it('omitir o inciso I deixa o omissis no lugar dele, na árvore', () => {
    const artigo = artigo627();
    const [incisoI, ...demais] = artigo.caput.filhos;
    transformar(transformarEmOmissisIncisoCaput, incisoI);

    const caput = artigo627().caput.filhos;
    expect(tipos(caput)).to.deep.equal(['Omissis', ...tipos(demais)]);
    expect(caput[0].uuid, 'uuid do inciso').to.equal(incisoI.uuid);
    expect(naArvore(incisoI.uuid)?.tipo).to.equal('Omissis');
    const incluido = state.ui.events.find((e: any) => e.stateType === StateType.ElementoIncluido);
    expect(incluido.referencia.uuid, 'referência no artigo').to.equal(artigo.uuid);
  });

  it('omitir um inciso do meio deixa o omissis entre os vizinhos', () => {
    const [incisoI, incisoII, incisoIII] = artigo627().caput.filhos;
    transformar(transformarEmOmissisIncisoCaput, incisoII);

    const caput = artigo627().caput.filhos;
    expect(caput.slice(0, 3).map((d: Dispositivo) => d.uuid)).to.deep.equal([incisoI.uuid, incisoII.uuid, incisoIII.uuid]);
    expect(tipos(caput.slice(0, 3))).to.deep.equal(['Inciso', 'Omissis', 'Inciso']);
  });

  it('transformar em inciso um omissis do caput deixa o inciso no lugar dele, na árvore', () => {
    const omissis: any = todos().find(d => d.tipo === 'Omissis' && d.pai?.tipo === 'Caput' && d.isDispositivoAlteracao && d.pai!.indexOf(d) === 0);
    const irmaos = omissis.pai.filhos.slice(1);
    transformar(transformarOmissisEmIncisoCaput, omissis);

    const caput = naArvore(omissis.uuid)!.pai!.filhos;
    expect(caput[0].uuid).to.equal(omissis.uuid);
    expect(caput[0].tipo).to.equal('Inciso');
    expect(caput.slice(1).map(d => d.uuid)).to.deep.equal(irmaos.map((d: Dispositivo) => d.uuid));
  });

  it('desfazer a omissão devolve o inciso ao lugar, e refazer devolve o omissis', () => {
    const [incisoI] = artigo627().caput.filhos;
    const rotulo = incisoI.rotulo;
    transformar(transformarEmOmissisIncisoCaput, incisoI);

    state = undo(state);
    const desfeito = artigo627().caput.filhos[0];
    expect([desfeito.tipo, desfeito.uuid, desfeito.rotulo]).to.deep.equal(['Inciso', incisoI.uuid, rotulo]);
    expect(naArvore(incisoI.uuid)?.tipo).to.equal('Inciso');

    state = redo(state);
    const refeito = artigo627().caput.filhos[0];
    expect([refeito.tipo, refeito.uuid]).to.deep.equal(['Omissis', incisoI.uuid]);
    expect(naArvore(incisoI.uuid)?.tipo).to.equal('Omissis');
  });

  it('omitir o § 1º deixa o omissis no lugar dele, na árvore', () => {
    const artigo = artigo627();
    const paragrafos = (a: any): Dispositivo[] => a.filhos.filter((d: Dispositivo) => d.pai === a);
    const [primeiro, ...demais] = paragrafos(artigo);
    transformar(transformarEmOmissisParagrafo, primeiro);

    const depois = paragrafos(artigo627());
    expect(tipos(depois)).to.deep.equal(['Omissis', ...tipos(demais)]);
    expect(depois[0].uuid).to.equal(primeiro.uuid);
  });
});
