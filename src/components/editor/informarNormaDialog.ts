import { SlRadio } from '@shoelace-style/shoelace';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input';
import { Elemento } from '../../model/elemento';
import { buildUrn, getData, getNumero, getTipo, validaUrn } from '../../model/lexml/documento/urnUtil';

export async function informarNormaDialog(elemento: Elemento, quill: any, store: any, action: any): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Dados da norma vigente';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style>

    sl-radio-group::part(base) {
      display: grid;
      grid-template-columns: 230px 1fr;
      grid-gap: 0px;
      flex-wrap: wrap;
    }

    sl-radio::part(base) {
      display: flex;
      flex-direction: row;
    }

    sl-radio-group sl-input::part(form-control) {
      display: flex;
      flex-direction: row;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    #dataNorma::part(form-control-input){
      max-width: 160px;
    }
    #anoNorma::part(form-control-input){
      max-width: 90px;
    }

    @media (max-width: 520px) {
      sl-radio-group::part(base) {
        display: flex;
        grid-template-columns: column;
        gap: 10px;
        flex-wrap: wrap;
      }
    }
  </style>
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

    <sl-radio-group label="Data" fieldset>

      <sl-radio name="informarData" id="informarDataCompleta" value="informarDataCompleta">
        <sl-input label="Dia" type="date" name="dataNorma" id="dataNorma" size="small" clearable></sl-input>
      </sl-radio>

      <sl-radio name="informarData" id="informarApenasAno" value="informarApenasAno">
        <sl-input label="Ano" type="number" name="anoNorma" id="anoNorma" size="small"></sl-input>
      </sl-radio>

    </sl-radio-group>

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

  const informarDataCompleta = content.querySelector('#informarDataCompleta');
  const informarApenasAno = content.querySelector('#informarApenasAno');

  const t = elemento.norma ? getTipo(elemento.norma)?.urn : undefined;
  const n = elemento.norma ? getNumero(elemento.norma) : undefined;
  const d = elemento.norma ? getData(elemento.norma) : undefined;

  const tipoNorma = content.querySelector('#tipoNorma');
  const numero = content.querySelector('#numeroNorma');
  const data = content.querySelector('#dataNorma');
  const ano = content.querySelector('#anoNorma');
  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];
  const alerta = content.querySelector('sl-alert');

  if (t) {
    (tipoNorma! as HTMLSelectElement).value = t;
  }

  if (n) {
    (numero! as HTMLInputElement).value = n;
  }

  if (d) {
    if (d.length === 4) {
      // é ano
      (ano! as HTMLInputElement).value = d;
      (informarApenasAno! as SlRadio).checked = true;
    } else {
      const [dia, mes, ano] = d.split('/');
      (data! as HTMLInputElement).value = [ano, mes, dia].join('-');
      (informarDataCompleta! as SlRadio).checked = true;
    }
  }

  ok!['onclick'] = (): void => {
    let urn;
    if (data!['value']) {
      const [ano, mes, dia] = (data as HTMLInputElement)?.value.split('-');
      const dataFormatada = [dia, mes, ano].join('/');
      urn = buildUrn('federal', (tipoNorma! as HTMLSelectElement).value, (numero! as HTMLInputElement)?.value, dataFormatada);
    } else if (ano!['value']) {
      urn = buildUrn('federal', (tipoNorma! as HTMLSelectElement).value, (numero! as HTMLInputElement)?.value, ano!['value']);
    }
    if (validaUrn(urn)) {
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

  informarDataCompleta!['onclick'] = (): void => {
    ano!['disabled'] = true;
    ano!['value'] = '';
    data!['disabled'] = false;
    (data as SlInput).focus();
  };
  informarApenasAno!['onclick'] = (): void => {
    ano!['disabled'] = false;
    data!['disabled'] = true;
    data!['value'] = '';
    (ano as SlInput).focus();
  };
  ano!['onkeydown'] = (event: KeyboardEvent): void => {
    if (ano!['value'].length > 3 && event.key !== 'Backspace') {
      event.preventDefault();
    }
  };

  quill.blur();
  await dialogElem.appendChild(content);
  await dialogElem.show();
  (tipoNorma as SlInput).focus();
}
