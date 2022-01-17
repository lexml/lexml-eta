let timerTextChange: any = undefined;

function emitirEventoTextChange(elemento: EventTarget, origemEvento: string): void {
  // console.log(origemEvento);

  elemento.dispatchEvent(
    new CustomEvent('ontextchange', {
      bubbles: true,
      composed: true,
      detail: {
        origemEvento,
      },
    })
  );
}

export default {
  textChange(elemento: EventTarget, origemEvento: string, debounce: boolean): void {
    if (debounce) {
      clearTimeout(timerTextChange);
      timerTextChange = setTimeout(() => emitirEventoTextChange(elemento, origemEvento), 1000);
    } else {
      emitirEventoTextChange(elemento, origemEvento);
    }
  },
};
