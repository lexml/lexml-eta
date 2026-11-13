interface OpcoesAlertaInfo {
  variante?: 'danger' | 'warning';
  duracao?: number;
  icone?: string;
}

export const alertarInfo = (mensagem: string, { variante = 'danger', duracao = 4000, icone = 'exclamation-octagon' }: OpcoesAlertaInfo = {}): void => {
  const idAlert = 'alertaInfo';
  const currentAlert = document.getElementById(idAlert);

  if (!currentAlert) {
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: variante,
      closable: true,
      duration: duracao,
      innerHTML: `
          <sl-icon name="${icone}" slot="icon" id="${idAlert}"></sl-icon>
          ${mensagem}
        `,
    });
    document.body.append(alert);
    alert.toast();
  }
};
