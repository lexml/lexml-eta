import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { removeEspacosDuplicados } from '../util/string-util';

export class CmdEmdAdicaoArtigoOndeCouber {
  constructor(private dispositivos: Dispositivo[]) {}

  getTexto(refGenericaProjeto: NomeComGenero): string {
    // "Acrescente-se, onde couber, no Projeto o seguinte artigo:"
    // "Acrescentem-se, onde couber, no Projeto os seguintes artigos:"

    if (!this.dispositivos.length) {
      return '';
    }

    let texto;

    const strRefProjeto = refGenericaProjeto.genero.contracaoEmArtigoDefinidoSingular + ' ' + refGenericaProjeto.nome;

    if (this.dispositivos.length > 1) {
      texto = 'Acrescentem-se, onde couber, ' + strRefProjeto + ' os seguintes artigos:';
    } else {
      texto = 'Acrescente-se, onde couber, ' + strRefProjeto + ' o seguinte artigo:';
    }

    return removeEspacosDuplicados(texto);
  }
}
