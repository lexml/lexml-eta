let timerTextChanged: any = undefined;

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
    if (!debounce || !timerTextChanged) {
      emitirEventoTextChange(elemento, origemEvento);
    }

    clearTimeout(timerTextChanged);
    timerTextChanged = setTimeout(() => (timerTextChanged = null), 300);
  },
};
