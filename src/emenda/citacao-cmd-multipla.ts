import { isAgrupadorNaoArticulacao, isEmenta } from './../model/dispositivo/tipo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { isArtigo, isCaput } from '../model/dispositivo/tipo';
import { StringBuilder } from '../util/string-util';
import { TagNode } from '../util/tag-node';
import { Artigo, Dispositivo } from './../model/dispositivo/dispositivo';
import {
  getDispositivoCabecaAlteracao,
  isArticulacaoAlteracao,
  isAscendente,
  isDescendenteDeSuprimido,
  isDispositivoCabecaAlteracao,
  isUltimaAlteracao,
} from './../model/lexml/hierarquia/hierarquiaUtil';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivoComparator } from './dispositivo-comparator';

export class CitacaoComandoMultipla {
  private ultimoProcessado?: Dispositivo;
  private emAlteracao = false;

  public getTexto(dispositivos: Dispositivo[], abreAspas = true, fechaAspas = true): string {
    let arvoreDispositivos = CmdEmdUtil.getArvoreDispositivos(dispositivos);

    const sb = new StringBuilder();

    const cabeca = [...arvoreDispositivos.keys()][0];
    arvoreDispositivos = arvoreDispositivos.get(cabeca);

    const node = new TagNode('p');
    if (abreAspas) {
      node.add('“');
    }
    if (isEmenta(cabeca)) {
      node.addAtributo('class', 'ementa');
    } else {
      node.add(new TagNode('Rotulo').add(cabeca.rotulo));
    }
    if (isAgrupadorNaoArticulacao(cabeca)) {
      node.addAtributo('class', 'agrupador');
      sb.append(node.toString());
      const nodeDenominacao = new TagNode('p').addAtributo('class', 'agrupador').add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(cabeca));
      sb.append(nodeDenominacao.toString());
    } else {
      const texto = CmdEmdUtil.getTextoDoDispositivoOuOmissis(cabeca);
      node.add(isEmenta(cabeca) ? texto.trim() : texto);
      sb.append(node.toString());
    }

    if (arvoreDispositivos.size) {
      this.ultimoProcessado = cabeca;
      this.writeDispositivoTo(sb, arvoreDispositivos);
    }

    this.writeOmissisFinal(sb, cabeca);

    return fechaAspas ? sb.toString().replace(/(<\/p>(?:<\/Alteracao>)?)$/, '”$1') : sb.toString();
  }

  writeDispositivoTo(sb: StringBuilder, arvoreDispositivos: Map<Dispositivo, any>): void {
    const dispositivos = Array.from(arvoreDispositivos.keys());
    dispositivos.sort(DispositivoComparator.compare);

    for (const d of dispositivos) {
      const mapFilhos = arvoreDispositivos.get(d);
      if (isArticulacaoAlteracao(d)) {
        sb.append('<Alteracao>');
        this.emAlteracao = true;
        this.ultimoProcessado = d;
        if (mapFilhos.size) {
          this.writeDispositivoTo(sb, mapFilhos);
        }
        sb.append('</Alteracao>');
        continue;
      }

      if (isCaput(d)) {
        this.ultimoProcessado = d;
        if (mapFilhos.size) {
          this.writeDispositivoTo(sb, mapFilhos);
        }
        continue;
      }

      const dispositivoAnterior = CmdEmdUtil.getDispositivoAnteriorDireto(d);

      // -------------------------------------------
      // Omissões antes

      // Trata caso específico de parágrafo modificado sem caput modificado
      if (isArtigo(this.ultimoProcessado!) && !isCaput(d)) {
        // Omissis entre o caput e o dispositivo
        if (!isCaput(dispositivoAnterior)) {
          sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
        }
      } else if (
        this.ultimoProcessado !== dispositivoAnterior &&
        !(this.ultimoProcessado!.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO && isAscendente(dispositivoAnterior, this.ultimoProcessado!))
      ) {
        sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
      }

      // -------------------------------------------
      // o dispositivo atual
      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL || this.hasFilhosPropostos(mapFilhos)) {
        const dispRotulo = isArtigo(d) ? (d as Artigo).caput! : d;
        const rotulo = this.emAlteracao ? d.rotulo?.replace('“', '') : d.rotulo;
        let tag = new TagNode('p');
        const ehAgrupador = isAgrupadorNaoArticulacao(d);
        if (ehAgrupador) {
          tag.addAtributo('class', 'agrupador');
        }
        if (isDispositivoCabecaAlteracao(d)) {
          tag.add('‘');
        }
        tag.add(new TagNode('Rotulo').add(rotulo));
        if (ehAgrupador) {
          sb.append(tag.toString());
          tag = new TagNode('p').addAtributo('class', 'agrupador');
        }
        tag.add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(dispRotulo));
        if (d.isDispositivoAlteracao && isUltimaAlteracao(d)) {
          tag.add('’');
          const cabecaAlteracao = getDispositivoCabecaAlteracao(d);
          if (cabecaAlteracao.notaAlteracao) {
            tag.add(' (' + cabecaAlteracao.notaAlteracao + ')');
          }
        }
        sb.append(tag.toString());
      } else {
        sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
      }

      this.ultimoProcessado = d;

      // -------------------------------------------
      // varre os filhos do dispositivo atual
      if (mapFilhos.size) {
        this.writeDispositivoTo(sb, mapFilhos);
      }
    }
  }

  private writeOmissisFinal(sb: StringBuilder, cabeca: Dispositivo): void {
    if (cabeca.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO || isAgrupadorNaoArticulacao(cabeca)) {
      return;
    }

    // Busca último nó à direita
    let d = cabeca as Dispositivo;
    while (d.filhos.length) {
      d = d.filhos[d.filhos.length - 1];
    }

    if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && !isDescendenteDeSuprimido(d)) {
      sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
    }
  }

  // private precisaTagOmissaoAntes(final Dispositivo irmaoAnterior, final Dispositivo ultimoProcessado): boolean {
  //     return irmaoAnterior != null
  //            && (!irmaoAnterior.isSituacao(DispositivoDeEmenda.class) && irmaoAnterior != ultimoProcessado
  //                || irmaoAnterior == ultimoProcessado && irmaoAnterior.hasFilhos()
  //                && !irmaoAnterior.hasFilhosPropostos() || ultimoProcessado.hasFilhos()
  //                                                          && !ultimoProcessado.hasFilhosPropostos());
  // }

  private hasFilhosPropostos(map: Map<Dispositivo, any>): boolean {
    if (!map.size) {
      return false;
    }

    let hasPropostos = false;

    for (const [d, mapFilhos] of map.entries()) {
      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        hasPropostos = true;
        break;
      }

      if (!hasPropostos && mapFilhos.size) {
        hasPropostos = this.hasFilhosPropostos(mapFilhos);
        if (hasPropostos) {
          break;
        }
      }
    }

    return hasPropostos;
  }
}
