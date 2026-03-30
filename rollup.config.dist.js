import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

const external = id =>
  id === 'lit' ||
  id.startsWith('lit/') ||
  id === 'lit-html' ||
  id.startsWith('lit-html/') ||
  id === '@shoelace-style/shoelace' ||
  id.startsWith('@shoelace-style/shoelace/');

const configTs = {
	input: 'src/index.ts',
	external,
	output: {
		dir: 'dist',
		sourcemap: true,
	},
	plugins: [
		typescript({tsconfig: 'tsconfig.dist.json'}),
    nodeResolve(),
	],
};

const configTsMin = {
	input: 'src/index.ts',
	external,
	output: {
		file: 'dist/index.min.js',
    sourcemap: true,
	},
	plugins: [
		typescript({tsconfig: 'tsconfig.dist.json'}),
    nodeResolve(),
    terser(),
	],
}

// Configuração rollup usada para atualizar a pasta "dist", que será a raiz da publicação.
export default [
	configTs,
  configTsMin,
]
