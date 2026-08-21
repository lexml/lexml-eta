import { createSpaConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';
import copy from 'rollup-plugin-copy';

const baseConfigSpa = createSpaConfig({
	outputDir: 'prod',
	developmentMode: process.env.ROLLUP_WATCH === 'true',
	injectServiceWorker: false,
});

const configSpa = merge(baseConfigSpa, {
	input: './demo/index.html',
	plugins: [
		copy({
			targets: [
				{ src: 'assets/css/editor.css', dest: 'prod/assets/css' },
				{ src: 'assets/fonts/**', dest: 'prod/assets/fonts' },
				{ src: 'assets/icons/**', dest: 'prod/assets/icons' },
				// Assets do lexml-linker só são referenciados em runtime (new URL(...)), fora do grafo do Rollup.
				// Destino "out-tsc/src/util/lexml-linker/vendor" (não "prod/vendor"!) de propósito — ver
				// comentário em tsconfig.worker-demo.json sobre o caminho sintético que o plugin de asset
				// do @open-wc/building-rollup usa para resolver o Worker.
				{ src: 'src/util/lexml-linker/vendor/lexml-linker.wasm', dest: 'prod/out-tsc/src/util/lexml-linker/vendor' },
				{ src: 'src/util/lexml-linker/vendor/lexml-linker.mjs', dest: 'prod/out-tsc/src/util/lexml-linker/vendor' },
				{ src: 'src/util/lexml-linker/vendor/browser-wasi-shim.mjs', dest: 'prod/out-tsc/src/util/lexml-linker/vendor' },
			],
		}),
	],
});

// Configuração rollup usada para atualizar a pasta "prod"
export default [
	configSpa,
]

