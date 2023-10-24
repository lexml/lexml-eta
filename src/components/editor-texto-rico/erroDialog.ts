import { SlButton } from '@shoelace-style/shoelace';

export async function erroDialog(editorTextoRico: any, mensagem: string): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');
  editorTextoRico.appendChild(dialogElem);
  dialogElem.label = 'Erro';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style>

    sl-icon[name="paperclip"] {
      width: 1.5em;
      height: 1.5em;
    }

    sl-button sl-icon {
      font-size: 1.5em;
      pointer-events: none;
      vertical-align: -4px;
    }
  </style>
  <div id="wp-upload">    
    <label style="color: red;">${mensagem}</label>    
  </div>
  <br/>
  
  <sl-button class="controls" slot="footer" variant="default">Fechar</sl-button>
  `);

  const botoes = content.querySelectorAll('.controls');
  const fechar = botoes[0] as SlButton;

  fechar.onclick = (): void => {
    dialogElem?.hide();
    dialogElem?.remove();
  };

  await dialogElem.appendChild(content);
  await dialogElem.show();
}
