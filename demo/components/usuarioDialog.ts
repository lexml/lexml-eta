import { SlDialog } from '@shoelace-style/shoelace';
// import { atualizarUsuarioRevisao } from '../../model/alerta/acao/adicionaUsuarioRevisao';

const SVG_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
<path d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519941
9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115
23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776
18.6668C23.2962 16.6934 24 14.3734 24 12C24 10.4241 23.6896 8.8637 23.0866 7.4078C22.4835 5.95189 21.5996 4.62902
20.4853 3.51472C19.371 2.40042 18.0481 1.5165 16.5922 0.913445C15.1363 0.310389 13.5759 0 12 0V0ZM12 18C11.7627 18
11.5307 17.9296 11.3333 17.7978C11.136 17.6659 10.9822 17.4785 10.8913 17.2592C10.8005 17.0399 10.7768 16.7987 10.8231
16.5659C10.8694 16.3331 10.9837 16.1193 11.1515 15.9515C11.3193 15.7836 11.5331 15.6694 11.7659 15.6231C11.9987
15.5768 12.24 15.6005 12.4592 15.6913C12.6785 15.7822 12.8659 15.936 12.9978 16.1333C13.1296 16.3307 13.2 16.5627
13.2 16.8C13.2 17.1183 13.0736 17.4235 12.8485 17.6485C12.6235 17.8736 12.3183 18 12 18ZM13.2 13.2C13.2 13.5183 13.0736
13.8235 12.8485 14.0485C12.6235 14.2736 12.3183 14.4 12 14.4C11.6817 14.4 11.3765 14.2736 11.1515 14.0485C10.9264 13.8235
10.8 13.5183 10.8 13.2V7.2C10.8 6.88174 10.9264 6.57651 11.1515 6.35147C11.3765 6.12643 11.6817 6 12 6C12.3183 6
12.6235 6.12643 12.8485 6.35147C13.0736 6.57651 13.2 6.88174 13.2 7.2V13.2Z" fill="#3982C1"/>
</svg>`;

const MODAL_USUARIO = 'modalUsuario';

export const createUsuarioDialog = (rootStore: any): void => {
  Array.from(document.querySelectorAll('.usuario')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.classList.add('usuario');
  dialogElem.id = 'modalUsuario';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Usuário';

  const content = document.createRange().createContextualFragment(`
    <style>
      .rodape-confirmar {
        float: right;
      }
      .usuario {
        font-weight: normal;
      }
      .inputUsuario {
        width: 60%;
      }
      .rodape-confirmar {
        float: right;
      }
      sl-dialog::part(title) {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
    </style>
      <div class="usuario">
        <div class="inputUsuario">
          <sl-form class="form-overview">
            <sl-input id="usuario" label="Informe o usuário da revisão"></sl-input>
          <sl-form class="form-overview">
        </div>
        <br/>
      </div>

      <div class="rodape-confirmar" id="rodapeConfirmar">
      <br/>
        <sl-button id="btnConfirmar" slot="footer" variant="primary">Confirmar</sl-button>
        <sl-button slot="footer" variant="default">Fechar</sl-button>
      </div>
  `);

  buildButtons(content, dialogElem, rootStore);
  dialogElem.appendChild(content);
  dialogElem.show();

  setTimeout(() => addIconBeforeTitle(), 0);
};

const buildButtons = (content: DocumentFragment, dialogElem: SlDialog, rootStore: any): void => {
  const botoes = content.querySelectorAll('sl-button');

  const confirma = botoes[0];
  const fechar = botoes[1];

  fechar.onclick = (): void => {
    fecharDialog(dialogElem);
  };

  confirma.onclick = (): void => {
    confirmar(rootStore, dialogElem);
  };
};

const fecharDialog = (dialogElem: SlDialog): void => {
  dialogElem?.hide();
  if (document.body.contains(dialogElem)) {
    document.body.removeChild(dialogElem);
  }
};

const confirmar = (rootStore: any, dialogElem: SlDialog): void => {
  if (getUsuarioModalInformado() !== '') {
    // rootStore.dispatch(atualizarUsuarioRevisao({ nome: getUsuarioRevisaoModalInformado(), id: 'id' }));
    fecharDialog(dialogElem);
  }
};

const addIconBeforeTitle = (): void => {
  const elDialogTitle = document.querySelector('#' + MODAL_USUARIO)!.shadowRoot!.querySelector('#title');
  elDialogTitle?.insertAdjacentHTML('afterbegin', SVG_INFO);
};

export const getUsuarioModalInformado = (): string => {
  const content = document.getElementById('usuario') as any;
  const input = content!.input;
  return input.value;
};
