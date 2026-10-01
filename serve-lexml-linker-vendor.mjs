import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// browser-wasi-shim.mjs e lexml-linker.mjs usam private class fields nativos (ex.: "#kv = new Map()"),
// suportados nativamente por qualquer browser moderno. O pipeline de nodeResolve/rollup do
// @web/dev-server, ao servir esses .mjs, os re-transpila para um downlevel com helpers do tslib
// (__classPrivateFieldGet/Set) — e essa transpilação quebra a ordem super()/this em classes que
// estendem outras classes (ex.: WASI extends fd_close_impl), lançando em runtime "Must call super
// constructor in derived class before accessing 'this'". Servir o conteúdo original como passthrough
// estático evita esse pipeline por completo, igual ao que createPrivateQuillDevPlugin já faz para o
// bundle UMD do Quill.
const VENDOR_FILES = ['src/util/lexml-linker/vendor/browser-wasi-shim.mjs', 'src/util/lexml-linker/vendor/lexml-linker.mjs'];

export const createLexmlLinkerVendorStaticPlugin = () => {
  const contents = new Map(VENDOR_FILES.map(relPath => [relPath, readFileSync(fileURLToPath(new URL(`./${relPath}`, import.meta.url)), 'utf8')]));

  return {
    name: 'lexml-linker-vendor-static',
    serve(context) {
      const match = VENDOR_FILES.find(relPath => context.path.endsWith(`/${relPath}`));
      if (!match) return undefined;

      return { type: 'js', body: contents.get(match) };
    },
  };
};
