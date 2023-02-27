import { isArticulacaoAlteracao, getDispositivoCabecaAlteracao } from './../model/lexml/hierarquia/hierarquiaUtil';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { isArtigo, isCaput } from '../model/dispositivo/tipo';
import { StringBuilder } from '../util/string-util';
import { TagNode } from '../util/tag-node';
import { isOmissis, isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivoComparator } from './dispositivo-comparator';

export class CitacaoComandoMultiplaAlteracaoNormaVigente {
  private ultimoProcessado: Dispositivo | undefined = undefined;

  private adjacentesOmissis: Dispositivo[] = []; // Dispositivos da lista que são adjacentes às omissis modificadas

  private fecharAspasAposOmissis = false;

  public getTexto(dispositivos: Dispositivo[]): string {
    dispositivos = dispositivos.filter(d => d.pai!.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO || isAgrupadorNaoArticulacao(d.pai!));
    this.adjacentesOmissis = this.buscaDispositivosAdjacentesAsOmissis(dispositivos);
    dispositivos.push(...this.adjacentesOmissis);
    dispositivos.sort(DispositivoComparator.compare);

    const arvoreDispositivos = CmdEmdUtil.getArvoreDispositivosDeAlteracaoDeNorma(dispositivos);

    const sb = new StringBuilder();
    this.montaCitacaoComando(sb, arvoreDispositivos);

    const fechaAspas = this.fecharAspasAposOmissis || CmdEmdUtil.isFechaAspas(this.ultimoProcessado!);
    if (fechaAspas) {
      const primeiro = [...arvoreDispositivos.keys()][0];
      const cabeca = getDispositivoCabecaAlteracao(primeiro);
      const notaAlteracao = cabeca.notaAlteracao ? ' (' + cabeca.notaAlteracao + ')' : '';
      return sb.toString().replace(/(<\/p>)$/, '”' + notaAlteracao + '$1');
    }
    return sb.toString();
  }

  private buscaDispositivosAdjacentesAsOmissis(dispositivos: Dispositivo[]): Dispositivo[] {
    const ret = new Array<Dispositivo>();

    for (const d of dispositivos) {
      if (isOmissis(d)) {
        // TODO - Verificar necessidade de tratamento de bloco de alteração com omissis como primeiro elemento.
        //    if (!d.isAbreAspas()) {
        const anterior = CmdEmdUtil.getDispositivoAnteriorDireto(d);
        if (!dispositivos.includes(anterior)) {
          ret.push(anterior);
        }
        //    }
        if (!CmdEmdUtil.isFechaAspas(d)) {
          const posterior = CmdEmdUtil.getDispositivoPosteriorDireto(d);
          if (posterior && !dispositivos.includes(posterior)) {
            ret.push(posterior);
          }
        }
      }
    }

    return ret;
  }

  private montaCitacaoComando(sb: StringBuilder, arvoreDispositivos: Map<Dispositivo, any>): void {
    const cabeca = [...arvoreDispositivos.keys()][0];
    arvoreDispositivos = arvoreDispositivos.get(cabeca);

    const node = new TagNode('p');
    if (isArticulacaoAlteracao(cabeca.pai!)) {
      node.add('“');
    }
    node.add(new TagNode('Rotulo').add(cabeca.rotulo!));
    if (isAgrupadorNaoArticulacao(cabeca)) {
      node.addAtributo('class', 'agrupador');
      if (cabeca.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
        node.add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(cabeca));
        sb.append(node.toString());
      } else {
        sb.append(node.toString());
        const nodeDenominacao = new TagNode('p').addAtributo('class', 'agrupador').add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(cabeca));
        sb.append(nodeDenominacao.toString());
      }
    } else {
      node.add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(cabeca, true));
      sb.append(node.toString());
    }

    this.ultimoProcessado = cabeca;
    if (arvoreDispositivos.size > 0 && cabeca.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      this.writeDispositivoTo(sb, arvoreDispositivos);
    }

    if (!isAgrupadorNaoArticulacao(cabeca)) {
      this.writeOmissisFinal(sb, cabeca);
    }
  }

  private writeDispositivoTo(sb: StringBuilder, arvoreDispositivos: Map<Dispositivo, any>): void {
    const filhos = [...arvoreDispositivos.keys()];
    filhos.sort(DispositivoComparator.compare);

    for (const d of filhos) {
      const arvoreAtual = arvoreDispositivos.get(d) as Map<Dispositivo, any>;

      const dispositivoAnterior = CmdEmdUtil.getDispositivoAnteriorDireto(d);

      // -------------------------------------------
      // Omissões antes

      // Trata caso específico de primeiro parágrafo
      if (isArtigo(this.ultimoProcessado as Dispositivo) && !isCaput(d)) {
        // Omissis entre o caput e o dispositivo
        if (!isCaput(dispositivoAnterior) && !isOmissis(d)) {
          sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
        }
      } else if (this.ultimoProcessado !== dispositivoAnterior && !isOmissis(d) && dispositivoAnterior.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
        sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
      }

      // -------------------------------------------
      // o dispositivo atual
      if (!isCaput(d)) {
        if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
          const node = new TagNode('p').add(new TagNode('Rotulo').add(d.rotulo)).add(CmdEmdUtil.getTextoDoDispositivoOuOmissis(d, true));
          sb.append(node.toString());
        } else if (this.hasFilhosPropostos(arvoreAtual) || this.adjacentesOmissis.includes(d)) {
          const tag = new TagNode('p');
          tag.add(new TagNode('Rotulo').add(d.rotulo));
          tag.add(new TagNode('Omissis'));
          sb.append(tag.toString());
        } else {
          sb.append(new TagNode('Omissis').toString());
        }
      }

      this.ultimoProcessado = d;

      // -------------------------------------------
      // varre os filhos do dispositivo atual
      if (arvoreAtual && arvoreAtual.size > 0) {
        this.writeDispositivoTo(sb, arvoreAtual);
      }
    }
  }

  private writeOmissisFinal(sb: StringBuilder, artigo: Dispositivo): void {
    if (artigo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      return;
    }

    // Busca último nó à direita
    let d = artigo;
    let filhos = CmdEmdUtil.getFilhosEstiloLexML(d);
    while (filhos.length) {
      d = filhos[filhos.length - 1];
      filhos = CmdEmdUtil.getFilhosEstiloLexML(d);
    }
    if (isCaput(d)) {
      d = d.pai!;
    }

    if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && (!this.adjacentesOmissis.includes(d) || isOmissis(d))) {
      sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
      this.fecharAspasAposOmissis = true;
    } else if (!CmdEmdUtil.isFechaAspas(d)) {
      const proximo = CmdEmdUtil.getDispositivoPosteriorDireto(d);
      if (proximo && isOmissis(proximo)) {
        sb.append(new TagNode('p').add(new TagNode('Omissis')).toString());
        this.fecharAspasAposOmissis = true;
      }
    }
  }

  private hasFilhosPropostos(arvoreDispositivos: Map<Dispositivo, any>): boolean {
    if (!arvoreDispositivos || !arvoreDispositivos.size) {
      return false;
    }

    const arvore = arvoreDispositivos;
    let hasPropostos = false;

    for (const [d, value] of arvore.entries()) {
      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        hasPropostos = true;
        break;
      }

      if (!hasPropostos && value) {
        hasPropostos = this.hasFilhosPropostos(value as Map<Dispositivo, any>);
      }
    }
    return hasPropostos;
  }
}
