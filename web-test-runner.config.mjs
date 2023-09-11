// import { playwrightLauncher } from '@web/test-runner-playwright';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: [
    // 'out-tsc/test/**/*.test.js',
    // '!out-tsc/test/emenda/**/*.test.js',
    //'out-tsc/test/redux/colar/**/*.test.js',
    //'out-tsc/test/redux/aplicaEmenda/**/*.test.js',
    'out-tsc/test/componente/editor-texto-rico/**/*.test.js',
  ],
  nodeResolve: true,

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
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   playwrightLauncher({ product: 'firefox' }),
  //   playwrightLauncher({ product: 'webkit' }),
  // ],

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
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
});
