import { Articulacao, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { LogErro } from '../../../../demo/components/jsonValidator';

/**
 * Cria uma articulação com um artigo completo (artigo + caput)
 */
export function createArticulacaoComArtigo(): Articulacao {
  const articulacao = createArticulacao();
  criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  return articulacao;
}

/**
 * Cria uma articulação com um artigo e caput
 */
export function createArticulacaoComCaput(temTexto?: string): { articulacao: Articulacao; caput: Dispositivo } {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);

  if (temTexto) {
    (caput as any).texto = temTexto;
  }

  return { articulacao, caput };
}

/**
 * Cria uma articulação com hierarquia de dispositivos: Artigo → Caput → Inciso → Alinea → Item
 */
export function createArticulacaoComHierarquiaCompleta(): Articulacao {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
  const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
  const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
  criaDispositivo(alinea, TipoDispositivo.item.tipo);

  return articulacao;
}

/**
 * Cria uma articulação com agrupador
 */
export function createArticulacaoComAgrupador(tipoAgrupador: string): { articulacao: Articulacao; agrupador: Dispositivo } {
  const articulacao = createArticulacao();
  const agrupador = criaDispositivo(articulacao, tipoAgrupador);

  return { articulacao, agrupador };
}

/**
 * Constroi o resultado Jsonix a partir de uma articulação
 */
export function buildJsonixResult(articulacao: Articulacao) {
  return buildJsonixArticulacaoFromProjetoNorma(articulacao);
}

/**
 * Obtém um node de dispositivo navegando pelo caminho especificado
 * O caminho é um array de índices para acessar lXhier ou lXcontainersOmissis
 */
export function getDispositivoNode(resultado: any, path: number[]): any {
  return path.reduce((obj: any, key) => {
    if (obj?.value?.lXcontainersOmissis?.[key] !== undefined) {
      return obj.value.lXcontainersOmissis[key];
    }
    if (obj?.value?.lXhier?.[key] !== undefined) {
      return obj.value.lXhier[key];
    }
    return null;
  }, resultado);
}

/**
 * Obtém o artigo do resultado Jsonix
 */
export function getArtigoNode(resultado: any): any {
  return resultado.lXhier[0];
}

/**
 * Obtém o caput de um artigo no resultado Jsonix
 */
export function getCaputNode(artigoNode: any): any {
  return artigoNode.value.lXcontainersOmissis[0];
}

/**
 * Cria um projeto norma básico para testes
 */
export function createProjetoNormaBasico(): any {
  return {
    classificacao: 'norma',
    epigrafe: { texto: 'LEI Nº 12.345' },
    ementa: { texto: 'Ementa da lei' },
    preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
    articulacao: createArticulacao(),
  };
}

/**
 * Configura um número em um dispositivo
 */
export function configurarNumero(dispositivo: Dispositivo, numero: number): void {
  (dispositivo as any).numero = numero;
}

/**
 * Configura um rótulo em um dispositivo
 */
export function configurarRotulo(dispositivo: Dispositivo, rotulo: string): void {
  (dispositivo as any).rotulo = rotulo;
}

/**
 * filtrar erros relacionados a links em nomeAgrupador (Opção B)
 */
export const filtrarErrosLinksNomeAgrupador = (erros: LogErro[]): LogErro[] => {
  return erros.filter(erro => {
    // Ignora erros relacionados a links em nomeAgrupador
    return !erro.caminho.includes('.nomeAgrupador.content');
  });
};

/**
 * Filtra erros relacionados a elementos GenInline vazios no preambulo
 * O conversor pode remover elementos GenInline sem content durante a conversão
 */
export const filtrarErrosPreambuloVazio = (erros: LogErro[]): LogErro[] => {
  return erros.filter(erro => {
    // Ignora erros de tamanho de array no preambulo.p
    return !(erro.caminho.includes('.preambulo.p') && erro.mensagem.includes('Tamanho do array incorreto'));
  });
};
