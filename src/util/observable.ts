export class Subscription {
  private canceled?: boolean;

  constructor(public callback: any, canceled?: boolean) {
    this.canceled = canceled;
  }

  isCanceled(): boolean {
    return this.canceled ?? false;
  }

  cancel(): void {
    this.canceled = true;
  }
}

export class Observable<T = void> {
  private subscriptions: Subscription[];

  constructor() {
    this.subscriptions = [];
  }

  subscribe(callback: any): Subscription {
    const inscricao: Subscription = new Subscription(callback);
    this.subscriptions.push(inscricao);
    return inscricao;
  }

  notify(data: T): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      if (!subscription.isCanceled()) {
        setTimeout(() => {
          subscription.callback(data);
        }, 1);
      }
    });
  }

  clean(): void {
    this.subscriptions = [];
  }
}
