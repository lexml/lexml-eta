import { DocumentoArticulado, lerDocumentoArticulado, NOME_ARQUIVO_DOCUMENTO_ARTICULADO, serializarDocumentoArticulado } from '../model/lexml/documento/documentoArticulado';

interface ArquivoSelecionado {
  getFile(): Promise<File>;
}
interface ArquivoParaSalvar {
  createWritable(): Promise<{ write(blob: Blob): Promise<void>; close(): Promise<void>; abort(): Promise<void> }>;
}
interface SeletoresArquivo {
  showOpenFilePicker?: (options: any) => Promise<ArquivoSelecionado[]>;
  showSaveFilePicker?: (options: any) => Promise<ArquivoParaSalvar>;
}

const tiposArquivo = [{ description: 'Documento articulado', accept: { 'application/json': ['.json'] } }];
const foiCancelado = (erro: unknown): boolean => (erro as Error)?.name === 'AbortError';

export const lerArquivoDocumentoArticulado = async (arquivo: Blob): Promise<DocumentoArticulado> => lerDocumentoArticulado(await arquivo.text());

export const salvarArquivoDocumentoArticulado = async (documento: DocumentoArticulado): Promise<boolean> => {
  const blob = new Blob([serializarDocumentoArticulado(documento)], { type: 'application/json;charset=utf-8' });
  const seletores = window as unknown as SeletoresArquivo;
  try {
    if (seletores.showSaveFilePicker) {
      const arquivo = await seletores.showSaveFilePicker({ suggestedName: NOME_ARQUIVO_DOCUMENTO_ARTICULADO, types: tiposArquivo });
      const escrita = await arquivo.createWritable();
      try {
        await escrita.write(blob);
        await escrita.close();
      } catch (erro) {
        await escrita.abort().catch(() => undefined);
        throw erro;
      }
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = NOME_ARQUIVO_DOCUMENTO_ARTICULADO;
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }
    return true;
  } catch (erro) {
    if (foiCancelado(erro)) return false;
    throw erro;
  }
};

export const abrirArquivoDocumentoArticulado = async (): Promise<DocumentoArticulado | undefined> => {
  const seletores = window as unknown as SeletoresArquivo;
  try {
    if (seletores.showOpenFilePicker) {
      const [arquivo] = await seletores.showOpenFilePicker({ types: tiposArquivo, multiple: false });
      return arquivo ? lerArquivoDocumentoArticulado(await arquivo.getFile()) : undefined;
    }
    const arquivo = await new Promise<File | undefined>(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.hidden = true;
      const concluir = (): void => {
        const selecionado = input.files?.[0];
        input.remove();
        resolve(selecionado);
      };
      input.addEventListener('change', concluir, { once: true });
      input.addEventListener('cancel', concluir, { once: true });
      document.body.appendChild(input);
      input.click();
    });
    return arquivo ? lerArquivoDocumentoArticulado(arquivo) : undefined;
  } catch (erro) {
    if (foiCancelado(erro)) return undefined;
    throw erro;
  }
};
