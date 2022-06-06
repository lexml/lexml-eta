import { Elemento } from '../../model/elemento';
import { buildUrn, getData, getNumero, getTipo, validaUrn } from '../../model/lexml/documento/urnUtil';

export async function informarNormaDialog(elemento: Elemento, quill: any, store: any, action: any): Promise<any> {
  let dialogElem = document.querySelector('sl-dialog');
  if (dialogElem === null) {
    dialogElem = document.createElement('sl-dialog');
    document.body.appendChild(dialogElem);
  } else {
    dialogElem.innerHTML = '';
    dialogElem.label = '';
  }
  dialogElem.label = 'Dados da norma vigente';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style></style>
  <div class="input-validation-required">
    <sl-select name="tipoNorma" id="tipoNorma" label="Tipo" clearable>
      <sl-menu-item value="decreto">Decreto</sl-menu-item>
      <sl-menu-item value="decreto-lei">Decreto-Lei</sl-menu-item>
      <sl-menu-item value="lei">Lei</sl-menu-item>
      <sl-menu-item value="lei.complementar">Lei Complementar</sl-menu-item>
      <sl-menu-item value="lei.delegada">Lei Delegada</sl-menu-item>
      <sl-menu-item value="medida.provisoria">Medida Provisória</sl-menu-item>
    </sl-select>
    <br/>
    <sl-input name="numeroNorma" id="numeroNorma" placeholder="8666 (número sem ponto)" label="Número" clearable></sl-input>
    <br/>
    <sl-input type="date" name="dataNorma" id="dataNorma" label="Data" clearable></sl-input>
  </div>
  <br/>
  <sl-alert variant="warning" closable class="alert-closable">
    <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
    <strong>Dados inválidos. </strong><br/>
    Revise os dados informados.
  </sl-alert>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const t = elemento.norma ? getTipo(elemento.norma)?.urn : undefined;
  const n = elemento.norma ? getNumero(elemento.norma) : undefined;
  const d = elemento.norma ? getData(elemento.norma) : undefined;

  const tipoNorma = content.querySelector('#tipoNorma');
  const numero = content.querySelector('#numeroNorma');
  const data = content.querySelector('#dataNorma');

  if (t) {
    (tipoNorma! as HTMLSelectElement).value = t;
  }

  if (n) {
    (numero! as HTMLInputElement).value = n;
  }

  if (d) {
    const [dia, mes, ano] = d.split('/');
    (data! as HTMLInputElement).value = [ano, mes, dia].join('-');
  }

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];
  const alerta = content.querySelector('sl-alert');

  ok.onclick = (): void => {
    const [ano, mes, dia] = (data as HTMLInputElement)?.value.split('-');
    const dataFormatada = [dia, mes, ano].join('/');

    const urn = buildUrn('federal', (tipoNorma! as HTMLSelectElement).value, (numero as HTMLInputElement)?.value, dataFormatada);

    if (validaUrn(urn)) {
      quill.focus();
      alerta?.hide();
      dialogElem?.hide();
      elemento.norma = urn;
      store.dispatch(action.execute(elemento));
    } else {
      alerta?.show();
    }
  };

  cancelar.onclick = (): void => {
    quill.focus();
    dialogElem?.hide();
  };
  quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
}
