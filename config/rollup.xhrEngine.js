import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/xhrEngine.js',
  external: ['@lenic/deferred', 'underscore'],
  output: {
    file: 'lib/xhrEngine.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
