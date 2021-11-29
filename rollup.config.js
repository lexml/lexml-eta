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
			],
		}),
	],
});

// Configuração rollup usada para atualizar a pasta "prod"
export default [
	configSpa,
]

