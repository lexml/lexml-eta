// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

import proxy from 'koa-proxies';
//import httpsProxyAgent from 'https-proxy-agent';

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: true,
  open: '/demo',
  // open: '/prod/index.html',
  watch: !hmr,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  // appIndex: 'demo/index.html',

  /** Confgure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },

  // TODO Não está funcionando na rede do SF por não estar utilizando o proxy da rede no acesso à url externa
  middleware: [
    proxy('/api/', {
      target: 'https://www6ghml.senado.leg.br/',
      rewrite: path => path.replace(/^\/api/, '/editor-emendas/api'),
      logs: true,
      changeOrigin: true
    }),
  ],

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
  ],

  // See documentation for all available options
});
