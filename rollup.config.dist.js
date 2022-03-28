import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

const configTs = {
	input: 'src/index.ts',
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

