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
  // `\s*` (não `\s+`) antes da aspa: pipelines que minificam antes deste transform rodar (ex.: o
  // babel do build da demo) removem o espaço entre "from" e a aspa — "from'quill/dist/quill'" é
  // JS válido. Exigir `\s+` ali fazia o import existente passar despercebido e duplicava a declaração.
  const defaultImport = /import\s+Quill\s+from\s*['"]quill\/dist\/quill(?:\.js)?['"]/;
  if (defaultImport.test(code)) {
    return code.replace(defaultImport, `import Quill from '${moduleSpecifier}'`);
  }

  // Sem âncora `^...$/m`: pipelines que minificam antes deste transform rodar concatenam as
  // declarações numa única linha (";import{x}from'y';import Quill from'z';..."), então um import
  // já existente nunca começaria uma linha própria. Aceitar início da string ou o que normalmente
  // precede uma declaração (";", "}" de chave anterior, ou espaço) cobre tanto código formatado
  // quanto minificado.
  if (/(?:^|[;}\s])import\s+Quill\s+from\s*['"]/.test(code)) {
    return code;
  }

  const withoutSideEffectImport = code.replace(/import\s*['"]quill\/dist\/quill(?:\.js)?['"]\s*;?/g, '');
  if (!/\bQuill\b/.test(withoutSideEffectImport)) {
    return code;
  }

  return `import Quill from '${moduleSpecifier}';\n${withoutSideEffectImport}`;
};

export const createPrivateQuillRollupPlugin = () => ({
  name: 'private-quill',
  transform(code, id) {
    if (isQuillUmdModule(id)) {
      return {
        code: wrapQuillUmdAsEsm(code),
        map: null,
      };
    }

    const isLibrarySource = /[/\\]src[/\\].+\.[jt]s$/.test(id);
    if (isLibrarySource && /\bQuill\b/.test(code)) {
      return {
        code: injectPrivateQuillImport(code),
        map: null,
      };
    }

    return null;
  },
});

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
