import { Parlamentar } from './parlamentar';

const novoParlamentar: Parlamentar = {
  id: '',
  nome: '',
  siglaPartido: '',
  siglaUF: '',
  indSexo: '',
  siglaCasa: '',
  cargo: '',
};

export const incluirParlamentar = (parlamentares: Parlamentar[], parlamentar: Parlamentar): Parlamentar[] => {
  const novoArray = [...parlamentares];
  novoArray.push(parlamentar);
  return novoArray;
};

export const incluirNovoParlamentar = (parlamentares: Parlamentar[]): Parlamentar[] => incluirParlamentar(parlamentares, { ...novoParlamentar });

export const excluirParlamentar = (parlamentares: Parlamentar[], index: number): Parlamentar[] => {
  const novoArray = [...parlamentares];
  novoArray.splice(index, 1);
  return novoArray;
};

export const moverParlamentar = (parlamentares: Parlamentar[], index: number, deslocamento: number): Parlamentar[] => {
  const newIndex = index + deslocamento;

  if (newIndex < 0 || newIndex >= parlamentares.length) {
    return parlamentares;
  }

  const novoArray = [...parlamentares];
  novoArray.splice(newIndex, 0, novoArray.splice(index, 1)[0]);
  return novoArray;
};
