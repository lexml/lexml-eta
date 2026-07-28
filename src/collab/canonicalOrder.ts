import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { percorreHierarquiaDispositivos } from '../model/lexml/hierarquia/hierarquiaUtil';

// Ordem de leitura canônica e plana da articulação (inclui caput e desce em alterações).
// É a mesma travessia usada pela serialização LexML — garante determinismo do seed do Y.Doc.
export const ordemCanonica = (articulacao: Articulacao): Dispositivo[] => {
  const lista: Dispositivo[] = [];
  percorreHierarquiaDispositivos(articulacao, d => lista.push(d));
  return lista;
};
