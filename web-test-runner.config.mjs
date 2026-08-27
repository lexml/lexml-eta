import { playwrightLauncher } from '@web/test-runner-playwright';
import { createPrivateQuillDevPlugin } from './private-quill.mjs';
import { createLexmlLinkerVendorStaticPlugin } from './serve-lexml-linker-vendor.mjs';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: [
    'out-tsc/test/**/*.test.js',

    // O TESTE ABAIXO É MUITO LENTO. É recomendado rodar separadamente.
    '!out-tsc/test/redux/paginacao/reducer-paginacao.test.js',

    // 'out-tsc/test/emenda/**/*.test.js',
    // 'out-tsc/test/redux/colar/**/*.test.js',
    // 'out-tsc/test/redux/aplicaEmenda/**/*.test.js',
    // 'out-tsc/test/componente/editor-texto-rico/**/*.test.js',
  ],
  nodeResolve: true,
  browserStartTimeout: 120000,
  plugins: [createPrivateQuillDevPlugin(), createLexmlLinkerVendorStaticPlugin()],
  coverageConfig: {
    exclude: ['**/__lexml/**'],
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Confgure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },

  /** Amount of browsers to run concurrently */
  // concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  // concurrency: 1,

  /** Browsers to run tests on */
  browsers: [playwrightLauncher({ product: 'chromium' })],
  concurrency: 1,

  testFramework: {
    config: {
      timeout: 120000,
    },
  },

  // See documentation for all available options
  testRunnerHtml: testFramework =>
    `<html>
      <script type="module">
        import { quillSnowStyles } from "../out-tsc/src/assets/css/quill.snow.css.js";
        const css = [quillSnowStyles].map(tr => tr.strings).flat().join("\\n");
        document.head.insertAdjacentHTML("beforeend", css);
      </script>
      <body>
        <script>window.process = { env: { NODE_ENV: "development", testMode: true } }</script>
        <script>
          // Mock global do Quill, definido antes de qualquer import que o use. É uma classe (não objeto) porque EtaQuill/EtaQuillBuffer fazem "class X extends Quill".
          const mockBlot = class {
            static blotName = 'mock-blot';
            static create() { return document.createElement('span'); }
            constructor() { this.domNode = document.createElement('span'); }
            format() {}
            length() { return 0; }
            offset() { return 0; }
          };
          class MockQuill {
            constructor() {
              //empty — testes que precisam de comportamento real stubam a instância diretamente
            }
          }
          MockQuill.sources = { API: 'api', USER: 'user', SILENT: 'silent' };
          MockQuill.import = (path) => {
            if (path === 'blots/inline') return mockBlot;
            if (path === 'delta') return class Delta {
              constructor(ops) { this.ops = ops ? [...ops] : []; }
              retain(length, attrs) {
                if (length > 0) this.ops.push(attrs ? { retain: length, attributes: attrs } : { retain: length });
                return this;
              }
              delete(length) {
                if (length > 0) this.ops.push({ delete: length });
                return this;
              }
              insert(text, attrs) {
                this.ops.push(attrs ? { insert: text, attributes: attrs } : { insert: text });
                return this;
              }
            };
            if (path === 'core/module') return class {};
            if (path === 'parchment') return {
              Scope: { INLINE_ATTRIBUTE: 1 },
              Attributor: { Attribute: class {} },
            };
            return class {};
          };
          MockQuill.register = () => {};
          MockQuill.find = (node) => (node && node['__blot'] ? node['__blot'].blot : null);
          window.Quill = MockQuill;
        </script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
});
