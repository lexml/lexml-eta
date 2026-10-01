import { readFileSync, writeFileSync } from 'node:fs';
import { brotliCompressSync, constants } from 'node:zlib';

const WASM_PATH = 'src/util/lexml-linker/vendor/lexml-linker.wasm';
const BR_PATH = `${WASM_PATH}.br`;

const wasm = readFileSync(WASM_PATH);
const comprimido = brotliCompressSync(wasm, {
  params: {
    [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
    [constants.BROTLI_PARAM_SIZE_HINT]: wasm.length,
  },
});
writeFileSync(BR_PATH, comprimido);

const reducao = (100 - (comprimido.length / wasm.length) * 100).toFixed(1);
console.log(`gerado ${BR_PATH}: ${wasm.length} -> ${comprimido.length} bytes (-${reducao}%)`);
