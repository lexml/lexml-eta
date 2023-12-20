import { atualizarNotaAlteracaoAction } from './../../model/lexml/acao/atualizarNotaAlteracaoAction';
import { Elemento } from '../../model/elemento';

export const editarNotaAlteracaoDialog = (elemento: Elemento, quill: any, store: any): void => {
  if (podeMostrarDialog(elemento)) {
    const dialogElem = document.createElement('sl-dialog');
    document.body.appendChild(dialogElem);
    dialogElem.label = 'Nota de alteração';
    dialogElem.addEventListener('sl-request-close', (event: any) => {
      if (event.detail.source === 'overlay') {
        event.preventDefault();
      }
    });

    const content = document.createRange().createContextualFragment(`
    <sl-radio-group fieldset label="Selecione o tipo de nota de alteração:">
      <sl-radio class="nota" id="nota-nr" value="NR">Nova redação '(NR)'</sl-radio>
      <sl-radio class="nota" id="nota-vazia" value="">Sem nota de alteração</sl-radio>
    </sl-radio-group>
    <sl-button slot="footer" variant="default">Cancelar</sl-button>
    <sl-button slot="footer" variant="primary">Ok</sl-button>
    `);

    const opcoes = {
      NR: content.querySelector('#nota-nr'),
      VZ: content.querySelector('#nota-vazia'),
    };

    const notaAlteracao = elemento.notaAlteracao === 'AC' ? undefined : elemento.notaAlteracao;
    opcoes[notaAlteracao || 'VZ'].checked = true;

    const botoes = content.querySelectorAll('sl-button');
    const cancelar = botoes[0];
    const ok = botoes[1];

    ok.onclick = (): void => {
      const newValue = (document.querySelector('sl-radio.nota[aria-checked="true"]') as any).value;
      if (elemento.notaAlteracao !== newValue) {
        store.dispatch(atualizarNotaAlteracaoAction.execute(elemento, newValue));
      }
      dialogElem?.hide();
      dialogElem?.remove();
    };

    cancelar.onclick = (): void => {
      quill.focus();
      dialogElem?.hide();
      dialogElem?.remove();
    };

    quill.blur();
    dialogElem.appendChild(content);
    dialogElem.show();
    setTimeout(() => {
      opcoes[elemento.notaAlteracao || 'VZ'].focus();
    }, 0);
  }
};

const podeMostrarDialog = (elemento: Elemento): boolean => {
  if (elemento.revisao) {
    if (elemento.revisao.descricao === 'Dispositivo removido') {
      return false;
    }
  }
  return true;
};
