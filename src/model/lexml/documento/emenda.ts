import { Classificacao } from '../../documento';
import { ClassificacaoDocumento } from '../../documento/classificacao';

export class Emenda implements Classificacao {
  classificacao: ClassificacaoDocumento.EMENDA | ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER = ClassificacaoDocumento.EMENDA;
  proposicao = new RefProposicaoEmendada();
  dispositivosSuprimidos: DispositivoEmendaSuprimido[] = [];
  dispositivosModificados: DispositivoEmendaModificado[] = [];
  dispositivosAdicionados: DispositivoEmendaAdicionado[] = [];
  comandoEmenda = new ComandoEmenda();
  justificativa = '';
}

class RefProposicaoEmendada {
  urn = '';
  identificacao = ''; // sigla número/ano
}

export class DispositivoEmenda {
  id = ''; // ID LexML
  rotulo?: string;
}

export class DispositivoEmendaSuprimido extends DispositivoEmenda {}

export class DispositivoEmendaModificado extends DispositivoEmenda {
  texto = '';
}

export class DispositivoEmendaAdicionado extends DispositivoEmenda {
  idPai?: string;
  idIrmaoAnterior?: string;
  texto = '';
  urnNormaAlterada?: string;
  textoOmitido?: boolean;
  abreAspas?: boolean;
  fechaAspas?: boolean;
}

export class ComandoEmenda {
  cabecalhoComum?: string;
  comandos: ItemComandoEmenda[] = [];
}

export class ItemComandoEmenda {
  constructor(public cabecalho: string, public citacao?: string) {}
}
