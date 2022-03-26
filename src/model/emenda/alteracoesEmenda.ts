export interface DispositivoAlteracaoEmenda {
  id: string;
  rotulo: string;
  texto?: string;
}

export interface DispositivoAdicionadoPelaEmenda extends DispositivoAlteracaoEmenda {
  tipo?: string;
  idIrmaoAnterior?: string;
  idPai?: string;
}

export interface AlteracoesEmenda {
  dispositivosAdicionados?: DispositivoAdicionadoPelaEmenda[];
  dispositivosModificados?: DispositivoAlteracaoEmenda[];
  dispositivosSuprimidos?: DispositivoAlteracaoEmenda[];
}
