import { Alteracoes } from './../model/dispositivo/blocoAlteracao';
import { buildId } from './../model/lexml/util/idUtil';
import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { Emenda } from '../model/lexml/documento/emenda';
import { isArtigo, isCaput, isOmissis } from './../model/dispositivo/tipo';
import { ClassificacaoDocumento } from './../model/documento/classificacao';
import { TEXTO_OMISSIS } from './../model/lexml/conteudo/textoOmissis';
import { DispositivoEmendaAdicionado, DispositivoEmendaModificado, DispositivoEmendaSuprimido } from './../model/lexml/documento/emenda';
import { isArticulacaoAlteracao, isDispositivoRaiz } from './../model/lexml/hierarquia/hierarquiaUtil';
import { ComandoEmendaBuilder } from './comando-emenda-builder';
import { CmdEmdUtil } from './comando-emenda-util';

export class EmendaBuilder {
  constructor(private classificacao: ClassificacaoDocumento.EMENDA | ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER, private urn: string, private articulacao: Articulacao) {}

  getEmenda(): Emenda {
    const emd = new Emenda();

    emd.classificacao = this.classificacao;

    this.preencheDispositivos(emd);

    emd.comandoEmenda = new ComandoEmendaBuilder(this.urn, this.articulacao).getComandoEmenda();

    return emd;
  }

  private preencheDispositivos(emd: Emenda): void {
    const dispositivos = CmdEmdUtil.getDispositivosNaoOriginais(this.articulacao);

    const dispositivosSuprimidos = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
    if (dispositivosSuprimidos.length) {
      for (const d of dispositivosSuprimidos) {
        const ds = new DispositivoEmendaSuprimido();
        ds.id = d.id!;
        ds.rotulo = d.rotulo;
        emd.dispositivosSuprimidos.push(ds);
      }
    }

    const dispositivosModificados = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO);
    if (dispositivosModificados.length) {
      for (const d of dispositivosModificados) {
        const dm = new DispositivoEmendaModificado();
        if (isArtigo(d)) {
          const caput = (d as Artigo).caput!;
          dm.id = caput.id!;
          dm.texto = caput.texto;
        } else {
          dm.id = d.id!;
          dm.texto = d.texto;
        }
        dm.rotulo = d.rotulo;
        emd.dispositivosModificados.push(dm);
      }
    }

    const dispositivosAdicionados = dispositivos.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    if (dispositivosAdicionados.length) {
      for (const d of dispositivosAdicionados) {
        const da = this.criaDispositivoEmendaAdicionado(d);
        emd.dispositivosAdicionados.push(da);
        if (isArtigo(d)) {
          const ca = this.criaDispositivoEmendaAdicionado((d as Artigo).caput!);
          emd.dispositivosAdicionados.push(ca);
        }
      }
    }
  }

  private criaDispositivoEmendaAdicionado(d: Dispositivo): DispositivoEmendaAdicionado {
    const da = new DispositivoEmendaAdicionado();

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
}
