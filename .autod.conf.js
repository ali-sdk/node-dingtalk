'use strict';

module.exports = {
  write: true,
  prefix: '^',
   test: [
     'test',
     'benchmark',
   ],
  devdep: [
    'egg-ci',
    'egg-bin',
    'autod',
    'eslint',
    'eslint-config-egg',
    'supertest',
    'power-assert',
    'intelli-espower-loader',
    'mocha',
    'thunk-mocha',
  ],
  exclude: [
    './test/fixtures',
  ],
};

