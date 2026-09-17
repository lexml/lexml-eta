import { formatDDMMYYYY } from '../../util/date-util';

export class Norma {
  urn = '';
  nomePreferido = '';
  nomesAlternativos = [];
  nomes = [];
  ementa = '';
  nomePorExtenso = '';

  constructor(urn = '', nomePreferido = '', nomePorExtenso = '', nomes = [], nomesAlternativos = [], ementa = '') {
    this.urn = urn;
    this.nomePreferido = nomePreferido;
    this.nomesAlternativos = nomesAlternativos;
    this.nomes = nomes;
    this.ementa = ementa;
    this.nomePorExtenso = nomePorExtenso;
  }

  public numero(): string {
    return this.urn.split(';')[1];
  }

  public tipo(): string {
    return this.urn.split(':')[4];
  }

  public sData(): string {
    return this.urn.split(':')[5].split(';')[0];
  }

  public data(): Date {
    const stringData = this.sData();
    return new Date(stringData);
  }

  public dataDDMMYYYY(): string {
    return formatDDMMYYYY(this.data());
  }
}
