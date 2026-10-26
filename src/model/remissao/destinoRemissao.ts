import { Elemento } from '../elemento';

// A pena não tem texto canônico nem regra de atualização, então não é destino de remissão interna.
const TIPOS_FORA_DOS_DESTINOS = ['Articulacao', 'Ementa', 'Preambulo', 'Pena'];

export const podeSerDestinoDeRemissaoInterna = (elemento: Pick<Elemento, 'tipo'>): boolean => !TIPOS_FORA_DOS_DESTINOS.includes(elemento.tipo ?? '');
