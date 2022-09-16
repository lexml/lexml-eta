import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { isDispositivoAlteracao } from './../model/lexml/hierarquia/hierarquiaUtil';
import { StringBuilder } from './../util/string-util';
import { CmdEmdUtil } from './comando-emenda-util';
import { isCaput, isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { TagNode } from '../util/tag-node';

export class CitacaoComandoSimples {
  public getTexto(d: Dispositivo, alteracaoNormaVigente = false): string {
    const sb = new StringBuilder();

    const rotulo = isCaput(d) ? d.pai!.rotulo : d.rotulo;
    const tagRotulo = new TagNode('Rotulo').add(rotulo?.trim());

    if (isAgrupadorNaoArticulacao(d)) {
      const tagLinhaRotulo = new TagNode('p').addAtributo('class', 'agrupador').add('“').add(tagRotulo);
      const tagLinhaDenominacao = new TagNode('p').addAtributo('class', 'agrupador').add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(d, alteracaoNormaVigente).trim()).add('”');
      sb.append(tagLinhaRotulo.toString());
      sb.append(tagLinhaDenominacao.toString());
    } else {
      const tagDispositivo = new TagNode('p').add('“').add(tagRotulo).add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(d, alteracaoNormaVigente));

      if (this.necessitaOmissis(d)) {
        const tagOmissis = new TagNode('p').add(new TagNode('Omissis')).add('”');
        sb.append(tagDispositivo.toString());
        sb.append(tagOmissis.toString());
      } else {
        tagDispositivo.add('”');
        sb.append(tagDispositivo.toString());
      }
    }

    return sb.toString();
  }

  private necessitaOmissis(d: Dispositivo): boolean {
    return this.temFilhoNaoSuprimido(d) && !isDispositivoAlteracao(d) && !isAgrupadorNaoArticulacao(d);
  }

  private temFilhoNaoSuprimido(d: Dispositivo): boolean {
    for (const f of d.filhos) {
      if (f.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
        return true;
      }
    }
    return false;
  }
}
