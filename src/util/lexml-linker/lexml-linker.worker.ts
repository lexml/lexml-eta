import makeJsffiImports from './vendor/lexml-linker.mjs';
import { ConsoleStdout, Directory, File, OpenFile, PreopenDirectory, WASI } from './vendor/browser-wasi-shim.mjs';
import { LexmlLinkResponse, MensagemRequisicaoWorker, MensagemRespostaWorker } from './lexmlLinker.types';

interface WasmExports {
  lexml_link(requestJson: string): Promise<string>;
}

let wasmExportsPromise: Promise<WasmExports> | null = null;

/** Contrato de instanciação confirmado por teste real contra o WASM (ver docs/referencia/LEXML_LINKER_WASM.md). */
function inicializarWasm(): Promise<WasmExports> {
  if (!wasmExportsPromise) {
    wasmExportsPromise = (async (): Promise<WasmExports> => {
      const wasi = new WASI(
        [],
        [],
        [
          new OpenFile(new File(new Uint8Array(), { readonly: true })),
          ConsoleStdout.lineBuffered((msg: string) => console.log('[lexml-linker]', msg)),
          ConsoleStdout.lineBuffered((msg: string) => console.error('[lexml-linker]', msg)),
          new PreopenDirectory('/', [['tmp', new Directory([])]]),
        ],
        { debug: false }
      );

      const wasmUrl = new URL('./vendor/lexml-linker.wasm', import.meta.url);
      const wasmBytes = await fetch(wasmUrl.href).then(resposta => resposta.arrayBuffer());
      const wasmExports: Partial<WasmExports> & Record<string, unknown> = {};
      const { instance } = await WebAssembly.instantiate(wasmBytes, {
        ghc_wasm_jsffi: makeJsffiImports(wasmExports),
        wasi_snapshot_preview1: wasi.wasiImport,
      });
      Object.assign(wasmExports, instance.exports);
      wasi.initialize(instance);
      return wasmExports as WasmExports;
    })();
  }
  return wasmExportsPromise;
}

self.onmessage = async (evento: MessageEvent<MensagemRequisicaoWorker>): Promise<void> => {
  const { id, request } = evento.data;
  try {
    const wasmExports = await inicializarWasm();
    const respostaJson = await wasmExports.lexml_link(JSON.stringify(request));
    const resposta = JSON.parse(respostaJson) as LexmlLinkResponse;
    postMessage({ id, resposta } as MensagemRespostaWorker);
  } catch (erro) {
    postMessage({ id, erro: erro instanceof Error ? erro.message : String(erro) } as MensagemRespostaWorker);
  }
};
