import { SlButton, SlInput } from '@shoelace-style/shoelace';
import { Anexo } from '../../model/emenda/emenda';

export async function uploadAnexoDialog(anexos: Anexo[], atualizaAnexo: (Anexo) => any): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Enviar Anexo';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <div id="wp-upload">
    <sl-input id="input-upload" type="file" size="small" label="Selecione abaixo o arquivo com o qual gostaria de referenciar em seu texto"></sl-input>
  </div>
  <br/>
  <div id="form" class="input-validation-required"></div>
  <br/>
  <sl-button class="controls" slot="footer" variant="primary">Confirmar</sl-button>
  <sl-button class="controls" slot="footer" variant="default">Fechar</sl-button>
  `);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removerAnexo = (e: MouseEvent) => {
    const nomeArquivo = (e.target as SlButton).getAttribute('nomeArquivo');
    anexos = anexos.filter(a => a.nomeArquivo !== nomeArquivo);
    conteudoDinamico();
  };

  const conteudoDinamico = (): void => {
    let htmlConteudo = '';
    wpUpload.hidden = anexos.length ? true : false;

    anexos.forEach(a => (htmlConteudo += `<p><span>${a.nomeArquivo}</span><sl-button class="btn-remove-anexo" size="small" nomeArquivo="${a.nomeArquivo}">X</sl-button></p>`));
    form!.innerHTML = htmlConteudo;
    const btns = form?.querySelectorAll('.btn-remove-anexo');
    (btns || []).forEach(btn => (btn.onclick = removerAnexo));
  };

  const wpUpload = content.querySelector('#wp-upload') as HTMLDivElement;
  const inputUpload = content.querySelector('#input-upload') as SlInput;
  const form = content.querySelector('#form');
  const botoes = content.querySelectorAll('.controls');
  const confirmar = botoes[0] as SlButton;
  const fechar = botoes[1] as SlButton;

  inputUpload.oninput = (): void => {
    addAnexo();
  };

  confirmar.onclick = (): void => {
    atualizaAnexo(anexos);
    dialogElem?.hide();
    dialogElem?.remove();
    anexos = [];
  };

  fechar.onclick = (): void => {
    dialogElem?.hide();
    dialogElem?.remove();
    anexos = [];
  };

  const addAnexo = async () => {
    if (inputUpload?.input?.files) {
      const file = inputUpload.input.files[0];
      const anexo = await convertAnexo(file);
      anexos.push(anexo);
      inputUpload.input.files = null;
      conteudoDinamico();
    }
  };

  const convertAnexo = (file): Promise<Anexo> => {
    return new Promise((resolve, reject) => {
      confirmar.disabled = true;
      fechar.disabled = true;
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        confirmar.disabled = false;
        fechar.disabled = false;
        resolve({ nomeArquivo: file.name, base64: fileReader.result?.toString() || '' });
      };
      fileReader.onerror = error => reject(error);
    });
  };

  conteudoDinamico();
  await dialogElem.appendChild(content);
  await dialogElem.show();
}
