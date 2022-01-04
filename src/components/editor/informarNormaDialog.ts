import { buildUrn, getData, getNumero, getTipo, validaUrn } from '../../model/documento/urnUtil';
import { Elemento } from '../../model/elemento';

export async function informarNormaDialog(elemento: Elemento, quill: any, store: any, action: any): Promise<any> {
  const dialogElem = document.createElement('elix-dialog');

  const content = document.createRange().createContextualFragment(`
    <style>
    h1.normaDiv {
      font-size: 1em;
      padding: 0.5em;
      font-weight: bold;
    }
    .normaDiv {
      display: grid;
      grid-template-columns: [labels] auto [controls] 1fr;
      grid-auto-flow: row;
      grid-gap: .8em;
      padding: 0.5em;
    }
    .normaDiv > label  {
      grid-column: labels;
      grid-row: auto;
    }
    .normaDiv > input,
    .normaDiv > select,
    .normaDiv > button {
      grid-column: controls;
      grid-row: auto;
      padding: 0.5em;
    }
  </style>
  <h1 class="normaDiv" for="normaDiv">Dados da norma vigente</h1>
  <div name="normaDiv" class="normaDiv">
    <label for="tipoNorma">Tipo </label>
      <select name="tipos" name="tipoNorma" id="tipoNorma">      
      <option value="decreto">Decreto</option>
      <option value="decreto-lei">Decreto-Lei</option>
      <option value="lei" selected>Lei</option>
      <option value="lei.complementar">Lei Complementar</option>
      <option value="lei.delegada">Lei Delegada</option>
      <option value="medida.provisoria">Medida Provisória</option>
    </select>    
    <label for="numeroNorma">Número </label>
    <input type="text" name="numeroNorma" id="numeroNorma" placeholder="8666 (número sem ponto)">
    <label for="dataNorma">Data</label>
    <input type="text" name="dataNorma" id="dataNorma" placeholder="21/06/1993">

    <div style="margin-top: 10px;">
      <button>Ok</button>
      <button>Cancelar</button>
    </div>
    <div class="erro" style="margin-top: 10px; color: red; display: none;"></div>

  </div>


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
    (data! as HTMLInputElement).value = d;
  }

  const botoes = content.querySelectorAll('button');
  const ok = botoes[0];
  const cancelar = botoes[1];
  const erro = <HTMLDivElement>content.querySelector('.erro');

  ok.onclick = (): void => {
    const urn = buildUrn('federal', (tipoNorma! as HTMLSelectElement).value, (numero as HTMLInputElement)?.value, (data as HTMLInputElement)?.value);

    if (validaUrn(urn)) {
      quill.focus();
      (<any>dialogElem).close();

      erro.style.display = 'none';
      elemento.norma = urn;
      store.dispatch(action.execute(elemento));
    } else {
      erro.innerText = 'Dados inválidos';
      erro.style.display = 'block';
    }
  };

  cancelar.onclick = (): void => {
    quill.focus();
    (<any>dialogElem).close();
  };

  dialogElem.appendChild(content);

  await (<any>dialogElem).open();
}
