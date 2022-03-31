import { Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { isArtigo, isCaput } from '../model/dispositivo/tipo';
import { StringBuilder } from '../util/string-util';
import { TagNode } from '../util/tag-node';
import { Artigo } from './../model/dispositivo/dispositivo';
import { isAscendente, isDescendenteDeSuprimido } from './../model/lexml/hierarquia/hierarquiaUtil';
import { CmdEmdUtil, HierSimplesDispositivo } from './comando-emenda-util';

export class CitacaoComandoMultipla {
  ultimoProcessado?: Dispositivo;

  public getTexto(dispositivos: Dispositivo[]): string {
    let arvoreDispositivos = CmdEmdUtil.getArvoreDispositivos(dispositivos);

    const sb = new StringBuilder();

    const hArtigo = arvoreDispositivos[0];
    const artigo = hArtigo.dispositivo as Artigo;
    arvoreDispositivos = hArtigo.filhos;

    // eslint-disable-next-line prettier/prettier
    const node = new TagNode('p').add('“').add(new TagNode('Rotulo').add(artigo.rotulo)).add(this.getTextoDoDispositivoOuOmissis(artigo));

    sb.append(node.toString());

    if (arvoreDispositivos.length) {
      this.ultimoProcessado = artigo;
      this.writeDispositivoTo(sb, arvoreDispositivos);
    }

    this.writeOmissisFinal(sb, artigo);

    return sb.toString().replace(/<\/p>$/, '”</p>');
  }

  getTextoDoDispositivoOuOmissis(d: Dispositivo): TagNode | string {
    if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO || d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
      return CmdEmdUtil.trataTextoParaCitacao(d);
    } else if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      return '(Suprimido)';
    } else {
      return new TagNode('Omissis');
    }
  }

  writeDispositivoTo(sb: StringBuilder, arvoreDispositivos: HierSimplesDispositivo[]): void {
    arvoreDispositivos.forEach(h => {
      const d = h.dispositivo;

      if (isCaput(d)) {
        this.ultimoProcessado = d;
        if (h.filhos.length) {
          this.writeDispositivoTo(sb, h.filhos);
        }
        return;
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
      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL || this.hasFilhosPropostos(h.filhos)) {
        const dispRotulo = isArtigo(d) ? (d as Artigo).caput! : d;
        sb.append(new TagNode('p').add(new TagNode('Rotulo').add(d.rotulo)).add(this.getTextoDoDispositivoOuOmissis(dispRotulo)).toString());
      } else {
        sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
      }

      this.ultimoProcessado = d;

      // -------------------------------------------
      // varre os filhos do dispositivo atual
      if (h.filhos.length) {
        this.writeDispositivoTo(sb, h.filhos);
      }
    });
  }

  private writeOmissisFinal(sb: StringBuilder, artigo: Dispositivo): void {
    if (artigo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      return;
    }

    // Busca último nó à direita
    let d = artigo as Dispositivo;
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

  private hasFilhosPropostos(hFilhos: HierSimplesDispositivo[]) {
    if (!hFilhos.length) {
      return false;
    }

    let hasPropostos = false;

    for (const hFilho of hFilhos) {
      const d = hFilho.dispositivo;

      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        hasPropostos = true;
        break;
      }

      if (!hasPropostos && hFilho.filhos.length) {
        hasPropostos = this.hasFilhosPropostos(hFilho.filhos);
        if (hasPropostos) {
          break;
        }
      }
    }

    return hasPropostos;
  }
}
