import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

export const PRIVATE_QUILL_MODULE = '/__lexml/quill.js';
export const PRIVATE_QUILL_RUNTIME = '/__lexml/quill-runtime.js';

export const isQuillUmdModule = id => /[/\\]node_modules[/\\]quill[/\\]dist[/\\]quill\.js$/.test(id);

export const wrapQuillUmdAsEsm = code => `
  const privateQuillModule = { exports: {} };
  const module = privateQuillModule;
  const exports = privateQuillModule.exports;
  ${code}
  const PrivateBundledQuill = privateQuillModule.exports;
  export default PrivateBundledQuill;
`;

export const injectPrivateQuillImport = (code, moduleSpecifier = 'quill/dist/quill') => {
  const defaultImport = /import\s+Quill\s+from\s+['"]quill\/dist\/quill(?:\.js)?['"]/;
  if (defaultImport.test(code)) {
    return code.replace(defaultImport, `import Quill from '${moduleSpecifier}'`);
  }

  if (/^\s*import\s+Quill\s+from\s+['"]/m.test(code)) {
    return code;
  }

  const withoutSideEffectImport = code.replace(/import\s+['"]quill\/dist\/quill(?:\.js)?['"]\s*;?/g, '');
  if (!/\bQuill\b/.test(withoutSideEffectImport)) {
    return code;
  }

  return `import Quill from '${moduleSpecifier}';\n${withoutSideEffectImport}`;
};

export const createPrivateQuillDevPlugin = () => {
  const quillUmdPath = fileURLToPath(new URL('./node_modules/quill/dist/quill.js', import.meta.url));
  const privateQuillRuntime = wrapQuillUmdAsEsm(readFileSync(quillUmdPath, 'utf8'));

  return {
    name: 'private-quill',
    serve(context) {
      if (context.path === PRIVATE_QUILL_MODULE) {
        return {
          type: 'js',
          body: `export { default } from '${PRIVATE_QUILL_RUNTIME}';`,
        };
      }

      if (context.path === PRIVATE_QUILL_RUNTIME) {
        return {
          type: 'js',
          body: privateQuillRuntime,
        };
      }

      return undefined;
    },
    transform(context) {
      if (!context.path.startsWith('/out-tsc/src/') || !context.path.endsWith('.js') || typeof context.body !== 'string') {
        return undefined;
      }

      const transformedBody = injectPrivateQuillImport(context.body, PRIVATE_QUILL_MODULE);
      return transformedBody === context.body ? undefined : { body: transformedBody };
    },
  };
};
