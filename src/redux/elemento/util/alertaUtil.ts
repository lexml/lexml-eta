import { adicionarAlerta } from '../../../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../../../model/alerta/acao/removerAlerta';

export const alertarInfo = (mensagem: string): void => {
  const idAlert = 'alertaInfo';
  const currentAlert = document.getElementById(idAlert);

  if (!currentAlert) {
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: 'danger',
      closable: true,
      duration: 4000,
      innerHTML: `
          <sl-icon name="exclamation-octagon" slot="icon" id="${idAlert}"></sl-icon>
          ${mensagem}
        `,
    });
    document.body.append(alert);
    alert.toast();
  }
};

export const alertaGlobalEmendaSemPreenchimentoUtil = (open: boolean, rootStore: any, mensagem: string): void => {
  const id = 'alerta-global-emenda-nao-preenchida';

  if (open) {
    const alerta = {
      id: id,
      tipo: 'info',
      mensagem: mensagem,
      podeFechar: true,
      exibirComandoEmenda: true,
    };
    rootStore.dispatch(adicionarAlerta(alerta));
  } else {
    rootStore.dispatch(removerAlerta(id));
  }
};
