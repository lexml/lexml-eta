import { expect } from '@open-wc/testing';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { atualizarTextoElementoAction } from '../../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { adicionarTituloDispositivoAction, editarTituloDispositivoAction, removerTituloDispositivoAction } from '../../../../src/model/lexml/acao/atualizarTituloDispositivoAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';
import { MPV_885_2019 } from '../../../doc/mpv_885_2019';

let state: State;

const ID = 'art1';
const ID_ALTERACAO = 'art1_cpt_alt1_art1';

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const titulo = (id: string): string | undefined => dispositivo(id).tituloDispositivo;
const executa = (acao: any, id: string, valor?: string): void => {
  state = elementoReducer(state, acao.execute(createElemento(dispositivo(id)), valor));
};
const desfaz = (): void => {
  state = elementoReducer(state, UndoAction());
};
const refaz = (): void => {
  state = elementoReducer(state, redoAction());
};
// O redo reaplica o par (antes, depois) em sequência; a linha do editor termina com o último.
const elementoModificado = (id: string): any =>
  state
    .ui!.events.filter(e => e.stateType === StateType.ElementoModificado)
    .flatMap(e => e.elementos ?? [])
    .filter((e: any) => e.lexmlId === id)
    .pop();

describe('Undo/redo do título de dispositivo', () => {
  beforeEach(() => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = { events: [] } as any;
  });

  [
    { nome: 'dispositivo da norma', id: ID },
    { nome: 'dispositivo dentro de bloco de alteração', id: ID_ALTERACAO },
  ].forEach(({ nome, id }) => {
    describe(nome, () => {
      it('desfaz e refaz a adição do título', () => {
        executa(adicionarTituloDispositivoAction, id, 'Título novo');
        desfaz();
        expect(titulo(id)).to.be.undefined;
        refaz();
        expect(titulo(id)).to.equal('Título novo');
      });

      it('desfaz e refaz a alteração do título', () => {
        executa(adicionarTituloDispositivoAction, id, 'A');
        executa(editarTituloDispositivoAction, id, 'B');
        desfaz();
        expect(titulo(id)).to.equal('A');
        refaz();
        expect(titulo(id)).to.equal('B');
      });

      it('desfaz e refaz a remoção do título', () => {
        executa(adicionarTituloDispositivoAction, id, 'A');
        executa(removerTituloDispositivoAction, id);
        desfaz();
        expect(titulo(id)).to.equal('A');
        refaz();
        expect(titulo(id)).to.be.undefined;
      });

      it('percorre toda a sequência de passos para trás e para frente', () => {
        executa(adicionarTituloDispositivoAction, id, 'A');
        executa(editarTituloDispositivoAction, id, 'B');
        executa(removerTituloDispositivoAction, id);

        desfaz();
        desfaz();
        desfaz();
        expect(titulo(id)).to.be.undefined;

        refaz();
        expect(titulo(id)).to.equal('A');
        refaz();
        expect(titulo(id)).to.equal('B');
        refaz();
        expect(titulo(id)).to.be.undefined;
      });
    });
  });

  it('informa o título restaurado no evento ElementoModificado, para a linha ser atualizada', () => {
    executa(adicionarTituloDispositivoAction, ID, 'A');
    executa(editarTituloDispositivoAction, ID, 'B');

    desfaz();
    expect(elementoModificado(ID)?.tituloDispositivo).to.equal('A');

    refaz();
    expect(elementoModificado(ID)?.tituloDispositivo).to.equal('B');
  });

  it('informa a ausência de título no evento ao desfazer a adição', () => {
    executa(adicionarTituloDispositivoAction, ID, 'A');

    desfaz();

    expect(elementoModificado(ID)).to.not.be.undefined;
    expect(elementoModificado(ID)?.tituloDispositivo).to.be.undefined;
  });

  it('move o passo entre past e future', () => {
    executa(adicionarTituloDispositivoAction, ID, 'A');
    expect(state.past).to.have.length(1);

    desfaz();
    expect(state.past).to.have.length(0);
    expect(state.future).to.have.length(1);

    refaz();
    expect(state.past).to.have.length(1);
    expect(state.future).to.have.length(0);
  });

  it('desfazer uma edição de texto não altera o título', () => {
    executa(adicionarTituloDispositivoAction, ID, 'A');
    const comNovoTexto = { ...createElemento(dispositivo(ID)), conteudo: { texto: 'Texto novo do caput' } };
    state = elementoReducer(state, atualizarTextoElementoAction.execute(comNovoTexto as any));

    desfaz();

    expect(titulo(ID)).to.equal('A');
    expect(dispositivo(ID).texto).to.not.equal('Texto novo do caput');
  });

  it('desfazer o título não altera o texto editado antes dele', () => {
    const comNovoTexto = { ...createElemento(dispositivo(ID)), conteudo: { texto: 'Texto novo do caput' } };
    state = elementoReducer(state, atualizarTextoElementoAction.execute(comNovoTexto as any));
    executa(adicionarTituloDispositivoAction, ID, 'A');

    desfaz();

    expect(titulo(ID)).to.be.undefined;
    expect(dispositivo(ID).texto).to.equal('Texto novo do caput');
  });

  it('o aviso de validação acompanha o título restaurado', () => {
    executa(adicionarTituloDispositivoAction, ID, 'minúsculo');
    executa(editarTituloDispositivoAction, ID, 'Maiúsculo');

    desfaz();

    const mensagens = elementoModificado(ID)?.mensagens ?? [];
    expect(mensagens.some((m: any) => m.descricao === 'O título do artigo deveria iniciar com letra maiúscula.')).to.be.true;
  });
});
