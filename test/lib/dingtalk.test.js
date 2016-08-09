'use strict';

const assert = require('power-assert');

const DingTalk = require('../lib/dingtalk');
const options = require('./fixtures/test.config.json');

describe('test/dingtalk.test.js', () => {
  let dingtalk;
  before(function* () {
    dingtalk = new DingTalk(options);
  });

  it('dingtalk', function* () {
    assert(dingtalk.user);
    assert(dingtalk.department);
    assert(dingtalk.message);
  });
});
