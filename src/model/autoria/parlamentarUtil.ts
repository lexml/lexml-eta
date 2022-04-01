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

export const incluirNovoParlamentar = (parlamentares: Parlamentar[]): Parlamentar[] => {
  return incluirParlamentar(parlamentares, { ...novoParlamentar, id: 'novo' + (parlamentares.length + 1) });
};

export const excluirParlamentar = (parlamentares: Parlamentar[], parlamentar: Parlamentar): Parlamentar[] => {
  return parlamentares.filter(p => p.id !== parlamentar.id);
};

export const moverParlamentar = (parlamentares: Parlamentar[], parlamentar: Parlamentar, deslocamento: number): Parlamentar[] => {
  const index = parlamentares.findIndex(p => p.id === parlamentar.id);
  const newIndex = index + deslocamento;

  if (newIndex < 0 || newIndex >= parlamentares.length) {
    return parlamentares;
  }

  const novoArray = [...parlamentares];
  novoArray.splice(newIndex, 0, novoArray.splice(index, 1)[0]);
  return novoArray;
};
