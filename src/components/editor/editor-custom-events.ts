let timerTextChange: any = undefined;

function emitirEventoTextChange(eventTarget: EventTarget, origemEvento: string): void {
  eventTarget.dispatchEvent(
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
  textChange(eventTarget: EventTarget, origemEvento: string, debounce: boolean): void {
    if (debounce) {
      clearTimeout(timerTextChange);
      timerTextChange = setTimeout(() => emitirEventoTextChange(eventTarget, origemEvento), 1000);
    } else {
      emitirEventoTextChange(eventTarget, origemEvento);
    }
  },
};
