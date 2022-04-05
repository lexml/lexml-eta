import { Parlamentar } from './parlamentar';
export interface Autoria {
  tipo: string;
  parlamentares: Parlamentar[];
  indImprimirPartidoUF: boolean;
  qtdAssinaturasAdicionaisDeputados: number;
  qtdAssinaturasAdicionaisSenadores: number;
}
