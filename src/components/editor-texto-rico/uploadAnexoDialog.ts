import { SlButton } from '@shoelace-style/shoelace';
import { Anexo } from '../../model/emenda/emenda';

export async function uploadAnexoDialog(anexos: Anexo[], atualizaAnexo: (Anexo) => any, editorTextoRico: any): Promise<any> {
  const dialogElem = document.createElement('sl-dialog');
  editorTextoRico.appendChild(dialogElem);
  //tamanhoMaximoAnexo = editorTextoRico.lexmlEtaConfig.tamanhoMaximoAnexo;
  dialogElem.label = 'Anexo';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style>
    .anexo-item {
      display: flex;
      align-items: center;
      gap: 0.5em;
      margin-bottom: 1em;
    }

    sl-icon[name="paperclip"] {
      width: 1.5em;
      height: 1.5em;
    }

    sl-button sl-icon {
      font-size: 1.5em;
      pointer-events: none;
      vertical-align: -4px;
    }

    #input-upload::part(form-control) {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 1em;
    }
  </style>
  <div id="wp-upload">
    <label for="input-upload">Selecione o arquivo a ser anexado à emenda</label>
    <br/>
    <br/>
    <input id="input-upload" type="file" accept="application/pdf" size="small"></input>
    <br/>
    <label class="tipoErrado" style="color: red;" hidden="true" id="tipoErrado">Esse arquivo não é um PDF</label>
    <br/>
    <label class="tamanhoMaximoAtingido" style="color: red;" hidden="true" id="tamanhoMaximoAtingido">Ultrapassou o tamanho máximo permitido (${Math.trunc(
      editorTextoRico.lexmlEtaConfig.tamanhoMaximoAnexo / 1024
    )}MB)</label>
  </div>
  <br/>
  <div id="form" class="input-validation-required"></div>
  <br/>
  <sl-button id="btnConfirmarAnexo" class="controls" slot="footer" variant="primary">Confirmar</sl-button>
  <sl-button class="controls" slot="footer" variant="default">Cancelar</sl-button>
  `);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removerAnexo = (e: MouseEvent) => {
    const nomeArquivo = (e.target as SlButton).getAttribute('nomeArquivo');
    anexos = anexos.filter(a => a.nomeArquivo !== nomeArquivo);
    conteudoDinamico();
  };

  // cria função para exibir anexo em nova aba
  const exibirAnexo = (e: MouseEvent) => {
    const nomeArquivo = (e.target as SlButton).getAttribute('nomeArquivo');
    const anexo = anexos.find(a => a.nomeArquivo === nomeArquivo);
    const win = window.open();

    if (anexo?.nomeArquivo?.match(/\.(pdf)$/)) {
      win?.document.write(`<embed src="${anexo?.base64}" width="100%" height="100%" type="application/pdf"></embed>`);
      return;
    }
    if (anexo?.nomeArquivo?.match(/\.(jpeg|jpg|gif|png|svg)$/)) {
      win?.document.write(`<img src="${anexo?.base64}" style="width:100%; height:auto;">`);
      return;
    }
    win?.document.write(`<a href="${anexo?.base64}" download="${anexo?.nomeArquivo}">Download do arquivo anexo</a>`);
  };

  const conteudoDinamico = (): void => {
    let htmlConteudo = '';
    wpUpload.hidden = anexos.length ? true : false;

    anexos.forEach(
      a =>
        (htmlConteudo += `<span class="anexo-item">
                            <sl-icon name="paperclip"></sl-icon>
                            <a download="${a.nomeArquivo}" href="data:application/pdf;base64,${a.base64}">
                              <span>
                                ${a.nomeArquivo}
                              </span>
                            </a>
                            <!--
                            <sl-button class="btn-preview-anexo" size="small" title="Visualizar o anexo em uma nova janela" nomeArquivo="${a.nomeArquivo}">
                              <sl-icon name="eye"></sl-icon>
                            </sl-button>
                            -->
                            <sl-button class="btn-remove-anexo" size="small" title="Remover anexo" nomeArquivo="${a.nomeArquivo}">
                              <sl-icon name="x"></sl-icon>
                            </sl-button>
                          </span>`)
    );
    form!.innerHTML = htmlConteudo;
    const btns = form?.querySelectorAll('.btn-remove-anexo');
    (btns || []).forEach(btn => (btn.onclick = removerAnexo));
    const btns_preview = form?.querySelectorAll('.btn-preview-anexo');
    (btns_preview || []).forEach(btn_preview => (btn_preview.onclick = exibirAnexo));
  };

  const wpUpload = content.querySelector('#wp-upload') as HTMLDivElement;
  const inputUpload = content.querySelector('#input-upload') as HTMLInputElement;
  const form = content.querySelector('#form');
  const botoes = content.querySelectorAll('.controls');
  const confirmar = botoes[0] as SlButton;
  const fechar = botoes[1] as SlButton;

  inputUpload.oninput = (): void => {
    addAnexo(editorTextoRico);
  };

  confirmar.onclick = (): void => {
    atualizaAnexo(anexos);
    agendarEmissaoEventoOnChange(dialogElem);
    dialogElem?.hide();
    dialogElem?.remove();
    anexos = [];
  };

  fechar.onclick = (): void => {
    dialogElem?.hide();
    dialogElem?.remove();
    anexos = [];
  };

  const agendarEmissaoEventoOnChange = (elemento: HTMLElement): void => {
    elemento.dispatchEvent(
      new CustomEvent('onchange', {
        bubbles: true,
        composed: true,
        detail: {
          origemEvento: 'anexo',
        },
      })
    );
  };

  const addAnexo = async (editorTextoRico: any) => {
    if (inputUpload?.files) {
      const file = inputUpload.files[0];

      const listaRestricoes = restricoes(file, editorTextoRico);

      if (listaRestricoes.length === 0) {
        const anexo = await convertAnexo(file);
        anexos.push(anexo);
        inputUpload.files = null;
        conteudoDinamico();
        document.getElementById('btnConfirmarAnexo')?.removeAttribute('disabled');
      } else {
        document.getElementById('btnConfirmarAnexo')?.setAttribute('disabled', 'true');

        listaRestricoes.forEach(restricao => {
          document.getElementById(restricao)?.removeAttribute('hidden');
        });

        listaRestricoesCompleta.forEach(restricaoCompleta => {
          if (!listaRestricoes.includes(restricaoCompleta)) {
            document.getElementById(restricaoCompleta)?.setAttribute('hidden', 'true');
          }
        });
      }
    }
  };

  const listaRestricoesCompleta: string[] = ['tamanhoMaximoAtingido', 'tipoErrado'];

  const restricoes = (file: any, editorTextoRico: any): string[] => {
    const restricoes: string[] = [];
    if (file) {
      const size = Math.round(file.size / 1024);

      if (size > editorTextoRico.lexmlEtaConfig.tamanhoMaximoAnexo) {
        restricoes.push('tamanhoMaximoAtingido');
      }

      if (file.type !== 'application/pdf') {
        restricoes.push('tipoErrado');
      }

      if (restricoes.length > 0) {
        restricoes.push('restricao');
      }
    }

    //const retorno = file && file.type === 'application/pdf' && size <= 4096;
    return restricoes;
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
        resolve({ nomeArquivo: file.name, base64: (fileReader.result?.toString() || '').replace(/.*;base64,/, '') });
      };
      fileReader.onerror = error => reject(error);
    });
  };

  conteudoDinamico();
  await dialogElem.appendChild(content);
  await dialogElem.show();
  setTimeout(() => {
    inputUpload.focus();
  }, 0);
}
