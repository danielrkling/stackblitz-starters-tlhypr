window.config = {
    rollup: {
        input: 'src/app.ts',
        external: ['@rollup/browser', '@babel/standalone','typescript','monaco-editor'],
    },
    outputOptions: {
        format: 'iife',
        globals: {
            '@rollup/browser': 'rollup',
            '@babel/standalone': 'Babel',
            'typescript':'ts',
            'monaco-editor':'monaco'
        }
    },
    outputPath: 'dist/app.js',
    typescript: {}
};