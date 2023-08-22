import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/app.ts',
  external: ['@rollup/browser', '@babel/standalone','typescript','monaco-editor'],
  output: {
    dir: 'dist',
    format: 'iife',
    globals: {
      '@rollup/browser': 'rollup',
      '@babel/standalone': 'Babel',
      'typescript':'ts',
      'monaco-editor':'monaco'
  }
  },
  plugins: [typescript()]
};