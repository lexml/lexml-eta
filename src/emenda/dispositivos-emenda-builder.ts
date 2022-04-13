import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { DispositivoEmendaAdicionado, DispositivoEmendaModificado, DispositivoEmendaSuprimido, DispositivosEmenda, TipoEmenda } from '../model/emenda/emenda';
import { Alteracoes } from '../model/dispositivo/blocoAlteracao';
import { isArticulacao, isArtigo, isCaput, isOmissis } from '../model/dispositivo/tipo';
import { TEXTO_OMISSIS } from '../model/lexml/conteudo/textoOmissis';
import { isArticulacaoAlteracao, isDispositivoRaiz } from '../model/lexml/hierarquia/hierarquiaUtil';
import { buildId } from '../model/lexml/util/idUtil';
import { CmdEmdUtil } from './comando-emenda-util';

export class DispositivosEmendaBuilder {
  constructor(private tipoEmenda: TipoEmenda, private urn: string, private articulacao: Articulacao) {}

  getDispositivosEmenda(): DispositivosEmenda {
    const dispositivos = new DispositivosEmenda();
    this.preencheDispositivos(dispositivos);
    return dispositivos;
  }

  private preencheDispositivos(dispositivosEmenda: DispositivosEmenda): void {
    const dispositivos = CmdEmdUtil.getDispositivosNaoOriginais(this.articulacao);

    const dispositivosSuprimidos = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
    if (dispositivosSuprimidos.length) {
      for (const d of dispositivosSuprimidos) {
        const ds = new DispositivoEmendaSuprimido();
        ds.tipo = this.getTipoDispositivoParaEmenda(d);
        ds.id = d.id!;
        ds.rotulo = d.rotulo;
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
          dm.texto = caput.texto;
        } else {
          dm.tipo = this.getTipoDispositivoParaEmenda(d);
          dm.id = d.id!;
          dm.texto = d.texto;
        }
        dm.rotulo = d.rotulo;
        dispositivosEmenda.dispositivosModificados.push(dm);
      }
    }

    const dispositivosAdicionados = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    if (dispositivosAdicionados.length) {
      for (const d of dispositivosAdicionados) {
        const da = this.criaDispositivoEmendaAdicionado(d);
        dispositivosEmenda.dispositivosAdicionados.push(da);
        if (isArtigo(d)) {
          const ca = this.criaDispositivoEmendaAdicionado((d as Artigo).caput!);
          dispositivosEmenda.dispositivosAdicionados.push(ca);
        }
      }
    }
  }

  private criaDispositivoEmendaAdicionado(d: Dispositivo): DispositivoEmendaAdicionado {
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
      da.texto = d.texto;
    }
    if (isCaput(d) || isArticulacaoAlteracao(d)) {
      da.idPai = d.pai?.id;
    } else {
      const irmaos = CmdEmdUtil.getFilhosEstiloLexML(d.pai!);
      if (d !== irmaos[0]) {
        da.idIrmaoAnterior = irmaos[irmaos.indexOf(d) - 1].id;
      } else if (!isDispositivoRaiz(d.pai!)) {
        da.idPai = d.pai?.id;
      }
    }
    if (isArticulacaoAlteracao(d)) {
      const base = (d as Alteracoes).base;
      if (base) {
        da.urnNormaAlterada = base;
      }
    }
    if (!isOmissis(d) && da.texto && da.texto.indexOf(TEXTO_OMISSIS) >= 0) {
      da.textoOmitido = true;
    }
    if (da.rotulo && da.rotulo.indexOf('“') >= 0) {
      da.abreAspas = true;
    }
    if (da.texto && da.texto.indexOf('” (NR)') >= 0) {
      da.fechaAspas = true;
    }
    return da;
  }

  private getTipoDispositivoParaEmenda(d: Dispositivo): string {
    return isArticulacao(d) ? 'Alteracao' : d.tipo;
  }
}
