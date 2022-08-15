import { atualizarNotaAlteracaoAction } from './../../model/lexml/acao/atualizarNotaAlteracaoAction';
// import SlInput from '@shoelace-style/shoelace/dist/components/input/input';
import { Elemento } from '../../model/elemento';

export const editarNotaAlteracaoDialog = (elemento: Elemento, quill: any, store: any): void => {
  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Nota de alteração';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <fieldset>
    <legend>Selecione o tipo de nota de alteração:</legend>
    <div>
      <input type="radio" id="nota-nr" name="nota" value="NR">
      <label for="nota-nr">Nova redação '(NR)'</label>
    </div>
    <div>
      <input type="radio" id="nota-ac" name="nota" value="AC">
      <label for="nota-ac">Acréscimo '(AC)'</label>
    </div>
    <div>
      <input type="radio" id="nota-vazia" name="nota" value="">
      <label for="nota-vazia">Sem nota de alteração</label>
    </div>
  </fieldset>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const opcoes = {
    NR: content.querySelector('#nota-nr'),
    AC: content.querySelector('#nota-ac'),
    VZ: content.querySelector('#nota-vazia'),
  };

  opcoes[elemento.notaAlteracao || 'VZ'].checked = true;

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];

  ok.onclick = (): void => {
    const newValue = (document.querySelector('input[name="nota"]:checked') as HTMLInputElement)?.value;
    if (elemento.notaAlteracao !== newValue) {
      // store.dispatch(action.execute(elemento));
      store.dispatch(atualizarNotaAlteracaoAction.execute(elemento, newValue));
    }
    dialogElem?.hide();
    dialogElem?.remove();
  };

  cancelar.onclick = (): void => {
    quill.focus();
    dialogElem?.hide();
    dialogElem?.remove();
  };

  quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
  opcoes[elemento.notaAlteracao || 'VZ'].focus();
};
