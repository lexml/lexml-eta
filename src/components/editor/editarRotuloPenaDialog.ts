import { Elemento } from '../../model/elemento';
import { adicionarPenaAction, alterarRotuloPenaAction } from '../../model/lexml/acao/penaAction';
import { identidadeRotuloPena, ROTULOS_PENA, textoDoRotuloPena } from '../../model/lexml/numeracao/rotuloPena';

const OUTRO = 'Outro';

const escapaAtributo = (texto: string): string => texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const editarRotuloPenaDialog = (elemento: Elemento, quill: any, store: any, adicionando = false): void => {
  const dialogElem = document.createElement('sl-dialog') as any;
  document.body.appendChild(dialogElem);
  dialogElem.label = adicionando ? 'Adicionar pena, medida administrativa e outros' : 'Alterar rótulo';
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const identidadeAtual = adicionando ? ROTULOS_PENA[0] : identidadeRotuloPena(elemento.rotulo);
  const textoAtual = adicionando || identidadeAtual !== OUTRO ? '' : textoDoRotuloPena(elemento.rotulo);

  const radios = [...ROTULOS_PENA, OUTRO].map(opcao => `<sl-radio class="rotulo-pena-opcao" value="${escapaAtributo(opcao)}">${opcao}</sl-radio>`).join('');
  const content = document.createRange().createContextualFragment(`
    <sl-radio-group fieldset label="Selecione o rótulo:">${radios}</sl-radio-group>
    <sl-input class="rotulo-pena-outro" label="Rótulo" placeholder="Informe o rótulo" style="margin-top: 12px"></sl-input>
    <sl-button slot="footer" variant="default">Cancelar</sl-button>
    <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const opcoes = Array.from(content.querySelectorAll('sl-radio')) as any[];
  const campoOutro = content.querySelector('.rotulo-pena-outro') as any;
  const [cancelar, ok] = Array.from(content.querySelectorAll('sl-button')) as any[];

  let opcaoEscolhida = identidadeAtual;
  campoOutro.value = textoAtual;

  const atualizar = (): void => {
    const outro = opcaoEscolhida === OUTRO;
    campoOutro.disabled = !outro;
    ok.disabled = outro && (campoOutro.value ?? '').trim() === '';
  };

  opcoes.forEach(radio => {
    radio.checked = radio.value === opcaoEscolhida;
    const escolher = (): void => {
      opcaoEscolhida = radio.value;
      atualizar();
      if (opcaoEscolhida === OUTRO) {
        setTimeout(() => campoOutro.focus(), 0);
      }
    };
    radio.addEventListener('click', escolher);
    radio.addEventListener('sl-change', escolher);
  });
  campoOutro.addEventListener('sl-input', atualizar);

  const fechar = (): void => {
    dialogElem.hide();
    dialogElem.remove();
  };

  ok.onclick = (): void => {
    if (ok.disabled) {
      return;
    }
    const outro = opcaoEscolhida === OUTRO;
    const rotulo = outro ? (campoOutro.value as string).trim() : opcaoEscolhida;
    // Confirmar a opção que já identifica o rótulo atual não é uma alteração.
    const semAlteracao = !adicionando && !outro && opcaoEscolhida === identidadeAtual;
    if (adicionando) {
      store.dispatch(adicionarPenaAction.execute(elemento, rotulo));
    } else if (!semAlteracao) {
      store.dispatch(alterarRotuloPenaAction.execute(elemento, rotulo));
    }
    fechar();
  };

  cancelar.onclick = (): void => {
    quill.focus();
    fechar();
  };

  quill.blur();
  dialogElem.appendChild(content);
  atualizar();
  dialogElem.show();
  setTimeout(() => (opcaoEscolhida === OUTRO ? campoOutro : opcoes.find(r => r.value === opcaoEscolhida))?.focus(), 0);
};
