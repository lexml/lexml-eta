import { SlInput } from '@shoelace-style/shoelace';
import { Elemento } from '../../model/elemento';
import { buildUrn, validaUrn } from '../../model/lexml/documento/urnUtil';
import { validaDispositivoAssistente } from '../../model/lexml/numeracao/parserReferenciaDispositivo';

export async function assistenteAlteracaoDialog(elemento: Elemento, quill: any, store: any, action: any): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Assistente de Alteração de Norma';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style></style>
  <div class="input-validation-required">
    <sl-select name="tipoNorma" id="tipoNorma" label="Tipo da norma" clearable>
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
    
    <sl-radio-group fieldset>
      <sl-radio name="informarData" id="informarDataCompleta" value="informarDataCompleta" checked="true">Data</sl-radio>
      <sl-input type="date" name="dataNorma" id="dataNorma" clearable/></sl-input>
      
      <sl-radio name="informarData" id="informarApenasAno" value="informarApenasAno">Ano</sl-radio>
      <sl-input name="anoNorma" id="anoNorma"></sl-input>

    </sl-radio-group>
    <p>
    <sl-input name="dispositivos" id="dispositivos" placeholder="ex: inciso I do § 3º do Art.1º" help-text="Pode ser utilizado 'parágrafo', 'par' ou § para referenciar parágrafo" label="Dispositivo da norma" clearable></sl-input>
    </p>
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

  const tipoNorma = content.querySelector('#tipoNorma');
  const numero = content.querySelector('#numeroNorma');
  const dataNorma = content.querySelector('#dataNorma');
  const anoNorma = content.querySelector('#anoNorma');
  anoNorma!['disabled'] = true;
  const dispositivos = content.querySelector('#dispositivos');

  (tipoNorma! as HTMLSelectElement).value = 'lei';

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];
  const alerta = content.querySelector('sl-alert');

  informarDataCompleta!['onclick'] = (): void => {
    anoNorma!['disabled'] = true;
    anoNorma!['value'] = '';
    dataNorma!['disabled'] = false;
  };
  informarApenasAno!['onclick'] = (): void => {
    anoNorma!['disabled'] = false;
    dataNorma!['disabled'] = true;
    dataNorma!['value'] = '';
  };

  ok.onclick = (): void => {
    let urn;
    const d = (dispositivos as HTMLInputElement)?.value;

    if (dataNorma!['value']) {
      const [ano, mes, dia] = (dataNorma as HTMLInputElement)?.value.split('-');
      const dataFormatada = [dia, mes, ano].join('/');
      urn =
        (dataNorma as HTMLInputElement)?.value.length > 0
          ? buildUrn('federal', (tipoNorma! as HTMLSelectElement).value, (numero as HTMLInputElement)?.value, dataFormatada)
          : undefined;
    }
    if (anoNorma!['value']) {
      urn =
        (anoNorma as HTMLInputElement)?.value.length > 0
          ? buildUrn('federal', (tipoNorma! as HTMLSelectElement).value, (numero as HTMLInputElement)?.value, anoNorma!['value'])
          : undefined;
    }

    let ref;
    if (d && d.length > 0) {
      try {
        ref = validaDispositivoAssistente(d);
      } catch (err) {
        console.log('erro', err);
      }
    }

    if ((urn && validaUrn(urn)) || (ref !== undefined && ref !== '')) {
      quill.focus();
      alerta?.hide();
      dialogElem?.hide();
      dialogElem?.remove();
      elemento.norma = urn;
      store.dispatch(action.execute(elemento, urn, d));
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
  (tipoNorma as SlInput).focus();
}
