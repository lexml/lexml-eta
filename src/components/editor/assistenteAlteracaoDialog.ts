import { SlInput } from '@shoelace-style/shoelace';
import { Elemento } from '../../model/elemento';
import { buildUrn, validaUrn } from '../../model/lexml/documento/urnUtil';
import { validaDispositivoAssistente } from '../../model/lexml/numeracao/parserReferenciaDispositivo';

export async function assistenteAlteracaoDialog(elemento: Elemento, quill: any, store: any, action: any): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Assistente de alteração de norma';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style>
    .ajuda {
      font-size: var(--sl-font-size-small);
      font-weight: normal;
    }

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

    <sl-radio-group label="Data" fieldset>

      <sl-radio name="informarData" id="informarDataCompleta" value="informarDataCompleta" checked="true">
        <sl-input label="Dia" type="date" name="dataNorma" id="dataNorma" size="small" clearable></sl-input>
      </sl-radio>

      <sl-radio name="informarData" id="informarApenasAno" value="informarApenasAno">
        <sl-input label="Ano" type="number" name="anoNorma" id="anoNorma" size="small"></sl-input>
      </sl-radio>

    </sl-radio-group>
    <p>
    <sl-input name="dispositivos" id="dispositivos" placeholder="ex: inciso I do § 3º do Art.1º" label="Dispositivo da norma" clearable></sl-input>
    </p>
    <p class="ajuda" style="margin-block-end: 0;">
      Terminar sempre com o artigo, por exemplo:
    </p>
    <ul class="ajuda" style="margin-block-start: .3em; margin-block-end: 0;">
      <li>item 9 da alínea b do inciso V do parágrafo 4º do artigo 12-B</li>
      <li>ali c, inc X, par 6, art 1</li>
      <li>§ 8 art 32</li>
      <li>parágrafo único do art 7º</li>
    </ul>
  </div>
  <br/>
  <sl-alert variant="warning" closable class="alert-closable">
    <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
    <strong>Dados inválidos.</strong><br/>
    <span>Revise os dados informados.</span>
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
  const alertaMensagem = alerta!.querySelector('strong');
  const alertaComplemento = alerta!.querySelector('span');

  const preencheAlerta = (mensagem = 'Dados inválidos.', complemento = 'Revise os dados informados.'): void => {
    alertaMensagem!['innerHTML'] = mensagem;
    alertaComplemento!['innerHTML'] = complemento;
  };

  informarDataCompleta!['onclick'] = (): void => {
    anoNorma!['disabled'] = true;
    anoNorma!['value'] = '';
    dataNorma!['disabled'] = false;
    (dataNorma as SlInput).focus();
  };
  informarApenasAno!['onclick'] = (): void => {
    anoNorma!['disabled'] = false;
    dataNorma!['disabled'] = true;
    dataNorma!['value'] = '';
    (anoNorma as SlInput).focus();
  };
  anoNorma!['onkeydown'] = (event: KeyboardEvent): void => {
    if (anoNorma!['value'].length > 3 && event.key !== 'Backspace') {
      event.preventDefault();
    }
  };

  ok.onclick = (): void => {
    let urn;

    const d = (dispositivos as HTMLInputElement)?.value;

    preencheAlerta();

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

    let temErro = false;
    if (!urn || !validaUrn(urn)) {
      preencheAlerta('Dados inválidos', 'Complete a identificação da norma a ser alterada.');
      temErro = true;
    } else if (d && d.length > 0) {
      try {
        validaDispositivoAssistente(d);
      } catch (err) {
        console.log('erro', err);
        console.log(alertaMensagem);
        preencheAlerta('Dispositivo da norma não identificado.', 'Informe apenas um dispositivo em um dos formatos acima. Depois será possível alterar outros dispositivos.');
        temErro = true;
      }
    } else {
      preencheAlerta('Informe o dispositivo da norma a ser alterada.', 'Informe apenas um dispositivo em um dos formatos acima. Depois será possível alterar outros dispositivos.');
      temErro = true;
    }

    if (!temErro) {
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
