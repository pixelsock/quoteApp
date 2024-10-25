import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import alias from '@rollup/plugin-alias';
import serve from 'rollup-plugin-serve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'MyApp',
    globals: {
      'process/browser': 'process',
      'buffer': 'Buffer',
      'stream': 'stream',
      'path': 'path',
      'crypto': 'crypto',
      'os': 'os',
      'fs': 'fs',
      'http': 'http',
      'https': 'https',
      'url': 'url',
      'zlib': 'zlib'
    },
    inlineDynamicImports: true,
  },
  plugins: [
    alias({
      entries: [
        { find: 'jspdf', replacement: 'jspdf/dist/jspdf.umd.js' },
        { find: 'node-fetch', replacement: './fetch-shim.js' }
      ]
    }),
    resolve({
      preferBuiltins: true,
      browser: true,
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    json(),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
    builtins(),
    globals(),
    replace({
      preventAssignment: true,
      'process.env.DROPBOX_ACCESS_TOKEN': JSON.stringify(process.env.DROPBOX_ACCESS_TOKEN || ''),
      'process.env.CLIENT_ID': JSON.stringify(process.env.CLIENT_ID || ''),
      'process.env.CLIENT_SECRET': JSON.stringify(process.env.CLIENT_SECRET || ''),
      'process.env.REFRESH_TOKEN': JSON.stringify(process.env.REFRESH_TOKEN || '')
    }),
    terser(),
    serve({
      open: true,
      contentBase: ['dist'],
      port: 3030,
    }),
  ],
  preserveEntrySignatures: false,
};
