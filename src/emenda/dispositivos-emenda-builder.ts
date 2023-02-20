import { isAgrupadorNaoArticulacao } from './../model/dispositivo/tipo';
import {
  isDispositivoCabecaAlteracao,
  isUltimaAlteracao,
  getDispositivoCabecaAlteracao,
  getDispositivoAnteriorDireto,
  getArtigo,
  isDispositivoAlteracao,
  getArticulacao,
} from './../model/lexml/hierarquia/hierarquiaUtil';
import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { isArticulacao, isArtigo, isCaput, isOmissis } from '../model/dispositivo/tipo';
import {
  DispositivoEmenda,
  DispositivoEmendaAdicionado,
  DispositivoEmendaModificado,
  DispositivoEmendaSuprimido,
  DispositivosEmenda,
  ModoEdicaoEmenda,
} from '../model/emenda/emenda';
import { TEXTO_OMISSIS } from '../model/lexml/conteudo/textoOmissis';
import { isArticulacaoAlteracao, isDispositivoRaiz } from '../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { buildId } from '../model/lexml/util/idUtil';
import { CmdEmdUtil } from './comando-emenda-util';
import { Alteracoes } from '../model/dispositivo/blocoAlteracao';

export class DispositivosEmendaBuilder {
  constructor(private tipoEmenda: ModoEdicaoEmenda, private urn: string, private articulacao: Articulacao) {}

  getDispositivosEmenda(): DispositivosEmenda {
    const dispositivos = new DispositivosEmenda();
    this.preencheDispositivos(dispositivos);
    return dispositivos;
  }

  private preencheDispositivos(dispositivosEmenda: DispositivosEmenda): void {
    const dispositivos = CmdEmdUtil.getDispositivosNaoOriginais(this.articulacao);

    const dispositivosSuprimidos = dispositivos.filter(
      d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO && d.pai!.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO
    );
    if (dispositivosSuprimidos.length) {
      for (const d of dispositivosSuprimidos) {
        const ds = new DispositivoEmendaSuprimido();
        ds.tipo = this.getTipoDispositivoParaEmenda(d);
        ds.id = d.id!;
        ds.rotulo = d.rotulo;
        addUrnNormaAlteradaSeNecessario(d, ds);
        dispositivosEmenda.dispositivosSuprimidos.push(ds);
      }
    }

    const dispositivosModificados = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO);
    if (dispositivosModificados.length) {
      for (const d of dispositivosModificados) {
        const dm = new DispositivoEmendaModificado();
        if (isArtigo(d)) {
          const caput = (d as Artigo).caput!;
          dm.tipo = this.getTipoDispositivoParaEmenda(caput);
          dm.id = caput.id!;
          dm.texto = this.trataTexto(caput.texto);
        } else {
          dm.tipo = this.getTipoDispositivoParaEmenda(d);
          dm.id = d.id!;
          dm.texto = this.trataTexto(d.texto);
        }
        dm.rotulo = d.rotulo;
        if (d.isDispositivoAlteracao) {
          this.preencheAtributosAlteracao(d, dm);
        }
        addUrnNormaAlteradaSeNecessario(d, dm);
        dispositivosEmenda.dispositivosModificados.push(dm);
      }
    }

