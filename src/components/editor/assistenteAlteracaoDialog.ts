import { SlInput } from '@shoelace-style/shoelace';
import { Elemento } from '../../model/elemento';
import { Norma } from '../../model/emenda/norma';
import { validaDispositivoAssistente } from '../../model/lexml/numeracao/parserReferenciaDispositivo';
import './autocomplete-norma';

export async function assistenteAlteracaoDialog(elemento: Elemento, quill: any, store: any, action: any, urlAutocomplete: string): Promise<any> {
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
  <autocomplete-norma id="auto-norma" urlAutocomplete="${urlAutocomplete}"></autocomplete-norma>
  <br />
    <sl-input name="dispositivos" id="dispositivos" placeholder="ex: inciso I do § 3º do Art.1º" label="Dispositivo da norma" clearable></sl-input>
    <span class="ajuda">Informar apenas um dispositivo. Depois poderão ser adicionados outros.</span>
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

  let normaAlteracao: Norma = new Norma();
  const autocompleteNorma = content.querySelector('#auto-norma');
  const dispositivos = content.querySelector('#dispositivos');
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

  autocompleteNorma!['onSelect'] = (norma): void => {
    normaAlteracao = norma;
  };

  ok.onclick = (): void => {
    let temErro = false;
    const textoDispositivo = (dispositivos as HTMLInputElement)?.value;

    preencheAlerta();

    if (!normaAlteracao.urn) {
      preencheAlerta('Dados inválidos', 'Identifique uma norma a ser alterada.');
      temErro = true;
    } else if (textoDispositivo && textoDispositivo.length > 0) {
      try {
        validaDispositivoAssistente(textoDispositivo);
      } catch (err) {
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
      elemento.norma = normaAlteracao.urn;
      store.dispatch(action.execute(elemento, normaAlteracao.urn, textoDispositivo));
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
  (autocompleteNorma as SlInput).focus();
}
