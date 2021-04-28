import { createSpaConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';
import copy from 'rollup-plugin-copy';

const baseConfig = createSpaConfig({
  outputDir: 'prod',
  developmentMode: process.env.ROLLUP_WATCH === 'true',

  injectServiceWorker: false,
});

export default merge(baseConfig, {
  input: './demo/index.html',
  plugins: [
    copy({
      targets: [
        { src: 'assets/css/editor.min.css', dest: 'prod/assets/css' },
        { src: 'assets/fonts/**', dest: 'prod/assets/fonts' },
      ],
    }),
  ],
});
