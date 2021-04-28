import { createSpaConfig } from '@open-wc/building-rollup';
import copy from 'rollup-plugin-copy';
import merge from 'deepmerge';

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
        { src: 'assets/editor.min.css', dest: 'dist/assets' },
        { src: 'node_modules/font-awesome/fonts/**', dest: 'dist/fonts' },
      ]
    })
  ]
});
