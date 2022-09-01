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
  <sl-radio-group fieldset label="Selecione o tipo de nota de alteração:" name="nota" value="NR">
    <sl-radio class="nota" id="nota-nr" value="nota-nr">Nova redação '(NR)'</sl-radio>
    <sl-radio class="nota" id="nota-ac" value="nota-ac">Acréscimo '(AC)'</sl-radio>
    <sl-radio class="nota" id="nota-vazia" value="nota-vazia">Sem nota de alteração</sl-radio>
  </sl-radio-group>
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
    for (const opcao of Object.keys(opcoes)) {
      if (opcoes[opcao].checked) {
        // se valor é novo
        if (elemento.notaAlteracao !== opcao) {
          store.dispatch(atualizarNotaAlteracaoAction.execute(elemento, opcao));
        }
        break;
      }
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
  // opcoes[elemento.notaAlteracao || 'VZ'].focus();
};
