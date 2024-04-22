import { Elemento } from '../../model/elemento';
import './autocomplete-norma';

export async function informarNormaDialog(elemento: Elemento, quill: any, store: any, action: any, urlAutocomplete: string): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Dados da norma vigente';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`

  <div class="input-validation-required">
    <autocomplete-norma id="auto-norma" urnInicial="${elemento.norma}" urlAutocomplete="${urlAutocomplete}"></autocomplete-norma>
  </div>
  <br/>
  <sl-alert variant="warning" closable class="alert-closable">
    <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
    <strong>Dados inválidos.</strong><br/>
    Identifique uma norma a ser alterada.
  </sl-alert>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const autocompleteNorma = content.querySelector('#auto-norma') as any;
  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];
  const alerta = content.querySelector('sl-alert');

  let urn = '';

  autocompleteNorma!['onSelect'] = (norma): void => {
    urn = norma.urn;
  };

  ok!['onclick'] = (): void => {
    if (urn) {
      quill.focus();
      alerta?.hide();
      dialogElem?.hide();
      dialogElem?.remove();
      elemento.norma = urn;
      store.dispatch(action.execute(elemento));
    } else {
      alerta?.show();
    }
  };

  cancelar.onclick = (): void => {
    quill.focus();
    dialogElem?.hide();
    dialogElem?.remove();
  };

  quill.blur();
  await dialogElem.appendChild(content);
  await dialogElem.show();
  autocompleteNorma.focusAutoComplete();
}
