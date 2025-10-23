// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

/** Use Hot Module replacement by adding --hmr to the start command */

import fs from 'fs';
import path from 'path';

const fileParlamentaresMock = path.resolve(process.cwd(), 'parlamentares.json');
const fileComissoesMock = path.resolve(process.cwd(), 'comissoes.json');

async function mockApiMiddleware(context, next) {
  try {
    let fileContent;
    if (/^\/parlamentares(\?.*)?$/.test(context.url)) {
      fileContent = fs.readFileSync(fileParlamentaresMock, 'utf8');
      context.set('Content-Type', 'application/json');
      context.body = fileContent;
    } else if (/^\/comissoes(\?.*)?$/.test(context.url)) {
      fileContent = fs.readFileSync(fileComissoesMock, 'utf8');
      context.set('Content-Type', 'application/json');
      context.body = fileContent;
    }
  } catch (error) {
    console.error('Erro ao ler teste.json:', error);
    context.status = 500;
    context.body = { error: 'Failed to read mock file' };
  }

  return next();
}

function cacheMiddleware() {
  console.log('Cache middleware enabled');
  return async (context, next) => {
    await next();
    if (context.url.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
      context.response.set('Cache-Control', 'public, max-age=31536000');
    }
  };
}

const hmr = process.argv.includes('--hmr');
const cacheEnabled = process.argv.includes('--cache');

const middlewares = [
  proxy('/api/', {
    target: 'https://www6ghml.senado.leg.br/',
    rewrite: path => path.replace(/^\/api/, '/editor-emendas/api'),
    logs: true,
    changeOrigin: true
  }),
];
cacheEnabled && middlewares.push(cacheMiddleware());

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
  middleware: [mockApiMiddleware, ...middlewares],

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
  ],

  // See documentation for all available options
});
