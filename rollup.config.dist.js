import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { injectPrivateQuillImport, isQuillUmdModule, wrapQuillUmdAsEsm } from './private-quill.mjs';

const isPrivateQuillDependency = id => id === 'quill' || id.startsWith('quill/');

const privateQuillForDistribution = () => ({
  name: 'private-quill-for-distribution',
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

const external = id => {
  if (isPrivateQuillDependency(id)) {
    return false;
  }

  return (
    id === 'lit' || id.startsWith('lit/') || id === 'lit-html' || id.startsWith('lit-html/') || id === '@shoelace-style/shoelace' || id.startsWith('@shoelace-style/shoelace/')
  );
};

const validatePrivateQuillBundle = () => ({
  name: 'validate-private-quill-bundle',
  generateBundle(_options, bundle) {
    for (const artifact of Object.values(bundle)) {
      if (artifact.type !== 'chunk' || !artifact.isEntry) {
        continue;
      }

      const externalQuillImports = artifact.imports.filter(isPrivateQuillDependency);
      if (externalQuillImports.length > 0) {
        this.error(`O bundle externalizou Quill: ${externalQuillImports.join(', ')}`);
      }

      const includesPrivateQuill = Object.keys(artifact.modules).some(isQuillUmdModule);
      if (!includesPrivateQuill) {
        this.error('O bundle não contém sua cópia privada de quill/dist/quill.js.');
      }

      if (/(?:window|globalThis)\s*\.\s*Quill\s*=/.test(artifact.code)) {
        this.error('O bundle está expondo sua cópia privada por window.Quill ou globalThis.Quill.');
      }
    }
  },
});

const configTs = {
  input: 'src/index.ts',
  external,
  output: {
    dir: 'dist',
    sourcemap: true,
  },
  plugins: [typescript({ tsconfig: 'tsconfig.dist.json' }), nodeResolve(), privateQuillForDistribution(), validatePrivateQuillBundle()],
};

const configTsMin = {
  input: 'src/index.ts',
  external,
  output: {
    file: 'dist/index.min.js',
    sourcemap: true,
  },
  plugins: [typescript({ tsconfig: 'tsconfig.dist.json' }), nodeResolve(), privateQuillForDistribution(), terser(), validatePrivateQuillBundle()],
};

// Configuração rollup usada para atualizar a pasta "dist", que será a raiz da publicação.
export default [configTs, configTsMin];
