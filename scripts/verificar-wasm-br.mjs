import { readFileSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';

const WASM_PATH = 'src/util/lexml-linker/vendor/lexml-linker.wasm';
const BR_PATH = `${WASM_PATH}.br`;

const wasm = readFileSync(WASM_PATH);
const br = readFileSync(BR_PATH);
const descomprimido = brotliDecompressSync(br);

if (!wasm.equals(descomprimido)) {
  console.error(`ERRO: ${BR_PATH} está desatualizado em relação a ${WASM_PATH}.`);
  console.error('Rode "npm run generate:wasm-br" e commite o ".wasm.br" resultante junto com o rebuild do ".wasm".');
  process.exit(1);
}

console.log(`OK: ${BR_PATH} consistente com ${WASM_PATH}.`);
