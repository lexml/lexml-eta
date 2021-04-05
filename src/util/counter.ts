export interface Counter {
  next(): number;
}

export function generateId(init = 0): Counter {
  return {
    next: (): number => ++init,
  };
}

export const Counter = generateId();
