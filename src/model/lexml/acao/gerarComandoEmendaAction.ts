export const GERAR_COMANDO_EMENDA = 'GERAR_COMANDO_EMENDA';

class GerarComandoEmenda {
  descricao: string;

  constructor() {
    this.descricao = 'Gerar Comando de Emenda';
  }

  execute(urn: string): any {
    return {
      type: GERAR_COMANDO_EMENDA,
      urn,
    };
  }
}
export const gerarComandoEmendaAction = new GerarComandoEmenda();
