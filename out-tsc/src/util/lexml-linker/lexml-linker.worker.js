import makeJsffiImports from './vendor/lexml-linker.mjs';
import { ConsoleStdout, Directory, File, OpenFile, PreopenDirectory, WASI } from './vendor/browser-wasi-shim.mjs';
let wasmExportsPromise = null;
/** Contrato de instanciação confirmado por teste real contra o WASM (ver docs/referencia/LEXML_LINKER_WASM.md). */
function inicializarWasm() {
    if (!wasmExportsPromise) {
        wasmExportsPromise = (async () => {
            const wasi = new WASI([], [], [
                new OpenFile(new File(new Uint8Array(), { readonly: true })),
                ConsoleStdout.lineBuffered((msg) => console.log('[lexml-linker]', msg)),
                ConsoleStdout.lineBuffered((msg) => console.error('[lexml-linker]', msg)),
                new PreopenDirectory('/', [['tmp', new Directory([])]]),
            ], { debug: false });
            const wasmUrl = new URL('./vendor/lexml-linker.wasm', import.meta.url);
            const wasmBytes = await fetch(wasmUrl.href).then(resposta => resposta.arrayBuffer());
            const wasmExports = {};
            const { instance } = await WebAssembly.instantiate(wasmBytes, {
                ghc_wasm_jsffi: makeJsffiImports(wasmExports),
                wasi_snapshot_preview1: wasi.wasiImport,
            });
            Object.assign(wasmExports, instance.exports);
            wasi.initialize(instance);
            return wasmExports;
        })();
    }
    return wasmExportsPromise;
}
self.onmessage = async (evento) => {
    const { id, request } = evento.data;
    try {
        const wasmExports = await inicializarWasm();
        const respostaJson = await wasmExports.lexml_link(JSON.stringify(request));
        const resposta = JSON.parse(respostaJson);
        postMessage({ id, resposta });
    }
    catch (erro) {
        postMessage({ id, erro: erro instanceof Error ? erro.message : String(erro) });
    }
};
//# sourceMappingURL=lexml-linker.worker.js.map