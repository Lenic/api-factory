import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/engine.js',
  external: ['@lenic/deferred', 'axios'],
  output: {
    file: 'lib/engine.js',
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
