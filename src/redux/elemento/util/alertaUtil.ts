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
