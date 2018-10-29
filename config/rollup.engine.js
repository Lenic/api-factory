import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import babelConfig from './babel.json';

export default {
  input: 'src/engine.js',
  external: ['@lenic/deferred', 'axios'],
  output: {
    file: 'lib/engine.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelrc: false,
      ...babelConfig,
      exclude: 'node_modules/**'
    })
  ]
};
