export interface DispositivoAlteracaoEmenda {
  id: string;
  rotulo: string;
  texto?: string;
}

export interface DispositivoAdicionadoPelaEmenda extends DispositivoAlteracaoEmenda {
  idIrmaoAnterior?: string;
  idPai?: string;
}

export interface AlteracoesEmenda {
  dispositivosAdicionados?: DispositivoAdicionadoPelaEmenda[];
  dispositivosModificados?: DispositivoAlteracaoEmenda[];
  dispositivosSuprimidos?: DispositivoAlteracaoEmenda[];
}
