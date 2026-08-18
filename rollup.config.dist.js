import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

const configTs = {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    sourcemap: true,
  },
  plugins: [
    typescript({ tsconfig: 'tsconfig.dist.json' }),
    nodeResolve(),
    // Assets do lexml-linker só são referenciados em runtime (new URL(...)), fora do grafo do Rollup.
    copy({
      targets: [
        { src: 'src/util/lexml-linker/vendor/lexml-linker.wasm', dest: 'dist/vendor' },
        { src: 'src/util/lexml-linker/vendor/lexml-linker.wasm.br', dest: 'dist/vendor' },
        { src: 'src/util/lexml-linker/vendor/lexml-linker.mjs', dest: 'dist/vendor' },
        { src: 'src/util/lexml-linker/vendor/browser-wasi-shim.mjs', dest: 'dist/vendor' },
      ],
    }),
  ],
};

const configTsMin = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.min.js',
    sourcemap: true,
  },
  plugins: [typescript({ tsconfig: 'tsconfig.dist.json' }), nodeResolve(), terser()],
};

// lexml-linker.worker.ts é compilado à parte, via tsc puro (ver tsconfig.worker-dist.json e o
// script build:worker-dist) — @rollup/plugin-typescript trava em OOM ao processar os .mjs
// vendorizados (minificados) importados por ele.

// Configuração rollup usada para atualizar a pasta "dist", que será a raiz da publicação.
export default [configTs, configTsMin];
