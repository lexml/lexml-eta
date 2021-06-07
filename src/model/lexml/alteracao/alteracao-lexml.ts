import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';

export class AlteracaoLexml2 /*  implements Alteracao */ {
  constructor(public articulacao: Articulacao) {}

  addFilho(filho: Dispositivo, referencia?: Dispositivo): void {
    this.articulacao.addFilho(filho, referencia);
  }
  addFilhoOnPosition(filho: Dispositivo, posicao: number): void {
    this.articulacao.addFilhoOnPosition(filho, posicao);
  }
  isLastFilho(filho: Dispositivo): boolean {
    throw this.articulacao.isLastFilho(filho);
  }
  indexOf(filho: Dispositivo): number {
    return this.articulacao.indexOf(filho);
  }
  removeFilho(filho: Dispositivo): void {
    this.articulacao.removeFilho(filho);
  }
  renumeraFilhos(): void {
    this.articulacao.renumeraFilhos();
  }

  get filhos(): Dispositivo[] {
    return this.articulacao.filhos;
  }

  get pai(): Dispositivo | undefined {
    return this.articulacao.pai;
  }

  get id(): string | undefined {
    return this.articulacao.id;
  }

  set id(id: string | undefined) {
    this.articulacao.id = id;
  }

  set numero(numero: string | undefined) {
    this.articulacao.numero = numero;
  }

  get numero(): string | undefined {
    return this.articulacao.numero;
  }

  get rotulo(): string | undefined {
    return this.articulacao.rotulo;
  }

  set rotulo(rotulo: string | undefined) {
    this.articulacao.rotulo = rotulo;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createRotulo(dispositivo?: Dispositivo): void {
    throw new Error('Method not implemented.');
  }

  hasDispositivos(): boolean {
    return this.articulacao.filhos.length > 0;
  }
}