    const dispositivosAdicionados = this.separaAgrupadores(
      dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO && !this.isDispositivoFilhoDeAdicionado(d))
    );
    if (dispositivosAdicionados.length) {
      for (const d of dispositivosAdicionados) {
        const da = this.criaDispositivoEmendaAdicionado(d);
        addUrnNormaAlteradaSeNecessario(d, da);
        dispositivosEmenda.dispositivosAdicionados.push(da);
      }
    }
  }

  private separaAgrupadores(disps: Dispositivo[]): Dispositivo[] {
    const fSeparacao = (d: Dispositivo): Dispositivo[] => {
      if (d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        return [];
      }
      if (isAgrupadorNaoArticulacao(d)) {
        return [d, ...d.filhos.flatMap(f => fSeparacao(f))];
      }
      return [d];
    };

    return disps.flatMap(d => fSeparacao(d));
  }

  private isDispositivoFilhoDeAdicionado(d: Dispositivo): boolean {
    return !!(
      d.pai!.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO ||
      (isCaput(d.pai!) && d.pai!.pai!.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) ||
      (d.isDispositivoAlteracao && isArtigo(d) && d.pai!.pai!.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO)
    );
  }

  private criaDispositivoEmendaAdicionado(d: Dispositivo, posicionar = true): DispositivoEmendaAdicionado {
    const da = new DispositivoEmendaAdicionado();

    da.tipo = this.getTipoDispositivoParaEmenda(d);

    if (!d.id) {
      d.id = buildId(d);
    }
    da.id = d.id;

    if (!isCaput(d) && !isArticulacaoAlteracao(d) && !isOmissis(d)) {
      da.rotulo = d.rotulo;
    }
    if (!isArtigo(d) && !isArticulacaoAlteracao(d)) {
      da.texto = this.trataTexto(d.texto);
    }

    if (posicionar) {
      if (isCaput(d) || isArticulacaoAlteracao(d)) {
        da.idPai = d.pai?.id;
      } else if (isAgrupadorNaoArticulacao(d)) {
        da.idPosicaoAgrupador = this.calculaPosicaoAgrupador(d);
      } else {
        const irmaos = CmdEmdUtil.getFilhosEstiloLexML(d.pai!);
        if (d !== irmaos[0]) {
          da.idIrmaoAnterior = irmaos[irmaos.indexOf(d) - 1].id;
        } else if (!isDispositivoRaiz(d.pai!)) {
          da.idPai = d.pai?.id;
        }
      }
    }

    if (isArticulacaoAlteracao(d)) {
      const base = (d as Alteracoes).base;
      if (base) {
        da.urnNormaAlterada = base;
      }
    } else if (d.isDispositivoAlteracao) {
      da.existeNaNormaAlterada = (d.situacao as DispositivoAdicionado)?.existeNaNormaAlterada;
      this.preencheAtributosAlteracao(d, da);
    }

    if (!isAgrupadorNaoArticulacao(d)) {
      // Adiciona filhos
      const filhos = CmdEmdUtil.getFilhosEstiloLexML(d);
      // TODO - As alterações deveriam estar listadas nos getFilhosEstiloLexML (tem que rever todo o código que usa esse método)
      if (isCaput(d) && d.pai!.alteracoes) {
        filhos.push(d.pai!.alteracoes);
      }
      if (filhos.length) {
        da.filhos = [];
        filhos.forEach(f => {
          // Pode ocorrer do filho nao ser um dispositivo adicionado no caso de filho de agrupador de artigo.
          if (isCaput(f) || isArticulacaoAlteracao(f) || f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
            da.filhos!.push(this.criaDispositivoEmendaAdicionado(f, false));
          }
        });
      }
    }

    return da;
  }

  private calculaPosicaoAgrupador(d: Dispositivo): string | undefined {
    const dPos = getDispositivoAnteriorDireto(d);
    if (!dPos || isDispositivoRaiz(dPos)) {
      return undefined;
    }
    if (isAgrupadorNaoArticulacao(dPos) || isArtigo(dPos)) {
      return dPos.id;
    }
    return getArtigo(dPos).id;
  }

  private getTipoDispositivoParaEmenda(d: Dispositivo): string {
    return isArticulacao(d) ? 'Alteracao' : d.tipo;
  }

  private preencheAtributosAlteracao(d: Dispositivo, dm: DispositivoEmendaModificado): void {
    if (!isOmissis(d) && dm.texto && dm.texto.indexOf(TEXTO_OMISSIS) >= 0) {
      dm.textoOmitido = true;
    }
    if (isDispositivoCabecaAlteracao(d)) {
      dm.abreAspas = true;
    }
    if (isUltimaAlteracao(d)) {
      dm.fechaAspas = true;
      const cabecaAlteracao = getDispositivoCabecaAlteracao(d);
      dm.notaAlteracao = cabecaAlteracao.notaAlteracao as any;
    }
  }

  private trataTexto(str: string): string {
    if (str.indexOf(TEXTO_OMISSIS) >= 0) {
      return TEXTO_OMISSIS;
    }
    return str.trim();
  }
}

const addUrnNormaAlteradaSeNecessario = (d: Dispositivo, de: DispositivoEmenda): void => {
  if (isDispositivoAlteracao(d)) {
    const base = getArticulacao(d)?.pai?.alteracoes?.base;
    if (base) {
      de.urnNormaAlterada = base;
    }
  }
};
