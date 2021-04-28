import { createSpaConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';

const baseConfig = createSpaConfig({
  outputDir: 'prod',
  developmentMode: process.env.ROLLUP_WATCH === 'true',

  injectServiceWorker: false,
});

export default merge(baseConfig, {
  input: './demo/index.html',
});
