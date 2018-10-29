import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import babelConfig from './babel.json';

export default {
  input: 'src/index.js',
  external: ['underscore', '@lenic/deferred'],
  output: {
    file: 'lib/index.js',
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
