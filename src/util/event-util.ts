/* eslint-disable @typescript-eslint/no-explicit-any */
// Baseado no tutorial "Using Event Decorators with lit-element and Web Components"
//   https://coryrylan.com/blog/using-event-decorators-with-lit-element-and-web-components

export interface EventOptions {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

export class EventEmitter<T> {
  constructor(private target: HTMLElement, private eventName: string) {}

  emit(value: T, options?: EventOptions): void {
    this.target.dispatchEvent(
      new CustomEvent<T>(this.eventName, { detail: value, ...options })
    );
  }
}

export function event() {
  return (protoOrDescriptor: any, name: string): any => {
    const descriptor = {
      get(this: HTMLElement): EventEmitter<unknown> {
        return new EventEmitter(this, name !== undefined ? name : protoOrDescriptor.key);
      },
      enumerable: true,
      configurable: true,
    };

    return name !== undefined ? Object.defineProperty(protoOrDescriptor, name, descriptor) : { kind: 'method', placement: 'prototype', key: protoOrDescriptor.key, descriptor };
  };
}

export function cancelarPropagacaoDoEvento(ev: MouseEvent | KeyboardEvent | ClipboardEvent): void {
  ev.stopPropagation();
  ev.preventDefault();
}
